const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const DailyLog = require('../models/DailyLog');
const UserProfile = require('../models/UserProfile');
const TrainingProgram = require('../models/TrainingProgram');
const MealPlan = require('../models/MealPlan');
const User = require('../models/User');
const claude = require('../services/claudeService');
const { sendDailyEvaluation } = require('../services/emailService');

function todayDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// GET /api/checklist/today — returns today's task completion status
router.get('/today', protect, async (req, res) => {
  try {
    const log = await DailyLog.findOne({ user: req.user._id, date: todayDate() });
    const profile = await UserProfile.findOne({ user: req.user._id });
    const program = await TrainingProgram.findOne({ user: req.user._id, active: true });

    let todayWorkoutType = 'rest';
    if (program) {
      const dayNum = Math.min(
        Math.ceil((new Date() - new Date(program.generatedAt)) / (1000 * 60 * 60 * 24)) + 1, 30
      );
      const todayDay = program.days.find(d => d.day === dayNum);
      todayWorkoutType = todayDay?.type || 'rest';
    }

    const isRestDay = todayWorkoutType === 'rest' || todayWorkoutType === 'active_recovery';

    const tasks = [
      {
        id: 'workout',
        label: isRestDay ? 'Rest Day — Recovery' : 'Complete Workout',
        emoji: '💪',
        done: isRestDay ? true : (log?.workoutCompleted || false),
        route: '/training',
        category: 'fitness',
        skippable: isRestDay,
      },
      {
        id: 'breakfast',
        label: 'Log Breakfast',
        emoji: '🌅',
        done: log?.foodEntries?.some(e => e.mealTime === 'breakfast') || false,
        route: '/food-log',
        category: 'nutrition',
      },
      {
        id: 'lunch',
        label: 'Log Lunch',
        emoji: '☀️',
        done: log?.foodEntries?.some(e => e.mealTime === 'lunch') || false,
        route: '/food-log',
        category: 'nutrition',
      },
      {
        id: 'dinner',
        label: 'Log Dinner',
        emoji: '🌙',
        done: log?.foodEntries?.some(e => e.mealTime === 'dinner') || false,
        route: '/food-log',
        category: 'nutrition',
      },
      {
        id: 'water',
        label: 'Drink 8 Glasses of Water',
        emoji: '💧',
        done: (log?.waterIntake || 0) >= 8,
        route: '/dashboard',
        category: 'health',
        progress: log?.waterIntake || 0,
        target: 8,
      },
      {
        id: 'sleep',
        label: 'Log Sleep',
        emoji: '😴',
        done: !!log?.sleepHours,
        route: '/sleep',
        category: 'recovery',
      },
      {
        id: 'mental',
        label: 'Mental Wellness Check-In',
        emoji: '🧠',
        done: !!log?.motivationLevel,
        route: '/mental',
        category: 'wellness',
      },
    ];

    const doneTasks = tasks.filter(t => t.done || t.skippable).length;
    const completionPct = Math.round((doneTasks / tasks.length) * 100);
    const allDone = doneTasks === tasks.length;

    if (allDone && profile) {
      const lastActive = profile.lastActiveDate;
      const yesterday = new Date(todayDate());
      yesterday.setDate(yesterday.getDate() - 1);

      let newStreak = profile.currentStreak || 0;
      if (!lastActive || lastActive < yesterday) {
        newStreak = 1;
      } else if (lastActive.toDateString() === yesterday.toDateString()) {
        newStreak += 1;
      }

      await UserProfile.findOneAndUpdate(
        { user: req.user._id },
        {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, profile.longestStreak || 0),
          lastActiveDate: new Date(),
          totalDaysCompleted: (profile.totalDaysCompleted || 0) + 1,
        }
      );
    }

    res.json({
      success: true,
      tasks,
      completionPct,
      allDone,
      streak: profile?.currentStreak || 0,
      longestStreak: profile?.longestStreak || 0,
      totalDaysCompleted: profile?.totalDaysCompleted || 0,
      aiEvaluation: log?.dailyEvaluation || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/checklist/submit — AI evaluates the day and optionally emails result
router.post('/submit', protect, async (req, res) => {
  try {
    const log = await DailyLog.findOne({ user: req.user._id, date: todayDate() });
    const profile = await UserProfile.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id);

    const tasks = {
      workout: log?.workoutCompleted || false,
      breakfast: log?.foodEntries?.some(e => e.mealTime === 'breakfast') || false,
      lunch: log?.foodEntries?.some(e => e.mealTime === 'lunch') || false,
      dinner: log?.foodEntries?.some(e => e.mealTime === 'dinner') || false,
      water: (log?.waterIntake || 0) >= 8,
      sleep: !!log?.sleepHours,
      mental: !!log?.motivationLevel,
    };

    const doneTasks = Object.values(tasks).filter(Boolean).length;
    const completionPct = Math.round((doneTasks / 7) * 100);

    const prompt = `My client completed their daily checklist today. Here are the results:

✅ Tasks completed: ${doneTasks}/7 (${completionPct}%)
- Workout: ${tasks.workout ? '✅ Done' : '❌ Missed'}
- Breakfast logged: ${tasks.breakfast ? '✅' : '❌'}
- Lunch logged: ${tasks.lunch ? '✅' : '❌'}
- Dinner logged: ${tasks.dinner ? '✅' : '❌'}
- Water (8 glasses): ${tasks.water ? '✅' : '❌'} (${log?.waterIntake || 0} glasses)
- Sleep logged: ${tasks.sleep ? '✅' : '❌'} ${log?.sleepHours ? `(${log.sleepHours}h)` : ''}
- Mental check-in: ${tasks.mental ? '✅' : '❌'} ${log?.motivationLevel ? `(${log.motivationLevel}/10)` : ''}

Client profile: ${profile?.primaryGoal || 'get fit'}, ${profile?.fitnessLevel || 'beginner'}

Give a SHORT (3-4 sentence) personalized daily evaluation:
1. Acknowledge what they did well
2. Call out specifically what they missed and why it matters
3. Give ONE specific action for tomorrow
Be direct, motivating, and personal. No fluff.`;

    const evaluation = await claude.chat([{ role: 'user', content: prompt }], profile, { maxTokens: 300 });

    // Save evaluation to daily log
    await DailyLog.findOneAndUpdate(
      { user: req.user._id, date: todayDate() },
      { dailyEvaluation: evaluation },
      { upsert: true, new: true }
    );

    // Send email if configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      sendDailyEvaluation(user, evaluation, completionPct).catch(err =>
        console.error('Email send error:', err.message)
      );
    }

    res.json({ success: true, evaluation, completionPct, doneTasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
