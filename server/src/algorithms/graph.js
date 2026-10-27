export function adjacencyList(nodes, edges) {
  const graph = Object.fromEntries(nodes.map((node) => [node.id, []]));
  for (const edge of edges) {
    if (!graph[edge.from] || !graph[edge.to] || edge.weight < 0) throw new Error('Invalid graph edge');
    graph[edge.from].push({ node: edge.to, weight: edge.weight });
    if (!edge.directed) graph[edge.to].push({ node: edge.from, weight: edge.weight });
  }
  return graph;
}
export function bfs(graph, start) {
  if (!graph[start]) throw new Error('Invalid start node');
  const visited = new Set([start]), queue = [start], order = [];
  while (queue.length) { const node = queue.shift(); order.push(node); for (const next of graph[node]) if (!visited.has(next.node)) { visited.add(next.node); queue.push(next.node); } }
  return order;
}
export function dfs(graph, start) {
  if (!graph[start]) throw new Error('Invalid start node');
  const visited = new Set(), order = [];
  function visit(node) { visited.add(node); order.push(node); for (const next of graph[node]) if (!visited.has(next.node)) visit(next.node); }
  visit(start); return order;
}
export function dijkstra(graph, start, end) {
  if (!graph[start] || !graph[end]) throw new Error('Invalid graph node');
  const distance = Object.fromEntries(Object.keys(graph).map((key) => [key, Infinity]));
  const previous = {}, remaining = new Set(Object.keys(graph)); distance[start] = 0;
  while (remaining.size) {
    const current = [...remaining].reduce((best, node) => distance[node] < distance[best] ? node : best);
    remaining.delete(current); if (distance[current] === Infinity) break;
    for (const edge of graph[current]) if (distance[current] + edge.weight < distance[edge.node]) { distance[edge.node] = distance[current] + edge.weight; previous[edge.node] = current; }
  }
  if (distance[end] === Infinity) return { path: [], cost: null };
  const path = []; for (let node = end; node; node = previous[node]) path.unshift(node);
  return { path, cost: distance[end] };
}
export function kruskal(nodes, edges) {
  const parent = Object.fromEntries(nodes.map((node) => [node.id, node.id]));
  const find = (x) => parent[x] === x ? x : (parent[x] = find(parent[x]));
  const result = [];
  for (const edge of [...edges].sort((a, b) => a.weight - b.weight)) if (find(edge.from) !== find(edge.to)) { parent[find(edge.from)] = find(edge.to); result.push(edge); }
  return { edges: result, totalWeight: result.reduce((sum, edge) => sum + edge.weight, 0), connected: result.length === nodes.length - 1 };
}
