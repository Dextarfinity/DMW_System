-- ============================================================================
-- FIX SCRIPT: Correct Section Assignments for WRSD PPMP Entries
-- Issue: Duplicate "TRAINING AND ACTIVITIES" sections appearing in PPMP table
-- Date: March 27, 2026
-- ============================================================================

BEGIN;

-- Step 1: Diagnostic - View current state of affected PPMP entries
SELECT ppmp_no, section, category, description, total_amount
FROM procurementplans
WHERE ppmp_no IN (
  'PPMP-WRSD-2026-001',
  'PPMP-WRSD-2026-003',
  'PPMP-WRSD-2026-004',
  'PPMP-WRSD-2026-005',
  'PPMP-WRSD-2026-006'
)
ORDER BY ppmp_no;

-- Step 2: Show all unique section values for WRSD to identify duplicates
SELECT section, COUNT(*) as item_count
FROM procurementplans
WHERE ppmp_no LIKE 'PPMP-WRSD%'
GROUP BY section
ORDER BY section;

-- ============================================================================
-- Step 3: FIX - Update section values to correct assignments
-- Based on WRSD PPMP Excel source data:
-- ============================================================================

-- PPMP-WRSD-2026-001: ICT Office Supplies (Printer Inks) -> OFFICE OPERATION
UPDATE procurementplans
SET section = 'OFFICE OPERATION',
    category = 'ICT OFFICE SUPPLIES EXPENSES',
    updated_at = CURRENT_TIMESTAMP
WHERE ppmp_no = 'PPMP-WRSD-2026-001';

-- PPMP-WRSD-2026-003: Semi-Expendable Office Equipment -> SEMI-FURNITURE & FIXTURES
UPDATE procurementplans
SET section = 'SEMI-FURNITURE & FIXTURES',
    category = 'SEMI-OFFICE EQUIPMENT',
    updated_at = CURRENT_TIMESTAMP
WHERE ppmp_no = 'PPMP-WRSD-2026-003';

-- PPMP-WRSD-2026-004: Semi-Expendable ICT Equipment -> SEMI-FURNITURE & FIXTURES
UPDATE procurementplans
SET section = 'SEMI-FURNITURE & FIXTURES',
    category = 'SEMI-ICT EQUIPMENT',
    updated_at = CURRENT_TIMESTAMP
WHERE ppmp_no = 'PPMP-WRSD-2026-004';

-- PPMP-WRSD-2026-005: Other Supplies and Materials -> MOOE
UPDATE procurementplans
SET section = 'MOOE',
    category = 'OTHER SUPPLIES AND MATERIALS',
    updated_at = CURRENT_TIMESTAMP
WHERE ppmp_no = 'PPMP-WRSD-2026-005';

-- PPMP-WRSD-2026-006: Capability Building Program (CAMP/DZMW Kids) -> TRAINING AND ACTIVITIES
UPDATE procurementplans
SET section = 'TRAINING AND ACTIVITIES',
    category = 'TRAINING AND ACTIVITIES',
    updated_at = CURRENT_TIMESTAMP
WHERE ppmp_no = 'PPMP-WRSD-2026-006';

-- ============================================================================
-- Step 4: Normalize any duplicate section names (case/whitespace issues)
-- ============================================================================

-- Fix any "Training and Activities" (wrong case) to "TRAINING AND ACTIVITIES"
UPDATE procurementplans
SET section = 'TRAINING AND ACTIVITIES'
WHERE UPPER(TRIM(section)) = 'TRAINING AND ACTIVITIES'
  AND section != 'TRAINING AND ACTIVITIES';

-- Fix any trailing/leading whitespace in all sections
UPDATE procurementplans
SET section = TRIM(section)
WHERE section != TRIM(section);

-- ============================================================================
-- Step 5: Verify the fix
-- ============================================================================

SELECT ppmp_no, section, category, description, total_amount
FROM procurementplans
WHERE ppmp_no IN (
  'PPMP-WRSD-2026-001',
  'PPMP-WRSD-2026-003',
  'PPMP-WRSD-2026-004',
  'PPMP-WRSD-2026-005',
  'PPMP-WRSD-2026-006'
)
ORDER BY ppmp_no;

-- Show updated section distribution for WRSD
SELECT section, COUNT(*) as item_count, SUM(total_amount) as total_budget
FROM procurementplans
WHERE ppmp_no LIKE 'PPMP-WRSD%'
GROUP BY section
ORDER BY section;

COMMIT;

-- ============================================================================
-- EXPECTED RESULT after running this script:
--
-- PPMP-WRSD-2026-001 | OFFICE OPERATION          | ICT OFFICE SUPPLIES EXPENSES
-- PPMP-WRSD-2026-003 | SEMI-FURNITURE & FIXTURES | SEMI-OFFICE EQUIPMENT
-- PPMP-WRSD-2026-004 | SEMI-FURNITURE & FIXTURES | SEMI-ICT EQUIPMENT
-- PPMP-WRSD-2026-005 | MOOE                      | OTHER SUPPLIES AND MATERIALS
-- PPMP-WRSD-2026-006 | TRAINING AND ACTIVITIES   | TRAINING AND ACTIVITIES
--
-- This will ensure only ONE "TRAINING AND ACTIVITIES" section appears.
-- ============================================================================
