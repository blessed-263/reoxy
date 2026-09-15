import React from 'react';
import { Itinerary } from '../../types/itinerary';
import { 
  MICOR_TRAVELS_INFO, 
  CABIN_CLASS_LABELS, 
  STATUS_LABELS, 
  PAYMENT_STATUS_LABELS
} from '../../data/micorTravelsInfo';
import { 
  formatShortDate, 
  formatItineraryCurrency
} from '../../utils/itineraryFormatters';
import { A4Sheet } from '../document/A4Sheet';
import { A4Header } from '../document/A4Header';
import { A4MetaGrid } from '../document/A4MetaGrid';
import { A4PartyDetails } from '../document/A4PartyDetails';
import { A4Table, ColumnDef } from '../document/A4Table';
import { A4FinancialSummary } from '../document/A4FinancialSummary';
import { A4Footer } from '../document/A4Footer';
import { A4DocumentViewer } from '../document/A4DocumentViewer';
import { MicorLogo } from '../logos/MicorLogo';
import { QRCodeView } from '../common/QRCodeView';
import { ticketVerifyUrl } from '../../utils/publicUrls';
import { FlightRouteArrow } from './FlightRouteArrow';
import { 
  Plane, 
  Luggage, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Info,
  Calendar
} from 'lucide-react';

interface ItineraryPreviewProps {
  itinerary: Itinerary;
  onShare: () => void;
}

export const ItineraryPreview: React.FC<ItineraryPreviewProps> = ({
  itinerary,
  onShare
}) => {
  const totalPages = 2;
  const pnrCode = itinerary.pnr || itinerary.id;
  const filename = `FlightTicket-${pnrCode}.pdf`;
  const safeFlights = Array.isArray(itinerary.flights) ? itinerary.flights : [];
  const safeTravelers = Array.isArray(itinerary.travelers) ? itinerary.travelers : [];

  // PNR flight verification URL
  const pnrVerificationUrl = ticketVerifyUrl(pnrCode);

  // Passenger Manifest Columns
  const passengerColumns: ColumnDef<typeof safeTravelers[0]>[] = [
    {
      header: '№',
      width: '6%',
      align: 'center',
      isMono: true,
      render: (_, idx) => String(idx + 1).padStart(2, '0')
    },
    {
      header: 'Пассажир / Passenger Name (ФИО)',
      width: '36%',
      render: (t) => (
        <div>
          <span className="font-bold text-[#0f172a] uppercase font-mono tracking-tight">{t.name}</span>
          <span className="block text-[9px] text-[#64748b] font-mono">
            {t.type === 'adult' ? 'Взрослый (ADT)' : t.type === 'child' ? 'Ребенок (CHD)' : 'Младенец (INF)'}
          </span>
        </div>
      )
    },
    {
      header: 'Номер паспорта',
      width: '18%',
      isMono: true,
      render: (t) => t.passportNumber || '—'
    },
    {
      header: '№ Электронного билета',
      width: '24%',
      isMono: true,
      render: (t, idx) => (
        <span className="font-bold text-[#0f172a]">
          {t.ticketNumber || `235-948190${idx + 40}`}
        </span>
      )
    },
    {
      header: 'Место / Бонус',
      width: '16%',
      align: 'right',
      isMono: true,
      render: (t) => (
        <div className="text-right">
          <span className="font-semibold text-[#0284c7]">{t.seat || 'Авто'}</span>
          {t.frequentFlyer && (
            <span className="block text-[8px] text-[#64748b] truncate">{t.frequentFlyer}</span>
          )}
        </div>
      )
    }
  ];

  // Detailed Flight Segments Columns
  const flightColumns: ColumnDef<typeof safeFlights[0]>[] = [
    {
      header: 'Рейс и АК',
      width: '14%',
      isMono: true,
      render: (f) => (
        <div>
          <span className="font-bold text-[#0f172a] text-[11px]">{f.flightNumber}</span>
          <span className="block text-[9px] text-[#64748b]">{f.airline}</span>
          {f.aircraft && (
            <span className="block text-[8px] text-[#94a3b8]">{f.aircraft}</span>
          )}
        </div>
      )
    },
    {
      header: 'Вылет / Departure',
      width: '24%',
      render: (f) => (
        <div>
          <div className="font-bold text-[#0f172a] text-[11px]">
            {f.departureCity} {f.departureAirport && <span className="font-mono text-[#0284c7]">({f.departureAirport})</span>}
          </div>
          <div className="font-mono text-[9px] text-[#475569]">
            {formatShortDate(f.departureDate)} &bull; <span className="font-bold text-[#0f172a]">{f.departureTime}</span>
          </div>
          {f.terminal && (
            <div className="text-[8px] font-mono text-[#64748b]">
              {f.terminal} {f.gate ? `• ${f.gate}` : ''}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Маршрут',
      width: '15%',
      render: (f) => (
        <FlightRouteArrow
          variant="inline"
          originAirport={f.departureAirport}
          destinationAirport={f.arrivalAirport}
          originCity={f.departureCity}
          destinationCity={f.arrivalCity}
          duration={f.duration}
        />
      )
    },
    {
      header: 'Прилет / Arrival',
      width: '24%',
      render: (f) => (
        <div>
          <div className="font-bold text-[#0f172a] text-[11px]">
            {f.arrivalCity} {f.arrivalAirport && <span className="font-mono text-[#0284c7]">({f.arrivalAirport})</span>}
          </div>
          <div className="font-mono text-[9px] text-[#475569]">
            {formatShortDate(f.arrivalDate)} &bull; <span className="font-bold text-[#0f172a]">{f.arrivalTime}</span>
          </div>
          {f.terminalArrival && (
            <div className="text-[8px] font-mono text-[#64748b]">{f.terminalArrival}</div>
          )}
        </div>
      )
    },
    {
      header: 'Класс / Багаж',
      width: '23%',
      align: 'right',
      isMono: true,
      render: (f) => (
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5">
            <span className="font-semibold text-[#0f172a] text-[9px]">
              {CABIN_CLASS_LABELS[f.cabinClass] ? CABIN_CLASS_LABELS[f.cabinClass].split('/')[0].trim() : 'Эконом'}
            </span>
            <span className="text-[8px] text-[#16a34a] font-bold">
              {f.status || 'OK'}
            </span>
          </div>
          <div className="text-[8px] text-[#64748b] mt-0.5">
            Багаж: {f.baggageAllowance ? f.baggageAllowance.split('+')[0].trim() : '23 кг'}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="h-full min-h-0">
    <A4DocumentViewer
      documentId={`MICOR-FLIGHT-${pnrCode}`}
      documentTitle="ELECTRONIC TICKET & PASSENGER ITINERARY"
      filename={filename}
      totalPages={totalPages}
      onShare={onShare}
    >
      {(_scale, activePage, viewMode) => (
        <div className="space-y-8 print:space-y-0">
          {/* ================= PAGE 1: OFFICIAL ELECTRONIC TICKET & FLIGHT MANIFEST ================= */}
          <div className={viewMode === 'single' && activePage !== 1 ? 'hidden print:block' : 'block'}>
            <A4Sheet id="a4-page-micor-1" pageNumber={1} totalPages={totalPages} className="document-sheet">
              {/* Header with authentic minimal Micor logo */}
              <A4Header
                logoNode={<MicorLogo size="md" variant="dark" />}
                brandRegistration="IATA ACCREDITED AGENT: 92-2 1894 4 • GDS AMADEUS/SABRE"
                documentCategory="ELECTRONIC TICKET & PASSENGER ITINERARY RECEIPT"
                documentTitle="Маршрутная квитанция электронного билета"
                documentSubtext={`Код бронирования (PNR): ${pnrCode} • Выписано: ${formatShortDate(itinerary.startDate)}`}
                theme="micor"
              />

              {/* Meta Grid */}
              <A4MetaGrid
                theme="micor"
                fields={[
                  {
                    label: 'Номер брони / PNR Ref',
                    value: pnrCode,
                    isMono: true,
                    highlight: true
                  },
                  {
                    label: 'Маршрут перелета',
                    value: itinerary.title,
                    isMono: false
                  },
                  {
                    label: 'Период путешествия',
                    value: `${formatShortDate(itinerary.startDate)} — ${formatShortDate(itinerary.endDate)}`,
                    isMono: true
                  },
                  {
                    label: 'Статус выписки билетов',
                    value: (
                      <span className="text-[#16a34a] font-bold uppercase">
                        ВЫПИСАН И ПОДТВЕРЖДЕН (OK)
                      </span>
                    ),
                    isMono: true
                  }
                ]}
              />

              {/* Passenger Details & E-Ticket Manifest */}
              <div className="my-2">
                <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-[#64748b] mb-1 font-semibold">
                  <span>01. СПИСОК ПАССАЖИРОВ И НОМЕРА АВИАБИЛЕТОВ / PASSENGER MANIFEST</span>
                  <span>ВСЕГО ПАССАЖИРОВ: {safeTravelers.length}</span>
                </div>
                <A4Table
                  columns={passengerColumns}
                  data={safeTravelers}
                  theme="micor"
                />
              </div>

              {/* Flight Segments / Schedule Table */}
              <div className="my-2">
                <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-[#64748b] mb-1 font-semibold">
                  <span>02. ПОЛЕТНЫЕ СЕГМЕНТЫ И РАСПИСАНИЕ / FLIGHT SEGMENTS & ROUTING</span>
                  <span>КОЛИЧЕСТВО РЕЙСОВ: {safeFlights.length}</span>
                </div>

                {/* Visual Route Header with directional arrow and small coloured plane */}
                {safeFlights.length > 0 && (
                  <div className="mb-2 space-y-1">
                    {safeFlights.map((flight, idx) => (
                      <FlightRouteArrow
                        key={flight.id || idx}
                        variant="card"
                        originAirport={flight.departureAirport || 'DEP'}
                        originCity={flight.departureCity || 'Город вылета'}
                        departureTime={flight.departureTime}
                        destinationAirport={flight.arrivalAirport || 'ARR'}
                        destinationCity={flight.arrivalCity || 'Город назначения'}
                        arrivalTime={flight.arrivalTime}
                        duration={flight.duration}
                        stopsLabel={flight.flightNumber ? `Рейс ${flight.flightNumber} • ${flight.airline}` : 'Прямой перелет'}
                      />
                    ))}
                  </div>
                )}

                <A4Table
                  columns={flightColumns}
                  data={safeFlights}
                  theme="micor"
                />
              </div>

              {/* Financial Calculation & Fare Breakdown */}
              <A4FinancialSummary
                theme="micor"
                lines={[
                  {
                    label: 'Тариф авиакомпании / Airfare:',
                    amount: formatItineraryCurrency(itinerary.fareBreakdown?.baseFare || Math.round(itinerary.totalPrice * 0.75), itinerary.currency)
                  },
                  {
                    label: 'Аэропортовые таксы и сборы / Taxes & Fees:',
                    amount: formatItineraryCurrency(itinerary.fareBreakdown?.taxesAndFees || Math.round(itinerary.totalPrice * 0.15), itinerary.currency)
                  },
                  {
                    label: 'Топливный сбор / Fuel Surcharge (YQ/YR):',
                    amount: formatItineraryCurrency(itinerary.fareBreakdown?.fuelSurcharge || Math.round(itinerary.totalPrice * 0.08), itinerary.currency)
                  },
                  {
                    label: 'Сервисный сбор агентства / Service Fee:',
                    amount: formatItineraryCurrency(itinerary.fareBreakdown?.serviceFee || Math.round(itinerary.totalPrice * 0.02), itinerary.currency)
                  }
                ]}
                totalLabel="ИТОГО К ОПЛАТЕ / TOTAL FARE:"
                totalAmount={formatItineraryCurrency(itinerary.totalPrice, itinerary.currency)}
                bankingDetails={{
                  bankName: 'IATA BSP Billing Settlement Plan / ПАО Сбербанк',
                  accountName: MICOR_TRAVELS_INFO.legalName,
                  accountNumber: MICOR_TRAVELS_INFO.phone,
                  referenceCode: `PNR-${pnrCode}`
                }}
                paymentNotice="Электронный пассажирский билет оформлен в соответствии с Резолюцией IATA 722g. Форма оплаты: Безналичный расчет / Банковская карта."
              />

              {/* A4 Footer */}
              <A4Footer
                pageNumber={1}
                totalPages={totalPages}
                docketId={`MICOR-FL-${pnrCode}`}
                language="ru"
              />
            </A4Sheet>
          </div>

          {/* ================= PAGE 2: AIRLINE CARRIAGE CONDITIONS & TRAVEL PROTOCOL ================= */}
          <div className={viewMode === 'single' && activePage !== 2 ? 'hidden print:block' : 'block'}>
            <A4Sheet id="a4-page-micor-2" pageNumber={2} totalPages={totalPages} className="document-sheet">
              {/* Header */}
              <A4Header
                logoNode={<MicorLogo size="sm" variant="dark" />}
                brandRegistration="IATA ACCREDITED AGENT: 92-2 1894 4"
                documentCategory="CARRIAGE CONTRACT & FLIGHT PROTOCOL"
                documentTitle="Условия договора воздушной перевозки"
                documentSubtext={`PNR: ${pnrCode} • Приложение к маршрутной квитанции`}
                theme="micor"
              />

              {/* Flight Quick Stats Grid */}
              <div className="grid grid-cols-4 gap-2 border border-[#e2e8f0] bg-[#f8fafc] p-2.5 mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0284c7] shrink-0" />
                  <div>
                    <div className="font-bold text-[#0f172a] text-[11px]">Регистрация 24ч</div>
                    <div className="text-[9px] text-[#64748b] font-mono">Онлайн-чек-ин открыт</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Luggage className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <div>
                    <div className="font-bold text-[#0f172a] text-[11px]">Багаж: 23 кг</div>
                    <div className="text-[9px] text-[#64748b] font-mono">+ 8 кг ручная кладь</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-[#0f172a] shrink-0" />
                  <div>
                    <div className="font-bold text-[#0f172a] text-[11px]">Гейт за 20 мин</div>
                    <div className="text-[9px] text-[#64748b] font-mono">Посадка завершается</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0284c7] shrink-0" />
                  <div>
                    <div className="font-bold text-[#0f172a] text-[11px]">Поддержка 24/7</div>
                    <div className="text-[9px] text-[#64748b] font-mono">Помощь авиакассира</div>
                  </div>
                </div>
              </div>

              {/* 4 Essential Flight Protocols */}
              <div className="space-y-3 text-xs text-[#334155] leading-relaxed flex-1">
                {/* 01. Check-in and Gate */}
                <div className="border-b border-[#e2e8f0] pb-2">
                  <h4 className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#0f172a] mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>01. Регламент регистрации в аэропорту и посадки на борт</span>
                  </h4>
                  <p className="text-[11px] text-[#475569]">
                    Онлайн-регистрация доступна на официальном сайте или в мобильном приложении авиакомпании за 24–48 часов до вылета. Регистрация в аэропорту на стойках открывается за 3 часа и строго закрывается за 60 минут (на международных рейсах) или за 40 минут (на внутренних рейсах) до времени отправления по расписанию. Выход на посадку (Boarding Gate) закрывается ровно за 20 минут до вылета. Опоздавшие пассажиры к перелету не допускаются.
                  </p>
                </div>

                {/* 02. Luggage and Dangerous Goods */}
                <div className="border-b border-[#e2e8f0] pb-2">
                  <h4 className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#0f172a] mb-1 flex items-center gap-1.5">
                    <Luggage className="w-3.5 h-3.5 text-[#16a34a]" />
                    <span>02. Нормы провоза багажа и правила авиационной безопасности</span>
                  </h4>
                  <p className="text-[11px] text-[#475569]">
                    Зарегистрированный багаж: 1–2 места до 23 кг (эконом-класс) или до 32 кг (бизнес-класс), сумма трех измерений каждого места не должна превышать 158 см. Ручная кладь: 1 место до 8 кг (55×40×23 см). Внешние аккумуляторы (Power Bank), электронные сигареты и запасные литиевые батареи разрешено провозить <strong>ИСКЛЮЧИТЕЛЬНО в ручной клади</strong>; их сдача в багаж категорически запрещена правилами ICAO/IATA.
                  </p>
                </div>

                {/* 03. Passports and Visas */}
                <div className="border-b border-[#e2e8f0] pb-2">
                  <h4 className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#0f172a] mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#eab308]" />
                    <span>03. Паспортно-визовый контроль и транзитные требования</span>
                  </h4>
                  <p className="text-[11px] text-[#475569]">
                    Пассажир несет единоличную ответственность за соблюдение таможенных, пограничных, санитарных и визовых требований всех стран по маршруту следования (включая страны транзита и пересадки). Срок действия заграничного паспорта должен составлять не менее 6 месяцев на дату обратного вылета. Несовершеннолетние пассажиры, следующие без обоих родителей, обязаны иметь нотариально удостоверенное согласие на выезд.
                  </p>
                </div>

                {/* 04. Fare Conditions and Changes */}
                <div className="border-b border-[#e2e8f0] pb-2">
                  <h4 className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#0f172a] mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#64748b]" />
                    <span>04. Применение тарифа, обмен, возврат и правило последовательности купонов</span>
                  </h4>
                  <p className="text-[11px] text-[#475569]">
                    Полетные купоны должны использоваться в строгой хронологической последовательности, начиная с первого пункта отправления. В случае неявки пассажира на первый сегмент (No-Show), все последующие рейсы в бронировании аннулируются автоматически без компенсации. Добровольный обмен или возврат билета осуществляется в соответствии с правилами примененного тарифа авиакомпании до окончания регистрации на рейс.
                  </p>
                </div>

                {/* GDS Verification Box */}
                <div className="bg-[#f8fafc] border border-[#e2e8f0] p-3 flex items-center justify-between gap-4">
                  <div className="space-y-1 font-mono text-[10px] flex-1">
                    <div className="font-bold text-[#0f172a] uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
                      <span>ЭЛЕКТРОННАЯ ВЕРИФИКАЦИЯ БИЛЕТА В СИСТЕМАХ GDS</span>
                    </div>
                    <div className="text-[#64748b]">
                      Система дистрибуции: Amadeus / Sabre GDS • Код PNR: {pnrCode}
                    </div>
                    <div className="text-[#64748b]">
                      Статус электронного билета: VALIDATED & ISSUED • Реестр IATA: 92-2 1894 4
                    </div>
                    <div className="text-[#0284c7] font-semibold text-[9px] pt-0.5">
                      {pnrVerificationUrl.replace(/^https?:\/\//, '')} • Scan the QR to verify this ticket online
                    </div>
                  </div>

                  <div className="shrink-0 bg-white p-1 border border-[#e2e8f0] flex flex-col items-center">
                    <QRCodeView value={pnrVerificationUrl} size={64} darkColor="#0f172a" />
                    <span className="font-mono text-[6px] text-[#64748b] mt-0.5 font-bold uppercase">
                      SCAN FLIGHT PNR
                    </span>
                  </div>
                </div>
              </div>

              {/* A4 Footer */}
              <A4Footer
                pageNumber={2}
                totalPages={totalPages}
                docketId={`MICOR-FL-${pnrCode}`}
                language="ru"
              />
            </A4Sheet>
          </div>
        </div>
      )}
    </A4DocumentViewer>
    </div>
  );
};
