import { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  BarChart3, RefreshCw, TrendingUp, Dumbbell, Salad,
  Moon, Brain, Star, AlertTriangle, CheckCircle, Zap, Calendar, MessageSquare,
} from 'lucide-react';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function ScoreRing({ score, max = 10, label, color }) {
  const pct = (score / max) * 100;
  const strokeColor = pct >= 70 ? '#22c55e' : pct >= 50 ? '#d946ef' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1a1a27" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none"
            stroke={strokeColor} strokeWidth="3"
            strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black text-white">{score}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

function StatRow({ icon: Icon, label, value, color = 'text-primary-400' }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <Icon size={15} className={color} />
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    reportsAPI.getAll()
      .then((r) => { setReports(r.data.reports); if (r.data.reports.length > 0) setSelected(r.data.reports[0]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const r = await reportsAPI.generate();
      setReports((prev) => [r.data.report, ...prev]);
      setSelected(r.data.report);
      setActiveTab('summary');
      toast.success('Weekly report generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 rounded-full border-4 border-dark-600 border-t-primary-500 animate-spin" />
    </div>
  );

  const tabs = [
    { id: 'summary',   label: 'Summary',    icon: BarChart3 },
    { id: 'problems',  label: 'What Went Wrong', icon: AlertTriangle },
    { id: 'plan',      label: 'Next Week Plan',  icon: Calendar },
    { id: 'coach',     label: 'Coach Message',   icon: MessageSquare },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Weekly Reports</h1>
          <p className="text-gray-400 text-sm">AI-powered accountability & improvement plan</p>
        </div>
        <button onClick={generateReport} disabled={generating} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
          <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Analyzing...' : 'Generate Report'}
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BarChart3 size={48} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Reports Yet</h2>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            Generate your first weekly report — your AI coach will analyze what went wrong,
            why it matters, and give you a concrete plan for next week.
          </p>
          <button onClick={generateReport} disabled={generating} className="btn-primary flex items-center gap-2 mx-auto">
            <TrendingUp size={18} />
            {generating ? 'Analyzing your week (may take ~30s)...' : 'Generate My First Report'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Report list sidebar */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">History</p>
            {reports.map((r) => (
              <button key={r._id} onClick={() => { setSelected(r); setActiveTab('summary'); }}
                className={`w-full text-left glass-card p-4 transition-all hover:border-primary-700/40
                  ${selected?._id === r._id ? 'border-primary-600/50 bg-primary-900/10' : ''}`}>
                <p className="font-semibold text-sm text-white">Week {r.weekNumber} — {r.month}/{r.year}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={10}
                      className={i < Math.round(r.overallProgressRating / 2) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                  ))}
                  <span className="text-xs text-gray-500">{r.overallProgressRating}/10</span>
                </div>
              </button>
            ))}
          </div>

          {/* Report detail */}
          {selected && (
            <div className="lg:col-span-2 space-y-4">

              {/* Score rings */}
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-lg">Week {selected.weekNumber}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(selected.startDate).toLocaleDateString()} – {new Date(selected.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-5">
                    <ScoreRing score={selected.overallProgressRating} label="Progress" />
                    <ScoreRing score={selected.mentalWellnessScore} label="Wellness" />
                    <ScoreRing score={Math.round(selected.workoutsCompleted / Math.max(selected.workoutsPlanned, 1) * 10)} label="Workouts" />
                  </div>
                </div>
                <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                    style={{ width: `${selected.overallProgressRating * 10}%` }} />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-dark-800 p-1 rounded-xl overflow-x-auto">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                      ${activeTab === id ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>

              {/* Tab: Summary */}
              {activeTab === 'summary' && (
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="glass-card p-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Weekly Stats</p>
                    <StatRow icon={Dumbbell} label="Workouts Completed" value={`${selected.workoutsCompleted} / ${selected.workoutsPlanned}`} />
                    <StatRow icon={Salad}   label="Avg Daily Calories" color="text-green-400" value={`${selected.avgDailyCalories} kcal`} />
                    <StatRow icon={Salad}   label="Avg Daily Protein"  color="text-primary-400" value={`${selected.avgDailyProtein}g`} />
                    <StatRow icon={Moon}    label="Avg Sleep"          color="text-blue-400"  value={`${selected.avgSleepHours}h`} />
                    <StatRow icon={Brain}   label="Avg Motivation"     color="text-purple-400" value={`${selected.avgMotivationLevel}/10`} />
                  </div>
                  {/* AI Summary */}
                  {selected.summary && (
                    <div className="glass-card p-5 border border-primary-800/20">
                      <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Coach Summary</p>
                      <p className="text-sm text-gray-200 leading-relaxed">{selected.summary}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: What Went Wrong */}
              {activeTab === 'problems' && (
                <div className="space-y-4">
                  {selected.whatWentWrong?.length > 0 && (
                    <div className="glass-card p-5">
                      <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <AlertTriangle size={13} /> What Went Wrong
                      </p>
                      <div className="space-y-2">
                        {selected.whatWentWrong.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-red-900/10 border border-red-800/20 rounded-xl">
                            <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                            <p className="text-sm text-gray-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.whyItMatters?.length > 0 && (
                    <div className="glass-card p-5">
                      <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Zap size={13} /> Why It Matters for Your Goal
                      </p>
                      <div className="space-y-2">
                        {selected.whyItMatters.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-yellow-900/10 border border-yellow-800/20 rounded-xl">
                            <span className="text-yellow-400 mt-0.5 flex-shrink-0">!</span>
                            <p className="text-sm text-gray-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.top3Improvements?.length > 0 && (
                    <div className="glass-card p-5">
                      <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CheckCircle size={13} /> Top 3 Actions for Next Week
                      </p>
                      <div className="space-y-2">
                        {selected.top3Improvements.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-green-900/10 border border-green-800/20 rounded-xl">
                            <span className="w-6 h-6 rounded-full bg-green-900/50 text-green-400 text-xs flex items-center justify-center font-bold flex-shrink-0">
                              {i + 1}
                            </span>
                            <p className="text-sm text-gray-200 font-medium">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Next Week Plan */}
              {activeTab === 'plan' && (
                <div className="glass-card p-5">
                  <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Calendar size={13} /> Your Daily Focus Plan — Next Week
                  </p>
                  {selected.nextWeekPlan && Object.keys(selected.nextWeekPlan).length > 0 ? (
                    <div className="space-y-2">
                      {DAYS.map((day, i) => selected.nextWeekPlan[day] && (
                        <div key={day} className="flex items-start gap-3 p-3 bg-dark-700/50 rounded-xl">
                          <div className="w-10 h-10 rounded-xl bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary-400">{DAY_LABELS[i]}</span>
                          </div>
                          <p className="text-sm text-gray-200 leading-relaxed pt-1">{selected.nextWeekPlan[day]}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No plan available — regenerate the report to get a detailed next-week plan.</p>
                  )}
                </div>
              )}

              {/* Tab: Coach Message */}
              {activeTab === 'coach' && (
                <div className="glass-card p-6 border border-primary-800/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                      <Zap size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Your AI Coach</p>
                      <p className="text-xs text-gray-400">Personal message for you</p>
                    </div>
                  </div>
                  <p className="text-base text-gray-100 leading-relaxed italic">
                    "{selected.coachMessage || selected.summary || 'Keep pushing — every week is a chance to be better than last week!'}"
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs text-gray-500 text-center">
                      Remember: consistency beats perfection. Show up every day. 🔥
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}
