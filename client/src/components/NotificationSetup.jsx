import { useState, useEffect } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';
import { requestPermission, scheduleDaily, cancelAll } from '../services/notifications';
import { profileAPI } from '../services/api';

export default function NotificationSetup() {
  const [permission, setPermission] = useState(Notification?.permission || 'default');
  const [enabled, setEnabled] = useState(localStorage.getItem('notifications_enabled') === 'true');

  const enable = async () => {
    const granted = await requestPermission();
    if (granted) {
      setPermission('granted');
      setEnabled(true);
      localStorage.setItem('notifications_enabled', 'true');
      // Schedule with profile
      try {
        const r = await profileAPI.get();
        const count = scheduleDaily(r.data.profile);
        alert(`✅ Notifications enabled! ${count} daily reminders scheduled.`);
      } catch {
        scheduleDaily({});
      }
    } else {
      setPermission('denied');
      alert('Please allow notifications in your browser settings.');
    }
  };

  const disable = () => {
    cancelAll();
    setEnabled(false);
    localStorage.setItem('notifications_enabled', 'false');
  };

  if (!('Notification' in window)) return null;

  if (permission === 'denied') return (
    <div className="flex items-center gap-2 text-xs text-gray-500 bg-dark-700/50 rounded-xl px-3 py-2">
      <BellOff size={14} className="text-red-400" />
      Notifications blocked in browser settings
    </div>
  );

  return enabled && permission === 'granted' ? (
    <div className="flex items-center justify-between bg-green-900/20 border border-green-700/30 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2">
        <Bell size={16} className="text-green-400" />
        <div>
          <p className="text-sm font-medium text-green-300">Daily reminders active</p>
          <p className="text-xs text-gray-400">Workout, meals, sleep & water reminders</p>
        </div>
      </div>
      <button onClick={disable} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
        Disable
      </button>
    </div>
  ) : (
    <button
      onClick={enable}
      className="w-full flex items-center justify-between bg-primary-900/20 border border-primary-700/30
        hover:border-primary-500/50 rounded-xl px-4 py-3 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary-900/40 flex items-center justify-center group-hover:bg-primary-900/60">
          <Bell size={16} className="text-primary-400" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-white">Enable Daily Reminders</p>
          <p className="text-xs text-gray-400">Workout, meals, sleep, water & motivation</p>
        </div>
      </div>
      <span className="text-xs font-semibold text-primary-400 bg-primary-900/40 px-3 py-1 rounded-full">
        Enable
      </span>
    </button>
  );
}
