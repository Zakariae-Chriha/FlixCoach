const UserProfile = require('../models/UserProfile');
const User = require('../models/User');

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const {
      age, weight, height, gender,
      primaryGoal, fitnessLevel, trainingLocation,
      injuries, allergies, dietaryRestrictions,
      trainingDaysPerWeek, wakeUpTime, sleepTime,
      targetWeight,
    } = req.body;

    const profileData = {
      user: req.user._id,
      age, weight, height, gender,
      primaryGoal, fitnessLevel, trainingLocation,
      injuries: injuries || '',
      allergies: allergies || '',
      dietaryRestrictions: dietaryRestrictions || '',
      trainingDaysPerWeek, wakeUpTime, sleepTime,
      currentWeight: weight,
      targetWeight: targetWeight || null,
    };

    const profile = await UserProfile.findOneAndUpdate(
      { user: req.user._id },
      profileData,
      { upsert: true, new: true, runValidators: true }
    );

    await User.findByIdAndUpdate(req.user._id, { onboardingCompleted: true });

    res.json({ success: true, profile });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id }).populate('user', 'name email');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateWeight = async (req, res) => {
  try {
    const { weight } = req.body;
    const profile = await UserProfile.findOneAndUpdate(
      { user: req.user._id },
      { currentWeight: weight, updatedAt: Date.now() },
      { new: true }
    );
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
