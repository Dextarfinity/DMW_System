-- ============================================================
-- MIGRATION: PPMP Access Control Setup
-- Date: 2026-03-10
-- ============================================================
-- 1. Creates user_department_access table for multi-division PPMP access
-- 2. Grants Regienald S. Espaldon access to all divisions except WRSD
-- 3. Grants Eval B. Makinano access to all divisions + approval role
-- 4. Creates user account for Anne Jane M. Hallasgo (WRSD encoder)
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: Create user_department_access table (if not exists)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_department_access (
    id          SERIAL PRIMARY KEY,
    user_id     INT REFERENCES users(id) ON DELETE CASCADE,
    dept_id     INT REFERENCES departments(id) ON DELETE CASCADE,
    access_type VARCHAR(30) DEFAULT 'ppmp_manage',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, dept_id, access_type)
);

-- ============================================================
-- STEP 2: Regienald S. Espaldon (user id=5, chief_fad)
-- Access: All pending PPMP entries EXCEPT WRSD (dept_id=4)
-- Already has depts 1,2,3 — add dept 5 (ORD)
-- ============================================================
INSERT INTO user_department_access (user_id, dept_id, access_type) VALUES
    (5, 5, 'ppmp_manage')   -- ORD
ON CONFLICT (user_id, dept_id, access_type) DO NOTHING;

-- ============================================================
-- STEP 3: Eval B. Makinano (user id=6, chief_wrsd)
-- Access: All pending PPMP entries (all divisions) + can approve
-- Departments: FAD(1), MWPTD(2), MWPSD(3), WRSD(4), ORD(5)
-- ============================================================
-- Give bac_chair secondary role for approval capability
UPDATE users SET secondary_role = 'bac_chair' WHERE id = 6;

INSERT INTO user_department_access (user_id, dept_id, access_type) VALUES
    (6, 1, 'ppmp_manage'),  -- FAD
    (6, 2, 'ppmp_manage'),  -- MWPTD
    (6, 3, 'ppmp_manage'),  -- MWPSD
    (6, 4, 'ppmp_manage'),  -- WRSD
    (6, 5, 'ppmp_manage')   -- ORD
ON CONFLICT (user_id, dept_id, access_type) DO NOTHING;

-- ============================================================
-- STEP 4: Anne Jane M. Hallasgo - PPMP Entry Encoder (WRSD)
-- Employee ID: 25, Dept: WRSD (4)
-- Role: end_user (can create/edit PPMP entries for WRSD)
-- ============================================================
INSERT INTO users (username, password_hash, full_name, email, role, dept_id, employee_id)
VALUES ('annejane', 'dmw2026', 'ANNE JANE M. HALLASGO', 'anne.hallasgo@dmw.gov.ph', 'end_user', 4, 25)
ON CONFLICT (username) DO NOTHING;

-- Reset user id sequence
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

COMMIT;

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT u.id, u.username, u.full_name, u.role, u.secondary_role, d.code AS division,
       (SELECT array_agg(da.dept_id ORDER BY da.dept_id) 
        FROM user_department_access da WHERE da.user_id = u.id AND da.access_type = 'ppmp_manage') AS managed_depts
FROM users u
LEFT JOIN departments d ON u.dept_id = d.id
WHERE u.id IN (2, 5) OR u.username = 'annejane'
ORDER BY u.id;
