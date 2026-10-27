# Intelligent Education Resource Sharing System

A full-stack academic project for organizing educational resources and demonstrating practical DSA algorithms. The system uses MongoDB-backed resource management and a separate in-memory algorithm lab; it does not claim to use AI.

## Features

- Resource CRUD, URL validation, search, subject/type filters, and usefulness/time metadata.
- Responsive React dashboard, library, resource form, DSA lab, and 0/1 Knapsack study planner.
- Role-based Student, Teacher/Faculty, and Admin modules with login, resource approvals, assignments, submissions, and platform overview.
- BST traversals, adjacency-list BFS/DFS/Dijkstra, Kruskal, and a Red-Black Tree demonstration.
- Safe idempotent sample-data seeding.

## Run locally

Requirements: Node.js 20+, MongoDB 6+.

```bash
cp .env.example .env
npm install
npm run seed
npm run dev
```

The client runs at `http://localhost:5173`; the API runs at `http://localhost:5001` (port 5000 is commonly reserved by macOS AirPlay). Run `npm test` for algorithm tests and `npm run build --workspace client` for a production client build. Set `MONGO_URI`, `PORT`, and `CLIENT_ORIGIN` in `.env`; credentials are never committed.

### Demo accounts

After running `npm run seed`, sign in with the demo accounts below. The seed also creates seven approved resources, one pending resource for the admin review queue, two faculty assignments, and one graded student submission.

The DSA lab uses the seeded MongoDB resources for its hierarchy graph and study planner. `/api/resource-tree` exposes Department → Course → Semester → Subject → Unit → Topic → Resource, `/api/resource-graph` builds the same hierarchy as graph nodes, and BFS, DFS, Dijkstra and Kruskal run against that database-backed graph.

| Module | Email | Password |
| --- | --- | --- |
| Admin | `admin@edushare.local` | `Admin@123` |
| Teacher / Faculty | `faculty@edushare.local` | `Faculty@123` |
| Student | `student@edushare.local` | `Student@123` |

Change these credentials before deploying. Faculty resources enter the admin review queue; students see approved resources and can submit assignments.

## API summary

`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, resource CRUD and review routes, assignment creation/submission routes, `GET /api/admin/overview`, `GET /api/subjects`, `GET /api/topics`, `GET /api/resource-tree`, `GET /api/resource-graph`, `GET /api/graph`, and POST algorithm endpoints under `/api/algorithms`.

## DSA mapping and limitations

The resource hierarchy is stored in MongoDB and exposed as Department → Course → Semester → Subject → Unit → Topic → Resource. The algorithm graph is generated from approved resource records and active student subject enrollments without an extra graph collection. The DSA lab includes BST, AVL and Red-Black Tree demonstrations. See [docs/algorithms.md](docs/algorithms.md).

## Evidence checklist

Capture the dashboard, resource library/form, algorithm output, planner output, and test command output from a running local setup. Screenshots and user feedback are intentionally not fabricated in this repository.
