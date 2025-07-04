import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticateSocket, authenticateToken } from './middleware/auth.js';
import { setupSocket } from './utils/socket.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import db from './config/database.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});


db.connect()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });


// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO connection handling
io.use(authenticateSocket(process.env.JWT_SECRET || 'your-secret-key-change-in-production'));
setupSocket(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.get('/api/logs/recent', authenticateToken, async (req, res) => {
  try {
    const logs = await db.getRecentLogs(20);
    res.json(logs);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
