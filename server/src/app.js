import express from 'express';
import cors from 'cors';
import Resource from './models/Resource.js';
import { BST } from './algorithms/bst.js';
import { adjacencyList, bfs, dfs, dijkstra, kruskal } from './algorithms/graph.js';
import { knapsack } from './algorithms/knapsack.js';
import { RedBlackTree } from './algorithms/redBlackTree.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
const response = (res, data, status = 200) => res.status(status).json({ success: true, data });
const error = (res, message, status = 400) => res.status(status).json({ success: false, error: message });
const asyncRoute = (handler) => (req, res) => Promise.resolve(handler(req, res)).catch((err) => error(res, err.message, err.name === 'ValidationError' ? 400 : 500));

app.get('/api/health', (_req, res) => response(res, { status: 'ok' }));
app.get('/api/resources', asyncRoute(async (req, res) => {
  const { search, subject, resourceType, sort = 'newest' } = req.query;
  const filter = {};
  if (search) filter.$or = ['title', 'description', 'subject', 'topic', 'tags'].map((field) => ({ [field]: { $regex: search, $options: 'i' } }));
  if (subject) filter.subject = subject; if (resourceType) filter.resourceType = resourceType;
  const sortBy = sort === 'title' ? { title: 1 } : sort === 'usefulness' ? { usefulnessScore: -1 } : { createdAt: -1 };
  response(res, await Resource.find(filter).sort(sortBy));
}));
app.get('/api/resources/:id', asyncRoute(async (req, res) => { const item = await Resource.findById(req.params.id); item ? response(res, item) : error(res, 'Resource not found', 404); }));
app.post('/api/resources', asyncRoute(async (req, res) => response(res, await Resource.create(req.body), 201)));
app.put('/api/resources/:id', asyncRoute(async (req, res) => { const item = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); item ? response(res, item) : error(res, 'Resource not found', 404); }));
app.delete('/api/resources/:id', asyncRoute(async (req, res) => { const item = await Resource.findByIdAndDelete(req.params.id); item ? response(res, item) : error(res, 'Resource not found', 404); }));
app.get('/api/subjects', asyncRoute(async (_req, res) => response(res, await Resource.distinct('subject'))));
app.get('/api/topics', asyncRoute(async (_req, res) => response(res, await Resource.distinct('topic'))));

const sampleNodes = [
  { id: 'dsa', label: 'Data Structures', type: 'subject' }, { id: 'trees', label: 'Trees', type: 'topic' },
  { id: 'graphs', label: 'Graphs', type: 'topic' }, { id: 'dp', label: 'Dynamic Programming', type: 'topic' },
  { id: 'bst', label: 'Binary Search Tree', type: 'resource' }, { id: 'knapsack', label: '0/1 Knapsack', type: 'resource' }
];
const sampleEdges = [{ from: 'dsa', to: 'trees', weight: 1 }, { from: 'dsa', to: 'graphs', weight: 2 }, { from: 'trees', to: 'bst', weight: 1 }, { from: 'graphs', to: 'dp', weight: 3 }, { from: 'dp', to: 'knapsack', weight: 1 }, { from: 'trees', to: 'graphs', weight: 2 }];
app.get('/api/graph', (_req, res) => response(res, { nodes: sampleNodes, edges: sampleEdges }));
app.post('/api/algorithms/bfs', (req, res) => { try { response(res, { order: bfs(adjacencyList(sampleNodes, sampleEdges), req.body.start) }); } catch (e) { error(res, e.message); } });
app.post('/api/algorithms/dfs', (req, res) => { try { response(res, { order: dfs(adjacencyList(sampleNodes, sampleEdges), req.body.start) }); } catch (e) { error(res, e.message); } });
app.post('/api/algorithms/dijkstra', (req, res) => { try { response(res, dijkstra(adjacencyList(sampleNodes, sampleEdges), req.body.start, req.body.end)); } catch (e) { error(res, e.message); } });
app.post('/api/algorithms/kruskal', (_req, res) => response(res, kruskal(sampleNodes, sampleEdges)));
app.post('/api/algorithms/knapsack', (req, res) => { try { response(res, knapsack(req.body.items, req.body.capacity)); } catch (e) { error(res, e.message); } });
app.post('/api/algorithms/tree-traversal', (req, res) => { const tree = new BST(); (req.body.keys || []).forEach((key) => tree.insert(key)); response(res, { inorder: tree.inorder().map((n) => n.key), preorder: tree.preorder().map((n) => n.key), postorder: tree.postorder().map((n) => n.key), levelOrder: tree.levelOrder().map((n) => n.key) }); });
app.post('/api/algorithms/bst/insert', (req, res) => { const tree = new BST(); (req.body.keys || []).forEach((key) => tree.insert(key)); response(res, { traversal: tree.inorder().map((n) => n.key) }); });
app.post('/api/algorithms/bst/search', (req, res) => { const tree = new BST(); (req.body.keys || []).forEach((key) => tree.insert(key)); response(res, { found: Boolean(tree.search(req.body.key)) }); });
app.post('/api/algorithms/red-black-tree/search', (req, res) => { const tree = new RedBlackTree(); (req.body.keys || []).forEach((key) => tree.insert(key)); response(res, { found: Boolean(tree.search(req.body.key)), properties: tree.validate() }); });
app.get('/api/algorithms/red-black-tree/traversal', (_req, res) => { const tree = new RedBlackTree(); [10, 5, 15, 2, 7, 12, 20].forEach((key) => tree.insert(key)); response(res, { nodes: tree.inorder(), properties: tree.validate() }); });
app.use((_req, res) => error(res, 'Route not found', 404));
export default app;
