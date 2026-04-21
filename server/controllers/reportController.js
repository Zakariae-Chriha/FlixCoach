const WeeklyReport = require('../models/WeeklyReport');
const DailyLog = require('../models/DailyLog');
const TrainingProgram = require('../models/TrainingProgram');
const MealPlan = require('../models/MealPlan');
const UserProfile = require('../models/UserProfile');
const claude = require('../services/claudeService');

exports.generateWeeklyReport = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const logs = await DailyLog.find({
      user: req.user._id,
      date: { $gte: weekAgo, $lte: today },
    });

    const program = await TrainingProgram.findOne({ user: req.user._id, active: true });
    const mealPlan = await MealPlan.findOne({ user: req.user._id, active: true });

    const workoutsCompleted = logs.filter((l) => l.workoutCompleted).length;
    const workoutsPlanned = profile.trainingDaysPerWeek;
    const avgCalories = logs.length
      ? Math.round(logs.reduce((s, l) => s + l.totalCalories, 0) / logs.length)
      : 0;
    const avgProtein = logs.length
      ? Math.round(logs.reduce((s, l) => s + l.totalProtein, 0) / logs.length)
      : 0;
    const sleepLogs = logs.filter((l) => l.sleepHours);
    const avgSleep = sleepLogs.length
      ? Math.round((sleepLogs.reduce((s, l) => s + l.sleepHours, 0) / sleepLogs.length) * 10) / 10
      : 0;
    const motivLogs = logs.filter((l) => l.motivationLevel);
    const avgMotivation = motivLogs.length
      ? Math.round(motivLogs.reduce((s, l) => s + l.motivationLevel, 0) / motivLogs.length * 10) / 10
      : 5;

    const daysLoggedFood  = logs.filter(l => l.foodEntries?.length > 0).length;
    const daysLoggedSleep = logs.filter(l => l.sleepHours).length;
    const daysCheckedIn   = logs.filter(l => l.motivationLevel).length;

    const aiData = await claude.generateWeeklyReport(
      {
        workoutsCompleted, workoutsPlanned,
        avgCalories, avgProtein, avgSleep, avgMotivation,
        calorieTarget: mealPlan?.dailyCalorieTarget || 2000,
        daysLoggedFood, daysLoggedSleep, daysCheckedIn,
      },
      profile
    );

    const now = new Date();
    const weekNumber = Math.ceil(now.getDate() / 7);

    const report = await WeeklyReport.create({
      user: req.user._id,
      weekNumber,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      startDate: weekAgo,
      endDate: today,
      workoutsCompleted, workoutsPlanned,
      avgDailyCalories: avgCalories,
      avgDailyProtein: avgProtein,
      avgSleepHours: avgSleep,
      avgMotivationLevel: avgMotivation,
      mentalWellnessScore: aiData.mentalWellnessScore || 7,
      overallProgressRating: aiData.overallProgressRating || 7,
      top3Improvements: aiData.top3Improvements || [],
      whatWentWrong: aiData.whatWentWrong || [],
      whyItMatters: aiData.whyItMatters || [],
      nextWeekPlan: aiData.nextWeekPlan || {},
      summary: aiData.summary || '',
      coachMessage: aiData.coachMessage || '',
    });

    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await WeeklyReport.find({ user: req.user._id }).sort({ generatedAt: -1 }).limit(10);
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLatestReport = async (req, res) => {
  try {
    const report = await WeeklyReport.findOne({ user: req.user._id }).sort({ generatedAt: -1 });
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
