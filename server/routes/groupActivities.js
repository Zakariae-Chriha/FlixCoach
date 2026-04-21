const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const GroupActivity = require('../models/GroupActivity');
const Notification = require('../models/Notification');

// GET /api/activities — list activities with filters
router.get('/', protect, async (req, res) => {
  try {
    const { category, level, city, isFree, date } = req.query;
    const filter = { status: 'upcoming', date: { $gte: new Date() } };
    if (category) filter.category = category;
    if (level && level !== 'all') filter.level = { $in: [level, 'all'] };
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (isFree === 'true') filter.isFree = true;
    if (date === 'today') {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      filter.date = { $gte: today, $lt: tomorrow };
    } else if (date === 'week') {
      const now = new Date();
      const weekEnd = new Date(); weekEnd.setDate(weekEnd.getDate() + 7);
      filter.date = { $gte: now, $lte: weekEnd };
    }

    const activities = await GroupActivity.find(filter).sort({ date: 1 });
    res.json({ success: true, activities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/activities/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const activity = await GroupActivity.findById(req.params.id);
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });
    res.json({ success: true, activity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/activities — create activity
router.post('/', protect, async (req, res) => {
  try {
    const { name, category, description, whatToBring, location, date, startTime,
      duration, maxParticipants, level, cost, isFree, visibility } = req.body;

    const activity = await GroupActivity.create({
      organizer:     req.user._id,
      organizerName: req.user.name,
      organizerRole: req.user.role,
      name, category, description, whatToBring,
      location, date, startTime,
      duration:        duration || 60,
      maxParticipants: maxParticipants || 10,
      currentParticipants: 1,
      participants: [{ user: req.user._id, name: req.user.name }],
      level:      level || 'all',
      cost:       cost || 0,
      isFree:     isFree !== false,
      visibility: visibility || 'open',
    });

    res.status(201).json({ success: true, activity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/activities/:id/join — join activity
router.post('/:id/join', protect, async (req, res) => {
  try {
    const activity = await GroupActivity.findById(req.params.id);
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });
    if (activity.currentParticipants >= activity.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Activity is full' });
    }

    const alreadyJoined = activity.participants.some(p => p.user?.toString() === req.user._id.toString());
    if (alreadyJoined) return res.status(400).json({ success: false, message: 'Already joined' });

    activity.participants.push({ user: req.user._id, name: req.user.name });
    activity.currentParticipants += 1;
    await activity.save();

    // Notify organizer
    if (activity.organizer.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: activity.organizer,
        type: 'activity_join',
        message: `${req.user.name} joined your activity "${activity.name}" 🏃`,
        link: '/activities',
        fromUser: req.user._id,
        fromName: req.user.name,
      });
    }

    res.json({ success: true, activity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/activities/:id/leave — leave activity
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const activity = await GroupActivity.findById(req.params.id);
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });
    if (activity.organizer.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Organizer cannot leave. Cancel the activity instead.' });
    }

    activity.participants = activity.participants.filter(p => p.user?.toString() !== req.user._id.toString());
    activity.currentParticipants = Math.max(1, activity.currentParticipants - 1);
    await activity.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/activities/:id — cancel activity (organizer only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const activity = await GroupActivity.findById(req.params.id);
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });
    if (activity.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    activity.status = 'cancelled';
    await activity.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
