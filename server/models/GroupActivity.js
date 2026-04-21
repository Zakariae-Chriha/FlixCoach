const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:     String,
  photo:    String,
  joinedAt: { type: Date, default: Date.now },
});

const groupActivitySchema = new mongoose.Schema({
  organizer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizerName: String,
  organizerPhoto: String,
  organizerRole: { type: String, enum: ['user', 'coach', 'admin'], default: 'user' },

  name:        { type: String, required: true },
  category:    { type: String, required: true },
  description: String,
  whatToBring: String,

  location: {
    address: String,
    city:    String,
    lat:     Number,
    lng:     Number,
  },

  date:      { type: Date, required: true },
  startTime: { type: String, required: true },
  duration:  { type: Number, default: 60 }, // minutes

  maxParticipants:     { type: Number, default: 10 },
  currentParticipants: { type: Number, default: 1 },
  participants:        [participantSchema],

  level:      { type: String, enum: ['beginner', 'intermediate', 'advanced', 'all'], default: 'all' },
  cost:       { type: Number, default: 0 },
  isFree:     { type: Boolean, default: true },
  visibility: { type: String, enum: ['open', 'members', 'invite'], default: 'open' },

  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GroupActivity', groupActivitySchema);
