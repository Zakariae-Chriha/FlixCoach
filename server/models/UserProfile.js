const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true }, // kg
  height: { type: Number, required: true }, // cm
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  primaryGoal: {
    type: String,
    enum: ['lose_fat', 'build_muscle', 'get_fit', 'improve_endurance'],
    required: true,
  },
  fitnessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  trainingLocation: {
    type: String,
    enum: ['home_no_equipment', 'home_with_equipment', 'gym', 'mixed'],
    required: true,
  },
  injuries: { type: String, default: '' },
  allergies: { type: String, default: '' },
  dietaryRestrictions: { type: String, default: '' },
  trainingDaysPerWeek: { type: Number, min: 1, max: 7, required: true },
  wakeUpTime: { type: String, required: true }, // e.g. "07:00"
  sleepTime: { type: String, required: true },   // e.g. "23:00"
  currentWeight: { type: Number },
  targetWeight: { type: Number },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  totalDaysCompleted: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

userProfileSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
