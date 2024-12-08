import mongoose from 'mongoose';

const healthRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['diagnosis', 'treatment', 'weight', 'blood_pressure', 'heart_rate'],
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: String,
  status: {
    type: String,
    enum: ['active', 'resolved', 'ongoing'],
    default: 'active'
  }
}, {
  timestamps: true
});

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);
export default HealthRecord;