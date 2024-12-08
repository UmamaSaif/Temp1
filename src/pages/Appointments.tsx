import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Paper,
  Autocomplete,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from 'axios';
import PaymentModal from '../components/PaymentModel';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTime } from '../utils/dateUtils';

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  consultationFee: number;
}

interface Appointment {
  _id: string;
  doctor: Doctor;
  date: string;
  status: string;
  queueNumber: number;
  consultationType: string;
  paymentStatus: string;
  paymentMethod: string;
  symptoms: string;
}

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [searchCriteria, setSearchCriteria] = useState({
    name: '',
    specialty: '',
    availableDate: '',
    availableTime: ''
  });
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    symptoms: '',
    consultationType: 'in-person',
    additionalDetails: ''
  });
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [pendingAppointment, setPendingAppointment] = useState<any>(null);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors(); // Fetch doctors when component mounts
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showSnackbar('Error fetching appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      showSnackbar('Error fetching doctors', 'error');
    }
  };

  const searchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/doctors/search', {
        params: searchCriteria
      });
      setDoctors(response.data);
      if (response.data.length === 0) {
        showSnackbar('No doctors found matching your criteria', 'error');
      }
    } catch (error) {
      console.error('Error searching doctors:', error);
      showSnackbar('Error searching doctors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor || !formData.date || !formData.symptoms) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    const appointmentData = {
      doctorId: selectedDoctor._id,
      date: formData.date,
      symptoms: formData.symptoms,
      consultationType: formData.consultationType,
      additionalDetails: formData.additionalDetails,
      consultationFee: selectedDoctor.consultationFee,
      doctor: selectedDoctor
    };

    setPendingAppointment(appointmentData);
    setOpenDialog(false);
    setOpenPaymentModal(true);
  };

  const handlePaymentComplete = async () => {
    try {
      await fetchAppointments();
      showSnackbar('Appointment booked successfully', 'success');
      setPendingAppointment(null);
      resetForm();
      setOpenPaymentModal(false);
    } catch (error) {
      console.error('Error after payment completion:', error);
      showSnackbar('Error finalizing appointment', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      doctorId: '',
      date: '',
      symptoms: '',
      consultationType: 'in-person',
      additionalDetails: ''
    });
    setSelectedDoctor(null);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const columns: GridColDef[] = [
    {
      field: 'doctor',
      headerName: 'Doctor',
      flex: 1,
      valueGetter: (params) => params.row.doctor?.name || 'N/A'
    },
    {
      field: 'date',
      headerName: 'Date & Time',
      flex: 1,
      valueGetter: (params) => formatDateTime(params.row.date)
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      valueGetter: (params) => params.row.status.charAt(0).toUpperCase() + params.row.status.slice(1)
    },
    {
      field: 'paymentStatus',
      headerName: 'Payment Status',
      flex: 1,
      valueGetter: (params) => params.row.paymentStatus.charAt(0).toUpperCase() + params.row.paymentStatus.slice(1)
    },
    {
      field: 'consultationType',
      headerName: 'Type',
      flex: 1,
      valueGetter: (params) => params.row.consultationType.charAt(0).toUpperCase() + params.row.consultationType.slice(1)
    },
    {
      field: 'queueNumber',
      headerName: 'Queue Number',
      flex: 1
    }
  ];

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">Appointments</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenDialog(true)}
            >
              Book New Appointment
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Find a Doctor
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Doctor Name"
                  value={searchCriteria.name}
                  onChange={(e) => setSearchCriteria({
                    ...searchCriteria,
                    name: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Specialty"
                  value={searchCriteria.specialty}
                  onChange={(e) => setSearchCriteria({
                    ...searchCriteria,
                    specialty: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Available Date"
                  InputLabelProps={{ shrink: true }}
                  value={searchCriteria.availableDate}
                  onChange={(e) => setSearchCriteria({
                    ...searchCriteria,
                    availableDate: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={searchDoctors}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Search Doctors'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ height: 400 }}>
            <DataGrid
              rows={appointments}
              columns={columns}
              getRowId={(row) => row._id}
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
              }}
              loading={loading}
            />
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Book New Appointment</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  options={doctors}
                  getOptionLabel={(doctor) => `Dr. ${doctor.name} - ${doctor.specialty} ($${doctor.consultationFee})`}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Doctor"
                      required
                      fullWidth
                    />
                  )}
                  value={selectedDoctor}
                  onChange={(_, newValue) => {
                    setSelectedDoctor(newValue);
                    if (newValue) {
                      setFormData({ ...formData, doctorId: newValue._id });
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Date & Time"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Proceed to Payment
          </Button>
        </DialogActions>
      </Dialog>

      <PaymentModal
        open={openPaymentModal}
        onClose={() => setOpenPaymentModal(false)}
        appointmentData={pendingAppointment}
        onPaymentComplete={handlePaymentComplete}
      />

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}