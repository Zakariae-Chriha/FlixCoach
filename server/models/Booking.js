const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coach:  { type: mongoose.Schema.Types.ObjectId, ref: 'Coach', required: true },

  date:      { type: Date, required: true },
  startTime: { type: String, required: true }, // "10:00"
  endTime:   { type: String, required: true }, // "11:00"
  duration:  { type: Number, enum: [30, 60, 90], default: 60 }, // minutes

  sessionType: { type: String, enum: ['in-person', 'online'], required: true },
  location:    String, // address or online link
  notes:       String, // client notes

  price:  { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },

  // Post-session
  clientRating:  { type: Number, min: 1, max: 5 },
  clientReview:  String,
  coachNotes:    String,
  reviewedAt:    Date,

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);
