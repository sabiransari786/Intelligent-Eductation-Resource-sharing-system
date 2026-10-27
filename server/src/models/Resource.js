import mongoose from 'mongoose';
const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  resourceType: { type: String, enum: ['Note', 'PDF', 'Lecture', 'Assignment', 'E-book', 'Reference'], required: true },
  subject: { type: String, required: true, trim: true },
  semester: { type: String, default: '' }, unit: { type: String, default: '' }, topic: { type: String, default: '' },
  tags: { type: [String], default: [] }, sourceUrl: { type: String, match: /^https?:\/\/\S+$/ },
  estimatedStudyMinutes: { type: Number, required: true, min: 0, validate: Number.isInteger },
  usefulnessScore: { type: Number, required: true, min: 0, validate: Number.isInteger }
}, { timestamps: true });
export default mongoose.model('Resource', resourceSchema);
