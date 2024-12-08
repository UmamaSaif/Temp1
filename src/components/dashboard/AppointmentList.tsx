import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  Chip
} from '@mui/material';
import { formatDateTime } from '../../utils/dateUtils';
import { Appointment } from '../../types/appointment';

interface AppointmentListProps {
  appointments: Appointment[];
  title: string;
}

export default function AppointmentList({ appointments, title }: AppointmentListProps) {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <List>
        {appointments.map((appointment) => (
          <ListItem key={appointment._id} divider>
            <ListItemText
              primary={`Dr. ${appointment.doctor.name}`}
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary">
                    {formatDateTime(appointment.date)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appointment.doctor.specialty}
                  </Typography>
                </>
              }
            />
            <Chip
              label={appointment.status}
              color={appointment.status === 'completed' ? 'success' : 'primary'}
              size="small"
            />
          </ListItem>
        ))}
        {appointments.length === 0 && (
          <ListItem>
            <ListItemText primary="No appointments found" />
          </ListItem>
        )}
      </List>
    </Paper>
  );
}