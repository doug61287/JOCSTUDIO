-- Supabase Schema for Dodge Campaign Email Tracking
-- Run this in Supabase SQL Editor to set up tables

-- ============================================
-- EMAIL SENDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  resend_id TEXT,
  email TEXT NOT NULL,
  campaign_step TEXT NOT NULL,
  subject TEXT,
  status TEXT DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  complained_at TIMESTAMPTZ,
  
  -- Engagement metrics
  open_count INTEGER DEFAULT 0,
  
  -- Error tracking
  bounce_type TEXT,
  bounce_message TEXT,
  error_message TEXT
);

-- Indexes for common queries
CREATE INDEX idx_email_sends_resend_id ON email_sends(resend_id);
CREATE INDEX idx_email_sends_company_id ON email_sends(company_id);
CREATE INDEX idx_email_sends_status ON email_sends(status);
CREATE INDEX idx_email_sends_created_at ON email_sends(created_at);
CREATE INDEX idx_email_sends_campaign_step ON email_sends(campaign_step);


-- ============================================
-- EMAIL EVENTS TABLE (detailed tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_email_events_resend_id ON email_events(resend_id);
CREATE INDEX idx_email_events_type ON email_events(event_type);


-- ============================================
-- EMAIL SUPPRESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_suppressions (
  email TEXT PRIMARY KEY,
  reason TEXT NOT NULL, -- 'bounce', 'complaint', 'unsubscribe'
  bounce_type TEXT,
  suppressed_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- ADD COLUMNS TO COMPANIES TABLE
-- ============================================
-- (Run these if columns don't exist)

ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_valid BOOLEAN DEFAULT TRUE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_bounce_reason TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS do_not_email BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS campaign_step TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS last_email_sent TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS last_clicked_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_send_count INTEGER DEFAULT 0;

-- Index for campaign queries
CREATE INDEX IF NOT EXISTS idx_companies_campaign ON companies(campaign_step, last_email_sent) 
WHERE email_valid = TRUE AND do_not_email = FALSE;


-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Increment open count
CREATE OR REPLACE FUNCTION increment_open_count()
RETURNS INTEGER AS $$
  SELECT COALESCE(open_count, 0) + 1
$$ LANGUAGE SQL;

-- Increment send count
CREATE OR REPLACE FUNCTION increment_send_count()
RETURNS INTEGER AS $$
  SELECT COALESCE(email_send_count, 0) + 1
$$ LANGUAGE SQL;


-- ============================================
-- ROW LEVEL SECURITY (optional)
-- ============================================

-- Enable RLS
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_suppressions ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access" ON email_sends
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON email_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON email_suppressions
  FOR ALL USING (auth.role() = 'service_role');
