const multer = require('multer');
const ProgressPhoto = require('../models/ProgressPhoto');
const UserProfile = require('../models/UserProfile');
const claude = require('../services/claudeService');
const { uploadBuffer } = require('../services/cloudinaryService');

exports.upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });

    const profile = await UserProfile.findOne({ user: req.user._id });

    const result = await uploadBuffer(req.file.buffer, {
      folder: 'flixcoach/progress',
      resource_type: 'image',
      public_id: `progress_${req.user._id}_${Date.now()}`,
    });

    const analysisPrompt = await claude.chat(
      [{
        role: 'user',
        content: `I just uploaded my monthly progress photo. Based on my profile (goal: ${profile?.primaryGoal || 'get fit'}, level: ${profile?.fitnessLevel || 'beginner'}), please provide a mock progress analysis.
Since you can't actually see the image, give me a template of what you would analyze:
- 3 things that likely improved
- 2 areas that likely need more work
- Whether I appear on track
- Recommendations for next month

Format as JSON: {
  "improvements": ["...", "...", "..."],
  "needsWork": ["...", "..."],
  "onTrack": true/false,
  "nextMonthAdjustments": "...",
  "overallFeedback": "..."
}
Return ONLY the JSON.`,
      }],
      profile
    );

    let analysis = { improvements: [], needsWork: [], onTrack: true, nextMonthAdjustments: '', overallFeedback: '' };
    try {
      const jsonMatch = analysisPrompt.match(/\{[\s\S]*\}/);
      if (jsonMatch) analysis = JSON.parse(jsonMatch[0]);
    } catch (e) {}

    const now = new Date();
    const photo = await ProgressPhoto.create({
      user: req.user._id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      imagePath: result.public_id,
      imageUrl: result.secure_url,
      analysis,
      analyzedAt: new Date(),
    });

    res.json({ success: true, photo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPhotos = async (req, res) => {
  try {
    const photos = await ProgressPhoto.find({ user: req.user._id }).sort({ uploadedAt: -1 });
    res.json({ success: true, photos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
