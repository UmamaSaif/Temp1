import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import axios from 'axios';

interface HealthRecord {
  _id: string;
  diagnosis: string;
  treatment: string;
  date: string;
  doctor: {
    name: string;
    specialty: string;
  };
  status: string;
}

export default function HealthRecords() {
  const [records, setRecords] = useState<HealthRecord[]>([]);

  useEffect(() => {
    fetchHealthRecords();
  }, []);

  const fetchHealthRecords = async () => {
    try {
      const response = await axios.get('/api/health-records');
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching health records:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Health Records
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Diagnosis</TableCell>
              <TableCell>Treatment</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record._id}>
                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Typography variant="body2">Dr. {record.doctor.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {record.doctor.specialty}
                  </Typography>
                </TableCell>
                <TableCell>{record.diagnosis}</TableCell>
                <TableCell>{record.treatment}</TableCell>
                <TableCell>
                  <Chip
                    label={record.status}
                    color={record.status === 'completed' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}