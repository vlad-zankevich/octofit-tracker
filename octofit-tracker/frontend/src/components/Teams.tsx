import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = {
  _id?: string;
  name: string;
  mascot?: string;
  members?: Array<string | { name?: string }>;
};

type TeamsResponse = { teams: Team[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<TeamsResponse>('/api/teams')
      .then(({ teams: data }) => {
        if (active) setTeams(data);
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
    <section aria-labelledby="teams-heading">
      <h2 id="teams-heading">Teams</h2>
      <p>Manage teams and members.</p>
      {loading && <p role="status">Loading teams...</p>}
      {error && <p role="alert">Unable to load teams: {error}</p>}
      {!loading && !error && teams.length === 0 && <p>No teams yet.</p>}
      {!loading && !error && teams.length > 0 && (
        <ul className="list-group">
          {teams.map((team, index) => (
            <li className="list-group-item" key={team._id ?? `${team.name}-${index}`}>
              <h3 className="h5">{team.name}</h3>
              {team.mascot && <p>Mascot: {team.mascot}</p>}
              <p>Members: {team.members?.map((member) => typeof member === 'string' ? member : member.name ?? 'Member').join(', ') || 'No members yet.'}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
