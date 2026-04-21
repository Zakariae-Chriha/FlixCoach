const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema({
  day:       { type: String, enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
  startTime: String, // e.g. "09:00"
  endTime:   String, // e.g. "17:00"
});

const reviewSchema = new mongoose.Schema({
  client:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clientName: String,
  rating:    { type: Number, min: 1, max: 5 },
  comment:   String,
  createdAt: { type: Date, default: Date.now },
});

const coachSchema = new mongoose.Schema({
  // Link to user account (created when approved)
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'CoachApplication' },

  // Personal
  fullName:    { type: String, required: true },
  email:       { type: String, required: true, unique: true },
  phone:       String,
  age:         Number,
  gender:      { type: String, enum: ['male', 'female', 'other'] },
  city:        String,
  photo:       String,

  // Professional
  specialties:    [String],
  mainSpecialty:  String,
  experience:     Number,
  certifications: [String],
  bio:            String,
  coachingStyle:  String,
  languages:      [String],

  // Sessions
  sessionTypes:    [String],
  pricePerSession: Number,
  monthlyPackage:  Number,

  // Schedule
  availability: [availabilitySlotSchema],

  // Stats
  totalSessions:  { type: Number, default: 0 },
  reviews:        [reviewSchema],
  avgRating:      { type: Number, default: 0 },
  totalReviews:   { type: Number, default: 0 },

  // Status
  isActive:  { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Coach', coachSchema);
