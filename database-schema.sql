-- ============================================
-- PINPOINT PARKING - SUPABASE DATABASE SCHEMA
-- ============================================
-- Run this in Supabase SQL Editor to set up tables
-- ============================================

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'IL',
  zip TEXT,
  notes TEXT,
  total_jobs INTEGER DEFAULT 0,
  total_spent_cents INTEGER DEFAULT 0,
  last_job_date DATE,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for phone lookup (duplicate detection)
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- ============================================
-- QUOTES TABLE (from chatbot)
-- ============================================
CREATE TABLE IF NOT EXISTS quotes (
  id BIGSERIAL PRIMARY KEY,

  -- Customer reference
  customer_id BIGINT REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,

  -- Location
  address TEXT NOT NULL,
  city TEXT,
  state TEXT DEFAULT 'IL',
  zip TEXT,

  -- Project details
  service_type TEXT NOT NULL, -- sealcoating, paving, linestriping
  project_type TEXT, -- driveway, parking-lot, church, etc.
  square_footage INTEGER,
  condition TEXT, -- good, fair, poor, unknown

  -- Pricing
  estimate_low INTEGER, -- in dollars
  estimate_high INTEGER,
  add_ons JSONB DEFAULT '{}',

  -- Scheduling
  preferred_date DATE,
  preferred_time TEXT,

  -- Status
  status TEXT DEFAULT 'new', -- new, contacted, quoted, won, lost
  notes TEXT,

  -- Metadata
  source TEXT DEFAULT 'chatbot',
  session_id TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_service ON quotes(service_type);
CREATE INDEX IF NOT EXISTS idx_quotes_created ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_id);

-- ============================================
-- JOBS TABLE (confirmed work)
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,

  -- References
  customer_id BIGINT REFERENCES customers(id),
  quote_id BIGINT REFERENCES quotes(id),

  -- Customer info (denormalized for easy access)
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,

  -- Location
  address TEXT NOT NULL,
  placement_lat DOUBLE PRECISION,
  placement_lng DOUBLE PRECISION,
  placement_notes TEXT,

  -- Job details
  service_type TEXT NOT NULL,
  project_type TEXT,
  square_footage INTEGER,

  -- Scheduling
  scheduled_date DATE,
  completed_date DATE,

  -- Pricing
  price_cents INTEGER DEFAULT 0,
  add_ons JSONB DEFAULT '{}',
  paid BOOLEAN DEFAULT FALSE,
  payment_method TEXT,

  -- Status
  status TEXT DEFAULT 'pending', -- pending, scheduled, in-progress, completed, cancelled

  -- Notes
  notes TEXT,
  crew_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_jobs_customer ON jobs(customer_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for quotes (from chatbot)
CREATE POLICY "Allow anonymous quote inserts" ON quotes
  FOR INSERT TO anon WITH CHECK (true);

-- Allow anonymous inserts for customers
CREATE POLICY "Allow anonymous customer inserts" ON customers
  FOR INSERT TO anon WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Service role full access to customers" ON customers
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access to quotes" ON quotes
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access to jobs" ON jobs
  FOR ALL TO service_role USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VIEWS FOR DASHBOARD
-- ============================================

-- Recent quotes view
CREATE OR REPLACE VIEW recent_quotes AS
SELECT
  q.id,
  q.customer_name,
  q.customer_phone,
  q.address,
  q.service_type,
  q.square_footage,
  q.estimate_low,
  q.estimate_high,
  q.preferred_date,
  q.status,
  q.created_at
FROM quotes q
ORDER BY q.created_at DESC
LIMIT 50;

-- Quote stats view
CREATE OR REPLACE VIEW quote_stats AS
SELECT
  COUNT(*) as total_quotes,
  COUNT(*) FILTER (WHERE status = 'new') as new_quotes,
  COUNT(*) FILTER (WHERE status = 'contacted') as contacted_quotes,
  COUNT(*) FILTER (WHERE status = 'won') as won_quotes,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as quotes_this_week,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as quotes_this_month
FROM quotes;
