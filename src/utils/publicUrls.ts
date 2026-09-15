import { normalizePublicUrl } from './normalizeUrl';

export function publicSiteOrigin() {
  const fromEnv = normalizePublicUrl(import.meta.env.VITE_APP_URL);
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return '';
}

export function receiptVerifyUrl(id: string) {
  return `${publicSiteOrigin()}/verify/receipt/${encodeURIComponent(id)}`;
}

export function ticketVerifyUrl(id: string) {
  return `${publicSiteOrigin()}/verify/ticket/${encodeURIComponent(id)}`;
}
