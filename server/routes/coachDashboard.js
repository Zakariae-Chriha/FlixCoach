const express = require('express');
const router = express.Router();
const { isValidObjectId } = require('mongoose');
const protect = require('../middleware/auth');
const Coach = require('../models/Coach');
const Booking = require('../models/Booking');

function coachOnly(req, res, next) {
  if (req.user?.role !== 'coach' && req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Coach access only' });
  next();
}

// GET /api/coach-dashboard/profile
router.get('/profile', protect, coachOnly, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) return res.status(404).json({ success: false, message: 'Coach profile not found' });
    res.json({ success: true, coach });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/coach-dashboard/bookings
router.get('/bookings', protect, coachOnly, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) return res.status(404).json({ success: false, message: 'Coach not found' });

    const bookings = await Booking.find({ coach: coach._id })
      .populate('client', 'name email')
      .sort({ date: 1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/coach-dashboard/stats
router.get('/stats', protect, coachOnly, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) return res.status(404).json({ success: false, message: 'Coach not found' });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);

    const [todayBookings, upcomingBookings, totalCompleted, totalEarnings] = await Promise.all([
      Booking.find({ coach: coach._id, date: { $gte: today, $lt: tomorrow }, status: { $in: ['confirmed', 'pending'] } })
        .populate('client', 'name email'),
      Booking.find({ coach: coach._id, date: { $gte: tomorrow, $lte: weekEnd }, status: { $in: ['confirmed', 'pending'] } })
        .populate('client', 'name email').sort({ date: 1 }),
      Booking.countDocuments({ coach: coach._id, status: 'completed' }),
      Booking.aggregate([
        { $match: { coach: coach._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$price' } } },
      ]),
    ]);

    res.json({
      success: true,
      coach,
      todayBookings,
      upcomingBookings,
      totalCompleted,
      totalEarnings: totalEarnings[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/coach-dashboard/clients — client progress overview
router.get('/clients', protect, coachOnly, async (req, res) => {
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    if (!coach) return res.status(404).json({ success: false, message: 'Coach not found' });

    const bookings = await Booking.find({ coach: coach._id })
      .populate('client', 'name email')
      .sort({ date: -1 });

    // Group by client
    const clientMap = {};
    bookings.forEach(b => {
      if (!b.client) return;
      const id = b.client._id.toString();
      if (!clientMap[id]) {
        clientMap[id] = {
          id,
          name: b.client.name,
          email: b.client.email,
          total: 0,
          completed: 0,
          cancelled: 0,
          lastSession: null,
          nextSession: null,
          totalSpent: 0,
        };
      }
      const c = clientMap[id];
      c.total++;
      if (b.status === 'completed') { c.completed++; c.totalSpent += b.price || 0; }
      if (b.status === 'cancelled') c.cancelled++;
      const bDate = new Date(b.date);
      const now = new Date();
      if (bDate < now && b.status === 'completed') {
        if (!c.lastSession || bDate > new Date(c.lastSession)) c.lastSession = b.date;
      }
      if (bDate >= now && ['confirmed', 'pending'].includes(b.status)) {
        if (!c.nextSession || bDate < new Date(c.nextSession)) c.nextSession = b.date;
      }
    });

    const clients = Object.values(clientMap).map(c => ({
      ...c,
      progressPct: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total);

    res.json({ success: true, clients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/coach-dashboard/bookings/:id — confirm or cancel
router.patch('/bookings/:id', protect, coachOnly, async (req, res) => {
  if (!isValidObjectId(req.params.id))
    return res.status(400).json({ success: false, message: 'Invalid booking ID' });
  const VALID = ['confirmed', 'cancelled', 'completed'];
  if (!VALID.includes(req.body.status))
    return res.status(400).json({ success: false, message: 'Invalid status. Must be one of: confirmed, cancelled, completed' });
  try {
    const coach = await Coach.findOne({ user: req.user._id });
    const booking = await Booking.findOne({ _id: req.params.id, coach: coach._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = req.body.status;
    if (req.body.coachNotes) booking.coachNotes = req.body.coachNotes;

    if (req.body.status === 'completed' && booking.commission === 0) {
      const rate = coach.commissionRate ?? 20;
      booking.commissionPct = rate;
      booking.commission    = Math.round(booking.price * rate) / 100;
      booking.coachPayout   = booking.price - booking.commission;
    }

    await booking.save();

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/coach-dashboard/availability — update weekly schedule
router.patch('/availability', protect, coachOnly, async (req, res) => {
  try {
    const coach = await Coach.findOneAndUpdate(
      { user: req.user._id },
      { availability: req.body.availability },
      { new: true }
    );
    res.json({ success: true, availability: coach.availability });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
