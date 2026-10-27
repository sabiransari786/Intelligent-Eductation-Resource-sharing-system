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
  const previous = {};
  const queue = [];
  const push = (entry) => {
    queue.push(entry);
    let index = queue.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (queue[parent][0] <= queue[index][0]) break;
      [queue[parent], queue[index]] = [queue[index], queue[parent]];
      index = parent;
    }
  };
  const pop = () => {
    const first = queue[0];
    const last = queue.pop();
    if (queue.length && last) {
      queue[0] = last;
      let index = 0;
      while (true) {
        const left = index * 2 + 1;
        const right = left + 1;
        let smallest = index;
        if (left < queue.length && queue[left][0] < queue[smallest][0]) smallest = left;
        if (right < queue.length && queue[right][0] < queue[smallest][0]) smallest = right;
        if (smallest === index) break;
        [queue[index], queue[smallest]] = [queue[smallest], queue[index]];
        index = smallest;
      }
    }
    return first;
  };
  distance[start] = 0; push([0, start]);
  while (queue.length) {
    const [currentDistance, current] = pop();
    if (currentDistance !== distance[current]) continue;
    if (current === end) break;
    for (const edge of graph[current]) if (distance[current] + edge.weight < distance[edge.node]) {
      distance[edge.node] = distance[current] + edge.weight;
      previous[edge.node] = current;
      push([distance[edge.node], edge.node]);
    }
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
