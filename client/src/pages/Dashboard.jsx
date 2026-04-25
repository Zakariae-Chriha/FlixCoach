import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { coachAPI, logsAPI, trainingAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Dumbbell, Salad, Moon, Brain, Droplets, Zap,
  TrendingUp, ChevronRight, MessageSquare, Plus, Flame,
} from 'lucide-react';
import DailyChecklist from '../components/DailyChecklist';
import NotificationSetup from '../components/NotificationSetup';
import { useTranslation } from 'react-i18next';

function StatCard({ icon: Icon, label, value, sub, color = 'primary', onClick }) {
  const colors = {
    primary: 'text-primary-400 bg-primary-900/30',
    blue: 'text-blue-400 bg-blue-900/30',
    green: 'text-green-400 bg-green-900/30',
    yellow: 'text-yellow-400 bg-yellow-900/30',
    purple: 'text-purple-400 bg-purple-900/30',
    orange: 'text-orange-400 bg-orange-900/30',
  };
  return (
    <button
      onClick={onClick}
      className="stat-card text-left hover:border-white/10 hover:bg-dark-700/80 transition-all duration-200 w-full"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      <p className="text-sm font-medium text-gray-300">{label}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </button>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [log, setLog] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [motivation, setMotivation] = useState('');
  const [water, setWater] = useState(0);
  const [briefing, setBriefing] = useState('');
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      const sessionId = searchParams.get('session_id');
      if (sessionId) {
        api.get(`/stripe/verify-session?session_id=${sessionId}`)
          .then(() => toast.success('🎉 Subscription activated! Welcome to your new plan!'))
          .catch(() => toast.success('Payment received! Your plan will be updated shortly.'));
      } else {
        toast.success('🎉 Subscription activated!');
      }
      setSearchParams({});
    }
    logsAPI.getToday().then((r) => { setLog(r.data.log); setWater(r.data.log?.waterIntake || 0); }).catch(() => {});
    trainingAPI.getToday().then((r) => setWorkout(r.data.workout)).catch(() => {});
    coachAPI.getMotivation().then((r) => setMotivation(r.data.message)).catch(() => {});
  }, []);

  const loadBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const r = await coachAPI.getBriefing();
      setBriefing(r.data.briefing);
    } catch {
      toast.error('Could not load briefing');
    } finally {
      setLoadingBriefing(false);
    }
  };

  const addWater = async () => {
    try {
      const newCount = water + 1;
      await logsAPI.logWater(newCount);
      setWater(newCount);
      if (newCount === 8) toast.success('Perfect hydration today!');
    } catch { toast.error('Failed to log water'); }
  };

  const firstName = user?.name?.split(' ')[0] || 'Athlete';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('dashboard.goodMorning') : hour < 17 ? t('dashboard.goodAfternoon') : t('dashboard.goodEvening');
  const today = new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : i18n.language === 'de' ? 'de-DE' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-gray-400 text-sm">{greeting} • {today}</p>
          <h1 className="text-2xl sm:text-3xl font-black">
            {firstName}! <span className="gradient-text">{t('dashboard.letsGo')}</span>
          </h1>
        </div>
        <button onClick={() => navigate('/chat')} className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm flex-shrink-0">
          <MessageSquare size={16} /> {t('dashboard.askCoach')}
        </button>
      </div>

      {/* Notifications setup */}
      <NotificationSetup />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Salad} label={t('dashboard.caloriesToday')} color="green"
          value={log?.totalCalories ? `${log.totalCalories}` : '—'}
          sub={log?.totalProtein ? `${log.totalProtein}g protein` : t('dashboard.logMeals')}
          onClick={() => navigate('/food-log')}
        />
        <StatCard
          icon={Dumbbell} label={t('dashboard.workout')} color="primary"
          value={log?.workoutCompleted ? 'Done ✓' : workout?.type || '—'}
          sub={workout?.title || t('dashboard.noProgram')}
          onClick={() => navigate('/training')}
        />
        <StatCard
          icon={Moon} label={t('dashboard.sleep')} color="blue"
          value={log?.sleepHours ? `${log.sleepHours}h` : '—'}
          sub={log?.sleepHours ? (log.sleepHours >= 7 ? t('dashboard.goodRecovery') : t('dashboard.needsImprovement')) : t('dashboard.logSleep')}
          onClick={() => navigate('/sleep')}
        />
        <StatCard
          icon={Brain} label={t('dashboard.motivation')} color="purple"
          value={log?.motivationLevel ? `${log.motivationLevel}/10` : '—'}
          sub={log?.mood || t('dashboard.checkIn')}
          onClick={() => navigate('/mental')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Daily Checklist — main feature */}
        <div className="lg:col-span-2">
          <DailyChecklist />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Water tracker */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Droplets size={18} className="text-blue-400" /> {t('dashboard.water')}
              </h3>
              <span className="text-sm font-bold text-blue-400">{water}/8</span>
            </div>
            <div className="flex gap-1.5 mb-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`flex-1 h-6 rounded-md transition-all duration-300
                  ${i < water ? 'bg-blue-500 shadow-sm shadow-blue-500/30' : 'bg-dark-600'}`} />
              ))}
            </div>
            <button onClick={addWater} className="btn-secondary w-full text-sm py-2 flex items-center gap-2 justify-center">
              <Plus size={14} /> {t('dashboard.addGlass')}
            </button>
          </div>

          {/* Motivation quote */}
          {motivation && (
            <div className="glass-card p-5 border border-primary-800/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-primary-400" />
                <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">{t('dashboard.dailyFuel')}</span>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed italic">"{motivation}"</p>
            </div>
          )}

          {/* Weekly report shortcut */}
          <button
            onClick={() => navigate('/reports')}
            className="glass-card p-4 w-full text-left hover:border-primary-700/40 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-900/30 flex items-center justify-center">
                <TrendingUp size={16} className="text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{t('dashboard.weeklyReport')}</p>
                <p className="text-xs text-gray-400">{t('dashboard.weeklyReportSub')}</p>
              </div>
              <ChevronRight size={16} className="text-gray-500 group-hover:text-primary-400 transition-colors" />
            </div>
          </button>
        </div>
      </div>

      {/* Today's workout preview */}
      {workout && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Dumbbell size={20} className="text-primary-400" /> {t('dashboard.todaysWorkout')}
            </h2>
            <button onClick={() => navigate('/training')} className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">
              View full <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold
              ${workout.type === 'rest' || workout.type === 'active_recovery'
                ? 'bg-blue-900/30 text-blue-400' : 'bg-primary-900/30 text-primary-400'}`}>
              {workout.type?.replace('_', ' ').toUpperCase()}
            </span>
            {workout.duration && <span className="text-gray-400 text-sm">{workout.duration} min</span>}
            {log?.workoutCompleted && <span className="px-2 py-0.5 rounded-full text-xs bg-green-900/30 text-green-400">Done ✓</span>}
          </div>
          <h3 className="font-semibold text-xl mb-3">{workout.title}</h3>
          {workout.exercises?.length > 0 ? (
            <div className="space-y-1">
              {workout.exercises.slice(0, 3).map((ex, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-sm text-gray-300">{ex.name}</span>
                  <span className="text-xs text-gray-500">{ex.sets} × {ex.reps}</span>
                </div>
              ))}
              {workout.exercises.length > 3 && (
                <p className="text-xs text-gray-500 pt-1">+{workout.exercises.length - 3} more</p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">{workout.notes || 'Rest day — recover and recharge!'}</p>
          )}
        </div>
      )}

      {/* AI Morning Briefing */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Flame size={20} className="text-orange-400" /> {t('dashboard.morningBriefing')}
          </h2>
          <button onClick={loadBriefing} disabled={loadingBriefing} className="btn-primary text-sm py-2 px-4">
            {loadingBriefing ? t('common.loading') : t('dashboard.getBriefing')}
          </button>
        </div>
        {briefing ? (
          <div className="bg-dark-700/50 rounded-xl p-4">
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{briefing}</p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Get your personalized daily overview, workout reminder, and meal plan from your AI coach.</p>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('dashboard.logMeal'), icon: Salad, to: '/food-log', color: 'from-green-600 to-emerald-600' },
          { label: t('dashboard.logSleepBtn'), icon: Moon, to: '/sleep', color: 'from-blue-600 to-indigo-600' },
          { label: t('dashboard.checkInBtn'), icon: Brain, to: '/mental', color: 'from-purple-600 to-violet-600' },
          { label: t('dashboard.chatCoach'), icon: MessageSquare, to: '/chat', color: 'from-primary-600 to-pink-600' },
        ].map(({ label, icon: Icon, to, color }) => (
          <button key={to} onClick={() => navigate(to)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br ${color} hover:opacity-90 transition-opacity`}>
            <Icon size={22} className="text-white" />
            <span className="text-xs font-semibold text-white">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
