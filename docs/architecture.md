# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Use React components with getJson from the shared client, handle loading/error/empty states, and render real data from the API.
- Logic tier decision: Implement createActivity, createTeam, getLeaderboard, and suggestWorkouts in octofitService.ts with proper 4xx error handling.
- Data tier decision: Require complete user, team, activity, and workout fields in Mongoose schemas; seed stable demo records with validated upserts that preserve unrelated data.
- Activity tracking approach: Validate userId/teamId, compute points and occurredAt on creation, return 4xx for invalid IDs.
- Team management approach: Require name on create, return 400 if missing, keep submitted name and mascot.
- Leaderboard approach: Aggregate activity points by team, sort descending, return rank, teamName, and totalPoints.
- Workout suggestions approach: Match user by email, suggest based on goal or recent activity, return 404 if user not found.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
- API command: `npm run test:api --prefix octofit-tracker/backend`
- Frontend command: `npm test --prefix octofit-tracker/frontend`
- Backend build command: `npm run build --prefix octofit-tracker/backend`
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`

## Implementation plan (from Copilot analysis)

### Tier boundaries
- Presentation: React + Vite (src/components, App.tsx, client.ts)
- Logic: Express API (src/api.ts, octofitService.ts, app.ts)
- Data: Mongoose models (models/, seed.ts)

### Current failing tests
- Backend data: 4 failed (validation schemas missing required fields)
- Backend API: 4 failed (501 / empty implementations)
- Frontend: 15 failed (UI stubs)

### Smallest safe implementation order
1. Data tier — add required validation to Mongoose models
2. Logic tier — implement createActivity, createTeam, getLeaderboard, suggestWorkouts
3. Presentation tier — replace stubs with real fetching + error/loading states