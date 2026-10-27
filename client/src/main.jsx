import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import './styles.css';

const API = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5001/api`;
const getSession = () => JSON.parse(localStorage.getItem('edushare-session') || 'null');
async function api(path, options = {}) {
  const session = getSession();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;
  const result = await fetch(API + path, { ...options, headers });
  const body = await result.json();
  if (!body.success) throw new Error(body.error || 'Request failed');
  return body.data;
}

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [register, setRegister] = useState(false);
  const [message, setMessage] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    try {
      const data = await api(register ? '/auth/register' : '/auth/login', { method: 'POST', body: JSON.stringify(form) });
      localStorage.setItem('edushare-session', JSON.stringify(data)); onLogin(data);
    } catch (error) { setMessage(error.message); }
  };
  return <section className="auth-page"><div className="auth-card"><p className="eyebrow">EduShare workspace</p><h1>{register ? 'Create your account' : 'Welcome back'}</h1><p className="muted">Access the right tools for your role.</p><form onSubmit={submit}>
    {register && <><label>Full name<input required value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Role<select value={form.role || 'student'} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="student">Student</option><option value="faculty">Teacher / Faculty</option></select></label></>}
    <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Password<input type="password" required minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
    <button className="button">{register ? 'Register' : 'Sign in'}</button>
  </form>{message && <p className="error">{message}</p>}<button className="link-button" onClick={() => setRegister(!register)}>{register ? 'Already have an account? Sign in' : 'New here? Create an account'}</button><p className="demo-hint">Admin access is created by the system administrator.</p></div></section>;
}

function Layout({ session, onLogout, children }) {
  const links = session.user.role === 'student' ? [['/student', 'My learning'], ['/resources', 'Library'], ['/assignments', 'Assignments'], ['/algorithms', 'DSA lab']] : session.user.role === 'faculty' ? [['/faculty', 'Faculty home'], ['/resources', 'Library'], ['/resources/new', 'Add resource'], ['/algorithms', 'DSA lab']] : [['/admin', 'Admin overview'], ['/resources', 'Library'], ['/algorithms', 'DSA lab']];
  return <><header><Link to="/"><strong>Edu<span>Share</span></strong></Link><nav>{links.map(([href, label]) => <Link key={href} to={href}>{label}</Link>)}<button className="logout" onClick={onLogout}>Log out</button></nav></header><main><div className="user-strip"><span className={`role role-${session.user.role}`}>{session.user.role === 'faculty' ? 'Teacher / Faculty' : session.user.role}</span><span>{session.user.name}</span></div>{children}</main></>;
}

function ResourceTree({ node, depth = 0 }) {
  return <li className={`tree-node tree-${node.type}`} style={{ marginLeft: depth * 14 }}><span>{node.type === 'resource' ? '↳' : '▸'} {node.name}</span>{node.children?.length > 0 && <ul>{node.children.map((child) => <ResourceTree key={`${child.type}-${child.name}-${child.id || ''}`} node={child} depth={depth + 1} />)}</ul>}</li>;
}

function Resources() {
  const [items, setItems] = useState([]); const [tree, setTree] = useState(null); const [search, setSearch] = useState(''); const [message, setMessage] = useState('');
  const load = () => api(`/resources?search=${encodeURIComponent(search)}`).then(setItems).catch((e) => setMessage(e.message));
  useEffect(() => { load(); api('/resource-tree').then(setTree).catch((e) => setMessage(e.message)); }, []);
  return <><div className="page-title"><div><p className="eyebrow">Student knowledge library</p><h1>Explore resources</h1></div></div><div className="toolbar"><input placeholder="Search title, subject or topic" value={search} onChange={(e) => setSearch(e.target.value)} /><button onClick={load}>Search</button></div>{message && <p className="error">{message}</p>}<div className="resource-layout"><section className="panel hierarchy-panel"><h2>Resource hierarchy</h2><p className="muted">Department → course → semester → subject → unit → topic</p>{tree ? <ul className="resource-tree"><ResourceTree node={tree} /></ul> : <p className="muted">Loading hierarchy...</p>}</section><div className="cards">{items.map((item) => <article className="card" key={item._id}><span className="badge">{item.resourceType}</span><h3>{item.title}</h3><p>{item.description}</p><small>{item.subject} · {item.estimatedStudyMinutes} min · {item.usefulnessScore}/10 useful</small>{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer">Open resource →</a>}</article>)}{!items.length && <div className="empty">No approved resources found yet.</div>}</div></div></>;
}

function ResourceForm() {
  const [form, setForm] = useState({ title: '', description: '', resourceType: 'Note', subject: '', topic: '', estimatedStudyMinutes: 30, usefulnessScore: 5, sourceUrl: '' }); const [message, setMessage] = useState('');
  const submit = async (e) => { e.preventDefault(); try { await api('/resources', { method: 'POST', body: JSON.stringify({ ...form, estimatedStudyMinutes: Number(form.estimatedStudyMinutes), usefulnessScore: Number(form.usefulnessScore) }) }); setMessage('Resource submitted for admin approval.'); setForm({ ...form, title: '', description: '' }); } catch (error) { setMessage(error.message); } };
  return <section className="form-wrap"><p className="eyebrow">Faculty workspace</p><h1>Share a resource</h1><p className="muted">New resources are reviewed by an administrator before students see them.</p><form onSubmit={submit}>{[['title', 'Title'], ['subject', 'Subject'], ['topic', 'Topic'], ['sourceUrl', 'Source URL']].map(([key, label]) => <label key={key}>{label}<input required={key !== 'topic' && key !== 'sourceUrl'} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}<label>Type<select value={form.resourceType} onChange={(e) => setForm({ ...form, resourceType: e.target.value })}>{['Note', 'PDF', 'Lecture', 'Assignment', 'E-book', 'Reference'].map((x) => <option key={x}>{x}</option>)}</select></label><label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><div className="split"><label>Study minutes<input type="number" min="0" value={form.estimatedStudyMinutes} onChange={(e) => setForm({ ...form, estimatedStudyMinutes: e.target.value })} /></label><label>Usefulness (0-10)<input type="number" min="0" max="10" value={form.usefulnessScore} onChange={(e) => setForm({ ...form, usefulnessScore: e.target.value })} /></label></div><button className="button">Submit resource</button></form>{message && <p className="notice">{message}</p>}</section>;
}

function StudentHome() {
  const [assignments, setAssignments] = useState([]); const [resources, setResources] = useState([]);
  useEffect(() => { Promise.all([api('/assignments'), api('/resources')]).then(([a, r]) => { setAssignments(a); setResources(r); }).catch(() => {}); }, []);
  return <><section className="welcome"><p className="eyebrow">Student module</p><h1>Keep learning, one step at a time.</h1><p className="lead">Discover approved resources and submit your assignments from one focused workspace.</p><Link className="button" to="/resources">Browse library</Link></section><div className="metric-grid"><div><b>{resources.length}</b><span>Approved resources</span></div><div><b>{assignments.length}</b><span>Active assignments</span></div><div><b>24/7</b><span>Self-paced access</span></div></div><section className="section"><div className="section-heading"><h2>Assignments</h2><Link to="/assignments">View all →</Link></div>{assignments.slice(0, 3).map((item) => <article className="list-item" key={item._id}><div><b>{item.title}</b><p>{item.subject} · Due {new Date(item.dueDate).toLocaleDateString()}</p></div><Link className="small-button" to="/assignments">Open</Link></article>)}{!assignments.length && <div className="empty">No assignments have been published yet.</div>}</section></>;
}

function Assignments() {
  const [items, setItems] = useState([]); const [answer, setAnswer] = useState({}); const [message, setMessage] = useState('');
  useEffect(() => { api('/assignments').then(setItems).catch((e) => setMessage(e.message)); }, []);
  const submit = async (id) => { try { await api(`/assignments/${id}/submit`, { method: 'POST', body: JSON.stringify({ answer: answer[id] || '' }) }); setMessage('Assignment submitted successfully.'); } catch (e) { setMessage(e.message); } };
  return <><div className="page-title"><div><p className="eyebrow">Student module</p><h1>My assignments</h1></div></div>{message && <p className="notice">{message}</p>}<div className="stack">{items.map((item) => { const submission = item.submissions?.find((entry) => entry.student?._id === getSession()?.user?.id || entry.student === getSession()?.user?.id); return <article className="panel" key={item._id}><span className="badge">{item.subject}</span><h2>{item.title}</h2><p>{item.description}</p><small>Due {new Date(item.dueDate).toLocaleDateString()}</small>{submission?.grade !== undefined && <p className="notice">Grade: {submission.grade}/100{submission.feedback ? ` — ${submission.feedback}` : ''}</p>}<textarea placeholder="Write your answer here..." value={answer[item._id] ?? submission?.answer ?? ''} onChange={(e) => setAnswer({ ...answer, [item._id]: e.target.value })} /><button className="button" onClick={() => submit(item._id)}>Submit answer</button></article>; })}{!items.length && <div className="empty">No assignments available.</div>}</div></>;
}

function Algorithms() {
  const [graph, setGraph] = useState(null);
  const [resourceItems, setResourceItems] = useState([]);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [keys, setKeys] = useState('5, 2, 8, 1, 3');
  const run = async (kind) => {
    try {
      setError('');
      const parsedKeys = keys.split(',').map(Number).filter(Number.isFinite);
      const body = ['tree-traversal', 'red-black-tree/search', 'avl'].includes(kind) ? { keys: parsedKeys } : kind === 'knapsack' ? { items: resourceItems.map((item) => ({ id: item._id, title: item.title, time: item.estimatedStudyMinutes, value: item.usefulnessScore })), capacity: 120 } : { nodes: graph?.nodes, edges: graph?.edges, start: graph?.nodes.find((node) => node.type === 'subject')?.id };
      if (kind === 'dijkstra') body.end = graph?.nodes.find((node) => node.type === 'resource')?.id;
      if (kind === 'red-black-tree/search') body.key = parsedKeys[0];
      setResult(JSON.stringify(await api(`/algorithms/${kind}`, { method: 'POST', body: JSON.stringify(body) }), null, 2));
    } catch (e) { setError(e.message); }
  };
  useEffect(() => { Promise.all([api('/resource-graph'), api('/resources')]).then(([resourceGraph, resources]) => { setGraph(resourceGraph); setResourceItems(resources); }).catch((e) => setError(e.message)); }, []);
  return <><div className="page-title"><div><p className="eyebrow">Algorithmic exploration</p><h1>DSA lab</h1></div></div>
    {error && <p className="error">{error}</p>}
    <div className="two-column"><section className="panel"><h2>Resource hierarchy graph</h2><p className="muted">{graph ? `${graph.nodes.length} database nodes and ${graph.edges.length} learning links` : 'Loading graph...'}</p><div className="actions"><button onClick={() => run('bfs')}>Run BFS</button><button onClick={() => run('dfs')}>Run DFS</button><button onClick={() => run('dijkstra')}>Dijkstra</button><button onClick={() => run('kruskal')}>Kruskal</button></div></section>
      <section className="panel"><h2>Tree and planner tools</h2><label>Keys (comma separated)<input value={keys} onChange={(e) => setKeys(e.target.value)} /></label><div className="actions"><button onClick={() => run('tree-traversal')}>BST traversals</button><button onClick={() => run('avl')}>AVL tree</button><button onClick={() => run('red-black-tree/search')}>Red-black search</button><button onClick={() => run('knapsack')}>Run study planner</button></div></section></div>
    <section className="panel algorithm-output"><h2>Verified output</h2><pre>{result || 'Choose an algorithm to see its output.'}</pre></section></>;
}

function FacultyHome() {
  const [items, setItems] = useState([]); const [assignments, setAssignments] = useState([]); const [form, setForm] = useState({ title: '', subject: '', description: '', dueDate: '' }); const [message, setMessage] = useState('');
  const load = () => Promise.all([api('/resources/manage'), api('/assignments')]).then(([resources, ownAssignments]) => { setItems(resources); setAssignments(ownAssignments); }).catch((e) => setMessage(e.message));
  useEffect(load, []);
  const create = async (e) => { e.preventDefault(); try { await api('/assignments', { method: 'POST', body: JSON.stringify(form) }); setMessage('Assignment published.'); setForm({ title: '', subject: '', description: '', dueDate: '' }); } catch (error) { setMessage(error.message); } };
  const grade = async (assignmentId, studentId, gradeValue, feedback) => { try { await api(`/assignments/${assignmentId}/submissions/${studentId}`, { method: 'PATCH', body: JSON.stringify({ grade: Number(gradeValue), feedback }) }); setMessage('Submission graded successfully.'); load(); } catch (e) { setMessage(e.message); } };
  return <><section className="welcome compact"><p className="eyebrow">Teacher / Faculty module</p><h1>Manage your classroom.</h1><p className="lead">Share trusted resources and create clear assignments for your students.</p></section><div className="metric-grid"><div><b>{items.length}</b><span>Your resources</span></div><div><b>{items.filter((x) => x.status === 'approved').length}</b><span>Published</span></div><div><b>{items.filter((x) => x.status === 'pending').length}</b><span>Awaiting review</span></div><div><b>{assignments.length}</b><span>Assignments</span></div></div><section className="two-column"><div className="panel"><h2>Create assignment</h2><form onSubmit={create}><label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label>Subject<input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></label><label>Due date<input required type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label><label>Instructions<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><button className="button">Publish assignment</button></form></div><div className="panel"><h2>Resource status</h2>{items.map((x) => <div className="list-item" key={x._id}><div><b>{x.title}</b><p>{x.subject}</p></div><span className={`status status-${x.status}`}>{x.status}</span></div>)}{!items.length && <p className="muted">Use “Add resource” to share your first item.</p>}</div></section>{message && <p className="notice">{message}</p>}<section className="section"><h2>Student submissions</h2>{assignments.map((assignment) => <article className="panel" key={assignment._id}><h3>{assignment.title}</h3>{assignment.submissions?.length ? assignment.submissions.map((submission) => <div className="submission" key={submission.student}><p><b>{submission.student?.name || 'Student'}</b>: {submission.answer}</p><form onSubmit={(e) => { e.preventDefault(); grade(assignment._id, submission.student?._id || submission.student, e.currentTarget.grade.value, e.currentTarget.feedback.value); }}><input name="grade" type="number" min="0" max="100" defaultValue={submission.grade ?? ''} placeholder="Grade / 100" required /><input name="feedback" defaultValue={submission.feedback || ''} placeholder="Feedback" /><button>Save grade</button></form></div>) : <p className="muted">No submissions yet.</p>}</article>)}{!assignments.length && <div className="empty">Create an assignment to receive submissions.</div>}</section></>;
}

function AdminHome() {
  const [overview, setOverview] = useState({}); const [items, setItems] = useState([]); const [message, setMessage] = useState('');
  const load = () => Promise.all([api('/admin/overview'), api('/resources/manage')]).then(([o, r]) => { setOverview(o); setItems(r); }).catch((e) => setMessage(e.message));
  useEffect(load, []);
  const review = async (id, status) => { try { await api(`/resources/${id}/review`, { method: 'PATCH', body: JSON.stringify({ status }) }); load(); } catch (e) { setMessage(e.message); } };
  return <><section className="welcome compact"><p className="eyebrow">Admin module</p><h1>Keep the learning network healthy.</h1><p className="lead">Review submissions, monitor platform activity and keep access under control.</p></section><div className="metric-grid">{[['students', 'Students'], ['faculty', 'Faculty'], ['resources', 'All resources'], ['assignments', 'Assignments']].map(([key, label]) => <div key={key}><b>{overview[key] ?? '—'}</b><span>{label}</span></div>)}</div><section className="panel"><div className="section-heading"><h2>Review queue</h2><span className="badge">{overview.pendingResources || 0} pending</span></div>{message && <p className="error">{message}</p>}{items.filter((x) => x.status === 'pending').map((item) => <div className="review-row" key={item._id}><div><b>{item.title}</b><p>{item.subject} · Submitted by {item.submittedBy?.name || 'faculty'}</p></div><div className="actions"><button onClick={() => review(item._id, 'approved')}>Approve</button><button className="danger" onClick={() => review(item._id, 'rejected')}>Reject</button></div></div>)}{!items.some((x) => x.status === 'pending') && <div className="empty">Review queue is clear.</div>}</section></>;
}

function App() {
  const [session, setSession] = useState(getSession());
  if (!session) return <Login onLogin={setSession} />;
  const logout = () => { localStorage.removeItem('edushare-session'); setSession(null); };
  const home = session.user.role === 'student' ? <StudentHome /> : session.user.role === 'faculty' ? <FacultyHome /> : <AdminHome />;
  return <Layout session={session} onLogout={logout}><Routes><Route path="/" element={home} /><Route path="/student" element={<StudentHome />} /><Route path="/faculty" element={<FacultyHome />} /><Route path="/admin" element={<AdminHome />} /><Route path="/resources" element={<Resources />} /><Route path="/resources/new" element={<ResourceForm />} /><Route path="/assignments" element={<Assignments />} /><Route path="/algorithms" element={<Algorithms />} /><Route path="*" element={<Navigate to="/" />} /></Routes></Layout>;
}
createRoot(document.getElementById('root')).render(<BrowserRouter><App /></BrowserRouter>);
