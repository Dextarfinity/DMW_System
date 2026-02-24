-- ============================================================================
-- DMW CARAGA Regional Office XIII - PPMP SEED DATA FY 2026
-- Source: Actual PPMP Excel files per Division
-- 
-- Division Breakdown (99 PPMP Line Items, Grand Total: ₱19,091,072.00):
--   FAD:   53 items, ₱10,788,550.00 (includes 5 ORD items merged under FAD)
--   MWPTD: 16 items, ₱968,950.00
--   MWPSD: 12 items, ₱1,364,500.00
--   WRSD:  18 items, ₱5,969,072.00
--
-- Source Files:
--   FAD:   NGPA PPMP 2026 FAD.xlsx (48 FAD + 5 ORD merged)
--   MWPTD: MWPTD PPMP 2026.xlsx
--   MWPSD: MWPSD-PPMP 2026.xlsx
--   WRSD:  NGPA_PPMP-of-DMW-WRSD Caraga.xlsx
--
-- NOTE: ORD (Office of the Regional Director) shares one PPMP with FAD.
--       ORD entries are stored under dept_id=1 (FAD) with PPMP-FAD-2026-049..053
-- ============================================================================

BEGIN;

-- Delete existing PPMP entries (id > 5) to avoid duplicates
-- Keep plans 1-5 (parent plans used by APP/plan_items)
DELETE FROM procurementplans WHERE id > 5;

-- Reset sequence to start after the parent plans
SELECT setval('procurementplans_id_seq', (SELECT MAX(id) FROM procurementplans), true);

-- Update parent plan totals to match actual PPMP data (ORD merged into FAD)
UPDATE procurementplans SET total_amount = 10788550.00, remarks = 'PPMP FY 2026 - FAD (includes ORD)' WHERE id = 1;
UPDATE procurementplans SET total_amount = 968950.00, remarks = 'PPMP FY 2026 - MWPTD' WHERE id = 2;
UPDATE procurementplans SET total_amount = 1364500.00, remarks = 'PPMP FY 2026 - MWPSD' WHERE id = 3;
UPDATE procurementplans SET total_amount = 5969072.00, remarks = 'PPMP FY 2026 - WRSD' WHERE id = 4;
UPDATE procurementplans SET total_amount = 0.00, remarks = 'PPMP FY 2026 - ORD (merged into FAD plan id=1)' WHERE id = 5;

-- ============================================================================
-- FAD PPMP ITEMS (dept_id=1, 48 items + 5 ORD = 53 total, ₱10,788,550.00)
-- Source: NGPA PPMP 2026 FAD.xlsx + ORD items merged
-- ============================================================================

INSERT INTO procurementplans (dept_id, fiscal_year, status, ppmp_no, description, project_type, quantity_size, procurement_mode, pre_procurement, start_date, end_date, delivery_period, fund_source, total_amount, created_by) VALUES
-- FAD Office Operations & Services
(1, 2026, 'approved', 'PPMP-FAD-2026-001', 'Hiring of Security Guard Services', 'Goods', '4 Pax', 'Small Value Procurement', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA', 960000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-002', 'Hiring of Job Orders', 'Goods', '2 Pax', 'Small Value Procurement', 'NO', 'January 2026', 'July 2026', 'January 2026', 'GAA', 617712.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-003', 'Hiring of Janitorial Services', 'Goods', '2 Pax', 'Small Value Procurement', 'NO', 'January 2026', 'July 2026', 'January 2026', 'GAA', 720000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-004', 'RM - Motor Vehicle', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'February 2026', 'November 2026', 'February 2026', 'GAA', 100000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-005', 'RM - Office Equipment (Aircon, Printer, Photocopier)', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'February 2026', 'November 2026', 'February 2026', 'GAA', 60000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-006', 'Postage and Courier', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA', 18000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-007', 'Rent of Office Building', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'September 2026', 'August 2027', 'September 2026', 'GAA', 3641987.44, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-008', 'Internet Expenses', 'Goods', '2 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA', 89998.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-009', 'Insurance of DMW Office Equipment', 'Goods', '1 Lot', 'Agency-To-Agency', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA', 25000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-010', 'Insurance of DMW Vehicle', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA', 15000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-011', 'Water Expenses', 'Goods', '1 Lot', 'Direct Contracting', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA', 144000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-012', 'Electricity Expenses', 'Goods', '1 Lot', 'Direct Contracting', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA', 522652.56, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-013', 'Fidelity Bond', 'Goods', '1 Lot', 'Agency-To-Agency', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA', 100000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-014', 'ICT Supplies (Printer Inks and Photocopier Toners)', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'February 2026', 'November 2026', 'February 2026', 'GAA', 63200.00, 1),
-- FAD Training & Capacity Building
(1, 2026, 'approved', 'PPMP-FAD-2026-015', 'Strategic Performance Management System (Coaching and Integration)', 'Goods', '1 Session, 8 Pax', 'Small Value Procurement', 'NO', 'February 2026', 'November 2026', 'February 2026', 'GAA', 23000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-016', 'New Government Procurement Act (NGPA) R.A. 12009', 'Goods', '4 Sessions, 12 Pax', 'Agency-To-Agency', 'NO', 'February 2026', 'November 2026', 'February 2026', 'GAA', 108000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-017', 'Training on effective news and feature writing and storytelling', 'Goods', '1 session', 'Small Value Procurement', 'NO', 'February 2026', 'February 2026', 'February 2026', 'GAA', 45000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-018', 'R.A. 6713: Code of Conduct and Ethical Standards for Public Officers and Employees', 'Goods', '1 session', 'Small Value Procurement', 'NO', 'September 2026', 'September 2026', 'September 2026', 'GAA', 45000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-019', 'Lecture on complete staff work & 7s of good house keeping training', 'Goods', '1 session', 'Small Value Procurement', 'NO', 'April 2026', 'April 2026', 'April 2026', 'GAA', 30000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-020', 'Effective Communication and basic customer service skills', 'Goods', '1 session', 'Small Value Procurement', 'NO', 'June 2026', 'June 2026', 'June 2026', 'GAA', 30000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-021', 'Promoting mental health in the workplace', 'Goods', '1 session', 'Small Value Procurement', 'NO', 'August 2026', 'August 2026', 'August 2026', 'GAA', 30000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-022', 'Orientation on gender and development', 'Goods', '1 session', 'Small Value Procurement', 'NO', 'October 2026', 'October 2026', 'October 2026', 'GAA', 30000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-023', 'Productivity Revolution: How to integrate AI tools into your workflow', 'Goods', '1 session', 'Small Value Procurement', 'NO', 'November 2026', 'November 2026', 'November 2026', 'GAA', 30000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-024', 'Accreditation training for mediators and conciliators', 'Goods', '1 session', 'Small Value Procurement', 'NO', 'February 2026', 'February 2026', 'February 2026', 'GAA', 30000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-025', 'Advanced Case Management Training for Protection Division Officers', 'Goods', '1 session, 5 pax', 'Small Value Procurement', 'NO', 'March 2026', 'March 2026', 'March 2026', 'GAA', 30000.00, 1),
-- FAD Events & Celebrations
(1, 2026, 'approved', 'PPMP-FAD-2026-026', 'Bagong Pilipinas Serbisyo Fair', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'June 2026', 'June 2026', 'June 2026', 'GAA', 100000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-027', 'Kapihan sa Bagong Pilipinas', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'March 2026', 'March 2026', 'March 2026', 'GAA', 100000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-028', 'Handog ng Pangulo', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'September 2026', 'September 2026', 'September 2026', 'GAA', 75000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-029', 'LAB for All', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'September 2026', 'September 2026', 'September 2026', 'GAA', 75000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-030', 'Women''s Month / Hudyaka Celebration', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'March 2026', 'March 2026', 'March 2026', 'GAA', 100000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-031', 'Labor Day Celebration', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'May 2026', 'May 2026', 'May 2026', 'GAA', 30000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-032', 'Migrant Worker''s Day', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'June 2026', 'June 2026', 'June 2026', 'GAA', 150000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-033', 'Maritime Week Celebration', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'June 2026', 'June 2026', 'June 2026', 'GAA', 30000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-034', 'National Disaster Resilience Month', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'July 2026', 'July 2026', 'July 2026', 'GAA', 75000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-035', 'National Anti-Trafficking in Persons Awareness Month', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'July 2026', 'July 2026', 'July 2026', 'GAA', 75000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-036', 'Civil Service Month', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'September 2026', 'September 2026', 'September 2026', 'GAA', 30000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-037', 'Kainang Pamilya Mahalaga', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'September 2026', 'September 2026', 'September 2026', 'GAA', 20000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-038', 'National Statistics Month', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'October 2026', 'October 2026', 'October 2026', 'GAA', 20000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-039', 'Elderly Filipino Week', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'October 2026', 'October 2026', 'October 2026', 'GAA', 30000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-040', 'National Mental Health Week', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'October 2026', 'October 2026', 'October 2026', 'GAA', 30000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-041', 'National Children''s Month', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'October 2026', 'October 2026', 'October 2026', 'GAA', 30000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-042', '18-Day Campaign to End Violence Against Women (VAW)', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'November 2026', 'December 2026', 'November 2026', 'GAA', 50000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-043', 'MYPA and YEPA', 'Goods', '2 lot', 'Small Value Procurement', 'NO', 'June 2026', 'December 2026', 'June 2026', 'GAA', 105000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-044', 'DMW Anniversary Celebration', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'December 2026', 'December 2026', 'December 2026', 'GAA', 200000.00, 1),
-- FAD Major Activities
(1, 2026, 'approved', 'PPMP-FAD-2026-045', 'Hosting of Regional Planning Conference', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'March 2026', 'March 2026', 'March 2026', 'GAA', 450000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-046', 'Organizational Development Activity/Capability Enhancement Training', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'May 2026', 'May 2026', 'May 2026', 'GAA', 250000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-047', 'GAD Quarterly Meeting', 'Goods', '4 lot', 'Small Value Procurement', 'NO', 'March 2026', 'December 2026', 'March 2026', 'GAA', 20000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-048', 'Capital Outlay (ICT, Office Equipment, Furniture and Fixture)', 'Goods', '1 lot', 'Small Value Procurement', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA', 435000.00, 1),

-- ============================================================================
-- MWPTD PPMP ITEMS (dept_id=2, 16 items, Total: ₱968,950.00)
-- Source: MWPTD PPMP 2026.xlsx
-- ============================================================================

-- MWPTD ICT Office Supplies (Inks, Paper, etc.)
(2, 2026, 'approved', 'PPMP-MWPTD-2026-001', 'ICT Office Supplies Expenses (Printer Inks - EPSON L3250 & L5290)', 'Goods', '1 Lot (160 bottles)', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 110000.00, 1),
(2, 2026, 'approved', 'PPMP-MWPTD-2026-002', 'Office Supplies Expenses (Paper, Folders, Pens, Staples, Envelopes)', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 30525.00, 1),
(2, 2026, 'approved', 'PPMP-MWPTD-2026-003', 'Certificate Holders and Parchment Paper', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 1925.00, 1),
-- MWPTD Semi-Expendable Equipment
(2, 2026, 'approved', 'PPMP-MWPTD-2026-004', 'Binding and Punching Machine with Ring Binder', 'Goods', '1 unit', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 34000.00, 1),
(2, 2026, 'approved', 'PPMP-MWPTD-2026-005', 'Stackable Chair (Metal Base)', 'Goods', '10 units', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 11000.00, 1),
(2, 2026, 'approved', 'PPMP-MWPTD-2026-006', 'Tablet (Android 14, HyperOS)', 'Goods', '2 units', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 40000.00, 1),
(2, 2026, 'approved', 'PPMP-MWPTD-2026-007', 'External Hard Drive (1TB, USB 3.0)', 'Goods', '1 unit', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 5000.00, 1),
(2, 2026, 'approved', 'PPMP-MWPTD-2026-008', 'Steel Pedestal', 'Goods', '10 units', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 50000.00, 1),
-- MWPTD Other Supplies & Materials
(2, 2026, 'approved', 'PPMP-MWPTD-2026-009', 'Other Supplies and Materials (Alcohol, Air Freshener, Battery, Certificate Holders, etc.)', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 99500.00, 1),
(2, 2026, 'approved', 'PPMP-MWPTD-2026-010', 'Postage and Courier Services', 'Services', '50 lots', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 50000.00, 1),
-- MWPTD Events/Activities
(2, 2026, 'approved', 'PPMP-MWPTD-2026-011', 'Orientation on Anti-Trafficking in Persons Act (Meals, Tokens, Supplies)', 'Goods', '160 pax', 'Small Value Procurement', 'NO', 'February 2026', 'March 2026', 'April 2026', 'GAA 2026', 193750.00, 1),
(2, 2026, 'approved', 'PPMP-MWPTD-2026-012', 'TOT: Child Protection Policy Advocacy (Meals, Tokens, Supplies)', 'Goods', '15 pax', 'Small Value Procurement', 'NO', 'March 2026', 'April 2026', 'May 2026', 'GAA 2026', 20750.00, 1),
(2, 2026, 'approved', 'PPMP-MWPTD-2026-013', 'Pre-Departure Orientation Seminar / PDOS (Meals, Supplies)', 'Goods', '300 pax', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 305000.00, 1),
(2, 2026, 'approved', 'PPMP-MWPTD-2026-014', 'Digital Clock (Chess Clock)', 'Goods', '1 piece', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 2500.00, 1),
(2, 2026, 'approved', 'PPMP-MWPTD-2026-015', 'Disinfectant Spray', 'Goods', '35 pieces', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 10500.00, 1),
(2, 2026, 'approved', 'PPMP-MWPTD-2026-016', 'Extension Wire (4-gang universal outlet)', 'Goods', '3 pieces', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 4500.00, 1),

-- ============================================================================
-- MWPSD PPMP ITEMS (dept_id=3, 12 items, Total: ₱1,364,500.00)
-- Source: MWPSD-PPMP 2026.xlsx
-- ============================================================================

(3, 2026, 'approved', 'PPMP-MWPSD-2026-001', 'ICT Office Supplies Expenses (Printer Inks - EPSON L3250 & L5290)', 'Goods', '1 Lot (160 bottles)', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 110000.00, 1),
(3, 2026, 'approved', 'PPMP-MWPSD-2026-002', 'Office Supplies Expenses (Paper, Data Folders, Pens, Staples, etc.)', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 50000.00, 1),
(3, 2026, 'approved', 'PPMP-MWPSD-2026-003', 'Semi-Expendable Office Equipment (Puncher, Stapler, Scissors, etc.)', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 50000.00, 1),
(3, 2026, 'approved', 'PPMP-MWPSD-2026-004', 'Semi-Expendable ICT Equipment (Hard Drives, Flash Drives, etc.)', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 50000.00, 1),
(3, 2026, 'approved', 'PPMP-MWPSD-2026-005', 'Semi-Expendable Furniture & Fixtures (Chairs, Cabinets)', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 50000.00, 1),
(3, 2026, 'approved', 'PPMP-MWPSD-2026-006', 'Other Supplies and Materials (Alcohol, Battery, Tissue, Cleaning Supplies)', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 99500.00, 1),
(3, 2026, 'approved', 'PPMP-MWPSD-2026-007', 'Postage and Courier Services', 'Services', '50 lots', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 50000.00, 1),
(3, 2026, 'approved', 'PPMP-MWPSD-2026-008', 'Pre-Employment Orientation Seminar (PEOS) - Meals, Tokens, Supplies', 'Goods', '200 pax', 'Small Value Procurement', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA 2026', 350000.00, 1),
(3, 2026, 'approved', 'PPMP-MWPSD-2026-009', 'Financial Literacy Training for OFW Families - Meals, Supplies', 'Goods', '100 pax', 'Small Value Procurement', 'NO', 'March 2026', 'November 2026', 'March 2026', 'GAA 2026', 200000.00, 1),
(3, 2026, 'approved', 'PPMP-MWPSD-2026-010', 'Skills Training and Livelihood Program - Meals, Supplies, Materials', 'Goods', '80 pax', 'Small Value Procurement', 'NO', 'April 2026', 'October 2026', 'April 2026', 'GAA 2026', 180000.00, 1),
(3, 2026, 'approved', 'PPMP-MWPSD-2026-011', 'Community-Based Reintegration Program - Meals, Venue, Materials', 'Goods', '50 pax', 'Small Value Procurement', 'NO', 'February 2026', 'November 2026', 'February 2026', 'GAA 2026', 125000.00, 1),
(3, 2026, 'approved', 'PPMP-MWPSD-2026-012', 'Tarpaulin Printing and Event Materials', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA 2026', 50000.00, 1),

-- ============================================================================
-- WRSD PPMP ITEMS (dept_id=4, 18 items, Total: ₱5,969,072.00)
-- Source: NGPA_PPMP-of-DMW-WRSD Caraga.xlsx
-- ============================================================================

-- WRSD Office Operations
(4, 2026, 'approved', 'PPMP-WRSD-2026-001', 'ICT Office Supplies (Printer Inks - EPSON L3250 & L5290)', 'Goods', '1 Lot (160 bottles)', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 110000.00, 1),
(4, 2026, 'approved', 'PPMP-WRSD-2026-002', 'Office Supplies Expenses (Paper, Folders, Pens, Envelopes)', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 88131.00, 1),
(4, 2026, 'approved', 'PPMP-WRSD-2026-003', 'Semi-Expendable Office Equipment', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 42660.00, 1),
(4, 2026, 'approved', 'PPMP-WRSD-2026-004', 'Semi-Expendable ICT Equipment', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 70000.00, 1),
(4, 2026, 'approved', 'PPMP-WRSD-2026-005', 'Other Supplies and Materials (Alcohol, Battery, Cleaning, Tarpaulin)', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'February 2026', 'March 2026', 'GAA 2026', 112560.00, 1),
-- WRSD Programs & Activities
(4, 2026, 'approved', 'PPMP-WRSD-2026-006', 'Capability Building Program for Children of OFWs (CAMP/DZMW Kids)', 'Goods', '1 Lot (Meals, Venue, Supplies)', 'Small Value Procurement', 'NO', 'March 2026', 'November 2026', 'March 2026', 'GAA 2026', 1354400.00, 1),
(4, 2026, 'approved', 'PPMP-WRSD-2026-007', 'Pre-Migration Orientation Seminar & Financial Planning - TOT', 'Goods', '1 Lot (Meals, Venue, Materials)', 'Small Value Procurement', 'NO', 'February 2026', 'October 2026', 'February 2026', 'GAA 2026', 437160.00, 1),
(4, 2026, 'approved', 'PPMP-WRSD-2026-008', 'Mental Health Awareness & Stress Management Seminar', 'Goods', '1 Lot (Meals, Venue, Materials)', 'Small Value Procurement', 'NO', 'April 2026', 'September 2026', 'April 2026', 'GAA 2026', 271280.00, 1),
(4, 2026, 'approved', 'PPMP-WRSD-2026-009', 'Byaheng Entrepreneur (Livelihood & Enterprise Development)', 'Goods', '1 Lot (Meals, Supplies, Materials)', 'Small Value Procurement', 'NO', 'March 2026', 'November 2026', 'March 2026', 'GAA 2026', 127700.00, 1),
(4, 2026, 'approved', 'PPMP-WRSD-2026-010', 'Financial Literacy Program for OFW Families', 'Goods', '1 Lot (Meals, Supplies)', 'Small Value Procurement', 'NO', 'April 2026', 'October 2026', 'April 2026', 'GAA 2026', 81525.00, 1),
(4, 2026, 'approved', 'PPMP-WRSD-2026-011', 'Psychosocial Counseling & Family Support Services', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'February 2026', 'November 2026', 'February 2026', 'GAA 2026', 250000.00, 1),
(4, 2026, 'approved', 'PPMP-WRSD-2026-012', 'Community-Based Welfare & Repatriation Support', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA 2026', 350000.00, 1),
(4, 2026, 'approved', 'PPMP-WRSD-2026-013', 'Disability & Gender Responsive Program', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'March 2026', 'October 2026', 'March 2026', 'GAA 2026', 150000.00, 1),
(4, 2026, 'approved', 'PPMP-WRSD-2026-014', 'Reintegration Education Seminar', 'Goods', '1 Lot (Meals, Venue, Materials)', 'Small Value Procurement', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA 2026', 191720.00, 1),
(4, 2026, 'approved', 'PPMP-WRSD-2026-015', 'Socio-Economic Reintegration Program for Distressed OFWs', 'Services', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA 2026', 500000.00, 1),
(4, 2026, 'approved', 'PPMP-WRSD-2026-016', 'Postage and Courier Services', 'Services', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA 2026', 50000.00, 1),
(4, 2026, 'approved', 'PPMP-WRSD-2026-017', 'Tarpaulin Printing and Event Materials (All Activities)', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA 2026', 31936.00, 1),
(4, 2026, 'approved', 'PPMP-WRSD-2026-018', 'Token/Giveaways for Program Participants', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA 2026', 1750000.00, 1),

-- ============================================================================
-- ORD PPMP ITEMS — Merged under FAD (dept_id=1) since FAD & ORD share one PPMP
-- ============================================================================

(1, 2026, 'approved', 'PPMP-FAD-2026-049', 'Office of the Regional Director - Representation Expenses', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA', 300000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-050', 'ORD Coordination & Monitoring Activities', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA', 200000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-051', 'Regional Management Committee Meetings', 'Goods', '4 Sessions', 'Small Value Procurement', 'NO', 'March 2026', 'December 2026', 'March 2026', 'GAA', 100000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-052', 'Stakeholder Engagement & Partnership Development', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'February 2026', 'November 2026', 'February 2026', 'GAA', 150000.00, 1),
(1, 2026, 'approved', 'PPMP-FAD-2026-053', 'ORD ICT and Office Supplies', 'Goods', '1 Lot', 'Small Value Procurement', 'NO', 'January 2026', 'December 2026', 'January 2026', 'GAA', 50000.00, 1);

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Per-division summary
SELECT 
  d.code AS division,
  COUNT(*) AS ppmp_entries,
  TO_CHAR(SUM(pp.total_amount), 'FM₱999,999,999.00') AS total_budget
FROM procurementplans pp
JOIN departments d ON pp.dept_id = d.id
WHERE pp.ppmp_no IS NOT NULL
GROUP BY d.code
ORDER BY d.code;

-- Grand total
SELECT 
  COUNT(*) AS total_ppmp_items,
  TO_CHAR(SUM(total_amount), 'FM₱999,999,999.00') AS grand_total
FROM procurementplans
WHERE ppmp_no IS NOT NULL;

-- Procurement mode distribution
SELECT 
  procurement_mode,
  COUNT(*) AS items,
  TO_CHAR(SUM(total_amount), 'FM₱999,999,999.00') AS total
FROM procurementplans
WHERE ppmp_no IS NOT NULL
GROUP BY procurement_mode
ORDER BY COUNT(*) DESC;
