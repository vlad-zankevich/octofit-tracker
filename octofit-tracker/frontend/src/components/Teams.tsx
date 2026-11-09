import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { useApiData } from '../hooks/useApiData.js';

type Team = {
  _id?: string;
  name: string;
  mascot?: string;
  members?: Array<string | { name?: string }>;
};

type TeamsResponse = { teams: Team[] };

export default function Teams() {
  const loadTeams = useCallback(() => getJson<TeamsResponse>('/api/teams'), []);
  const result = useApiData(loadTeams);

  return (
    <section aria-labelledby="teams-heading">
      <h2 id="teams-heading">Teams</h2>
      <p>Manage teams and members.</p>
      {result.status === 'loading' && <p role="status">Loading teams...</p>}
      {result.status === 'error' && <p role="alert">Unable to load teams: {result.message}</p>}
      {result.status === 'success' && result.data.teams.length === 0 && <p>No teams yet.</p>}
      {result.status === 'success' && result.data.teams.length > 0 && (
        <ul className="list-group">
          {result.data.teams.map((team, index) => (
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
