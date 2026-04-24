import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, MapPin, Star, ChevronRight, Video, User } from 'lucide-react';

function StatusBadge({ status }) {
  const map = {
    confirmed: 'bg-green-900/30 text-green-400 border-green-800/30',
    pending:   'bg-yellow-900/30 text-yellow-400 border-yellow-800/30',
    cancelled: 'bg-red-900/30 text-red-400 border-red-800/30',
    completed: 'bg-blue-900/30 text-blue-400 border-blue-800/30',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${map[status] || ''}`}>{status}</span>;
}

const TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past',     label: 'Past' },
  { id: 'all',      label: 'All' },
];

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [reviewModal, setReviewModal] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/coaches/my/bookings')
      .then(r => setBookings(r.data.bookings))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const submitReview = async () => {
    if (!review.comment.trim()) { toast.error('Please write a comment'); return; }
    setSubmitting(true);
    try {
      await api.post(`/coaches/${reviewModal.coach._id}/review`, review);
      toast.success('Review submitted!');
      setReviewModal(null);
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  const now = new Date();
  const filtered = bookings.filter(b => {
    const d = new Date(b.date);
    if (tab === 'upcoming') return d >= now && b.status !== 'cancelled';
    if (tab === 'past')     return d < now || b.status === 'completed' || b.status === 'cancelled';
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black">My Bookings</h1>
        <p className="text-gray-400 text-sm mt-1">All your coaching sessions in one place</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800 p-1 rounded-xl w-fit">
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === id ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="glass-card p-5 animate-pulse h-32" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar size={48} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">No {tab} bookings</h2>
          <p className="text-gray-400 text-sm mb-4">Browse coaches and book your first session</p>
          <button onClick={() => navigate('/coaches')} className="btn-primary mx-auto">
            Find a Coach
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => (
            <div key={booking._id} className="glass-card p-5 space-y-4">
              {/* Coach info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/coaches/${booking.coach._id}`)}>
                  {booking.coach?.photo
                    ? <img src={`${API_URL}${booking.coach.photo}`} alt={booking.coach.fullName} className="w-full h-full object-cover" />
                    : <span className="text-xl font-black text-white">{booking.coach?.fullName?.charAt(0)}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white">{booking.coach?.fullName}</p>
                  <p className="text-xs text-primary-400">{booking.coach?.mainSpecialty}</p>
                  {booking.coach?.city && (
                    <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <MapPin size={10} /> {booking.coach.city}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={booking.status} />
                  <span className="text-sm font-bold text-green-400">{booking.price}€</span>
                </div>
              </div>

              {/* Session details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Calendar size={12} className="text-primary-400" />
                  {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock size={12} className="text-blue-400" />
                  {booking.startTime} – {booking.endTime}
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  {booking.sessionType === 'online'
                    ? <><Video size={12} className="text-blue-400" /> Online session</>
                    : <><User size={12} className="text-green-400" /> In-person session</>
                  }
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock size={12} className="text-gray-500" />
                  {booking.duration} minutes
                </div>
              </div>

              {booking.notes && (
                <p className="text-xs text-gray-400 bg-dark-700/40 rounded-lg p-2 italic">
                  "{booking.notes}"
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button onClick={() => navigate(`/coaches/${booking.coach._id}`)}
                  className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 border border-primary-700/30 px-3 py-1.5 rounded-lg transition-all">
                  View Coach <ChevronRight size={11} />
                </button>
                {booking.status === 'confirmed' && booking.sessionType === 'online' && (
                  <button className="flex items-center gap-1.5 text-xs bg-blue-900/30 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-800/30 px-3 py-1.5 rounded-lg transition-all">
                    <Video size={11} /> Join Call
                  </button>
                )}
                {booking.status === 'completed' && (
                  <button onClick={() => setReviewModal(booking)}
                    className="flex items-center gap-1.5 text-xs bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-400 border border-yellow-800/30 px-3 py-1.5 rounded-lg transition-all ml-auto">
                    <Star size={11} /> Leave Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="glass-card p-6 w-full max-w-sm space-y-4">
            <h2 className="font-bold text-lg">Rate {reviewModal.coach?.fullName}</h2>
            <div>
              <label className="label-field">Rating</label>
              <div className="flex gap-2 mt-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setReview(p => ({ ...p, rating: n }))}>
                    <Star size={24} className={n <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label-field">Comment</label>
              <textarea className="input-field" rows={3} placeholder="Share your experience..."
                value={review.comment} onChange={e => setReview(p => ({ ...p, comment: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setReviewModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={submitReview} disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
