import express from 'express';
import Stripe from 'stripe';
import auth from '../middleware/auth.js';
import Appointment from '../models/Appointment.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-session', auth, async (req, res) => {
  try {
    const { appointmentData, successUrl, cancelUrl } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Medical Consultation',
              description: `Appointment with Dr. ${appointmentData.doctor.name}`
            },
            unit_amount: appointmentData.consultationFee * 100 // Convert to cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        appointmentId: appointmentData._id,
        patientId: req.user._id
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ message: 'Error creating payment session' });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      const appointment = await Appointment.findById(session.metadata.appointmentId);
      if (appointment) {
        appointment.paymentStatus = 'paid';
        appointment.paymentMethod = 'online';
        await appointment.save();
      }
    } catch (error) {
      console.error('Error updating appointment payment status:', error);
    }
  }

  res.json({ received: true });
});

export default router;