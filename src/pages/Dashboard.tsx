import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
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
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { user } = useAuth();
  const [healthStats, setHealthStats] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, appointmentsResponse] = await Promise.all([
          axios.get('/api/health-records/stats'),
          axios.get('/api/appointments/upcoming')
        ]);
        setHealthStats(statsResponse.data);
        setUpcomingAppointments(appointmentsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const healthChartData = {
    labels: healthStats.map(stat => new Date(stat.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Weight (kg)',
        data: healthStats.filter(stat => stat.type === 'weight').map(stat => stat.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Blood Pressure (mmHg)',
        data: healthStats.filter(stat => stat.type === 'blood_pressure').map(stat => stat.value),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Health Trends
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line
                data={healthChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Appointments
            </Typography>
            {upcomingAppointments.map((appointment) => (
              <Box key={appointment._id} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  Dr. {appointment.doctor.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(appointment.date).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}