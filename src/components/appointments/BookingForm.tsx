import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Autocomplete
} from '@mui/material';
import { Doctor } from '../../types/doctor';
import { BookingFormData } from '../../types/appointment';

interface BookingFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => void;
  doctors: Doctor[];
  formData: BookingFormData;
  onFormChange: (data: BookingFormData) => void;
  selectedDoctor: Doctor | null;
  onDoctorChange: (doctor: Doctor | null) => void;
}

export default function BookingForm({
  open,
  onClose,
  onSubmit,
  doctors,
  formData,
  onFormChange,
  selectedDoctor,
  onDoctorChange
}: BookingFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Book New Appointment</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={doctors}
                getOptionLabel={(doctor) => 
                  `Dr. ${doctor.name} - ${doctor.specialty} ($${doctor.consultationFee})`
                }
                value={selectedDoctor}
                onChange={(_, newValue) => {
                  onDoctorChange(newValue);
                  onFormChange({
                    ...formData,
                    doctorId: newValue?._id || ''
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Doctor"
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Date & Time"
                value={formData.date}
                onChange={(e) => onFormChange({ ...formData, date: e.target.value })}
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
                onChange={(e) => onFormChange({ 
                  ...formData, 
                  consultationType: e.target.value 
                })}
                required
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
                onChange={(e) => onFormChange({ ...formData, symptoms: e.target.value })}
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
                onChange={(e) => onFormChange({ 
                  ...formData, 
                  additionalDetails: e.target.value 
                })}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Proceed to Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
}