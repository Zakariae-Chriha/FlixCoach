import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, Clock, CheckCircle, XCircle, BarChart3,
  FileText, Eye, Shield, Calendar, CreditCard, Percent,
  TrendingUp, DollarSign, Edit2, Check,
} from 'lucide-react';

const PLAN_COLORS = {
  free:  'bg-gray-700/40 text-gray-300',
  pro:   'bg-blue-900/40 text-blue-300',
  elite: 'bg-yellow-900/40 text-yellow-300',
};

const PLAN_LABELS = { free: 'Free', pro: 'Pro €9.99', elite: 'Elite €24.99' };

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

  // Subscriptions tab state
  const [subUsers, setSubUsers] = useState([]);
  const [subCounts, setSubCounts] = useState({ free: 0, pro: 0, elite: 0 });
  const [subLoading, setSubLoading] = useState(false);
  const [changingPlan, setChangingPlan] = useState(null);

  // Commission tab state
  const [commData, setCommData] = useState(null);
  const [commLoading, setCommLoading] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [rateInput, setRateInput] = useState('');

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

  const loadSubscriptions = async () => {
    setSubLoading(true);
    try {
      const res = await api.get('/coaches/admin/subscriptions');
      setSubUsers(res.data.users);
      setSubCounts(res.data.counts);
    } catch { toast.error('Failed to load subscriptions'); }
    finally { setSubLoading(false); }
  };

  const loadCommission = async () => {
    setCommLoading(true);
    try {
      const res = await api.get('/coaches/admin/commission');
      setCommData(res.data);
    } catch { toast.error('Failed to load commission data'); }
    finally { setCommLoading(false); }
  };

  const handleTabChange = (id) => {
    setTab(id);
    if (id === 'subscriptions' && subUsers.length === 0) loadSubscriptions();
    if (id === 'commission' && !commData) loadCommission();
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

  const handlePlanChange = async (userId, plan) => {
    setChangingPlan(userId);
    try {
      await api.patch(`/coaches/admin/subscriptions/${userId}`, { plan });
      setSubUsers(prev => prev.map(u => u._id === userId
        ? { ...u, subscription: { ...u.subscription, plan, status: plan === 'free' ? 'inactive' : 'active' } }
        : u
      ));
      toast.success(`Plan updated to ${plan}`);
    } catch { toast.error('Failed to update plan'); }
    finally { setChangingPlan(null); }
  };

  const handleRateUpdate = async (coachId) => {
    const rate = parseFloat(rateInput);
    if (isNaN(rate) || rate < 0 || rate > 100) { toast.error('Enter a valid rate (0-100)'); return; }
    try {
      await api.patch(`/coaches/admin/commission/${coachId}`, { commissionRate: rate });
      setCommData(prev => ({
        ...prev,
        coaches: prev.coaches.map(c => c._id === coachId ? { ...c, commissionRate: rate } : c),
      }));
      setEditingRate(null);
      toast.success('Commission rate updated');
    } catch { toast.error('Failed to update rate'); }
  };

  const statusBadge = (s) => {
    const map = { pending: 'bg-yellow-900/30 text-yellow-400', approved: 'bg-green-900/30 text-green-400', rejected: 'bg-red-900/30 text-red-400' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[s]}`}>{s}</span>;
  };

  if (user?.role !== 'admin') return null;

  const TABS = [
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'coaches',      label: 'Coaches',      icon: Users },
    { id: 'subscriptions',label: 'Subscriptions',icon: CreditCard },
    { id: 'commission',   label: 'Commission',   icon: Percent },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Manage coaches, subscriptions & commissions</p>
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
      <div className="flex gap-1 bg-dark-800 p-1 rounded-xl flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => handleTabChange(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all min-w-[100px]
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

      {loading && tab !== 'subscriptions' && tab !== 'commission' ? (
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
                <div className="glass-card p-10 text-center text-gray-400">No active coaches yet.</div>
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

          {/* Subscriptions tab */}
          {tab === 'subscriptions' && (
            <div className="space-y-5">
              {/* Plan counts */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { plan: 'free',  label: 'Free',  icon: Users,       color: 'text-gray-400 bg-gray-700/30' },
                  { plan: 'pro',   label: 'Pro',   icon: TrendingUp,  color: 'text-blue-400 bg-blue-900/30' },
                  { plan: 'elite', label: 'Elite', icon: DollarSign,  color: 'text-yellow-400 bg-yellow-900/30' },
                ].map(({ plan, label, icon: Icon, color }) => (
                  <div key={plan} className="glass-card p-4 text-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} mx-auto mb-2`}>
                      <Icon size={18} />
                    </div>
                    <p className="text-2xl font-black text-white">{subCounts[plan]}</p>
                    <p className="text-xs text-gray-400 mt-1">{label} users</p>
                  </div>
                ))}
              </div>

              {subLoading ? (
                <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-dark-600 border-t-primary-500 animate-spin" /></div>
              ) : (
                <div className="glass-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm font-semibold text-white">All Members ({subUsers.length})</p>
                  </div>
                  <div className="divide-y divide-white/5">
                    {subUsers.length === 0 ? (
                      <p className="text-center text-gray-400 py-8">No users found</p>
                    ) : subUsers.map(u => (
                      <div key={u._id} className="flex items-center justify-between px-4 py-3 gap-4 flex-wrap">
                        <div>
                          <p className="text-sm font-medium text-white">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${PLAN_COLORS[u.subscription?.plan || 'free']}`}>
                            {PLAN_LABELS[u.subscription?.plan || 'free']}
                          </span>
                          {/* Plan change dropdown */}
                          <select
                            disabled={changingPlan === u._id}
                            defaultValue=""
                            onChange={e => { if (e.target.value) handlePlanChange(u._id, e.target.value); }}
                            className="bg-dark-700 border border-white/10 text-gray-300 text-xs rounded-lg px-2 py-1.5 cursor-pointer"
                          >
                            <option value="" disabled>Change plan</option>
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="elite">Elite</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Commission tab */}
          {tab === 'commission' && (
            <div className="space-y-5">
              {commLoading ? (
                <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-dark-600 border-t-primary-500 animate-spin" /></div>
              ) : commData ? (
                <>
                  {/* Totals */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Total Revenue', value: `€${commData.totals.totalRevenue.toFixed(2)}`, color: 'text-green-400 bg-green-900/30' },
                      { label: 'Admin Commission', value: `€${commData.totals.totalCommission.toFixed(2)}`, color: 'text-yellow-400 bg-yellow-900/30' },
                      { label: 'Coach Payouts', value: `€${commData.totals.totalPayout.toFixed(2)}`, color: 'text-blue-400 bg-blue-900/30' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="glass-card p-4 text-center">
                        <p className={`text-xl font-black ${color.split(' ')[0]}`}>{value}</p>
                        <p className="text-xs text-gray-400 mt-1">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Per-coach breakdown */}
                  <div className="glass-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-semibold text-white">Coach Commission Breakdown</p>
                      <p className="text-xs text-gray-500 mt-0.5">Set individual commission % per coach. Applies to future completed sessions.</p>
                    </div>
                    <div className="divide-y divide-white/5">
                      {commData.coaches.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No coaches yet</p>
                      ) : commData.coaches.map(c => (
                        <div key={c._id} className="px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{c.fullName}</p>
                            <p className="text-xs text-gray-500">{c.email} • {c.sessionCount || 0} completed sessions</p>
                          </div>
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Revenue / Commission / Payout</p>
                              <p className="text-sm font-medium text-white">
                                €{(c.totalRevenue||0).toFixed(2)} /
                                <span className="text-yellow-400"> €{(c.totalCommission||0).toFixed(2)}</span> /
                                <span className="text-green-400"> €{(c.totalPayout||0).toFixed(2)}</span>
                              </p>
                            </div>
                            {/* Commission rate editor */}
                            {editingRate === c._id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number" min="0" max="100"
                                  value={rateInput}
                                  onChange={e => setRateInput(e.target.value)}
                                  className="w-16 bg-dark-700 border border-white/10 text-white text-sm rounded-lg px-2 py-1 text-center"
                                />
                                <span className="text-gray-400 text-sm">%</span>
                                <button onClick={() => handleRateUpdate(c._id)}
                                  className="w-7 h-7 rounded-lg bg-green-700 hover:bg-green-600 flex items-center justify-center">
                                  <Check size={13} className="text-white" />
                                </button>
                                <button onClick={() => setEditingRate(null)}
                                  className="w-7 h-7 rounded-lg bg-dark-600 flex items-center justify-center text-gray-400">
                                  <XCircle size={13} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditingRate(c._id); setRateInput(String(c.commissionRate)); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 border border-white/10 text-sm text-white transition-all">
                                <Percent size={13} className="text-yellow-400" />
                                {c.commissionRate}%
                                <Edit2 size={12} className="text-gray-500" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="glass-card p-10 text-center text-gray-400">Failed to load commission data.</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
