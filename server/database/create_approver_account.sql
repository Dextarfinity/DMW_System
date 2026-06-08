-- Creates a single approver account that can act on PPMP → PO approval flows
-- Run this after existing seeds (seed_users.sql)

BEGIN;

-- Insert a global approver account (has admin-level permissions by default)
INSERT INTO users (username, password_hash, full_name, email, role, dept_id, is_active)
VALUES
  ('approver_all', 'dmw2026', 'APPROVER (PPMP→PO)', 'approver.all@dmw.gov.ph', 'admin', 1, true)
ON CONFLICT (username) DO NOTHING;

COMMIT;

-- Verification: run
-- SELECT id, username, full_name, role, dept_id, is_active FROM users WHERE username = 'approver_all';
