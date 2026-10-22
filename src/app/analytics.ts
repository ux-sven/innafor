// Google Analytics (GA4) that only loads after the visitor has said yes (GDPR / ekomloven § 3-15).
// Nothing is loaded and no cookies are set until consent is given.

export const GA_ID = 'G-E06FX92GY9';
const STORAGE_KEY = 'innafor-cookie-consent';
export const OPEN_SETTINGS_EVENT = 'innafor:open-cookie-settings';

export type Consent = 'granted' | 'denied';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* private mode etc. – choice then only lasts for this visit */
  }
  if (value === 'granted') {
    loadAnalytics();
  } else {
    disableAnalytics();
  }
}

let loaded = false;

export function loadAnalytics() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  (window as Record<string, unknown>)[`ga-disable-${GA_ID}`] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

/** Stops tracking and removes the GA cookies when consent is withdrawn. */
function disableAnalytics() {
  (window as Record<string, unknown>)[`ga-disable-${GA_ID}`] = true;
  window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
  const host = location.hostname;
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];
  document.cookie
    .split(';')
    .map((c) => c.split('=')[0].trim())
    .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid')
    .forEach((name) => {
      domains.forEach((d) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ''}`;
      });
    });
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}
