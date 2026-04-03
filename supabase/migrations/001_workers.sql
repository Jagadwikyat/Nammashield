-- NammaShield: Workers table
-- Stores delivery partner profiles and onboarding state

CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  partner_id TEXT,
  city TEXT,
  zone TEXT,
  device_fingerprint TEXT,
  wallet_balance NUMERIC DEFAULT 0,
  streak_weeks INTEGER DEFAULT 0,
  is_onboarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for phone lookups during auth
CREATE INDEX IF NOT EXISTS idx_workers_phone ON workers(phone);
