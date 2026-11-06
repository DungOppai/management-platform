require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const db = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const chatRoutes = require('./routes/chat.routes');
const aiRoutes = require('./routes/ai.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
const server = http.createServer(app);

// Enable CORS
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
app.use(cors({
  origin: (origin, callback) => {
    // allow all origins in dev or matching origins
    callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware to inject io into req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'pm-ai-backend',
    version: '1.0.0',
    mode: process.env.NODE_ENV || 'development',
  });
});

// Socket.io Realtime event handling
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('join_project', (projectId) => {
    socket.join(`project_${projectId}`);
    console.log(`[Socket.io] Client ${socket.id} joined room: project_${projectId}`);
  });

  socket.on('leave_project', (projectId) => {
    socket.leave(`project_${projectId}`);
    console.log(`[Socket.io] Client ${socket.id} left room: project_${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

// Initialize Database and Start Server
async function startServer() {
  try {
    await db.initDB();
    console.log('✅ PostgreSQL database connected and tables initialized.');
  } catch (err) {
    console.error('⚠️ Could not connect to PostgreSQL immediately:', err.message);
    console.log('Backend will retry on requests or wait for Docker PostgreSQL container.');
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 PM AI Platform Backend running on port ${PORT}`);
    console.log(`👉 Health check: http://localhost:${PORT}/health`);
    console.log(`👉 Ready for Docker and Local Development`);
    console.log(`=======================================================`);
  });
}

startServer();
