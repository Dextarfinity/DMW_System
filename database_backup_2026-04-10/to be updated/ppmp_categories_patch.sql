-- ============================================================================
-- PATCH: Seed all 9 PPMP categories into ppmp_categories table
-- Safe to run multiple times (ON CONFLICT DO UPDATE)
-- ============================================================================

BEGIN;

-- Ensure unique constraints exist for ON CONFLICT to work
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_ppmp_sections_name') THEN
    ALTER TABLE ppmp_sections ADD CONSTRAINT uq_ppmp_sections_name UNIQUE (name);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_ppmp_categories_name') THEN
    ALTER TABLE ppmp_categories ADD CONSTRAINT uq_ppmp_categories_name UNIQUE (name);
  END IF;
END $$;

-- Ensure sections exist
INSERT INTO ppmp_sections (name, description, display_order, is_active) VALUES
  ('MOOE',          'Maintenance and Other Operating Expenses', 1, true),
  ('Capital Outlay','Capital Outlay',                           2, true),
  ('Semi-Expendable','Semi-Expendable Equipment',               3, true)
ON CONFLICT (name) DO NOTHING;

-- Seed the 9 categories from the screenshot
-- Assigns each to the correct section
WITH s AS (
  SELECT id, name FROM ppmp_sections
)
INSERT INTO ppmp_categories (name, section_id, display_order, is_active)
SELECT cat.name, s.id, cat.ord, true
FROM (VALUES
  ('ICT OFFICE SUPPLIES EXPENSES',               'MOOE',           1),
  ('OFFICE SUPPLIES EXPENSES',                   'MOOE',           2),
  ('SEMI-ICT EQUIPMENT',                         'Semi-Expendable', 3),
  ('PRINTING, PUBLICATION AND BINDING EXPENSES', 'MOOE',           4),
  ('SEMI-OFFICE EQUIPMENT',                      'Semi-Expendable', 5),
  ('SEMI-FURNITURE & FIXTURES',                  'Semi-Expendable', 6),
  ('OTHER SUPPLIES AND MATERIALS',               'MOOE',           7),
  ('OTHER MOOE',                                 'MOOE',           8),
  ('REPRESENTATION EXPENSES',                    'MOOE',           9)
) AS cat(name, section_name, ord)
JOIN s ON s.name = cat.section_name
ON CONFLICT (name) DO UPDATE SET
  section_id    = EXCLUDED.section_id,
  display_order = EXCLUDED.display_order,
  is_active     = true;

COMMIT;

-- Verify
SELECT pc.id, pc.name, ps.name AS section, pc.display_order
FROM ppmp_categories pc
JOIN ppmp_sections ps ON ps.id = pc.section_id
WHERE pc.is_active = true
ORDER BY pc.display_order, pc.name;
