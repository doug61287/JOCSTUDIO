-- ============================================
-- Jacobi Medical Center - Fire Protection
-- Sample Project Seed Data for JOCHero Beta
-- ============================================

-- Create sample demo user for Jacobi project (if not exists)
INSERT INTO "User" (id, email, "passwordHash", name, role, "emailVerified", "createdAt", "updatedAt")
VALUES (
  'jacobi-demo-user-001',
  'jacobi-demo@jochero.dev',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4bA3kAu4F.V7YnHy', -- Demo1234!
  'Jacobi Demo User',
  'USER',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create sample organization for NYC HHC
INSERT INTO "Organization" (id, name, slug, plan, seats, "ownerId", "createdAt", "updatedAt")
VALUES (
  'nyc-hhc-org-001',
  'NYC Health + Hospitals',
  'nyc-hhc',
  'TEAM',
  25,
  'jacobi-demo-user-001',
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Create Jacobi Fire Protection Project
INSERT INTO "Project" (
  id, 
  name, 
  description, 
  status, 
  settings, 
  "ownerId", 
  "organizationId",
  "createdAt", 
  "updatedAt"
) VALUES (
  'jacobi-fp-sample-001',
  'Jacobi Medical Center - Fire Protection',
  'NYC HHC Fire Protection takeoff - 15th Floor renovation (SAMPLE DATA)',
  'IN_PROGRESS',
  '{
    "units": "imperial",
    "scale": {"value": 96, "unit": "inch"},
    "agency": "NYC HHC",
    "division": "21 - Fire Protection",
    "location": "Bronx, NY",
    "floor": "15th Floor",
    "is_demo": true,
    "coefficient": {
      "location": "Bronx (NYC HHC)",
      "value": 1.20
    }
  }',
  'jacobi-demo-user-001',
  'nyc-hhc-org-001',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  settings = EXCLUDED.settings,
  "updatedAt" = NOW();

-- Create Layers for Fire Protection categories
INSERT INTO "Layer" (id, name, color, visible, locked, "order", opacity, "projectId", "createdAt", "updatedAt")
VALUES
  ('jacobi-layer-sprinkler', 'Sprinkler Systems', '#DC2626', true, false, 0, 1.0, 'jacobi-fp-sample-001', NOW(), NOW()),
  ('jacobi-layer-piping', 'Piping', '#2563EB', true, false, 1, 1.0, 'jacobi-fp-sample-001', NOW(), NOW()),
  ('jacobi-layer-valves', 'Valves & Connections', '#7C3AED', true, false, 2, 1.0, 'jacobi-fp-sample-001', NOW(), NOW()),
  ('jacobi-layer-alarm', 'Fire Alarm', '#F97316', true, false, 3, 1.0, 'jacobi-fp-sample-001', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Measurements
INSERT INTO "Measurement" (id, type, label, color, geometry, quantity, unit, "projectId", "layerId", "createdById", "createdAt", "updatedAt")
VALUES
  -- Sprinkler Heads (Pendant)
  ('jacobi-meas-001', 'COUNT', 'Sprinkler Heads (Pendant)', '#DC2626', '{"points": [], "pageIndex": 0}', 47, 'EA', 'jacobi-fp-sample-001', 'jacobi-layer-sprinkler', 'jacobi-demo-user-001', NOW(), NOW()),
  -- Sprinkler Heads (Upright)
  ('jacobi-meas-002', 'COUNT', 'Sprinkler Heads (Upright)', '#DC2626', '{"points": [], "pageIndex": 0}', 12, 'EA', 'jacobi-fp-sample-001', 'jacobi-layer-sprinkler', 'jacobi-demo-user-001', NOW(), NOW()),
  -- Main Run Pipe
  ('jacobi-meas-003', 'LENGTH', 'Main Run Pipe 3/4" BI', '#2563EB', '{"points": [], "pageIndex": 0}', 234, 'LF', 'jacobi-fp-sample-001', 'jacobi-layer-piping', 'jacobi-demo-user-001', NOW(), NOW()),
  -- Branch Line
  ('jacobi-meas-004', 'LENGTH', 'Branch Line 1/2" BI', '#3B82F6', '{"points": [], "pageIndex": 0}', 456, 'LF', 'jacobi-fp-sample-001', 'jacobi-layer-piping', 'jacobi-demo-user-001', NOW(), NOW()),
  -- OS&Y Valve
  ('jacobi-meas-005', 'COUNT', 'OS&Y Valve 6"', '#7C3AED', '{"points": [], "pageIndex": 0}', 2, 'EA', 'jacobi-fp-sample-001', 'jacobi-layer-valves', 'jacobi-demo-user-001', NOW(), NOW()),
  -- Butterfly Valve
  ('jacobi-meas-006', 'COUNT', 'Butterfly Valve 4"', '#7C3AED', '{"points": [], "pageIndex": 0}', 4, 'EA', 'jacobi-fp-sample-001', 'jacobi-layer-valves', 'jacobi-demo-user-001', NOW(), NOW()),
  -- Inspector's Test Connection
  ('jacobi-meas-007', 'COUNT', 'Inspectors Test Connection', '#7C3AED', '{"points": [], "pageIndex": 0}', 4, 'EA', 'jacobi-fp-sample-001', 'jacobi-layer-valves', 'jacobi-demo-user-001', NOW(), NOW()),
  -- Fire Alarm Pull Station
  ('jacobi-meas-008', 'COUNT', 'Fire Alarm Pull Station', '#EF4444', '{"points": [], "pageIndex": 0}', 8, 'EA', 'jacobi-fp-sample-001', 'jacobi-layer-alarm', 'jacobi-demo-user-001', NOW(), NOW()),
  -- Smoke Detector
  ('jacobi-meas-009', 'COUNT', 'Smoke Detector', '#F97316', '{"points": [], "pageIndex": 0}', 24, 'EA', 'jacobi-fp-sample-001', 'jacobi-layer-alarm', 'jacobi-demo-user-001', NOW(), NOW()),
  -- Horn/Strobe Combo
  ('jacobi-meas-010', 'COUNT', 'Horn/Strobe Combo', '#F59E0B', '{"points": [], "pageIndex": 0}', 16, 'EA', 'jacobi-fp-sample-001', 'jacobi-layer-alarm', 'jacobi-demo-user-001', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert JOC Line Items with pricing (coefficient applied: 1.20)
INSERT INTO "JOCLineItem" (id, "upbCode", description, quantity, unit, "unitPrice", "totalPrice", coefficients, notes, "measurementId", "createdById", "createdAt", "updatedAt")
VALUES
  ('jacobi-joc-001', '21 10 00.10 0100', 'Sprinkler Head, Pendant, 1/2" NPT, Quick Response', 47, 'EA', 45.00, 2538.00, '{"location": 1.20}', 'Standard pendant heads for office areas', 'jacobi-meas-001', 'jacobi-demo-user-001', NOW(), NOW()),
  ('jacobi-joc-002', '21 10 00.10 0200', 'Sprinkler Head, Upright, 1/2" NPT, Standard Response', 12, 'EA', 48.00, 691.20, '{"location": 1.20}', 'Upright heads for mechanical rooms', 'jacobi-meas-002', 'jacobi-demo-user-001', NOW(), NOW()),
  ('jacobi-joc-003', '21 10 00.20 0300', 'Pipe, Black Iron, 3/4", Schedule 40, Threaded', 234, 'LF', 8.50, 2386.80, '{"location": 1.20}', 'Main run distribution', 'jacobi-meas-003', 'jacobi-demo-user-001', NOW(), NOW()),
  ('jacobi-joc-004', '21 10 00.20 0200', 'Pipe, Black Iron, 1/2", Schedule 40, Threaded', 456, 'LF', 6.25, 3420.00, '{"location": 1.20}', 'Branch lines to heads', 'jacobi-meas-004', 'jacobi-demo-user-001', NOW(), NOW()),
  ('jacobi-joc-005', '21 20 00.10 0600', 'Valve, OS&Y, 6", Flanged, 175 PSI', 2, 'EA', 750.00, 1800.00, '{"location": 1.20}', 'Main control valves', 'jacobi-meas-005', 'jacobi-demo-user-001', NOW(), NOW()),
  ('jacobi-joc-006', '21 20 00.10 0400', 'Valve, Butterfly, 4", Grooved, Supervised', 4, 'EA', 425.00, 2040.00, '{"location": 1.20}', 'Zone isolation valves', 'jacobi-meas-006', 'jacobi-demo-user-001', NOW(), NOW()),
  ('jacobi-joc-007', '21 20 00.20 0100', 'Inspector Test Connection, 1", w/Sight Glass', 4, 'EA', 120.00, 576.00, '{"location": 1.20}', 'Per zone test connections', 'jacobi-meas-007', 'jacobi-demo-user-001', NOW(), NOW()),
  ('jacobi-joc-008', '21 30 00.10 0100', 'Pull Station, Manual, Single Action, Red', 8, 'EA', 85.00, 816.00, '{"location": 1.20}', 'At exits and stairwells', 'jacobi-meas-008', 'jacobi-demo-user-001', NOW(), NOW()),
  ('jacobi-joc-009', '21 30 00.20 0100', 'Smoke Detector, Photoelectric, Ceiling Mount', 24, 'EA', 65.00, 1872.00, '{"location": 1.20}', 'Office and corridor coverage', 'jacobi-meas-009', 'jacobi-demo-user-001', NOW(), NOW()),
  ('jacobi-joc-010', '21 30 00.30 0100', 'Horn/Strobe, Wall Mount, 24VDC, Red', 16, 'EA', 95.00, 1824.00, '{"location": 1.20}', 'ADA compliant notification', 'jacobi-meas-010', 'jacobi-demo-user-001', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add Division 21 UPB Catalog entries
INSERT INTO "UPBCatalog" (id, "contractType", division, category, "lineNumber", description, unit, "basePrice", version, "effectiveDate", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'NYC_HHC', '21', 'Fire Suppression', '21 10 00.10 0100', 'Sprinkler Head, Pendant, 1/2" NPT, Quick Response', 'EA', 45.00, '2024', '2024-01-01', NOW(), NOW()),
  (gen_random_uuid(), 'NYC_HHC', '21', 'Fire Suppression', '21 10 00.10 0200', 'Sprinkler Head, Upright, 1/2" NPT, Standard Response', 'EA', 48.00, '2024', '2024-01-01', NOW(), NOW()),
  (gen_random_uuid(), 'NYC_HHC', '21', 'Fire Suppression', '21 10 00.20 0200', 'Pipe, Black Iron, 1/2", Schedule 40, Threaded', 'LF', 6.25, '2024', '2024-01-01', NOW(), NOW()),
  (gen_random_uuid(), 'NYC_HHC', '21', 'Fire Suppression', '21 10 00.20 0300', 'Pipe, Black Iron, 3/4", Schedule 40, Threaded', 'LF', 8.50, '2024', '2024-01-01', NOW(), NOW()),
  (gen_random_uuid(), 'NYC_HHC', '21', 'Fire Suppression', '21 20 00.10 0400', 'Valve, Butterfly, 4", Grooved, Supervised', 'EA', 425.00, '2024', '2024-01-01', NOW(), NOW()),
  (gen_random_uuid(), 'NYC_HHC', '21', 'Fire Suppression', '21 20 00.10 0600', 'Valve, OS&Y, 6", Flanged, 175 PSI', 'EA', 750.00, '2024', '2024-01-01', NOW(), NOW()),
  (gen_random_uuid(), 'NYC_HHC', '21', 'Fire Suppression', '21 20 00.20 0100', 'Inspector Test Connection, 1", w/Sight Glass', 'EA', 120.00, '2024', '2024-01-01', NOW(), NOW()),
  (gen_random_uuid(), 'NYC_HHC', '21', 'Fire Alarm', '21 30 00.10 0100', 'Pull Station, Manual, Single Action, Red', 'EA', 85.00, '2024', '2024-01-01', NOW(), NOW()),
  (gen_random_uuid(), 'NYC_HHC', '21', 'Fire Alarm', '21 30 00.20 0100', 'Smoke Detector, Photoelectric, Ceiling Mount', 'EA', 65.00, '2024', '2024-01-01', NOW(), NOW()),
  (gen_random_uuid(), 'NYC_HHC', '21', 'Fire Alarm', '21 30 00.30 0100', 'Horn/Strobe, Wall Mount, 24VDC, Red', 'EA', 95.00, '2024', '2024-01-01', NOW(), NOW())
ON CONFLICT ("contractType", "lineNumber", version) DO NOTHING;

-- Summary comment
-- Total measurements: 10 items
-- Subtotal (before coefficient): $14,970.00
-- Location Coefficient: 1.20 (Bronx, NYC HHC)
-- Adjusted Total: $17,964.00
