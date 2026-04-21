const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const Booking = require('../models/Booking');
const Coach = require('../models/Coach');

/* POST /api/video/room — generate Jitsi room for a booking (no API key needed) */
router.post('/room', protect, async (req, res) => {
  const { bookingId } = req.body;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const coachDoc = await Coach.findOne({ user: req.user._id });
    const isParticipant =
      booking.user?.toString() === req.user._id.toString() ||
      (coachDoc && booking.coach?.toString() === coachDoc._id.toString()) ||
      req.user.role === 'admin';
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not authorized' });

    // Jitsi Meet — free, no API key, just a unique room name
    const roomName = `FlixCoach-${bookingId}`;
    const roomUrl = `https://meet.jit.si/${roomName}`;

    res.json({ success: true, roomUrl, userName: req.user.name });
  } catch (err) {
    console.error('Video room error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
