import 'dotenv/config';
import mongoose from 'mongoose';
import Resource from './models/Resource.js';
const resources = [
  { title: 'BST Fundamentals', description: 'Insertion, search and traversal notes.', resourceType: 'Note', subject: 'Data Structures and Algorithms', semester: '4', unit: 'Trees', topic: 'Binary Search Tree', tags: ['bst', 'trees'], estimatedStudyMinutes: 45, usefulnessScore: 9, sourceUrl: 'https://developer.mozilla.org/' },
  { title: 'Graph Algorithms Lecture', description: 'BFS, DFS and shortest paths.', resourceType: 'Lecture', subject: 'Data Structures and Algorithms', semester: '4', unit: 'Graphs', topic: 'Graph Traversal', tags: ['graphs', 'bfs', 'dfs'], estimatedStudyMinutes: 60, usefulnessScore: 10, sourceUrl: 'https://www.khanacademy.org/' },
  { title: 'Database Normalization', description: 'A practical DBMS reference.', resourceType: 'Reference', subject: 'DBMS', semester: '4', unit: 'Design', topic: 'Normalization', tags: ['dbms'], estimatedStudyMinutes: 30, usefulnessScore: 7, sourceUrl: 'https://www.mongodb.com/docs/' },
  { title: 'Operating Systems Scheduling', description: 'CPU scheduling algorithms.', resourceType: 'PDF', subject: 'Operating Systems', semester: '4', unit: 'Processes', topic: 'Scheduling', tags: ['os'], estimatedStudyMinutes: 40, usefulnessScore: 8, sourceUrl: 'https://pages.cs.wisc.edu/' }
];
await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/education_resources');
await Promise.all(resources.map((resource) => Resource.updateOne({ title: resource.title }, { $set: resource }, { upsert: true })));
console.log(`Seeded ${resources.length} resources`);
await mongoose.disconnect();
