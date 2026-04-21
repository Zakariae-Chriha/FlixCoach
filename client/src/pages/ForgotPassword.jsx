import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft, Zap, CheckCircle } from 'lucide-react';
import SEO from '../components/SEO';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Bitte E-Mail eingeben'); return; }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Fehler beim Senden. Versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <SEO title="Passwort vergessen" path="/forgot-password" noIndex />
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 via-primary-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-900/40">
            <Zap size={26} className="text-white fill-white" />
          </div>
          <h1 className="text-2xl font-black mb-1 text-white">Passwort vergessen?</h1>
          <p className="text-gray-400 text-sm">Wir senden Ihnen einen Reset-Link per E-Mail</p>
        </div>

        <div className="glass-card p-8">
          {sent ? (
            /* Success state */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-green-900/30 border border-green-800/30 flex items-center justify-center mx-auto">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <div>
                <p className="font-bold text-white text-lg">E-Mail gesendet!</p>
                <p className="text-gray-400 text-sm mt-1">
                  Wenn <span className="text-white font-medium">{email}</span> bei uns registriert ist,
                  erhalten Sie in wenigen Minuten eine E-Mail mit dem Reset-Link.
                </p>
              </div>
              <div className="bg-dark-700/50 rounded-xl p-4 text-left space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nicht erhalten?</p>
                <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                  <li>Spam-/Junk-Ordner prüfen</li>
                  <li>E-Mail-Adresse korrekt eingegeben?</li>
                  <li>Link ist 1 Stunde gültig</li>
                </ul>
              </div>
              <button
                onClick={() => setSent(false)}
                className="w-full py-3 rounded-xl bg-dark-700 border border-white/10 text-gray-300 font-semibold text-sm hover:bg-dark-600 hover:text-white transition-all">
                Erneut versuchen
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-Mail-Adresse
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    className="input-field pl-10"
                    placeholder="ihre@email.de"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Wird gesendet...</>
                  : <><Mail size={16} /> Reset-Link senden</>
                }
              </button>
            </form>
          )}

          <div className="mt-5 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors">
              <ArrowLeft size={14} /> Zurück zum Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
