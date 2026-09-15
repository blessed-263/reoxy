import React, { useState } from 'react';
import { 
  Itinerary, 
  Traveler, 
  FlightSegment, 
  ItineraryCurrency, 
  ItineraryStatus 
} from '../../types/itinerary';
import { 
  Plus, 
  Trash2, 
  Save, 
  Plane, 
  Users, 
  CreditCard, 
  FileCheck,
  Check,
  Luggage,
  Calendar,
  Clock
} from 'lucide-react';
import { 
  CABIN_CLASS_LABELS
} from '../../data/micorTravelsInfo';
import { calculateDaysAndNights } from '../../utils/itineraryFormatters';
import { PAYMENT_METHOD_OPTIONS } from '../../utils/paymentInstructions';
import { FlightRouteArrow } from './FlightRouteArrow';
import { PlaceSearchField } from '../common/PlaceSearchField';
import { searchFlightPlaces } from '../../data/places';

interface ItineraryFormProps {
  itinerary: Itinerary;
  onChange: (updated: Itinerary) => void;
  onSave: () => void;
  onReset: () => void;
  isSavedNotification: boolean;
}

export const ItineraryForm: React.FC<ItineraryFormProps> = ({
  itinerary,
  onChange,
  onSave,
  isSavedNotification
}) => {
  const [activeSection, setActiveSection] = useState<'main' | 'travelers' | 'flights' | 'pricing' | 'rules'>('main');

  const updateField = <K extends keyof Itinerary>(field: K, value: Itinerary[K]) => {
    const updated = { ...itinerary, [field]: value };

    if (field === 'startDate' || field === 'endDate') {
      const calc = calculateDaysAndNights(
        field === 'startDate' ? (value as string) : itinerary.startDate,
        field === 'endDate' ? (value as string) : itinerary.endDate
      );
      updated.totalDays = calc.days;
      updated.totalNights = calc.nights;
    }

    onChange(updated);
  };

  // Passenger Handlers
  const handleAddTraveler = () => {
    const newTraveler: Traveler = {
      id: `t-${Date.now()}`,
      name: '',
      type: 'adult',
      passportNumber: '',
      ticketNumber: `235-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      seat: ''
    };
    updateField('travelers', [...itinerary.travelers, newTraveler]);
  };

  const handleUpdateTraveler = (index: number, patch: Partial<Traveler>) => {
    const list = [...itinerary.travelers];
    list[index] = { ...list[index], ...patch };
    updateField('travelers', list);
  };

  const handleRemoveTraveler = (index: number) => {
    if (itinerary.travelers.length <= 1) return;
    const list = itinerary.travelers.filter((_, i) => i !== index);
    updateField('travelers', list);
  };

  // Flight Segment Handlers
  const handleAddFlight = () => {
    const newFlight: FlightSegment = {
      id: `f-${Date.now()}`,
      airline: '',
      flightNumber: '',
      departureCity: '',
      departureAirport: '',
      arrivalCity: '',
      arrivalAirport: '',
      departureDate: itinerary.startDate,
      departureTime: '10:00',
      arrivalDate: itinerary.startDate,
      arrivalTime: '14:00',
      cabinClass: 'economy',
      baggageAllowance: '1 место до 23 кг + ручная кладь 8 кг',
      duration: '4ч 00м',
      status: 'OK / Подтверждено'
    };
    updateField('flights', [...itinerary.flights, newFlight]);
  };

  const handleUpdateFlight = (index: number, patch: Partial<FlightSegment>) => {
    const list = [...itinerary.flights];
    list[index] = { ...list[index], ...patch };
    updateField('flights', list);
  };

  const handleRemoveFlight = (index: number) => {
    if (itinerary.flights.length <= 1) return;
    const list = itinerary.flights.filter((_, i) => i !== index);
    updateField('flights', list);
  };

  // Fare calculations
  const updateFare = (field: 'baseFare' | 'taxesAndFees' | 'fuelSurcharge' | 'serviceFee', value: number) => {
    const currentFare = itinerary.fareBreakdown || {
      baseFare: Math.round(itinerary.totalPrice * 0.75),
      taxesAndFees: Math.round(itinerary.totalPrice * 0.15),
      fuelSurcharge: Math.round(itinerary.totalPrice * 0.08),
      serviceFee: Math.round(itinerary.totalPrice * 0.02)
    };
    const updatedFare = { ...currentFare, [field]: value };
    const newTotal = (updatedFare.baseFare || 0) + (updatedFare.taxesAndFees || 0) + (updatedFare.fuelSurcharge || 0) + (updatedFare.serviceFee || 0);
    
    onChange({
      ...itinerary,
      fareBreakdown: updatedFare,
      totalPrice: newTotal,
      amountPaid: itinerary.paymentStatus === 'paid' ? newTotal : itinerary.amountPaid
    });
  };

  return (
    <div className="p-5 space-y-5 text-slate-900">
      {/* Top Header & Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-sky-600" />
          <span className="font-semibold text-slate-900">Flight ticket</span>
        </div>
      </div>

      {/* Navigation Tabs - Focused purely on Flights */}
      <div className="flex flex-nowrap overflow-x-auto gap-1 border-b border-slate-200 text-[13px]">
        <button
          type="button"
          onClick={() => setActiveSection('main')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            activeSection === 'main'
              ? 'border-sky-500 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Plane className="w-3.5 h-3.5 text-sky-600" />
          <span>Booking</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('travelers')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            activeSection === 'travelers'
              ? 'border-sky-500 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-sky-600" />
          <span>Passengers ({itinerary.travelers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('flights')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            activeSection === 'flights'
              ? 'border-sky-500 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          <span>Flights ({itinerary.flights.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('pricing')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            activeSection === 'pricing'
              ? 'border-sky-500 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-sky-600" />
          <span>Fare</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('rules')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            activeSection === 'rules'
              ? 'border-sky-500 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Luggage className="w-3.5 h-3.5 text-sky-600" />
          <span>Rules</span>
        </button>
      </div>

      {/* Tab 1: Booking & Route Info */}
      {activeSection === 'main' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="ui-label">
                Код бронирования PNR (6 символов) *
              </label>
              <input
                type="text"
                value={itinerary.pnr || itinerary.id}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  onChange({ ...itinerary, pnr: val, id: `MC-${val}` });
                }}
                className="w-full ui-field font-mono uppercase tracking-widest"
                placeholder="7K8X9P"
              />
            </div>

            <div className="md:col-span-2">
              <label className="ui-label">
                Маршрут авиаперелета (Route Title) *
              </label>
              <input
                type="text"
                value={itinerary.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full ui-field"
                placeholder="Москва (VKO) ⇄ Стамбул (IST) ⇄ Рим (FCO)"
              />
            </div>

            <div>
              <label className="ui-label">
                Страна назначения / Регион
              </label>
              <input
                type="text"
                value={itinerary.destination}
                onChange={(e) => updateField('destination', e.target.value)}
                className="w-full ui-field"
                placeholder="Италия / Рим"
              />
            </div>

            <div>
              <label className="ui-label">
                Дата первого вылета *
              </label>
              <input
                type="date"
                value={itinerary.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                className="w-full ui-field font-mono"
              />
            </div>

            <div>
              <label className="ui-label">
                Дата окончания перелетов *
              </label>
              <input
                type="date"
                value={itinerary.endDate}
                onChange={(e) => updateField('endDate', e.target.value)}
                className="w-full ui-field font-mono"
              />
            </div>

            <div>
              <label className="ui-label">
                Статус билета
              </label>
              <select
                value={itinerary.status}
                onChange={(e) => updateField('status', e.target.value as ItineraryStatus)}
                className="w-full ui-field font-mono"
              >
                <option value="confirmed">Билеты выписаны (OK / Confirmed)</option>
                <option value="draft">Бронь (Предварительно)</option>
                <option value="in_progress">В обработке GDS</option>
                <option value="completed">Перелет завершен</option>
              </select>
            </div>

            <div>
              <label className="ui-label">
                Авиакассир / Оформил
              </label>
              <input
                type="text"
                value={itinerary.agentName}
                onChange={(e) => updateField('agentName', e.target.value)}
                className="w-full ui-field"
                placeholder="Константин Белов"
              />
            </div>

            <div>
              <label className="ui-label">
                Аварийная линия поддержки 24/7
              </label>
              <input
                type="text"
                value={itinerary.emergencyPhone}
                onChange={(e) => updateField('emergencyPhone', e.target.value)}
                className="w-full ui-field font-mono"
                placeholder="+7 (999) 000-64-26"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Passengers & E-Tickets */}
      {activeSection === 'travelers' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-slate-500">
              Пассажиры в бронировании (латиницей как в загранпаспорте)
            </span>
            <button
              type="button"
              onClick={handleAddTraveler}
              className="ui-chip"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить пассажира</span>
            </button>
          </div>

          <div className="space-y-3">
            {itinerary.travelers.map((traveler, index) => (
              <div key={traveler.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-sky-700 font-semibold">Passenger #{index + 1}</span>
                  {itinerary.travelers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTraveler(index)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Удалить пассажира"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <div className="md:col-span-2">
                    <label className="ui-label">
                      ФИО пассажира (латиницей) *
                    </label>
                    <input
                      type="text"
                      value={traveler.name}
                      onChange={(e) => handleUpdateTraveler(index, { name: e.target.value.toUpperCase() })}
                      className="w-full ui-field font-mono uppercase"
                      placeholder="IVANOV / ALEXANDER MR"
                    />
                  </div>

                  <div>
                    <label className="ui-label">
                      Номер загранпаспорта *
                    </label>
                    <input
                      type="text"
                      value={traveler.passportNumber || ''}
                      onChange={(e) => handleUpdateTraveler(index, { passportNumber: e.target.value })}
                      className="w-full ui-field font-mono"
                      placeholder="75 1234567"
                    />
                  </div>

                  <div>
                    <label className="ui-label">
                      № Электронного билета *
                    </label>
                    <input
                      type="text"
                      value={traveler.ticketNumber || ''}
                      onChange={(e) => handleUpdateTraveler(index, { ticketNumber: e.target.value })}
                      className="w-full ui-field font-mono font-bold"
                      placeholder="235-2490184920"
                    />
                  </div>

                  <div>
                    <label className="ui-label">
                      Место на борту
                    </label>
                    <input
                      type="text"
                      value={traveler.seat || ''}
                      onChange={(e) => handleUpdateTraveler(index, { seat: e.target.value })}
                      className="w-full ui-field font-mono"
                      placeholder="14A (Window)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="ui-label">
                      Номер карты часто летающего пассажира (Frequent Flyer)
                    </label>
                    <input
                      type="text"
                      value={traveler.frequentFlyer || ''}
                      onChange={(e) => handleUpdateTraveler(index, { frequentFlyer: e.target.value })}
                      className="w-full ui-field font-mono"
                      placeholder="TK 882019482 Classic Plus"
                    />
                  </div>

                  <div>
                    <label className="ui-label">
                      Категория пассажира
                    </label>
                    <select
                      value={traveler.type}
                      onChange={(e) => handleUpdateTraveler(index, { type: e.target.value as Traveler['type'] })}
                      className="w-full ui-field font-mono"
                    >
                      <option value="adult">Взрослый (ADT / 12+ лет)</option>
                      <option value="child">Ребенок (CHD / 2-11 лет)</option>
                      <option value="infant">Младенец (INF / до 2 лет)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Flight Segments */}
      {activeSection === 'flights' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-slate-500">
              Полетные сегменты в хронологическом порядке
            </span>
            <button
              type="button"
              onClick={handleAddFlight}
              className="ui-chip"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить рейс</span>
            </button>
          </div>

          <div className="space-y-3">
            {itinerary.flights.map((flight, index) => (
              <div key={flight.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-800 font-semibold text-[13px]">
                    Рейс #{index + 1}: {flight.airline || 'Авиакомпания'} {flight.flightNumber || '№'}
                  </span>
                  {itinerary.flights.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFlight(index)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Удалить рейс"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div>
                    <label className="ui-label">
                      Авиакомпания *
                    </label>
                    <input
                      type="text"
                      value={flight.airline}
                      onChange={(e) => handleUpdateFlight(index, { airline: e.target.value })}
                      className="w-full ui-field"
                      placeholder="Turkish Airlines / Emirates"
                    />
                  </div>

                  <div>
                    <label className="ui-label">
                      Номер рейса *
                    </label>
                    <input
                      type="text"
                      value={flight.flightNumber}
                      onChange={(e) => handleUpdateFlight(index, { flightNumber: e.target.value.toUpperCase() })}
                      className="w-full ui-field font-mono uppercase"
                      placeholder="TK 1865"
                    />
                  </div>

                  <div>
                    <label className="ui-label">
                      Тип воздушного судна (Aircraft)
                    </label>
                    <input
                      type="text"
                      value={flight.aircraft || ''}
                      onChange={(e) => handleUpdateFlight(index, { aircraft: e.target.value })}
                      className="w-full ui-field"
                      placeholder="Airbus A350-900 / Boeing 777"
                    />
                  </div>

                  <div>
                    <label className="ui-label">
                      Класс обслуживания
                    </label>
                    <select
                      value={flight.cabinClass}
                      onChange={(e) => handleUpdateFlight(index, { cabinClass: e.target.value as FlightSegment['cabinClass'] })}
                      className="w-full ui-field font-mono"
                    >
                      <option value="economy">Эконом / Economy (Y)</option>
                      <option value="comfort">Комфорт / Comfort (W)</option>
                      <option value="business">Бизнес / Business (J)</option>
                      <option value="first">Первый / First (F)</option>
                    </select>
                  </div>
                </div>

                {/* Live Route Direction Visual with Arrow & Coloured Plane */}
                <div className="pt-1">
                  <FlightRouteArrow
                    variant="card"
                    originAirport={flight.departureAirport || 'DEP'}
                    originCity={flight.departureCity || 'Откуда'}
                    departureTime={flight.departureTime}
                    destinationAirport={flight.arrivalAirport || 'ARR'}
                    destinationCity={flight.arrivalCity || 'Куда'}
                    arrivalTime={flight.arrivalTime}
                    duration={flight.duration}
                    stopsLabel={flight.flightNumber ? `Рейс ${flight.flightNumber}` : undefined}
                  />
                </div>

                {/* Departure & Arrival Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Departure Group */}
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-2">
                    <span className="text-[11px] font-semibold text-sky-700 block">
                      ВЫЛЕТ (DEPARTURE)
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="col-span-2">
                        <label className="ui-label">Город / аэропорт вылета</label>
                        <PlaceSearchField
                          value={flight.departureCity}
                          placeholder="Moscow, Sheremetyevo"
                          search={searchFlightPlaces}
                          onChange={(departureCity) => handleUpdateFlight(index, { departureCity })}
                          onSelect={(hit) =>
                            handleUpdateFlight(index, {
                              departureCity: hit.city,
                              departureAirport: hit.airport,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="ui-label">Код IATA</label>
                        <PlaceSearchField
                          value={flight.departureAirport || ''}
                          placeholder="SVO"
                          className="w-full ui-field font-mono uppercase"
                          search={searchFlightPlaces}
                          onChange={(departureAirport) =>
                            handleUpdateFlight(index, { departureAirport: departureAirport.toUpperCase() })
                          }
                          onSelect={(hit) =>
                            handleUpdateFlight(index, {
                              departureAirport: hit.airport,
                              departureCity: hit.city,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <label className="ui-label">Дата вылета</label>
                        <input
                          type="date"
                          value={flight.departureDate}
                          onChange={(e) => handleUpdateFlight(index, { departureDate: e.target.value })}
                          className="w-full ui-field font-mono"
                        />
                      </div>
                      <div>
                        <label className="ui-label">Время вылета</label>
                        <input
                          type="time"
                          value={flight.departureTime}
                          onChange={(e) => handleUpdateFlight(index, { departureTime: e.target.value })}
                          className="w-full ui-field font-mono"
                        />
                      </div>
                      <div>
                        <label className="ui-label">Терминал / Гейт</label>
                        <input
                          type="text"
                          value={flight.terminal || ''}
                          onChange={(e) => handleUpdateFlight(index, { terminal: e.target.value })}
                          className="w-full ui-field"
                          placeholder="Терминал A"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Arrival Group */}
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-2">
                    <span className="text-[11px] font-semibold text-emerald-700 block">
                      ПРИЛЕТ (ARRIVAL)
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="col-span-2">
                        <label className="ui-label">Город / аэропорт прилета</label>
                        <PlaceSearchField
                          value={flight.arrivalCity}
                          placeholder="Istanbul Airport"
                          search={searchFlightPlaces}
                          onChange={(arrivalCity) => handleUpdateFlight(index, { arrivalCity })}
                          onSelect={(hit) =>
                            handleUpdateFlight(index, {
                              arrivalCity: hit.city,
                              arrivalAirport: hit.airport,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="ui-label">Код IATA</label>
                        <PlaceSearchField
                          value={flight.arrivalAirport || ''}
                          placeholder="IST"
                          className="w-full ui-field font-mono uppercase"
                          search={searchFlightPlaces}
                          onChange={(arrivalAirport) =>
                            handleUpdateFlight(index, { arrivalAirport: arrivalAirport.toUpperCase() })
                          }
                          onSelect={(hit) =>
                            handleUpdateFlight(index, {
                              arrivalAirport: hit.airport,
                              arrivalCity: hit.city,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <label className="ui-label">Дата прилета</label>
                        <input
                          type="date"
                          value={flight.arrivalDate}
                          onChange={(e) => handleUpdateFlight(index, { arrivalDate: e.target.value })}
                          className="w-full ui-field font-mono"
                        />
                      </div>
                      <div>
                        <label className="ui-label">Время прилета</label>
                        <input
                          type="time"
                          value={flight.arrivalTime}
                          onChange={(e) => handleUpdateFlight(index, { arrivalTime: e.target.value })}
                          className="w-full ui-field font-mono"
                        />
                      </div>
                      <div>
                        <label className="ui-label">Терминал прилета</label>
                        <input
                          type="text"
                          value={flight.terminalArrival || ''}
                          onChange={(e) => handleUpdateFlight(index, { terminalArrival: e.target.value })}
                          className="w-full ui-field"
                          placeholder="Терминал 1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Baggage & Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="ui-label">
                      Норма провоза багажа на сегменте
                    </label>
                    <input
                      type="text"
                      value={flight.baggageAllowance || ''}
                      onChange={(e) => handleUpdateFlight(index, { baggageAllowance: e.target.value })}
                      className="w-full ui-field"
                      placeholder="23 кг + ручная кладь 8 кг"
                    />
                  </div>

                  <div>
                    <label className="ui-label">
                      Время в пути (Duration)
                    </label>
                    <input
                      type="text"
                      value={flight.duration || ''}
                      onChange={(e) => handleUpdateFlight(index, { duration: e.target.value })}
                      className="w-full ui-field"
                      placeholder="4ч 15м"
                    />
                  </div>

                  <div>
                    <label className="ui-label">
                      Статус сегмента
                    </label>
                    <input
                      type="text"
                      value={flight.status || 'OK / Подтверждено'}
                      onChange={(e) => handleUpdateFlight(index, { status: e.target.value })}
                      className="w-full ui-field"
                      placeholder="OK / Подтверждено"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Pricing & Fare Calculation */}
      {activeSection === 'pricing' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="ui-label">
                Тариф авиакомпании (Airfare)
              </label>
              <input
                type="number"
                value={itinerary.fareBreakdown?.baseFare || Math.round(itinerary.totalPrice * 0.75)}
                onChange={(e) => updateFare('baseFare', Number(e.target.value))}
                className="w-full ui-field font-mono"
              />
            </div>

            <div>
              <label className="ui-label">
                Аэропортовые таксы и сборы
              </label>
              <input
                type="number"
                value={itinerary.fareBreakdown?.taxesAndFees || Math.round(itinerary.totalPrice * 0.15)}
                onChange={(e) => updateFare('taxesAndFees', Number(e.target.value))}
                className="w-full ui-field font-mono"
              />
            </div>

            <div>
              <label className="ui-label">
                Топливный сбор (YQ/YR)
              </label>
              <input
                type="number"
                value={itinerary.fareBreakdown?.fuelSurcharge || Math.round(itinerary.totalPrice * 0.08)}
                onChange={(e) => updateFare('fuelSurcharge', Number(e.target.value))}
                className="w-full ui-field font-mono"
              />
            </div>

            <div>
              <label className="ui-label">
                Сервисный сбор агентства
              </label>
              <input
                type="number"
                value={itinerary.fareBreakdown?.serviceFee || Math.round(itinerary.totalPrice * 0.02)}
                onChange={(e) => updateFare('serviceFee', Number(e.target.value))}
                className="w-full ui-field font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="ui-label">
                ИТОГО К ОПЛАТЕ *
              </label>
              <input
                type="number"
                value={itinerary.totalPrice}
                onChange={(e) => updateField('totalPrice', Number(e.target.value))}
                className="ui-field font-mono-num font-semibold text-sky-700"
              />
            </div>

            <div>
              <label className="ui-label">
                Валюта расчета
              </label>
              <select
                value={itinerary.currency}
                onChange={(e) => updateField('currency', e.target.value as ItineraryCurrency)}
                className="w-full ui-field font-mono"
              >
                <option value="RUB">RUB (₽)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="AED">AED (AED)</option>
              </select>
            </div>

            <div>
              <label className="ui-label">
                Статус оплаты
              </label>
              <select
                value={itinerary.paymentStatus}
                onChange={(e) => updateField('paymentStatus', e.target.value as Itinerary['paymentStatus'])}
                className="w-full ui-field font-mono"
              >
                <option value="paid">Оплачено 100%</option>
                <option value="deposit_paid">Внесен депозит</option>
                <option value="pending">Ожидает оплаты</option>
              </select>
            </div>
          </div>

          <div>
            <label className="ui-label">Способ оплаты</label>
            <select
              value={itinerary.paymentMethod || 'bank_card'}
              onChange={(e) => updateField('paymentMethod', e.target.value as Itinerary['paymentMethod'])}
              className="w-full ui-field"
            >
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.labelRu}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Tab 5: Baggage & Advisories */}
      {activeSection === 'rules' && (
        <div className="space-y-3">
          <div>
            <label className="ui-label">
              Правила перевозки багажа и ручной клади
            </label>
            <textarea
              rows={3}
              value={itinerary.baggagePolicy || ''}
              onChange={(e) => updateField('baggagePolicy', e.target.value)}
              className="w-full ui-field leading-relaxed"
              placeholder="Норма бесплатного провоза багажа: 1 место до 23 кг..."
            />
          </div>

          <div>
            <label className="ui-label">
              Регламент регистрации в аэропорту
            </label>
            <textarea
              rows={3}
              value={itinerary.checkInPolicy || ''}
              onChange={(e) => updateField('checkInPolicy', e.target.value)}
              className="w-full ui-field leading-relaxed"
              placeholder="Онлайн-регистрация открывается за 24 часа..."
            />
          </div>
        </div>
      )}

      {/* Footer Save & Reset Bar */}
      <div className="flex items-center justify-end pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 text-[13px] transition-colors"
        >
          {isSavedNotification ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          <span>{isSavedNotification ? 'Saved' : 'Save ticket'}</span>
        </button>
      </div>
    </div>
  );
};
