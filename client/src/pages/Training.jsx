import { useState, useEffect } from 'react';
import { trainingAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Dumbbell, Zap, CheckCircle, Clock, RefreshCw, ChevronDown, ChevronUp, Youtube, Play, X } from 'lucide-react';
import WorkoutPlayer from '../components/WorkoutPlayer';

const typeColors = {
  strength: 'bg-primary-900/30 text-primary-400 border-primary-800/30',
  cardio: 'bg-orange-900/30 text-orange-400 border-orange-800/30',
  flexibility: 'bg-green-900/30 text-green-400 border-green-800/30',
  endurance: 'bg-blue-900/30 text-blue-400 border-blue-800/30',
  rest: 'bg-gray-800/50 text-gray-400 border-gray-700/30',
  active_recovery: 'bg-teal-900/30 text-teal-400 border-teal-800/30',
};

// Build a YouTube search URL for any exercise
function getYouTubeSearchUrl(exerciseName) {
  const query = encodeURIComponent(`${exerciseName} exercise tutorial proper form`);
  return `https://www.youtube.com/results?search_query=${query}`;
}

// Exercise muscle group images (emoji + color mapping)
const muscleColors = {
  chest: 'from-red-900/40 to-red-800/20',
  back: 'from-blue-900/40 to-blue-800/20',
  legs: 'from-green-900/40 to-green-800/20',
  shoulders: 'from-yellow-900/40 to-yellow-800/20',
  arms: 'from-purple-900/40 to-purple-800/20',
  biceps: 'from-purple-900/40 to-purple-800/20',
  triceps: 'from-pink-900/40 to-pink-800/20',
  core: 'from-orange-900/40 to-orange-800/20',
  cardio: 'from-cyan-900/40 to-cyan-800/20',
  default: 'from-primary-900/40 to-primary-800/20',
};

const muscleEmojis = {
  chest: '💪', back: '🏋️', legs: '🦵', shoulders: '🤸',
  arms: '💪', biceps: '💪', triceps: '💪', core: '🔥',
  cardio: '🏃', default: '⚡',
};

function VideoModal({ exercise, onClose }) {
  const muscleKey = exercise.muscleGroup?.toLowerCase().split(' ')[0] || 'default';
  const emoji = muscleEmojis[muscleKey] || muscleEmojis.default;
  const steps = exercise.description?.split(/\.|,/).filter(s => s.trim().length > 5) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg glass-card p-6" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-900/40 flex items-center justify-center text-2xl">
              {emoji}
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">{exercise.name}</h3>
              <p className="text-xs text-gray-400">{exercise.muscleGroup}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Sets × Reps', value: `${exercise.sets} × ${exercise.reps}` },
            { label: 'Rest', value: exercise.rest },
            { label: 'Equipment', value: exercise.equipment || 'None' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-dark-700/60 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-primary-300">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* How to perform */}
        {steps.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">How to perform</p>
            <div className="space-y-2">
              {steps.slice(0, 4).map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary-900/50 text-primary-400 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-300 leading-relaxed">{step.trim()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* YouTube button */}
        <a
          href={getYouTubeSearchUrl(exercise.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full py-4 rounded-xl
            bg-red-600 hover:bg-red-500 text-white font-bold text-base transition-all
            hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-900/30"
        >
          <Youtube size={22} />
          Watch "{exercise.name}" Tutorial on YouTube
        </a>
        <p className="text-xs text-gray-600 text-center mt-2">Opens YouTube in a new tab</p>
      </div>
    </div>
  );
}

function ExerciseCard({ exercise }) {
  const [showVideo, setShowVideo] = useState(false);
  const muscleKey = exercise.muscleGroup?.toLowerCase().split(' ')[0] || 'default';
  const gradientColor = muscleColors[muscleKey] || muscleColors.default;
  const emoji = muscleEmojis[muscleKey] || muscleEmojis.default;

  return (
    <>
      {showVideo && <VideoModal exercise={exercise} onClose={() => setShowVideo(false)} />}

      <div className={`rounded-xl border border-white/5 overflow-hidden bg-gradient-to-br ${gradientColor}`}>
        {/* Exercise header */}
        <div className="p-3 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-dark-800/60 flex items-center justify-center text-xl flex-shrink-0">
              {emoji}
            </div>
            <div>
              <p className="font-semibold text-sm text-white">{exercise.name}</p>
              {exercise.muscleGroup && (
                <p className="text-xs text-gray-400 mt-0.5">{exercise.muscleGroup}</p>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-primary-300">{exercise.sets} × {exercise.reps}</p>
            <p className="text-xs text-gray-500">Rest: {exercise.rest}</p>
          </div>
        </div>

        {/* Description */}
        {exercise.description && (
          <div className="px-3 pb-2">
            <p className="text-xs text-gray-400 leading-relaxed">{exercise.description}</p>
          </div>
        )}

        {/* Footer: equipment + video button */}
        <div className="px-3 pb-3 flex items-center justify-between">
          {exercise.equipment && exercise.equipment !== 'none' ? (
            <span className="text-xs text-gray-500 bg-dark-800/50 px-2 py-0.5 rounded-full">
              🏋️ {exercise.equipment}
            </span>
          ) : <span />}

          <button
            onClick={() => setShowVideo(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300
              bg-red-900/20 hover:bg-red-900/30 border border-red-800/30 px-3 py-1.5 rounded-lg transition-all"
          >
            <Play size={12} className="fill-current" /> Watch Video
          </button>
        </div>
      </div>
    </>
  );
}

function WorkoutDay({ day, isToday, onComplete, onStartPlayer }) {
  const [expanded, setExpanded] = useState(isToday);
  const isRest = day.type === 'rest' || day.type === 'active_recovery';

  return (
    <div className={`glass-card overflow-hidden transition-all duration-200
      ${isToday ? 'border-primary-700/40 shadow-lg shadow-primary-900/20' : ''}
      ${day.completed ? 'opacity-70' : ''}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold
            ${isToday ? 'bg-gradient-to-br from-primary-500 to-purple-600 text-white' : 'bg-dark-700 text-gray-300'}`}>
            {day.completed ? <CheckCircle size={18} className="text-green-400" /> : day.day}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{day.title || `Day ${day.day}`}</p>
              {isToday && <span className="px-2 py-0.5 text-xs bg-primary-900/40 text-primary-400 rounded-full border border-primary-800/30">Today</span>}
              {day.completed && <span className="px-2 py-0.5 text-xs bg-green-900/40 text-green-400 rounded-full">Done ✓</span>}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 text-xs rounded-full border ${typeColors[day.type] || typeColors.rest}`}>
                {day.type?.replace('_', ' ')}
              </span>
              {day.duration && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={10} /> {day.duration}m
                </span>
              )}
              {!isRest && day.exercises?.length > 0 && (
                <span className="text-xs text-gray-500">{day.exercises.length} exercises</span>
              )}
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5">
          {day.notes && (
            <div className="mt-3 p-3 bg-dark-700/50 rounded-xl">
              <p className="text-sm text-gray-300 italic">💡 {day.notes}</p>
            </div>
          )}

          {!isRest && day.exercises?.length > 0 ? (
            <div className="mt-3 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Exercises — click ▶ Watch Video for tutorials
              </p>
              {day.exercises.map((ex, i) => (
                <ExerciseCard key={i} exercise={ex} />
              ))}
            </div>
          ) : isRest ? (
            <div className="mt-3 text-center py-6">
              <p className="text-5xl mb-2">😴</p>
              <p className="text-sm text-gray-400 font-medium">Rest Day</p>
              <p className="text-xs text-gray-500 mt-1">Your muscles grow during recovery!</p>
            </div>
          ) : null}

          {isToday && !day.completed && !isRest && (
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => onStartPlayer(day)}
                className="flex-1 flex items-center gap-2 justify-center py-3 rounded-xl font-bold text-white text-sm
                  bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg shadow-orange-900/30 hover:opacity-90 transition-all hover:scale-[1.02]">
                <Play size={15} className="fill-white"/> Start Workout
              </button>
              <button
                onClick={() => onComplete(day.day)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 border border-white/8 hover:bg-white/5 transition-all">
                <CheckCircle size={15}/> Mark Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Training() {
  const [program, setProgram] = useState(null);
  const [todayDay, setTodayDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [weekFilter, setWeekFilter] = useState(0);
  const [activePlayer, setActivePlayer] = useState(null); // day object being played

  useEffect(() => {
    trainingAPI.getActive()
      .then((r) => setProgram(r.data.program))
      .catch(() => {})
      .finally(() => setLoading(false));
    trainingAPI.getToday().then((r) => setTodayDay(r.data.dayNumber || 1)).catch(() => {});
  }, []);

  const generateProgram = async () => {
    setGenerating(true);
    try {
      const r = await trainingAPI.generate();
      setProgram(r.data.program);
      toast.success('30-day training program generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate program');
    } finally {
      setGenerating(false);
    }
  };

  const markComplete = async (dayNum) => {
    try {
      const r = await trainingAPI.markComplete(dayNum);
      setProgram(r.data.program);
      toast.success('Workout complete! Great job! 🎉');
    } catch { toast.error('Failed to update'); }
  };

  const filteredDays = program?.days?.filter((d) =>
    weekFilter === 0 ? true : d.weekNumber === weekFilter
  ) || [];

  const completedCount = program?.days?.filter((d) => d.completed).length || 0;
  const totalDays = program?.days?.length || 30;

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 rounded-full border-4 border-dark-600 border-t-primary-500 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black">Training Program</h1>
          <p className="text-gray-400 text-sm">Your AI-generated 30-day plan</p>
        </div>
        <button onClick={generateProgram} disabled={generating} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4 flex-shrink-0">
          <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Generating...' : program ? 'Regenerate' : 'Generate Plan'}
        </button>
      </div>

      {program ? (
        <>
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-lg">{completedCount} / {totalDays} workouts</p>
                <p className="text-gray-400 text-sm">
                  {program.goal?.replace('_', ' ')} • {program.fitnessLevel} • {program.location?.replace('_', ' ')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black gradient-text">{Math.round((completedCount / totalDays) * 100)}%</p>
                <p className="text-xs text-gray-500">Complete</p>
              </div>
            </div>
            <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / totalDays) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {[0, 1, 2, 3, 4].map((w) => (
              <button key={w} onClick={() => setWeekFilter(w)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${weekFilter === w ? 'bg-primary-600 text-white' : 'bg-dark-700 text-gray-400 hover:text-white'}`}>
                {w === 0 ? 'All Days' : `Week ${w}`}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredDays.map((day) => (
              <WorkoutDay
                key={day.day}
                day={day}
                isToday={day.day === todayDay}
                onComplete={markComplete}
                onStartPlayer={setActivePlayer}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="glass-card p-12 text-center">
          <Dumbbell size={48} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Training Plan Yet</h2>
          <p className="text-gray-400 mb-6">
            Generate your personalized 30-day training program powered by AI.
            Each exercise includes a <span className="text-red-400 font-semibold">▶ Watch Video</span> tutorial button.
          </p>
          <button onClick={generateProgram} disabled={generating} className="btn-primary flex items-center gap-2 mx-auto">
            <Zap size={18} /> {generating ? 'Generating (may take ~30s)...' : 'Generate My 30-Day Plan'}
          </button>
          {generating && (
            <p className="text-xs text-gray-500 mt-4 animate-pulse">
              AI is building your personalized program...
            </p>
          )}
        </div>
      )}

      {activePlayer && (
        <WorkoutPlayer
          day={activePlayer}
          onClose={() => setActivePlayer(null)}
          onComplete={() => {
            markComplete(activePlayer.day);
            setTimeout(() => setActivePlayer(null), 3500);
          }}
        />
      )}
    </div>
  );
}
