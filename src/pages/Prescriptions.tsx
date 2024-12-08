import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Download as DownloadIcon, FilterList as FilterIcon } from '@mui/icons-material';
import axios from 'axios';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface Prescription {
  _id: string;
  doctor: {
    name: string;
    specialty: string;
  };
  medications: Medication[];
  generalInstructions: string;
  date: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface PrescriptionResponse {
  prescriptions: Prescription[];
  currentPage: number;
  totalPages: number;
  totalPrescriptions: number;
}

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('active');
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchPrescriptions();
  }, [page, status]);

  const fetchPrescriptions = async () => {
    try {
      const response = await axios.get<PrescriptionResponse>('/api/prescriptions', {
        params: { page, status }
      });
      
      setPrescriptions(response.data.prescriptions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const handleDownloadPDF = async (prescriptionId: string) => {
    try {
      const response = await axios.get(`/api/prescriptions/${prescriptionId}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading prescription:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Prescriptions
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            label="Status"
            startAdornment={<FilterIcon />}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>

        <Pagination 
          count={totalPages} 
          page={page} 
          onChange={(e, value) => setPage(value)} 
          color="primary" 
        />
      </Box>

      <Grid container spacing={3}>
        {prescriptions.map((prescription) => (
          <Grid item xs={12} md={6} key={prescription._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Dr. {prescription.doctor.name}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                  {prescription.doctor.specialty}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Date: {new Date(prescription.date).toLocaleDateString()}
                </Typography>

                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Medications:
                </Typography>
                <List dense>
                  {prescription.medications.map((medication, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={medication.name}
                        secondary={`${medication.dosage} - ${medication.frequency} for ${medication.duration}`}
                      />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Instructions:
                </Typography>
                <Typography variant="body2">
                  {prescription.generalInstructions || 'No additional instructions'}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownloadPDF(prescription._id)}
                >
                  Download PDF
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}