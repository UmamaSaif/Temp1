import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
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
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  medications: [{
    name: { 
      type: String, 
      required: true 
    },
    dosage: { 
      type: String, 
      required: true 
    },
    frequency: { 
      type: String, 
      required: true 
    },
    duration: { 
      type: String, 
      required: true 
    },
    instructions: String
  }],
  generalInstructions: String,
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;