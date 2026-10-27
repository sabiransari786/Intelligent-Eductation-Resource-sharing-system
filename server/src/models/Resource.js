import mongoose from 'mongoose';
const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  resourceType: { type: String, enum: ['Note', 'PDF', 'Lecture', 'Assignment', 'E-book', 'Reference'], required: true },
  department: { type: String, default: 'Computer Science', trim: true },
  course: { type: String, default: 'B.Tech CSE', trim: true },
  subject: { type: String, required: true, trim: true },
  semester: { type: String, default: '' }, unit: { type: String, default: '' }, topic: { type: String, default: '' },
  tags: { type: [String], default: [] }, sourceUrl: { type: String, match: /^https?:\/\/\S+$/ },
  estimatedStudyMinutes: { type: Number, required: true, min: 0, validate: Number.isInteger },
  usefulnessScore: { type: Number, required: true, min: 0, max: 10, validate: Number.isInteger },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNote: { type: String, default: '' }
}, { timestamps: true });
export default mongoose.model('Resource', resourceSchema);
