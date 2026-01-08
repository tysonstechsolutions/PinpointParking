-- ============================================
-- PINPOINT PARKING - SUPABASE DATABASE SCHEMA
-- ============================================
-- Run this in Supabase SQL Editor to create all tables
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
  company_name TEXT,
  is_business BOOLEAN DEFAULT FALSE,
  default_payment_method TEXT DEFAULT 'invoice', -- 'upfront', 'invoice', 'cash', 'check'
  payment_terms INTEGER DEFAULT 15, -- days
  notes TEXT, -- public notes (gate code, etc.)
  internal_notes TEXT, -- staff only
  is_vip BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  total_jobs INTEGER DEFAULT 0,
  total_spent_cents BIGINT DEFAULT 0,
  outstanding_balance_cents BIGINT DEFAULT 0,
  last_job_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOBS TABLE (bookings/quotes)
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  service_address TEXT NOT NULL,
  city TEXT,
  state TEXT DEFAULT 'IL',
  zip TEXT,
  job_type TEXT NOT NULL, -- 'sealcoating', 'paving', 'linestriping'
  project_type TEXT, -- 'residential', 'commercial', 'house-of-worship'
  square_feet INTEGER,
  condition TEXT, -- 'good', 'fair', 'poor', 'unknown'
  quote_cents INTEGER,
  final_price_cents INTEGER,
  discount_cents INTEGER DEFAULT 0,
  scheduled_date DATE,
  completed_date DATE,
  status TEXT DEFAULT 'quote', -- 'quote', 'approved', 'scheduled', 'in_progress', 'completed', 'cancelled'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'partial', 'refunded'
  payment_method TEXT, -- 'card', 'cash', 'check', 'invoice'
  notes TEXT,
  internal_notes TEXT,
  polygon_coordinates JSONB, -- store the drawn polygon
  invoice_id BIGINT,
  invoiced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id BIGSERIAL PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  job_id BIGINT REFERENCES jobs(id),
  customer_id BIGINT REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  customer_address TEXT,
  service_address TEXT,
  service_description TEXT,
  job_type TEXT,
  square_feet INTEGER,
  scheduled_date DATE,
  completed_date DATE,
  line_items JSONB, -- [{description, quantity, unit, unit_price_cents, total_cents}]
  subtotal_cents INTEGER,
  tax_cents INTEGER DEFAULT 0,
  discount_cents INTEGER DEFAULT 0,
  total_cents INTEGER,
  amount_paid_cents INTEGER DEFAULT 0,
  balance_due_cents INTEGER GENERATED ALWAYS AS (total_cents - amount_paid_cents) STORED,
  invoice_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'void'
  reminder_count INTEGER DEFAULT 0,
  last_reminder_sent_at TIMESTAMPTZ,
  next_reminder_at TIMESTAMPTZ,
  notes TEXT,
  internal_notes TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT REFERENCES jobs(id),
  customer_id BIGINT REFERENCES customers(id),
  invoice_id BIGINT REFERENCES invoices(id),
  category TEXT NOT NULL, -- 'weight_ticket', 'fuel_receipt', 'invoice', 'photo', 'contract', 'other'
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  storage_path TEXT NOT NULL,
  title TEXT,
  weight_lbs INTEGER,
  amount_cents INTEGER,
  document_date DATE,
  parse_status TEXT, -- 'pending', 'parsing', 'parsed', 'failed'
  parsed_invoice_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PARSED INVOICES TABLE (AI-extracted data)
-- ============================================
CREATE TABLE IF NOT EXISTS parsed_invoices (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT REFERENCES documents(id),
  customer_id BIGINT REFERENCES customers(id),
  invoice_type TEXT, -- 'vendor_expense' or 'customer_record'
  from_name TEXT,
  from_address TEXT,
  from_phone TEXT,
  from_email TEXT,
  to_name TEXT,
  to_address TEXT,
  to_phone TEXT,
  to_email TEXT,
  invoice_number TEXT,
  invoice_date DATE,
  due_date DATE,
  payment_terms TEXT,
  line_items JSONB,
  subtotal_cents INTEGER,
  tax_cents INTEGER DEFAULT 0,
  fees_cents INTEGER DEFAULT 0,
  discount_cents INTEGER DEFAULT 0,
  total_cents INTEGER,
  expense_category TEXT, -- 'materials', 'fuel', 'equipment', 'labor', 'other'
  tax_year INTEGER,
  status TEXT DEFAULT 'pending_review', -- 'pending_review', 'confirmed'
  confidence_score NUMERIC(3,2),
  raw_text TEXT,
  confirmed_at TIMESTAMPTZ,
  parsed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  invoice_id BIGINT REFERENCES invoices(id),
  job_id BIGINT REFERENCES jobs(id),
  customer_id BIGINT REFERENCES customers(id),
  amount_cents INTEGER NOT NULL,
  payment_method TEXT, -- 'card', 'cash', 'check', 'other'
  reference_number TEXT, -- check number, transaction ID, etc.
  notes TEXT,
  payment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id BIGSERIAL PRIMARY KEY,
  parsed_invoice_id BIGINT REFERENCES parsed_invoices(id),
  document_id BIGINT REFERENCES documents(id),
  category TEXT NOT NULL, -- from config.expenseCategories
  vendor_name TEXT,
  description TEXT,
  amount_cents INTEGER NOT NULL,
  expense_date DATE,
  tax_year INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_documents_job_id ON documents(job_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_parsed_invoices_document_id ON parsed_invoices(document_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Generate unique invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year_str TEXT;
  next_num INTEGER;
  invoice_num TEXT;
BEGIN
  year_str := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 'INV-' || year_str || '-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_str || '-%';

  invoice_num := 'INV-' || year_str || '-' || LPAD(next_num::TEXT, 4, '0');
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Update customer stats after job completion
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE customers
    SET
      total_jobs = (SELECT COUNT(*) FROM jobs WHERE customer_id = NEW.customer_id),
      total_spent_cents = (SELECT COALESCE(SUM(final_price_cents), 0) FROM jobs WHERE customer_id = NEW.customer_id AND status = 'completed'),
      last_job_date = (SELECT MAX(completed_date) FROM jobs WHERE customer_id = NEW.customer_id AND status = 'completed'),
      updated_at = NOW()
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_stats
AFTER INSERT OR UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_customer_stats();

-- ============================================
-- STORAGE BUCKET
-- ============================================
-- Run this in Supabase Dashboard > Storage > New Bucket
-- Name: documents
-- Public: false (we'll use authenticated access)

-- Or via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
