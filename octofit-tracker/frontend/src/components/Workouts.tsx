import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutsData = {
  suggestions: { title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string }[];
};

function loadWorkouts() {
  return getJson<WorkoutsData>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`);
}

export default function Workouts() {
  return (
    <CapabilityCard<WorkoutsData>
      title="Workout suggestions"
      description="Recommended for Mona (mona@example.com) based on her fitness goal and recent activity."
      load={loadWorkouts}
      emptyMessage="No workout suggestions are available."
      isEmpty={(data) => data.suggestions.length === 0}
      renderData={(data) => (
        <ul className="list-group">
          {data.suggestions.map((workout) => (
            <li className="list-group-item" key={workout.title}>
              <strong>{workout.title}</strong>
              {workout.focus && <span> · {workout.focus}</span>}
              {workout.minutes !== undefined && <span> · {workout.minutes} minutes</span>}
              {workout.difficulty && <span> · {workout.difficulty}</span>}
              {workout.reason && <p className="mb-0">{workout.reason}</p>}
            </li>
          ))}
        </ul>
      )}
    />
  );
}
