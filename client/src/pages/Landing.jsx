import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useState, useEffect, useRef } from 'react';
import {
  Zap, Dumbbell, Brain, Salad, BarChart3,
  ChevronRight, Users, Star, Shield, ArrowRight,
  Play, Check, Flame, Heart, Trophy,
} from 'lucide-react';

/* ─── CSS keyframes injected once ─── */
const CSS = `
@keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
@keyframes floatYr { 0%,100%{transform:translateY(0)} 50%{transform:translateY(10px)} }
@keyframes glowPulse { 0%,100%{opacity:.55} 50%{opacity:.9} }
@keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideRight { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
@keyframes runnerStride {
  0%   { transform: rotate(-8deg) }
  50%  { transform: rotate(8deg) }
  100% { transform: rotate(-8deg) }
}
@keyframes gradShift {
  0%   { background-position: 0% 50% }
  50%  { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}
@keyframes heartbeat { 0%,100%{transform:scale(1)} 25%{transform:scale(1.3)} 50%{transform:scale(1)} 75%{transform:scale(1.2)} }
@keyframes ringExpand { 0%{transform:scale(0.8);opacity:0.7} 100%{transform:scale(2);opacity:0} }
`;

/* ─── Athlete SVG Scene ─── */
function RunnerScene() {
  return (
    <div className="relative w-full h-full select-none">

      {/* Background glow rings */}
      {[0,1,2].map(i => (
        <div key={i} className="absolute rounded-full border border-orange-500/20"
          style={{
            width: `${260 + i*100}px`, height: `${260 + i*100}px`,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: `ringExpand ${2.5 + i * 0.8}s ease-out infinite`,
            animationDelay: `${i * 0.8}s`,
          }} />
      ))}

      {/* Central glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,96,27,0.22) 0%, rgba(236,72,153,0.12) 50%, transparent 70%)',
          animation: 'glowPulse 3s ease-in-out infinite',
        }} />
      </div>

      {/* ── MAIN RUNNER (center) ── */}
      <div className="absolute" style={{
        top: '50%', left: '50%',
        transform: 'translate(-50%, -60%)',
        animation: 'floatY 4s ease-in-out infinite',
        filter: 'drop-shadow(0 0 18px rgba(251,96,27,0.7))',
      }}>
        <svg width="160" height="260" viewBox="0 0 160 260">
          {/* glow behind */}
          <defs>
            <radialGradient id="og" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fb6027" />
              <stop offset="100%" stopColor="#ec4899" />
            </radialGradient>
          </defs>
          {/* Head */}
          <circle cx="88" cy="32" r="18" fill="url(#og)" opacity="0.95"/>
          {/* Torso – leaning forward */}
          <line x1="88" y1="50" x2="78" y2="130" stroke="url(#og)" strokeWidth="9" strokeLinecap="round"/>
          {/* Forward arm (left, reaching) */}
          <line x1="83" y1="72" x2="48" y2="108" stroke="#fb6027" strokeWidth="7" strokeLinecap="round"/>
          <line x1="48" y1="108" x2="30" y2="100" stroke="#fb6027" strokeWidth="6" strokeLinecap="round"/>
          {/* Back arm (right, pumping back) */}
          <line x1="86" y1="72" x2="118" y2="95" stroke="#ec4899" strokeWidth="7" strokeLinecap="round"/>
          <line x1="118" y1="95" x2="130" y2="82" stroke="#ec4899" strokeWidth="6" strokeLinecap="round"/>
          {/* Front leg (left, driving forward) */}
          <line x1="78" y1="130" x2="58" y2="185" stroke="url(#og)" strokeWidth="8" strokeLinecap="round"/>
          <line x1="58" y1="185" x2="32" y2="220" stroke="#fb6027" strokeWidth="7" strokeLinecap="round"/>
          {/* Back leg (right, pushing off) */}
          <line x1="78" y1="130" x2="108" y2="178" stroke="#ec4899" strokeWidth="8" strokeLinecap="round"/>
          <line x1="108" y1="178" x2="128" y2="205" stroke="#ec4899" strokeWidth="7" strokeLinecap="round"/>
          {/* Speed lines */}
          <line x1="140" y1="115" x2="160" y2="113" stroke="#fb6027" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
          <line x1="143" y1="125" x2="160" y2="123" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
          <line x1="138" y1="135" x2="155" y2="133" stroke="#fb6027" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
          {/* Ground shadow */}
          <ellipse cx="80" cy="248" rx="40" ry="6" fill="rgba(251,96,27,0.15)" />
        </svg>
      </div>

      {/* ── CYCLIST (left background) ── */}
      <div className="absolute" style={{
        bottom: '12%', left: '0%',
        animation: 'floatYr 5s ease-in-out infinite',
        filter: 'drop-shadow(0 0 10px rgba(139,92,246,0.5))',
        opacity: 0.65,
      }}>
        <svg width="110" height="120" viewBox="0 0 110 120">
          <defs>
            <linearGradient id="pur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6"/>
              <stop offset="100%" stopColor="#6366f1"/>
            </linearGradient>
          </defs>
          {/* Wheels */}
          <circle cx="22" cy="90" r="20" fill="none" stroke="url(#pur)" strokeWidth="3"/>
          <circle cx="88" cy="90" r="20" fill="none" stroke="url(#pur)" strokeWidth="3"/>
          <circle cx="22" cy="90" r="3" fill="#8b5cf6"/>
          <circle cx="88" cy="90" r="3" fill="#8b5cf6"/>
          {/* Frame */}
          <line x1="22" y1="90" x2="55" y2="55" stroke="url(#pur)" strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="55" y1="55" x2="88" y2="90" stroke="url(#pur)" strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="55" y1="55" x2="55" y2="72" stroke="url(#pur)" strokeWidth="3" strokeLinecap="round"/>
          <line x1="55" y1="55" x2="70" y2="48" stroke="url(#pur)" strokeWidth="3" strokeLinecap="round"/>
          {/* Rider */}
          <circle cx="62" cy="28" r="10" fill="url(#pur)" opacity="0.9"/>
          <line x1="62" y1="38" x2="58" y2="60" stroke="url(#pur)" strokeWidth="5" strokeLinecap="round"/>
          <line x1="58" y1="60" x2="40" y2="75" stroke="url(#pur)" strokeWidth="4" strokeLinecap="round"/>
          <line x1="58" y1="60" x2="73" y2="78" stroke="url(#pur)" strokeWidth="4" strokeLinecap="round"/>
          <line x1="62" y1="44" x2="72" y2="50" stroke="url(#pur)" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      </div>

      {/* ── LIFTER (right background) ── */}
      <div className="absolute" style={{
        bottom: '10%', right: '2%',
        animation: 'floatY 6s ease-in-out infinite',
        animationDelay: '1s',
        filter: 'drop-shadow(0 0 10px rgba(34,197,94,0.5))',
        opacity: 0.6,
      }}>
        <svg width="90" height="140" viewBox="0 0 90 140">
          <defs>
            <linearGradient id="grn" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e"/>
              <stop offset="100%" stopColor="#10b981"/>
            </linearGradient>
          </defs>
          {/* Head */}
          <circle cx="45" cy="18" r="13" fill="url(#grn)" opacity="0.9"/>
          {/* Torso */}
          <line x1="45" y1="31" x2="45" y2="85" stroke="url(#grn)" strokeWidth="7" strokeLinecap="round"/>
          {/* Barbell arms raised */}
          <line x1="45" y1="48" x2="10" y2="28" stroke="#22c55e" strokeWidth="5" strokeLinecap="round"/>
          <line x1="45" y1="48" x2="80" y2="28" stroke="#22c55e" strokeWidth="5" strokeLinecap="round"/>
          {/* Barbell bar */}
          <line x1="0" y1="25" x2="90" y2="25" stroke="#22c55e" strokeWidth="4" strokeLinecap="round"/>
          {/* Plates */}
          <rect x="0" y="17" width="8" height="16" rx="2" fill="#22c55e" opacity="0.8"/>
          <rect x="82" y="17" width="8" height="16" rx="2" fill="#22c55e" opacity="0.8"/>
          {/* Legs */}
          <line x1="45" y1="85" x2="28" y2="120" stroke="url(#grn)" strokeWidth="6" strokeLinecap="round"/>
          <line x1="45" y1="85" x2="62" y2="120" stroke="url(#grn)" strokeWidth="6" strokeLinecap="round"/>
          <line x1="28" y1="120" x2="22" y2="138" stroke="#22c55e" strokeWidth="5" strokeLinecap="round"/>
          <line x1="62" y1="120" x2="68" y2="138" stroke="#22c55e" strokeWidth="5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* ── FLOATING METRIC CARDS ── */}
      {/* Heart rate card */}
      <div className="absolute top-[8%] right-[8%] bg-dark-800/80 backdrop-blur-xl border border-red-500/20 rounded-2xl p-3 shadow-xl"
        style={{ animation: 'floatY 4s ease-in-out infinite', animationDelay: '0.5s' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Heart size={14} className="text-red-400" style={{ animation: 'heartbeat 1s ease-in-out infinite' }} />
          </div>
          <div>
            <p className="text-xs text-gray-500 leading-none">Heart Rate</p>
            <p className="text-base font-black text-white leading-tight">167 <span className="text-xs font-normal text-gray-400">bpm</span></p>
          </div>
        </div>
        <div className="mt-2 h-1 rounded-full bg-dark-700 overflow-hidden">
          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-red-500 to-orange-500" />
        </div>
      </div>

      {/* Calories card */}
      <div className="absolute top-[28%] left-[2%] bg-dark-800/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-3 shadow-xl"
        style={{ animation: 'floatYr 5s ease-in-out infinite', animationDelay: '1s' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Flame size={14} className="text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 leading-none">Calories</p>
            <p className="text-base font-black text-white leading-tight">842 <span className="text-xs font-normal text-gray-400">kcal</span></p>
          </div>
        </div>
      </div>

      {/* Achievement unlocked */}
      <div className="absolute bottom-[18%] left-[5%] bg-dark-800/80 backdrop-blur-xl border border-yellow-500/20 rounded-2xl px-3 py-2 shadow-xl"
        style={{ animation: 'floatYr 3.5s ease-in-out infinite', animationDelay: '1.5s' }}>
        <div className="flex items-center gap-2">
          <div className="text-xl">🏆</div>
          <div>
            <p className="text-xs font-bold text-yellow-400">Achievement!</p>
            <p className="text-xs text-gray-400">10K Personal Best</p>
          </div>
        </div>
      </div>

      {/* Pace badge */}
      <div className="absolute top-[52%] right-[3%] bg-dark-800/80 backdrop-blur-xl border border-green-500/20 rounded-2xl px-3 py-2 shadow-xl"
        style={{ animation: 'floatY 4.5s ease-in-out infinite', animationDelay: '0.8s' }}>
        <p className="text-xs text-gray-500">Pace</p>
        <p className="text-lg font-black text-green-400">4:32 <span className="text-xs font-normal text-gray-400">/km</span></p>
      </div>
    </div>
  );
}

/* ─── Feature card ─── */
const features = [
  { icon: Dumbbell, title: 'AI Training Plans', desc: 'Personalized 30-day workouts with progressive overload built in for your exact goals.', color: 'from-orange-500 to-red-500', glow: 'rgba(251,96,27,0.15)' },
  { icon: Salad, title: 'Smart Nutrition', desc: 'Complete meal programs with macros, recipes, and calorie tracking adapted to you.', color: 'from-green-500 to-emerald-500', glow: 'rgba(34,197,94,0.12)' },
  { icon: Users, title: 'Real Coaches', desc: 'Book sessions with certified coaches across 20+ specialties — in person or online.', color: 'from-blue-500 to-indigo-500', glow: 'rgba(99,102,241,0.12)' },
  { icon: Brain, title: 'Mental Wellness', desc: 'Daily check-ins, motivation scoring, and psychological coaching to keep you consistent.', color: 'from-purple-500 to-pink-500', glow: 'rgba(168,85,247,0.12)' },
  { icon: BarChart3, title: 'Weekly Reports', desc: 'Deep AI analysis every Sunday: what went wrong, why, and your exact plan for next week.', color: 'from-primary-500 to-purple-500', glow: 'rgba(139,92,246,0.12)' },
  { icon: Shield, title: 'Accountability', desc: 'Smart checklists, streak tracking, and AI evaluation sent directly to your email.', color: 'from-yellow-500 to-orange-500', glow: 'rgba(234,179,8,0.12)' },
];

const steps = [
  { n: '01', title: 'Create your profile', desc: 'Tell us your goals, level, and schedule. Takes 3 minutes.', emoji: '📝' },
  { n: '02', title: 'Get your AI plan', desc: 'Instant personalized training + nutrition plans generated just for you.', emoji: '⚡' },
  { n: '03', title: 'Train & track', desc: 'Log workouts, meals, sleep, and mood. AI adapts as you progress.', emoji: '🏋️' },
  { n: '04', title: 'Results guaranteed', desc: 'Weekly reports, real coach support, and measurable transformation.', emoji: '🏆' },
];

const testimonials = [
  { name: 'Sarah K.', role: 'Lost 18kg in 4 months', avatar: '👩', stars: 5, text: 'FlixCoach completely changed how I approach fitness. The AI plans are incredibly accurate and the coaches are world-class.' },
  { name: 'Marcus T.', role: 'Marathon runner', avatar: '🧔', stars: 5, text: 'Finally a platform that combines AI intelligence with real human coaching. My marathon time dropped by 22 minutes.' },
  { name: 'Lena M.', role: 'Yoga & wellness', avatar: '👩‍🦱', stars: 5, text: 'The mental wellness coaching feature is something I didn\'t know I needed. I feel stronger inside and out.' },
];

const sports = ['🏃 Running', '🚴 Cycling', '🏋️ Weightlifting', '🧘 Yoga', '🥊 Boxing', '🤸 CrossFit', '🏊 Swimming', '⚽ Team Sports', '🥾 Hiking', '🎯 Challenges'];

export default function Landing() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-dark-900 overflow-x-hidden">
      <SEO
        path="/"
        title="KI-Fitness & Personal Coaching"
        description="FlixCoach – Personalisierte KI-Trainingspläne, zertifizierte Coaches & Ernährungsberatung. Kostenlos starten. Made in Germany."
      />
      <style>{CSS}</style>

      {/* ══════════ NAV ══════════ */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 lg:px-10 py-4 border-b border-white/5 backdrop-blur-xl bg-dark-900/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-orange-900/40">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <span className="font-black text-white text-lg tracking-tight">
            Flix<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-primary-400">Coach</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[['Features','#features'],['How it works','#how-it-works'],['Pricing','#pricing']].map(([l,h]) => (
            <a key={l} href={h} className="text-sm text-gray-400 hover:text-white transition-colors">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">Sign In</button>
          <button onClick={() => navigate('/register')}
            className="text-sm font-bold bg-gradient-to-r from-orange-500 to-primary-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-orange-900/30 hover:opacity-90 transition-all hover:scale-105">
            Get Started
          </button>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: 'calc(100vh - 65px)' }}>

        {/* Deep space background */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 60% 40%, rgba(251,96,27,0.12) 0%, transparent 60%), radial-gradient(ellipse at 20% 70%, rgba(139,92,246,0.10) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(236,72,153,0.08) 0%, transparent 50%), #0a0a0f',
        }} />

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-center gap-12 py-16 lg:py-0" style={{ minHeight: 'calc(100vh - 65px)' }}>

          {/* LEFT: Text */}
          <div className="flex-1 lg:py-20" style={{ animation: visible ? 'slideRight 0.8s ease forwards' : 'none', opacity: 0 }}>

            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 rounded-full bg-orange-400" style={{ animation: 'glowPulse 1.5s ease-in-out infinite' }} />
              <span className="text-orange-300 text-sm font-semibold tracking-wide">AI-Powered Fitness Platform</span>
            </div>

            {/* Main headline */}
            <h1 className="font-black leading-[1.0] tracking-tight mb-6" style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}>
              <span className="text-white block">Train Smarter.</span>
              <span className="block" style={{
                background: 'linear-gradient(135deg, #fb6027, #f43f5e, #a855f7)',
                backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent',
                backgroundSize: '200% 200%', animation: 'gradShift 4s ease infinite',
              }}>
                Push Harder.
              </span>
              <span className="text-white block">Go Further.</span>
            </h1>

            <p className="text-gray-400 text-lg lg:text-xl mb-8 max-w-lg leading-relaxed">
              FlixCoach fuses <span className="text-white font-semibold">AI-powered personal training</span> with <span className="text-white font-semibold">real certified coaches</span> — your body transforms, your rules.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button onClick={() => navigate('/register')}
                className="group flex items-center justify-center gap-2 text-base font-black text-white px-8 py-4 rounded-2xl shadow-2xl shadow-orange-900/40 hover:scale-105 transition-all"
                style={{ background: 'linear-gradient(135deg, #fb6027, #f43f5e)' }}>
                Start Free Today
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => navigate('/coach/apply')}
                className="flex items-center justify-center gap-2 text-base font-semibold text-white px-8 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur">
                <Users size={16} /> Join as Coach
              </button>
            </div>

            {/* Trust row */}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex -space-x-2">
                {['🧑','👩','🧔','👩‍🦱','🧑‍🦲'].map((e,i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 border-2 border-dark-900 flex items-center justify-center text-base">{e}</div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 mb-0.5">
                  {[...Array(5)].map((_,i) => <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-xs text-gray-400"><span className="text-white font-bold">2,400+</span> athletes already transforming</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
                <Check size={13} className="text-green-400" /> No credit card required
              </div>
            </div>
          </div>

          {/* RIGHT: Athlete scene */}
          <div className="flex-1 relative" style={{ height: '540px', minWidth: '320px', animation: visible ? 'slideUp 1s ease 0.3s forwards' : 'none', opacity: 0 }}>
            <RunnerScene />
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, transparent, #0a0a0f)',
        }} />
      </section>

      {/* ══════════ SPORTS TICKER ══════════ */}
      <div className="py-5 border-y border-white/5 overflow-hidden bg-dark-800/30">
        <div className="flex gap-10 whitespace-nowrap" style={{ animation: 'ticker 20s linear infinite' }}>
          {[...sports, ...sports].map((s, i) => (
            <span key={i} className="text-sm font-semibold text-gray-500 flex-shrink-0">{s}</span>
          ))}
        </div>
      </div>

      {/* ══════════ STATS STRIP ══════════ */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { v: '20+', l: 'Coach Specialties', icon: '🎓', c: 'from-blue-500 to-indigo-500' },
            { v: '2.4K', l: 'Active Athletes', icon: '🏃', c: 'from-orange-500 to-red-500' },
            { v: '98%', l: 'Satisfaction Rate', icon: '⭐', c: 'from-yellow-500 to-amber-500' },
            { v: 'Free', l: 'To Get Started', icon: '🚀', c: 'from-green-500 to-emerald-500' },
          ].map(s => (
            <div key={s.l} className="relative overflow-hidden rounded-2xl border border-white/8 p-6 text-center bg-dark-800/40 hover:border-white/15 transition-all group"
              style={{ boxShadow: '0 0 30px rgba(0,0,0,0.3)' }}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${s.c} mb-1`}>{s.v}</div>
              <div className="text-xs text-gray-400 font-medium">{s.l}</div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${s.c} opacity-0 group-hover:opacity-100 transition-all`} />
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section id="features" className="py-16 px-6 bg-dark-800/20" style={{ scrollMarginTop: '70px' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">Everything you need</span>
            <h2 className="text-3xl md:text-5xl font-black mt-2 mb-3">
              One platform.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400">
                Infinite results.
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">AI training + real coaches + smart tracking — all working together for you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color, glow }, i) => (
              <div key={title} className="group relative overflow-hidden rounded-2xl border border-white/6 bg-dark-800/50 p-6 hover:border-white/12 transition-all duration-300 hover:-translate-y-1 cursor-default"
                style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${glow}, transparent 60%)` }} />
                <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="relative font-bold text-base mb-2 text-white group-hover:text-white">{title}</h3>
                <p className="relative text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section id="how-it-works" className="py-20 px-6" style={{ scrollMarginTop: '70px' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Simple process</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2">
              From zero to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">results</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.n} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-orange-500/30 to-transparent z-0" style={{ width: 'calc(100% - 2rem)', left: 'calc(50% + 2rem)' }} />
                )}
                <div className="relative z-10 text-center p-6 rounded-2xl border border-white/6 bg-dark-800/40 hover:border-orange-500/20 transition-all group">
                  <div className="text-3xl mb-3">{s.emoji}</div>
                  <div className="text-xs font-black text-orange-500/60 mb-1 tracking-widest">{s.n}</div>
                  <h3 className="font-bold text-white mb-2 text-sm">{s.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="py-16 px-6 bg-dark-800/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Real results</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2">
              They <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">transformed</span>. You're next.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="relative overflow-hidden rounded-2xl border border-white/6 bg-dark-800/50 p-6 hover:border-white/12 transition-all">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_,i) => <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-lg">{t.avatar}</div>
                  <div>
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ BIG CTA ══════════ */}
      <section id="pricing" className="py-20 px-6" style={{ scrollMarginTop: '70px' }}>
        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-12 text-center" style={{
            background: 'linear-gradient(135deg, rgba(251,96,27,0.15), rgba(168,85,247,0.15))',
            border: '1px solid rgba(251,96,27,0.2)',
          }}>
            <div className="absolute inset-0 opacity-30" style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(251,96,27,0.4), transparent 70%)',
            }} />
            {/* Spinning ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-orange-500/10"
              style={{ animation: 'spinSlow 20s linear infinite' }} />
            <div className="relative z-10">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">
                Your transformation<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">
                  starts today.
                </span>
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">Join 2,400+ athletes who chose to stop guessing and start progressing. No credit card. No excuses.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate('/register')}
                  className="group flex items-center justify-center gap-2 font-black text-white text-lg px-10 py-4 rounded-2xl shadow-2xl shadow-orange-900/50 hover:scale-105 transition-all"
                  style={{ background: 'linear-gradient(135deg, #fb6027, #f43f5e)' }}>
                  Get Started Free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => navigate('/coach/apply')}
                  className="flex items-center justify-center gap-2 font-semibold text-white text-lg px-10 py-4 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition-all backdrop-blur">
                  <Zap size={18} /> Become a Coach
                </button>
              </div>
              <p className="mt-5 text-xs text-gray-500 flex items-center justify-center gap-1.5">
                <Check size={12} className="text-green-400" /> Free plan available
                <span className="mx-2 text-gray-700">·</span>
                <Check size={12} className="text-green-400" /> No credit card needed
                <span className="mx-2 text-gray-700">·</span>
                <Check size={12} className="text-green-400" /> Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-white/5 px-6 lg:px-10 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-primary-600 flex items-center justify-center">
              <Zap size={15} className="text-white fill-white" />
            </div>
            <span className="font-black text-white">Flix<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-primary-400">Coach</span></span>
          </div>
          <p className="text-xs text-gray-600 text-center">© 2026 FlixCoach · AI-Powered Fitness Platform · Deutschland</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link to="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link>
            <Link to="/impressum" className="hover:text-white transition-colors">Impressum</Link>
            <a href="mailto:chrihazakaria@gmail.com" className="hover:text-white transition-colors">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
