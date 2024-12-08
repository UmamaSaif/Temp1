import express from 'express';
import auth from '../middleware/auth.js';
import Queue from '../models/Queue.js';
import Appointment from '../models/Appointment.js';

const router = express.Router();

// Get current queue position for an appointment
router.get('/:appointmentId', auth, async (req, res) => {
  try {
    const queue = await Queue.findOne({
      appointment: req.params.appointmentId,
      status: { $in: ['waiting', 'in-progress'] }
    }).populate('appointment');

    if (!queue) {
      return res.status(404).json({ message: 'Queue position not found' });
    }

    // Verify the appointment belongs to the authenticated user
    if (queue.appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({
      position: queue.position,
      estimatedWaitTime: queue.estimatedWaitTime,
      status: queue.status
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching queue position' });
  }
});

// Update queue position (for doctors/staff only)
router.patch('/:appointmentId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { position, estimatedWaitTime, status } = req.body;
    const queue = await Queue.findOneAndUpdate(
      { appointment: req.params.appointmentId },
      { position, estimatedWaitTime, status },
      { new: true }
    );

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    // Emit socket event for real-time updates
    req.app.get('io').to(`queue-${req.params.appointmentId}`).emit('queue-update', {
      position: queue.position,
      estimatedWaitTime: queue.estimatedWaitTime,
      status: queue.status
    });

    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: 'Error updating queue position' });
  }
});

export default router;
