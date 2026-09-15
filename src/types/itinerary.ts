import { PaymentMethod } from '../types';

export type ItineraryCurrency = 'RUB' | 'USD' | 'EUR' | 'AED';
export type ItineraryPaymentMethod = PaymentMethod;

export type ItineraryStatus = 'confirmed' | 'draft' | 'in_progress' | 'completed';

export interface Traveler {
  id: string;
  name: string; // Passenger legal name in Latin (e.g. IVANOV/ALEXANDER MR)
  type: 'adult' | 'child' | 'infant';
  passportNumber?: string;
  ticketNumber?: string; // e.g. 176-2490184920
  seat?: string; // e.g. 14A
  frequentFlyer?: string; // e.g. TK 882019482 Silver
  notes?: string;
}

export interface FlightSegment {
  id: string;
  airline: string; // e.g. Turkish Airlines / Emirates
  flightNumber: string; // e.g. TK 1865
  departureCity: string; // e.g. Moscow / Москва
  departureAirport?: string; // e.g. VKO / Внуково
  arrivalCity: string; // e.g. Rome / Рим
  arrivalAirport?: string; // e.g. FCO / Фьюмичино
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // HH:mm
  arrivalDate: string; // YYYY-MM-DD
  arrivalTime: string; // HH:mm
  terminal?: string; // e.g. Terminal A / 3
  terminalArrival?: string; // e.g. Terminal 1
  gate?: string; // e.g. Gate 22
  aircraft?: string; // e.g. Airbus A350-900 / Boeing 777-300ER
  cabinClass: 'economy' | 'comfort' | 'business' | 'first';
  bookingRef?: string; // PNR segment ref e.g. 7K8X9P
  baggageAllowance?: string; // e.g. 23 кг + ручная кладь 8 кг
  seat?: string;
  duration?: string; // e.g. 4ч 15м
  status?: string; // e.g. OK / Подтверждено
}

export interface FareBreakdown {
  baseFare: number;
  taxesAndFees: number;
  fuelSurcharge: number;
  serviceFee?: number;
}

export interface Accommodation {
  id: string;
  hotelName: string;
  city: string;
  address?: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  mealPlan: 'RO' | 'BB' | 'HB' | 'FB' | 'AI' | 'UAI';
  bookingRef?: string;
  phone?: string;
  stars?: number;
}

export type ActivityCategory = 'flight' | 'transfer' | 'hotel' | 'tour' | 'meal' | 'free_time' | 'event';

export interface DayActivity {
  id: string;
  time: string;
  title: string;
  location?: string;
  description: string;
  category: ActivityCategory;
  isIncluded: boolean;
}

export interface DaySchedule {
  id: string;
  dayNumber: number;
  date: string;
  title: string;
  description?: string;
  mealsIncluded?: string[];
  activities: DayActivity[];
}

export interface Itinerary {
  id: string; // PNR / Booking Ref e.g. "MC-FL-8829" or "7K8X9P"
  pnr?: string; // e.g. "7K8X9P"
  title: string; // Route title e.g. "Москва (VKO) ⇄ Стамбул (IST) ⇄ Рим (FCO)"
  destination: string; // Destination country or route
  startDate: string;
  endDate: string;
  totalDays: number;
  totalNights: number;
  status: ItineraryStatus;
  travelers: Traveler[];
  flights: FlightSegment[];
  accommodations?: Accommodation[];
  days?: DaySchedule[];
  inclusions?: string[];
  exclusions?: string[];
  importantNotes?: string[];
  totalPrice: number;
  currency: ItineraryCurrency;
  paymentStatus: 'paid' | 'deposit_paid' | 'pending';
  paymentMethod?: ItineraryPaymentMethod;
  amountPaid: number;
  fareBreakdown?: FareBreakdown;
  baggagePolicy?: string;
  checkInPolicy?: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  emergencyPhone: string;
  createdAt: string;
  updatedAt: string;
}
