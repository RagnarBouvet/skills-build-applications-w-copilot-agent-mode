import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardData = {
  leaderboard: { teamName: string; totalPoints: number; rank: number }[];
};

export default function Leaderboard() {
  return (
    <CapabilityCard<LeaderboardData>
      title="Leaderboard"
      description="Compare team point totals."
      endpoint="/api/leaderboard"
      emptyMessage="No leaderboard rankings yet."
      isEmpty={(data) => data.leaderboard.length === 0}
      renderData={(data) => (
        <ol className="list-group list-group-numbered">
          {data.leaderboard.map((entry) => (
            <li className="list-group-item" key={entry.teamName}>
              <strong>{entry.teamName}</strong> · {entry.totalPoints} points (rank {entry.rank})
            </li>
          ))}
        </ol>
      )}
    />
  );
}
