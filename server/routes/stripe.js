const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');

const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;
const User = require('../models/User');

const PLANS = {
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    price: 9.99,
    features: ['Unlimited AI coaching', 'Priority coach matching', 'Advanced analytics', 'Video calls (5/month)'],
  },
  elite: {
    name: 'Elite',
    priceId: process.env.STRIPE_ELITE_PRICE_ID,
    price: 24.99,
    features: ['Everything in Pro', 'Unlimited video calls', 'Dedicated coach', 'Custom meal plans', 'Priority support'],
  },
};

/* GET /api/stripe/plans — public */
router.get('/plans', (req, res) => {
  res.json({ success: true, plans: PLANS });
});

/* GET /api/stripe/subscription — current user subscription */
router.get('/subscription', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('subscription name email');
    res.json({ success: true, subscription: user.subscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* POST /api/stripe/create-checkout — start Stripe Checkout */
router.post('/create-checkout', protect, async (req, res) => {
  if (!stripe) return res.status(503).json({ success: false, message: 'Payments not configured yet.' });
  const { plan } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ success: false, message: 'Invalid plan' });

  const planData = PLANS[plan];
  if (!planData.priceId || planData.priceId.includes('YOUR')) {
    return res.status(503).json({
      success: false,
      message: 'Stripe not configured yet. Add STRIPE_SECRET_KEY and price IDs to server/.env',
    });
  }

  try {
    const user = await User.findById(req.user._id);
    let customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name, metadata: { userId: user._id.toString() } });
      customerId = customer.id;
      user.subscription = { ...user.subscription?.toObject(), stripeCustomerId: customerId };
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: planData.priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/dashboard?upgraded=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
      metadata: { userId: user._id.toString(), plan },
    });

    res.json({ success: true, url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /api/stripe/verify-session — verify payment and update plan */
router.get('/verify-session', protect, async (req, res) => {
  if (!stripe) return res.status(503).json({ success: false, message: 'Payments not configured' });
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ success: false, message: 'Missing session_id' });
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }
    const { userId, plan } = session.metadata;
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    await User.findByIdAndUpdate(userId, {
      'subscription.plan': plan,
      'subscription.status': 'active',
      'subscription.stripeSubscriptionId': subscription.id,
      'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
    });
    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* POST /api/stripe/create-portal — manage existing subscription */
router.post('/create-portal', protect, async (req, res) => {
  if (!stripe) return res.status(503).json({ success: false, message: 'Payments not configured yet.' });
  try {
    const user = await User.findById(req.user._id);
    const customerId = user.subscription?.stripeCustomerId;
    if (!customerId) return res.status(400).json({ success: false, message: 'No active subscription' });

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.CLIENT_URL}/dashboard`,
    });
    res.json({ success: true, url: session.url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* POST /api/stripe/webhook — Stripe events (raw body required) */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.status(503).send('Payments not configured');
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, plan } = session.metadata;
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await User.findByIdAndUpdate(userId, {
          'subscription.plan': plan,
          'subscription.status': 'active',
          'subscription.stripeSubscriptionId': subscription.id,
          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        });
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const user = await User.findOne({ 'subscription.stripeSubscriptionId': sub.id });
        if (user) {
          user.subscription.status = sub.status === 'active' ? 'active' : sub.status;
          user.subscription.currentPeriodEnd = new Date(sub.current_period_end * 1000);
          await user.save();
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await User.findOneAndUpdate(
          { 'subscription.stripeSubscriptionId': sub.id },
          { 'subscription.plan': 'free', 'subscription.status': 'inactive', 'subscription.stripeSubscriptionId': null }
        );
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
  }

  res.json({ received: true });
});

module.exports = router;
