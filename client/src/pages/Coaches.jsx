import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SEO from '../components/SEO';
import { Star, MapPin, Clock, Users, Filter, Search } from 'lucide-react';

const SPECIALTIES = [
  'All','Boxing','MMA','Muay Thai','Bodybuilding / Muscle Gain',
  'Weight Loss / Fat Burn','CrossFit','Yoga & Meditation',
  'Mental Coaching / Life Coaching','Sports Nutrition','Athletics & Running',
];

const SESSION_TYPES = ['All', 'in-person', 'online'];

export default function Coaches() {
  const [coaches, setCoaches] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [sessionType, setSessionType] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/coaches')
      .then(r => { setCoaches(r.data.coaches); setFiltered(r.data.coaches); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = coaches;
    if (search) result = result.filter(c =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.specialties?.some(s => s.toLowerCase().includes(search.toLowerCase()))
    );
    if (specialty !== 'All') result = result.filter(c => c.specialties?.includes(specialty));
    if (sessionType !== 'All') result = result.filter(c => c.sessionTypes?.includes(sessionType));
    setFiltered(result);
  }, [search, specialty, sessionType, coaches]);

  const StarRating = ({ rating }) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={12} className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
      ))}
      <span className="text-xs text-gray-400 ml-1">{rating?.toFixed(1) || '—'}</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <SEO title="Coaches finden" path="/coaches" description="Finden Sie zertifizierte Personal Coaches in Deutschland. Boxing, Bodybuilding, Yoga, CrossFit und mehr." />
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black">Find Your Coach</h1>
          <p className="text-gray-400 text-sm">Book a session with a certified professional coach</p>
        </div>
        <button onClick={() => navigate('/coach/apply')} className="btn-secondary text-sm py-2 px-4">
          Join as Coach
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pl-9" placeholder="Search by name or specialty..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Filter size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400">Specialty:</span>
          </div>
          {SPECIALTIES.map(s => (
            <button key={s} onClick={() => setSpecialty(s)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all
                ${specialty === s ? 'bg-primary-600 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <span className="text-xs text-gray-400 self-center flex-shrink-0">Type:</span>
          {SESSION_TYPES.map(t => (
            <button key={t} onClick={() => setSessionType(t)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all capitalize
                ${sessionType === t ? 'bg-purple-600 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="glass-card p-5 animate-pulse h-48" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users size={48} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No coaches found</h2>
          <p className="text-gray-400">Try different filters or be the first to join as a coach!</p>
          <button onClick={() => navigate('/coach/apply')} className="btn-primary mt-4 mx-auto">
            Apply as Coach
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(coach => (
            <button key={coach._id} onClick={() => navigate(`/coaches/${coach._id}`)}
              className="glass-card p-5 text-left hover:border-primary-700/40 transition-all group">
              <div className="flex items-start gap-4">
                {/* Photo */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {coach.photo
                    ? <img src={`${API_URL}${coach.photo}`} alt={coach.fullName} className="w-full h-full object-cover" />
                    : <span className="text-2xl font-black text-white">{coach.fullName.charAt(0)}</span>
                  }
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white group-hover:text-primary-300 transition-colors">{coach.fullName}</p>
                  <p className="text-xs text-primary-400 font-medium mt-0.5">{coach.mainSpecialty}</p>
                  <StarRating rating={coach.avgRating} />
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {coach.city && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={11} /> {coach.city}
                      </span>
                    )}
                    {coach.experience && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={11} /> {coach.experience}y exp
                      </span>
                    )}
                  </div>
                </div>
                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-white">{coach.pricePerSession}€</p>
                  <p className="text-xs text-gray-500">/session</p>
                  <div className="flex gap-1 mt-2 justify-end">
                    {coach.sessionTypes?.map(t => (
                      <span key={t} className={`px-2 py-0.5 rounded-full text-xs font-medium
                        ${t === 'online' ? 'bg-blue-900/30 text-blue-400' : 'bg-green-900/30 text-green-400'}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Specialties */}
              {coach.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {coach.specialties.slice(0, 3).map(s => (
                    <span key={s} className="px-2 py-0.5 bg-dark-700 rounded-full text-xs text-gray-400">{s}</span>
                  ))}
                  {coach.specialties.length > 3 && (
                    <span className="px-2 py-0.5 bg-dark-700 rounded-full text-xs text-gray-500">+{coach.specialties.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
