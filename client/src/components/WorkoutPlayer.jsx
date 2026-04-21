import { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, ChevronRight, ChevronLeft, SkipForward, Check,
  Clock, Dumbbell, Zap, Trophy, Play, Pause, RotateCcw,
  Youtube, Heart, Flame,
} from 'lucide-react';

/* parse "60 seconds" / "90s" / "2 min" / "1-2 min" → seconds */
function parseRest(str = '') {
  const s = str.toLowerCase();
  const n = parseFloat(s.match(/[\d.]+/)?.[0] || '60');
  if (s.includes('min')) return Math.round(n * 60);
  return n || 60;
}

function getYouTubeSearchUrl(name) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' exercise tutorial form')}`;
}

const muscleEmojis = {
  chest:'💪',back:'🏋️',legs:'🦵',shoulders:'🤸',
  arms:'💪',biceps:'💪',triceps:'💪',core:'🔥',cardio:'🏃',default:'⚡',
};
function getMuscleEmoji(mg='') { return muscleEmojis[mg.toLowerCase().split(' ')[0]] || muscleEmojis.default; }

/* ── Rest Timer ── */
function RestTimer({ seconds, onDone, onSkip }) {
  const [left, setLeft] = useState(seconds);
  const [paused, setPaused] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (paused) return;
    ref.current = setInterval(() => {
      setLeft(p => {
        if (p <= 1) { clearInterval(ref.current); onDone(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [paused]);

  const pct = ((seconds - left) / seconds) * 100;
  const mins = Math.floor(left / 60);
  const secs = left % 60;

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 py-8">
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Rest Time</p>

      {/* Circular timer */}
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
          <circle cx="60" cy="60" r="54" fill="none"
            stroke="url(#timerGrad)" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 54}`}
            strokeDashoffset={`${2 * Math.PI * 54 * (1 - pct / 100)}`}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
          <defs>
            <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fb6027"/>
              <stop offset="100%" stopColor="#ec4899"/>
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-white">
            {mins > 0 ? `${mins}:${secs.toString().padStart(2,'0')}` : secs}
          </span>
          <span className="text-xs text-gray-500">seconds</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setPaused(p => !p)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dark-700 text-white font-semibold hover:bg-dark-600 transition-all border border-white/8">
          {paused ? <Play size={16}/> : <Pause size={16}/>}
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button onClick={onSkip}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all shadow-lg">
          <SkipForward size={16}/> Skip Rest
        </button>
      </div>
      <p className="text-xs text-gray-600">Next set starts automatically</p>
    </div>
  );
}

/* ── Completion Screen ── */
function CompletionScreen({ stats, onClose }) {
  const duration = Math.round((Date.now() - stats.startTime) / 60000);
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-5 py-8 text-center px-6">
      {/* Trophy animation */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-yellow-900/40"
          style={{ animation: 'pulse 2s ease-in-out infinite' }}>
          <Trophy size={44} className="text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <Check size={16} className="text-white" strokeWidth={3}/>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-black text-white mb-1">Workout Complete!</h2>
        <p className="text-gray-400">You absolutely crushed it 🔥</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {[
          { icon: Dumbbell, label: 'Exercises', value: stats.exercises, color: 'text-orange-400' },
          { icon: Zap, label: 'Total Sets', value: stats.sets, color: 'text-purple-400' },
          { icon: Clock, label: 'Duration', value: `${duration}m`, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="bg-dark-700/60 border border-white/8 rounded-2xl p-3">
            <s.icon size={18} className={`${s.color} mx-auto mb-1`}/>
            <p className="text-xl font-black text-white">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Motivational message */}
      <div className="bg-gradient-to-r from-orange-900/20 to-pink-900/20 border border-orange-500/20 rounded-2xl px-5 py-4 max-w-xs">
        <p className="text-sm text-orange-300 font-semibold">
          💪 {duration < 20 ? 'Fast and fierce! Every rep counts.' : duration < 45 ? 'Solid session! Consistency is key.' : 'Epic effort! Your body is thanking you.'}
        </p>
      </div>

      <button onClick={onClose}
        className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-black text-lg shadow-xl hover:opacity-90 transition-all hover:scale-105">
        Back to Training
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN WORKOUT PLAYER
══════════════════════════════════════════ */
export default function WorkoutPlayer({ day, onClose, onComplete }) {
  const exercises = (day?.exercises || []).filter(e => e.name);
  const totalExercises = exercises.length;

  const [exIdx, setExIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);          // current set (0-based)
  const [phase, setPhase] = useState('exercise');   // 'exercise' | 'rest' | 'done'
  const [weights, setWeights] = useState({});        // { exIdx: [w0, w1, ...] }
  const [repsLog, setRepsLog] = useState({});        // { exIdx: [r0, r1, ...] }
  const [startTime] = useState(Date.now());
  const [totalSets, setTotalSets] = useState(0);

  const ex = exercises[exIdx] || {};
  const totalSetsEx = parseInt(ex.sets) || 3;
  const targetReps = ex.reps || '10';
  const restSecs = parseRest(ex.rest);
  const emoji = getMuscleEmoji(ex.muscleGroup);

  // Weight/reps for current set
  const currentWeight = weights[exIdx]?.[setIdx] ?? '';
  const currentReps = repsLog[exIdx]?.[setIdx] ?? targetReps;

  const setWeight = (v) => setWeights(p => ({
    ...p, [exIdx]: Object.assign([...( p[exIdx] || Array(totalSetsEx).fill(''))], { [setIdx]: v })
  }));
  const setReps = (v) => setRepsLog(p => ({
    ...p, [exIdx]: Object.assign([...( p[exIdx] || Array(totalSetsEx).fill(targetReps))], { [setIdx]: v })
  }));

  const advanceAfterRest = useCallback(() => {
    const nextSet = setIdx + 1;
    if (nextSet < totalSetsEx) {
      setSetIdx(nextSet);
      setPhase('exercise');
    } else {
      const nextEx = exIdx + 1;
      if (nextEx < totalExercises) {
        setExIdx(nextEx);
        setSetIdx(0);
        setPhase('exercise');
      } else {
        setPhase('done');
        onComplete?.();
      }
    }
  }, [setIdx, totalSetsEx, exIdx, totalExercises, onComplete]);

  const handleSetDone = () => {
    setTotalSets(p => p + 1);
    if (setIdx + 1 < totalSetsEx || exIdx + 1 < totalExercises) {
      setPhase('rest');
    } else {
      setPhase('done');
      onComplete?.();
    }
  };

  const handleSkipRest = () => advanceAfterRest();
  const handleRestDone = () => advanceAfterRest();

  const handlePrevEx = () => {
    if (exIdx > 0) { setExIdx(p => p-1); setSetIdx(0); setPhase('exercise'); }
  };
  const handleNextEx = () => {
    if (exIdx + 1 < totalExercises) { setExIdx(p => p+1); setSetIdx(0); setPhase('exercise'); }
  };

  // Overall progress %
  const doneExSets = exercises.slice(0, exIdx).reduce((a, e) => a + (parseInt(e.sets)||3), 0);
  const totalAllSets = exercises.reduce((a, e) => a + (parseInt(e.sets)||3), 0);
  const progressPct = totalAllSets > 0 ? Math.round(((doneExSets + setIdx) / totalAllSets) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-dark-900" style={{ background: '#0a0a0f' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
            <Dumbbell size={16} className="text-white"/>
          </div>
          <div>
            <p className="font-black text-white text-sm leading-tight">{day?.title || `Day ${day?.day} Workout`}</p>
            <p className="text-xs text-gray-500">{totalExercises} exercises</p>
          </div>
        </div>
        <button onClick={onClose}
          className="w-9 h-9 rounded-xl bg-dark-700 hover:bg-dark-600 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/8">
          <X size={18}/>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-dark-700 flex-shrink-0">
        <div className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}/>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto flex flex-col">

        {phase === 'done' ? (
          <CompletionScreen
            stats={{ exercises: totalExercises, sets: totalSets, startTime }}
            onClose={onClose}
          />
        ) : phase === 'rest' ? (
          <RestTimer seconds={restSecs} onDone={handleRestDone} onSkip={handleSkipRest}/>
        ) : (
          <div className="flex flex-col flex-1 px-5 py-6 gap-5">

            {/* Exercise nav + counter */}
            <div className="flex items-center justify-between">
              <button onClick={handlePrevEx} disabled={exIdx === 0}
                className="w-9 h-9 rounded-xl bg-dark-700 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-all border border-white/5">
                <ChevronLeft size={18}/>
              </button>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Exercise {exIdx + 1} of {totalExercises}
              </p>
              <button onClick={handleNextEx} disabled={exIdx === totalExercises - 1}
                className="w-9 h-9 rounded-xl bg-dark-700 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-all border border-white/5">
                <ChevronRight size={18}/>
              </button>
            </div>

            {/* Exercise hero card */}
            <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-dark-800/60 p-6 text-center">
              <div className="absolute inset-0 opacity-10"
                style={{ background: 'radial-gradient(circle at 50% 30%, rgba(251,96,27,0.6), transparent 60%)' }}/>
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-pink-600/20 border border-orange-500/20 flex items-center justify-center text-4xl mx-auto mb-4">
                  {emoji}
                </div>
                <h2 className="text-2xl font-black text-white mb-1">{ex.name}</h2>
                {ex.muscleGroup && (
                  <p className="text-sm text-orange-400 font-semibold mb-3">{ex.muscleGroup}</p>
                )}
                {ex.equipment && ex.equipment !== 'none' && (
                  <span className="inline-block text-xs text-gray-400 bg-dark-700/60 border border-white/8 px-3 py-1 rounded-full">
                    🏋️ {ex.equipment}
                  </span>
                )}
              </div>
            </div>

            {/* Set dots */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Set {setIdx + 1} of {totalSetsEx}
              </p>
              <div className="flex gap-2">
                {Array.from({ length: totalSetsEx }).map((_, i) => (
                  <div key={i} className={`h-2.5 rounded-full transition-all duration-300 ${
                    i < setIdx ? 'w-6 bg-green-500' :
                    i === setIdx ? 'w-10 bg-gradient-to-r from-orange-500 to-pink-500' :
                    'w-2.5 bg-dark-600 border border-white/10'
                  }`}/>
                ))}
              </div>
            </div>

            {/* Reps + Weight inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-800/60 border border-white/8 rounded-2xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1 font-medium">Target Reps</p>
                <input
                  className="w-full text-center text-3xl font-black text-white bg-transparent focus:outline-none"
                  value={currentReps}
                  onChange={e => setReps(e.target.value)}
                />
                <p className="text-xs text-gray-600 mt-1">reps</p>
              </div>
              <div className="bg-dark-800/60 border border-white/8 rounded-2xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1 font-medium">Weight (kg)</p>
                <input
                  type="number"
                  className="w-full text-center text-3xl font-black text-orange-400 bg-transparent focus:outline-none"
                  placeholder="—"
                  value={currentWeight}
                  onChange={e => setWeight(e.target.value)}
                />
                <p className="text-xs text-gray-600 mt-1">optional</p>
              </div>
            </div>

            {/* Description tip */}
            {ex.description && (
              <div className="bg-dark-800/40 border border-white/5 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400 leading-relaxed">
                  💡 {ex.description.split('.')[0].trim()}.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 mt-auto pb-2">
              <a href={getYouTubeSearchUrl(ex.name)} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-red-900/20 border border-red-500/20 text-red-400 font-semibold text-sm hover:bg-red-900/30 transition-all">
                <Youtube size={16}/> Video
              </a>
              <button onClick={handleSetDone}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-black text-lg shadow-xl shadow-orange-900/30 hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Check size={20} strokeWidth={3}/>
                {setIdx + 1 < totalSetsEx ? `Set ${setIdx + 1} Done!` :
                  exIdx + 1 < totalExercises ? 'Next Exercise →' : 'Finish Workout!'}
              </button>
            </div>

            {/* Next exercise preview */}
            {exIdx + 1 < totalExercises && (
              <div className="flex items-center gap-3 bg-dark-800/30 border border-white/5 rounded-xl px-4 py-2.5">
                <p className="text-xs text-gray-600">Up next:</p>
                <span className="text-sm">{getMuscleEmoji(exercises[exIdx+1].muscleGroup)}</span>
                <p className="text-xs text-gray-400 font-semibold">{exercises[exIdx+1].name}</p>
                <span className="ml-auto text-xs text-gray-600">{exercises[exIdx+1].sets}×{exercises[exIdx+1].reps}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
