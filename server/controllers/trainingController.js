const TrainingProgram = require('../models/TrainingProgram');
const UserProfile = require('../models/UserProfile');
const claude = require('../services/claudeService');

exports.generateProgram = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Please complete your profile first' });
    }

    const now = new Date();

    // Deactivate existing programs
    await TrainingProgram.updateMany({ user: req.user._id }, { active: false });

    // Generate program via Claude
    const days = await claude.generateTrainingProgram(profile);

    const program = await TrainingProgram.create({
      user: req.user._id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      goal: profile.primaryGoal,
      fitnessLevel: profile.fitnessLevel,
      location: profile.trainingLocation,
      days,
      active: true,
    });

    res.json({ success: true, program });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getActiveProgram = async (req, res) => {
  try {
    const program = await TrainingProgram.findOne({ user: req.user._id, active: true });
    if (!program) {
      return res.status(404).json({ success: false, message: 'No active training program found' });
    }
    res.json({ success: true, program });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markDayComplete = async (req, res) => {
  try {
    const { dayNumber } = req.params;
    const program = await TrainingProgram.findOne({ user: req.user._id, active: true });
    if (!program) {
      return res.status(404).json({ success: false, message: 'No active program found' });
    }

    const day = program.days.find((d) => d.day === parseInt(dayNumber));
    if (!day) {
      return res.status(404).json({ success: false, message: 'Day not found' });
    }

    day.completed = true;
    day.completedAt = new Date();
    await program.save();

    res.json({ success: true, message: `Day ${dayNumber} marked as complete!`, program });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTodayWorkout = async (req, res) => {
  try {
    const program = await TrainingProgram.findOne({ user: req.user._id, active: true });
    if (!program) {
      return res.json({ success: true, workout: null, dayNumber: 1 });
    }

    const programStart = new Date(program.generatedAt);
    const today = new Date();
    const dayNumber = Math.min(
      Math.ceil((today - programStart) / (1000 * 60 * 60 * 24)) + 1,
      30
    );

    const todayWorkout = program.days.find((d) => d.day === dayNumber);
    res.json({ success: true, workout: todayWorkout, dayNumber });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
