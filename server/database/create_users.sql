-- ============================================================
-- DMW Procurement System - Create User Accounts
-- ============================================================
-- Use this file to create new user accounts via SQL query.
-- Run these commands in psql or your PostgreSQL client.
-- ============================================================

-- NOTE: Passwords are stored as plain text for development purposes.
-- For production, implement proper password hashing.

-- ============================================================
-- STEP 1: Get Department IDs
-- ============================================================
-- Run this to see available departments:
-- SELECT id, code, name FROM departments;
--
-- Department Codes:
-- 1 = FAD (Finance and Administrative Division)
-- 2 = WRSD (Welfare Reintegration Services Division)  
-- 3 = MWPD (Migrant Workers Protection Division)
-- 4 = MWProD (Migrant Workers Processing Division)
-- 5 = ORD (Office of Regional Director)

-- ============================================================
-- STEP 2: Available Roles
-- ============================================================
-- 'admin'   - System Administrator (full access)
-- 'manager' - Division Manager (can approve, manage division)
-- 'officer' - Procurement Officer (can create, edit)
-- 'viewer'  - Read-only access
-- 'auditor' - COA Auditor (read + audit functions)

-- ============================================================
-- STEP 3: Create User (Template)
-- ============================================================
-- Replace the values below with actual data:

-- Example 1: Create an admin user
INSERT INTO users (username, password_hash, full_name, email, role, dept_id) 
VALUES (
    'newadmin',           -- username
    'password123',        -- password (plain text)
    'New Admin User',     -- full_name
    'newadmin@dmw.gov.ph',-- email
    'admin',              -- role
    1                     -- dept_id (FAD)
);

-- Example 2: Create an officer for WRSD
INSERT INTO users (username, password_hash, full_name, email, role, dept_id) 
VALUES (
    'wrsd_officer',
    'password123',
    'WRSD Procurement Officer',
    'wrsd_officer@dmw.gov.ph',
    'officer',
    2  -- WRSD
);

-- Example 3: Create a viewer
INSERT INTO users (username, password_hash, full_name, email, role, dept_id) 
VALUES (
    'viewer1',
    'password123',
    'Read Only User',
    'viewer@dmw.gov.ph',
    'viewer',
    1
);

-- ============================================================
-- USEFUL QUERIES
-- ============================================================

-- View all users:
-- SELECT id, username, full_name, role, dept_id, is_active, created_at FROM users;

-- Deactivate a user (soft delete):
-- UPDATE users SET is_active = FALSE WHERE username = 'username_here';

-- Reactivate a user:
-- UPDATE users SET is_active = TRUE WHERE username = 'username_here';

-- Reset/change password:
-- UPDATE users SET password_hash = 'newpassword' WHERE username = 'username_here';

-- Delete user permanently (not recommended):
-- DELETE FROM users WHERE username = 'username_here';
