import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  estimatedWaitTime: {
    type: Number, // in minutes
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed', 'cancelled'],
    default: 'waiting'
  },
  startTime: Date,
  endTime: Date
}, {
  timestamps: true
});

export default mongoose.model('Queue', queueSchema);
