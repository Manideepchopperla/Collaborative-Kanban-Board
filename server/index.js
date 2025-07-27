import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticateSocket } from './middleware/auth.js';
import { setupSocket } from './utils/socket.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import boardRoutes from './routes/boardRoutes.js'; // 部屋 NEW: Import board routes
import logRoutes from './routes/logRoutes.js'; // 部屋 NEW: Import log routes
import db from './config/database.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

db.connect()
  .then(() => console.log('Database connected successfully'))
  .catch((error) => console.error('Database connection error:', error));

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO setup
// We pass `io` to setupSocket so it can be used globally in controllers
setupSocket(io);
// Authenticate socket connections
io.use(authenticateSocket(process.env.JWT_SECRET || 'your-secret-key-change-in-production'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/boards', boardRoutes); // 部屋 NEW: Use board routes
app.use('/api/logs', logRoutes); // 部屋 NEW: Use log routes


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});