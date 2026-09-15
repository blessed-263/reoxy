import React, { useEffect, useState } from 'react';
import { ReOxyLogo } from '../components/logos/ReOxyLogo';
import { MicorLogo } from '../components/logos/MicorLogo';
import { fetchPublicItinerary, fetchPublicReceipt } from '../api/client';
import { Receipt } from '../types';
import { Itinerary } from '../types/itinerary';
import { formatCurrency, formatDate } from '../utils/formatters';
import { formatItineraryCurrency, formatShortDate } from '../utils/itineraryFormatters';

function parseVerifyPath(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'verify' || parts.length < 3) return null;
  const kind = parts[1];
  const id = decodeURIComponent(parts.slice(2).join('/'));
  if (kind === 'receipt' || kind === 'ticket') {
    return { kind, id };
  }
  return null;
}

export const VerifyPage: React.FC = () => {
  const pathname = window.location.pathname;
  const parsed = parseVerifyPath(pathname);
  const [status, setStatus] = useState<'loading' | 'ok' | 'missing' | 'error'>('loading');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [ticket, setTicket] = useState<Itinerary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!parsed) {
      setStatus('missing');
      return;
    }

    const run = async () => {
      if (!import.meta.env.VITE_API_URL) {
        setError('Set VITE_API_URL on Vercel to your Railway API URL.');
        setStatus('error');
        return;
      }
      try {
        if (parsed.kind === 'receipt') {
          const doc = await fetchPublicReceipt(parsed.id);
          setReceipt(doc);
        } else {
          const doc = await fetchPublicItinerary(parsed.id);
          setTicket(doc);
        }
        setStatus('ok');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Not found';
        setError(message);
        setStatus(message.toLowerCase().includes('not found') ? 'missing' : 'error');
      }
    };

    void run();
  }, [pathname]);

  const isTicket = parsed?.kind === 'ticket';

  return (
    <div className="min-h-screen bg-[#eef1f5] text-slate-800">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          {isTicket ? <MicorLogo size="sm" variant="dark" /> : <ReOxyLogo size="sm" variant="dark" />}
          <span className="text-[12px] font-semibold rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1">
            Official verify
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 sm:p-6">
        {status === 'loading' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Checking this document…
          </div>
        )}

        {status !== 'loading' && status !== 'ok' && (
          <div className="rounded-2xl border border-rose-100 bg-white p-8 text-center">
            <div className="text-lg font-semibold text-slate-900">This QR is not valid</div>
            <p className="text-[14px] text-slate-500 mt-2">
              {error || 'No matching receipt or ticket was found in the live registry.'}
            </p>
          </div>
        )}

        {status === 'ok' && receipt && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-sky-700">Verified receipt</div>
              <div className="text-xl font-semibold text-slate-900 mt-1">{receipt.id}</div>
              <div className="text-[14px] text-slate-500">{formatDate(receipt.date)}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-[14px] space-y-1">
              <div><span className="text-slate-500">Client</span> · {receipt.client?.fullName || '—'}</div>
              <div><span className="text-slate-500">Status</span> · {receipt.paymentStatus}</div>
              <div><span className="text-slate-500">Total</span> · {formatCurrency(receipt.total, receipt.currency)}</div>
            </div>
            <ul className="text-[14px] space-y-1.5">
              {(receipt.items || []).map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span className="text-slate-700">{item.title}</span>
                  <span className="tabular-nums text-slate-900">{formatCurrency(item.total, receipt.currency)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {status === 'ok' && ticket && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-sky-700">Verified ticket</div>
              <div className="text-xl font-semibold text-slate-900 mt-1">{ticket.pnr || ticket.id}</div>
              <div className="text-[14px] text-slate-500">{ticket.title}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-[14px] space-y-1">
              <div><span className="text-slate-500">Dates</span> · {formatShortDate(ticket.startDate)} — {formatShortDate(ticket.endDate)}</div>
              <div><span className="text-slate-500">Status</span> · {ticket.status}</div>
              <div><span className="text-slate-500">Fare</span> · {formatItineraryCurrency(ticket.totalPrice, ticket.currency)}</div>
            </div>
            <ul className="text-[14px] space-y-1.5">
              {(ticket.travelers || []).map((traveler) => (
                <li key={traveler.id} className="text-slate-800">{traveler.name}</li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};
