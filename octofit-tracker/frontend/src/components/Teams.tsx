import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type TeamsData = {
  teams: { name: string; mascot?: string; members?: unknown[] }[];
};

function loadTeams() {
  return getJson<TeamsData>('/api/teams');
}

export default function Teams() {
  return (
    <CapabilityCard<TeamsData>
      title="Teams"
      description="Manage teams and members."
      load={loadTeams}
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
