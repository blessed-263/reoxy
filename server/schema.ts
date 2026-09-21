export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  institution TEXT NOT NULL DEFAULT '',
  student_or_id_number TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  issue_date DATE,
  turnaround_date DATE,
  turnaround_speed TEXT NOT NULL DEFAULT 'typical_48h',
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  urgent_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'RUB',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_due NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  payment_method TEXT NOT NULL DEFAULT 'sberbank',
  issued_by TEXT NOT NULL DEFAULT '',
  official_stamp BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS receipt_promotions (
  receipt_id TEXT PRIMARY KEY REFERENCES receipts(id) ON DELETE CASCADE,
  discount_percent NUMERIC(8,2) NOT NULL DEFAULT 0,
  free_tshirt_2026 BOOLEAN NOT NULL DEFAULT FALSE,
  spotify_premium BOOLEAN NOT NULL DEFAULT FALSE,
  free_legal_consultation BOOLEAN NOT NULL DEFAULT FALSE,
  custom_discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS receipt_document_meta (
  receipt_id TEXT PRIMARY KEY REFERENCES receipts(id) ON DELETE CASCADE,
  source_language TEXT NOT NULL DEFAULT 'Russian',
  target_language TEXT NOT NULL DEFAULT 'English',
  page_count INTEGER NOT NULL DEFAULT 1,
  certified_copies_count INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS receipt_document_types (
  id TEXT PRIMARY KEY,
  receipt_id TEXT NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS receipt_items (
  id TEXT PRIMARY KEY,
  receipt_id TEXT NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'other',
  quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  has_stamps BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS receipt_items_receipt_idx ON receipt_items (receipt_id, sort_order);
CREATE INDEX IF NOT EXISTS receipt_document_types_receipt_idx ON receipt_document_types (receipt_id, sort_order);
CREATE INDEX IF NOT EXISTS receipts_client_idx ON receipts (client_id);
CREATE INDEX IF NOT EXISTS receipts_updated_idx ON receipts (updated_at DESC);

CREATE TABLE IF NOT EXISTS itineraries (
  id TEXT PRIMARY KEY,
  pnr TEXT,
  title TEXT NOT NULL DEFAULT '',
  destination TEXT NOT NULL DEFAULT '',
  start_date DATE,
  end_date DATE,
  total_days INTEGER NOT NULL DEFAULT 0,
  total_nights INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  total_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'RUB',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'bank_card',
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  base_fare NUMERIC(12,2) NOT NULL DEFAULT 0,
  taxes_and_fees NUMERIC(12,2) NOT NULL DEFAULT 0,
  fuel_surcharge NUMERIC(12,2) NOT NULL DEFAULT 0,
  service_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  baggage_policy TEXT NOT NULL DEFAULT '',
  check_in_policy TEXT NOT NULL DEFAULT '',
  visa_policy TEXT NOT NULL DEFAULT '',
  fare_policy TEXT NOT NULL DEFAULT '',
  boarding_policy TEXT NOT NULL DEFAULT '',
  agent_name TEXT NOT NULL DEFAULT '',
  agent_phone TEXT NOT NULL DEFAULT '',
  agent_email TEXT NOT NULL DEFAULT '',
  emergency_phone TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS travelers (
  id TEXT PRIMARY KEY,
  itinerary_id TEXT NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  passenger_type TEXT NOT NULL DEFAULT 'adult',
  passport_number TEXT NOT NULL DEFAULT '',
  ticket_number TEXT NOT NULL DEFAULT '',
  seat TEXT NOT NULL DEFAULT '',
  frequent_flyer TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS flights (
  id TEXT PRIMARY KEY,
  itinerary_id TEXT NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  airline TEXT NOT NULL DEFAULT '',
  flight_number TEXT NOT NULL DEFAULT '',
  departure_city TEXT NOT NULL DEFAULT '',
  departure_airport TEXT NOT NULL DEFAULT '',
  arrival_city TEXT NOT NULL DEFAULT '',
  arrival_airport TEXT NOT NULL DEFAULT '',
  departure_date DATE,
  departure_time TEXT NOT NULL DEFAULT '',
  arrival_date DATE,
  arrival_time TEXT NOT NULL DEFAULT '',
  terminal TEXT NOT NULL DEFAULT '',
  terminal_arrival TEXT NOT NULL DEFAULT '',
  gate TEXT NOT NULL DEFAULT '',
  aircraft TEXT NOT NULL DEFAULT '',
  cabin_class TEXT NOT NULL DEFAULT 'economy',
  booking_ref TEXT NOT NULL DEFAULT '',
  baggage_allowance TEXT NOT NULL DEFAULT '',
  seat TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS accommodations (
  id TEXT PRIMARY KEY,
  itinerary_id TEXT NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  hotel_name TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  check_in_date DATE,
  check_out_date DATE,
  room_type TEXT NOT NULL DEFAULT '',
  meal_plan TEXT NOT NULL DEFAULT 'BB',
  booking_ref TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  stars INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS itinerary_days (
  id TEXT PRIMARY KEY,
  itinerary_id TEXT NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL DEFAULT 1,
  day_date DATE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS itinerary_day_meals (
  id TEXT PRIMARY KEY,
  day_id TEXT NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
  meal TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS itinerary_day_activities (
  id TEXT PRIMARY KEY,
  day_id TEXT NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
  activity_time TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'event',
  is_included BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS itinerary_notes (
  id TEXT PRIMARY KEY,
  itinerary_id TEXT NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS itineraries_pnr_idx ON itineraries (pnr);
CREATE INDEX IF NOT EXISTS itineraries_updated_idx ON itineraries (updated_at DESC);
CREATE INDEX IF NOT EXISTS travelers_itinerary_idx ON travelers (itinerary_id, sort_order);
CREATE INDEX IF NOT EXISTS flights_itinerary_idx ON flights (itinerary_id, sort_order);
CREATE INDEX IF NOT EXISTS accommodations_itinerary_idx ON accommodations (itinerary_id, sort_order);
CREATE INDEX IF NOT EXISTS itinerary_days_itinerary_idx ON itinerary_days (itinerary_id, sort_order);
CREATE INDEX IF NOT EXISTS itinerary_notes_itinerary_idx ON itinerary_notes (itinerary_id, kind, sort_order);
`;
