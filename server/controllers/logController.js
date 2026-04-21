const DailyLog = require('../models/DailyLog');
const UserProfile = require('../models/UserProfile');
const MealPlan = require('../models/MealPlan');
const claude = require('../services/claudeService');

function todayDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getOrCreateLog(userId) {
  let log = await DailyLog.findOne({ user: userId, date: todayDate() });
  if (!log) {
    log = await DailyLog.create({ user: userId, date: todayDate() });
  }
  return log;
}

exports.getTodayLog = async (req, res) => {
  try {
    const log = await getOrCreateLog(req.user._id);
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logFood = async (req, res) => {
  try {
    const { name, quantity, protein, carbs, fats, calories, mealTime } = req.body;

    const log = await getOrCreateLog(req.user._id);
    log.foodEntries.push({ name, quantity, protein, carbs, fats, calories, mealTime });

    // Recalculate totals
    log.totalProtein = log.foodEntries.reduce((s, e) => s + (e.protein || 0), 0);
    log.totalCarbs = log.foodEntries.reduce((s, e) => s + (e.carbs || 0), 0);
    log.totalFats = log.foodEntries.reduce((s, e) => s + (e.fats || 0), 0);
    log.totalCalories = log.foodEntries.reduce((s, e) => s + (e.calories || 0), 0);

    // Generate AI analysis
    const profile = await UserProfile.findOne({ user: req.user._id });
    const mealPlan = await MealPlan.findOne({ user: req.user._id, active: true });

    if (profile && log.foodEntries.length >= 1) {
      log.foodAnalysis = await claude.analyzeFoodLog(log.foodEntries, profile, {
        totalCalories: log.totalCalories,
        totalProtein: log.totalProtein,
        totalCarbs: log.totalCarbs,
        totalFats: log.totalFats,
        calorieTarget: mealPlan?.dailyCalorieTarget || 2000,
        proteinTarget: mealPlan?.dailyProteinTarget || 150,
      });
    }

    await log.save();
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeFoodEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const log = await getOrCreateLog(req.user._id);
    log.foodEntries = log.foodEntries.filter((e) => e._id.toString() !== entryId);

    log.totalProtein = log.foodEntries.reduce((s, e) => s + (e.protein || 0), 0);
    log.totalCarbs = log.foodEntries.reduce((s, e) => s + (e.carbs || 0), 0);
    log.totalFats = log.foodEntries.reduce((s, e) => s + (e.fats || 0), 0);
    log.totalCalories = log.foodEntries.reduce((s, e) => s + (e.calories || 0), 0);

    await log.save();
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logSleep = async (req, res) => {
  try {
    const { sleepTime, wakeTime, sleepQuality, notes } = req.body;

    const log = await getOrCreateLog(req.user._id);
    log.sleepTime = sleepTime;
    log.wakeTime = wakeTime;

    // Calculate hours
    const [sh, sm] = sleepTime.split(':').map(Number);
    const [wh, wm] = wakeTime.split(':').map(Number);
    let sleepHours = wh + wm / 60 - (sh + sm / 60);
    if (sleepHours < 0) sleepHours += 24;
    log.sleepHours = Math.round(sleepHours * 10) / 10;
    log.sleepQuality = sleepQuality || 3;
    log.sleepNotes = notes || '';

    const profile = await UserProfile.findOne({ user: req.user._id });
    if (profile) {
      log.sleepAnalysis = await claude.analyzeSleep(log.sleepHours, profile);
    }

    await log.save();
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logMentalWellness = async (req, res) => {
  try {
    const { motivationLevel, mood, notes } = req.body;

    const log = await getOrCreateLog(req.user._id);
    log.motivationLevel = motivationLevel;
    log.mood = mood;
    log.mentalNotes = notes || '';

    const profile = await UserProfile.findOne({ user: req.user._id });
    if (profile) {
      log.mentalCoaching = await claude.generateMentalCoaching(motivationLevel, mood, notes, profile);
    }

    await log.save();
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logWorkout = async (req, res) => {
  try {
    const { completed, duration, notes } = req.body;
    const log = await getOrCreateLog(req.user._id);
    log.workoutCompleted = completed;
    log.workoutDuration = duration || 0;
    log.workoutNotes = notes || '';
    await log.save();
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logWater = async (req, res) => {
  try {
    const { glasses } = req.body;
    const log = await getOrCreateLog(req.user._id);
    log.waterIntake = glasses;
    await log.save();
    res.json({ success: true, waterIntake: log.waterIntake });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.analyzeMealPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });

    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const result = await claude.analyzeMealPhoto(base64, mimeType);
    if (result.error) return res.status(422).json({ success: false, message: result.error });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getWeekLogs = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const logs = await DailyLog.find({
      user: req.user._id,
      date: { $gte: weekAgo, $lte: today },
    }).sort({ date: 1 });

    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
