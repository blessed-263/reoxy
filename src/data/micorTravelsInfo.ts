import { Itinerary } from '../types/itinerary';

export const MICOR_TRAVELS_INFO = {
  name: 'Micor Flight Services',
  legalName: 'ООО «Майкор Авиа» / Micor Air Desk Ltd.',
  tagline: 'Оформление электронных авиабилетов, маршрутных квитанций и чартерных программ',
  phone: '+7 (495) 820-41-90',
  whatsapp: '+7 (926) 510-33-22',
  emergencyHotline: '+7 (999) 000-MICOR (круглосуточная авиаподдержка 24/7)',
  email: 'flights@micortravels.com',
  website: 'www.micor-flights.com',
  address: 'г. Москва, Пресненская наб., 12, Башня Федерация Восток, офис 3402',
  iata: 'IATA ACCREDITED AGENT: 92-2 1894 4',
  license: 'Аккредитованное агентство IATA: 92-2 1894 4 • Реестровый номер РТО 024911',
};

export const CABIN_CLASS_LABELS: Record<string, string> = {
  economy: 'Эконом-класс / Economy (Y)',
  comfort: 'Премиум-эконом / Comfort (W)',
  business: 'Бизнес-класс / Business (J)',
  first: 'Первый класс / First (F)',
};

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Билеты выписаны (OK)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  draft: { label: 'Бронь (Предварительно)', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  in_progress: { label: 'В обработке GDS', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: 'Перелет завершен', color: 'bg-blue-50 text-blue-700 border-blue-200' },
};

export const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paid: { label: 'Оплачено 100%', color: 'bg-emerald-100 text-emerald-800' },
  deposit_paid: { label: 'Внесен депозит', color: 'bg-amber-100 text-amber-800' },
  pending: { label: 'Ожидает оплаты', color: 'bg-rose-100 text-rose-800' },
};

export const createEmptyItinerary = (): Itinerary => {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const futureStr = future.toISOString().slice(0, 10);
  const randomPnr = Math.random().toString(36).substring(2, 8).toUpperCase();

  return {
    id: `MC-${randomPnr}`,
    pnr: randomPnr,
    title: 'Москва (SVO) ⇄ Дубай (DXB)',
    destination: 'ОАЭ / United Arab Emirates',
    startDate: todayStr,
    endDate: futureStr,
    totalDays: 7,
    totalNights: 6,
    status: 'confirmed',
    travelers: [
      {
        id: `t-${Date.now()}`,
        name: 'IVANOV / ALEXANDER MR',
        type: 'adult',
        passportNumber: '75 1234567',
        ticketNumber: `235-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        seat: '12A',
        frequentFlyer: ''
      }
    ],
    flights: [
      {
        id: `f-${Date.now()}-1`,
        airline: 'Aeroflot',
        flightNumber: 'SU 520',
        departureCity: 'Moscow, Sheremetyevo',
        departureAirport: 'SVO',
        arrivalCity: 'Dubai',
        arrivalAirport: 'DXB',
        departureDate: todayStr,
        departureTime: '08:30',
        arrivalDate: todayStr,
        arrivalTime: '15:10',
        terminal: 'Терминал C',
        terminalArrival: 'Терминал 1',
        gate: 'Гейт 132',
        aircraft: 'Airbus A350-900',
        cabinClass: 'economy',
        bookingRef: randomPnr,
        baggageAllowance: '1 место до 23 кг + ручная кладь 8 кг',
        duration: '5ч 40м',
        status: 'OK / Подтверждено'
      }
    ],
    fareBreakdown: {
      baseFare: 48000,
      taxesAndFees: 9500,
      fuelSurcharge: 5200,
      serviceFee: 1500
    },
    totalPrice: 64200,
    currency: 'RUB',
    paymentStatus: 'paid',
    amountPaid: 64200,
    baggagePolicy: '1 место до 23 кг (сумма 3 измерений до 158 см) + ручная кладь до 8 кг (55×40×23 см).',
    checkInPolicy: 'Онлайн-регистрация открыта за 24 ч. Стойки в аэропорту закрываются за 60 мин, гейты за 20 мин.',
    importantNotes: [
      'Паспорт должен действовать минимум 6 месяцев на дату вылета.',
      'Литиевые аккумуляторы и Power Bank разрешены строго в ручной клади.'
    ],
    agentName: 'Константин Белов',
    agentPhone: '+7 (495) 820-41-90',
    agentEmail: 'flights@micortravels.com',
    emergencyPhone: '+7 (999) 000-64-26',
    createdAt: todayStr,
    updatedAt: todayStr
  };
};

export const SAMPLE_ITINERARIES: Itinerary[] = [];
