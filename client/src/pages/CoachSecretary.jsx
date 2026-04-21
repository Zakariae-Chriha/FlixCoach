import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Send, Star, MapPin, Clock, Zap, ChevronRight } from 'lucide-react';

const WELCOME = {
  role: 'assistant',
  content: `Welcome to **FlixCoach**! 👋 I'm your personal coaching assistant.

I'm here to help you find the perfect coach for your goals. Whether you want to lose weight, build muscle, learn a combat sport, or work on your mental wellness — I'll match you with the right professional.

To get started: **What is your main goal right now?** And do you prefer in-person or online sessions?`,
};

function CoachCard({ coach, onBook }) {
  const navigate = useNavigate();
  return (
    <div className="bg-dark-700/80 border border-primary-700/30 rounded-xl p-4 flex items-start gap-3">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {coach.photo
          ? <img src={`${API_URL}${coach.photo}`} alt={coach.fullName} className="w-full h-full object-cover" />
          : <span className="text-lg font-black text-white">{coach.fullName.charAt(0)}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm">{coach.fullName}</p>
        <p className="text-xs text-primary-400">{coach.mainSpecialty}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={10} className={i < Math.round(coach.avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
            ))}
          </div>
          {coach.city && <span className="flex items-center gap-0.5 text-xs text-gray-400"><MapPin size={9} />{coach.city}</span>}
          {coach.experience && <span className="flex items-center gap-0.5 text-xs text-gray-400"><Clock size={9} />{coach.experience}y</span>}
          <span className="text-xs font-bold text-green-400">{coach.pricePerSession}€</span>
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={() => navigate(`/coaches/${coach._id}`)}
            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-0.5 border border-primary-700/30 px-2 py-1 rounded-lg transition-all">
            View Profile <ChevronRight size={11} />
          </button>
          <button onClick={() => onBook(coach)}
            className="text-xs bg-primary-600 hover:bg-primary-500 text-white px-3 py-1 rounded-lg font-medium transition-all">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingModal({ coach, onClose, onSuccess }) {
  const [form, setForm] = useState({ date: '', startTime: '', duration: 60, sessionType: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState('');

  const fetchSlots = async (date) => {
    if (!date) return;
    setLoadingSlots(true); setSlots([]); setSlotsMessage('');
    setForm(p => ({ ...p, startTime: '' }));
    try {
      const r = await api.get(`/coaches/${coach._id}/slots/${date}`);
      if (r.data.slots.length === 0) setSlotsMessage(r.data.message || 'No availability on this day');
      else setSlots(r.data.slots);
    } catch { setSlotsMessage('Could not load availability'); }
    finally { setLoadingSlots(false); }
  };

  const handleBook = async () => {
    if (!form.date || !form.startTime || !form.sessionType) { toast.error('Fill all fields'); return; }
    const [h, m] = form.startTime.split(':').map(Number);
    const endH = h + Math.floor(form.duration / 60);
    const endM = m + (form.duration % 60);
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    setLoading(true);
    try {
      await api.post(`/coaches/${coach._id}/book`, { ...form, endTime });
      toast.success('Session booked! Check your email 📅');
      onSuccess(coach);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="glass-card p-6 w-full max-w-sm space-y-3 max-h-[90vh] overflow-y-auto">
        <h2 className="font-bold text-lg">Book — {coach.fullName}</h2>
        <div>
          <label className="label-field">Date</label>
          <input type="date" className="input-field" min={new Date().toISOString().split('T')[0]}
            value={form.date} onChange={e => { setForm(p => ({ ...p, date: e.target.value })); fetchSlots(e.target.value); }} />
        </div>

        {/* Time slots */}
        {form.date && (
          <div>
            <label className="label-field">Available Time</label>
            {loadingSlots ? (
              <div className="flex items-center gap-2 py-2 text-gray-400 text-xs">
                <div className="w-3 h-3 rounded-full border-2 border-gray-600 border-t-primary-400 animate-spin" />
                Checking...
              </div>
            ) : slotsMessage ? (
              <p className="text-xs text-red-400 py-2">😔 {slotsMessage}</p>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {slots.map(slot => (
                  <button key={slot.time} type="button" disabled={!slot.available}
                    onClick={() => slot.available && setForm(p => ({ ...p, startTime: slot.time }))}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all
                      ${!slot.available
                        ? 'bg-red-900/20 text-red-500 cursor-not-allowed line-through'
                        : form.startTime === slot.time
                          ? 'bg-green-600 text-white'
                          : 'bg-dark-700 text-gray-300 hover:bg-green-900/30 hover:text-green-400'}`}>
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="label-field">Duration</label>
          <select className="input-field" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: Number(e.target.value) }))}>
            <option value={30}>30 min</option>
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
          </select>
        </div>
        <div>
          <label className="label-field">Session Type</label>
          <div className="flex gap-2">
            {(coach.sessionTypes?.includes('both')
              ? ['in-person', 'online']
              : coach.sessionTypes || []
            ).map(t => (
              <button key={t} type="button" onClick={() => setForm(p => ({ ...p, sessionType: t }))}
                className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all
                  ${form.sessionType === t
                    ? t === 'online' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                    : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>
                {t === 'in-person' ? '📍 In-Person' : '💻 Online'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label-field">Notes (optional)</label>
          <textarea className="input-field" rows={2} value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Your goals..." />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
          <button onClick={handleBook} disabled={loading} className="btn-primary flex-1 py-2 text-sm">
            {loading ? 'Booking...' : `Confirm — ${coach.pricePerSession}€`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CoachSecretary() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingCoach, setBookingCoach] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const r = await api.post('/coaches/secretary', {
        messages: history.filter(m => m.role !== 'system'),
      });
      const assistantMsg = {
        role: 'assistant',
        content: r.data.reply,
        coaches: r.data.recommendedCoaches || [],
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      toast.error('Secretary unavailable — try again');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSuccess = (coach) => {
    setBookingCoach(null);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `🎉 Your session with **${coach.fullName}** is confirmed! You'll receive a confirmation email with a calendar invite shortly. The appointment is now in your calendar. Is there anything else I can help you with?`,
    }]);
  };

  const renderContent = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#e2e8f0">$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="glass-card p-4 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-white">AI Coaching Secretary</p>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Online — ready to help
          </p>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                  <Zap size={14} className="text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-sm'
                  : 'bg-dark-700/80 text-gray-200 rounded-tl-sm border border-white/5'
              }`}>
                <p className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
              </div>
            </div>

            {/* Coach cards */}
            {msg.coaches?.length > 0 && (
              <div className="ml-10 mt-3 space-y-3">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  🏆 Recommended Coaches
                </p>
                {msg.coaches.map(coach => (
                  <CoachCard key={coach._id} coach={coach} onBook={setBookingCoach} />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mr-2">
              <Zap size={14} className="text-white" />
            </div>
            <div className="bg-dark-700/80 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-primary-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 glass-card p-3 flex gap-2">
        <input
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}
          className="w-9 h-9 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all">
          <Send size={16} className="text-white" />
        </button>
      </div>

      {/* Booking Modal */}
      {bookingCoach && (
        <BookingModal
          coach={bookingCoach}
          onClose={() => setBookingCoach(null)}
          onSuccess={handleBookSuccess}
        />
      )}
    </div>
  );
}
