import React from 'react';
import {
  Grid,
  TextField,
  Button,
  Paper,
  Typography
} from '@mui/material';

interface DoctorSearchProps {
  searchCriteria: {
    name: string;
    specialty: string;
    availableDate: string;
    availableTime: string;
  };
  onSearchChange: (field: string, value: string) => void;
  onSearch: () => void;
}

export default function DoctorSearch({ 
  searchCriteria, 
  onSearchChange, 
  onSearch 
}: DoctorSearchProps) {
  return (
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
            onChange={(e) => onSearchChange('name', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Specialty"
            value={searchCriteria.specialty}
            onChange={(e) => onSearchChange('specialty', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            type="date"
            label="Available Date"
            InputLabelProps={{ shrink: true }}
            value={searchCriteria.availableDate}
            onChange={(e) => onSearchChange('availableDate', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={onSearch}
          >
            Search Doctors
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}