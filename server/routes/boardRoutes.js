
import express from 'express';
import { createBoard, getBoardById } from '../controllers/boardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createBoard);
router.get('/:id', authenticateToken, getBoardById);

export default router;