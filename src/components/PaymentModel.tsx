import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  appointmentData: any;
  onPaymentComplete: () => void;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function PaymentModal({ open, onClose, appointmentData, onPaymentComplete }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCashPayment = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post('/api/appointments', {
        ...appointmentData,
        paymentMethod: 'cash',
        paymentStatus: 'pending'
      });

      if (response.data) {
        onPaymentComplete();
        onClose();
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error processing cash payment');
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    try {
      setLoading(true);
      setError('');
      
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const response = await axios.post('/api/payments/create-session', {
        appointmentData,
        successUrl: `${window.location.origin}/appointments?success=true`,
        cancelUrl: `${window.location.origin}/appointments?canceled=true`
      });

      const { sessionId } = response.data;
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      setError(error.message || 'Error processing online payment');
    } finally {
      setLoading(false);
    }
  };

  if (!appointmentData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Choose Payment Method</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body1" gutterBottom>
          Consultation Fee: ${appointmentData?.consultationFee || 0}
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          {loading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" paragraph>
                Please select your preferred payment method:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleOnlinePayment}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  Pay Online
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCashPayment}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  Pay Cash
                </Button>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}