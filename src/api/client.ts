import { Receipt } from '../types';
import { Itinerary } from '../types/itinerary';
import { normalizePublicUrl } from '../utils/normalizeUrl';

const API_BASE = normalizePublicUrl(import.meta.env.VITE_API_URL);

function headers() {
  const extra: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const key = import.meta.env.VITE_API_KEY;
  if (key) extra['x-api-key'] = key;
  return extra;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...headers(),
      ...(init?.headers || {}),
    },
  });
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
