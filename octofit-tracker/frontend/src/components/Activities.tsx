import { useApiData } from '../hooks/useApiData.js';

type Activity = {
  _id?: string;
  type: string;
  minutes: number;
  points: number;
  occurredAt?: string;
};

type ActivitiesResponse = { activities: Activity[] };

export default function Activities() {
  const result = useApiData<ActivitiesResponse>('/api/activities');

  return (
    <section aria-labelledby="activities-heading">
      <h2 id="activities-heading">Activities</h2>
      <p>Track student activity minutes and points.</p>
      {result.status === 'loading' && <p role="status">Loading activities...</p>}
      {result.status === 'error' && <p role="alert">Unable to load activities: {result.message}</p>}
      {result.status === 'success' && result.data.activities.length === 0 && <p>No activities yet.</p>}
      {result.status === 'success' && result.data.activities.length > 0 && (
        <div className="table-responsive">
          <table className="table">
            <thead><tr><th scope="col">Activity</th><th scope="col">Minutes</th><th scope="col">Points</th><th scope="col">Date</th></tr></thead>
            <tbody>
              {result.data.activities.map((activity, index) => (
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
