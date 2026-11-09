import { useApiData } from '../hooks/useApiData.js';

type Workout = {
  _id?: string;
  title: string;
  focus?: string;
  minutes?: number;
  difficulty?: string;
  reason?: string;
};

type WorkoutsResponse = { suggestions: Workout[] };

export default function Workouts() {
  const result = useApiData<WorkoutsResponse>('/api/workouts/suggestions/mona%40example.com');

  return (
    <section aria-labelledby="workouts-heading">
      <h2 id="workouts-heading">Workout suggestions</h2>
      <p>Recommend workouts from activity patterns.</p>
      {result.status === 'loading' && <p role="status">Loading workout suggestions...</p>}
      {result.status === 'error' && <p role="alert">Unable to load workout suggestions: {result.message}</p>}
      {result.status === 'success' && result.data.suggestions.length === 0 && <p>No workout suggestions yet.</p>}
      {result.status === 'success' && result.data.suggestions.length > 0 && (
        <ul className="list-group">
          {result.data.suggestions.map((workout, index) => (
            <li className="list-group-item" key={workout._id ?? `${workout.title}-${index}`}>
              <h3 className="h5">{workout.title}</h3>
              {workout.focus && <p>Focus: {workout.focus}</p>}
              {workout.minutes !== undefined && <p>Duration: {workout.minutes} minutes</p>}
              {workout.difficulty && <p>Difficulty: {workout.difficulty}</p>}
              {workout.reason && <p>{workout.reason}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
