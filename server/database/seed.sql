-- ============================================================
-- DMW Procurement System - Seed Data
-- Run this after schema.sql to populate initial data
-- ============================================================

-- Default password for all users: admin123
-- Passwords are stored as plain text for development purposes

-- Insert Admin User (password: admin123)
INSERT INTO users (username, password_hash, full_name, email, role, dept_id) VALUES
('admin', 'admin123', 'System Administrator', 'admin@dmw.gov.ph', 'admin', 1)
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Insert Department Managers
INSERT INTO users (username, password_hash, full_name, email, role, dept_id) VALUES
('fad_manager', 'admin123', 'FAD Division Chief', 'fad@dmw.gov.ph', 'manager', 1),
('wrsd_manager', 'admin123', 'WRSD Division Chief', 'wrsd@dmw.gov.ph', 'manager', 2),
('mwpd_manager', 'admin123', 'MWPD Division Chief', 'mwpd@dmw.gov.ph', 'manager', 3),
('mwprod_manager', 'admin123', 'MWProD Division Chief', 'mwprod@dmw.gov.ph', 'manager', 4),
('ord_manager', 'admin123', 'ORD Executive', 'ord@dmw.gov.ph', 'manager', 5)
ON CONFLICT (username) DO NOTHING;

-- Insert Sample Officers
INSERT INTO users (username, password_hash, full_name, email, role, dept_id) VALUES
('officer1', 'admin123', 'John Dela Cruz', 'john@dmw.gov.ph', 'officer', 1),
('officer2', 'admin123', 'Maria Santos', 'maria@dmw.gov.ph', 'officer', 2),
('auditor1', 'admin123', 'COA Auditor', 'auditor@dmw.gov.ph', 'auditor', 1)
ON CONFLICT (username) DO NOTHING;

-- Insert Additional Items
INSERT INTO items (code, name, description, unit, unit_price, category) VALUES
-- IT Equipment
('IT-004', 'Monitor 24 inch', 'LED Monitor 24 inch', 'unit', 8500.00, 'IT Equipment'),
('IT-005', 'Keyboard', 'USB Keyboard', 'unit', 450.00, 'IT Equipment'),
('IT-006', 'Mouse (Optical)', 'USB Optical Mouse', 'unit', 250.00, 'IT Equipment'),
('IT-007', 'UPS 650VA', 'Uninterruptible Power Supply 650VA', 'unit', 3500.00, 'IT Equipment'),
('IT-008', 'External Hard Drive 1TB', 'Portable External HDD 1TB', 'unit', 2800.00, 'IT Equipment'),
('IT-009', 'USB Flash Drive 32GB', 'USB 3.0 Flash Drive 32GB', 'piece', 350.00, 'IT Equipment'),
('IT-010', 'Network Switch 8-Port', 'Gigabit Network Switch 8-Port', 'unit', 1500.00, 'IT Equipment'),

-- Office Supplies
('OF-004', 'Stapler (Heavy Duty)', 'Heavy duty stapler', 'unit', 850.00, 'Office Supplies'),
('OF-005', 'Staple Wire #35', 'Staple wire standard', 'box', 45.00, 'Office Supplies'),
('OF-006', 'Paper Clip (Jumbo)', 'Jumbo paper clips', 'box', 35.00, 'Office Supplies'),
('OF-007', 'Scotch Tape 1 inch', 'Transparent tape 1 inch', 'roll', 25.00, 'Office Supplies'),
('OF-008', 'Correction Tape', 'Correction tape', 'piece', 45.00, 'Office Supplies'),
('OF-009', 'Envelope (Long)', 'Brown envelope long', 'box', 180.00, 'Office Supplies'),
('OF-010', 'Pencil #2', 'Mongol pencil #2', 'box', 120.00, 'Office Supplies'),

-- Furniture
('FN-003', 'Filing Cabinet (4 Drawer)', '4-drawer steel filing cabinet', 'unit', 12000.00, 'Furniture'),
('FN-004', 'Visitor Chair', 'Visitor chair with armrest', 'unit', 2500.00, 'Furniture'),
('FN-005', 'Bookshelf', 'Steel bookshelf 5 layers', 'unit', 4500.00, 'Furniture'),

-- Janitorial Supplies
('JN-001', 'Mop', 'Cotton mop with handle', 'unit', 180.00, 'Janitorial'),
('JN-002', 'Broom (Soft)', 'Soft broom', 'unit', 85.00, 'Janitorial'),
('JN-003', 'Trash Bag (Large)', 'Large black trash bag', 'pack', 95.00, 'Janitorial'),
('JN-004', 'Toilet Paper', 'Tissue paper 2-ply', 'pack', 250.00, 'Janitorial'),
('JN-005', 'Hand Soap (Liquid)', 'Liquid hand soap 500ml', 'bottle', 120.00, 'Janitorial')
ON CONFLICT (code) DO NOTHING;

-- Insert Sample Suppliers
INSERT INTO suppliers (name, contact_person, phone, email, address, tin) VALUES
('ABC Office Supplies Corp.', 'Pedro Reyes', '09171234567', 'abc@email.com', '123 Main St., Cagayan de Oro City', '123-456-789-000'),
('XYZ Computer Solutions', 'Ana Garcia', '09189876543', 'xyz@email.com', '456 IT Park, Cagayan de Oro City', '987-654-321-000'),
('Metro Furniture Trading', 'Carlo Santos', '09201112233', 'metro@email.com', '789 Furniture Lane, CDO', '456-789-123-000'),
('General Services Trading', 'Lisa Tan', '09223334455', 'gst@email.com', '321 Service Road, CDO', '111-222-333-000')
ON CONFLICT DO NOTHING;

-- Insert Sample Procurement Plans for 2026
INSERT INTO procurementplans (dept_id, fiscal_year, total_amount, status, created_by) VALUES
(1, 2026, 175000.00, 'approved', 1),
(1, 2026, 360000.00, 'approved', 1),
(2, 2026, 50000.00, 'draft', 1),
(3, 2026, 6000.00, 'submitted', 1),
(4, 2026, 66000.00, 'draft', 1)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DEFAULT PASSWORD NOTE
-- ============================================================
-- All seeded users have password: admin123
-- Please change passwords after first login!
-- ============================================================
