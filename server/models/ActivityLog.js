import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  boardId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  actionType: {
    type: String,
    enum: ['created', 'updated', 'deleted', 'moved', 'assigned'],
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  taskTitle: {
    type: String
  },
  additionalInfo: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('ActivityLog', activityLogSchema);