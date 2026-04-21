import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
import SEO from '../components/SEO';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [show, setShow] = useState({ password: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const strength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strengthLabel = ['', 'Schwach', 'Mittel', 'Gut', 'Stark'];
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const s = strength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Mindestens 6 Zeichen erforderlich'); return; }
    if (form.password !== form.confirm) { toast.error('Passwörter stimmen nicht überein'); return; }

    setLoading(true);
    setError('');
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Ungültiger oder abgelaufener Link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <SEO title="Neues Passwort" path="/reset-password" noIndex />
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 via-primary-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-900/40">
            <Zap size={26} className="text-white fill-white" />
          </div>
          <h1 className="text-2xl font-black mb-1 text-white">Neues Passwort</h1>
          <p className="text-gray-400 text-sm">Wählen Sie ein sicheres neues Passwort</p>
        </div>

        <div className="glass-card p-8">
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-green-900/30 border border-green-800/30 flex items-center justify-center mx-auto">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <div>
                <p className="font-bold text-white text-lg">Passwort geändert!</p>
                <p className="text-gray-400 text-sm mt-1">Sie werden in Kürze zum Login weitergeleitet...</p>
              </div>
              <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3">
                Jetzt anmelden
              </Link>
            </div>
          ) : error ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-900/30 border border-red-800/30 flex items-center justify-center mx-auto">
                <AlertTriangle size={28} className="text-red-400" />
              </div>
              <div>
                <p className="font-bold text-white">Link ungültig oder abgelaufen</p>
                <p className="text-gray-400 text-sm mt-1">{error}</p>
              </div>
              <Link to="/forgot-password" className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3">
                Neuen Link anfordern
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Neues Passwort</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={show.password ? 'text' : 'password'}
                    className="input-field pl-10 pr-11"
                    placeholder="Mindestens 6 Zeichen"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    autoFocus
                  />
                  <button type="button" onClick={() => setShow(s => ({ ...s, password: !s.password }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {show.password ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Strength bar */}
                {form.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= s ? strengthColor[s] : 'bg-dark-600'}`} />
                      ))}
                    </div>
                    <p className={`text-xs ${s <= 1 ? 'text-red-400' : s === 2 ? 'text-yellow-400' : s === 3 ? 'text-blue-400' : 'text-green-400'}`}>
                      {strengthLabel[s]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Passwort bestätigen</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={show.confirm ? 'text' : 'password'}
                    className={`input-field pl-10 pr-11 transition-all ${
                      form.confirm && form.confirm !== form.password ? 'border-red-500/50 focus:border-red-500/50' :
                      form.confirm && form.confirm === form.password ? 'border-green-500/50 focus:border-green-500/50' : ''
                    }`}
                    placeholder="Passwort wiederholen"
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    required
                  />
                  <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.confirm && form.confirm !== form.password && (
                  <p className="text-xs text-red-400 mt-1">Passwörter stimmen nicht überein</p>
                )}
                {form.confirm && form.confirm === form.password && (
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-1"><CheckCircle size={11} /> Passwörter stimmen überein</p>
                )}
              </div>

              <button type="submit" disabled={loading || form.password !== form.confirm || form.password.length < 6}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Wird gespeichert...</>
                  : <><Lock size={16} /> Passwort speichern</>
                }
              </button>
            </form>
          )}

          {!done && !error && (
            <div className="mt-5 text-center">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors">
                <ArrowLeft size={14} /> Zurück zum Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
