const cron = require('node-cron');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const TrainingProgram = require('../models/TrainingProgram');
const Booking = require('../models/Booking');
const { sendPushToUser } = require('../services/pushService');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({ from: `"FlixCoach" <${process.env.EMAIL_USER}>`, to, subject, html });
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

/* Daily workout reminder — 7:30 AM every day */
async function dailyWorkoutReminder() {
  try {
    const users = await User.find({ role: 'user', onboardingCompleted: true });
    for (const user of users) {
      const program = await TrainingProgram.findOne({ user: user._id, active: true });
      if (!program) continue;

      const today = new Date();
      const startDate = new Date(program.createdAt);
      const dayNum = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
      const todayDay = program.days?.find(d => d.day === dayNum);
      if (!todayDay || todayDay.completed) continue;

      const isRest = todayDay.type === 'rest' || todayDay.type === 'active_recovery';
      const msg = isRest
        ? { title: '😴 Rest Day', body: 'Today is your recovery day. Rest well — your muscles are growing!' }
        : { title: '💪 Workout Time!', body: `Day ${dayNum}: ${todayDay.title || 'Training'}. ${todayDay.exercises?.length || 0} exercises ready for you.` };

      await sendPushToUser(user._id, { ...msg, url: '/training' });

      await sendEmail(user.email, msg.title, `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0a0a0f;color:#fff;padding:30px;border-radius:16px;">
          <h2 style="color:#fb6027">${msg.title}</h2>
          <p style="color:#9ca3af">${msg.body}</p>
          <a href="${process.env.CLIENT_URL}/training" style="display:inline-block;background:linear-gradient(135deg,#fb6027,#ec4899);color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin-top:16px;">Open Training</a>
          <p style="color:#4b5563;font-size:12px;margin-top:20px">FlixCoach · AI-Powered Fitness</p>
        </div>
      `);
    }
    console.log('✅ Daily workout reminders sent');
  } catch (err) {
    console.error('Daily reminder error:', err.message);
  }
}

/* Session reminder — 30 min before booking */
async function sessionReminders() {
  try {
    const in30 = new Date(Date.now() + 30 * 60 * 1000);
    const in31 = new Date(Date.now() + 31 * 60 * 1000);

    const bookings = await Booking.find({
      status: 'confirmed',
      date: { $gte: new Date().toISOString().split('T')[0] },
    }).populate('client', 'name email').populate('coach', 'fullName');

    for (const b of bookings) {
      if (!b.startTime || !b.client) continue;
      const [h, m] = b.startTime.split(':').map(Number);
      const bookingTime = new Date(b.date);
      bookingTime.setHours(h, m, 0, 0);

      if (bookingTime >= in30 && bookingTime <= in31) {
        const coachName = b.coach?.fullName || 'your coach';

        await sendPushToUser(b.client._id, {
          title: '⏰ Session in 30 minutes!',
          body: `Your session with ${coachName} starts at ${b.startTime}. Get ready!`,
          url: '/coaches',
        });

        await sendEmail(b.client.email, '⏰ Your session starts in 30 minutes', `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0a0a0f;color:#fff;padding:30px;border-radius:16px;">
            <h2 style="color:#fb6027">Session starting soon!</h2>
            <p style="color:#9ca3af">Hey <strong>${b.client.name}</strong>, your coaching session with <strong>${coachName}</strong> starts at <strong>${b.startTime}</strong> today.</p>
            <a href="${process.env.CLIENT_URL}/coaches" style="display:inline-block;background:linear-gradient(135deg,#fb6027,#ec4899);color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin-top:16px;">View Session</a>
          </div>
        `);
      }
    }
  } catch (err) {
    console.error('Session reminder error:', err.message);
  }
}

/* Streak encouragement — Monday 9AM */
async function weeklyMotivation() {
  try {
    const users = await User.find({ role: 'user', onboardingCompleted: true });
    for (const user of users) {
      await sendPushToUser(user._id, {
        title: '🔥 New week, new gains!',
        body: 'Your weekly plan is ready. Let\'s make this week count.',
        url: '/dashboard',
      });
    }
    console.log('✅ Weekly motivation sent');
  } catch (err) {
    console.error('Weekly motivation error:', err.message);
  }
}

function startNotificationJobs() {
  // Daily workout reminder: 7:30 AM
  cron.schedule('30 7 * * *', dailyWorkoutReminder, { timezone: 'Europe/Berlin' });

  // Session reminders: every minute
  cron.schedule('* * * * *', sessionReminders);

  // Weekly motivation: Monday 9AM
  cron.schedule('0 9 * * 1', weeklyMotivation, { timezone: 'Europe/Berlin' });

  console.log('🔔 Notification jobs started');
}

module.exports = { startNotificationJobs };
