import { Helmet } from 'react-helmet-async';

const BASE = 'FlixCoach';
const DEFAULT_DESC = 'FlixCoach – Die KI-Fitness-Plattform aus Deutschland. Personalisierte Trainingspläne, zertifizierte Coaches und KI-Coaching in einer App.';
const DEFAULT_IMG = '/og-image.png';
const SITE_URL = 'https://www.flixcoach.de';

export default function SEO({
  title,
  description = DEFAULT_DESC,
  image = DEFAULT_IMG,
  path = '',
  noIndex = false,
  type = 'website',
}) {
  const fullTitle = title ? `${title} · ${BASE}` : `${BASE} – KI-Fitness & Personal Coaching`;
  const canonical = `${SITE_URL}${path}`;

  return (
    <Helmet>
      {/* Basic */}
      <html lang="de" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph (Facebook, LinkedIn, WhatsApp) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${SITE_URL}${image}`} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={BASE} />
      <meta property="og:locale" content="de_DE" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}${image}`} />

      {/* Additional */}
      <meta name="author" content="FlixCoach" />
      <meta name="theme-color" content="#d946ef" />
    </Helmet>
  );
}
