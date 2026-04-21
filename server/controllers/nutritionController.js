const MealPlan = require('../models/MealPlan');
const UserProfile = require('../models/UserProfile');
const claude = require('../services/claudeService');

exports.generateMealPlan = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Please complete your profile first' });
    }

    const now = new Date();

    // Deactivate existing plans
    await MealPlan.updateMany({ user: req.user._id }, { active: false });

    const { days, dailyCalorieTarget } = await claude.generateMealPlan(profile);

    const plan = await MealPlan.create({
      user: req.user._id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      goal: profile.primaryGoal,
      dailyCalorieTarget,
      dailyProteinTarget: Math.round((dailyCalorieTarget * 0.3) / 4),
      days,
      active: true,
    });

    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getActivePlan = async (req, res) => {
  try {
    const plan = await MealPlan.findOne({ user: req.user._id, active: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'No active meal plan found' });
    }
    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTodayMeals = async (req, res) => {
  try {
    const plan = await MealPlan.findOne({ user: req.user._id, active: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'No active meal plan' });
    }

    const planStart = new Date(plan.generatedAt || Date.now());
    const today = new Date();
    const dayNumber = Math.min(
      Math.ceil((today - planStart) / (1000 * 60 * 60 * 24)) + 1,
      30
    );

    const todayMeals = plan.days.find((d) => d.day === dayNumber);
    res.json({
      success: true,
      meals: todayMeals,
      dayNumber,
      targets: {
        calories: plan.dailyCalorieTarget,
        protein: plan.dailyProteinTarget,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
