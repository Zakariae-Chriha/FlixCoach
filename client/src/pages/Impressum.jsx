import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Globe, Shield } from 'lucide-react';
import SEO from '../components/SEO';

export default function Impressum() {
  return (
    <div className="min-h-screen bg-dark-900 px-4 py-12">
      <SEO title="Impressum" path="/impressum" description="Impressum von FlixCoach gemäß §5 TMG. Angaben zum Anbieter, Kontakt und Haftungsausschluss." noIndex />
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Zurück zur Startseite
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-primary-600 flex items-center justify-center flex-shrink-0">
            <Building2 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Impressum</h1>
            <p className="text-gray-400 text-sm">Angaben gemäß § 5 TMG</p>
          </div>
        </div>

        <div className="space-y-8">

          {/* Anbieter */}
          <section className="glass-card p-6 space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">Anbieter</h2>
            <div className="text-gray-300 space-y-1 text-sm">
              <p className="font-semibold text-white">FlixCoach – AI-Fitness Platform</p>
              <p>Chriha Zakariae</p>
              <p>Bredow str. 20</p>
              <p>10551 Berlin</p>
              <p>Deutschland</p>
            </div>
          </section>

          {/* Kontakt */}
          <section className="glass-card p-6 space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">Kontakt</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail size={15} className="text-primary-400 flex-shrink-0" />
                <span>chrihazakaria@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Globe size={15} className="text-primary-400 flex-shrink-0" />
                <span>www.flixcoach.de</span>
              </div>
            </div>
          </section>

          {/* Verantwortlicher */}
          <section className="glass-card p-6 space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">
              Verantwortlicher für Inhalte (§ 55 Abs. 2 RStV)
            </h2>
            <p className="text-gray-300 text-sm">
              Chriha Zakariae, Bredow str. 20, 10551 Berlin, Deutschland
            </p>
          </section>

          {/* Haftung */}
          <section className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">
              Haftungsausschluss
            </h2>

            <div className="space-y-2">
              <h3 className="font-semibold text-white text-sm">Haftung für Inhalte</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
                Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
                Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten
                nach den allgemeinen Gesetzen verantwortlich.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-white text-sm">Haftung für Links</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
                Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
                Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
                der Seiten verantwortlich.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-white text-sm">Urheberrecht</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
                dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
                der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
                Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
            </div>
          </section>

          {/* Streitbeilegung */}
          <section className="glass-card p-6 space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">
              Streitbeilegung
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 underline">
                https://ec.europa.eu/consumers/odr
              </a>
              . Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder
              verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
              teilzunehmen.
            </p>
          </section>

          {/* KI-Hinweis */}
          <section className="glass-card p-6 space-y-3 border border-primary-800/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-primary-400" />
              <h2 className="text-lg font-bold text-white">Hinweis zu KI-generierten Inhalten</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              FlixCoach verwendet künstliche Intelligenz (Claude AI von Anthropic) zur Erstellung
              personalisierter Trainings- und Ernährungspläne. Diese Inhalte sind als allgemeine
              Empfehlungen zu verstehen und ersetzen keine professionelle medizinische oder
              sporttherapeutische Beratung. Bei gesundheitlichen Beschwerden konsultieren Sie bitte
              einen Arzt.
            </p>
          </section>

        </div>

        <p className="text-center text-xs text-gray-600 mt-10">
          Stand: April 2026 · FlixCoach – AI-Powered Fitness Platform
        </p>
      </div>
    </div>
  );
}
