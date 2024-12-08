import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
  Alert
} from '@mui/material';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

interface QueueData {
  position: number;
  estimatedWaitTime: number;
  status: string;
}

export default function QueueTracking() {
  const { socket } = useSocket();
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchQueuePosition = async () => {
      try {
        // Get the current appointment ID from your app state or URL
        const appointmentId = 'current-appointment-id'; // Replace with actual ID
        const response = await axios.get(`/api/queue/${appointmentId}`);
        setQueueData(response.data);
      } catch (error) {
        setError('Failed to fetch queue position');
        console.error('Error fetching queue position:', error);
      }
    };

    fetchQueuePosition();
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Join queue room for updates
    const appointmentId = 'current-appointment-id'; // Replace with actual ID
    socket.emit('join-queue', appointmentId);

    socket.on('queue-update', (data: QueueData) => {
      setQueueData(data);
    });

    return () => {
      socket.off('queue-update');
    };
  }, [socket]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Queue Status
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                <Typography variant="h6" gutterBottom>
                  Your Position in Queue
                </Typography>
                
                {queueData ? (
                  <>
                    <Typography variant="h2" color="primary" gutterBottom>
                      {queueData.position}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Estimated wait time: {queueData.estimatedWaitTime} minutes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {queueData.status}
                    </Typography>
                  </>
                ) : (
                  <CircularProgress />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Queue Information
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • The queue position is updated in real-time
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Estimated wait time is approximate and may vary
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • You will be notified when it's your turn
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}