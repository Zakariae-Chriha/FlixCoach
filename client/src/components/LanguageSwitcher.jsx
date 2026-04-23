import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const LANGS = [
  { code: 'de', label: 'DE', flag: '🇩🇪' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'ar', label: 'AR', flag: '🇸🇦' },
];

export default function LanguageSwitcher({ compact = false }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2) || 'de';

  useEffect(() => {
    // Set RTL direction for Arabic
    document.documentElement.dir = current === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = current;
  }, [current]);

  const change = (code) => {
    i18n.changeLanguage(code);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {LANGS.map(({ code, flag }) => (
          <button
            key={code}
            onClick={() => change(code)}
            className={`w-7 h-7 rounded-lg text-sm transition-all ${
              current === code
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600'
            }`}
          >
            {flag}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-dark-800 rounded-xl">
      {LANGS.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => change(code)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            current === code
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-dark-700'
          }`}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
