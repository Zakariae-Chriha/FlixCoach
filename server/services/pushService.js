const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

webpush.setVapidDetails(
  `mailto:${process.env.EMAIL_USER}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendPushToUser(userId, payload) {
  const subs = await PushSubscription.find({ user: userId });
  const results = await Promise.allSettled(
    subs.map(s => webpush.sendNotification(s.subscription, JSON.stringify(payload)))
  );
  // Remove expired subscriptions
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === 'rejected') {
      const code = results[i].reason?.statusCode;
      if (code === 404 || code === 410) await subs[i].deleteOne();
    }
  }
}

async function sendPushToAll(payload) {
  const subs = await PushSubscription.find({});
  await Promise.allSettled(
    subs.map(s => webpush.sendNotification(s.subscription, JSON.stringify(payload)))
  );
}

module.exports = { sendPushToUser, sendPushToAll };
