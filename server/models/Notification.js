const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['like', 'comment', 'activity_join', 'activity_reminder', 'new_activity_nearby', 'challenge', 'booking', 'general'],
    default: 'general',
  },
  message:   { type: String, required: true },
  link:      String,
  read:      { type: Boolean, default: false },
  fromUser:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fromName:  String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
