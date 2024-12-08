import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import appointmentsRoutes from './routes/appointments.js';
import prescriptionsRoutes from './routes/prescriptions.js';
import healthRecordsRoutes from './routes/healthRecords.js';
import doctorsRoutes from './routes/doctors.js';
import messageRoutes from './routes/messages.js';
import queueRoutes from './routes/queue.js';
import symptomCheckerRoutes from './routes/symptomChecker.js';
import paymentsRoutes from './routes/payments.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/patient-panel', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/health-records', healthRecordsRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/symptom-checker', symptomCheckerRoutes);
app.use('/api/payments', paymentsRoutes);

// Special middleware for Stripe webhooks
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-queue', (appointmentId) => {
    socket.join(`queue-${appointmentId}`);
  });

  socket.on('queue-update', (data) => {
    io.to(`queue-${data.appointmentId}`).emit('queue-position', data);
  });

  socket.on('join-chat', (roomId) => {
    socket.join(`chat-${roomId}`);
  });

  socket.on('chat-message', (data) => {
    io.to(`chat-${data.roomId}`).emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});