export function normalizePublicUrl(raw: string | undefined) {
  const value = String(raw || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\/$/, '');

  if (!value || value === 'VITE_APP_URL' || value === 'VITE_API_URL' || value === 'YOUR-API.up.railway.app') {
    return '';
  }

  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}
