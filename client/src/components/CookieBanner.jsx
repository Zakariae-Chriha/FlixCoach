import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X, ChevronDown, ChevronUp, Shield, BarChart2, Settings } from 'lucide-react';

const STORAGE_KEY = 'flixcoach_cookie_consent';

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-10 h-5.5 rounded-full transition-all duration-200 flex-shrink-0
        ${checked ? 'bg-primary-600' : 'bg-dark-500'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
      style={{ height: '22px', width: '40px' }}
      aria-checked={checked}
      role="switch"
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200
        ${checked ? 'left-5' : 'left-0.5'}`} />
    </button>
  );
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState({ functional: true, analytics: false });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setTimeout(() => setVisible(true), 800);
    }
  }, []);

  const save = (consent) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...consent, date: new Date().toISOString() }));
    setVisible(false);
  };

  const acceptAll = () => save({ necessary: true, functional: true, analytics: true });
  const acceptNecessary = () => save({ necessary: true, functional: false, analytics: false });
  const saveCustom = () => save({ necessary: true, ...prefs });

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-end sm:justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>

      <div className="w-full sm:max-w-xl bg-dark-800 border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="px-6 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-primary-600 flex items-center justify-center flex-shrink-0">
              <Cookie size={16} className="text-white" />
            </div>
            <div>
              <p className="font-black text-white text-sm">Cookies & Datenschutz</p>
              <p className="text-xs text-gray-500">FlixCoach · DSGVO-konform</p>
            </div>
          </div>
          <button onClick={acceptNecessary} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-4">
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Wir verwenden Cookies, um Ihnen die bestmögliche Nutzungserfahrung zu bieten und unsere
            Plattform zu verbessern. Sie können Ihre Auswahl jederzeit ändern.{' '}
            <Link to="/datenschutz" className="text-primary-400 hover:text-primary-300 underline">
              Datenschutzerklärung
            </Link>
          </p>

          {/* Expand settings */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-4">
            <Settings size={13} />
            Einstellungen anpassen
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {/* Cookie categories */}
          {expanded && (
            <div className="space-y-3 mb-4 bg-dark-900/50 rounded-xl p-4 border border-white/5">
              {[
                {
                  key: 'necessary',
                  icon: Shield,
                  label: 'Notwendige Cookies',
                  desc: 'Authentifizierung (JWT), Session-Verwaltung. Ohne diese funktioniert die Plattform nicht.',
                  color: 'text-green-400',
                  locked: true,
                  value: true,
                },
                {
                  key: 'functional',
                  icon: Cookie,
                  label: 'Funktionale Cookies',
                  desc: 'Einstellungen, Sprachpräferenzen und Darstellung (localStorage).',
                  color: 'text-blue-400',
                  locked: false,
                  value: prefs.functional,
                },
                {
                  key: 'analytics',
                  icon: BarChart2,
                  label: 'Analyse-Cookies',
                  desc: 'Anonymisierte Nutzungsstatistiken zur Verbesserung unserer Plattform.',
                  color: 'text-yellow-400',
                  locked: false,
                  value: prefs.analytics,
                },
              ].map(({ key, icon: Icon, label, desc, color, locked, value }) => (
                <div key={key} className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <Icon size={14} className={`${color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className="text-xs font-semibold text-white">{label}{locked && <span className="ml-1.5 text-gray-600 font-normal">(erforderlich)</span>}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                  <Toggle
                    checked={value}
                    disabled={locked}
                    onChange={(v) => setPrefs(p => ({ ...p, [key]: v }))}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={acceptAll}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary-900/30">
              Alle akzeptieren
            </button>
            {expanded ? (
              <button
                onClick={saveCustom}
                className="flex-1 py-3 rounded-xl bg-dark-700 border border-white/10 text-white font-semibold text-sm hover:bg-dark-600 transition-all">
                Auswahl speichern
              </button>
            ) : (
              <button
                onClick={acceptNecessary}
                className="flex-1 py-3 rounded-xl bg-dark-700 border border-white/10 text-gray-300 font-semibold text-sm hover:bg-dark-600 hover:text-white transition-all">
                Nur Notwendige
              </button>
            )}
          </div>

          <p className="text-center text-xs text-gray-600 mt-3">
            <Link to="/impressum" className="hover:text-gray-400 transition-colors">Impressum</Link>
            {' · '}
            <Link to="/datenschutz" className="hover:text-gray-400 transition-colors">Datenschutz</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
