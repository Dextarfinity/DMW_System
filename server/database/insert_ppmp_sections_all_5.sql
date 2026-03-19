-- ============================================================
-- INSERT ALL 5 PPMP SECTIONS
-- Date: March 16, 2026
-- Description: Inserts complete set of PPMP sections including new TRAINING AND ACTIVITIES
-- ============================================================

-- Insert all 5 sections, updating if they already exist
INSERT INTO ppmp_sections (name, description, display_order, is_active, created_at, updated_at) VALUES
('OFFICE OPERATION', 'Office supplies, stationery, and operational expenses', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('SEMI-FURNITURE & FIXTURES', 'Semi-furniture, fixtures, and office equipment', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MOOE', 'Maintenance and Other Operating Expenses', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('SPECIAL PROCUREMENT', 'Representation, printing, and specialized procurement', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('TRAINING AND ACTIVITIES', 'Training programs, seminars, conferences, and related activities', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;

-- Verify insertion
SELECT id, name, description, display_order, is_active FROM ppmp_sections ORDER BY display_order;
