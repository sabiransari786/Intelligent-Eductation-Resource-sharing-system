import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Resource from './models/Resource.js';
import User from './models/User.js';
import Assignment from './models/Assignment.js';
const resources = [
  { title: 'BST Fundamentals', description: 'Insertion, search and traversal notes.', resourceType: 'Note', department: 'Computer Science', course: 'B.Tech CSE', subject: 'Data Structures and Algorithms', semester: '4', unit: 'Trees', topic: 'Binary Search Tree', tags: ['bst', 'trees'], estimatedStudyMinutes: 45, usefulnessScore: 9, sourceUrl: 'https://developer.mozilla.org/' },
  { title: 'Graph Algorithms Lecture', description: 'BFS, DFS and shortest paths.', resourceType: 'Lecture', department: 'Computer Science', course: 'B.Tech CSE', subject: 'Data Structures and Algorithms', semester: '4', unit: 'Graphs', topic: 'Graph Traversal', tags: ['graphs', 'bfs', 'dfs'], estimatedStudyMinutes: 60, usefulnessScore: 10, sourceUrl: 'https://www.khanacademy.org/' },
  { title: 'Dynamic Programming Patterns', description: 'Memoization, tabulation and practical optimization patterns.', resourceType: 'Note', department: 'Computer Science', course: 'B.Tech CSE', subject: 'Data Structures and Algorithms', semester: '4', unit: 'Dynamic Programming', topic: 'Optimization', tags: ['dp', 'algorithms'], estimatedStudyMinutes: 50, usefulnessScore: 9, sourceUrl: 'https://www.geeksforgeeks.org/dynamic-programming/' },
  { title: 'Operating Systems Processes', description: 'Processes, threads and context switching explained.', resourceType: 'Lecture', department: 'Computer Science', course: 'B.Tech CSE', subject: 'Operating Systems', semester: '4', unit: 'Processes', topic: 'Process Management', tags: ['os', 'processes'], estimatedStudyMinutes: 35, usefulnessScore: 8, sourceUrl: 'https://pages.cs.wisc.edu/~remzi/OSTEP/' },
  { title: 'Database Normalization', description: 'A practical DBMS reference.', resourceType: 'Reference', department: 'Computer Science', course: 'B.Tech CSE', subject: 'DBMS', semester: '4', unit: 'Design', topic: 'Normalization', tags: ['dbms'], estimatedStudyMinutes: 30, usefulnessScore: 7, sourceUrl: 'https://www.mongodb.com/docs/' },
  { title: 'SQL Query Practice', description: 'Hands-on SELECT, JOIN, GROUP BY and subquery exercises.', resourceType: 'Assignment', department: 'Computer Science', course: 'B.Tech CSE', subject: 'DBMS', semester: '4', unit: 'Query Processing', topic: 'SQL Queries', tags: ['sql', 'practice'], estimatedStudyMinutes: 40, usefulnessScore: 9, sourceUrl: 'https://sqlbolt.com/' },
  { title: 'Operating Systems Scheduling', description: 'CPU scheduling algorithms.', resourceType: 'PDF', department: 'Computer Science', course: 'B.Tech CSE', subject: 'Operating Systems', semester: '4', unit: 'Processes', topic: 'Scheduling', tags: ['os'], estimatedStudyMinutes: 40, usefulnessScore: 8, sourceUrl: 'https://pages.cs.wisc.edu/' }
];
await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/education_resources');
await Promise.all(resources.map((resource) => Resource.updateOne({ title: resource.title }, { $set: resource }, { upsert: true })));
const users = [
  { name: 'System Administrator', email: 'admin@edushare.local', password: 'Admin@123', role: 'admin' },
  { name: 'Demo Faculty', email: 'faculty@edushare.local', password: 'Faculty@123', role: 'faculty', department: 'Computer Science' },
  { name: 'Demo Student', email: 'student@edushare.local', password: 'Student@123', role: 'student', department: 'Computer Science', semester: '4', enrolledSubjects: ['Data Structures and Algorithms', 'DBMS'] }
];
await Promise.all(users.map(async (user) => {
  const { password, ...profile } = user;
  await User.updateOne({ email: user.email }, { $set: { ...profile, password: await bcrypt.hash(password, 10) } }, { upsert: true });
}));
const faculty = await User.findOne({ email: 'faculty@edushare.local' });
const student = await User.findOne({ email: 'student@edushare.local' });
await Resource.updateOne(
  { title: 'Pending Faculty Study Guide' },
  { $set: {
    title: 'Pending Faculty Study Guide',
    description: 'A new study guide waiting for administrator review.',
    resourceType: 'Note',
    department: 'Computer Science',
    course: 'B.Tech CSE',
    subject: 'Computer Networks',
    semester: '4',
    unit: 'Transport Layer',
    topic: 'Reliable Delivery',
    tags: ['networks', 'review'],
    estimatedStudyMinutes: 25,
    usefulnessScore: 8,
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP',
    status: 'pending',
    submittedBy: faculty._id
  } },
  { upsert: true }
);
const assignments = [
  {
    title: 'Implement a BST search',
    description: 'Explain the search operation and provide its time complexity.',
    subject: 'Data Structures and Algorithms',
    dueDate: new Date('2027-01-15'),
    createdBy: faculty._id
  },
  {
    title: 'Normalize a student database',
    description: 'Convert the provided student records into 3NF and explain each step.',
    subject: 'DBMS',
    dueDate: new Date('2027-01-22'),
    createdBy: faculty._id
  }
];
await Promise.all(assignments.map((assignment, index) => Assignment.updateOne(
  { title: assignment.title, createdBy: faculty._id },
  {
    $set: assignment,
    $setOnInsert: {
      submissions: index === 0 ? [{
        student: student._id,
        answer: 'BST search follows left or right child pointers based on comparison. Average complexity is O(log n), worst case O(n).',
        grade: 92,
        feedback: 'Clear explanation and correct complexity analysis.'
      }] : []
    }
  },
  { upsert: true }
)));
console.log(`Seeded ${resources.length + 1} resources and ${assignments.length} assignments`);
await mongoose.disconnect();
