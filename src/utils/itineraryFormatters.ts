import { Itinerary, ItineraryCurrency } from '../types/itinerary';
import { CABIN_CLASS_LABELS, MICOR_TRAVELS_INFO } from '../data/micorTravelsInfo';
import { paymentMethodLabelRu } from './paymentInstructions';

export const formatRussianDate = (dateStr: string, includeWeekday: boolean = true): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...(includeWeekday ? { weekday: 'short' } : {})
    };
    return d.toLocaleDateString('ru-RU', options);
  } catch {
    return dateStr;
  }
};

export const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const formatItineraryCurrency = (amount: number, currency: ItineraryCurrency = 'RUB'): string => {
  const formatted = new Intl.NumberFormat('ru-RU').format(amount);
  switch (currency) {
    case 'RUB':
      return `${formatted} ₽`;
    case 'USD':
      return `$${formatted}`;
    case 'EUR':
      return `€${formatted}`;
    case 'AED':
      return `${formatted} AED`;
    default:
      return `${formatted} ${currency}`;
  }
};

export const calculateDaysAndNights = (start: string, end: string): { days: number; nights: number } => {
  if (!start || !end) return { days: 1, nights: 1 };
  try {
    const d1 = new Date(start + 'T00:00:00').getTime();
    const d2 = new Date(end + 'T00:00:00').getTime();
    const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { days: 1, nights: 0 };
    return { days: diffDays + 1, nights: diffDays };
  } catch {
    return { days: 1, nights: 1 };
  }
};

/**
 * Builds a clear, scannable text message in Russian for WhatsApp, Telegram, or Email.
 * Tailored exclusively for airline flight itinerary and electronic tickets.
 */
export const generateItineraryShareText = (it: Itinerary): string => {
  const travelersList = it.travelers
    .map(t => `${t.name}${t.ticketNumber ? ` (Билет: ${t.ticketNumber})` : ''}${t.seat ? ` [Место: ${t.seat}]` : ''}`)
    .join('\n • ') || 'Пассажиры не указаны';

  const pnrCode = it.pnr || it.id;

  const header = `✈️ *МАРШРУТНАЯ КВИТАНЦИЯ ЭЛЕКТРОННОГО БИЛЕТА*\n` +
    `*Агентство:* ${MICOR_TRAVELS_INFO.name} (${MICOR_TRAVELS_INFO.iata})\n` +
    `*Код бронирования (PNR):* ${pnrCode}\n` +
    `*Маршрут:* ${it.title}\n` +
    `*Даты перелетов:* ${formatShortDate(it.startDate)} — ${formatShortDate(it.endDate)}\n\n` +
    `👥 *СПИСОК ПАССАЖИРОВ:*\n • ${travelersList}\n\n`;

  let flightsBlock = '';
  if (it.flights && it.flights.length > 0) {
    flightsBlock = `🛫 *ПОЛЕТНЫЕ СЕГМЕНТЫ:*\n` +
      it.flights.map((f, i) => 
        `  ${i + 1}. ${f.airline} — Рейс ${f.flightNumber}\n` +
        `     Откуда: ${f.departureCity}${f.departureAirport ? ` (${f.departureAirport})` : ''} | Вылет: ${formatShortDate(f.departureDate)} в ${f.departureTime}${f.terminal ? ` (${f.terminal})` : ''}\n` +
        `     Куда: ${f.arrivalCity}${f.arrivalAirport ? ` (${f.arrivalAirport})` : ''} | Прилет: ${formatShortDate(f.arrivalDate)} в ${f.arrivalTime}${f.terminalArrival ? ` (${f.terminalArrival})` : ''}\n` +
        `     Класс: ${CABIN_CLASS_LABELS[f.cabinClass] || f.cabinClass}${f.aircraft ? ` | ВС: ${f.aircraft}` : ''}\n` +
        `     Багаж: ${f.baggageAllowance || 'По тарифу авиакомпании'}` +
        (f.bookingRef ? `\n     PNR сегмента: ${f.bookingRef}` : '')
      ).join('\n\n') + '\n\n';
  }

  const baggageAndCheckIn = `🧳 *НОРМА БАГАЖА И РЕГИСТРАЦИЯ:*\n` +
    ` • ${it.baggagePolicy || '1 место до 23 кг + ручная кладь до 8 кг'}\n` +
    ` • ${it.checkInPolicy || 'Онлайн-регистрация за 24 ч, стойки в аэропорту закрываются за 60 мин.'}\n\n`;

  const costBlock = `💰 *СТОИМОСТЬ ПЕРЕЛЕТА:* ${formatItineraryCurrency(it.totalPrice, it.currency)}\n` +
    `*Статус оплаты:* ${it.paymentStatus === 'paid' ? 'Оплачено 100%' : it.paymentStatus === 'deposit_paid' ? `Внесен депозит (${formatItineraryCurrency(it.amountPaid, it.currency)})` : 'Ожидает оплаты'}\n` +
    `*Способ оплаты:* ${paymentMethodLabelRu(it.paymentMethod || 'bank_card')}\n\n`;

  const footer = `📞 *КРУГЛОСУТОЧНАЯ ПОДДЕРЖКА ПАССАЖИРОВ:*\n` +
    `Горячая линия 24/7: ${it.emergencyPhone || MICOR_TRAVELS_INFO.emergencyHotline}\n` +
    `Авиакассир / агент: ${it.agentName} (${it.agentPhone})\n` +
    `Онлайн-проверка PNR: https://checkmytrip.com/pnr/${pnrCode}`;

  return `${header}${flightsBlock}${baggageAndCheckIn}${costBlock}${footer}`;
};
