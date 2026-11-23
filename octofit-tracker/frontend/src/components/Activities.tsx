import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type ActivitiesData = {
  activities: { type: string; minutes: number; points: number }[];
};

function loadActivities() {
  return getJson<ActivitiesData>('/api/activities');
}

export default function Activities() {
  return (
    <CapabilityCard<ActivitiesData>
      title="Activities"
      description="Track student activity minutes and points."
      load={loadActivities}
      emptyMessage="No activities yet."
      isEmpty={(data) => data.activities.length === 0}
      renderData={(data) => (
        <ul className="list-group">
          {data.activities.map((activity, index) => (
            <li className="list-group-item" key={`${activity.type}-${index}`}>
              {activity.type} · {activity.minutes} minutes · {activity.points} points
            </li>
          ))}
        </ul>
      )}
    />
  );
}
