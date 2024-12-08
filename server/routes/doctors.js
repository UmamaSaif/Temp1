import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

const router = express.Router();

// Get all doctors
router.get('/', auth, async (req, res) => {
  try {
    const doctors = await User.aggregate([
      { $match: { role: 'doctor' } },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: 'user',
          as: 'doctorInfo'
        }
      },
      { $unwind: '$doctorInfo' },
      {
        $project: {
          _id: 1,
          name: 1,
          specialty: '$doctorInfo.specialty',
          consultationFee: '$doctorInfo.consultationFee',
          qualifications: '$doctorInfo.qualifications',
          experience: '$doctorInfo.experience',
          rating: '$doctorInfo.rating'
        }
      }
    ]);

    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

// Search doctors with advanced filtering
router.get('/search', auth, async (req, res) => {
  try {
    const { name, specialty, availableDate } = req.query;
    
    const matchQuery = { role: 'doctor' };
    
    if (name) {
      matchQuery.name = { $regex: name, $options: 'i' };
    }

    const doctors = await User.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: 'user',
          as: 'doctorInfo'
        }
      },
      { $unwind: '$doctorInfo' },
      {
        $match: specialty ? {
          'doctorInfo.specialty': { $regex: specialty, $options: 'i' }
        } : {}
      },
      {
        $project: {
          _id: 1,
          name: 1,
          specialty: '$doctorInfo.specialty',
          consultationFee: '$doctorInfo.consultationFee',
          qualifications: '$doctorInfo.qualifications',
          experience: '$doctorInfo.experience',
          rating: '$doctorInfo.rating',
          availability: '$doctorInfo.availability'
        }
      }
    ]);

    // Filter by availability if date is provided
    let filteredDoctors = doctors;
    if (availableDate) {
      const queryDate = new Date(availableDate).toISOString().split('T')[0];
      filteredDoctors = doctors.filter(doctor => {
        return doctor.availability?.some(slot => {
          const slotDate = new Date(slot.date).toISOString().split('T')[0];
          return slotDate === queryDate && slot.slots.some(time => !time.isBooked);
        });
      });
    }

    res.json(filteredDoctors);
  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({ message: 'Error searching doctors' });
  }
});

// Get doctor's availability
router.get('/:id/availability', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const doctor = await Doctor.findOne({ user: req.params.id })
      .select('availability');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    let availability = doctor.availability || [];
    if (date) {
      const queryDate = new Date(date).toISOString().split('T')[0];
      availability = availability.filter(slot => {
        const slotDate = new Date(slot.date).toISOString().split('T')[0];
        return slotDate === queryDate;
      });
    }

    res.json(availability);
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    res.status(500).json({ message: 'Error fetching doctor availability' });
  }
});

export default router;