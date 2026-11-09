import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = {
  _id?: string;
  type: string;
  minutes: number;
  points: number;
  occurredAt?: string;
};

type ActivitiesResponse = { activities: Activity[] };

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<ActivitiesResponse>('/api/activities')
      .then(({ activities: data }) => {
        if (active) setActivities(data);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unexpected error');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section aria-labelledby="activities-heading">
      <h2 id="activities-heading">Activities</h2>
      <p>Track student activity minutes and points.</p>
      {loading && <p role="status">Loading activities...</p>}
      {error && <p role="alert">Unable to load activities: {error}</p>}
      {!loading && !error && activities.length === 0 && <p>No activities yet.</p>}
      {!loading && !error && activities.length > 0 && (
        <div className="table-responsive">
          <table className="table">
            <thead><tr><th scope="col">Activity</th><th scope="col">Minutes</th><th scope="col">Points</th><th scope="col">Date</th></tr></thead>
            <tbody>
              {activities.map((activity, index) => (
                <tr key={activity._id ?? `${activity.type}-${index}`}>
                  <td>{activity.type}</td>
                  <td>{activity.minutes}</td>
                  <td>{activity.points}</td>
                  <td>{activity.occurredAt ? new Date(activity.occurredAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
