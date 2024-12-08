import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { HealthRecord } from '../../types/healthRecord';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HealthStatsProps {
  healthRecords: HealthRecord[];
}

export default function HealthStats({ healthRecords }: HealthStatsProps) {
  const chartData = {
    labels: healthRecords.map(record => new Date(record.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Weight (kg)',
        data: healthRecords
          .filter(record => record.type === 'weight')
          .map(record => record.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Blood Pressure (mmHg)',
        data: healthRecords
          .filter(record => record.type === 'blood_pressure')
          .map(record => record.value),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      },
      {
        label: 'Heart Rate (bpm)',
        data: healthRecords
          .filter(record => record.type === 'heart_rate')
          .map(record => record.value),
        borderColor: 'rgb(53, 162, 235)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Health Trends'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Health Statistics
      </Typography>
      <Box sx={{ height: 300 }}>
        <Line data={chartData} options={options} />
      </Box>
    </Paper>
  );
}