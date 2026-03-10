-- ============================================================
-- MIGRATION: Add Budget Consultant Approval to PPMP
-- Date: 2026-03-10
-- ============================================================
-- 1. Add budget_consultant to users role CHECK constraint
-- 2. Add approved_by_budget + budget_approved_at columns
-- 3. Update John Louie A. Medillo to budget_consultant role
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: Update users role CHECK constraint to include budget_consultant
-- ============================================================
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (
    role IN (
        'admin','hope','bac_chair','bac_secretariat',
        'twg_member','division_head','end_user',
        'supply_officer','inspector','auditor',
        'manager','officer','viewer',
        'requester','ppmp_encoder','ord_manager',
        'chief_fad','chief_wrsd','chief_mwpsd','chief_mwptd',
        'budget_consultant'
    )
);

-- ============================================================
-- STEP 2: Add budget consultant approval columns to procurementplans
-- ============================================================
ALTER TABLE procurementplans ADD COLUMN IF NOT EXISTS approved_by_budget INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE procurementplans ADD COLUMN IF NOT EXISTS budget_approved_at TIMESTAMP;

-- ============================================================
-- STEP 3: Update John Louie A. Medillo to budget_consultant role
-- User id=16, currently end_user
-- ============================================================
UPDATE users SET role = 'budget_consultant' WHERE id = 16;

COMMIT;

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT id, username, full_name, role, dept_id FROM users WHERE id = 16;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'procurementplans' AND column_name LIKE '%budget%';
