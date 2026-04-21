// Browser Notification Service
// Schedules daily reminders based on user profile

const STORAGE_KEY = 'persona_notifications_scheduled';

export async function requestPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function sendNotification(title, body, icon = '/favicon.svg') {
  if (Notification.permission !== 'granted') return;
  const n = new Notification(title, { body, icon, badge: '/favicon.svg' });
  n.onclick = () => { window.focus(); n.close(); };
  return n;
}

function timeToMs(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const now = new Date();
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}

export function scheduleDaily(profile, todayLog) {
  if (Notification.permission !== 'granted') return;

  // Clear previous timers
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  stored.forEach(id => clearTimeout(id));
  localStorage.removeItem(STORAGE_KEY);

  const timers = [];
  const wakeH = parseInt(profile.wakeUpTime?.split(':')[0] || '7');
  const sleepH = parseInt(profile.sleepTime?.split(':')[0] || '23');

  const schedule = [
    // Morning briefing (wake up time)
    {
      time: profile.wakeUpTime || '07:00',
      title: '🌅 Good Morning, Champion!',
      body: `Day ${profile.currentDay || 1}: Check your workout and meal plan. Let\'s crush today!`,
    },
    // Breakfast reminder (30 min after wake up)
    {
      time: `${String(wakeH).padStart(2,'0')}:30`,
      title: '🍳 Breakfast Time!',
      body: 'Don\'t skip breakfast — fuel your body for the day ahead!',
    },
    // Pre-workout reminder (10:00)
    {
      time: '10:00',
      title: '💪 Pre-Workout Reminder',
      body: 'Your workout is waiting! Have a pre-workout snack 30 min before training.',
    },
    // Hydration reminders every ~2 hours
    { time: '09:00', title: '💧 Drink Water!', body: 'Stay hydrated — aim for 8 glasses today!' },
    { time: '11:00', title: '💧 Water Check', body: 'How many glasses have you had? Keep sipping!' },
    { time: '13:00', title: '🥗 Lunch Time!', body: 'Time for your midday meal. Check your meal plan!' },
    { time: '15:00', title: '💧 Afternoon Hydration', body: 'Drink a glass of water — you\'re halfway through the day!' },
    { time: '16:00', title: '🍎 Snack Time', body: 'A healthy snack keeps your metabolism going!' },
    { time: '19:00', title: '🍽️ Dinner Reminder', body: 'Time for dinner! Log your meal to track your macros.' },
    { time: '20:00', title: '✅ Daily Check-In', body: 'Did you complete your workout today? Log your progress!' },
    { time: '21:00', title: '🧠 Mental Wellness Check', body: 'How are you feeling? Rate your motivation (1-10) in the app.' },
    // Sleep reminder
    {
      time: `${String(sleepH - 1).padStart(2,'0')}:00`,
      title: '😴 Wind Down Time',
      body: `Bedtime in 1 hour. Log your sleep and prepare for tomorrow's workout!`,
    },
  ];

  schedule.forEach(({ time, title, body }) => {
    const delay = timeToMs(time);
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
      const id = setTimeout(() => sendNotification(title, body), delay);
      timers.push(id);
    }
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
  return timers.length;
}

export function cancelAll() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  stored.forEach(id => clearTimeout(id));
  localStorage.removeItem(STORAGE_KEY);
}
