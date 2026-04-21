const mongoose = require('mongoose');

const foodEntrySchema = new mongoose.Schema({
  name: String,
  quantity: String,
  protein: Number,
  carbs: Number,
  fats: Number,
  calories: Number,
  mealTime: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
  loggedAt: { type: Date, default: Date.now },
});

const dailyLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },

  // Food log
  foodEntries: [foodEntrySchema],
  totalProtein: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  totalFats: { type: Number, default: 0 },
  totalCalories: { type: Number, default: 0 },
  foodAnalysis: String, // AI-generated analysis

  // Sleep log
  sleepTime: String,
  wakeTime: String,
  sleepHours: Number,
  sleepQuality: { type: Number, min: 1, max: 5 },
  sleepNotes: String,
  sleepAnalysis: String,

  // Mental wellness
  motivationLevel: { type: Number, min: 1, max: 10 },
  mood: { type: String, enum: ['great', 'good', 'okay', 'low', 'bad'] },
  stressLevel: { type: Number, min: 1, max: 10 },
  mentalNotes: String,
  mentalCoaching: String,

  // Workout
  workoutCompleted: { type: Boolean, default: false },
  workoutDuration: Number, // minutes
  workoutNotes: String,

  // Water intake
  waterIntake: { type: Number, default: 0 }, // glasses

  // AI daily evaluation (generated on submit)
  dailyEvaluation: String,

  createdAt: { type: Date, default: Date.now },
});

// One log per user per day
dailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
