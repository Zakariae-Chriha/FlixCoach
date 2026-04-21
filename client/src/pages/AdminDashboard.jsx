import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, Clock, CheckCircle, XCircle, BarChart3,
  FileText, Eye, Shield, Calendar,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/dashboard'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsRes, coachesRes, statsRes] = await Promise.all([
        api.get('/coaches/admin/applications'),
        api.get('/coaches'),
        api.get('/coaches/admin/stats'),
      ]);
      setApplications(appsRes.data.applications);
      setCoaches(coachesRes.data.coaches);
      setStats(statsRes.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleDecision = async (id, status) => {
    try {
      await api.patch(`/coaches/admin/applications/${id}`, { status, adminNote });
      toast.success(status === 'approved' ? '✅ Coach approved!' : '❌ Application rejected');
      setSelected(null);
      setAdminNote('');
      loadData();
    } catch { toast.error('Action failed'); }
  };

  const statusBadge = (s) => {
    const map = { pending: 'bg-yellow-900/30 text-yellow-400', approved: 'bg-green-900/30 text-green-400', rejected: 'bg-red-900/30 text-red-400' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[s]}`}>{s}</span>;
  };

  if (user?.role !== 'admin') return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Manage coaches, applications & bookings</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Coaches', value: stats.totalCoaches, icon: Users, color: 'text-primary-400 bg-primary-900/30' },
            { label: 'Pending Applications', value: stats.pendingApplications, icon: Clock, color: 'text-yellow-400 bg-yellow-900/30' },
            { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'text-green-400 bg-green-900/30' },
            { label: 'Active Clients', value: stats.activeClients, icon: BarChart3, color: 'text-purple-400 bg-purple-900/30' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} mb-3`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800 p-1 rounded-xl">
        {[
          { id: 'applications', label: 'Applications', icon: FileText },
          { id: 'coaches', label: 'Active Coaches', icon: Users },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === id ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            <Icon size={15} /> {label}
            {id === 'applications' && applications.filter(a => a.status === 'pending').length > 0 && (
              <span className="bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {applications.filter(a => a.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 rounded-full border-4 border-dark-600 border-t-primary-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Applications tab */}
          {tab === 'applications' && (
            <div className="space-y-3">
              {applications.length === 0 ? (
                <div className="glass-card p-10 text-center text-gray-400">No applications yet</div>
              ) : applications.map(app => (
                <div key={app._id} className="glass-card p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4">
                      {app.photo
                        ? <img src={`${API_URL}${app.photo}`} alt={app.fullName} className="w-14 h-14 rounded-xl object-cover" />
                        : <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-xl font-black text-white">{app.fullName.charAt(0)}</div>
                      }
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white">{app.fullName}</p>
                          {statusBadge(app.status)}
                        </div>
                        <p className="text-sm text-gray-400">{app.email} • {app.phone}</p>
                        <p className="text-sm text-primary-400 mt-1">{app.specialties?.join(', ')}</p>
                        <p className="text-xs text-gray-500 mt-1">{app.experience} years exp. • {app.city} • {app.pricePerSession}€/session</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelected(selected?._id === app._id ? null : app)}
                        className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1">
                        <Eye size={14} /> {selected?._id === app._id ? 'Hide' : 'Review'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded review */}
                  {selected?._id === app._id && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Bio</p>
                          <p className="text-sm text-gray-300">{app.bio}</p>
                        </div>
                        <div className="space-y-2">
                          {app.certifications?.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Certifications</p>
                              <p className="text-sm text-gray-300">{app.certifications.join(', ')}</p>
                            </div>
                          )}
                          {(app.cvFile || app.cvUrl) && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">CV</p>
                              <a href={app.cvFile ? `${API_URL}${app.cvFile}` : app.cvUrl}
                                target="_blank" rel="noreferrer"
                                className="text-primary-400 text-sm hover:text-primary-300 underline">
                                View CV ↗
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      {app.status === 'pending' && (
                        <div className="space-y-3">
                          <textarea
                            className="input-field text-sm"
                            placeholder="Admin note (optional)..."
                            rows={2}
                            value={adminNote}
                            onChange={e => setAdminNote(e.target.value)}
                          />
                          <div className="flex gap-3">
                            <button onClick={() => handleDecision(app._id, 'approved')}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-all">
                              <CheckCircle size={16} /> Approve Coach
                            </button>
                            <button onClick={() => handleDecision(app._id, 'rejected')}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-900/40 hover:bg-red-800/50 text-red-400 text-sm font-semibold border border-red-800/30 transition-all">
                              <XCircle size={16} /> Reject
                            </button>
                          </div>
                        </div>
                      )}
                      {app.status === 'approved' && (
                        <button onClick={async () => {
                          try {
                            await api.post(`/coaches/admin/resend-approval/${app._id}`);
                            toast.success('✅ Credentials email resent!');
                          } catch { toast.error('Failed to resend email'); }
                        }} className="w-full py-2 rounded-xl bg-blue-900/30 hover:bg-blue-800/40 text-blue-400 text-sm font-medium border border-blue-800/30 transition-all">
                          📧 Resend Login Credentials
                        </button>
                      )}
                      {app.adminNote && (
                        <p className="text-sm text-gray-400 italic">Note: {app.adminNote}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Coaches tab */}
          {tab === 'coaches' && (
            <div className="space-y-3">
              {coaches.length === 0 ? (
                <div className="glass-card p-10 text-center text-gray-400">No active coaches yet. Approve applications to add coaches.</div>
              ) : coaches.map(coach => (
                <div key={coach._id} className="glass-card p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center overflow-hidden">
                      {coach.photo
                        ? <img src={`${API_URL}${coach.photo}`} alt={coach.fullName} className="w-full h-full object-cover" />
                        : <span className="font-black text-white">{coach.fullName.charAt(0)}</span>
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-white">{coach.fullName}</p>
                      <p className="text-xs text-primary-400">{coach.mainSpecialty}</p>
                      <p className="text-xs text-gray-500">{coach.city} • {coach.pricePerSession}€/session • ⭐ {coach.avgRating?.toFixed(1) || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{coach.totalSessions} sessions</span>
                    <button onClick={() => navigate(`/coaches/${coach._id}`)}
                      className="btn-secondary text-xs py-1.5 px-3">View</button>
                    <button onClick={async () => {
                      await api.delete(`/coaches/admin/coaches/${coach._id}`);
                      toast.success('Coach deactivated');
                      loadData();
                    }} className="text-red-400 hover:text-red-300 text-xs py-1.5 px-3 rounded-xl border border-red-800/30 hover:bg-red-900/20 transition-all">
                      Deactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
