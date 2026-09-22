import React, { useEffect, useState } from 'react';
import { ReOxyLogo } from '../components/logos/ReOxyLogo';
import { MicorLogo } from '../components/logos/MicorLogo';
import { fetchPublicItinerary, fetchPublicReceipt } from '../api/client';
import { Receipt } from '../types';
import { Itinerary } from '../types/itinerary';
import { formatCurrency, formatDate } from '../utils/formatters';
import { formatItineraryCurrency, formatShortDate } from '../utils/itineraryFormatters';
import { paymentMethodLabelRu } from '../utils/paymentInstructions';
import { CABIN_CLASS_LABELS, PAYMENT_STATUS_LABELS, STATUS_LABELS } from '../data/micorTravelsInfo';

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

function humanizeVerifyError(message: string, kind?: string) {
  const lower = message.toLowerCase();
  if (lower.includes('not found') || lower.includes('не найден')) {
    return kind === 'ticket'
      ? 'Билет не найден в реестре.'
      : 'Квитанция не найдена в реестре.';
  }
  if (lower.includes('database') || lower.includes('503') || lower.includes('vite_api_url')) {
    return 'Сервер проверки временно недоступен. Повторите попытку позже.';
  }
  return message;
}

const RECEIPT_STATUS_RU: Record<string, string> = {
  paid: 'Оплачено полностью',
  partial: 'Частичная оплата',
  unpaid: 'Ожидает оплаты',
};

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
        const message = err instanceof Error ? err.message : 'Не найдено';
        setError(humanizeVerifyError(message, parsed.kind));
        const lower = message.toLowerCase();
        setStatus(lower.includes('not found') || lower.includes('не найден') ? 'missing' : 'error');
      }
    };

    void run();
  }, [pathname]);

  const isTicket = parsed?.kind === 'ticket';
  const ticketStatus = ticket ? (STATUS_LABELS[ticket.status] || STATUS_LABELS.confirmed) : null;
  const ticketPayment = ticket
    ? (PAYMENT_STATUS_LABELS[ticket.paymentStatus] || PAYMENT_STATUS_LABELS.pending)
    : null;

  return (
    <div className="min-h-screen bg-[#eef1f5] text-slate-800">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          {isTicket ? <MicorLogo size="sm" variant="dark" /> : <ReOxyLogo size="sm" variant="dark" />}
          <span className="text-[12px] font-semibold rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1">
            Официальная проверка
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 sm:p-6">
        {status === 'loading' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Проверяем документ…
          </div>
        )}

        {status !== 'loading' && status !== 'ok' && (
          <div className="rounded-2xl border border-rose-100 bg-white p-8 text-center">
            <div className="text-lg font-semibold text-slate-900">Этот QR-код недействителен</div>
            <p className="text-[14px] text-slate-500 mt-2">
              {error || 'В реестре не найдена соответствующая квитанция или билет.'}
            </p>
          </div>
        )}

        {status === 'ok' && receipt && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-sky-700">
                Квитанция подтверждена
              </div>
              <div className="text-xl font-semibold text-slate-900 mt-1">{receipt.id}</div>
              <div className="text-[14px] text-slate-500">{formatDate(receipt.date)}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-[14px] space-y-1">
              <div><span className="text-slate-500">Заказчик</span> · {receipt.client?.fullName || '—'}</div>
              <div><span className="text-slate-500">Статус</span> · {RECEIPT_STATUS_RU[receipt.paymentStatus] || receipt.paymentStatus}</div>
              <div><span className="text-slate-500">Способ оплаты</span> · {paymentMethodLabelRu(receipt.paymentMethod)}</div>
              <div><span className="text-slate-500">Итого</span> · {formatCurrency(receipt.total, receipt.currency)}</div>
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
              <div className="text-[12px] font-semibold uppercase tracking-wider text-sky-700">
                Билет подтверждён
              </div>
              <div className="text-xl font-semibold text-slate-900 mt-1">{ticket.pnr || ticket.id}</div>
              <div className="text-[14px] text-slate-500">{ticket.title}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-[14px] space-y-1">
              <div>
                <span className="text-slate-500">Даты</span> · {formatShortDate(ticket.startDate)} — {formatShortDate(ticket.endDate)}
              </div>
              <div>
                <span className="text-slate-500">Статус</span> · {ticketStatus?.label || ticket.status}
              </div>
              <div>
                <span className="text-slate-500">Оплата</span> · {ticketPayment?.label || ticket.paymentStatus}
                {' · '}
                {paymentMethodLabelRu(ticket.paymentMethod || 'bank_card')}
              </div>
              <div>
                <span className="text-slate-500">Тариф</span> · {formatItineraryCurrency(ticket.totalPrice, ticket.currency)}
              </div>
            </div>
            {(ticket.flights || []).length > 0 && (
              <ul className="text-[14px] space-y-1.5">
                {ticket.flights.map((flight) => (
                  <li key={flight.id} className="text-slate-800">
                    {flight.flightNumber} · {flight.departureAirport || flight.departureCity} → {flight.arrivalAirport || flight.arrivalCity}
                    {flight.cabinClass ? ` · ${CABIN_CLASS_LABELS[flight.cabinClass] || flight.cabinClass}` : ''}
                  </li>
                ))}
              </ul>
            )}
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
