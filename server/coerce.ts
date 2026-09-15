export function num(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function str(value: unknown, fallback = '') {
  if (value == null) return fallback;
  return String(value);
}

export function bool(value: unknown, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value == null) return fallback;
  return value === true || value === 'true' || value === 1 || value === '1';
}

export function dateStr(value: unknown) {
  if (!value) return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

export function iso(value: unknown) {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function idOr(prefix: string, value: unknown, index: number) {
  const raw = str(value).trim();
  return raw || `${prefix}-${index + 1}-${Date.now()}`;
}
