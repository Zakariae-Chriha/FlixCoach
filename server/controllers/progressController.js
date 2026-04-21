const multer = require('multer');
const path = require('path');
const ProgressPhoto = require('../models/ProgressPhoto');
const UserProfile = require('../models/UserProfile');
const claude = require('../services/claudeService');

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `progress_${req.user._id}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
};

exports.upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const profile = await UserProfile.findOne({ user: req.user._id });
    const now = new Date();
    const imageUrl = `${process.env.SERVER_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;

    // Generate AI analysis prompt
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

    const photo = await ProgressPhoto.create({
      user: req.user._id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      imagePath: req.file.path,
      imageUrl,
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
