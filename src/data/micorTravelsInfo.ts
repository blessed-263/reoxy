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
        departureCity: 'Москва, Шереметьево',
        departureAirport: 'SVO',
        arrivalCity: 'Дубай, Международный',
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

export const SAMPLE_ITINERARIES: Itinerary[] = [
  {
    id: 'MC-7K8X9P',
    pnr: '7K8X9P',
    title: 'Москва (VKO) ⇄ Стамбул (IST) ⇄ Рим (FCO) / Венеция (VCE)',
    destination: 'Италия / Rome & Venice via Istanbul',
    startDate: '2026-05-15',
    endDate: '2026-05-21',
    totalDays: 7,
    totalNights: 6,
    status: 'confirmed',
    travelers: [
      { 
        id: 't-1', 
        name: 'IVANOV / ALEXANDER MR', 
        type: 'adult', 
        passportNumber: '75 1234567',
        ticketNumber: '235-2490184920',
        seat: '14A (Window)',
        frequentFlyer: 'TK 882019482 Classic Plus'
      },
      { 
        id: 't-2', 
        name: 'PETROVA / ELENA MRS', 
        type: 'adult', 
        passportNumber: '75 9876543',
        ticketNumber: '235-2490184921',
        seat: '14B (Aisle)',
        frequentFlyer: 'TK 882019483 Classic'
      }
    ],
    flights: [
      {
        id: 'f-1',
        airline: 'Turkish Airlines',
        flightNumber: 'TK 1865',
        departureCity: 'Москва, Внуково',
        departureAirport: 'VKO',
        arrivalCity: 'Стамбул, Новый аэропорт',
        arrivalAirport: 'IST',
        departureDate: '2026-05-15',
        departureTime: '07:25',
        arrivalDate: '2026-05-15',
        arrivalTime: '11:40',
        terminal: 'Терминал A',
        terminalArrival: 'Терминал 1',
        gate: 'Гейт 22',
        aircraft: 'Airbus A350-900',
        cabinClass: 'comfort',
        bookingRef: '7K8X9P',
        baggageAllowance: '2 места по 23 кг + ручная кладь 8 кг',
        duration: '4ч 15м',
        status: 'OK / Подтверждено'
      },
      {
        id: 'f-2',
        airline: 'Turkish Airlines',
        flightNumber: 'TK 1867',
        departureCity: 'Стамбул, Новый аэропорт',
        departureAirport: 'IST',
        arrivalCity: 'Рим, Фьюмичино',
        arrivalAirport: 'FCO',
        departureDate: '2026-05-15',
        departureTime: '13:50',
        arrivalDate: '2026-05-15',
        arrivalTime: '15:35',
        terminal: 'Терминал 1',
        terminalArrival: 'Терминал 3',
        gate: 'Гейт F14',
        aircraft: 'Boeing 777-300ER',
        cabinClass: 'comfort',
        bookingRef: '7K8X9P',
        baggageAllowance: '2 места по 23 кг + ручная кладь 8 кг',
        duration: '2ч 45м',
        status: 'OK / Подтверждено'
      },
      {
        id: 'f-3',
        airline: 'Turkish Airlines',
        flightNumber: 'TK 1872',
        departureCity: 'Венеция, Марко Поло',
        departureAirport: 'VCE',
        arrivalCity: 'Стамбул, Новый аэропорт',
        arrivalAirport: 'IST',
        departureDate: '2026-05-21',
        departureTime: '14:20',
        arrivalDate: '2026-05-21',
        arrivalTime: '17:50',
        terminal: 'Терминал 1',
        terminalArrival: 'Терминал 1',
        gate: 'Гейт B08',
        aircraft: 'Airbus A321neo',
        cabinClass: 'comfort',
        bookingRef: '7K8X9P',
        baggageAllowance: '2 места по 23 кг + ручная кладь 8 кг',
        duration: '2ч 30м',
        status: 'OK / Подтверждено'
      },
      {
        id: 'f-4',
        airline: 'Turkish Airlines',
        flightNumber: 'TK 1874',
        departureCity: 'Стамбул, Новый аэропорт',
        departureAirport: 'IST',
        arrivalCity: 'Москва, Внуково',
        arrivalAirport: 'VKO',
        departureDate: '2026-05-21',
        departureTime: '19:40',
        arrivalDate: '2026-05-21',
        arrivalTime: '23:35',
        terminal: 'Терминал 1',
        terminalArrival: 'Терминал A',
        gate: 'Гейт D04',
        aircraft: 'Airbus A350-900',
        cabinClass: 'comfort',
        bookingRef: '7K8X9P',
        baggageAllowance: '2 места по 23 кг + ручная кладь 8 кг',
        duration: '3ч 55м',
        status: 'OK / Подтверждено'
      }
    ],
    fareBreakdown: {
      baseFare: 142000,
      taxesAndFees: 28400,
      fuelSurcharge: 14600,
      serviceFee: 4500
    },
    totalPrice: 189500,
    currency: 'RUB',
    paymentStatus: 'paid',
    amountPaid: 189500,
    baggagePolicy: 'Норма бесплатного провоза: 2 места зарегистрированного багажа весом до 23 кг каждое (сумма трех измерений до 158 см). Ручная кладь: 1 место до 8 кг (размеры 55×40×23 см).',
    checkInPolicy: 'Онлайн-регистрация открывается за 24 часа до вылета на сайте авиакомпании. В аэропорту регистрация закрывается строго за 60 минут до времени вылета. Посадка на борт прекращается за 20 минут до вылета.',
    importantNotes: [
      'Пассажир обязан иметь действующий загранпаспорт со сроком действия не менее 6 месяцев с даты окончания поездки.',
      'Все жидкости в ручной клади должны быть в емкостях не более 100 мл, упакованных в один прозрачный пакет объемом до 1 литра.',
      'Внешние аккумуляторы (Power Bank) и портативные устройства на литиевых батареях допускаются ТОЛЬКО в ручную кладь.'
    ],
    agentName: 'Константин Белов',
    agentPhone: '+7 (495) 820-41-90 (доб. 104)',
    agentEmail: 'k.belov@micortravels.com',
    emergencyPhone: '+7 (999) 000-64-26',
    createdAt: '2026-04-10',
    updatedAt: '2026-04-12'
  },
  {
    id: 'MC-8M4Q2R',
    pnr: '8M4Q2R',
    title: 'Москва (DME) ⇄ Дубай (DXB) ⇄ Мале (MLE)',
    destination: 'Мальдивы / Maldives via Dubai',
    startDate: '2026-06-02',
    endDate: '2026-06-12',
    totalDays: 11,
    totalNights: 10,
    status: 'confirmed',
    travelers: [
      { 
        id: 't-3', 
        name: 'SMIRNOV / MIKHAIL MR', 
        type: 'adult', 
        passportNumber: '73 5510294',
        ticketNumber: '176-9920194821',
        seat: '18K (Window)',
        frequentFlyer: 'EK 492019482 Silver'
      },
      { 
        id: 't-4', 
        name: 'SMIRNOVA / ANNA MRS', 
        type: 'adult', 
        passportNumber: '73 5510295',
        ticketNumber: '176-9920194822',
        seat: '18J (Aisle)',
        frequentFlyer: 'EK 492019483 Blue'
      }
    ],
    flights: [
      {
        id: 'f-5',
        airline: 'Emirates',
        flightNumber: 'EK 132',
        departureCity: 'Москва, Домодедово',
        departureAirport: 'DME',
        arrivalCity: 'Дубай, Международный',
        arrivalAirport: 'DXB',
        departureDate: '2026-06-02',
        departureTime: '23:50',
        arrivalDate: '2026-06-03',
        arrivalTime: '06:15',
        terminal: 'Терминал 1',
        terminalArrival: 'Терминал 3',
        gate: 'Гейт 14',
        aircraft: 'Boeing 777-300ER',
        cabinClass: 'business',
        bookingRef: '8M4Q2R',
        baggageAllowance: '40 кг зарегистрированный багаж + 2 места ручной клади по 7 кг',
        duration: '5ч 25м',
        status: 'OK / Подтверждено'
      },
      {
        id: 'f-6',
        airline: 'Emirates',
        flightNumber: 'EK 658',
        departureCity: 'Дубай, Международный',
        departureAirport: 'DXB',
        arrivalCity: 'Мале, Велана',
        arrivalAirport: 'MLE',
        departureDate: '2026-06-03',
        departureTime: '09:30',
        arrivalDate: '2026-06-03',
        arrivalTime: '14:50',
        terminal: 'Терминал 3',
        terminalArrival: 'Терминал I',
        gate: 'Гейт B22',
        aircraft: 'Boeing 777-300ER',
        cabinClass: 'business',
        bookingRef: '8M4Q2R',
        baggageAllowance: '40 кг зарегистрированный багаж + 2 места ручной клади по 7 кг',
        duration: '4ч 20м',
        status: 'OK / Подтверждено'
      },
      {
        id: 'f-7',
        airline: 'Emirates',
        flightNumber: 'EK 659',
        departureCity: 'Мале, Велана',
        departureAirport: 'MLE',
        arrivalCity: 'Дубай, Международный',
        arrivalAirport: 'DXB',
        departureDate: '2026-06-12',
        departureTime: '16:30',
        arrivalDate: '2026-06-12',
        arrivalTime: '19:45',
        terminal: 'Терминал I',
        terminalArrival: 'Терминал 3',
        gate: 'Гейт 03',
        aircraft: 'Boeing 777-300ER',
        cabinClass: 'business',
        bookingRef: '8M4Q2R',
        baggageAllowance: '40 кг зарегистрированный багаж + 2 места ручной клади по 7 кг',
        duration: '4ч 15м',
        status: 'OK / Подтверждено'
      },
      {
        id: 'f-8',
        airline: 'Emirates',
        flightNumber: 'EK 131',
        departureCity: 'Дубай, Международный',
        departureAirport: 'DXB',
        arrivalCity: 'Москва, Домодедово',
        arrivalAirport: 'DME',
        departureDate: '2026-06-13',
        departureTime: '08:40',
        arrivalDate: '2026-06-13',
        arrivalTime: '13:10',
        terminal: 'Терминал 3',
        terminalArrival: 'Терминал 1',
        gate: 'Гейт A12',
        aircraft: 'Airbus A380-800',
        cabinClass: 'business',
        bookingRef: '8M4Q2R',
        baggageAllowance: '40 кг зарегистрированный багаж + 2 места ручной клади по 7 кг',
        duration: '5ч 30м',
        status: 'OK / Подтверждено'
      }
    ],
    fareBreakdown: {
      baseFare: 380000,
      taxesAndFees: 46000,
      fuelSurcharge: 28000,
      serviceFee: 6000
    },
    totalPrice: 460000,
    currency: 'RUB',
    paymentStatus: 'paid',
    amountPaid: 460000,
    baggagePolicy: 'Норма бизнес-класса: 40 кг зарегистрированного багажа на пассажира. Ручная кладь: портплед или чемодан до 7 кг + деловой кейс до 7 кг.',
    checkInPolicy: 'Приоритетная регистрация на стойках Emirates Business Class и доступ в залы ожидания Marhaba / Emirates Lounge. Посадка начинается за 45 минут до вылета.',
    importantNotes: [
      'Всем пассажирам, следующим на Мальдивы, необходимо заполнить электронную декларацию IMUGA Traveller Declaration за 96 часов до вылета.',
      'Трансфер из аэропорта Мале в отель осуществляется гидросамолетом или скоростным катером.'
    ],
    agentName: 'Ольга Соколова',
    agentPhone: '+7 (495) 820-41-90 (доб. 112)',
    agentEmail: 'o.sokolova@micortravels.com',
    emergencyPhone: '+7 (999) 000-64-26',
    createdAt: '2026-04-18',
    updatedAt: '2026-04-20'
  }
];
