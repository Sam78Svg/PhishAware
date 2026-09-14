/** Per-route SEO metadata (used by usePageSeo) */
export const SITE_NAME = 'PhishAware';
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://phishaware.example.com';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-cover.jpg`;

export const ROUTE_SEO = {
  '/': {
    title: 'PhishAware | Phishing Simulation & Cybersecurity Awareness',
    description:
      'Train employees with realistic phishing simulations, instant security feedback, and awareness analytics. Strengthen your organization against social engineering attacks.',
  },
  '/features': {
    title: 'Features | PhishAware',
    description:
      'Explore PhishAware features: phishing simulations, instant employee training, campaign analytics, and team-wide security awareness reporting.',
  },
  '/about': {
    title: 'About Us | PhishAware',
    description:
      'Learn about PhishAware, an academic cybersecurity awareness platform by IMCC Pune students focused on practical phishing defense training.',
  },
  '/login': {
    title: 'Login | PhishAware Portal',
    description: 'Sign in to the PhishAware admin or employee portal to manage campaigns and awareness training.',
  },
  '/admin': {
    title: 'Admin Dashboard | PhishAware',
    description: 'Manage phishing campaigns, templates, recipients, and security awareness reports.',
    noindex: true,
  },
  '/employee': {
    title: 'Employee Dashboard | PhishAware',
    description: 'View simulated phishing emails, training progress, and security awareness metrics.',
    noindex: true,
  },
  '/gemini': {
    title: 'AI Security Assistant | PhishAware',
    description: 'Chat with the PhishAware AI assistant for phishing awareness tips and cybersecurity guidance.',
  },
};

export function getSeoForPath(pathname) {
  if (ROUTE_SEO[pathname]) return ROUTE_SEO[pathname];
  if (pathname.startsWith('/feedback/')) {
    return {
      title: 'Security Training | PhishAware',
      description: 'Phishing simulation feedback and security awareness training.',
      noindex: true,
    };
  }
  return ROUTE_SEO['/'];
}
