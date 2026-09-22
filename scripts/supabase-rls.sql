-- Run in the Supabase SQL editor after schema migrate.
-- Deny PostgREST access so the anon key cannot read desk data.
-- The Vercel API uses DATABASE_URL (Postgres role), not these grants.

ALTER TABLE IF EXISTS clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS receipt_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS receipt_document_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS receipt_document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS travelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS itinerary_day_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS itinerary_day_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS itinerary_notes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE clients FROM anon, authenticated;
REVOKE ALL ON TABLE receipts FROM anon, authenticated;
REVOKE ALL ON TABLE receipt_promotions FROM anon, authenticated;
REVOKE ALL ON TABLE receipt_document_meta FROM anon, authenticated;
REVOKE ALL ON TABLE receipt_document_types FROM anon, authenticated;
REVOKE ALL ON TABLE receipt_items FROM anon, authenticated;
REVOKE ALL ON TABLE itineraries FROM anon, authenticated;
REVOKE ALL ON TABLE travelers FROM anon, authenticated;
REVOKE ALL ON TABLE flights FROM anon, authenticated;
REVOKE ALL ON TABLE accommodations FROM anon, authenticated;
REVOKE ALL ON TABLE itinerary_days FROM anon, authenticated;
REVOKE ALL ON TABLE itinerary_day_meals FROM anon, authenticated;
REVOKE ALL ON TABLE itinerary_day_activities FROM anon, authenticated;
REVOKE ALL ON TABLE itinerary_notes FROM anon, authenticated;
