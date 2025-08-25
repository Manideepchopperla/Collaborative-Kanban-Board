import express from 'express';
import { getRecentMessages } from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:boardId/recent', authenticateToken, getRecentMessages);

export default router;