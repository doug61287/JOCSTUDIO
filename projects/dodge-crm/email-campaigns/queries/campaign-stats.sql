-- Campaign Dashboard Queries for Dodge Construction Network
-- Run these in Supabase SQL Editor or connect via any SQL client

-- ============================================
-- 1. OVERALL CAMPAIGN METRICS
-- ============================================

-- Daily send summary
SELECT 
  DATE(created_at) as send_date,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
  COUNT(*) FILTER (WHERE status = 'opened') as opened,
  COUNT(*) FILTER (WHERE status = 'clicked') as clicked,
  COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
  COUNT(*) FILTER (WHERE status = 'complained') as complaints,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'opened') / NULLIF(COUNT(*) FILTER (WHERE status = 'delivered'), 0), 2) as open_rate,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'clicked') / NULLIF(COUNT(*) FILTER (WHERE status = 'opened'), 0), 2) as click_rate
FROM email_sends
GROUP BY DATE(created_at)
ORDER BY send_date DESC
LIMIT 30;


-- ============================================
-- 2. SEQUENCE STEP PERFORMANCE
-- ============================================

-- Performance by campaign step
SELECT 
  campaign_step,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
  COUNT(*) FILTER (WHERE status = 'opened') as opened,
  COUNT(*) FILTER (WHERE status = 'clicked') as clicked,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'opened') / NULLIF(COUNT(*) FILTER (WHERE status = 'delivered'), 0), 2) as open_rate_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'clicked') / NULLIF(COUNT(*) FILTER (WHERE status = 'opened'), 0), 2) as click_to_open_pct
FROM email_sends
WHERE status != 'failed'
GROUP BY campaign_step
ORDER BY 
  CASE campaign_step 
    WHEN 'initial' THEN 1 
    WHEN 'followup1' THEN 2 
    WHEN 'followup2' THEN 3 
  END;


-- ============================================
-- 3. ENGAGEMENT FUNNEL
-- ============================================

-- Full funnel from send to click
WITH funnel AS (
  SELECT
    COUNT(DISTINCT company_id) as companies_contacted,
    COUNT(DISTINCT company_id) FILTER (WHERE status IN ('delivered', 'opened', 'clicked')) as delivered,
    COUNT(DISTINCT company_id) FILTER (WHERE status IN ('opened', 'clicked')) as opened,
    COUNT(DISTINCT company_id) FILTER (WHERE status = 'clicked') as clicked
  FROM email_sends
)
SELECT 
  companies_contacted,
  delivered,
  opened,
  clicked,
  ROUND(100.0 * delivered / NULLIF(companies_contacted, 0), 1) as delivery_rate,
  ROUND(100.0 * opened / NULLIF(delivered, 0), 1) as open_rate,
  ROUND(100.0 * clicked / NULLIF(opened, 0), 1) as click_rate,
  ROUND(100.0 * clicked / NULLIF(companies_contacted, 0), 1) as overall_conversion
FROM funnel;


-- ============================================
-- 4. BOUNCES & SUPPRESSIONS
-- ============================================

-- Bounce analysis
SELECT 
  bounce_type,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as pct
FROM email_sends
WHERE status = 'bounced'
GROUP BY bounce_type
ORDER BY count DESC;

-- Suppression list summary
SELECT 
  reason,
  COUNT(*) as count,
  MIN(suppressed_at) as first_suppression,
  MAX(suppressed_at) as latest_suppression
FROM email_suppressions
GROUP BY reason;


-- ============================================
-- 5. REGIONAL PERFORMANCE
-- ============================================

-- Performance by region
SELECT 
  c.region,
  COUNT(DISTINCT e.company_id) as companies_emailed,
  COUNT(*) FILTER (WHERE e.status = 'opened') as opens,
  COUNT(*) FILTER (WHERE e.status = 'clicked') as clicks,
  ROUND(100.0 * COUNT(*) FILTER (WHERE e.status = 'opened') / NULLIF(COUNT(*), 0), 1) as open_rate
FROM email_sends e
JOIN companies c ON e.company_id = c.id
GROUP BY c.region
ORDER BY open_rate DESC;


-- ============================================
-- 6. HOURLY ENGAGEMENT PATTERNS
-- ============================================

-- Best time to send (based on opens)
SELECT 
  EXTRACT(HOUR FROM opened_at) as hour_utc,
  COUNT(*) as opens
FROM email_sends
WHERE opened_at IS NOT NULL
GROUP BY EXTRACT(HOUR FROM opened_at)
ORDER BY opens DESC;


-- ============================================
-- 7. TOP ENGAGED COMPANIES
-- ============================================

-- Companies that clicked (hot leads!)
SELECT 
  c.company_name,
  c.contact_name,
  c.email,
  c.region,
  c.project_count,
  e.clicked_at,
  e.campaign_step
FROM email_sends e
JOIN companies c ON e.company_id = c.id
WHERE e.status = 'clicked'
ORDER BY e.clicked_at DESC
LIMIT 50;


-- ============================================
-- 8. COMPANIES READY FOR NEXT STEP
-- ============================================

-- Ready for followup1 (3+ days since initial, no engagement)
SELECT 
  c.id,
  c.company_name,
  c.email,
  c.last_email_sent
FROM companies c
WHERE c.campaign_step = 'initial'
  AND c.last_email_sent < NOW() - INTERVAL '3 days'
  AND c.do_not_email = FALSE
  AND NOT EXISTS (
    SELECT 1 FROM email_sends e 
    WHERE e.company_id = c.id 
    AND (e.status = 'opened' OR e.status = 'clicked')
  )
ORDER BY c.last_email_sent
LIMIT 100;


-- ============================================
-- 9. HEALTH CHECK
-- ============================================

-- Email health metrics
SELECT 
  COUNT(*) as total_sends,
  COUNT(*) FILTER (WHERE status = 'bounced') as bounces,
  COUNT(*) FILTER (WHERE status = 'complained') as complaints,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'bounced') / NULLIF(COUNT(*), 0), 2) as bounce_rate_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'complained') / NULLIF(COUNT(*), 0), 3) as complaint_rate_pct,
  CASE 
    WHEN COUNT(*) FILTER (WHERE status = 'complained') * 1.0 / NULLIF(COUNT(*), 0) > 0.001 
    THEN '⚠️ HIGH - Review content'
    WHEN COUNT(*) FILTER (WHERE status = 'bounced') * 1.0 / NULLIF(COUNT(*), 0) > 0.05 
    THEN '⚠️ HIGH BOUNCES - Clean list'
    ELSE '✅ HEALTHY'
  END as health_status
FROM email_sends
WHERE created_at > NOW() - INTERVAL '7 days';
