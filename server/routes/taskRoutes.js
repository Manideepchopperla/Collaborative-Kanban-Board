import express from 'express';
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  dragDropTask,
  smartAssignTask,
  resolveConflict
} from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks
router.get('/', authenticateToken, getAllTasks);

// Create a new task
router.post('/', authenticateToken, createTask);

// Update an existing task
router.put('/:id', authenticateToken, updateTask);

// Delete a task
router.delete('/:id', authenticateToken, deleteTask);

// Drag and drop task to change status
router.put('/drag-drop/:id', authenticateToken, dragDropTask);

// Smart assign a task to the least busy user
router.put('/smart-assign/:id', authenticateToken, smartAssignTask);

// Resolve conflicts for a task
router.put('/resolve-conflict/:id', authenticateToken, resolveConflict);

export default router;
