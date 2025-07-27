
import express from 'express';
import { getRecentLogsForBoard } from '../controllers/logController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get recent logs for a specific board
router.get('/:boardId/recent', authenticateToken, getRecentLogsForBoard);

export default router;