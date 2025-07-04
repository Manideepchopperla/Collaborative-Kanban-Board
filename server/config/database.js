import mongoose from 'mongoose';
import User from '../models/User.js';
import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';

const Database = () => {
  const connect = async () => {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/collaborative-todo';
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
  };

  const createUser  = async (userData) => {
    try {
      const user = new User(userData);
      await user.save();
      return { id: user._id, username: user.username, email: user.email };
    } catch (error) {
      throw error;
    }
  };

  const getUserByEmail = async (email) => {
    try {
      return await User.findOne({ email });
    } catch (error) {
      throw error;
    }
  };

  const getAllUsers = async () => {
    try {
      return await User.find({}, 'username email');
    } catch (error) {
      throw error;
    }
  };

  // Task methods
  const createTask = async (taskData) => {
    try {
      const task = new Task(taskData);
      await task.save();
      return {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        createdBy: task.createdBy,
        createdAt: task.createdAt,
        lastUpdated: task.updatedAt,
        version: task.version
      };
    } catch (error) {
      throw error;
    }
  };

  const getAllTasks = async () => {
    try {
      const tasks = await Task.find({}).sort({ createdAt: -1 });
      return tasks.map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        createdBy: task.createdBy,
        createdAt: task.createdAt,
        lastUpdated: task.updatedAt,
        version: task.version
      }));
    } catch (error) {
      throw error;
    }
  };

  const getTaskById = async (id) => {
    try {
      const task = await Task.findById(id);
      if (!task) return null;
      return {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        createdBy: task.createdBy,
        createdAt: task.createdAt,
        lastUpdated: task.updatedAt,
        version: task.version
      };
    } catch (error) {
      throw error;
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const { version, ...safeUpdates } = updates;
      const task = await Task.findByIdAndUpdate(
        id,
        { 
          ...safeUpdates,
          $inc: { version: 1 }
        },
        { new: true }
      );
      if (!task) return null;
      return {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        createdBy: task.createdBy,
        createdAt: task.createdAt,
        lastUpdated: task.updatedAt,
        version: task.version
      };
    } catch (error) {
      throw error;
    }
  };

  const deleteTask = async (id) => {
    try {
      await Task.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  };

  // Activity log methods
  const createLog = async (logData) => {
    try {
      const log = new ActivityLog(logData);
      await log.save();
      return {
        id: log._id,
        userId: log.userId,
        username: log.username,
        actionType: log.actionType,
        taskId: log.taskId,
        taskTitle: log.taskTitle,
        additionalInfo: log.additionalInfo,
        timestamp: log.createdAt
      };
    } catch (error) {
      throw error;
    }
  };

  const getRecentLogs = async (limit = 20) => {
    try {
      const logs = await ActivityLog.find({})
        .sort({ createdAt: -1 })
        .limit(limit);
      return logs.map(log => ({
        id: log._id,
        userId: log.userId,
        username: log.username,
        actionType: log.actionType,
        taskId: log.taskId,
        taskTitle: log.taskTitle,
        additionalInfo: log.additionalInfo,
        timestamp: log.createdAt
      }));
    } catch (error) {
      throw error;
    }
  };

  const getLatestLog = async () => {
    try {
      const log = await ActivityLog.findOne({}).sort({ createdAt: -1 });
      if (!log) return null;
      return {
        id: log._id,
        userId: log.userId,
        username: log.username,
        actionType: log.actionType,
        taskId: log.taskId,
        taskTitle: log.taskTitle,
        additionalInfo: log.additionalInfo,
        timestamp: log.createdAt
      };
    } catch (error) {
      throw error;
    }
  };

  return {
    connect,
    createUser ,
    getUserByEmail,
    getAllUsers,
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    createLog,
    getRecentLogs,
    getLatestLog
  };
};

const db = Database();
export default db;

