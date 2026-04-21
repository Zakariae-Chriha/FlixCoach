import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Star, MapPin, Clock, Globe, CheckCircle, Calendar,
  ChevronLeft, Award, MessageSquare, Users,
} from 'lucide-react';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_LABELS = { monday:'Mon',tuesday:'Tue',wednesday:'Wed',thursday:'Thu',friday:'Fri',saturday:'Sat',sunday:'Sun' };

export default function CoachProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ date: '', startTime: '', duration: 60, sessionType: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState('');

  useEffect(() => {
    api.get(`/coaches/${id}`)
      .then(r => setCoach(r.data.coach))
      .catch(() => toast.error('Coach not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchSlots = async (date) => {
    if (!date) return;
    setLoadingSlots(true);
    setSlots([]);
    setSlotsMessage('');
    setBooking(p => ({ ...p, startTime: '' }));
    try {
      const r = await api.get(`/coaches/${id}/slots/${date}`);
      if (r.data.slots.length === 0) {
        setSlotsMessage(r.data.message || 'No availability on this day');
      } else {
        setSlots(r.data.slots);
      }
    } catch {
      setSlotsMessage('Could not load availability');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async () => {
    if (!booking.date || !booking.startTime || !booking.sessionType) {
      toast.error('Please fill all booking fields'); return;
    }
    const [h, m] = booking.startTime.split(':').map(Number);
    const endH = h + Math.floor(booking.duration / 60);
    const endM = m + (booking.duration % 60);
    const endTime = `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`;

    setSubmitting(true);
    try {
      await api.post(`/coaches/${id}/book`, { ...booking, endTime });
      toast.success('Session booked successfully! 🎉');
      setShowBooking(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 rounded-full border-4 border-dark-600 border-t-primary-500 animate-spin" />
    </div>
  );
  if (!coach) return <div className="text-center py-20 text-gray-400">Coach not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <button onClick={() => navigate('/coaches')} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
        <ChevronLeft size={18} /> Back to Coaches
      </button>

      {/* Profile header */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {coach.photo
              ? <img src={`${API_URL}${coach.photo}`} alt={coach.fullName} className="w-full h-full object-cover" />
              : <span className="text-4xl font-black text-white">{coach.fullName.charAt(0)}</span>
            }
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">{coach.fullName}</h1>
            <p className="text-primary-400 font-semibold mt-1">{coach.mainSpecialty}</p>
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={i < Math.round(coach.avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
              ))}
              <span className="text-sm text-gray-400 ml-1">{coach.avgRating?.toFixed(1) || '—'} ({coach.totalReviews} reviews)</span>
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              {coach.city && <span className="flex items-center gap-1 text-sm text-gray-400"><MapPin size={13} /> {coach.city}</span>}
              {coach.experience && <span className="flex items-center gap-1 text-sm text-gray-400"><Clock size={13} /> {coach.experience} years exp.</span>}
              {coach.languages?.length > 0 && <span className="flex items-center gap-1 text-sm text-gray-400"><Globe size={13} /> {coach.languages.join(', ')}</span>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-white">{coach.pricePerSession}€</p>
            <p className="text-gray-400 text-sm">per session</p>
            {coach.monthlyPackage && <p className="text-green-400 text-sm mt-1">{coach.monthlyPackage}€/month</p>}
            <button onClick={() => setShowBooking(true)} className="btn-primary mt-3 flex items-center gap-2">
              <Calendar size={16} /> Book Session
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* About */}
        <div className="glass-card p-5 space-y-4">
          <h2 className="font-bold flex items-center gap-2"><Users size={16} className="text-primary-400" /> About</h2>
          <p className="text-sm text-gray-300 leading-relaxed">{coach.bio}</p>
          {coach.coachingStyle && (
            <div className="bg-dark-700/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Coaching Style</p>
              <p className="text-sm text-white">{coach.coachingStyle}</p>
            </div>
          )}
        </div>

        {/* Specialties & Certs */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h2 className="font-bold mb-3 flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {coach.specialties?.map(s => (
                <span key={s} className="px-3 py-1 bg-primary-900/30 text-primary-300 rounded-full text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
          {coach.certifications?.length > 0 && (
            <div className="glass-card p-5">
              <h2 className="font-bold mb-3 flex items-center gap-2"><Award size={16} className="text-yellow-400" /> Certifications</h2>
              <div className="space-y-1">
                {coach.certifications.map(c => (
                  <div key={c} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />{c}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session types */}
      <div className="glass-card p-5">
        <h2 className="font-bold mb-3">Session Options</h2>
        <div className="flex gap-3">
          {coach.sessionTypes?.map(t => (
            <div key={t} className={`flex-1 p-4 rounded-xl border text-center
              ${t === 'online' ? 'border-blue-700/30 bg-blue-900/10' : 'border-green-700/30 bg-green-900/10'}`}>
              <p className={`font-semibold capitalize ${t === 'online' ? 'text-blue-400' : 'text-green-400'}`}>{t}</p>
              <p className="text-xs text-gray-400 mt-1">{t === 'online' ? 'Video call session' : 'Meet in person — ' + (coach.city || 'Location TBD')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      {coach.reviews?.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="font-bold mb-4 flex items-center gap-2"><MessageSquare size={16} className="text-primary-400" /> Client Reviews</h2>
          <div className="space-y-3">
            {coach.reviews.slice(0, 5).map((r, i) => (
              <div key={i} className="p-3 bg-dark-700/50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{r.clientName}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={11} className={j < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="glass-card p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold">Book a Session with {coach.fullName}</h2>

            {/* Date */}
            <div>
              <label className="label-field">Date *</label>
              <input type="date" className="input-field" min={new Date().toISOString().split('T')[0]}
                value={booking.date}
                onChange={e => { setBooking(p => ({ ...p, date: e.target.value })); fetchSlots(e.target.value); }} />
            </div>

            {/* Time slots */}
            {booking.date && (
              <div>
                <label className="label-field">Available Time Slots *</label>
                {loadingSlots ? (
                  <div className="flex items-center gap-2 py-3 text-gray-400 text-sm">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-600 border-t-primary-400 animate-spin" />
                    Checking availability...
                  </div>
                ) : slotsMessage ? (
                  <div className="p-3 bg-red-900/20 border border-red-800/30 rounded-xl text-sm text-red-400">
                    😔 {slotsMessage}
                  </div>
                ) : slots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map(slot => (
                      <button key={slot.time} type="button"
                        disabled={!slot.available}
                        onClick={() => slot.available && setBooking(p => ({ ...p, startTime: slot.time }))}
                        className={`py-2 rounded-xl text-xs font-semibold transition-all
                          ${!slot.available
                            ? 'bg-red-900/20 text-red-500 border border-red-800/20 cursor-not-allowed line-through'
                            : booking.startTime === slot.time
                              ? 'bg-green-600 text-white shadow-md shadow-green-900/40'
                              : 'bg-dark-700 text-gray-300 hover:bg-green-900/30 hover:text-green-400 border border-white/5 hover:border-green-800/40'
                          }`}>
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : null}

                {/* Legend */}
                {slots.length > 0 && (
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="w-3 h-3 rounded bg-dark-700 border border-white/10 inline-block" /> Free
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="w-3 h-3 rounded bg-green-600 inline-block" /> Selected
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="w-3 h-3 rounded bg-red-900/40 border border-red-800/30 inline-block" /> Booked
                    </span>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="label-field">Duration</label>
              <select className="input-field" value={booking.duration} onChange={e => setBooking(p => ({ ...p, duration: Number(e.target.value) }))}>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
            <div>
              <label className="label-field">Session Type *</label>
              <div className="flex gap-2">
                {(coach.sessionTypes?.includes('both')
                  ? ['in-person', 'online']
                  : coach.sessionTypes || []
                ).map(t => (
                  <button key={t} type="button" onClick={() => setBooking(p => ({ ...p, sessionType: t }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all
                      ${booking.sessionType === t
                        ? t === 'online' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                        : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>
                    {t === 'in-person' ? '📍 In-Person' : '💻 Online'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label-field">Notes (optional)</label>
              <textarea className="input-field" rows={2} placeholder="Any specific goals or questions..."
                value={booking.notes} onChange={e => setBooking(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div className="bg-dark-700/50 rounded-xl p-3 flex justify-between items-center">
              <span className="text-sm text-gray-400">Total price</span>
              <span className="font-bold text-white">{coach.pricePerSession}€</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowBooking(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleBook} disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
