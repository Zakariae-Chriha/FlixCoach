const mongoose = require('mongoose');

const weeklyReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekNumber: Number,
  month: Number,
  year: Number,
  startDate: Date,
  endDate: Date,

  workoutsCompleted: Number,
  workoutsPlanned: Number,
  avgDailyCalories: Number,
  avgDailyProtein: Number,
  avgSleepHours: Number,
  avgMotivationLevel: Number,
  mentalWellnessScore: Number,
  overallProgressRating: Number,
  top3Improvements: [String],
  whatWentWrong: [String],
  whyItMatters: [String],
  nextWeekPlan: {
    monday: String, tuesday: String, wednesday: String,
    thursday: String, friday: String, saturday: String, sunday: String,
  },
  summary: String,
  coachMessage: String,
  generatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);
