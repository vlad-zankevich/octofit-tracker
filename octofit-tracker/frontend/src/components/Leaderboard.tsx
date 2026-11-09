import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type LeaderboardEntry = {
  teamName: string;
  totalPoints: number;
  rank: number;
};

type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<LeaderboardResponse>('/api/leaderboard')
      .then(({ leaderboard: data }) => {
        if (active) setLeaderboard(data);
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
    <section aria-labelledby="leaderboard-heading">
      <h2 id="leaderboard-heading">Leaderboard</h2>
      <p>Compare team point totals.</p>
      {loading && <p role="status">Loading leaderboard...</p>}
      {error && <p role="alert">Unable to load leaderboard: {error}</p>}
      {!loading && !error && leaderboard.length === 0 && <p>No rankings yet.</p>}
      {!loading && !error && leaderboard.length > 0 && (
        <div className="table-responsive">
          <table className="table">
            <thead><tr><th scope="col">Rank</th><th scope="col">Team</th><th scope="col">Total points</th></tr></thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={`${entry.rank}-${entry.teamName}`}>
                  <td>{entry.rank}</td>
                  <td>{entry.teamName}</td>
                  <td>{entry.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
