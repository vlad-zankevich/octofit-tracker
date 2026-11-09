import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

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
  const [suggestions, setSuggestions] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<WorkoutsResponse>('/api/workouts/suggestions/mona@example.com')
      .then(({ suggestions: data }) => {
        if (active) setSuggestions(data);
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
    <section aria-labelledby="workouts-heading">
      <h2 id="workouts-heading">Workout suggestions</h2>
      <p>Recommend workouts from activity patterns.</p>
      {loading && <p role="status">Loading workout suggestions...</p>}
      {error && <p role="alert">Unable to load workout suggestions: {error}</p>}
      {!loading && !error && suggestions.length === 0 && <p>No workout suggestions yet.</p>}
      {!loading && !error && suggestions.length > 0 && (
        <ul className="list-group">
          {suggestions.map((workout, index) => (
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
