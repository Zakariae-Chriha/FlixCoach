import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Calendar, Clock, Users, Star, TrendingUp, CheckCircle,
  XCircle, MapPin, Euro, ChevronRight, Zap, Video, Lock, Eye, EyeOff,
} from 'lucide-react';
import VideoCall from '../components/VideoCall';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_LABELS = { monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu', friday:'Fri', saturday:'Sat', sunday:'Sun' };

function StatusBadge({ status }) {
  const map = {
    confirmed: 'bg-green-900/30 text-green-400 border-green-800/30',
    pending:   'bg-yellow-900/30 text-yellow-400 border-yellow-800/30',
    cancelled: 'bg-red-900/30 text-red-400 border-red-800/30',
    completed: 'bg-blue-900/30 text-blue-400 border-blue-800/30',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${map[status] || ''}`}>{status}</span>;
}

export default function CoachDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('today');
  const [availability, setAvailability] = useState({});
  const [savingAvail, setSavingAvail] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });

  useEffect(() => {
    if (user?.role !== 'coach') { navigate('/dashboard'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/coach-dashboard/stats'),
        api.get('/coach-dashboard/bookings'),
      ]);
      setData(statsRes.data);
      setAllBookings(bookingsRes.data.bookings);
      // Build availability map
      const avail = {};
      statsRes.data.coach?.availability?.forEach(slot => {
        avail[slot.day] = { startTime: slot.startTime, endTime: slot.endTime };
      });
      setAvailability(avail);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await api.patch(`/coach-dashboard/bookings/${id}`, { status });
      toast.success(`Booking ${status}`);
      loadData();
    } catch { toast.error('Failed to update booking'); }
  };

  const saveAvailability = async () => {
    setSavingAvail(true);
    try {
      const slots = Object.entries(availability)
        .filter(([, v]) => v.startTime && v.endTime)
        .map(([day, v]) => ({ day, startTime: v.startTime, endTime: v.endTime }));
      await api.patch('/coach-dashboard/availability', { availability: slots });
      toast.success('Availability saved!');
    } catch { toast.error('Failed to save'); }
    finally { setSavingAvail(false); }
  };

  if (user?.role !== 'coach') return null;
  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 rounded-full border-4 border-dark-600 border-t-primary-500 animate-spin" />
    </div>
  );

  const { coach, todayBookings, upcomingBookings, totalCompleted, totalEarnings } = data;

  const BookingCard = ({ booking, showActions = false }) => (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-purple-700 flex items-center justify-center font-bold text-white flex-shrink-0">
            {booking.client?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">{booking.client?.name}</p>
            <p className="text-xs text-gray-400">{booking.client?.email}</p>
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Calendar size={12} className="text-primary-400" />
          {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          <Clock size={12} className="text-blue-400" />
          {booking.startTime} – {booking.endTime}
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          <MapPin size={12} className="text-green-400" />
          <span className="capitalize">{booking.sessionType}</span>
        </div>
        <div className="flex items-center gap-1.5 text-green-400 font-bold">
          <Euro size={12} />
          {booking.price}€
        </div>
      </div>

      {booking.notes && (
        <p className="text-xs text-gray-400 bg-dark-700/50 rounded-lg p-2 italic">"{booking.notes}"</p>
      )}

      {showActions && booking.status === 'confirmed' && (
        <div className="flex gap-2 pt-1 flex-wrap">
          <button onClick={() => setActiveCall({ ...booking, coachName: coach?.user?.name })}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-900/30 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-bold border border-blue-800/30 transition-all">
            <Video size={13} /> Join Call
          </button>
          <button onClick={() => updateBookingStatus(booking._id, 'completed')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-900/30 hover:bg-green-900/50 text-green-400 text-xs font-medium border border-green-800/30 transition-all">
            <CheckCircle size={13} /> Mark Complete
          </button>
          <button onClick={() => updateBookingStatus(booking._id, 'cancelled')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-900/20 hover:bg-red-900/40 text-red-400 text-xs font-medium border border-red-800/30 transition-all">
            <XCircle size={13} /> Cancel
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center overflow-hidden flex-shrink-0">
            {coach?.photo
              ? <img src={`${API_URL}${coach.photo}`} alt={coach.fullName} className="w-full h-full object-cover" />
              : <span className="text-2xl font-black text-white">{coach?.fullName?.charAt(0)}</span>
            }
          </div>
          <div>
            <h1 className="text-2xl font-black">Welcome, {coach?.fullName?.split(' ')[0]}!</h1>
            <p className="text-primary-400 text-sm font-medium">{coach?.mainSpecialty}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className={i < Math.round(coach?.avgRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
              ))}
              <span className="text-xs text-gray-400 ml-1">{coach?.avgRating?.toFixed(1) || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Sessions", value: todayBookings?.length || 0, icon: Calendar, color: 'text-primary-400 bg-primary-900/30' },
          { label: 'This Week', value: upcomingBookings?.length || 0, icon: Clock, color: 'text-blue-400 bg-blue-900/30' },
          { label: 'Completed', value: totalCompleted || 0, icon: CheckCircle, color: 'text-green-400 bg-green-900/30' },
          { label: 'Total Earned', value: `${totalEarnings || 0}€`, icon: TrendingUp, color: 'text-yellow-400 bg-yellow-900/30' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} mb-3`}><Icon size={16} /></div>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800 p-1 rounded-xl overflow-x-auto">
        {[
          { id: 'today', label: "Today", icon: Zap },
          { id: 'upcoming', label: 'This Week', icon: Calendar },
          { id: 'all', label: 'All Bookings', icon: Users },
          { id: 'availability', label: 'My Schedule', icon: Clock },
          { id: 'security', label: 'Password', icon: Lock },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap
              ${tab === id ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Today */}
      {tab === 'today' && (
        <div className="space-y-3">
          {todayBookings?.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <Calendar size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No sessions today — enjoy your rest day! 😊</p>
            </div>
          ) : todayBookings.map(b => <BookingCard key={b._id} booking={b} showActions />)}
        </div>
      )}

      {/* This Week */}
      {tab === 'upcoming' && (
        <div className="space-y-3">
          {upcomingBookings?.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <p className="text-gray-400">No upcoming sessions this week.</p>
            </div>
          ) : upcomingBookings.map(b => <BookingCard key={b._id} booking={b} showActions />)}
        </div>
      )}

      {/* All Bookings */}
      {tab === 'all' && (
        <div className="space-y-3">
          {allBookings.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <p className="text-gray-400">No bookings yet. Your profile is live — clients can find you!</p>
            </div>
          ) : allBookings.map(b => <BookingCard key={b._id} booking={b} showActions />)}
        </div>
      )}

      {/* Availability */}
      {tab === 'availability' && (
        <div className="glass-card p-5 space-y-4">
          <div>
            <p className="font-bold mb-1">Weekly Availability</p>
            <p className="text-xs text-gray-400">Set your available hours for each day. Clients can only book within these hours.</p>
          </div>
          <div className="space-y-3">
            {DAYS.map(day => (
              <div key={day} className="flex items-center gap-3">
                <div className="w-12 text-xs font-bold text-gray-300">{DAY_LABELS[day]}</div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox"
                    checked={!!availability[day]}
                    onChange={e => {
                      if (e.target.checked) setAvailability(p => ({ ...p, [day]: { startTime: '09:00', endTime: '17:00' } }));
                      else setAvailability(p => { const n = { ...p }; delete n[day]; return n; });
                    }}
                    className="w-4 h-4 rounded accent-purple-500"
                  />
                  <span className="text-xs text-gray-400">Available</span>
                </label>
                {availability[day] && (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" value={availability[day].startTime}
                      onChange={e => setAvailability(p => ({ ...p, [day]: { ...p[day], startTime: e.target.value } }))}
                      className="input-field py-1.5 text-xs w-28" />
                    <span className="text-gray-500 text-xs">to</span>
                    <input type="time" value={availability[day].endTime}
                      onChange={e => setAvailability(p => ({ ...p, [day]: { ...p[day], endTime: e.target.value } }))}
                      className="input-field py-1.5 text-xs w-28" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={saveAvailability} disabled={savingAvail} className="btn-primary w-full py-2.5 text-sm">
            {savingAvail ? 'Saving...' : '✓ Save Schedule'}
          </button>
        </div>
      )}

      {/* Security / Change Password */}
      {tab === 'security' && (
        <div className="glass-card p-6 max-w-md space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <Lock size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white">Change Password</p>
              <p className="text-xs text-gray-400">Update your login password</p>
            </div>
          </div>

          {[
            { key: 'current', label: 'Current Password', placeholder: 'Enter your current password' },
            { key: 'newPw',   label: 'New Password',     placeholder: 'Min. 6 characters' },
            { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={showPw[key] ? 'text' : 'password'}
                  className="w-full bg-dark-900/60 border border-white/8 rounded-xl px-4 py-3 pr-11 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                  placeholder={placeholder}
                  autoComplete={key === 'current' ? 'current-password' : 'new-password'}
                  value={pwForm[key]}
                  onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                />
                <button type="button"
                  onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPw[key] ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
          ))}

          <button
            disabled={pwLoading}
            onClick={async () => {
              if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) { toast.error('Fill all fields'); return; }
              if (pwForm.newPw.length < 6) { toast.error('New password must be at least 6 characters'); return; }
              if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
              setPwLoading(true);
              try {
                await api.patch('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.newPw });
                toast.success('Password changed successfully! 🔐');
                setPwForm({ current: '', newPw: '', confirm: '' });
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to change password');
              } finally { setPwLoading(false); }
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-purple-600 text-white font-bold hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
            {pwLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Saving...</> : <><Lock size={15}/> Update Password</>}
          </button>
        </div>
      )}

      {activeCall && (
        <VideoCall booking={activeCall} onClose={() => setActiveCall(null)} />
      )}
    </div>
  );
}
