import express from 'express';
import auth from '../middleware/auth.js';
import PDFDocument from 'pdfkit';
import Prescription from '../models/Prescription.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Get all prescriptions for the authenticated patient with additional filtering and pagination
router.get('/', auth, async (req, res) => {
  try {
    const { 
      status = 'active', 
      page = 1, 
      limit = 10, 
      sortBy = 'date', 
      sortOrder = 'desc' 
    } = req.query;

    const options = {
      patient: req.user._id,
      status
    };

    const sortOptions = { 
      [sortBy]: sortOrder === 'desc' ? -1 : 1 
    };

    const prescriptions = await Prescription.find(options)
      .populate('doctor', 'name specialty')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Prescription.countDocuments(options);

    res.json({
      prescriptions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPrescriptions: total
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching prescriptions', 
      error: error.message 
    });
  }
});

// Enhanced PDF generation with more detailed formatting
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      patient: req.user._id
    }).populate('doctor', 'name specialty');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${prescription._id}.pdf`);
    doc.pipe(res);

    // PDF Styling and Content
    doc
      .font('Helvetica-Bold')
      .fontSize(25)
      .text('Medical Prescription', { align: 'center' })
      .moveDown();

    doc
      .font('Helvetica')
      .fontSize(12)
      .text(`Doctor: Dr. ${prescription.doctor.name}`, { continued: true })
      .text(`Specialty: ${prescription.doctor.specialty}`)
      .text(`Date: ${prescription.date.toLocaleDateString()}`)
      .moveDown();

    doc
      .font('Helvetica-Bold')
      .text('Medications:', { underline: true });

    prescription.medications.forEach(med => {
      doc
        .font('Helvetica-Bold')
        .text(`• ${med.name}`, { continued: true })
        .font('Helvetica')
        .text(` - ${med.dosage}`)
        .text(`  Frequency: ${med.frequency}`)
        .text(`  Duration: ${med.duration}`)
        .moveDown(0.5);

      if (med.instructions) {
        doc.text(`  Special Instructions: ${med.instructions}`);
      }
    });

    doc
      .moveDown()
      .font('Helvetica-Bold')
      .text('General Instructions:', { underline: true })
      .font('Helvetica')
      .text(prescription.generalInstructions || 'No additional instructions');

    doc.end();
  } catch (error) {
    res.status(500).json({ 
      message: 'Error generating PDF', 
      error: error.message 
    });
  }
});
export default router;