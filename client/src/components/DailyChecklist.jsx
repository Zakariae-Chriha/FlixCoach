import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checklistAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { CheckCircle, Circle, ChevronRight, Flame, Trophy, Target, Zap, Send, Brain } from 'lucide-react';

const categoryColors = {
  fitness:   'border-l-primary-500',
  nutrition: 'border-l-green-500',
  health:    'border-l-blue-500',
  recovery:  'border-l-indigo-500',
  wellness:  'border-l-purple-500',
};

export default function DailyChecklist() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checklistAPI.getToday()
      .then(r => {
        setData(r.data);
        if (r.data.aiEvaluation) setEvaluation(r.data.aiEvaluation);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const r = await checklistAPI.submit();
      setEvaluation(r.data.evaluation);
      toast.success('AI evaluation complete! Check your email 📧');
    } catch {
      toast.error('Failed to get AI evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="glass-card p-5 animate-pulse">
      <div className="h-4 bg-dark-600 rounded w-1/3 mb-4" />
      <div className="space-y-2">
        {[1,2,3].map(i => <div key={i} className="h-10 bg-dark-600 rounded-xl" />)}
      </div>
    </div>
  );

  if (!data) return null;

  const { tasks, completionPct, allDone, streak, longestStreak, totalDaysCompleted } = data;

  const ringColor = completionPct === 100 ? '#22c55e'
    : completionPct >= 60 ? '#d946ef'
    : completionPct >= 30 ? '#eab308' : '#ef4444';

  return (
    <div className="glass-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Target size={20} className="text-primary-400" />
            Daily Accountability
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {allDone ? "🎉 All tasks done! You're crushing it!" : `${tasks.filter(t=>t.done).length}/${tasks.length} tasks completed`}
          </p>
        </div>

        {/* Ring progress */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1a1a27" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none"
              stroke={ringColor} strokeWidth="3"
              strokeDasharray={`${completionPct} ${100 - completionPct}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-black text-white">{completionPct}%</span>
          </div>
        </div>
      </div>

      {/* Streak stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Flame,  label: 'Streak', value: `${streak}d`,            color: 'text-orange-400', bg: 'bg-orange-900/20' },
          { icon: Trophy, label: 'Best',   value: `${longestStreak}d`,     color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
          { icon: Zap,    label: 'Total',  value: `${totalDaysCompleted}d`, color: 'text-primary-400', bg: 'bg-primary-900/20' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-2.5 text-center`}>
            <Icon size={14} className={`${color} mx-auto mb-1`} />
            <p className={`text-sm font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${completionPct}%`,
            background: completionPct === 100
              ? 'linear-gradient(90deg, #22c55e, #16a34a)'
              : 'linear-gradient(90deg, #d946ef, #a21caf)',
          }}
        />
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => !task.done && navigate(task.route)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-l-2 transition-all
              ${task.done
                ? 'bg-dark-700/30 border-l-green-500/50 opacity-70 cursor-default'
                : `bg-dark-700/60 ${categoryColors[task.category]} hover:bg-dark-600/60 hover:scale-[1.01]`
              }`}
          >
            <span className="text-lg flex-shrink-0">{task.emoji}</span>
            <div className="flex-1 text-left">
              <p className={`text-sm font-medium ${task.done ? 'text-gray-400 line-through' : 'text-white'}`}>
                {task.label}
              </p>
              {task.progress !== undefined && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-dark-600 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${Math.min((task.progress / task.target) * 100, 100)}%` }} />
                  </div>
                  <span className="text-xs text-gray-400">{task.progress}/{task.target}</span>
                </div>
              )}
            </div>
            {task.done
              ? <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
              : task.skippable
                ? <span className="text-xs text-gray-500">Rest Day</span>
                : <ChevronRight size={16} className="text-gray-500 flex-shrink-0" />
            }
          </button>
        ))}
      </div>

      {/* Submit button */}
      {!evaluation && (
        <button
          onClick={handleSubmit}
          disabled={submitting || completionPct === 0}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          <Send size={15} className={submitting ? 'animate-pulse' : ''} />
          {submitting ? 'AI is evaluating your day...' : 'Submit Day — Get AI Evaluation'}
        </button>
      )}

      {/* AI Evaluation result */}
      {evaluation && (
        <div className="bg-gradient-to-br from-primary-900/30 to-purple-900/30 border border-primary-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <Brain size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">AI Coach Evaluation</p>
              <p className="text-xs text-gray-400">Sent to your email ✉️</p>
            </div>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">{evaluation}</p>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-3 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
          >
            <Send size={11} /> {submitting ? 'Evaluating...' : 'Re-evaluate'}
          </button>
        </div>
      )}

      {/* Perfect day banner */}
      {allDone && !evaluation && (
        <div className="bg-gradient-to-r from-green-900/30 to-primary-900/30 border border-green-700/30 rounded-xl p-4 text-center">
          <p className="text-2xl mb-1">🏆</p>
          <p className="font-bold text-green-400">Perfect Day!</p>
          <p className="text-xs text-gray-400 mt-1">
            All {tasks.length} tasks done. Streak: {streak} days! Hit submit for your AI evaluation.
          </p>
        </div>
      )}
    </div>
  );
}
