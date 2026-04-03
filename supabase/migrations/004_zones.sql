-- NammaShield: Zones table with seed data
-- Stores city zone bounding boxes, risk frequencies, and income bands

CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  zone_name TEXT NOT NULL,
  lat_min NUMERIC NOT NULL,
  lat_max NUMERIC NOT NULL,
  lng_min NUMERIC NOT NULL,
  lng_max NUMERIC NOT NULL,
  historical_disruption_freq NUMERIC DEFAULT 0.5,
  income_band_min NUMERIC NOT NULL,
  income_band_max NUMERIC NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_zones_city ON zones(city);

-- ═══════════════════════════════════════════════════
-- SEED DATA: 3 zones per city with realistic coordinates
-- ═══════════════════════════════════════════════════

-- Chennai zones (income band: ₹3000-₹3800)
INSERT INTO zones (city, zone_name, lat_min, lat_max, lng_min, lng_max, historical_disruption_freq, income_band_min, income_band_max) VALUES
  ('Chennai', 'Zone 1 — Adyar',       13.0000, 13.0120, 80.2400, 80.2600, 0.72, 3000, 3800),
  ('Chennai', 'Zone 2 — Anna Nagar',   13.0800, 13.0950, 80.2000, 80.2200, 0.68, 3000, 3800),
  ('Chennai', 'Zone 3 — T. Nagar',     13.0300, 13.0450, 80.2200, 80.2400, 0.75, 3000, 3800);

-- Mumbai zones (income band: ₹3500-₹4500)
INSERT INTO zones (city, zone_name, lat_min, lat_max, lng_min, lng_max, historical_disruption_freq, income_band_min, income_band_max) VALUES
  ('Mumbai', 'Zone 4 — Andheri',    19.1100, 19.1300, 72.8400, 72.8700, 0.65, 3500, 4500),
  ('Mumbai', 'Zone 5 — Bandra',     19.0500, 19.0700, 72.8200, 72.8500, 0.70, 3500, 4500),
  ('Mumbai', 'Zone 6 — Juhu',       19.0900, 19.1100, 72.8200, 72.8400, 0.62, 3500, 4500);

-- Delhi zones (income band: ₹3200-₹4200)
INSERT INTO zones (city, zone_name, lat_min, lat_max, lng_min, lng_max, historical_disruption_freq, income_band_min, income_band_max) VALUES
  ('Delhi', 'Zone 7 — Connaught Place',  28.6280, 28.6400, 77.2100, 77.2300, 0.58, 3200, 4200),
  ('Delhi', 'Zone 8 — Dwarka',           28.5700, 28.5900, 77.0300, 77.0600, 0.52, 3200, 4200),
  ('Delhi', 'Zone 9 — Nehru Place',      28.5400, 28.5600, 77.2400, 77.2600, 0.55, 3200, 4200);

-- Bengaluru zones (income band: ₹3800-₹5000)
INSERT INTO zones (city, zone_name, lat_min, lat_max, lng_min, lng_max, historical_disruption_freq, income_band_min, income_band_max) VALUES
  ('Bengaluru', 'Zone 10 — Koramangala',   12.9300, 12.9450, 77.6100, 77.6350, 0.42, 3800, 5000),
  ('Bengaluru', 'Zone 11 — Indiranagar',   12.9700, 12.9850, 77.6300, 77.6500, 0.38, 3800, 5000),
  ('Bengaluru', 'Zone 12 — HSR Layout',    12.9050, 12.9250, 77.6300, 77.6550, 0.45, 3800, 5000);
