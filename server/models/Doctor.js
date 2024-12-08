import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  date: Date,
  slots: [{
    time: String,
    isBooked: {
      type: Boolean,
      default: false
    }
  }]
});

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialty: {
    type: String,
    required: true
  },
  qualifications: [String],
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
  availability: [availabilitySchema],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Doctor', doctorSchema);