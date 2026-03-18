-- ============================================================
-- MIGRATION SCRIPT: Create PPMP Categories and Sections Tables
-- Version: 1.0
-- Date: March 2026
-- Description: Creates database tables for PPMP categories and sections
--              replacing hardcoded filter values. Seeds with new category list.
-- ============================================================

-- ============================================================
-- 1. CREATE PPMP_SECTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS ppmp_sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ppmp_sections_name ON ppmp_sections(name);
CREATE INDEX IF NOT EXISTS idx_ppmp_sections_active ON ppmp_sections(is_active);

-- ============================================================
-- 2. CREATE PPMP_CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS ppmp_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    section_id INT NOT NULL REFERENCES ppmp_sections(id) ON DELETE RESTRICT,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ppmp_categories_name ON ppmp_categories(name);
CREATE INDEX IF NOT EXISTS idx_ppmp_categories_section ON ppmp_categories(section_id);
CREATE INDEX IF NOT EXISTS idx_ppmp_categories_active ON ppmp_categories(is_active);

-- ============================================================
-- 3. SEED PPMP_SECTIONS TABLE
-- ============================================================
INSERT INTO ppmp_sections (name, description, display_order, is_active) VALUES
('OFFICE OPERATION', 'Office supplies, stationery, and operational expenses', 1, TRUE),
('SEMI-FURNITURE & FIXTURES', 'Semi-furniture, fixtures, and office equipment', 2, TRUE),
('MOOE', 'Maintenance and Other Operating Expenses', 3, TRUE),
('SPECIAL PROCUREMENT', 'Representation, printing, and specialized procurement', 4, TRUE),
('TRAINING AND ACTIVITIES', 'Training programs, seminars, conferences, and related activities', 5, TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 4. SEED PPMP_CATEGORIES TABLE (NEW CATEGORIES)
-- ============================================================
-- Insert new categories with appropriate section mappings
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
-- 5. VERIFY DATA INSERTION
-- ============================================================
-- Run these queries to verify:
-- SELECT * FROM ppmp_sections;
-- SELECT pc.id, pc.name, ps.name as section_name FROM ppmp_categories pc JOIN ppmp_sections ps ON pc.section_id = ps.id;
