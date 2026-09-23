import { Receipt } from '../types';
import { Itinerary } from '../types/itinerary';
import { normalizePublicUrl } from '../utils/normalizeUrl';

function apiBase() {
  if (typeof window !== 'undefined') return '';
  return normalizePublicUrl(import.meta.env.VITE_API_URL);
}

function headers() {
  return {
    'Content-Type': 'application/json',
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...headers(),
      ...(init?.headers || {}),
    },
  });
  if (res.status === 401 && typeof window !== 'undefined' && !path.startsWith('/api/auth/') && !path.startsWith('/api/portal/')) {
    window.dispatchEvent(new Event('reoxy:unauthorized'));
  }
  if (res.status === 204) {
    return undefined as T;
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = typeof body.error === 'string' ? body.error : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body as T;
}

export function fetchDeskSession() {
  return request<{ ok: boolean; user: string }>('/api/auth/me');
}

export function loginDesk(email: string, password: string) {
  return request<{ ok: boolean; user: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }).then((body) => body.user);
}

export function logoutDesk() {
  return request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const data = await request<{ ok?: boolean }>('/api/health');
    return data.ok === true;
  } catch {
    return false;
  }
}

export function listReceipts() {
  return request<Receipt[]>('/api/receipts');
}

export function saveReceipt(receipt: Receipt) {
  return request<Receipt>(`/api/receipts/${encodeURIComponent(receipt.id)}`, {
    method: 'PUT',
    body: JSON.stringify(receipt),
  });
}

export function deleteReceipt(id: string) {
  return request<void>(`/api/receipts/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function listItineraries() {
  return request<Itinerary[]>('/api/itineraries');
}

export function saveItinerary(itinerary: Itinerary) {
  return request<Itinerary>(`/api/itineraries/${encodeURIComponent(itinerary.id)}`, {
    method: 'PUT',
    body: JSON.stringify(itinerary),
  });
}

export function deleteItinerary(id: string) {
  return request<void>(`/api/itineraries/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function fetchPublicReceipt(id: string) {
  return request<{ ok: boolean; document: Receipt }>(
    `/api/public/receipts/${encodeURIComponent(id)}`
  ).then((body) => body.document);
}

export function fetchPublicItinerary(id: string) {
  return request<{ ok: boolean; document: Itinerary }>(
    `/api/public/itineraries/${encodeURIComponent(id)}`
  ).then((body) => body.document);
}

export type PortalService = {
  id: string;
  title: string;
  description: string;
  category: string;
  priceUsd: number;
  badge: string;
};

export type PortalQuote = {
  id: string;
  notes: string;
  status: string;
  total: number;
  createdAt: string;
  items: { title: string; unitPrice: number; total: number }[];
};

export function signupPortal(input: { fullName: string; email: string; phone: string; password: string }) {
  return request<{ ok: boolean; user: string; name?: string }>('/api/portal/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function loginPortal(email: string, password: string) {
  return request<{ ok: boolean; user: string }>('/api/portal/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }).then((body) => body.user);
}

export function logoutPortal() {
  return request<{ ok: boolean }>('/api/portal/logout', { method: 'POST' });
}

export function fetchPortalSession() {
  return request<{ ok: boolean; user: string; userId: string }>('/api/portal/me');
}

export function fetchPortalServices() {
  return request<PortalService[]>('/api/portal/services');
}

export function fetchPortalQuotes() {
  return request<PortalQuote[]>('/api/portal/quotes');
}

export function submitPortalQuote(serviceIds: string[], notes: string) {
  return request<PortalQuote>('/api/portal/quotes', {
    method: 'POST',
    body: JSON.stringify({ serviceIds, notes }),
  });
}
