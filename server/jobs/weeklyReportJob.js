const cron = require('node-cron');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const DailyLog = require('../models/DailyLog');
const MealPlan = require('../models/MealPlan');
const WeeklyReport = require('../models/WeeklyReport');
const claude = require('../services/claudeService');
const { sendWeeklyReport } = require('../services/emailService');

async function generateAndEmailReport(userId) {
  try {
    const user = await User.findById(userId);
    const profile = await UserProfile.findOne({ user: userId });
    if (!user || !profile) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const logs = await DailyLog.find({ user: userId, date: { $gte: weekAgo, $lte: today } });
    const mealPlan = await MealPlan.findOne({ user: userId, active: true });

    const workoutsCompleted = logs.filter(l => l.workoutCompleted).length;
    const avgCalories = logs.length ? Math.round(logs.reduce((s,l) => s + l.totalCalories, 0) / logs.length) : 0;
    const avgProtein = logs.length ? Math.round(logs.reduce((s,l) => s + l.totalProtein, 0) / logs.length) : 0;
    const sleepLogs = logs.filter(l => l.sleepHours);
    const avgSleep = sleepLogs.length ? Math.round(sleepLogs.reduce((s,l) => s + l.sleepHours, 0) / sleepLogs.length * 10) / 10 : 0;
    const motivLogs = logs.filter(l => l.motivationLevel);
    const avgMotivation = motivLogs.length ? Math.round(motivLogs.reduce((s,l) => s + l.motivationLevel, 0) / motivLogs.length * 10) / 10 : 5;

    const aiData = await claude.generateWeeklyReport({
      workoutsCompleted,
      workoutsPlanned: profile.trainingDaysPerWeek,
      avgCalories, avgProtein, avgSleep, avgMotivation,
      calorieTarget: mealPlan?.dailyCalorieTarget || 2000,
      daysLoggedFood: logs.filter(l => l.foodEntries?.length > 0).length,
      daysLoggedSleep: logs.filter(l => l.sleepHours).length,
      daysCheckedIn: logs.filter(l => l.motivationLevel).length,
    }, profile);

    const now = new Date();
    const report = await WeeklyReport.create({
      user: userId,
      weekNumber: Math.ceil(now.getDate() / 7),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      startDate: weekAgo,
      endDate: today,
      workoutsCompleted,
      workoutsPlanned: profile.trainingDaysPerWeek,
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

    await sendWeeklyReport(user, report);
    console.log(`✅ Weekly report generated & emailed for ${user.email}`);
  } catch (err) {
    console.error(`❌ Weekly report job error for user ${userId}:`, err.message);
  }
}

function startWeeklyReportJob() {
  // Every Sunday at 8:00 AM
  cron.schedule('0 8 * * 0', async () => {
    console.log('🔄 Running weekly report job for all users...');
    const profiles = await UserProfile.find({}).select('user');
    for (const p of profiles) {
      await generateAndEmailReport(p.user);
    }
  }, { timezone: 'Europe/Berlin' });

  console.log('✅ Weekly report cron job scheduled (every Sunday 8:00 AM)');
}

module.exports = { startWeeklyReportJob, generateAndEmailReport };
