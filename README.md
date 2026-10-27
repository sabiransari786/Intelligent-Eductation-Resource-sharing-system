# Intelligent Education Resource Sharing System

A full-stack academic project for organizing educational resources and demonstrating practical DSA algorithms. The system uses MongoDB-backed resource management and a separate in-memory algorithm lab; it does not claim to use AI.

## Features

- Resource CRUD, URL validation, search, subject/type filters, and usefulness/time metadata.
- Responsive React dashboard, library, resource form, DSA lab, and 0/1 Knapsack study planner.
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

The client runs at `http://localhost:5173`; the API runs at `http://localhost:5000`. Run `npm test` for algorithm tests and `npm run build --workspace client` for a production client build. Set `MONGO_URI`, `PORT`, and `CLIENT_ORIGIN` in `.env`; credentials are never committed.

## API summary

`GET /api/health`, `GET/POST /api/resources`, `GET/PUT/DELETE /api/resources/:id`, `GET /api/subjects`, `GET /api/topics`, `GET /api/graph`, and POST algorithm endpoints under `/api/algorithms`.

## DSA mapping and limitations

The resource hierarchy is represented by resource metadata and can be extended to Course → Semester → Subject → Unit → Topic → Resource. The algorithm graph currently uses documented sample topic nodes so demonstrations work without extra graph collections. The Red-Black Tree module exposes the demonstration index and invariants; its data is in memory and is not MongoDB's internal index. See [docs/algorithms.md](docs/algorithms.md).

## Evidence checklist

Capture the dashboard, resource library/form, algorithm output, planner output, and test command output from a running local setup. Screenshots and user feedback are intentionally not fabricated in this repository.
