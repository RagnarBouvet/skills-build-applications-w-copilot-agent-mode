import { Activity, Team, User, Workout } from '../models/index.js';

type ActivityInput = {
  userId: string;
  teamId: string;
  type: string;
  minutes: number;
};

type TeamInput = {
  name: string;
  mascot: string;
  members: string[];
};

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
}

function parseActivityInput(input: unknown): ActivityInput {
  if (!isRecord(input)
    || !isObjectId(input.userId)
    || !isObjectId(input.teamId)
    || typeof input.type !== 'string'
    || input.type.trim().length === 0
    || typeof input.minutes !== 'number'
    || !Number.isFinite(input.minutes)
    || input.minutes <= 0) {
    throw httpError(400, 'A valid userId, teamId, activity type, and positive minutes value are required');
  }
  return {
    userId: input.userId,
    teamId: input.teamId,
    type: input.type.trim(),
    minutes: input.minutes,
  };
}

function parseTeamInput(input: unknown): TeamInput {
  if (!isRecord(input)
    || typeof input.name !== 'string'
    || input.name.trim().length === 0
    || typeof input.mascot !== 'string'
    || input.mascot.trim().length === 0
    || (input.members !== undefined && !Array.isArray(input.members))) {
    throw httpError(400, 'A team name, mascot, and optional member ID array are required');
  }

  const memberIds = input.members ?? [];
  if (!memberIds.every(isObjectId)) {
    throw httpError(400, 'Every team member must have a valid ID');
  }
  return {
    name: input.name.trim(),
    mascot: input.mascot.trim(),
    members: [...new Set(memberIds)],
  };
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const { userId, teamId, type, minutes } = parseActivityInput(input);
  const [user, team] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!user || !team) throw httpError(404, 'The specified user or team does not exist');

  return Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const { name, mascot, members } = parseTeamInput(input);
  const memberCount = await User.countDocuments({ _id: { $in: members } });
  if (memberCount !== members.length) throw httpError(404, 'One or more team members do not exist');
  return Team.create({ name, mascot, members });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: string; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

function focusForActivity(type: string) {
  const normalizedType = type.toLowerCase();
  if (['run', 'cycle', 'walk', 'swim'].includes(normalizedType)) return 'endurance';
  return normalizedType;
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw httpError(404, 'No user was found for that email address');

  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean();
  const goal = user.fitnessGoal.toLowerCase();
  const goalWorkouts = await Workout.find({ focus: goal }).lean();
  const activityFocus = recentActivities[0] ? focusForActivity(recentActivities[0].type) : undefined;
  const focus = goalWorkouts.length > 0 ? goal : activityFocus ?? goal;
  const workouts = goalWorkouts.length > 0 ? goalWorkouts : await Workout.find({ focus }).lean();
  const recentActivity = recentActivities.find((activity) => focusForActivity(activity.type) === focus);
  const reason = recentActivity
    ? `Based on your recent ${recentActivity.type} activity and ${focus} goal.`
    : `Matches your ${focus} fitness goal.`;
  return workouts.map((workout) => ({ ...workout, reason }));
}

export { User };
