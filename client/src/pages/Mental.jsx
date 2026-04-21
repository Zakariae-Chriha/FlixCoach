import { useState, useEffect } from 'react';
import { logsAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Brain, Heart, TrendingUp } from 'lucide-react';

const MOODS = [
  { value: 'great', label: 'Great', emoji: '😄' },
  { value: 'good', label: 'Good', emoji: '🙂' },
  { value: 'okay', label: 'Okay', emoji: '😐' },
  { value: 'low', label: 'Low', emoji: '😔' },
  { value: 'bad', label: 'Bad', emoji: '😞' },
];

export default function Mental() {
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ motivationLevel: 7, mood: 'good', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [weekLogs, setWeekLogs] = useState([]);

  useEffect(() => {
    Promise.all([logsAPI.getToday(), logsAPI.getWeek()])
      .then(([todayRes, weekRes]) => {
        const todayLog = todayRes.data.log;
        setLog(todayLog);
        setWeekLogs(weekRes.data.logs);
        if (todayLog?.motivationLevel) {
          setForm({
            motivationLevel: todayLog.motivationLevel,
            mood: todayLog.mood || 'good',
            notes: todayLog.mentalNotes || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await logsAPI.logMental(form);
      setLog(r.data.log);
      toast.success('Check-in saved!');
    } catch { toast.error('Failed to save check-in'); }
    finally { setSubmitting(false); }
  };

  const motivColor = form.motivationLevel >= 8 ? 'text-green-400' :
    form.motivationLevel >= 5 ? 'text-yellow-400' : 'text-red-400';

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-4 border-dark-600 border-t-primary-500 animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black">Mental Wellness</h1>
        <p className="text-gray-400 text-sm">Daily check-in & psychological coaching</p>
      </div>

      {/* Today's check-in summary */}
      {log?.motivationLevel && (
        <div className="glass-card p-6 flex items-center gap-6">
          <div className="text-center">
            <p className={`text-5xl font-black ${log.motivationLevel >= 8 ? 'text-green-400' : log.motivationLevel >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
              {log.motivationLevel}
            </p>
            <p className="text-xs text-gray-400 mt-1">/ 10</p>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white mb-1">
              {MOODS.find((m) => m.value === log.mood)?.emoji} {MOODS.find((m) => m.value === log.mood)?.label} day
            </p>
            <p className="text-sm text-gray-400">
              {log.motivationLevel >= 8 ? "You're on fire today! Keep that energy up!" :
               log.motivationLevel >= 6 ? "Good energy — let's make it count!" :
               log.motivationLevel >= 4 ? "Tough day, but you showed up. That's what matters." :
               "Hard times build strong people. You've got this."}
            </p>
          </div>
        </div>
      )}

      {/* AI Coaching */}
      {log?.mentalCoaching && (
        <div className="glass-card p-5 border border-purple-800/20">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={16} className="text-purple-400" />
            <p className="text-xs font-semibold text-purple-400">Coach's Message For You</p>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">{log.mentalCoaching}</p>
        </div>
      )}

      {/* Check-in form */}
      <div className="glass-card p-6">
        <h2 className="font-bold mb-1 flex items-center gap-2">
          <Heart size={18} className="text-pink-400" /> Daily Check-In
        </h2>
        <p className="text-gray-400 text-sm mb-5">How are you feeling today?</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Motivation slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">Motivation Level</label>
              <span className={`text-2xl font-black ${motivColor}`}>{form.motivationLevel}/10</span>
            </div>
            <input
              type="range" min="1" max="10" step="1"
              value={form.motivationLevel}
              onChange={(e) => setForm({ ...form, motivationLevel: Number(e.target.value) })}
              className="w-full h-2 bg-dark-600 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>1 - No energy</span><span>10 - Unstoppable</span>
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Today's mood</label>
            <div className="flex gap-2">
              {MOODS.map((mood) => (
                <button key={mood.value} type="button"
                  onClick={() => setForm({ ...form, mood: mood.value })}
                  className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition-all
                    ${form.mood === mood.value ? 'border-primary-500/60 bg-primary-900/20' : 'border-white/10 bg-dark-700/40 hover:border-white/20'}`}>
                  <span className="text-xl">{mood.emoji}</span>
                  <span className="text-xs text-gray-400">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">What's on your mind? (optional)</label>
            <textarea
              className="input-field resize-none" rows={3}
              placeholder="Share how you're really feeling — I'm here for you..."
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Getting your coaching...' : 'Submit Check-In'}
          </button>
        </form>
      </div>

      {/* Week trends */}
      {weekLogs.length > 1 && (
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary-400" /> Motivation This Week
          </h3>
          <div className="flex items-end gap-2 h-20">
            {weekLogs.slice(-7).map((l, i) => {
              const v = l.motivationLevel || 0;
              const pct = (v / 10) * 100;
              const color = v >= 7 ? 'bg-green-500' : v >= 5 ? 'bg-yellow-500' : 'bg-red-500';
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-xs text-gray-500">{v || '-'}</p>
                  <div className="w-full flex items-end h-12">
                    <div className={`w-full ${color} rounded-t-md`} style={{ height: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-600">{new Date(l.date).toLocaleDateString('en', { weekday: 'short' })}</p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Avg: {Math.round(weekLogs.filter((l) => l.motivationLevel).reduce((s, l) => s + l.motivationLevel, 0) / weekLogs.filter((l) => l.motivationLevel).length * 10) / 10 || 'N/A'} / 10
          </p>
        </div>
      )}
    </div>
  );
}
