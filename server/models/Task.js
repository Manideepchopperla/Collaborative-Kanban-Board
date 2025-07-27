import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  boardId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['todo', 'inprogress', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignedTo: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
}, {
  timestamps: true
});

// To prevent duplicate task titles within the same board
taskSchema.index({ boardId: 1, title: 1 }, { unique: true });

export default mongoose.model('Task', taskSchema);