const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isValidObjectId } = require('mongoose');
const protect = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const validateId = (req, res, next) => {
  const id = req.params.id || req.params.coachId || req.params.userId;
  if (id && !isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
  next();
};

router.param('id',      (req, res, next, val) => { if (!isValidObjectId(val)) return res.status(400).json({ success: false, message: 'Invalid ID format' }); next(); });
router.param('coachId', (req, res, next, val) => { if (!isValidObjectId(val)) return res.status(400).json({ success: false, message: 'Invalid ID format' }); next(); });
router.param('userId',  (req, res, next, val) => { if (!isValidObjectId(val)) return res.status(400).json({ success: false, message: 'Invalid ID format' }); next(); });
const CoachApplication = require('../models/CoachApplication');
const Coach = require('../models/Coach');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { sendBookingConfirmation, sendCoachApprovalEmail, sendCoachRejectionEmail } = require('../services/emailService');
const bcrypt = require('bcryptjs');
const { secretaryChat } = require('../services/claudeService');
const UserProfile = require('../models/UserProfile');

// Multer setup for CV + photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/coaches');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// ─── PUBLIC ROUTES ───────────────────────────────────────────────

// GET /api/coaches — get all approved coaches
router.get('/', async (req, res) => {
  try {
    const { specialty, type, minRating } = req.query;
    const filter = { isActive: true };
    if (specialty) filter.specialties = { $in: [specialty] };
    if (type) filter.sessionTypes = { $in: [type] };
    if (minRating) filter.avgRating = { $gte: parseFloat(minRating) };

    const coaches = await Coach.find(filter).sort({ avgRating: -1, totalSessions: -1 });
    res.json({ success: true, coaches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/coaches/:id — get single coach profile
router.get('/:id', async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) return res.status(404).json({ success: false, message: 'Coach not found' });
    res.json({ success: true, coach });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/coaches/apply — coach submits application
router.post('/apply', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'cv', maxCount: 1 }]), async (req, res) => {
  try {
    const { fullName, email, phone, specialties, experience, bio } = req.body;
    if (!fullName || !email || !phone || !specialties || !experience || !bio) {
      return res.status(400).json({ success: false, message: 'Missing required fields: fullName, email, phone, specialties, experience, bio' });
    }

    const existing = await CoachApplication.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ success: false, message: 'Application already submitted with this email' });

    const data = { ...req.body };
    if (req.files?.photo) data.photo = `/uploads/coaches/${req.files.photo[0].filename}`;
    if (req.files?.cv) data.cvFile = `/uploads/coaches/${req.files.cv[0].filename}`;
    if (typeof data.specialties === 'string') data.specialties = data.specialties.split(',').map(s => s.trim());
    if (typeof data.certifications === 'string') data.certifications = data.certifications.split(',').map(s => s.trim());
    if (typeof data.languages === 'string') data.languages = data.languages.split(',').map(s => s.trim());
    if (typeof data.sessionTypes === 'string') data.sessionTypes = [data.sessionTypes];

    const application = await CoachApplication.create(data);
    res.status(201).json({ success: true, message: 'Application submitted successfully! We will review it shortly.', application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/coaches/secretary — AI secretary chat
router.post('/secretary', protect, async (req, res) => {
  try {
    const { messages } = req.body;
    const [coaches, profile] = await Promise.all([
      Coach.find({ isActive: true }).select('-reviews'),
      UserProfile.findOne({ user: req.user._id }),
    ]);

    const reply = await secretaryChat(messages, coaches, profile);

    // Parse recommended coach IDs from AI reply if present
    let recommendedCoaches = [];
    const jsonMatch = reply.match(/COACHES_JSON:(\[.*?\])/s);
    if (jsonMatch) {
      try {
        const ids = JSON.parse(jsonMatch[1]).map(c => c.id);
        recommendedCoaches = coaches.filter(c => ids.includes(c._id.toString()));
      } catch { /* ignore parse errors */ }
    }

    const cleanReply = reply.replace(/COACHES_JSON:\[.*?\]/s, '').trim();
    res.json({ success: true, reply: cleanReply, recommendedCoaches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── BOOKING ROUTES (authenticated users) ────────────────────────

// GET /api/coaches/my/bookings — get current user's bookings (must be before /:id/bookings)
router.get('/my/bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ client: req.user._id })
      .populate('coach', 'fullName photo mainSpecialty city pricePerSession')
      .sort({ date: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/coaches/:id/book — book a session
router.post('/:id/book', protect, async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) return res.status(404).json({ success: false, message: 'Coach not found' });

    const { date, startTime, endTime, duration, sessionType, notes } = req.body;

    // Check no clash
    const existing = await Booking.findOne({
      coach: coach._id,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] },
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });
    if (existing) return res.status(400).json({ success: false, message: 'This time slot is already booked' });

    const booking = await Booking.create({
      client: req.user._id,
      coach: coach._id,
      date: new Date(date),
      startTime, endTime,
      duration: duration || 60,
      sessionType,
      notes,
      price: coach.pricePerSession,
      status: 'confirmed',
    });

    await Coach.findByIdAndUpdate(coach._id, { $inc: { totalSessions: 1 } });

    // Send confirmation emails with .ics calendar attachment
    sendBookingConfirmation({ clientUser: req.user, coachDoc: coach, booking })
      .catch(err => console.error('Booking email error:', err.message));

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/coaches/:id/bookings — get coach's booked slots
router.get('/:id/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({
      coach: req.params.id,
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: new Date() },
    }).select('date startTime endTime status');
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/coaches/:id/slots/:date — get free/booked slots for a specific date
router.get('/:id/slots/:date', async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) return res.status(404).json({ success: false, message: 'Coach not found' });

    const dateObj = new Date(req.params.date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // Find coach availability for this day
    const dayAvail = coach.availability?.find(a => a.day === dayName);
    if (!dayAvail) {
      return res.json({ success: true, slots: [], message: 'Coach is not available on this day' });
    }

    // Generate 60-min slots within availability window
    const [startH, startM] = dayAvail.startTime.split(':').map(Number);
    const [endH, endM]   = dayAvail.endTime.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal   = endH   * 60 + endM;

    const slots = [];
    for (let t = startTotal; t + 60 <= endTotal; t += 60) {
      const h = Math.floor(t / 60);
      const m = t % 60;
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    }

    // Get booked slots for this date
    const dayStart = new Date(req.params.date); dayStart.setHours(0,0,0,0);
    const dayEnd   = new Date(req.params.date); dayEnd.setHours(23,59,59,999);

    const bookedSessions = await Booking.find({
      coach: req.params.id,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ['pending', 'confirmed'] },
    }).select('startTime endTime');

    // Mark each slot as free or booked
    const result = slots.map(slot => {
      const [sh, sm] = slot.split(':').map(Number);
      const slotStart = sh * 60 + sm;
      const slotEnd   = slotStart + 60;

      const isBooked = bookedSessions.some(b => {
        const [bsh, bsm] = b.startTime.split(':').map(Number);
        const [beh, bem] = b.endTime.split(':').map(Number);
        const bStart = bsh * 60 + bsm;
        const bEnd   = beh * 60 + bem;
        return slotStart < bEnd && slotEnd > bStart;
      });

      return { time: slot, available: !isBooked };
    });

    res.json({ success: true, slots: result, dayAvail });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/coaches/:id/review — leave a review
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const coach = await Coach.findById(req.params.id);
    if (!coach) return res.status(404).json({ success: false, message: 'Coach not found' });

    coach.reviews.push({ client: req.user._id, clientName: req.user.name, rating, comment });
    const avg = coach.reviews.reduce((s, r) => s + r.rating, 0) / coach.reviews.length;
    coach.avgRating = Math.round(avg * 10) / 10;
    coach.totalReviews = coach.reviews.length;
    await coach.save();

    res.json({ success: true, avgRating: coach.avgRating });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────

// GET /api/coaches/admin/applications — all applications
router.get('/admin/applications', adminAuth, async (req, res) => {
  try {
    const applications = await CoachApplication.find().sort({ submittedAt: -1 });
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/coaches/admin/applications/:id — approve or reject
router.patch('/admin/applications/:id', adminAuth, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const app = await CoachApplication.findByIdAndUpdate(
      req.params.id,
      { status, adminNote, reviewedAt: new Date() },
      { new: true }
    );
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    if (status === 'approved') {
      let coachDoc = await Coach.findOne({ email: app.email });
      if (!coachDoc) {
        // Generate temp password
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

        // Create user account for coach
        let coachUser = await User.findOne({ email: app.email });
        if (!coachUser) {
          coachUser = await User.create({
            name: app.fullName,
            email: app.email,
            password: tempPassword,
            role: 'coach',
            onboardingCompleted: true,
          });
        }

        // Create coach profile linked to user
        coachDoc = await Coach.create({
          user: coachUser._id,
          application: app._id,
          fullName: app.fullName, email: app.email, phone: app.phone,
          age: app.age, gender: app.gender, city: app.city, photo: app.photo,
          specialties: app.specialties, mainSpecialty: app.specialties[0],
          experience: app.experience, certifications: app.certifications,
          bio: app.bio, coachingStyle: app.coachingStyle, languages: app.languages,
          sessionTypes: app.sessionTypes,
          pricePerSession: app.pricePerSession, monthlyPackage: app.monthlyPackage,
          availability: [
            { day: 'monday',    startTime: '09:00', endTime: '18:00' },
            { day: 'tuesday',   startTime: '09:00', endTime: '18:00' },
            { day: 'wednesday', startTime: '09:00', endTime: '18:00' },
            { day: 'thursday',  startTime: '09:00', endTime: '18:00' },
            { day: 'friday',    startTime: '09:00', endTime: '18:00' },
          ],
        });

        // Send approval email with credentials
        sendCoachApprovalEmail(coachDoc, tempPassword).catch(err =>
          console.error('Approval email error:', err.message)
        );
      }
    }

    if (status === 'rejected') {
      sendCoachRejectionEmail({ fullName: app.fullName, email: app.email }, adminNote)
        .catch(err => console.error('Rejection email error:', err.message));
    }

    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/coaches/admin/stats — dashboard stats
router.get('/admin/stats', adminAuth, async (req, res) => {
  try {
    const [totalCoaches, pending, totalBookings, activeClients] = await Promise.all([
      Coach.countDocuments({ isActive: true }),
      CoachApplication.countDocuments({ status: 'pending' }),
      Booking.countDocuments(),
      Booking.distinct('client'),
    ]);
    res.json({ success: true, totalCoaches, pendingApplications: pending, totalBookings, activeClients: activeClients.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/coaches/admin/resend-approval/:id — resend credentials email
router.post('/admin/resend-approval/:id', adminAuth, async (req, res) => {
  try {
    const app = await CoachApplication.findById(req.params.id);
    if (!app || app.status !== 'approved') return res.status(400).json({ success: false, message: 'Application not approved' });

    const coachDoc = await Coach.findOne({ email: app.email });
    if (!coachDoc) return res.status(404).json({ success: false, message: 'Coach profile not found' });

    const coachUser = await User.findOne({ email: app.email });
    if (!coachUser) return res.status(404).json({ success: false, message: 'Coach user account not found' });

    // Generate new temp password and update account
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
    const hashed = await bcrypt.hash(tempPassword, 10);
    await User.findByIdAndUpdate(coachUser._id, { password: hashed });

    await sendCoachApprovalEmail(coachDoc, tempPassword);
    res.json({ success: true, message: `Credentials email sent to ${app.email}`, tempPassword });
  } catch (err) {
    console.error('Resend approval error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/coaches/admin/coaches/:id — deactivate coach
router.delete('/admin/coaches/:id', adminAuth, async (req, res) => {
  try {
    await Coach.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Coach deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/coaches/admin/subscriptions — all users with their plan
router.get('/admin/subscriptions', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['user', 'coach'] } })
      .select('name email role subscription createdAt')
      .sort({ createdAt: -1 });
    const counts = {
      free:  await User.countDocuments({ 'subscription.plan': { $in: ['free', null, undefined] }, role: { $in: ['user', 'coach'] } }),
      pro:   await User.countDocuments({ 'subscription.plan': 'pro' }),
      elite: await User.countDocuments({ 'subscription.plan': 'elite' }),
    };
    res.json({ success: true, users, counts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/coaches/admin/subscriptions/:userId — change user plan
router.patch('/admin/subscriptions/:userId', adminAuth, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['free', 'pro', 'elite'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { 'subscription.plan': plan, 'subscription.status': plan === 'free' ? 'inactive' : 'active' },
      { new: true }
    ).select('name email subscription');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/coaches/admin/commission — commission summary per coach
router.get('/admin/commission', adminAuth, async (req, res) => {
  try {
    const coaches = await Coach.find({ isActive: true }).select('fullName email commissionRate totalSessions');

    const summaries = await Promise.all(coaches.map(async (coach) => {
      const agg = await Booking.aggregate([
        { $match: { coach: coach._id, status: 'completed' } },
        { $group: {
          _id: null,
          totalRevenue:    { $sum: '$price' },
          totalCommission: { $sum: '$commission' },
          totalPayout:     { $sum: '$coachPayout' },
          sessionCount:    { $sum: 1 },
        }},
      ]);
      const raw = agg[0] || {};
      const data = {
        totalRevenue:    raw.totalRevenue    || 0,
        totalCommission: raw.totalCommission || 0,
        totalPayout:     raw.totalPayout     || 0,
        sessionCount:    raw.sessionCount    || 0,
      };
      return {
        _id: coach._id.toString(),
        fullName: coach.fullName,
        email: coach.email,
        commissionRate: coach.commissionRate,
        ...data,
      };
    }));

    const totals = summaries.reduce((acc, s) => ({
      totalRevenue:    acc.totalRevenue    + s.totalRevenue,
      totalCommission: acc.totalCommission + s.totalCommission,
      totalPayout:     acc.totalPayout     + s.totalPayout,
    }), { totalRevenue: 0, totalCommission: 0, totalPayout: 0 });

    res.json({ success: true, coaches: summaries, totals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/coaches/admin/commission/:coachId — update commission rate
router.patch('/admin/commission/:coachId', adminAuth, async (req, res) => {
  try {
    const { commissionRate } = req.body;
    if (commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({ success: false, message: 'Rate must be 0-100' });
    }
    const coach = await Coach.findByIdAndUpdate(
      req.params.coachId,
      { commissionRate },
      { new: true }
    ).select('fullName commissionRate');
    res.json({ success: true, coach });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
