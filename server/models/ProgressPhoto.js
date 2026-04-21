const mongoose = require('mongoose');

const progressPhotoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: Number,
  year: Number,
  imagePath: { type: String, required: true },
  imageUrl: String,
  analysis: {
    improvements: [String],
    needsWork: [String],
    onTrack: Boolean,
    nextMonthAdjustments: String,
    overallFeedback: String,
  },
  analyzedAt: Date,
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ProgressPhoto', progressPhotoSchema);
