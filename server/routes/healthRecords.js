import express from 'express';
import auth from '../middleware/auth.js';
import HealthRecord from '../models/HealthRecord.js';

const router = express.Router();

// Get all health records for the authenticated patient
router.get('/', auth, async (req, res) => {
  try {
    const records = await HealthRecord.find({ patient: req.user._id })
      .populate('doctor', 'name specialty')
      .sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching health records' });
  }
});

// Get health statistics for charts
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await HealthRecord.find(
      { 
        patient: req.user._id,
        type: { $in: ['weight', 'blood_pressure', 'heart_rate'] }
      }
    )
    .sort({ date: 1 })
    .limit(10);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching health statistics' });
  }
});

// Add new health record (for doctors only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can create health records' });
    }

    const record = new HealthRecord({
      ...req.body,
      doctor: req.user._id
    });
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Error creating health record' });
  }
});

export default router;
