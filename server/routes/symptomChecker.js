import express from 'express';
import auth from '../middleware/auth.js';

// Basic symptom checker endpoint
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    // This is a simplified example. In a real application,
    // you would integrate with a medical API or use a more sophisticated
    // symptom checking algorithm
    const conditions = analyzeSymptoms(symptoms);
    
    res.json(conditions);
  } catch (error) {
    res.status(500).json({ message: 'Error analyzing symptoms' });
  }
});

// Simple symptom analysis function
function analyzeSymptoms(symptoms) {
  const symptomsList = symptoms.toLowerCase();
  const conditions = [];

  // Basic pattern matching - this should be replaced with a proper medical API
  if (symptomsList.includes('headache')) {
    conditions.push({
      name: 'Tension Headache',
      probability: 0.7,
      description: 'Common headache caused by stress or tension'
    });
  }

  if (symptomsList.includes('fever')) {
    conditions.push({
      name: 'Common Cold',
      probability: 0.6,
      description: 'Viral infection with symptoms including fever and congestion'
    });
  }

  if (symptomsList.includes('cough')) {
    conditions.push({
      name: 'Upper Respiratory Infection',
      probability: 0.5,
      description: 'Infection affecting the upper respiratory tract'
    });
  }

  return conditions;
}

export default router;
