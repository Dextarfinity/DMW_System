-- ============================================================
-- SEED SCRIPT: Populate PPMP Categories and Sections
-- Version: 1.0
-- Date: March 2026
-- Description: Seeds ppmp_sections and ppmp_categories tables
--              with the new category structure
-- ============================================================

-- Clear existing data to ensure clean state
DELETE FROM ppmp_categories;
DELETE FROM ppmp_sections;

-- ============================================================
-- SEED PPMP_SECTIONS TABLE
-- ============================================================
INSERT INTO ppmp_sections (name, description, display_order, is_active) VALUES
('OFFICE OPERATION', 'Office supplies, stationery, and operational expenses', 1, TRUE),
('SEMI-FURNITURE & FIXTURES', 'Semi-furniture, fixtures, and office equipment', 2, TRUE),
('MOOE', 'Maintenance and Other Operating Expenses', 3, TRUE),
('SPECIAL PROCUREMENT', 'Representation, printing, and specialized procurement', 4, TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED PPMP_CATEGORIES TABLE (NEW CATEGORIES)
-- ============================================================
INSERT INTO ppmp_categories (name, section_id, description, display_order, is_active) VALUES
-- OFFICE OPERATION section
('ICT OFFICE SUPPLIES EXPENSES', (SELECT id FROM ppmp_sections WHERE name='OFFICE OPERATION'), 'IT and office supplies expenses', 1, TRUE),
('OFFICE SUPPLIES EXPENSES', (SELECT id FROM ppmp_sections WHERE name='OFFICE OPERATION'), 'General office supplies and materials', 2, TRUE),
('SEMI-ICT EQUIPMENT', (SELECT id FROM ppmp_sections WHERE name='OFFICE OPERATION'), 'Semi-finished IT equipment and accessories', 3, TRUE),
('PRINTING, PUBLICATION AND BINDING EXPENSES', (SELECT id FROM ppmp_sections WHERE name='OFFICE OPERATION'), 'Printing, publication, and binding services', 4, TRUE),

-- SEMI-FURNITURE & FIXTURES section
('SEMI-OFFICE EQUIPMENT', (SELECT id FROM ppmp_sections WHERE name='SEMI-FURNITURE & FIXTURES'), 'Semi-finished office equipment and machinery', 5, TRUE),
('SEMI-FURNITURE & FIXTURES', (SELECT id FROM ppmp_sections WHERE name='SEMI-FURNITURE & FIXTURES'), 'Furniture, fixtures, and related items', 6, TRUE),

-- MOOE section
('OTHER SUPPLIES AND MATERIALS', (SELECT id FROM ppmp_sections WHERE name='MOOE'), 'Miscellaneous supplies and materials', 7, TRUE),
('OTHER MOOE', (SELECT id FROM ppmp_sections WHERE name='MOOE'), 'Other maintenance and operating expenses', 8, TRUE),

-- SPECIAL PROCUREMENT section
('REPRESENTATION EXPENSES', (SELECT id FROM ppmp_sections WHERE name='SPECIAL PROCUREMENT'), 'Representation and hospitality expenses', 9, TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- VERIFY DATA INSERTION
-- ============================================================
SELECT 'Sections Created:' as status, COUNT(*) as count FROM ppmp_sections;
SELECT 'Categories Created:' as status, COUNT(*) as count FROM ppmp_categories;

-- ============================================================
-- DISPLAY CATEGORY MAPPING
-- ============================================================
-- SELECT 
--     ps.name as section, 
--     pc.name as category,
--     pc.display_order
-- FROM ppmp_categories pc
-- JOIN ppmp_sections ps ON pc.section_id = ps.id
-- ORDER BY ps.display_order, pc.display_order;
