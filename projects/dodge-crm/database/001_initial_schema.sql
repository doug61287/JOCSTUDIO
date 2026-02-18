-- Dodge Construction Network Database Schema
-- Production-ready PostgreSQL schema for lead generation and CRM
-- Created: 2026-02-18
-- Compatible with: Supabase (PostgreSQL 15+)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE company_type AS ENUM (
    'subcontractors',
    'general-contractors',
    'material-suppliers',
    'manufacturers',
    'engineers',
    'architects',
    'vendor-services',
    'industry-organizations',
    'professional-field-services',
    'interior-designers',
    'corporate-services',
    'facility-managers-property-management'
);

CREATE TYPE lead_status AS ENUM (
    'new',
    'contacted',
    'qualified',
    'proposal',
    'negotiation',
    'won',
    'lost',
    'nurturing'
);

CREATE TYPE email_send_status AS ENUM (
    'pending',
    'sent',
    'delivered',
    'opened',
    'clicked',
    'replied',
    'bounced',
    'unsubscribed',
    'spam'
);

CREATE TYPE campaign_status AS ENUM (
    'draft',
    'scheduled',
    'sending',
    'completed',
    'paused',
    'cancelled'
);

CREATE TYPE task_status AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'cancelled'
);

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Companies (Contractors from Dodge/Blue Book)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(50) UNIQUE,  -- Blue Book ID (e.g., "1867834")
    slug VARCHAR(255),
    name VARCHAR(500) NOT NULL,
    type company_type,
    
    -- Contact info
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(500),
    
    -- Location (structured)
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'US',
    
    -- Full address (raw scraped)
    address_raw TEXT,
    
    -- Business details
    description TEXT,
    keywords TEXT[],
    logo_url VARCHAR(500),
    
    -- Trade classification
    csi_codes TEXT[],  -- Array of CSI code strings
    csi_divisions INTEGER[],  -- Extracted division numbers (03, 09, etc.)
    
    -- Metadata
    source VARCHAR(100) DEFAULT 'bluebook',
    source_url VARCHAR(500),
    scraped_at TIMESTAMPTZ,
    
    -- Company size indicators (for future enrichment)
    employee_count_range VARCHAR(50),  -- e.g., "1-10", "11-50", "51-200"
    annual_revenue_range VARCHAR(50),
    year_established INTEGER,
    
    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(array_to_string(keywords, ' '), '')), 'C')
    ) STORED
);

-- Contacts (People at companies)
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Name
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(255),
    
    -- Role
    title VARCHAR(255),
    department VARCHAR(100),
    
    -- Contact info
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    linkedin_url VARCHAR(500),
    
    -- Flags
    is_primary BOOLEAN DEFAULT FALSE,
    is_decision_maker BOOLEAN DEFAULT FALSE,
    
    -- Email preferences
    email_opted_out BOOLEAN DEFAULT FALSE,
    email_opt_out_date TIMESTAMPTZ,
    email_bounced BOOLEAN DEFAULT FALSE,
    
    -- Tracking
    source VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EMAIL CAMPAIGN TABLES
-- ============================================================

-- Campaign definitions
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Email content
    subject VARCHAR(500),
    preview_text VARCHAR(255),
    from_name VARCHAR(100),
    from_email VARCHAR(255),
    reply_to VARCHAR(255),
    
    -- Template (HTML/Text)
    html_template TEXT,
    text_template TEXT,
    
    -- Targeting (JSON for flexible segmentation)
    target_criteria JSONB,  -- e.g., {"types": ["subcontractors"], "states": ["TX", "CA"], "csi_divisions": [3, 9]}
    
    -- Status
    status campaign_status DEFAULT 'draft',
    
    -- Schedule
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Stats (denormalized for quick access)
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    replied_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    
    -- Rates (calculated)
    open_rate DECIMAL(5,2),
    click_rate DECIMAL(5,2),
    reply_rate DECIMAL(5,2),
    bounce_rate DECIMAL(5,2),
    
    -- Tracking
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual email sends
CREATE TABLE email_sends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    
    -- Recipient info (snapshot at send time)
    to_email VARCHAR(255) NOT NULL,
    to_name VARCHAR(255),
    
    -- Personalization data (JSON)
    merge_fields JSONB,
    
    -- Status tracking
    status email_send_status DEFAULT 'pending',
    
    -- Timestamps
    queued_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    
    -- Engagement metrics
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    
    -- Links clicked (JSON array)
    links_clicked JSONB,
    
    -- Error handling
    error_message TEXT,
    error_code VARCHAR(50),
    
    -- Email service provider tracking
    esp_message_id VARCHAR(255),
    esp_response JSONB,
    
    UNIQUE(campaign_id, contact_id)
);

-- ============================================================
-- CRM TABLES
-- ============================================================

-- Leads (Sales opportunities)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Lead info
    title VARCHAR(255),
    description TEXT,
    
    -- Status
    status lead_status DEFAULT 'new',
    
    -- Source tracking
    source VARCHAR(100),  -- e.g., 'email_campaign', 'website', 'referral'
    source_campaign_id UUID REFERENCES email_campaigns(id) ON DELETE SET NULL,
    source_details JSONB,
    
    -- Value
    estimated_value DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Assignment
    assigned_to UUID,  -- Future: references users table
    
    -- Probability
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    
    -- Dates
    expected_close_date DATE,
    actual_close_date DATE,
    
    -- Notes
    notes TEXT,
    
    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Last activity
    last_activity_at TIMESTAMPTZ,
    last_activity_type VARCHAR(100)
);

-- Tasks (Follow-ups, reminders)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Task details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Type
    task_type VARCHAR(50),  -- 'call', 'email', 'meeting', 'follow_up', 'other'
    
    -- Priority (1-5, 5 being highest)
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    
    -- Schedule
    due_date DATE,
    due_time TIME,
    reminder_at TIMESTAMPTZ,
    
    -- Status
    status task_status DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    
    -- Assignment
    assigned_to UUID,
    
    -- Tracking
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log (Audit trail)
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Polymorphic reference
    entity_type VARCHAR(50) NOT NULL,  -- 'company', 'contact', 'lead', 'task'
    entity_id UUID NOT NULL,
    
    -- Activity details
    activity_type VARCHAR(100) NOT NULL,  -- 'created', 'updated', 'email_sent', 'call', 'note'
    description TEXT,
    metadata JSONB,
    
    -- Actor
    performed_by UUID,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Companies
CREATE INDEX idx_companies_type ON companies(type);
CREATE INDEX idx_companies_state ON companies(state);
CREATE INDEX idx_companies_city ON companies(city);
CREATE INDEX idx_companies_external_id ON companies(external_id);
CREATE INDEX idx_companies_csi_divisions ON companies USING GIN(csi_divisions);
CREATE INDEX idx_companies_csi_codes ON companies USING GIN(csi_codes);
CREATE INDEX idx_companies_keywords ON companies USING GIN(keywords);
CREATE INDEX idx_companies_search ON companies USING GIN(search_vector);
CREATE INDEX idx_companies_created ON companies(created_at);

-- Contacts
CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_primary ON contacts(company_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_contacts_opted_out ON contacts(email_opted_out) WHERE email_opted_out = FALSE;

-- Email campaigns
CREATE INDEX idx_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_campaigns_scheduled ON email_campaigns(scheduled_at) WHERE status = 'scheduled';

-- Email sends
CREATE INDEX idx_sends_campaign ON email_sends(campaign_id);
CREATE INDEX idx_sends_contact ON email_sends(contact_id);
CREATE INDEX idx_sends_status ON email_sends(status);
CREATE INDEX idx_sends_email ON email_sends(to_email);
CREATE INDEX idx_sends_sent_at ON email_sends(sent_at);

-- Leads
CREATE INDEX idx_leads_company ON leads(company_id);
CREATE INDEX idx_leads_contact ON leads(contact_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);

-- Tasks
CREATE INDEX idx_tasks_lead ON tasks(lead_id);
CREATE INDEX idx_tasks_due ON tasks(due_date) WHERE status = 'pending';
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);

-- Activities
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_created ON activities(created_at);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_companies_timestamp
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contacts_timestamp
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_campaigns_timestamp
    BEFORE UPDATE ON email_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_leads_timestamp
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_timestamp
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to extract CSI division numbers from codes
CREATE OR REPLACE FUNCTION extract_csi_divisions(codes TEXT[])
RETURNS INTEGER[] AS $$
DECLARE
    result INTEGER[] := '{}';
    code TEXT;
    division INTEGER;
BEGIN
    FOREACH code IN ARRAY codes
    LOOP
        -- Extract first 2 digits from CSI code (e.g., "03 00 00" -> 3)
        division := NULLIF(REGEXP_REPLACE(code, '^(\d{2}).*', '\1'), '')::INTEGER;
        IF division IS NOT NULL AND NOT (division = ANY(result)) THEN
            result := array_append(result, division);
        END IF;
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update campaign stats
CREATE OR REPLACE FUNCTION update_campaign_stats(p_campaign_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE email_campaigns SET
        sent_count = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = p_campaign_id AND status != 'pending'),
        delivered_count = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = p_campaign_id AND delivered_at IS NOT NULL),
        opened_count = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = p_campaign_id AND opened_at IS NOT NULL),
        clicked_count = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = p_campaign_id AND clicked_at IS NOT NULL),
        replied_count = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = p_campaign_id AND replied_at IS NOT NULL),
        bounced_count = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = p_campaign_id AND status = 'bounced'),
        unsubscribed_count = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = p_campaign_id AND status = 'unsubscribed'),
        open_rate = CASE WHEN sent_count > 0 THEN (opened_count::DECIMAL / sent_count * 100) ELSE 0 END,
        click_rate = CASE WHEN opened_count > 0 THEN (clicked_count::DECIMAL / opened_count * 100) ELSE 0 END,
        reply_rate = CASE WHEN sent_count > 0 THEN (replied_count::DECIMAL / sent_count * 100) ELSE 0 END,
        bounce_rate = CASE WHEN sent_count > 0 THEN (bounced_count::DECIMAL / sent_count * 100) ELSE 0 END
    WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables (for Supabase auth integration)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Default policies (allow all for service role - adjust for production)
CREATE POLICY "Allow all for service role" ON companies FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON contacts FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON email_campaigns FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON email_sends FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON leads FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON activities FOR ALL USING (true);

-- ============================================================
-- VIEWS
-- ============================================================

-- Companies with primary contact
CREATE VIEW companies_with_contacts AS
SELECT 
    c.*,
    ct.full_name AS primary_contact_name,
    ct.email AS primary_contact_email,
    ct.phone AS primary_contact_phone,
    ct.title AS primary_contact_title
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.is_primary = TRUE;

-- Campaign performance summary
CREATE VIEW campaign_performance AS
SELECT 
    ec.*,
    COALESCE(ec.open_rate, 0) AS calculated_open_rate,
    COALESCE(ec.click_rate, 0) AS calculated_click_rate,
    COALESCE(ec.reply_rate, 0) AS calculated_reply_rate,
    COALESCE(ec.bounce_rate, 0) AS calculated_bounce_rate
FROM email_campaigns ec;

-- Lead pipeline summary
CREATE VIEW lead_pipeline AS
SELECT 
    status,
    COUNT(*) AS lead_count,
    SUM(estimated_value) AS total_value,
    AVG(probability) AS avg_probability
FROM leads
GROUP BY status;

COMMENT ON TABLE companies IS 'Contractor companies from Dodge/Blue Book network';
COMMENT ON TABLE contacts IS 'Individual contacts at companies';
COMMENT ON TABLE email_campaigns IS 'Email marketing campaign definitions';
COMMENT ON TABLE email_sends IS 'Individual email sends with tracking';
COMMENT ON TABLE leads IS 'Sales leads and opportunities';
COMMENT ON TABLE tasks IS 'Follow-up tasks and reminders';
COMMENT ON TABLE activities IS 'Activity log for audit trail';
