const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const protect = require('../middleware/auth');
const CommunityPost = require('../models/CommunityPost');
const Notification = require('../models/Notification');
const User = require('../models/User');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/community');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/community/feed — paginated feed
router.get('/feed', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const posts = await CommunityPost.find()
      .sort({ pinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await CommunityPost.countDocuments();
    res.json({ success: true, posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/community/posts — create post
router.post('/posts', protect, upload.single('photo'), async (req, res) => {
  try {
    const { content, type, tags } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content is required' });

    const post = await CommunityPost.create({
      author:      req.user._id,
      authorName:  req.user.name,
      authorRole:  req.user.role,
      content,
      type:  type || 'general',
      photo: req.file ? `/uploads/community/${req.file.filename}` : undefined,
      tags:  tags ? tags.split(',').map(t => t.trim()) : [],
    });

    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/community/posts/:id/like — toggle like
router.post('/posts/:id/like', protect, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const liked = post.likes.includes(req.user._id);
    if (liked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
      // Notify post author
      if (post.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.author,
          type: 'like',
          message: `${req.user.name} liked your post 💪`,
          link: '/community',
          fromUser: req.user._id,
          fromName: req.user.name,
        });
      }
    }
    await post.save();
    res.json({ success: true, likes: post.likes.length, liked: !liked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/community/posts/:id/comment — add comment
router.post('/posts/:id/comment', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Comment cannot be empty' });

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = { author: req.user._id, authorName: req.user.name, content };
    post.comments.push(comment);
    await post.save();

    // Notify post author
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        type: 'comment',
        message: `${req.user.name} commented on your post 💬`,
        link: '/community',
        fromUser: req.user._id,
        fromName: req.user.name,
      });
    }

    res.json({ success: true, comment: post.comments[post.comments.length - 1] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/community/posts/:id — delete own post
router.delete('/posts/:id', protect, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await post.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/community/notifications — user notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    const unread = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json({ success: true, notifications, unread });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/community/notifications/read — mark all read
router.patch('/notifications/read', protect, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
