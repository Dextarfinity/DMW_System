-- Migration: Add abbreviation column to divisions table
-- Date: 2026-03-23

-- Step 1: Add the abbreviation column if it doesn't exist
ALTER TABLE divisions ADD COLUMN IF NOT EXISTS abbreviation VARCHAR(20);

-- Step 2: Update existing divisions with proper abbreviations based on full name
UPDATE divisions SET abbreviation = 'FAD' WHERE name ILIKE '%Finance%' OR name ILIKE '%Administrative%';
UPDATE divisions SET abbreviation = 'MWPTD' WHERE name ILIKE '%Protection%' AND name NOT ILIKE '%Processing%';
UPDATE divisions SET abbreviation = 'MWPSD' WHERE name ILIKE '%Processing%' OR (name ILIKE '%Service%' AND name NOT ILIKE '%Reintegration%' AND name NOT ILIKE '%Protection%');
UPDATE divisions SET abbreviation = 'WRSD' WHERE name ILIKE '%Welfare%' OR name ILIKE '%Reintegration%';
UPDATE divisions SET abbreviation = 'ORD' WHERE name ILIKE '%Director%' OR name ILIKE '%Regional%';

-- Verify result
SELECT id, abbreviation, name, description FROM divisions ORDER BY id;
