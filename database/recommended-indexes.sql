-- ============================================
-- RECOMMENDED DATABASE INDEXES
-- ============================================
-- Apply these indexes in Supabase SQL Editor to improve query performance
-- Run each CREATE INDEX statement individually
-- ============================================

-- ==========================================
-- JOBS TABLE INDEXES
-- ==========================================

-- Index for filtering jobs by status (used in dashboard, job list)
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- Index for filtering jobs by scheduled date (used in calendar, dashboard date filtering)
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);

-- Index for filtering jobs by customer (used when viewing customer jobs)
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);

-- Composite index for common query patterns (status + date)
CREATE INDEX IF NOT EXISTS idx_jobs_status_scheduled_date ON jobs(status, scheduled_date);

-- Index for sorting by created_at (used in dashboard, job list ordering)
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Index for job type filtering (used in reports by service)
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);

-- ==========================================
-- INVOICES TABLE INDEXES
-- ==========================================

-- Index for filtering invoices by status (used in dashboard, invoice list)
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Index for sorting invoices by created date
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- Index for filtering invoices by job (used when viewing job invoices)
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON invoices(job_id);

-- Index for filtering invoices by customer
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);

-- Composite index for payment tracking (status + due date for overdue queries)
CREATE INDEX IF NOT EXISTS idx_invoices_status_due_date ON invoices(status, due_date);

-- ==========================================
-- CUSTOMERS TABLE INDEXES
-- ==========================================

-- Index for searching customers by name
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- Index for sorting customers by total spent (used in top customers)
CREATE INDEX IF NOT EXISTS idx_customers_total_spent ON customers(total_spent_cents DESC);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Index for phone lookups
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- ==========================================
-- EXPENSES TABLE INDEXES
-- ==========================================

-- Index for filtering expenses by category
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Index for filtering expenses by date (used in reports, dashboard)
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date DESC);

-- Composite index for category reports within date range
CREATE INDEX IF NOT EXISTS idx_expenses_date_category ON expenses(expense_date, category);

-- ==========================================
-- DOCUMENTS TABLE INDEXES (if applicable)
-- ==========================================

-- Index for filtering documents by job
CREATE INDEX IF NOT EXISTS idx_documents_job_id ON documents(job_id);

-- Index for filtering documents by customer
CREATE INDEX IF NOT EXISTS idx_documents_customer_id ON documents(customer_id);

-- Index for document type filtering
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);

-- ==========================================
-- PERFORMANCE MONITORING QUERIES
-- ==========================================
-- Run these to verify indexes are being used:

-- Check index usage statistics
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan DESC;

-- Find slow queries (requires pg_stat_statements extension)
-- SELECT query, calls, mean_time, max_time, total_time
-- FROM pg_stat_statements
-- WHERE mean_time > 100
-- ORDER BY mean_time DESC
-- LIMIT 20;

-- Check table sizes and row counts
-- SELECT relname, n_live_tup, n_dead_tup, last_vacuum, last_autovacuum
-- FROM pg_stat_user_tables
-- ORDER BY n_live_tup DESC;
