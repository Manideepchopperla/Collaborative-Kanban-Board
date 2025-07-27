// 部屋 NEW
import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Untitled Board'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Tasks are now embedded within the board document
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }]
}, {
  timestamps: true
});

export default mongoose.model('Board', boardSchema);