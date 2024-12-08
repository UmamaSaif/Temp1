import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  Autocomplete
} from '@mui/material';
import { Doctor } from '../../types/doctor';

interface AppointmentFormProps {
  open: boolean;
  onClose: () => void;
  doctors: Doctor[];
  formData: {
    doctorId: string;
    date: string;
    symptoms: string;
    consultationType: string;
    additionalDetails: string;
  };
  selectedDoctor: Doctor | null;
  onFormChange: (field: string, value: string) => void;
  onDoctorSelect: (doctor: Doctor | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AppointmentForm({
  open,
  onClose,
  doctors,
  formData,
  selectedDoctor,
  onFormChange,
  onDoctorSelect,
  onSubmit
}: AppointmentFormProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Book New Appointment</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Autocomplete
              options={doctors}
              getOptionLabel={(doctor) => 
                `Dr. ${doctor.name} - ${doctor.specialty} ($${doctor.consultationFee})`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Doctor"
                  required
                  fullWidth
                />
              )}
              value={selectedDoctor}
              onChange={(_, newValue) => onDoctorSelect(newValue)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Date & Time"
              value={formData.date}
              onChange={(e) => onFormChange('date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Consultation Type"
              value={formData.consultationType}
              onChange={(e) => onFormChange('consultationType', e.target.value)}
            >
              <MenuItem value="in-person">In-Person</MenuItem>
              <MenuItem value="video">Video Consultation</MenuItem>
              <MenuItem value="phone">Phone Consultation</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Symptoms"
              value={formData.symptoms}
              onChange={(e) => onFormChange('symptoms', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Additional Details (Optional)"
              value={formData.additionalDetails}
              onChange={(e) => onFormChange('additionalDetails', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" color="primary">
          Proceed to Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
}