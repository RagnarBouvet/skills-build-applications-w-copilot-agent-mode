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

- Presentation tier decision: Use the shared API client from a reusable capability card that presents loading, empty, success, and error states.
- Logic tier decision: Keep input validation and capability behavior in explicit Express service functions; return deliberate 4xx responses for invalid or missing records.
- Data tier decision: Express required fields, references, defaults, and numeric bounds in Mongoose schemas; use idempotent seed upserts without clearing unrelated records.
- Activity tracking approach: Require valid existing user and team IDs, accept a positive duration, calculate points from minutes, and set the occurrence time on the server.
- Team management approach: Require a name and mascot, default members to an empty list, and validate member IDs against existing users.
- Leaderboard approach: Sum activity points by team, include teams with no activity, sort highest-first, and assign 1-based ranks.
- Workout suggestions approach: Match a user's goal when available, otherwise use their most recent activity focus, explain the recommendation, and return 404 for an unknown email.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — failure indicates a Mongoose schema or seed-contract problem.
- API command: `npm run test:api --prefix octofit-tracker/backend` — failure indicates request validation, business behavior, or response-contract problems.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — failure indicates API rendering, accessible state, or route behavior problems.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — failure indicates a TypeScript compile/type problem.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — failure indicates a TypeScript or Vite production-build problem.
