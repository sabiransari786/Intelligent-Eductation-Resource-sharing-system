import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  subject: { type: String, required: true, trim: true },
  dueDate: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answer: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now },
    grade: { type: Number, min: 0, max: 100 },
    feedback: { type: String, default: '' }
  }]
}, { timestamps: true });

export default mongoose.model('Assignment', assignmentSchema);
