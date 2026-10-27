import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
const port = process.env.PORT || 5001;
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/education_resources')
  .then(() => app.listen(port, () => console.log(`API listening on ${port}`)))
  .catch((err) => { console.error('MongoDB connection failed:', err.message); process.exitCode = 1; });
