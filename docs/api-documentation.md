# API documentation

All responses use `{ "success": boolean, "data": ... }`; failures use `{ "success": false, "error": "..." }`.

- `GET /api/resources?search=&subject=&resourceType=&sort=` — MongoDB-backed search.
- `POST /api/resources` — creates a validated resource.
- `PUT/DELETE /api/resources/:id` and `GET /api/resources/:id` — resource lifecycle.
- `GET /api/graph` — sample adjacency-list graph.
- `POST /api/algorithms/bfs|dfs` body `{ "start": "dsa" }`.
- `POST /api/algorithms/dijkstra` body `{ "start": "dsa", "end": "knapsack" }`.
- `POST /api/algorithms/knapsack` body `{ "capacity": 75, "items": [{ "id": "x", "time": 30, "value": 8 }] }`.
- `POST /api/algorithms/tree-traversal` body `{ "keys": [5,2,8] }`.
- `POST /api/algorithms/bst/insert|search` and red-black tree endpoints.
