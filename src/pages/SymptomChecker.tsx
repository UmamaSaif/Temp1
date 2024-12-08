import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid
} from '@mui/material';
import axios from 'axios';

interface Condition {
  name: string;
  probability: number;
  description: string;
}

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/symptom-checker', { symptoms });
      setConditions(response.data);
    } catch (error) {
      console.error('Error checking symptoms:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Symptom Checker
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Describe your symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Enter your symptoms in detail..."
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!symptoms.trim() || loading}
              >
                Check Symptoms
              </Button>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          {conditions.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Possible Conditions
              </Typography>
              <List>
                {conditions.map((condition, index) => (
                  <ListItem key={index} divider={index !== conditions.length - 1}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          {condition.name}
                          <Chip
                            label={`${Math.round(condition.probability * 100)}%`}
                            size="small"
                            color={condition.probability > 0.7 ? 'error' : 'warning'}
                          />
                        </Box>
                      }
                      secondary={condition.description}
                    />
                  </ListItem>
                ))}
              </List>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Note: This is a basic symptom checker and should not replace professional medical advice.
                Please consult with a healthcare provider for accurate diagnosis.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}