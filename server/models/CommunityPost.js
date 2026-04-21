const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: String,
  authorPhoto: String,
  content:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const communityPostSchema = new mongoose.Schema({
  author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName:  String,
  authorPhoto: String,
  authorRole:  { type: String, enum: ['user', 'coach', 'admin'], default: 'user' },

  type: {
    type: String,
    enum: ['progress', 'achievement', 'activity_recap', 'tip', 'question', 'motivation', 'general'],
    default: 'general',
  },

  content:  { type: String, required: true },
  photo:    String,

  likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],

  tags:     [String],
  pinned:   { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CommunityPost', communityPostSchema);
