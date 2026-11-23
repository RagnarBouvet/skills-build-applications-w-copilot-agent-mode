import { CapabilityCard } from './CapabilityCard.js';

type TeamsData = {
  teams: { name: string; mascot?: string; members?: unknown[] }[];
};

export default function Teams() {
  return (
    <CapabilityCard<TeamsData>
      title="Teams"
      description="Manage teams and members."
      endpoint="/api/teams"
      emptyMessage="No teams yet."
      isEmpty={(data) => data.teams.length === 0}
      renderData={(data) => (
        <ul className="list-group">
          {data.teams.map((team) => (
            <li className="list-group-item" key={team.name}>
              <strong>{team.name}</strong>
              {team.mascot && <span> · Mascot: {team.mascot}</span>}
              {team.members && <span> · {team.members.length} members</span>}
            </li>
          ))}
        </ul>
      )}
    />
  );
}
