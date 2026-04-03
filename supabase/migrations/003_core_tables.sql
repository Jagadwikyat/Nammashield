-- NammaShield: Core operational tables
-- trigger_events, claims, gps_logs, payout_log

-- Trigger Events: Weather/disruption events detected by the system
CREATE TABLE IF NOT EXISTS trigger_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  zone TEXT NOT NULL,
  city TEXT NOT NULL,
  severity TEXT NOT NULL,
  threshold_value NUMERIC,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  source TEXT,
  is_simulated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trigger_events_city_zone ON trigger_events(city, zone);

-- Claims: Worker claims processed by the claims engine
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
  trigger_event_id UUID REFERENCES trigger_events(id) ON DELETE CASCADE,
  active_score NUMERIC,
  fraud_score NUMERIC,
  covered_hours NUMERIC,
  payout_amount NUMERIC,
  status TEXT NOT NULL,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_claims_worker ON claims(worker_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);

-- GPS Logs: Worker location pings for active score calculation
CREATE TABLE IF NOT EXISTS gps_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT true,
  logged_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gps_logs_worker ON gps_logs(worker_id, logged_at);

-- Payout Log: Record of all wallet credits
CREATE TABLE IF NOT EXISTS payout_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  wallet_balance_after NUMERIC NOT NULL,
  status TEXT DEFAULT 'completed',
  processed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payout_log_worker ON payout_log(worker_id);
