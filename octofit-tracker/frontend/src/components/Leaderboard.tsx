import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { useApiData } from '../hooks/useApiData.js';

type LeaderboardEntry = {
  teamName: string;
  totalPoints: number;
  rank: number;
};

type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  const loadLeaderboard = useCallback(() => getJson<LeaderboardResponse>('/api/leaderboard'), []);
  const result = useApiData(loadLeaderboard);

  return (
    <section aria-labelledby="leaderboard-heading">
      <h2 id="leaderboard-heading">Leaderboard</h2>
      <p>Compare team point totals.</p>
      {result.status === 'loading' && <p role="status">Loading leaderboard...</p>}
      {result.status === 'error' && <p role="alert">Unable to load leaderboard: {result.message}</p>}
      {result.status === 'success' && result.data.leaderboard.length === 0 && <p>No rankings yet.</p>}
      {result.status === 'success' && result.data.leaderboard.length > 0 && (
        <div className="table-responsive">
          <table className="table">
            <thead><tr><th scope="col">Rank</th><th scope="col">Team</th><th scope="col">Total points</th></tr></thead>
            <tbody>
              {result.data.leaderboard.map((entry) => (
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
