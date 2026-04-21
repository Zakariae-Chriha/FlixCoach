import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Database, Cookie, Mail, Lock, Eye, Trash2 } from 'lucide-react';
import SEO from '../components/SEO';

function Section({ icon: Icon, title, children }) {
  return (
    <section className="glass-card p-6 space-y-3">
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <div className="w-8 h-8 rounded-lg bg-primary-900/40 flex items-center justify-center flex-shrink-0">
          <Icon size={15} className="text-primary-400" />
        </div>
        <h2 className="text-base font-bold text-white">{title}</h2>
      </div>
      <div className="text-gray-400 text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-dark-900 px-4 py-12">
      <SEO title="Datenschutzerklärung" path="/datenschutz" description="Datenschutzerklärung von FlixCoach gemäß DSGVO. Erfahren Sie, wie wir Ihre Daten schützen." noIndex />
      <div className="max-w-3xl mx-auto">

        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Zurück zur Startseite
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Datenschutzerklärung</h1>
            <p className="text-gray-400 text-sm">Gemäß DSGVO (EU) 2016/679 · Stand: April 2026</p>
          </div>
        </div>

        <div className="space-y-6">

          <Section icon={Shield} title="1. Verantwortlicher">
            <p>
              Verantwortlicher im Sinne der DSGVO ist:
            </p>
            <div className="bg-dark-700/50 rounded-xl p-4 text-gray-300 space-y-1">
              <p className="font-semibold text-white">FlixCoach – Chriha Zakariae</p>
              <p>Bredow str. 20, 10551 Berlin, Deutschland</p>
              <p>E-Mail: chrihazakaria@gmail.com</p>
            </div>
          </Section>

          <Section icon={Database} title="2. Erhebung und Speicherung personenbezogener Daten">
            <p>
              Bei der Nutzung von FlixCoach erheben wir folgende personenbezogene Daten:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><strong className="text-gray-300">Registrierungsdaten:</strong> Name, E-Mail-Adresse, verschlüsseltes Passwort</li>
              <li><strong className="text-gray-300">Profildaten:</strong> Alter, Gewicht, Körpergröße, Fitnessziele, Ernährungsgewohnheiten</li>
              <li><strong className="text-gray-300">Trainings- & Ernährungsdaten:</strong> Workouts, Mahlzeiten, Schlaf- und Wellnessdaten</li>
              <li><strong className="text-gray-300">Kommunikationsdaten:</strong> Chat-Nachrichten mit dem KI-Coach (anonymisiert gespeichert)</li>
              <li><strong className="text-gray-300">Zahlungsdaten:</strong> Werden ausschließlich über Stripe verarbeitet – FlixCoach speichert keine Kartendaten</li>
            </ul>
            <p>
              Die Verarbeitung erfolgt auf Grundlage von <strong className="text-gray-300">Art. 6 Abs. 1 lit. b DSGVO</strong> (Vertragserfüllung)
              sowie <strong className="text-gray-300">Art. 6 Abs. 1 lit. a DSGVO</strong> (Einwilligung).
            </p>
          </Section>

          <Section icon={Eye} title="3. Verwendung Ihrer Daten">
            <p>Wir verwenden Ihre Daten ausschließlich für folgende Zwecke:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Bereitstellung und Personalisierung der Plattform</li>
              <li>Erstellung KI-generierter Trainings- und Ernährungspläne</li>
              <li>Kommunikation über Buchungen und Support</li>
              <li>Wöchentliche Fortschrittsberichte (nur mit Ihrer Einwilligung)</li>
              <li>Betrugsprävention und Plattformsicherheit</li>
            </ul>
            <p>
              Wir verkaufen Ihre Daten nicht an Dritte und verwenden sie nicht für Werbezwecke.
            </p>
          </Section>

          <Section icon={Cookie} title="4. Cookies">
            <p>
              FlixCoach verwendet folgende Arten von Cookies:
            </p>
            <div className="space-y-3">
              <div className="bg-dark-700/50 rounded-xl p-4">
                <p className="font-semibold text-green-400 text-xs uppercase tracking-wider mb-1">Notwendige Cookies</p>
                <p>Authentifizierungstoken (JWT) — ohne diese funktioniert die Plattform nicht.</p>
              </div>
              <div className="bg-dark-700/50 rounded-xl p-4">
                <p className="font-semibold text-blue-400 text-xs uppercase tracking-wider mb-1">Funktionale Cookies</p>
                <p>Speicherung Ihrer Einstellungen, Sprache und Darstellungspräferenzen (localStorage).</p>
              </div>
              <div className="bg-dark-700/50 rounded-xl p-4">
                <p className="font-semibold text-yellow-400 text-xs uppercase tracking-wider mb-1">Analyse-Cookies (optional)</p>
                <p>Anonymisierte Nutzungsstatistiken zur Verbesserung der Plattform — nur mit Ihrer Einwilligung.</p>
              </div>
            </div>
            <p>
              Sie können Cookies in Ihrem Browser jederzeit löschen oder blockieren. Dies kann die
              Funktionalität der Plattform einschränken.
            </p>
          </Section>

          <Section icon={Shield} title="5. Drittanbieter">
            <div className="space-y-3">
              {[
                {
                  name: 'MongoDB Atlas (Datenbankhosting)',
                  detail: 'Speicherung aller Nutzerdaten in EU-Rechenzentren. Auftragsverarbeitungsvertrag (AVV) vorhanden.',
                  link: 'https://www.mongodb.com/legal/privacy-policy'
                },
                {
                  name: 'Anthropic Claude AI (KI-Coach)',
                  detail: 'Chat-Nachrichten werden zur KI-Verarbeitung an Anthropic übermittelt. Daten werden nicht dauerhaft gespeichert.',
                  link: 'https://www.anthropic.com/privacy'
                },
                {
                  name: 'Stripe (Zahlungsabwicklung)',
                  detail: 'Zahlungsdaten werden ausschließlich von Stripe verarbeitet. FlixCoach hat keinen Zugriff auf Kartendaten.',
                  link: 'https://stripe.com/de/privacy'
                },
                {
                  name: 'Jitsi Meet (Video-Sessions)',
                  detail: 'Video-Calls werden über die öffentliche Jitsi-Infrastruktur übertragen.',
                  link: 'https://jitsi.org/meet-jit-si-privacy/'
                },
              ].map(p => (
                <div key={p.name} className="bg-dark-700/50 rounded-xl p-4">
                  <p className="font-semibold text-gray-200 mb-1">{p.name}</p>
                  <p className="text-xs text-gray-400 mb-1.5">{p.detail}</p>
                  <a href={p.link} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary-400 hover:text-primary-300 underline">
                    Datenschutzerklärung →
                  </a>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Lock} title="6. Datensicherheit">
            <p>
              Wir setzen folgende technische und organisatorische Maßnahmen (TOMs) ein:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Verschlüsselte Übertragung via HTTPS/TLS</li>
              <li>Bcrypt-Hashing aller Passwörter (Faktor 12)</li>
              <li>JWT-basierte Authentifizierung mit Ablaufdatum (30 Tage)</li>
              <li>Keine Speicherung von Zahlungsdaten auf unseren Servern</li>
              <li>Regelmäßige Sicherheitsupdates der Infrastruktur</li>
            </ul>
          </Section>

          <Section icon={Trash2} title="7. Ihre Rechte (Art. 15–22 DSGVO)">
            <p>Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { right: 'Auskunftsrecht', desc: 'Welche Daten wir über Sie speichern (Art. 15)' },
                { right: 'Berichtigungsrecht', desc: 'Korrektur unrichtiger Daten (Art. 16)' },
                { right: 'Löschungsrecht', desc: 'Recht auf „Vergessenwerden" (Art. 17)' },
                { right: 'Einschränkung', desc: 'Einschränkung der Verarbeitung (Art. 18)' },
                { right: 'Datenübertragbarkeit', desc: 'Export Ihrer Daten (Art. 20)' },
                { right: 'Widerspruchsrecht', desc: 'Widerspruch gegen Verarbeitung (Art. 21)' },
              ].map(r => (
                <div key={r.right} className="bg-dark-700/50 rounded-xl p-3">
                  <p className="font-semibold text-gray-200 text-xs">{r.right}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{r.desc}</p>
                </div>
              ))}
            </div>
            <p>
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:{' '}
              <a href="mailto:chrihazakaria@gmail.com" className="text-primary-400 hover:text-primary-300 underline">
                chrihazakaria@gmail.com
              </a>
            </p>
            <p>
              Sie haben außerdem das Recht, sich bei der zuständigen Aufsichtsbehörde zu beschweren.
              Die zuständige Behörde für Deutschland:{' '}
              <a href="https://www.bfdi.bund.de" target="_blank" rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 underline">
                Bundesbeauftragte für den Datenschutz (BfDI)
              </a>
            </p>
          </Section>

          <Section icon={Mail} title="8. Kontakt Datenschutz">
            <p>
              Bei Fragen zum Datenschutz erreichen Sie uns unter:
            </p>
            <div className="bg-dark-700/50 rounded-xl p-4 text-gray-300">
              <p>E-Mail: <a href="mailto:chrihazakaria@gmail.com" className="text-primary-400 hover:text-primary-300">chrihazakaria@gmail.com</a></p>
              <p className="mt-1 text-xs text-gray-500">Wir antworten in der Regel innerhalb von 72 Stunden.</p>
            </div>
          </Section>

        </div>

        <div className="mt-8 text-center text-xs text-gray-600 space-y-1">
          <p>© 2026 FlixCoach · Alle Rechte vorbehalten</p>
          <div className="flex justify-center gap-4">
            <Link to="/impressum" className="hover:text-gray-400 transition-colors">Impressum</Link>
            <Link to="/" className="hover:text-gray-400 transition-colors">Startseite</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
