-- NammaShield: Policies table
-- Stores weekly coverage policies linked to workers

CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  weekly_premium NUMERIC NOT NULL,
  coverage_amount NUMERIC NOT NULL,
  risk_score NUMERIC NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for looking up active policies by worker
CREATE INDEX IF NOT EXISTS idx_policies_worker ON policies(worker_id, status);
