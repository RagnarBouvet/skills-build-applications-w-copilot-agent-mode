import { CapabilityCard } from './CapabilityCard.js';

type ActivitiesData = {
  activities: { type: string; minutes: number; points: number }[];
};

export default function Activities() {
  return (
    <CapabilityCard<ActivitiesData>
      title="Activities"
      description="Track student activity minutes and points."
      endpoint="/api/activities"
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
