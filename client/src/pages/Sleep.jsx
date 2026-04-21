import { useState, useEffect } from 'react';
import { logsAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Moon, Sun, Star } from 'lucide-react';

const QUALITY_LABELS = ['', 'Very Poor', 'Poor', 'OK', 'Good', 'Excellent'];

export default function Sleep() {
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ sleepTime: '23:00', wakeTime: '07:00', sleepQuality: 3, notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [weekLogs, setWeekLogs] = useState([]);

  useEffect(() => {
    Promise.all([logsAPI.getToday(), logsAPI.getWeek()])
      .then(([todayRes, weekRes]) => {
        const todayLog = todayRes.data.log;
        setLog(todayLog);
        setWeekLogs(weekRes.data.logs);
        if (todayLog?.sleepTime) {
          setForm({
            sleepTime: todayLog.sleepTime,
            wakeTime: todayLog.wakeTime || '07:00',
            sleepQuality: todayLog.sleepQuality || 3,
            notes: todayLog.sleepNotes || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const calcHours = (sleep, wake) => {
    const [sh, sm] = sleep.split(':').map(Number);
    const [wh, wm] = wake.split(':').map(Number);
    let h = wh + wm / 60 - (sh + sm / 60);
    if (h < 0) h += 24;
    return Math.round(h * 10) / 10;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await logsAPI.logSleep(form);
      setLog(r.data.log);
      toast.success('Sleep logged!');
    } catch { toast.error('Failed to log sleep'); }
    finally { setSubmitting(false); }
  };

  const previewHours = calcHours(form.sleepTime, form.wakeTime);
  const sleepColor = previewHours >= 8 ? 'text-green-400' : previewHours >= 7 ? 'text-yellow-400' : 'text-red-400';

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-4 border-dark-600 border-t-primary-500 animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black">Sleep Tracker</h1>
        <p className="text-gray-400 text-sm">Track your sleep for better recovery</p>
      </div>

      {/* Today's sleep summary */}
      {log?.sleepHours && (
        <div className="glass-card p-6 flex items-center gap-6">
          <div className="text-center">
            <p className={`text-5xl font-black ${log.sleepHours >= 7 ? 'text-green-400' : log.sleepHours >= 6 ? 'text-yellow-400' : 'text-red-400'}`}>
              {log.sleepHours}h
            </p>
            <p className="text-xs text-gray-400 mt-1">Last night</p>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <span className="flex items-center gap-1 text-sm text-gray-300"><Moon size={14} className="text-blue-400" />{log.sleepTime}</span>
              <span className="text-gray-600">→</span>
              <span className="flex items-center gap-1 text-sm text-gray-300"><Sun size={14} className="text-yellow-400" />{log.wakeTime}</span>
            </div>
            {log.sleepQuality && (
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < log.sleepQuality ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                ))}
                <span className="text-xs text-gray-400 ml-1">{QUALITY_LABELS[log.sleepQuality]}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {log?.sleepAnalysis && (
        <div className="glass-card p-5 border border-blue-800/20">
          <p className="text-xs font-semibold text-blue-400 mb-2">Coach Analysis</p>
          <p className="text-sm text-gray-200 leading-relaxed">{log.sleepAnalysis}</p>
        </div>
      )}

      {/* Log form */}
      <div className="glass-card p-6">
        <h2 className="font-bold mb-4">Log Tonight / Last Night</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Moon size={14} className="text-blue-400" /> Bedtime
              </label>
              <input type="time" className="input-field"
                value={form.sleepTime} onChange={(e) => setForm({ ...form, sleepTime: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Sun size={14} className="text-yellow-400" /> Wake up
              </label>
              <input type="time" className="input-field"
                value={form.wakeTime} onChange={(e) => setForm({ ...form, wakeTime: e.target.value })} />
            </div>
          </div>

          {/* Hours preview */}
          <div className="text-center py-3 bg-dark-700/50 rounded-xl">
            <p className={`text-3xl font-black ${sleepColor}`}>{previewHours}h</p>
            <p className="text-xs text-gray-400 mt-1">
              {previewHours >= 8 ? 'Optimal sleep!' : previewHours >= 7 ? 'Good sleep' : previewHours >= 6 ? 'Below optimal' : 'Too little sleep'}
            </p>
          </div>

          {/* Quality */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Sleep quality</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((q) => (
                <button key={q} type="button" onClick={() => setForm({ ...form, sleepQuality: q })}
                  className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition-all
                    ${form.sleepQuality === q ? 'border-primary-500/60 bg-primary-900/20' : 'border-white/10 bg-dark-700/40'}`}>
                  <Star size={16} className={q <= form.sleepQuality ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                  <span className="text-xs text-gray-400">{q}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">{QUALITY_LABELS[form.sleepQuality]}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
            <input type="text" className="input-field" placeholder="e.g. woke up in the middle of the night..."
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Analyzing sleep...' : 'Log Sleep'}
          </button>
        </form>
      </div>

      {/* Week chart */}
      {weekLogs.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">This Week</h3>
          <div className="flex items-end gap-2 h-24">
            {weekLogs.slice(-7).map((l, i) => {
              const h = l.sleepHours || 0;
              const pct = Math.min((h / 10) * 100, 100);
              const color = h >= 7 ? 'bg-green-500' : h >= 6 ? 'bg-yellow-500' : 'bg-red-500';
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-xs text-gray-500">{h}h</p>
                  <div className="w-full flex items-end justify-center h-16">
                    <div className={`w-full ${color} rounded-t-md transition-all`} style={{ height: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-600">{new Date(l.date).toLocaleDateString('en', { weekday: 'short' })}</p>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-xs">
            {[['bg-green-500', '≥7h (Optimal)'], ['bg-yellow-500', '6-7h (OK)'], ['bg-red-500', '<6h (Poor)']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1.5 text-gray-400">
                <div className={`w-3 h-3 rounded ${c}`} />{l}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
