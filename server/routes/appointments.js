import express from 'express';
import auth from '../middleware/auth.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js'; // Assuming you have a User model

const router = express.Router();

// Search doctors with advanced filtering
router.get('/doctors/search', auth, async (req, res) => {
  try {
    const { 
      name, 
      specialty, 
      availableDate, 
      availableTime 
    } = req.query;

    // Build dynamic search query
    const searchQuery = {};
    
    // Name filter (case-insensitive partial match)
    if (name) {
      searchQuery.name = { $regex: name, $options: 'i' };
    }

    // Specialty filter
    if (specialty) {
      searchQuery.specialty = { $regex: specialty, $options: 'i' };
    }

    // Find doctors matching the search criteria
    const doctors = await User.find({
      ...searchQuery,
      role: 'doctor' // Assuming doctors have a specific role
    }).select('name specialty availability');

    // If availability date/time is specified, filter further
    const availableDoctors = doctors.filter(doctor => {
      // Additional availability checking logic
      // This would typically involve checking the doctor's schedule
      // For simplicity, we'll do a basic check
      if (availableDate && availableTime) {
        return doctor.availability && 
               doctor.availability.some(slot => 
                 slot.date === availableDate && 
                 slot.times.includes(availableTime)
               );
      }
      return true;
    });

    res.json(availableDoctors);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error searching for doctors', 
      error: error.message 
    });
  }
});

// Get all appointments for the authenticated patient
router.get('/', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name specialty')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// Get upcoming appointments
router.get('/upcoming', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user._id,
      date: { $gte: new Date() },
      status: 'scheduled'
    })
      .populate('doctor', 'name specialty')
      .sort({ date: 1 })
      .limit(5);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching upcoming appointments' });
  }
});

// Enhanced appointment booking with more validation and details
router.post('/', auth, async (req, res) => {
  try {
    const { 
      doctorId, 
      date, 
      symptoms, 
      additionalDetails 
    } = req.body;

    // Validate input
    if (!doctorId || !date) {
      return res.status(400).json({ 
        message: 'Doctor ID and date are required' 
      });
    }

    // Check doctor existence and availability
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ 
        message: 'Doctor not found' 
      });
    }

    // Check for existing appointments at the same time
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({ 
        message: 'This time slot is already booked' 
      });
    }

    // Create new appointment with enhanced details
    const appointment = new Appointment({
      patient: req.user._id,
      doctor: doctorId,
      date,
      symptoms: symptoms || '',
      notes: additionalDetails || '',
      queueNumber: await generateUniqueQueueNumber(doctorId, date)
    });

    await appointment.save();

    // Populate doctor details for response
    await appointment.populate('doctor', 'name specialty');

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating appointment', 
      error: error.message 
    });
  }
});

// Generate unique queue number for a specific doctor and date
async function generateUniqueQueueNumber(doctorId, date) {
  // Find existing appointments for the same doctor and date
  const existingAppointments = await Appointment.find({
    doctor: doctorId,
    date: new Date(date),
    status: { $ne: 'cancelled' }
  });

  // Generate queue number ensuring no duplicates
  const usedNumbers = existingAppointments.map(a => a.queueNumber);
  let queueNumber;

  do {
    queueNumber = Math.floor(Math.random() * 100) + 1;
  } while (usedNumbers.includes(queueNumber));

  return queueNumber;
}

// Update appointment status or details
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status, symptoms, notes } = req.body;
    
    // Prepare update object
    const updateFields = {};
    if (status) updateFields.status = status;
    if (symptoms) updateFields.symptoms = symptoms;
    if (notes) updateFields.notes = notes;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patient: req.user._id },
      updateFields,
      { new: true }
    ).populate('doctor', 'name specialty');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating appointment', 
      error: error.message 
    });
  }
});

export default router;