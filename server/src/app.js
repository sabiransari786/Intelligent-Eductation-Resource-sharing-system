import express from 'express';
import cors from 'cors';
import Resource from './models/Resource.js';
import User from './models/User.js';
import Assignment from './models/Assignment.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { BST } from './algorithms/bst.js';
import { adjacencyList, bfs, dfs, dijkstra, kruskal } from './algorithms/graph.js';
import { knapsack } from './algorithms/knapsack.js';
import { RedBlackTree } from './algorithms/redBlackTree.js';
import { AVLTree } from './algorithms/avl.js';

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
    return callback(new Error('CORS origin is not allowed'));
  }
}));
app.use(express.json());
const response = (res, data, status = 200) => res.status(status).json({ success: true, data });
const error = (res, message, status = 400) => res.status(status).json({ success: false, error: message });
const asyncRoute = (handler) => (req, res) => Promise.resolve(handler(req, res)).catch((err) => error(res, err.message, err.name === 'ValidationError' ? 400 : 500));
const JWT_SECRET = process.env.JWT_SECRET || 'education-resource-development-secret';
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, semester: user.semester, enrolledSubjects: user.enrolledSubjects });
const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return error(res, 'Login required', 401);
  try { req.user = jwt.verify(token, JWT_SECRET); next(); } catch { return error(res, 'Invalid or expired session', 401); }
};
const roles = (...allowed) => (req, res, next) => allowed.includes(req.user.role) ? next() : error(res, 'You do not have permission for this action', 403);

app.get('/api/health', (_req, res) => response(res, { status: 'ok' }));
app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const { name, email, password, role = 'student', department = '', semester = '' } = req.body;
  if (!name || !email || !password) return error(res, 'Name, email and password are required');
  if (!['student', 'faculty'].includes(role)) return error(res, 'Only student or faculty self-registration is allowed');
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return error(res, 'Email is already registered', 409);
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role, department, semester });
  const token = jwt.sign({ id: user._id.toString(), role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  response(res, { token, user: publicUser(user) }, 201);
}));
app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase(), isActive: true });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return error(res, 'Invalid email or password', 401);
  const token = jwt.sign({ id: user._id.toString(), role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  response(res, { token, user: publicUser(user) });
}));
app.get('/api/auth/me', auth, asyncRoute(async (req, res) => {
  const user = await User.findById(req.user.id);
  user ? response(res, publicUser(user)) : error(res, 'User not found', 404);
}));

app.get('/api/resources', asyncRoute(async (req, res) => {
  const { search, subject, resourceType, sort = 'newest' } = req.query;
  const filter = { status: 'approved' };
  if (search) filter.$or = ['title', 'description', 'subject', 'topic', 'tags'].map((field) => ({ [field]: { $regex: search, $options: 'i' } }));
  if (subject) filter.subject = subject; if (resourceType) filter.resourceType = resourceType;
  const sortBy = sort === 'title' ? { title: 1 } : sort === 'usefulness' ? { usefulnessScore: -1 } : { createdAt: -1 };
  response(res, await Resource.find(filter).populate('submittedBy', 'name role').sort(sortBy));
}));
app.get('/api/resources/manage', auth, roles('faculty', 'admin'), asyncRoute(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { submittedBy: req.user.id };
  response(res, await Resource.find(filter).populate('submittedBy', 'name email').populate('reviewedBy', 'name').sort({ createdAt: -1 }));
}));
app.get('/api/resources/:id', asyncRoute(async (req, res) => { const item = await Resource.findOne({ _id: req.params.id, status: 'approved' }); item ? response(res, item) : error(res, 'Resource not found', 404); }));
app.post('/api/resources', auth, roles('faculty', 'admin'), asyncRoute(async (req, res) => {
  const item = await Resource.create({ ...req.body, submittedBy: req.user.id, status: req.user.role === 'admin' ? 'approved' : 'pending' });
  response(res, item, 201);
}));
app.put('/api/resources/:id', auth, roles('faculty', 'admin'), asyncRoute(async (req, res) => {
  const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, submittedBy: req.user.id };
  const item = await Resource.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
  item ? response(res, item) : error(res, 'Resource not found', 404);
}));
app.delete('/api/resources/:id', auth, roles('faculty', 'admin'), asyncRoute(async (req, res) => {
  const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, submittedBy: req.user.id };
  const item = await Resource.findOneAndDelete(filter);
  item ? response(res, item) : error(res, 'Resource not found', 404);
}));
app.patch('/api/resources/:id/review', auth, roles('admin'), asyncRoute(async (req, res) => {
  const item = await Resource.findByIdAndUpdate(req.params.id, { status: req.body.status, reviewNote: req.body.reviewNote || '', reviewedBy: req.user.id }, { new: true, runValidators: true });
  item ? response(res, item) : error(res, 'Resource not found', 404);
}));
app.get('/api/subjects', asyncRoute(async (_req, res) => response(res, await Resource.distinct('subject'))));
app.get('/api/topics', asyncRoute(async (_req, res) => response(res, await Resource.distinct('topic'))));
app.get('/api/resource-graph', asyncRoute(async (_req, res) => {
  const resources = await Resource.find({ status: 'approved' }).select('title department course semester subject unit topic');
  const students = await User.find({ role: 'student', isActive: true }).select('name enrolledSubjects');
  const nodes = [];
  const edges = [];
  const seen = new Set();
  const addNode = (id, label, type) => { if (!seen.has(id)) { seen.add(id); nodes.push({ id, label, type }); } };
  resources.forEach((resource) => {
    const department = `department:${resource.department || 'General'}`;
    const course = `${department}:course:${resource.course || 'General'}`;
    const semester = `${course}:semester:${resource.semester || 'General'}`;
    const subject = `${semester}:subject:${resource.subject}`;
    const unit = `${subject}:unit:${resource.unit || 'General'}`;
    const topic = `${unit}:topic:${resource.topic || 'General'}`;
    const resourceId = `resource:${resource._id}`;
    addNode(department, resource.department || 'General', 'department');
    addNode(course, resource.course || 'General', 'course');
    addNode(semester, resource.semester || 'General', 'semester');
    addNode(subject, resource.subject, 'subject');
    addNode(unit, resource.unit || 'General', 'unit');
    addNode(topic, resource.topic || 'General', 'topic');
    addNode(resourceId, resource.title, 'resource');
    edges.push({ from: department, to: course, weight: 1 }, { from: course, to: semester, weight: 1 }, { from: semester, to: subject, weight: 1 }, { from: subject, to: unit, weight: 1 }, { from: unit, to: topic, weight: 1 }, { from: topic, to: resourceId, weight: 1 });
  });
  students.forEach((student) => {
    const studentId = `student:${student._id}`;
    addNode(studentId, student.name, 'student');
    (student.enrolledSubjects || []).forEach((subjectName) => {
      const subjectNode = nodes.find((node) => node.type === 'subject' && node.label === subjectName);
      if (subjectNode) edges.push({ from: studentId, to: subjectNode.id, weight: 1 });
    });
  });
  response(res, { nodes, edges });
}));
app.get('/api/resource-tree', asyncRoute(async (_req, res) => {
  const resources = await Resource.find({ status: 'approved' }).select('title department course semester subject unit topic resourceType');
  const root = { name: 'Educational Resources', type: 'root', children: [] };
  const findOrCreate = (children, name, type) => {
    let node = children.find((item) => item.name === name && item.type === type);
    if (!node) { node = { name, type, children: [] }; children.push(node); }
    return node;
  };
  resources.forEach((resource) => {
    let children = root.children;
    for (const [name, type] of [[resource.department || 'General', 'department'], [resource.course || 'General', 'course'], [resource.semester || 'General', 'semester'], [resource.subject, 'subject'], [resource.unit || 'General', 'unit'], [resource.topic || 'General', 'topic']]) children = findOrCreate(children, name, type).children;
    children.push({ name: resource.title, type: 'resource', resourceType: resource.resourceType, id: resource._id });
  });
  response(res, root);
}));
app.get('/api/assignments', auth, asyncRoute(async (req, res) => {
  const items = await Assignment.find(req.user.role === 'faculty' ? { createdBy: req.user.id } : {}).populate('createdBy', 'name').populate('submissions.student', 'name email');
  response(res, items);
}));
app.post('/api/assignments', auth, roles('faculty', 'admin'), asyncRoute(async (req, res) => response(res, await Assignment.create({ ...req.body, createdBy: req.user.id }), 201)));
app.post('/api/assignments/:id/submit', auth, roles('student'), asyncRoute(async (req, res) => {
  const item = await Assignment.findById(req.params.id);
  if (!item) return error(res, 'Assignment not found', 404);
  item.submissions = item.submissions.filter((submission) => submission.student.toString() !== req.user.id);
  item.submissions.push({ student: req.user.id, answer: req.body.answer });
  await item.save();
  response(res, item);
}));
app.patch('/api/assignments/:id/submissions/:studentId', auth, roles('faculty', 'admin'), asyncRoute(async (req, res) => {
  const item = await Assignment.findById(req.params.id);
  const submission = item?.submissions.find((candidate) => candidate.student.toString() === req.params.studentId);
  if (!submission) return error(res, 'Submission not found', 404);
  submission.grade = req.body.grade; submission.feedback = req.body.feedback || '';
  await item.save(); response(res, item);
}));
app.get('/api/admin/overview', auth, roles('admin'), asyncRoute(async (_req, res) => {
  const [students, faculty, resources, pendingResources, assignments] = await Promise.all([
    User.countDocuments({ role: 'student' }), User.countDocuments({ role: 'faculty' }),
    Resource.countDocuments(), Resource.countDocuments({ status: 'pending' }), Assignment.countDocuments()
  ]);
  response(res, { students, faculty, resources, pendingResources, assignments });
}));

const sampleNodes = [
  { id: 'dsa', label: 'Data Structures', type: 'subject' }, { id: 'trees', label: 'Trees', type: 'topic' },
  { id: 'graphs', label: 'Graphs', type: 'topic' }, { id: 'dp', label: 'Dynamic Programming', type: 'topic' },
  { id: 'bst', label: 'Binary Search Tree', type: 'resource' }, { id: 'knapsack', label: '0/1 Knapsack', type: 'resource' }
];
const sampleEdges = [{ from: 'dsa', to: 'trees', weight: 1 }, { from: 'dsa', to: 'graphs', weight: 2 }, { from: 'trees', to: 'bst', weight: 1 }, { from: 'graphs', to: 'dp', weight: 3 }, { from: 'dp', to: 'knapsack', weight: 1 }, { from: 'trees', to: 'graphs', weight: 2 }];
app.get('/api/graph', (_req, res) => response(res, { nodes: sampleNodes, edges: sampleEdges }));
const requestGraph = (req) => req.body.nodes && req.body.edges ? [req.body.nodes, req.body.edges] : [sampleNodes, sampleEdges];
app.post('/api/algorithms/bfs', (req, res) => { try { const [nodes, edges] = requestGraph(req); response(res, { order: bfs(adjacencyList(nodes, edges), req.body.start) }); } catch (e) { error(res, e.message); } });
app.post('/api/algorithms/dfs', (req, res) => { try { const [nodes, edges] = requestGraph(req); response(res, { order: dfs(adjacencyList(nodes, edges), req.body.start) }); } catch (e) { error(res, e.message); } });
app.post('/api/algorithms/dijkstra', (req, res) => { try { const [nodes, edges] = requestGraph(req); response(res, dijkstra(adjacencyList(nodes, edges), req.body.start, req.body.end)); } catch (e) { error(res, e.message); } });
app.post('/api/algorithms/kruskal', (req, res) => { const [nodes, edges] = requestGraph(req); response(res, kruskal(nodes, edges)); });
app.post('/api/algorithms/knapsack', (req, res) => { try { response(res, knapsack(req.body.items, req.body.capacity)); } catch (e) { error(res, e.message); } });
app.post('/api/algorithms/tree-traversal', (req, res) => { const tree = new BST(); (req.body.keys || []).forEach((key) => tree.insert(key)); response(res, { inorder: tree.inorder().map((n) => n.key), preorder: tree.preorder().map((n) => n.key), postorder: tree.postorder().map((n) => n.key), levelOrder: tree.levelOrder().map((n) => n.key) }); });
app.post('/api/algorithms/bst/insert', (req, res) => { const tree = new BST(); (req.body.keys || []).forEach((key) => tree.insert(key)); response(res, { traversal: tree.inorder().map((n) => n.key) }); });
app.post('/api/algorithms/bst/search', (req, res) => { const tree = new BST(); (req.body.keys || []).forEach((key) => tree.insert(key)); response(res, { found: Boolean(tree.search(req.body.key)) }); });
app.post('/api/algorithms/red-black-tree/search', (req, res) => { const tree = new RedBlackTree(); (req.body.keys || []).forEach((key) => tree.insert(key)); response(res, { found: Boolean(tree.search(req.body.key)), properties: tree.validate() }); });
app.get('/api/algorithms/red-black-tree/traversal', (_req, res) => { const tree = new RedBlackTree(); [10, 5, 15, 2, 7, 12, 20].forEach((key) => tree.insert(key)); response(res, { nodes: tree.inorder(), properties: tree.validate() }); });
app.post('/api/algorithms/avl', (req, res) => {
  try {
    const tree = new AVLTree();
    (req.body.keys || []).forEach((key) => { if (!Number.isFinite(key)) throw new Error('Keys must be numbers'); tree.insert(key); });
    response(res, { inorder: tree.inorder().map((node) => node.key), root: tree.root?.key ?? null, height: tree.height(tree.root), balanced: tree.isBalanced() });
  } catch (e) { error(res, e.message); }
});
app.use((_req, res) => error(res, 'Route not found', 404));
export default app;
