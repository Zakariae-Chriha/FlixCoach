const mongoose = require('mongoose');

const coachApplicationSchema = new mongoose.Schema({
  // Personal info
  fullName:    { type: String, required: true },
  email:       { type: String, required: true, unique: true },
  phone:       { type: String, required: true },
  age:         { type: Number, required: true },
  gender:      { type: String, enum: ['male', 'female', 'other'], required: true },
  city:        { type: String, required: true },
  photo:       { type: String }, // file path

  // Professional info
  specialties: [{ type: String }],
  experience:  { type: Number, required: true }, // years
  certifications: [{ type: String }],
  bio:         { type: String, required: true },
  coachingStyle: { type: String },
  languages:   [{ type: String }],

  // Session info
  sessionTypes:  [{ type: String, enum: ['in-person', 'online', 'both'] }],
  pricePerSession: { type: Number, required: true },
  monthlyPackage:  { type: Number },

  // CV / documents
  cvFile:      { type: String }, // file path
  cvUrl:       { type: String }, // or link

  // Admin
  status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote:   { type: String },
  reviewedAt:  { type: Date },

  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CoachApplication', coachApplicationSchema);
