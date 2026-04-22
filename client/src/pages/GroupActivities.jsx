import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  MapPin, Clock, Users, Plus, X, Calendar, Filter,
  Zap, ChevronDown, Star, CheckCircle2, ArrowRight,
  Flame, Trophy, Search,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'Running / Jogging',   emoji: '🏃', gradient: 'from-orange-500 to-red-500' },
  { value: 'Cycling',             emoji: '🚴', gradient: 'from-blue-500 to-cyan-500' },
  { value: 'Hiking / Trail',      emoji: '🥾', gradient: 'from-green-500 to-emerald-500' },
  { value: 'Swimming',            emoji: '🏊', gradient: 'from-sky-500 to-blue-600' },
  { value: 'Boxing / Kickboxing', emoji: '🥊', gradient: 'from-red-500 to-pink-600' },
  { value: 'MMA / Martial Arts',  emoji: '🥋', gradient: 'from-rose-500 to-red-700' },
  { value: 'Bootcamp / CrossFit', emoji: '💪', gradient: 'from-orange-500 to-amber-600' },
  { value: 'Yoga / Meditation',   emoji: '🧘', gradient: 'from-violet-500 to-purple-600' },
  { value: 'Group Gym Session',   emoji: '🏋️', gradient: 'from-primary-500 to-purple-600' },
  { value: 'Street Workout',      emoji: '🤸', gradient: 'from-yellow-500 to-orange-500' },
  { value: 'Beach / Football',    emoji: '⚽', gradient: 'from-green-500 to-teal-500' },
  { value: 'Fitness Challenge',   emoji: '🎯', gradient: 'from-pink-500 to-rose-600' },
];

const LEVELS = [
  { value: '',             label: 'All', color: 'from-gray-500 to-gray-600' },
  { value: 'beginner',    label: 'Beginner', color: 'from-green-500 to-emerald-500' },
  { value: 'intermediate', label: 'Inter.', color: 'from-yellow-500 to-amber-500' },
  { value: 'advanced',    label: 'Advanced', color: 'from-red-500 to-rose-600' },
];

function Avatar({ name, size = 7 }) {
  const colors = [
    'from-orange-500 to-red-500', 'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500',
    'from-yellow-500 to-orange-500', 'from-pink-500 to-rose-500',
  ];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  return (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ fontSize: size <= 7 ? '11px' : '14px' }}>
      {name?.charAt(0).toUpperCase() || '?'}
    </div>
  );
}

function ParticipantRow({ participants = [], max }) {
  const shown = participants.slice(0, 4);
  const extra = participants.length - shown.length;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-2">
        {shown.map((p, i) => (
          <div key={i} className="w-6 h-6 rounded-full ring-2 ring-dark-800">
            <Avatar name={p.name || '?'} size={6} />
          </div>
        ))}
      </div>
      {extra > 0 && (
        <span className="text-xs text-gray-400">+{extra} more</span>
      )}
      {participants.length === 0 && (
        <span className="text-xs text-gray-500">No participants yet</span>
      )}
    </div>
  );
}

function LevelBadge({ level }) {
  const map = {
    beginner:     { label: 'Beginner', cls: 'bg-green-500/15 text-green-400 border-green-500/20' },
    intermediate: { label: 'Intermediate', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
    advanced:     { label: 'Advanced', cls: 'bg-red-500/15 text-red-400 border-red-500/20' },
    all:          { label: 'All levels', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  };
  const d = map[level] || map.all;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${d.cls}`}>
      {d.label}
    </span>
  );
}

function ActivityCard({ activity, onJoin, onLeave, currentUserId }) {
  const [joining, setJoining] = useState(false);
  const joined = activity.participants?.some(p => p.user === currentUserId || p.user?._id === currentUserId);
  const isOrganizer = activity.organizer === currentUserId || activity.organizer?._id === currentUserId;
  const spotsLeft = activity.maxParticipants - activity.currentParticipants;
  const full = spotsLeft <= 0;
  const cat = CATEGORIES.find(c => c.value === activity.category) || CATEGORIES[0];
  const pct = Math.round((activity.currentParticipants / activity.maxParticipants) * 100);

  const dateObj = new Date(activity.date);
  const isToday = new Date().toDateString() === dateObj.toDateString();
  const isTomorrow = new Date(Date.now() + 86400000).toDateString() === dateObj.toDateString();
  const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow'
    : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const handleAction = async () => {
    setJoining(true);
    try {
      if (joined) await onLeave(activity._id);
      else await onJoin(activity._id);
    } finally { setJoining(false); }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl
      ${joined ? 'border-orange-500/30 bg-gradient-to-br from-dark-800 to-dark-900 shadow-orange-900/20' : 'border-white/8 bg-dark-800/60 hover:border-white/15'}`}>

      {/* Top gradient accent */}
      <div className={`h-1 w-full bg-gradient-to-r ${cat.gradient}`} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Category icon */}
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-3xl flex-shrink-0 shadow-lg`}>
            {cat.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-white text-base leading-tight">{activity.name}</h3>
                <p className={`text-xs font-semibold bg-gradient-to-r ${cat.gradient} bg-clip-text text-transparent mt-0.5`}>
                  {activity.category}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                {joined && !isOrganizer && (
                  <div className="flex items-center gap-1 text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">
                    <CheckCircle2 size={12} />
                    <span className="text-xs font-bold">Joined</span>
                  </div>
                )}
                {isOrganizer && (
                  <div className="flex items-center gap-1 text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                    <Star size={12} />
                    <span className="text-xs font-bold">Organizer</span>
                  </div>
                )}
              </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${cat.gradient} flex items-center justify-center`}>
                  <Calendar size={9} className="text-white" />
                </div>
                <span className={`font-semibold ${isToday ? 'text-orange-400' : isTomorrow ? 'text-yellow-400' : 'text-gray-300'}`}>
                  {dateLabel}
                </span>
                <span>·</span>
                <span>{activity.startTime}</span>
              </div>
              {activity.location?.city && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin size={11} className="text-primary-400" />
                  <span>{activity.location.city}</span>
                  {activity.location.address && (
                    <span className="text-gray-600">· {activity.location.address}</span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={10} />
                <span>{activity.duration} min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {activity.description && (
          <p className="mt-3 text-sm text-gray-400 leading-relaxed line-clamp-2">{activity.description}</p>
        )}

        {/* Capacity bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Users size={12} />
              <span>{activity.currentParticipants} / {activity.maxParticipants} participants</span>
            </div>
            <span className={`font-bold text-xs ${full ? 'text-red-400' : spotsLeft <= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
              {full ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-dark-700 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
              pct >= 90 ? 'from-red-500 to-rose-600' :
              pct >= 60 ? 'from-yellow-500 to-orange-500' :
              cat.gradient
            }`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        </div>

        {/* Participants row */}
        {activity.participants?.length > 0 && (
          <div className="mt-3">
            <ParticipantRow participants={activity.participants} max={activity.maxParticipants} />
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <LevelBadge level={activity.level} />
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border
              ${activity.isFree
                ? 'bg-green-500/15 text-green-400 border-green-500/20'
                : 'bg-purple-500/15 text-purple-400 border-purple-500/20'}`}>
              {activity.isFree ? '🎁 Free' : `💰 ${activity.cost}€`}
            </span>
            <span className="text-xs text-gray-500">by <span className="text-gray-300">{activity.organizerName}</span></span>
          </div>

          {!isOrganizer && (
            <button
              onClick={handleAction}
              disabled={!joined && full || joining}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex-shrink-0
                ${joined
                  ? 'bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25'
                  : full
                    ? 'bg-dark-700 text-gray-500 cursor-not-allowed border border-dark-600'
                    : `bg-gradient-to-r ${cat.gradient} text-white shadow-lg hover:opacity-90 hover:scale-105`}`}>
              {joining ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : joined ? (
                'Leave'
              ) : full ? (
                'Full'
              ) : (
                <>Join <ArrowRight size={14} /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateActivityModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', category: '', description: '',
    location: { address: '', city: '' },
    date: '', startTime: '', duration: 60,
    maxParticipants: 10, level: 'all', cost: 0, isFree: true, visibility: 'open',
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const selectedCat = CATEGORIES.find(c => c.value === form.category);

  const submit = async () => {
    if (!form.name || !form.category || !form.date || !form.startTime) {
      toast.error('Please fill all required fields'); return;
    }
    setLoading(true);
    try {
      const r = await api.post('/activities', form);
      onCreated(r.data.activity);
      toast.success('Activity created! 🎉');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full sm:max-w-xl bg-dark-800 border border-white/10 sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 flex-shrink-0">
          <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${selectedCat?.gradient || 'from-orange-500 to-pink-600'}`} />
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Create Activity</h2>
              <p className="text-sm text-gray-400 mt-0.5">Bring your community together</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
              <X size={18} />
            </button>
          </div>
          {/* Step indicators */}
          <div className="flex gap-1.5 mt-4 relative">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? `bg-gradient-to-r ${selectedCat?.gradient || 'from-orange-500 to-pink-500'}` : 'bg-dark-600'
              }`} />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Activity Name *</label>
                <input
                  className="w-full bg-dark-900/60 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                  placeholder='e.g. "Saturday Morning Run in Tiergarten"'
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category *</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c.value} type="button" onClick={() => set('category', c.value)}
                      className={`relative overflow-hidden py-3 px-2 rounded-xl text-xs font-semibold transition-all duration-200 flex flex-col items-center gap-1
                        ${form.category === c.value
                          ? 'text-white ring-2 ring-white/20 scale-105'
                          : 'bg-dark-700/60 text-gray-400 hover:bg-dark-700 hover:text-white border border-white/5'}`}>
                      {form.category === c.value && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-20`} />
                      )}
                      {form.category === c.value && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-100 -z-10`} />
                      )}
                      <span className="text-xl relative z-10">{c.emoji}</span>
                      <span className="relative z-10 leading-tight text-center">{c.value.split(' /')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                <textarea
                  className="w-full bg-dark-900/60 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all resize-none"
                  rows={3}
                  placeholder="Tell people what this activity is about, pace, distance, etc..."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Date *</label>
                  <input type="date"
                    className="w-full bg-dark-900/60 border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                    min={new Date().toISOString().split('T')[0]}
                    value={form.date} onChange={e => set('date', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Start Time *</label>
                  <input type="time"
                    className="w-full bg-dark-900/60 border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                    value={form.startTime} onChange={e => set('startTime', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Duration</label>
                  <select
                    className="w-full bg-dark-900/60 border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-all"
                    value={form.duration} onChange={e => set('duration', Number(e.target.value))}>
                    {[30, 45, 60, 90, 120, 180].map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Max Spots</label>
                  <input type="number"
                    className="w-full bg-dark-900/60 border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                    min={2} max={100} value={form.maxParticipants}
                    onChange={e => set('maxParticipants', Number(e.target.value))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">City</label>
                  <input
                    className="w-full bg-dark-900/60 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                    placeholder="Berlin" value={form.location.city}
                    onChange={e => set('location', { ...form.location, city: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Meeting Point</label>
                  <input
                    className="w-full bg-dark-900/60 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                    placeholder="Park entrance" value={form.location.address}
                    onChange={e => set('location', { ...form.location, address: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fitness Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: 'all', label: 'All Levels', desc: 'Everyone is welcome', emoji: '🤝', cls: 'from-blue-500 to-cyan-500' },
                    { v: 'beginner', label: 'Beginner', desc: 'Just getting started', emoji: '🌱', cls: 'from-green-500 to-emerald-500' },
                    { v: 'intermediate', label: 'Intermediate', desc: 'Some experience needed', emoji: '⚡', cls: 'from-yellow-500 to-amber-500' },
                    { v: 'advanced', label: 'Advanced', desc: 'High intensity & pace', emoji: '🔥', cls: 'from-red-500 to-rose-600' },
                  ].map(l => (
                    <button key={l.v} type="button" onClick={() => set('level', l.v)}
                      className={`relative overflow-hidden p-3 rounded-xl text-left transition-all border
                        ${form.level === l.v ? 'border-white/20 ring-1 ring-white/10' : 'border-white/5 bg-dark-700/60 hover:bg-dark-700'}`}>
                      {form.level === l.v && <div className={`absolute inset-0 bg-gradient-to-br ${l.cls} opacity-15`} />}
                      <div className="relative">
                        <div className="text-xl mb-1">{l.emoji}</div>
                        <p className="font-bold text-white text-sm">{l.label}</p>
                        <p className="text-xs text-gray-400">{l.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Participation Cost</label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button type="button" onClick={() => { set('isFree', true); set('cost', 0); }}
                    className={`p-4 rounded-xl font-bold text-center transition-all border
                      ${form.isFree ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-dark-700/60 text-gray-400 border-white/5 hover:bg-dark-700'}`}>
                    <div className="text-2xl mb-1">🎁</div>
                    <div>Free</div>
                    <div className="text-xs font-normal opacity-70">No charge</div>
                  </button>
                  <button type="button" onClick={() => set('isFree', false)}
                    className={`p-4 rounded-xl font-bold text-center transition-all border
                      ${!form.isFree ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' : 'bg-dark-700/60 text-gray-400 border-white/5 hover:bg-dark-700'}`}>
                    <div className="text-2xl mb-1">💰</div>
                    <div>Paid</div>
                    <div className="text-xs font-normal opacity-70">Set a price</div>
                  </button>
                </div>
                {!form.isFree && (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
                    <input type="number"
                      className="w-full bg-dark-900/60 border border-white/8 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                      placeholder="Cost per person"
                      value={form.cost} onChange={e => set('cost', Number(e.target.value))} />
                  </div>
                )}
              </div>

              {/* Summary */}
              {form.name && form.category && (
                <div className="p-4 rounded-xl border border-white/8 bg-dark-900/40 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Summary</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedCat?.emoji}</span>
                    <div>
                      <p className="font-bold text-white">{form.name}</p>
                      <p className="text-xs text-gray-400">{form.category} · {form.level === 'all' ? 'All levels' : form.level} · {form.isFree ? 'Free' : `€${form.cost}`}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="px-6 pb-6 pt-3 flex gap-3 flex-shrink-0 border-t border-white/5">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 rounded-xl bg-dark-700 text-gray-300 font-bold hover:bg-dark-600 transition-all">
              Back
            </button>
          ) : (
            <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-dark-700 text-gray-300 font-bold hover:bg-dark-600 transition-all">
              Cancel
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && (!form.name || !form.category)) { toast.error('Name and category are required'); return; }
                setStep(s => s + 1);
              }}
              className={`flex-1 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${selectedCat?.gradient || 'from-orange-500 to-pink-500'}`}>
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={submit} disabled={loading}
              className={`flex-1 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-40 bg-gradient-to-r ${selectedCat?.gradient || 'from-orange-500 to-pink-500'} shadow-lg hover:opacity-90`}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                `🚀 Create Activity`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GroupActivities() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({ category: '', level: '', date: '' });
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => { loadActivities(); }, [filters]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('level', filters.level);
      if (filters.date) params.append('date', filters.date);
      const r = await api.get(`/activities?${params}`);
      setActivities(r.data.activities);
    } catch { toast.error('Failed to load activities'); }
    finally { setLoading(false); }
  };

  const handleJoin = async (id) => {
    const r = await api.post(`/activities/${id}/join`);
    setActivities(prev => prev.map(a => a._id === id ? r.data.activity : a));
    toast.success('You\'re in! See you there 🎉');
  };

  const handleLeave = async (id) => {
    await api.post(`/activities/${id}/leave`);
    setActivities(prev => prev.map(a =>
      a._id === id
        ? { ...a, currentParticipants: a.currentParticipants - 1, participants: a.participants.filter(p => p.user !== user?._id && p.user?._id !== user?._id) }
        : a
    ));
    toast.success('Left the activity');
  };

  const myActivities = activities.filter(a =>
    a.participants?.some(p => p.user === user?._id || p.user?._id === user?._id) ||
    a.organizer === user?._id || a.organizer?._id === user?._id
  );

  const filtered = (activeTab === 'mine' ? myActivities : activities)
    .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase()) || a.location?.city?.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: activities.length,
    joined: myActivities.length,
    cities: [...new Set(activities.map(a => a.location?.city).filter(Boolean))].length,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-0">

      {/* ===== CINEMATIC HERO ===== */}
      <div className="relative overflow-hidden rounded-3xl mb-6" style={{ minHeight: '340px' }}>

        {/* Sky gradient background */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(160deg, #0f0c29 0%, #1a0533 30%, #302b63 60%, #24243e 100%)',
        }} />

        {/* Dawn horizon glow */}
        <div className="absolute bottom-0 left-0 right-0 h-40" style={{
          background: 'linear-gradient(to top, rgba(251,96,27,0.55) 0%, rgba(236,72,153,0.3) 40%, transparent 100%)',
        }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32" style={{
          background: 'radial-gradient(ellipse at bottom, rgba(251,146,60,0.6) 0%, transparent 70%)',
        }} />

        {/* Stars */}
        {[...Array(28)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white" style={{
            width: i % 5 === 0 ? '2px' : '1px',
            height: i % 5 === 0 ? '2px' : '1px',
            top: `${5 + (i * 13) % 55}%`,
            left: `${(i * 17 + 7) % 100}%`,
            opacity: 0.4 + (i % 4) * 0.15,
            animation: `pulse ${2 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${(i * 0.3) % 2}s`,
          }} />
        ))}

        {/* City silhouette */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: '90px' }}>
          <svg viewBox="0 0 800 90" preserveAspectRatio="xMidYMax slice" className="w-full h-full">
            <path d="M0,90 L0,55 L20,55 L20,35 L30,35 L30,25 L40,25 L40,35 L50,35 L50,55
              L70,55 L70,40 L80,40 L80,30 L90,30 L90,20 L100,20 L100,30 L110,30 L110,40
              L120,40 L120,55 L140,55 L140,45 L155,45 L155,30 L165,30 L165,20 L175,20
              L175,15 L185,15 L185,20 L195,20 L195,30 L205,30 L205,45 L215,45 L215,55
              L235,55 L235,40 L248,40 L248,25 L260,25 L260,15 L270,15 L270,8 L280,8
              L280,15 L290,15 L290,25 L302,25 L302,40 L315,40 L315,55
              L330,55 L330,42 L345,42 L345,32 L358,32 L358,42 L370,42 L370,55
              L390,55 L390,38 L402,38 L402,28 L415,28 L415,18 L425,18 L425,12 L435,12
              L435,18 L445,18 L445,28 L458,28 L458,38 L470,38 L470,55
              L490,55 L490,45 L505,45 L505,55 L520,55 L520,38 L533,38 L533,28 L545,28
              L545,20 L558,20 L558,28 L570,28 L570,38 L582,38 L582,55
              L600,55 L600,42 L615,42 L615,30 L628,30 L628,22 L638,22 L638,14 L648,14
              L648,22 L658,22 L658,30 L670,30 L670,42 L682,42 L682,55
              L700,55 L700,45 L715,45 L715,55 L730,55 L730,40 L745,40 L745,30 L758,30
              L758,40 L770,40 L770,55 L800,55 L800,90 Z"
              fill="rgba(10,8,20,0.9)" />
            {/* Windows */}
            {[
              [92,22,4,4],[96,28,4,4],[160,22,4,4],[168,22,4,4],[265,10,3,4],[275,10,3,4],
              [427,14,4,4],[437,14,4,4],[640,16,4,4],[650,16,4,4],[547,22,4,4],[560,22,4,4],
            ].map(([x,y,w,h],i) => (
              <rect key={i} x={x} y={y} width={w} height={h} fill={i%3===0 ? 'rgba(251,191,36,0.8)' : 'rgba(147,197,253,0.6)'} rx="0.5" />
            ))}
          </svg>
        </div>

        {/* Road/ground */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '22px',
          background: 'linear-gradient(to bottom, #1c1917 0%, #0c0a09 100%)' }} />
        {/* Road line dashes */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-6 overflow-hidden px-4" style={{ opacity: 0.3 }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-0.5 w-8 bg-yellow-400 rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Runner silhouettes SVG */}
        <div className="absolute bottom-5 left-0 right-0 flex items-end justify-center gap-12 px-8">
          {/* Runner 1 - leading */}
          <svg width="38" height="72" viewBox="0 0 38 72" className="opacity-90" style={{ filter: 'drop-shadow(0 0 8px rgba(251,96,27,0.6))' }}>
            <circle cx="19" cy="8" r="6" fill="#fb6027" />
            <line x1="19" y1="14" x2="19" y2="40" stroke="#fb6027" strokeWidth="3" strokeLinecap="round"/>
            <line x1="19" y1="40" x2="6" y2="60" stroke="#fb6027" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="19" y1="40" x2="32" y2="55" stroke="#fb6027" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="19" y1="22" x2="4" y2="32" stroke="#fb6027" strokeWidth="2" strokeLinecap="round"/>
            <line x1="19" y1="22" x2="34" y2="28" stroke="#fb6027" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {/* Runner 2 */}
          <svg width="38" height="72" viewBox="0 0 38 72" className="opacity-80" style={{ filter: 'drop-shadow(0 0 6px rgba(236,72,153,0.5))' }}>
            <circle cx="19" cy="8" r="6" fill="#ec4899" />
            <line x1="19" y1="14" x2="17" y2="40" stroke="#ec4899" strokeWidth="3" strokeLinecap="round"/>
            <line x1="17" y1="40" x2="8" y2="62" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="17" y1="40" x2="30" y2="58" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="19" y1="20" x2="6" y2="30" stroke="#ec4899" strokeWidth="2" strokeLinecap="round"/>
            <line x1="19" y1="20" x2="33" y2="26" stroke="#ec4899" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {/* Runner 3 */}
          <svg width="38" height="72" viewBox="0 0 38 72" className="opacity-75" style={{ filter: 'drop-shadow(0 0 5px rgba(139,92,246,0.5))' }}>
            <circle cx="19" cy="8" r="6" fill="#8b5cf6" />
            <line x1="19" y1="14" x2="21" y2="40" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round"/>
            <line x1="21" y1="40" x2="10" y2="60" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="21" y1="40" x2="33" y2="57" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="19" y1="22" x2="5" y2="34" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
            <line x1="19" y1="22" x2="32" y2="30" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {/* Runner 4 far back, faded */}
          <svg width="28" height="56" viewBox="0 0 38 72" className="opacity-40" style={{ marginBottom: '-4px' }}>
            <circle cx="19" cy="8" r="6" fill="#94a3b8" />
            <line x1="19" y1="14" x2="19" y2="40" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"/>
            <line x1="19" y1="40" x2="7" y2="60" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="19" y1="40" x2="31" y2="56" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="19" y1="22" x2="5" y2="32" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
            <line x1="19" y1="22" x2="33" y2="28" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Speed lines behind runners */}
        <div className="absolute bottom-14 left-0 right-0 overflow-hidden pointer-events-none" style={{ height: '20px', opacity: 0.2 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"
              style={{ width: `${60 + i * 15}px`, top: `${i * 3 + 2}px`, left: `${10 + i * 8}%` }} />
          ))}
        </div>

        {/* Floating live activity card */}
        <div className="absolute top-5 right-5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 w-44" style={{ boxShadow: '0 0 30px rgba(251,96,27,0.15)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-bold">LIVE</span>
          </div>
          <p className="text-white text-xs font-bold leading-tight">Morning City Run</p>
          <p className="text-gray-400 text-xs mt-0.5">🏙️ Berlin · 6:30 AM</p>
          <div className="flex -space-x-1.5 mt-2">
            {['🧑', '👩', '🧔', '👨'].map((e, i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-red-500 border border-dark-800 flex items-center justify-center text-xs">{e}</div>
            ))}
            <div className="w-5 h-5 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center text-xs text-gray-400">+3</div>
          </div>
        </div>

        {/* Text content overlay */}
        <div className="relative z-10 px-6 sm:px-8 pt-6 pb-28">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 bg-orange-500/20 border border-orange-500/30 backdrop-blur px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-orange-300 text-xs font-bold tracking-wide">GROUP ACTIVITIES</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight drop-shadow-lg">
            Run the streets.<br />
            <span style={{ WebkitTextStroke: '1px rgba(251,146,60,0.8)', color: 'transparent' }}>Together.</span>
          </h1>
          <p className="mt-2 text-white/60 text-sm max-w-xs">
            Find local fitness events or rally your crew for an epic session.
          </p>

          {/* Stats row */}
          <div className="mt-5 flex gap-3">
            {[
              { label: 'Activities', value: stats.total, color: 'text-orange-400' },
              { label: 'Joined', value: stats.joined, color: 'text-pink-400' },
              { label: 'Cities', value: stats.cities, color: 'text-purple-400' },
            ].map(s => (
              <div key={s.label} className="bg-white/8 backdrop-blur border border-white/10 rounded-xl px-4 py-2.5 text-center">
                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-white/50 text-xs">{s.label}</div>
              </div>
            ))}
            {['coach', 'admin'].includes(user?.role) && (
              <button
                onClick={() => setShowCreate(true)}
                className="ml-auto flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black px-5 py-2.5 rounded-xl shadow-lg shadow-orange-900/40 hover:scale-105 transition-all text-sm self-center">
                <Plus size={15} /> Create
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          className="w-full bg-dark-800/80 border border-white/8 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all backdrop-blur-xl"
          placeholder="Search by name, sport, or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800/60 p-1 rounded-2xl border border-white/5 mb-4">
        {[
          { id: 'upcoming', label: 'Upcoming', count: activities.length },
          { id: 'mine', label: 'My Activities', count: myActivities.length },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'}`}>
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-dark-700 text-gray-400'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-dark-800/60 border border-white/5 rounded-2xl p-4 mb-4 space-y-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-gray-500" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Filters</span>
        </div>

        {/* Date filters */}
        <div className="flex gap-2">
          {[
            { v: '', l: 'All dates' },
            { v: 'today', l: 'Today' },
            { v: 'week', l: 'This week' },
          ].map(d => (
            <button key={d.v} onClick={() => setFilters(f => ({ ...f, date: d.v }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                ${filters.date === d.v
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
                  : 'bg-dark-700/60 text-gray-400 hover:text-white border border-white/5'}`}>
              {d.l}
            </button>
          ))}
        </div>

        {/* Level filters */}
        <div className="flex gap-2">
          {LEVELS.map(l => (
            <button key={l.value} onClick={() => setFilters(f => ({ ...f, level: f.level === l.value ? '' : l.value }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                ${filters.level === l.value
                  ? `bg-gradient-to-r ${l.color} text-white shadow-sm`
                  : 'bg-dark-700/60 text-gray-400 hover:text-white border border-white/5'}`}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Category quick-filters */}
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c.value}
              onClick={() => setFilters(f => ({ ...f, category: f.category === c.value ? '' : c.value }))}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all
                ${filters.category === c.value
                  ? `bg-gradient-to-r ${c.gradient} text-white shadow-sm scale-105`
                  : 'bg-dark-700/60 text-gray-400 hover:text-white border border-white/5'}`}>
              {c.emoji} {c.value.split(' /')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Activity list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-dark-600 border-t-rose-500 animate-spin" />
            <p className="text-gray-500 text-sm">Loading activities...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-dark-800/40 rounded-2xl border border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-600/20 border border-pink-500/20 flex items-center justify-center text-3xl mb-4">
              {activeTab === 'mine' ? '🎯' : '🏃'}
            </div>
            <p className="text-white font-bold text-lg">
              {activeTab === 'mine' ? "You haven't joined anything yet" : search ? 'No activities found' : 'No activities yet'}
            </p>
            <p className="text-gray-400 text-sm mt-1 max-w-xs">
              {activeTab === 'mine'
                ? 'Join an upcoming activity or create your own to get started!'
                : search
                  ? 'Try different keywords or clear your filters'
                  : 'Be the first to create a group activity in your area!'}
            </p>
            {['coach', 'admin'].includes(user?.role) && (
              <button onClick={() => setShowCreate(true)}
                className="mt-5 flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all shadow-lg">
                <Plus size={16} /> Create Activity
              </button>
            )}
          </div>
        ) : (
          filtered.map(a => (
            <ActivityCard key={a._id} activity={a} currentUserId={user?._id} onJoin={handleJoin} onLeave={handleLeave} />
          ))
        )}
      </div>

      {/* Floating create button on mobile — coach/admin only */}
      {['coach', 'admin'].includes(user?.role) && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-6 right-6 lg:hidden w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-2xl shadow-rose-900/40 flex items-center justify-center hover:scale-110 transition-all z-40">
          <Plus size={24} />
        </button>
      )}

      {showCreate && (
        <CreateActivityModal
          onClose={() => setShowCreate(false)}
          onCreated={act => setActivities(prev => [act, ...prev])}
        />
      )}
    </div>
  );
}
