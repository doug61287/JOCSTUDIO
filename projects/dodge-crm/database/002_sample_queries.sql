-- ============================================================
-- SAMPLE QUERIES FOR EMAIL SEGMENTATION
-- Dodge Construction Network Lead Generation
-- ============================================================

-- ============================================================
-- SEGMENT BY TRADE (CSI DIVISIONS)
-- ============================================================

-- Get all concrete contractors (Division 03)
SELECT c.*, ct.email, ct.full_name
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.is_primary = TRUE
WHERE 3 = ANY(c.csi_divisions)
AND ct.email IS NOT NULL
AND ct.email_opted_out = FALSE;

-- Get all electrical contractors (Division 26)
SELECT c.*, ct.email, ct.full_name
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.is_primary = TRUE
WHERE 26 = ANY(c.csi_divisions)
AND ct.email IS NOT NULL
AND ct.email_opted_out = FALSE;

-- Get all plumbing contractors (Division 22)
SELECT c.*, ct.email, ct.full_name
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.is_primary = TRUE
WHERE 22 = ANY(c.csi_divisions)
AND ct.email IS NOT NULL
AND ct.email_opted_out = FALSE;

-- Get all HVAC contractors (Division 23)
SELECT c.*, ct.email, ct.full_name
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.is_primary = TRUE
WHERE 23 = ANY(c.csi_divisions)
AND ct.email IS NOT NULL
AND ct.email_opted_out = FALSE;

-- Get contractors by multiple CSI divisions (concrete, masonry, steel)
SELECT c.*, ct.email, ct.full_name
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.is_primary = TRUE
WHERE c.csi_divisions && ARRAY[3, 4, 5]  -- Overlaps with any of these
AND ct.email IS NOT NULL
AND ct.email_opted_out = FALSE;

-- ============================================================
-- SEGMENT BY LOCATION
-- ============================================================

-- Get all Texas contractors
SELECT c.*, ct.email, ct.full_name
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.is_primary = TRUE
WHERE c.state = 'TX'
AND ct.email IS NOT NULL
AND ct.email_opted_out = FALSE;

-- Get contractors in multiple states (TX, CA, FL)
SELECT c.*, ct.email, ct.full_name
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.is_primary = TRUE
WHERE c.state IN ('TX', 'CA', 'FL')
AND ct.email IS NOT NULL
AND ct.email_opted_out = FALSE;

-- Get contractors by city
SELECT c.*, ct.email, ct.full_name
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.is_primary = TRUE
WHERE c.city = 'Houston'
AND c.state = 'TX'
AND ct.email IS NOT NULL
AND ct.email_opted_out = FALSE;

-- Get contractors within a region (multiple cities)
SELECT c.*, ct.email, ct.full_name
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.is_primary = TRUE
WHERE c.city IN ('Houston', 'Dallas', 'Austin', 'San Antonio')
AND c.state = 'TX'
AND ct.email IS NOT NULL
AND ct.email_opted_out = FALSE;

-- ============================================================
-- SEGMENT BY COMPANY TYPE
-- ============================================================

-- Get all subcontractors
SELECT c.*, ct.email, ct.full_name
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.is_primary = TRUE
WHERE c.type = 'subcontractors'
AND ct.email IS NOT NULL
AND ct.email_opted_out = FALSE;

-- Get all general contractors
SELECT c.*, ct.email, ct.full_name
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.is_primary = TRUE
WHERE c.type = 'general-contractors'
AND ct.email IS NOT NULL
AND ct.email_opted_out = FALSE;

-- Get material suppliers
SELECT c.*, ct.email, ct.full_name
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.is_primary = TRUE
WHERE c.type = 'material-suppliers'
AND ct.email IS NOT NULL
AND ct.email_opted_out = FALSE;

-- ============================================================
-- COMBINED SEGMENTATION
-- ============================================================

-- Texas concrete subcontractors
SELECT c.id, c.name, c.city, c.state, ct.email, ct.full_name
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.is_primary = TRUE
WHERE c.type = 'subcontractors'
AND c.state = 'TX'
AND 3 = ANY(c.csi_divisions)
AND ct.email IS NOT NULL
AND ct.email_opted_out = FALSE
ORDER BY c.city, c.name;

-- California electrical contractors
SELECT c.id, c.name, c.city, c.state, ct.email, ct.full_name
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.is_primary = TRUE
WHERE c.state = 'CA'
AND 26 = ANY(c.csi_divisions)
AND ct.email IS NOT NULL
AND ct.email_opted_out = FALSE
ORDER BY c.city, c.name;

-- Southeast GCs (FL, GA, NC, SC)
SELECT c.id, c.name, c.city, c.state, ct.email, ct.full_name
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.is_primary = TRUE
WHERE c.type = 'general-contractors'
AND c.state IN ('FL', 'GA', 'NC', 'SC')
AND ct.email IS NOT NULL
AND ct.email_opted_out = FALSE
ORDER BY c.state, c.city, c.name;

-- ============================================================
-- FULL-TEXT SEARCH SEGMENTATION
-- ============================================================

-- Search by keywords in company description
SELECT c.id, c.name, c.city, c.state, ct.email
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.is_primary = TRUE
WHERE c.search_vector @@ plainto_tsquery('english', 'commercial construction')
AND ct.email IS NOT NULL
AND ct.email_opted_out = FALSE;

-- Search by specific services
SELECT c.id, c.name, c.city, c.state, ct.email
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id AND ct.is_primary = TRUE
WHERE c.search_vector @@ plainto_tsquery('english', 'foundation slab')
AND ct.email IS NOT NULL
AND ct.email_opted_out = FALSE;

-- ============================================================
-- CAMPAIGN TARGETING EXAMPLES
-- ============================================================

-- Create segment for campaign targeting (returns IDs for campaign)
-- Example: HVAC contractors in Northeast states
WITH target_segment AS (
    SELECT c.id AS company_id, ct.id AS contact_id, ct.email, ct.full_name, c.name
    FROM companies c
    JOIN contacts ct ON ct.company_id = c.id
    WHERE 23 = ANY(c.csi_divisions)  -- HVAC
    AND c.state IN ('NY', 'NJ', 'PA', 'MA', 'CT')
    AND ct.email IS NOT NULL
    AND ct.email_opted_out = FALSE
    AND NOT EXISTS (
        -- Exclude those already in an active campaign
        SELECT 1 FROM email_sends es
        JOIN email_campaigns ec ON ec.id = es.campaign_id
        WHERE es.contact_id = ct.id
        AND ec.status IN ('sending', 'scheduled')
    )
)
SELECT * FROM target_segment;

-- Count potential recipients by segment
SELECT 
    c.state,
    c.type,
    COUNT(DISTINCT c.id) AS company_count,
    COUNT(DISTINCT ct.id) AS contact_count,
    COUNT(DISTINCT ct.email) AS unique_emails
FROM companies c
LEFT JOIN contacts ct ON ct.company_id = c.id
WHERE ct.email IS NOT NULL
AND ct.email_opted_out = FALSE
GROUP BY c.state, c.type
ORDER BY unique_emails DESC;

-- ============================================================
-- ENGAGEMENT-BASED SEGMENTATION
-- ============================================================

-- Contacts who opened but didn't reply (re-engagement opportunity)
SELECT DISTINCT 
    ct.id, ct.email, ct.full_name, c.name AS company_name
FROM contacts ct
JOIN email_sends es ON es.contact_id = ct.id
JOIN companies c ON c.id = ct.company_id
WHERE es.opened_at IS NOT NULL
AND es.replied_at IS NULL
AND ct.email_opted_out = FALSE;

-- Contacts who clicked links (high intent)
SELECT DISTINCT 
    ct.id, ct.email, ct.full_name, c.name AS company_name
FROM contacts ct
JOIN email_sends es ON es.contact_id = ct.id
JOIN companies c ON c.id = ct.company_id
WHERE es.clicked_at IS NOT NULL
AND ct.email_opted_out = FALSE;

-- Never emailed before
SELECT c.id, c.name, ct.email, ct.full_name
FROM companies c
JOIN contacts ct ON ct.company_id = c.id
WHERE ct.email IS NOT NULL
AND ct.email_opted_out = FALSE
AND NOT EXISTS (
    SELECT 1 FROM email_sends es WHERE es.contact_id = ct.id
);

-- ============================================================
-- ANALYTICS QUERIES
-- ============================================================

-- Campaign performance by company type
SELECT 
    c.type,
    ec.name AS campaign_name,
    COUNT(*) AS total_sent,
    SUM(CASE WHEN es.opened_at IS NOT NULL THEN 1 ELSE 0 END) AS opens,
    SUM(CASE WHEN es.clicked_at IS NOT NULL THEN 1 ELSE 0 END) AS clicks,
    SUM(CASE WHEN es.replied_at IS NOT NULL THEN 1 ELSE 0 END) AS replies,
    ROUND(100.0 * SUM(CASE WHEN es.opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS open_rate,
    ROUND(100.0 * SUM(CASE WHEN es.replied_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS reply_rate
FROM email_sends es
JOIN email_campaigns ec ON ec.id = es.campaign_id
JOIN contacts ct ON ct.id = es.contact_id
JOIN companies c ON c.id = ct.company_id
WHERE es.sent_at IS NOT NULL
GROUP BY c.type, ec.name
ORDER BY open_rate DESC;

-- Top performing states
SELECT 
    c.state,
    COUNT(DISTINCT es.id) AS emails_sent,
    SUM(CASE WHEN es.opened_at IS NOT NULL THEN 1 ELSE 0 END) AS opens,
    SUM(CASE WHEN es.replied_at IS NOT NULL THEN 1 ELSE 0 END) AS replies,
    ROUND(100.0 * SUM(CASE WHEN es.opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS open_rate
FROM email_sends es
JOIN contacts ct ON ct.id = es.contact_id
JOIN companies c ON c.id = ct.company_id
WHERE es.sent_at IS NOT NULL
AND c.state IS NOT NULL
GROUP BY c.state
HAVING COUNT(*) > 100
ORDER BY open_rate DESC
LIMIT 20;

-- CSI division performance
SELECT 
    unnest(c.csi_divisions) AS csi_division,
    COUNT(DISTINCT es.id) AS emails_sent,
    ROUND(100.0 * SUM(CASE WHEN es.opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS open_rate,
    ROUND(100.0 * SUM(CASE WHEN es.replied_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS reply_rate
FROM email_sends es
JOIN contacts ct ON ct.id = es.contact_id
JOIN companies c ON c.id = ct.company_id
WHERE es.sent_at IS NOT NULL
GROUP BY csi_division
HAVING COUNT(*) > 50
ORDER BY reply_rate DESC;

-- ============================================================
-- DATA EXPORT FOR EMAIL PLATFORMS
-- ============================================================

-- Export for Mailchimp/SendGrid (standard fields)
SELECT 
    ct.email AS EMAIL,
    ct.first_name AS FIRST_NAME,
    ct.last_name AS LAST_NAME,
    c.name AS COMPANY,
    c.city AS CITY,
    c.state AS STATE,
    c.type::TEXT AS COMPANY_TYPE,
    array_to_string(c.csi_divisions, ',') AS CSI_DIVISIONS,
    c.website AS WEBSITE
FROM companies c
JOIN contacts ct ON ct.company_id = c.id
WHERE ct.email IS NOT NULL
AND ct.email_opted_out = FALSE
AND c.state = 'TX'  -- Adjust segmentation
ORDER BY c.name;
