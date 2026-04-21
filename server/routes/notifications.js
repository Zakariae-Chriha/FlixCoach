const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const PushSubscription = require('../models/PushSubscription');
const Notification = require('../models/Notification');

/* GET /api/notifications/vapid-key */
router.get('/vapid-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

/* POST /api/notifications/subscribe — save push subscription */
router.post('/subscribe', protect, async (req, res) => {
  const { subscription } = req.body;
  if (!subscription) return res.status(400).json({ success: false, message: 'Subscription required' });
  try {
    await PushSubscription.findOneAndUpdate(
      { user: req.user._id, 'subscription.endpoint': subscription.endpoint },
      { user: req.user._id, subscription },
      { upsert: true, new: true }
    );
    res.json({ success: true, message: 'Push notifications enabled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* DELETE /api/notifications/unsubscribe */
router.delete('/unsubscribe', protect, async (req, res) => {
  await PushSubscription.deleteMany({ user: req.user._id });
  res.json({ success: true });
});

/* GET /api/notifications — in-app notifications */
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 }).limit(30);
    const unread = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json({ success: true, notifications, unread });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* PATCH /api/notifications/read */
router.patch('/read', protect, async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  res.json({ success: true });
});

module.exports = router;
