const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: String,
  sets: Number,
  reps: String,   // e.g. "12-15" or "60 seconds"
  rest: String,   // e.g. "60 seconds"
  description: String,
  videoUrl: String,
  muscleGroup: String,
  equipment: String,
});

const workoutDaySchema = new mongoose.Schema({
  day: Number,        // 1-30
  weekNumber: Number, // 1-4
  type: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'endurance', 'rest', 'active_recovery'],
  },
  title: String,
  duration: Number,   // minutes
  exercises: [exerciseSchema],
  notes: String,
  completed: { type: Boolean, default: false },
  completedAt: Date,
});

const trainingProgramSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: Number,
  year: Number,
  goal: String,
  fitnessLevel: String,
  location: String,
  days: [workoutDaySchema],
  generatedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
});

module.exports = mongoose.model('TrainingProgram', trainingProgramSchema);
