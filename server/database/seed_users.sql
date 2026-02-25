-- ============================================================
-- DMW CARAGA PROCUREMENT SYSTEM - USER ACCOUNTS SEED DATA
-- ============================================================
-- Run AFTER consolidated_seed.sql + seed_employees.sql
-- Passwords are plain text (server supports both bcrypt and plain text)
-- Default password for all accounts: dmw2026
-- ============================================================

BEGIN;

-- ============================================================
-- USER ACCOUNTS
-- ============================================================
-- Roles available:
--   admin, hope, bac_chair, bac_secretariat, twg_member,
--   division_head, end_user, supply_officer, inspector,
--   auditor, manager, officer, viewer
--
-- Employee IDs (from seed_employees.sql):
--   4  = REGIENALD S. ESPALDON (Chief Admin Officer, FAD)
--   5  = MARK E. MARASIGAN (Admin Officer I, FAD)
--   7  = GIOVANNI S. PAREDES (SAO, FAD)
--   8  = GARY P. SALADORES (Admin Officer V, FAD)
--  10  = JOMAR LIAN U. TOLIAO (Admin Officer III, FAD)
--  12  = CHERRYL C. OCULAM (Sr. LEO, MWPTD)
--  16  = MARISSA A. GARAY (Sup. LEO, MWPSD)
--  27  = EVAL B. MAKINANO (Chief LEO, WRSD)
--  29  = RITCHEL M. BUTAO (Director IV, ORD)
-- ============================================================

-- Clear existing users except admin (id=1)
DELETE FROM users WHERE id > 1;

-- Insert user accounts
-- Note: admin (id=1) already exists from consolidated_seed.sql
INSERT INTO users (id, username, password_hash, full_name, email, role, dept_id, employee_id) VALUES
    -- Division Heads
    (2, 'regienald',     'dmw2026', 'REGIENALD S. ESPALDON',  'regienald.espaldon@dmw.gov.ph', 'division_head',  1, 4),
    (3, 'cherryl',       'dmw2026', 'CHERRYL C. OCULAM',      'cheryl.oculam@dmw.gov.ph',      'division_head',  2, 12),
    (4, 'marissa',       'dmw2026', 'MARISSA A. GARAY',       'magaray826@gmail.com',           'division_head',  3, 16),
    (5, 'eval',          'dmw2026', 'EVAL B. MAKINANO',       'makinanoeval.mcdrm9@gmail.com',  'division_head',  4, 27),
    -- Head of Procuring Entity (Regional Director)
    (6, 'ritchel.butao', 'dmw2026', 'RITCHEL M. BUTAO',       'ritchel.butao@dmw.gov.ph',      'hope',           5, 29),
    -- Supply Officers (FAD)
    (7, 'mark',          'dmw2026', 'MARK E. MARASIGAN',      'markem03@gmail.com',             'supply_officer',  1, 5),
    (8, 'gary',          'dmw2026', 'GARY P. SALADORES',      'gary.saladores@dmw.gov.ph',      'supply_officer',  1, 8),
    -- BAC Secretariat / Officers
    (9, 'giovanni',      'dmw2026', 'GIOVANNI S. PAREDES',    'giovanni.paredes@dmw.gov.ph',    'bac_secretariat', 1, 7),
    (10, 'jomar',        'dmw2026', 'JOMAR LIAN U. TOLIAO',   'jomar.toliao@dmw.gov.ph',        'officer',         1, 10)
ON CONFLICT (username) DO NOTHING;

-- Reset sequence
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- ============================================================
-- DUAL ROLE SETUP
-- User 5 (EVAL B. MAKINANO) is WRSD Division Head AND BAC Chair
-- ============================================================
UPDATE users SET secondary_role = 'bac_chair' WHERE id = 5;

-- ============================================================
-- LINK ADMIN USER TO EMPLOYEE (optional)
-- ============================================================
UPDATE users SET employee_id = 4 WHERE id = 1 AND employee_id IS NULL;

COMMIT;

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT u.id, u.username, u.full_name, u.role, u.secondary_role,
       d.code AS division, e.employee_code
FROM users u
LEFT JOIN departments d ON u.dept_id = d.id
LEFT JOIN employees e ON u.employee_id = e.id
ORDER BY u.id;
