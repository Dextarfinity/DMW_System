-- =====================================================
-- DMW CARAGA INTEGRATED SYSTEM - SEED DATA
-- Version: 2.0.0
-- Generated: February 12, 2026
-- Run this after DMW_INTEGRATED_SCHEMA_v2.0.sql
-- =====================================================

-- Default password for all users: admin123 (plain text for dev)
-- IMPORTANT: Hash passwords properly in production!

-- =====================================================
-- MASTER DATA SEEDING
-- =====================================================

-- Fund Clusters
INSERT INTO fund_clusters (code, name, description) VALUES
('01', 'Regular Fund - 01', 'Regular operational fund'),
('02', 'Regular Fund - 02', 'Secondary operational fund')
ON CONFLICT (code) DO NOTHING;

-- Procurement Modes
INSERT INTO procurement_modes (code, name, description) VALUES
('SVP', 'Small Value Procurement - SVP', 'Procurement not exceeding One Million Pesos'),
('SVPDC', 'Small Value Procurement - Direct Contracting', 'SVP through direct contracting'),
('DC_SHOPPING', 'Direct Contracting / Shopping', 'Shopping method'),
('A2A', 'Agency-To-Agency', 'Procurement through government agencies'),
('NP_DIRECT_RETAIL', 'NP - Direct Retail', 'Negotiated procurement - direct retail'),
('PB', 'Public Bidding', 'Competitive bidding process')
ON CONFLICT (code) DO NOTHING;

-- UACS Codes (Government Accounting)
INSERT INTO uacs_codes (code, category, name, description) VALUES
('1040401000', 'EXPENDABLE', 'Office Supplies Inventory', 'Office supplies and consumables'),
('1040402000', 'EXPENDABLE', 'Accountable Forms, Plates and Stickers Inventory', 'Accountable forms and stickers'),
('1040406000', 'EXPENDABLE', 'Drugs and Medicines Inventory', 'Medical supplies'),
('1040408000', 'EXPENDABLE', 'Fuel, Oil and Lubricants Inventory', 'Fuel and lubricants'),
('1040413000', 'EXPENDABLE', 'Construction Materials Inventory', 'Building materials'),
('1040499000', 'EXPENDABLE', 'Other Supplies and Materials Inventory', 'Miscellaneous supplies'),
('1040501000', 'SEMI-EXPENDABLE', 'Semi-Expendable Machinery', 'Machinery below 15k'),
('1040502000', 'SEMI-EXPENDABLE', 'Semi-Expendable Office Equipment', 'Office equipment below 15k'),
('1040503000', 'SEMI-EXPENDABLE', 'Semi-Expendable ICT Equipment', 'IT equipment below 15k'),
('1040507000', 'SEMI-EXPENDABLE', 'Semi-Expendable Communications Equipment', 'Communications equipment below 15k'),
('1040510000', 'SEMI-EXPENDABLE', 'Semi-Expendable Medical Equipment', 'Medical equipment below 15k'),
('1040511000', 'SEMI-EXPENDABLE', 'Semi-Expendable Printing Equipment', 'Printing equipment below 15k'),
('1040512000', 'SEMI-EXPENDABLE', 'Semi-Expendable Sports Equipment', 'Sports equipment below 15k'),
('1040513000', 'SEMI-EXPENDABLE', 'Semi-Expendable Technical and Scientific Equipment', 'Technical equipment below 15k'),
('1040519000', 'SEMI-EXPENDABLE', 'Semi-Expendable Other Machinery and Equipment', 'Other equipment below 15k'),
('1040601000', 'SEMI-EXPENDABLE', 'Semi-Expendable Furniture and Fixtures', 'Furniture below 15k'),
('1040602000', 'SEMI-EXPENDABLE', 'Semi-Expendable Books', 'Books and publications'),
('1060401000', 'CAPITAL OUTLAY', 'Buildings', 'Building structures'),
('1060501000', 'CAPITAL OUTLAY', 'Machinery', 'Machinery 15k and above'),
('1060502000', 'CAPITAL OUTLAY', 'Office Equipment', 'Office equipment 15k and above'),
('1060514000', 'CAPITAL OUTLAY', 'Technical and Scientific Equipment', 'Technical equipment 15k and above'),
('1060599000', 'CAPITAL OUTLAY', 'Other Machinery and Equipment', 'Other equipment 15k and above'),
('1060601000', 'CAPITAL OUTLAY', 'Motor Vehicles', 'Vehicles'),
('1060701000', 'CAPITAL OUTLAY', 'Furniture and Fixtures', 'Furniture 15k and above')
ON CONFLICT (code) DO NOTHING;

-- Units of Measure
INSERT INTO uoms (abbreviation, name) VALUES
('PCS', 'PIECES'),
('UNIT', 'UNIT'),
('BOX', 'BOX'),
('PACK', 'PACK'),
('REAM', 'REAM'),
('SET', 'SET'),
('DOZEN', 'DOZEN'),
('BOT', 'BOTTLE'),
('CAN', 'CAN'),
('ROLL', 'ROLL'),
('PAIR', 'PAIR'),
('GAL', 'GALLON')
ON CONFLICT (abbreviation) DO NOTHING;

-- Designations
INSERT INTO designations (code, name, description) VALUES
('ORD-DIR', 'OIC, REGIONAL DIRECTOR', 'Officer-in-Charge, Regional Director'),
('CHIEF-LEO', 'CHIEF LEO', 'Chief Labor Employment Officer'),
('SAO', 'SAO', 'Special Authorized Officer'),
('CAO', 'CHIEF ADMINISTRATIVE OFFICER', 'Chief Administrative Officer'),
('ADMIN-ASST-2', 'ADMIN ASST. II', 'Administrative Assistant II'),
('ADMIN-ASST-3', 'ADMIN ASST. III', 'Administrative Assistant III'),
('ADMIN-OFF-1', 'ADMIN OFFICER I', 'Administrative Officer I'),
('ADMIN-OFF-3', 'ADMIN OFFICER III', 'Administrative Officer III'),
('ADMIN-OFF-5', 'ADMIN OFFICER V', 'Administrative Officer V'),
('LEO-1', 'LEO I', 'Labor Employment Officer I'),
('LEO-2', 'LEO II', 'Labor Employment Officer II'),
('LEO-3', 'LEO III', 'Labor Employment Officer III'),
('SR-LEO', 'SR. LEO', 'Senior Labor Employment Officer'),
('SUP-LEO', 'SUP. LEO', 'Supervising Labor Employment Officer'),
('ACCT-3', 'ACCOUNTANT III', 'Accountant III')
ON CONFLICT (code) DO NOTHING;

-- Employees
INSERT INTO employees (employee_code, full_name, designation_id, dept_id, email, status) VALUES
('EMP-001', 'KRISTY A. SUAN', (SELECT id FROM designations WHERE code = 'ORD-DIR'), 5, 'kristy.suan@dmw.gov.ph', 'active'),
('EMP-002', 'MARISSA A. GARAY', (SELECT id FROM designations WHERE code = 'CAO'), 1, 'marissa.garay@dmw.gov.ph', 'active'),
('EMP-003', 'RAY ANGELO A. SAJOR', (SELECT id FROM designations WHERE code = 'ADMIN-OFF-5'), 1, 'ray.sajor@dmw.gov.ph', 'active'),
('EMP-004', 'RITCHEL T. BEBERA', (SELECT id FROM designations WHERE code = 'ACCT-3'), 1, 'ritchel.bebera@dmw.gov.ph', 'active'),
('EMP-005', 'AURORA JEAN A. TORRALBA', (SELECT id FROM designations WHERE code = 'ADMIN-ASST-3'), 1, 'aurora.torralba@dmw.gov.ph', 'active'),
('EMP-006', 'GIOVANNI S. PAREDES', (SELECT id FROM designations WHERE code = 'ADMIN-OFF-1'), 1, 'giovanni.paredes@dmw.gov.ph', 'active'),
('EMP-007', 'MARK E. MARASIGAN', (SELECT id FROM designations WHERE code = 'ADMIN-OFF-1'), 1, 'mark.marasigan@dmw.gov.ph', 'active'),
('EMP-008', 'REGIE B. LAGRAMADA', (SELECT id FROM designations WHERE code = 'LEO-1'), 3, 'regie.lagramada@dmw.gov.ph', 'active'),
('EMP-009', 'CHERRYL C. OCULAM', (SELECT id FROM designations WHERE code = 'ADMIN-ASST-2'), 2, 'cherryl.oculam@dmw.gov.ph', 'active'),
('EMP-010', 'GARY P. SALADORES', (SELECT id FROM designations WHERE code = 'SUP-LEO'), 3, 'gary.saladores@dmw.gov.ph', 'active')
ON CONFLICT (employee_code) DO NOTHING;

-- =====================================================
-- SYSTEM USERS
-- =====================================================

INSERT INTO users (username, password_hash, full_name, email, role, dept_id, employee_id) VALUES
-- Admin
('admin', 'admin123', 'System Administrator', 'admin@dmw.gov.ph', 'admin', 1, NULL),

-- Department Managers
('fad_chief', 'admin123', 'FAD Division Chief', 'fad@dmw.gov.ph', 'manager', 1, NULL),
('wrsd_chief', 'admin123', 'WRSD Division Chief', 'wrsd@dmw.gov.ph', 'manager', 2, NULL),
('mwpsd_chief', 'admin123', 'MWPSD Division Chief', 'mwpsd@dmw.gov.ph', 'manager', 3, NULL),
('mwptd_chief', 'admin123', 'MWPTD Division Chief', 'mwptd@dmw.gov.ph', 'manager', 4, NULL),
('ord_director', 'admin123', 'Regional Director', 'ord@dmw.gov.ph', 'chief', 5, (SELECT id FROM employees WHERE employee_code = 'EMP-001')),

-- Officers
('supply_officer', 'admin123', 'Supply Officer', 'supply@dmw.gov.ph', 'supply_officer', 1, NULL),
('procurement_officer', 'admin123', 'Procurement Officer', 'procurement@dmw.gov.ph', 'officer', 1, NULL),
('inspector1', 'admin123', 'Inspector 1', 'inspector@dmw.gov.ph', 'inspector', 1, NULL),

-- BAC
('bac_chair', 'admin123', 'BAC Chairperson', 'bac.chair@dmw.gov.ph', 'bac_chair', 1, NULL),
('bac_secretariat', 'admin123', 'BAC Secretariat', 'bac.sec@dmw.gov.ph', 'bac_secretariat', 1, NULL),

-- TWG
('twg_member1', 'admin123', 'TWG Member 1', 'twg1@dmw.gov.ph', 'twg_member', 1, NULL),

-- Auditor
('auditor1', 'admin123', 'COA Auditor', 'auditor@dmw.gov.ph', 'auditor', 1, NULL),

-- Property custodians (linked to employees)
('mark_marasigan', 'admin123', 'MARK E. MARASIGAN', 'mark.marasigan@dmw.gov.ph', 'officer', 1, (SELECT id FROM employees WHERE employee_code = 'EMP-007')),
('regie_lagramada', 'admin123', 'REGIE B. LAGRAMADA', 'regie.lagramada@dmw.gov.ph', 'officer', 3, (SELECT id FROM employees WHERE employee_code = 'EMP-008'))
ON CONFLICT (username) DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    email = EXCLUDED.email;

-- =====================================================
-- SUPPLIERS
-- =====================================================

INSERT INTO suppliers (name, contact_person, phone, email, address, tin, org_type, tax_type) VALUES
-- Procurement System Suppliers
('ABC Office Supplies Corp.', 'Pedro Reyes', '09171234567', 'abc@email.com', '123 Main St., Cagayan de Oro City', '123-456-789-000', 'Non-Government', 'VAT'),
('XYZ Computer Solutions', 'Ana Garcia', '09189876543', 'xyz@email.com', '456 IT Park, Cagayan de Oro City', '987-654-321-000', 'Non-Government', 'VAT'),
('Metro Furniture Trading', 'Carlo Santos', '09201112233', 'metro@email.com', '789 Furniture Lane, CDO', '456-789-123-000', 'Non-Government', 'VAT'),
('General Services Trading', 'Lisa Tan', '09223334455', 'gst@email.com', '321 Service Road, CDO', '111-222-333-000', 'Non-Government', 'VAT'),

-- Inventory System Suppliers (from DMW-AS-IS-SYSTEM)
('MID-TOWN COMPUTERS AND SERVICES', 'Tech Manager', '09171111111', 'midtown@email.com', 'LOPEZ JAENA ST., BUTUAN CITY', '929-755-615-000', 'Non-Government', 'VAT'),
('RFY MARKETING', 'Sales Manager', '09172222222', 'rfy@email.com', 'P-8 AMBAGO, BUTUAN CITY', '287-464-966-000', 'Non-Government', 'VAT'),
('PROCUREMENT SERVICE', 'PS Representative', '09173333333', 'ps@email.com', 'J.P. RIZAL AVE., BUTUAN CITY', NULL, 'Government', 'VAT'),
('LINK NETWORK SOLUTIONS INC', 'Network Manager', '09174444444', 'link@email.com', 'IT PARK, BUTUAN CITY', '007-002-021-000', 'Non-Government', 'VAT'),
('AIRMASTERS AIRCONDITIONING SERVICES', 'Service Manager', '09175555555', 'airmasters@email.com', 'PHASE 3, BLK 13 LOT 16-18, EMENVILLE SUBD., BRGY. AMBAGO, BUTUAN CITY', '713-742-008-000', 'Non-Government', 'Non-VAT'),
('MICO''S KEY SHOP', 'Mico', '09176666666', 'micos@email.com', 'R.CALO St., HUMABON POB.(BGY11) BUTUAN CITY', '718-231-398-000', 'Non-Government', 'Non-VAT'),
('KIMSON COMMERCIAL', 'Kim Manager', '09177777777', 'kimson@email.com', 'R. CALCO ST., BUTUAN CITY', NULL, 'Government', 'VAT'),
('FMJ Information Technology Solutions', 'FMJ Manager', '09178888888', 'fmj@email.com', '4TH ST. VILLAGE 2 LIBERTAD, BUTUAN CITY', '765-010-774-000', 'Non-Government', 'Non-VAT'),
('COMPAÑERO COMMERCIAL', 'Sales Head', '09179999999', 'companero@email.com', 'LOPEZ JAENA ST., BUTUAN CITY', '128-218-254-000', 'Non-Government', 'VAT')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ITEMS / INVENTORY CATALOG
-- =====================================================

INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, quantity, reorder_point) VALUES
-- IT Equipment
('IT-001', NULL, 'Desktop Computer', 'Standard office desktop computer', 'unit', 35000.00, 'IT Equipment', '1060502000', 0, 2),
('IT-002', NULL, 'Laptop Computer', 'Standard office laptop', 'unit', 45000.00, 'IT Equipment', '1060502000', 0, 2),
('IT-003', NULL, 'Printer (Laser)', 'Laser printer for office use', 'unit', 15000.00, 'IT Equipment', '1040502000', 0, 3),
('IT-004', '6007260', 'PRINTER - EPSON L5290', 'Epson L5290 Multifunction Printer', 'unit', 12500.00, 'IT Equipment', '1040502000', 0, 2),
('IT-005', NULL, 'Monitor 24 inch', 'LED Monitor 24 inch', 'unit', 8500.00, 'IT Equipment', '1040503000', 0, 3),
('IT-006', NULL, 'Keyboard', 'USB Keyboard', 'unit', 450.00, 'IT Equipment', '1040503000', 0, 10),
('IT-007', NULL, 'Mouse (Optical)', 'USB Optical Mouse', 'unit', 250.00, 'IT Equipment', '1040503000', 0, 10),
('IT-008', NULL, 'UPS 650VA', 'Uninterruptible Power Supply 650VA', 'unit', 3500.00, 'IT Equipment', '1040503000', 0, 5),
('IT-009', NULL, 'External Hard Drive 1TB', 'Portable External HDD 1TB', 'unit', 2800.00, 'IT Equipment', '1040503000', 0, 3),
('IT-010', NULL, 'USB Flash Drive 32GB', 'USB 3.0 Flash Drive 32GB', 'piece', 350.00, 'IT Equipment', '1040503000', 0, 20),
('IT-011', NULL, 'Network Switch 8-Port', 'Gigabit Network Switch 8-Port', 'unit', 1500.00, 'IT Equipment', '1040503000', 0, 2),

-- Office Supplies (Expendable)
('OF-001', NULL, 'Bond Paper A4', 'A4 size bond paper, 500 sheets', 'ream', 250.00, 'EXPENDABLE', '1040401000', 0, 20),
('OF-002', 'EXP-1764841530', 'Bond Paper Legal', 'Legal size bond paper, 80gsm', 'ream', 280.00, 'EXPENDABLE', '1040401000', 0, 20),
('OF-003', NULL, 'Ballpen (Blue)', 'Blue ballpoint pen', 'box', 150.00, 'EXPENDABLE', '1040401000', 0, 10),
('OF-004', 'EXP-1764843100', 'Sign Pen Blue', 'Sign pen extra fine tip, Blue (0.5mm)', 'piece', 25.00, 'EXPENDABLE', '1040401000', 0, 20),
('OF-005', 'EXP-1764925218', 'Sign Pen Black', 'Sign pen extra fine tip, Black', 'piece', 25.00, 'EXPENDABLE', '1040401000', 0, 20),
('OF-006', NULL, 'Folder (Long)', 'Long folder, kraft', 'bundle', 120.00, 'EXPENDABLE', '1040401000', 0, 10),
('OF-007', NULL, 'Stapler (Heavy Duty)', 'Heavy duty stapler', 'unit', 850.00, 'EXPENDABLE', '1040401000', 0, 5),
('OF-008', 'EXP-1764843129', 'Staple Wire Standard', 'Staple wire standard', 'box', 45.00, 'EXPENDABLE', '1040401000', 0, 20),
('OF-009', NULL, 'Paper Clip (Jumbo)', 'Jumbo paper clips', 'box', 35.00, 'EXPENDABLE', '1040401000', 0, 15),
('OF-010', NULL, 'Scotch Tape 1 inch', 'Transparent tape 1 inch', 'roll', 25.00, 'EXPENDABLE', '1040401000', 0, 30),
('OF-011', NULL, 'Correction Tape', 'Correction tape', 'piece', 45.00, 'EXPENDABLE', '1040401000', 0, 20),
('OF-012', NULL, 'Envelope (Long)', 'Brown envelope long', 'box', 180.00, 'EXPENDABLE', '1040401000', 0, 10),
('OF-013', NULL, 'Pencil #2', 'Mongol pencil #2', 'box', 120.00, 'EXPENDABLE', '1040401000', 0, 10),

-- Printer Inks (Expendable - from inventory system)
('INK-001', '8550374', 'EPSON INK 003 - Black', 'Epson 003 Black Ink Bottle', 'bottle', 350.00, 'EXPENDABLE', '1040401000', 0, 10),
('INK-002', '4977046', 'EPSON INK 003 - Cyan', 'Epson 003 Cyan Ink Bottle', 'bottle', 350.00, 'EXPENDABLE', '1040401000', 0, 10),
('INK-003', '8615046', 'EPSON INK 003 - Magenta', 'Epson 003 Magenta Ink Bottle', 'bottle', 350.00, 'EXPENDABLE', '1040401000', 0, 10),
('INK-004', '9305209', 'EPSON INK 003 - Yellow', 'Epson 003 Yellow Ink Bottle', 'bottle', 350.00, 'EXPENDABLE', '1040401000', 0, 10),

-- Furniture (Semi-Expendable)
('FN-001', NULL, 'Office Chair', 'Executive office chair', 'unit', 5500.00, 'SEMI-EXPENDABLE', '1040601000', 0, 2),
('FN-002', NULL, 'Office Desk', 'Standard office desk', 'unit', 8000.00, 'SEMI-EXPENDABLE', '1040601000', 0, 2),
('FN-003', NULL, 'Filing Cabinet (4 Drawer)', '4-drawer steel filing cabinet', 'unit', 12000.00, 'SEMI-EXPENDABLE', '1040601000', 0, 1),
('FN-004', NULL, 'Visitor Chair', 'Visitor chair with armrest', 'unit', 2500.00, 'SEMI-EXPENDABLE', '1040601000', 0, 5),
('FN-005', NULL, 'Bookshelf', 'Steel bookshelf 5 layers', 'unit', 4500.00, 'SEMI-EXPENDABLE', '1040601000', 0, 2),
('FN-006', 'SEM-1756121423', 'CORKBOARD - 4x8 ft', 'Corkboard 4x8 feet', 'unit', 4700.00, 'SEMI-EXPENDABLE', '1040502000', 0, 0),
('FN-007', 'SEM-1756121448', 'WHITEBOARD - 4x8 ft', 'Whiteboard 4x8 feet', 'unit', 4200.00, 'SEMI-EXPENDABLE', '1040502000', 0, 0),

-- Communications Equipment (Semi-Expendable)
('COM-001', 'SEM-1755924858', 'CELLPHONE', 'Standard smartphone for official use', 'set', 5000.00, 'SEMI-EXPENDABLE', '1040507000', 0, 0),

-- Janitorial Supplies
('JN-001', NULL, 'Mop', 'Cotton mop with handle', 'unit', 180.00, 'EXPENDABLE', '1040499000', 0, 5),
('JN-002', NULL, 'Broom (Soft)', 'Soft broom', 'unit', 85.00, 'EXPENDABLE', '1040499000', 0, 10),
('JN-003', NULL, 'Trash Bag (Large)', 'Large black trash bag', 'pack', 95.00, 'EXPENDABLE', '1040499000', 0, 15),
('JN-004', NULL, 'Toilet Paper', 'Tissue paper 2-ply', 'pack', 250.00, 'EXPENDABLE', '1040499000', 0, 10),
('JN-005', NULL, 'Hand Soap (Liquid)', 'Liquid hand soap 500ml', 'bottle', 120.00, 'EXPENDABLE', '1040499000', 0, 20)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- SAMPLE PROCUREMENT PLANS
-- =====================================================

INSERT INTO procurementplans (dept_id, fiscal_year, total_amount, status, created_by) VALUES
(1, 2026, 175000.00, 'approved', 1),
(1, 2026, 360000.00, 'approved', 1),
(2, 2026, 50000.00, 'draft', 1),
(3, 2026, 6000.00, 'submitted', 1),
(4, 2026, 66000.00, 'draft', 1)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SAMPLE PROPERTY CARDS (Semi-Expendable Items)
-- =====================================================

INSERT INTO property_cards (property_number, description, acquisition_cost, issued_to, issued_to_employee_id, issued_date, received_date, ics_no, status) VALUES
('2025-05-02-0001', 'CORKBOARD - 4x8 ft.', 4700.00, 'MARK E. MARASIGAN', (SELECT id FROM employees WHERE employee_code = 'EMP-007'), '2026-01-27', '2025-05-27', '2026-01-0001', 'active'),
('2025-05-02-0002', 'WHITEBOARD - 4x8 ft.', 4200.00, 'MARK E. MARASIGAN', (SELECT id FROM employees WHERE employee_code = 'EMP-007'), '2025-05-27', '2025-05-27', '2025-05-0002', 'active'),
('2025-05-07-0001', 'CELLPHONE', 5000.00, 'REGIE B. LAGRAMADA', (SELECT id FROM employees WHERE employee_code = 'EMP-008'), '2025-05-02', '2025-05-02', '2025-05-0001', 'active')
ON CONFLICT (property_number) DO NOTHING;

-- =====================================================
-- SAMPLE INVENTORY CUSTODIAN SLIPS
-- =====================================================

INSERT INTO inventory_custodian_slips (ics_no, date_of_issue, property_number, description, inventory_no, ppe_no, issued_to, issued_to_employee_id, received_by_employee_id, received_by_position) VALUES
('2026-01-0001', '2026-01-27', '2025-05-02-0001', 'CORKBOARD - 4x8 ft.', '5020-05-0001', '2025-05-02-0001', 'MARK E. MARASIGAN', 
    (SELECT id FROM employees WHERE employee_code = 'EMP-007'), 
    (SELECT id FROM employees WHERE employee_code = 'EMP-007'), 
    'Admin Officer I'),
('2025-05-0002', '2025-05-27', '2025-05-02-0002', 'WHITEBOARD - 4x8 ft.', '5020-05-0002', '2025-05-02-0002', 'MARK E. MARASIGAN', 
    (SELECT id FROM employees WHERE employee_code = 'EMP-007'), 
    (SELECT id FROM employees WHERE employee_code = 'EMP-007'), 
    'Admin Officer I'),
('2025-05-0001', '2025-05-02', '2025-05-07-0001', 'CELLPHONE', '5070-05-0001', '2025-05-07-0001', 'REGIE B. LAGRAMADA', 
    (SELECT id FROM employees WHERE employee_code = 'EMP-008'), 
    (SELECT id FROM employees WHERE employee_code = 'EMP-008'), 
    'LEO I')
ON CONFLICT (ics_no) DO NOTHING;

-- =====================================================
-- INITIALIZE COUNTERS
-- =====================================================

INSERT INTO counters (counter_name, year, count) VALUES
('ics', 2025, 2),
('ics', 2026, 1),
('iar', 2025, 30),
('iar', 2026, 0),
('po', 2025, 74),
('po', 2026, 0),
('pr', 2026, 0),
('rfq', 2026, 0),
('abstract', 2026, 0),
('bac_resolution', 2026, 0),
('noa', 2026, 0),
('property_number_5020', 2025, 2),
('property_number_5070', 2025, 1)
ON CONFLICT (counter_name) DO NOTHING;

-- =====================================================
-- IMPORTANT NOTES
-- =====================================================

-- 1. All users have default password: admin123 (CHANGE IN PRODUCTION!)
-- 2. Property cards are linked to actual employees for accountability
-- 3. Items table now supports both procurement and inventory:
--    - Procurement uses: code, name, unit, unit_price, category
--    - Inventory adds: stock_no, uacs_code, quantity, reorder_point
-- 4. When IAR is completed, items.quantity is auto-updated via trigger
-- 5. Stock cards are auto-created when IAR status = 'completed'

-- =====================================================
-- VERIFICATION QUERIES (Run to check data)
-- =====================================================

-- Check departments
-- SELECT * FROM departments;

-- Check users
-- SELECT id, username, role, dept_id FROM users WHERE is_active = TRUE;

-- Check employees
-- SELECT e.employee_code, e.full_name, d.name AS designation, dept.code AS department 
-- FROM employees e 
-- JOIN designations d ON e.designation_id = d.id 
-- JOIN departments dept ON e.dept_id = dept.id;

-- Check suppliers
-- SELECT name, tin, org_type, tax_type FROM suppliers WHERE is_active = TRUE;

-- Check items with inventory tracking
-- SELECT code, stock_no, name, category, uacs_code, quantity, reorder_point 
-- FROM items WHERE is_active = TRUE LIMIT 10;

-- Check property accountability
-- SELECT * FROM vw_property_accountability;

-- Check stock levels
-- SELECT * FROM vw_current_stock;

-- =====================================================
-- END OF SEED DATA
-- =====================================================
