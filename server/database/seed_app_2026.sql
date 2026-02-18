-- ============================================================
-- DMW CARAGA PROCUREMENT & INVENTORY SYSTEM
-- SEED DATA: Annual Procurement Plan (APP) for FY 2026
-- Source: NGPA_Indicative-Final-Updated-APP_CURRENT - APP.pdf
-- ============================================================
-- This script:
--   1. Clears old mock transaction data (PR → NOA chain)
--   2. Inserts APP/PPMP plans from the official APP document
--   3. Creates realistic PR → RFQ → Abstract → PostQual →
--      BAC Resolution → NOA chain based on actual APP items
--   4. Updates existing POs to link to new PRs/NOAs
-- ============================================================
-- Run AFTER consolidated_schema.sql + consolidated_seed.sql:
--   psql -U postgres -d dmw_db -p 5433 -f seed_app_2026.sql
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: CLEAR OLD MOCK TRANSACTION DATA
-- ============================================================
-- Delete in reverse FK dependency order
DELETE FROM notices_of_award;
DELETE FROM bac_resolutions;
DELETE FROM post_qualifications;
DELETE FROM abstract_quote_items;
DELETE FROM abstract_quotations;
DELETE FROM abstracts;
DELETE FROM rfq_suppliers;
DELETE FROM rfq_items;
DELETE FROM rfqs;
DELETE FROM pr_items;
DELETE FROM purchaserequests;
DELETE FROM plan_items;
DELETE FROM procurementplans;

-- Unlink POs from old PRs/NOAs
UPDATE purchaseorders SET pr_id = NULL, noa_id = NULL;

-- ============================================================
-- STEP 2: PROCUREMENT PLANS (APP FY 2026)
-- Each department gets one master plan from the APP document
-- Dept IDs: 1=FAD, 2=MWPTD, 3=MWPSD, 4=WRSD, 5=ORD
-- ============================================================

-- FAD Master Plan (covers most APP items)
INSERT INTO procurementplans (id, dept_id, fiscal_year, status, remarks, total_amount, created_by, approved_by, created_at, approved_at) VALUES
    (1, 1, 2026, 'approved', 'Annual Procurement Plan FY 2026 - FAD',           10344491.20, 1, 1, '2025-12-15 08:00:00', '2025-12-20 10:00:00'),
    (2, 2, 2026, 'approved', 'Annual Procurement Plan FY 2026 - MWPTD',           270000.00, 1, 1, '2025-12-15 08:00:00', '2025-12-20 10:00:00'),
    (3, 3, 2026, 'approved', 'Annual Procurement Plan FY 2026 - MWPSD',           771648.80, 1, 1, '2025-12-15 08:00:00', '2025-12-20 10:00:00'),
    (4, 4, 2026, 'approved', 'Annual Procurement Plan FY 2026 - WRSD',            754875.00, 1, 1, '2025-12-15 08:00:00', '2025-12-20 10:00:00'),
    (5, 5, 2026, 'approved', 'Annual Procurement Plan FY 2026 - ORD (CSE)',       800000.00, 1, 1, '2025-12-15 08:00:00', '2025-12-20 10:00:00');

SELECT setval('procurementplans_id_seq', 5);

-- ============================================================
-- STEP 2a: PLAN ITEMS (line items from the APP document)
-- ============================================================
INSERT INTO plan_items (plan_id, item_code, item_name, item_description, unit, unit_price, category,
    q1_qty, q2_qty, q3_qty, q4_qty, remarks) VALUES
    -- === FAD Plan (plan_id=1) ===
    -- General Requirements
    (1, 'APP-2026-001', 'Hiring of Security Guard Services',           'Security Services',                                           'LOT', 960000.00, 'SERVICES', 1, 0, 0, 0, 'SVP - Jan 2026'),
    (1, 'APP-2026-002', 'Hiring of Janitorial Services',               'Janitorial Service',                                          'LOT', 720000.00, 'SERVICES', 1, 0, 0, 0, 'SVP - Jan 2026'),
    (1, 'APP-2026-003', 'Repairs and Maintenance - Motor Vehicle',     'Provision of Repairs and Maintenance for Motor Vehicle',       'LOT', 300000.00, 'SERVICES', 0, 1, 0, 0, 'SVP - Feb to Nov 2026'),
    (1, 'APP-2026-004', 'Repairs and Maintenance - Office Equipment',  'Aircon, Printer, Photocopier repairs and maintenance',         'LOT', 500000.00, 'SERVICES', 0, 1, 0, 0, 'SVP - Feb to Nov 2026'),
    (1, 'APP-2026-005', 'Postage and Courier - FAD',                   'Postage and Courier for FAD documents',                       'LOT', 110000.00, 'SERVICES', 1, 0, 0, 0, 'SVP - Jan to Nov 2026'),
    (1, 'APP-2026-008', 'Rent of Office Building',                     'Rent-Building',                                               'LOT', 3641987.44, 'SERVICES', 0, 0, 1, 0, 'SVP - Aug to Sep 2026'),
    (1, 'APP-2026-009', 'Internet Expenses - FAD',                     'Internet Expenses for FAD office',                             'LOT', 120000.00, 'SERVICES', 1, 0, 0, 0, 'SVP - Jan 2026'),
    (1, 'APP-2026-013', 'Water Expenses',                              'Provision of Water Expenses',                                 'LOT', 200000.00, 'SERVICES', 1, 0, 0, 0, 'Direct Contracting - Jan 2026'),
    (1, 'APP-2026-014', 'Electricity Expenses',                        'Provision of Electricity Expenses',                           'LOT', 522652.56, 'SERVICES', 1, 0, 0, 0, 'Direct Contracting - Jan 2026'),
    -- ICT Supplies
    (1, 'APP-2026-015', 'ICT Supplies - FAD',                          'Printer Inks and Photocopier Toners for FAD',                 'LOT', 170000.00, 'EXPENDABLE', 1, 0, 0, 0, 'SVP - Jan to Mar 2026'),
    -- Other Supplies
    (1, 'APP-2026-019', 'Other Supplies and Materials',                 'Janitorial supplies, Fuel, etc',                              'LOT', 200000.00, 'EXPENDABLE', 1, 0, 0, 0, 'SVP - Jan to Mar 2026'),
    -- Semi-Expendable
    (1, 'APP-2026-020', 'Semi-Office Equipment',                       'Refrigerator, Wireless microphone, Paper shredder, laminating machine, binding machine, electric fan, puncher, and others', 'LOT', 200000.00, 'SEMI-EXPENDABLE', 1, 0, 0, 0, 'SVP - Jan to Mar 2026'),
    (1, 'APP-2026-021', 'Semi-ICT Equipment',                          'LCD Projector, WIFI Router, Tablet, external hard drive, and others', 'LOT', 190000.00, 'SEMI-EXPENDABLE', 1, 0, 0, 0, 'SVP - Jan to Mar 2026'),
    (1, 'APP-2026-022', 'Semi Furnitures and Fixtures',                 'Pedestal, Executive tables and chairs, Cabinets, and others',  'LOT', 200000.00, 'SEMI-EXPENDABLE', 1, 0, 0, 0, 'SVP - Jan to Mar 2026'),
    -- Trainings / Meals & Snacks
    (1, 'APP-2026-023', 'SPMS Coaching and Integration',                'Meals and Snacks for Strategic Performance Management System', 'LOT', 23000.00, 'SERVICES', 1, 0, 0, 0, 'SVP - Jan to Mar 2026'),
    (1, 'APP-2026-024', 'NGPA R.A. 12009 Training',                    'Meals and Snacks New Government Procurement Act',             'LOT', 108000.00, 'SERVICES', 0, 1, 0, 0, 'SVP - Feb to Nov 2026'),
    (1, 'APP-2026-025', 'News and Feature Writing Training',            'Training on effective news and feature writing and storytelling', 'LOT', 45000.00, 'SERVICES', 0, 1, 0, 0, 'SVP - Feb to Nov 2026'),
    (1, 'APP-2026-026', 'R.A. 6713 Training',                          'Code of Conduct and Ethical Standards for Public Officers and Employees', 'LOT', 45000.00, 'SERVICES', 0, 1, 0, 0, 'SVP - Feb 2026'),
    (1, 'APP-2026-027', 'Complete Staff Work & 7S Training',            'Lecture on complete staff work & 7s of good house keeping',    'LOT', 30000.00, 'SERVICES', 0, 0, 1, 0, 'SVP - Sep 2026'),
    (1, 'APP-2026-028', 'Effective Communication Training',             'Effective Communication and basic customer service skills',    'LOT', 30000.00, 'SERVICES', 0, 1, 0, 0, 'SVP - Apr 2026'),
    (1, 'APP-2026-029', 'Mental Health in the Workplace',               'Promoting mental health in the workplace',                    'LOT', 30000.00, 'SERVICES', 0, 1, 0, 0, 'SVP - Jun 2026'),
    (1, 'APP-2026-030', 'Orientation on GAD',                           'Orientation on gender and development',                       'LOT', 30000.00, 'SERVICES', 0, 0, 1, 0, 'SVP - Aug 2026'),
    (1, 'APP-2026-031', 'AI Tools Productivity Training',               'Productivity Revolution: How to integrate AI tools into your workflow', 'LOT', 30000.00, 'SERVICES', 0, 0, 0, 1, 'SVP - Oct 2026'),
    -- Events
    (1, 'APP-2026-034', 'Bagong Pilipinas Serbisyo Fair',               'Meals and Snacks for Bagong Pilipinas Serbisyo Fair',         'LOT', 100000.00, 'SERVICES', 1, 0, 0, 0, 'SVP - Mar 2026'),
    (1, 'APP-2026-035', 'Kapihan sa Bagong Pilipinas',                  'Meals and Snacks for Kapihan sa Bagong Pilipinas',            'LOT', 100000.00, 'SERVICES', 0, 1, 0, 0, 'SVP - Jun 2026'),
    (1, 'APP-2026-036', 'Handog ng Pangulo',                            'Meals and Snacks for Handog ng Pangulo',                      'LOT', 70000.00, 'SERVICES', 1, 0, 0, 0, 'SVP - Mar 2026'),
    (1, 'APP-2026-037', 'LAB for All',                                  'Meals and Snacks for LAB for All',                            'LOT', 70000.00, 'SERVICES', 0, 0, 1, 0, 'SVP - Sep 2026'),
    (1, 'APP-2026-038', 'Womens Month / Hudyaka Celebration',           'Meals and Snacks for Womens Month / Hudyaka Celebration',     'LOT', 100000.00, 'SERVICES', 0, 0, 1, 0, 'SVP - Sep 2026'),
    (1, 'APP-2026-039', 'Labor Day Celebration',                        'Meals and Snacks for Labor Day Celebration',                  'LOT', 25000.00, 'SERVICES', 1, 0, 0, 0, 'SVP - Mar 2026'),
    (1, 'APP-2026-040', 'Migrant Workers Day',                          'Meals and Snacks for Migrant Workers Day',                    'LOT', 150000.00, 'SERVICES', 0, 1, 0, 0, 'SVP - May 2026'),
    (1, 'APP-2026-041', 'Maritime Week Celebration',                    'Meals and Snacks for Maritime Week Celebration',              'LOT', 30000.00, 'SERVICES', 0, 1, 0, 0, 'SVP - Jun 2026'),
    (1, 'APP-2026-042', 'National Disaster Resilience Month',           'Meals and Snacks for National Disaster Resilience Month',     'LOT', 75000.00, 'SERVICES', 0, 1, 0, 0, 'SVP - Jun 2026'),
    (1, 'APP-2026-043', 'Anti-Trafficking Awareness Month',             'Meals and Snacks for National Anti-Trafficking in Persons Awareness Month', 'LOT', 75000.00, 'SERVICES', 0, 0, 1, 0, 'SVP - Jul 2026'),
    (1, 'APP-2026-044', 'Civil Service Month',                          'Meals and Snacks for Civil Service Month',                   'LOT', 30000.00, 'SERVICES', 0, 0, 1, 0, 'SVP - Jul 2026'),
    (1, 'APP-2026-045', 'Kainang Pamilya Mahalaga',                     'Meals and Snacks for Kainang Pamilya Mahalaga',              'LOT', 20000.00, 'SERVICES', 0, 0, 1, 0, 'SVP - Sep 2026'),
    (1, 'APP-2026-046', 'National Statistics Month',                    'Meals and Snacks for National Statistics Month',              'LOT', 20000.00, 'SERVICES', 0, 0, 1, 0, 'SVP - Sep 2026'),
    (1, 'APP-2026-047', 'Elderly Filipino Week',                        'Meals and Snacks for Elderly Filipino Week',                  'LOT', 30000.00, 'SERVICES', 0, 0, 0, 1, 'SVP - Oct 2026'),
    (1, 'APP-2026-048', 'National Mental Health Week',                   'Meals and Snacks for National Mental Health Week',            'LOT', 30000.00, 'SERVICES', 0, 0, 0, 1, 'SVP - Oct 2026'),
    (1, 'APP-2026-049', 'National Childrens Month',                     'Meals and Snacks for National Childrens Month',               'LOT', 30000.00, 'SERVICES', 0, 0, 0, 1, 'SVP - Oct 2026'),
    (1, 'APP-2026-050', '18-Day Campaign to End VAW',                   'Meals and Snacks for 18-Day Campaign to End Violence Against Women', 'LOT', 50000.00, 'SERVICES', 0, 0, 0, 1, 'SVP - Oct 2026'),
    (1, 'APP-2026-051', 'MYPA and YEPA',                                'Meals and Snacks for MYPA and YEPA',                         'LOT', 413851.20, 'SERVICES', 0, 0, 0, 1, 'SVP - Nov to Dec 2026'),
    (1, 'APP-2026-052', 'DMW Anniversary Celebration',                  'Meals and Snacks for DMW Anniversary Celebration',            'LOT', 200000.00, 'SERVICES', 0, 1, 0, 1, 'SVP - Jun and Dec 2026'),
    (1, 'APP-2026-053', 'Regional Planning Conference',                 'Meals and Snacks for Hosting of Regional Planning Conference', 'LOT', 450000.00, 'SERVICES', 0, 0, 0, 1, 'SVP - Dec 2026'),
    (1, 'APP-2026-054', 'Org Development / Capability Enhancement',     'Organizational Development Activity/Capability Enhancement Training', 'LOT', 250000.00, 'SERVICES', 1, 0, 0, 0, 'SVP - Mar 2026'),
    (1, 'APP-2026-055', 'GAD Quarterly Meeting',                        'Meals and Snacks for GAD Quarterly Meeting',                  'LOT', 20000.00, 'SERVICES', 0, 1, 0, 0, 'SVP - May 2026'),
    (1, 'APP-2026-062', 'DICT PNPKI Users Training',                   'Meals and Snacks for DICT PNPKI Users Training',             'LOT', 16500.00, 'SERVICES', 0, 1, 0, 0, 'SVP - Apr 2026'),

    -- === MWPTD Plan (plan_id=2) ===
    (2, 'APP-2026-006', 'Postage and Courier - MWPTD',                  'Postage and Courier for MWPTD documents',                    'LOT', 50000.00, 'SERVICES', 1, 0, 0, 0, 'SVP - Jan to Nov 2026'),
    (2, 'APP-2026-012', 'Internet Expenses - MWPTD',                    'Internet Expenses for MWPTD office',                         'LOT', 100000.00, 'SERVICES', 1, 0, 0, 0, 'SVP - Jan 2026'),
    (2, 'APP-2026-018', 'ICT Supplies - MWPTD',                         'Printer Inks and Photocopier Toners for MWPTD',               'LOT', 110000.00, 'EXPENDABLE', 1, 0, 0, 0, 'SVP - Jan to Mar 2026'),
    (2, 'APP-2026-032', 'Accreditation Training Mediators',              'Accreditation training for mediators and conciliators',       'LOT', 30000.00, 'SERVICES', 0, 0, 0, 1, 'SVP - Nov 2026'),
    (2, 'APP-2026-033', 'Advanced Case Management Training',             'Advanced Case Management Training for Protection Division Officers', 'LOT', 30000.00, 'SERVICES', 0, 1, 0, 0, 'SVP - Feb 2026'),

    -- (Note: MWPTD total below is adjusted to 270,000 minus what's already shown)
    -- Remaining MWPTD allocation goes into general operational

    -- === MWPSD Plan (plan_id=3) ===
    (3, 'APP-2026-007', 'Postage and Courier - MWPSD',                  'Postage and Courier for MWPSD documents',                    'LOT', 50000.00, 'SERVICES', 1, 0, 0, 0, 'SVP - Jan to Nov 2026'),
    (3, 'APP-2026-011', 'Internet Expenses - MWPSD',                    'Internet Expenses for MWPSD office',                         'LOT', 100000.00, 'SERVICES', 1, 0, 0, 0, 'SVP - Jan 2026'),
    (3, 'APP-2026-017', 'ICT Supplies - MWPSD',                         'Printer Inks and Photocopier Toners for MWPSD',               'LOT', 110000.00, 'EXPENDABLE', 1, 0, 0, 0, 'SVP - Jan to Mar 2026'),
    (3, 'APP-2026-058', 'Dialogue with PESO/DOLE',                      'Conduct of Dialogue with Provincial PESO, City PESO, and DOLE Field Offices', 'LOT', 52748.80, 'SERVICES', 1, 0, 0, 0, 'SVP - Jan to Feb 2026'),
    (3, 'APP-2026-061', 'Job Fair during Migrants Day',                  'Conduct of Job Fair during Migrants Day',                    'LOT', 133900.00, 'SERVICES', 1, 0, 0, 0, 'SVP - Jan to Feb 2026'),
    (3, 'APP-2026-063', 'Capital Outlay - MWPSD',                       'ICT, Office Equipment, Furniture and Fixture',               'LOT', 435000.00, 'CAPITAL OUTLAY', 1, 1, 1, 1, 'SVP - Jan to Nov 2026'),

    -- === WRSD Plan (plan_id=4) ===
    (4, 'APP-2026-010', 'Internet Expenses - WRSD',                     'Internet Expenses for WRSD office',                          'LOT', 100000.00, 'SERVICES', 1, 0, 0, 0, 'SVP - Jan 2026'),
    (4, 'APP-2026-016', 'ICT Supplies - WRSD',                          'Printer Inks and Photocopier Toners for WRSD',                'LOT', 110000.00, 'EXPENDABLE', 1, 0, 0, 0, 'SVP - Jan to Mar 2026'),
    (4, 'APP-2026-056', 'OFW Children Orientation - SNSU',              'Orientation and Organization meeting with children of OFWs enrolled in SNSU', 'LOT', 43750.00, 'SERVICES', 1, 1, 1, 1, 'SVP - Mar/Jun/Sep/Nov 2026'),
    (4, 'APP-2026-057', 'OFW Children Capability Building - PNUM',      'Capability Building Program for Children of OFWs at PNUM',   'LOT', 48125.00, 'SERVICES', 1, 0, 0, 0, 'SVP - Jan to Feb 2026'),
    (4, 'APP-2026-059', 'Mental Health Awareness Seminar',               'Mental Health Awareness and Stress Management Seminar',      'LOT', 271280.00, 'SERVICES', 1, 0, 0, 0, 'SVP - Jan to Feb 2026'),
    (4, 'APP-2026-060', 'Reintegration Education Seminar',               'Reintegration Education Seminar',                           'LOT', 191720.00, 'SERVICES', 1, 0, 0, 0, 'SVP - Jan to Feb 2026'),

    -- === ORD / All Divisions - CSE Plan (plan_id=5) ===
    (5, 'APP-2026-064', 'Common-Use Supplies and Equipment (CSE)',       'Supply and Delivery of Quarterly Common-Used Supplies and Equipment from PS-DBM', 'LOT', 200000.00, 'EXPENDABLE', 1, 1, 1, 1, 'Agency-To-Agency - Quarterly');


-- ============================================================
-- STEP 3: PURCHASE REQUESTS (based on APP items that have
--         started procurement as of Feb 2026)
-- ============================================================
INSERT INTO purchaserequests (id, pr_number, dept_id, purpose, total_amount, status, requested_by, created_at) VALUES
    -- Q1 2026 PRs (procurement started Jan-Feb 2026)
    (1,  'PR-2026-001', 1, 'Hiring of Security Guard Services for DMW-CARAGA FY 2026',                                960000.00,  'approved',  1, '2026-01-06 08:00:00'),
    (2,  'PR-2026-002', 1, 'Hiring of Janitorial Services for DMW-CARAGA FY 2026',                                    720000.00,  'approved',  1, '2026-01-06 09:00:00'),
    (3,  'PR-2026-003', 1, 'Provision of Repairs and Maintenance for Motor Vehicle FY 2026',                           300000.00,  'approved',  1, '2026-02-03 08:00:00'),
    (4,  'PR-2026-004', 1, 'Provision of Repairs and Maintenance for Office Equipment (Aircon, Printer, Photocopier)', 500000.00,  'approved',  1, '2026-02-03 09:00:00'),
    (5,  'PR-2026-005', 1, 'Provision of Postage and Courier for FAD documents FY 2026',                               110000.00,  'approved',  1, '2026-01-07 08:00:00'),
    (6,  'PR-2026-006', 2, 'Provision of Postage and Courier for MWPTD documents FY 2026',                              50000.00,  'approved',  1, '2026-01-07 09:00:00'),
    (7,  'PR-2026-007', 3, 'Provision of Postage and Courier for MWPSD documents FY 2026',                              50000.00,  'approved',  1, '2026-01-07 10:00:00'),
    (8,  'PR-2026-008', 1, 'Provision of Internet Expenses for FAD office FY 2026',                                    120000.00,  'approved',  1, '2026-01-08 08:00:00'),
    (9,  'PR-2026-009', 4, 'Provision of Internet Expenses for WRSD office FY 2026',                                   100000.00,  'approved',  1, '2026-01-08 09:00:00'),
    (10, 'PR-2026-010', 3, 'Provision of Internet Expenses for MWPSD office FY 2026',                                  100000.00,  'approved',  1, '2026-01-08 10:00:00'),
    (11, 'PR-2026-011', 2, 'Provision of Internet Expenses for MWPTD office FY 2026',                                  100000.00,  'approved',  1, '2026-01-08 11:00:00'),
    (12, 'PR-2026-012', 1, 'Provision of Water Expenses FY 2026',                                                      200000.00,  'approved',  1, '2026-01-09 08:00:00'),
    (13, 'PR-2026-013', 1, 'Provision of Electricity Expenses FY 2026',                                                522652.56,  'approved',  1, '2026-01-09 09:00:00'),
    (14, 'PR-2026-014', 1, 'Procurement of ICT Supplies (Printer Inks and Photocopier Toners) for FAD',                170000.00,  'approved',  1, '2026-01-13 08:00:00'),
    (15, 'PR-2026-015', 4, 'Procurement of ICT Supplies (Printer Inks and Photocopier Toners) for WRSD',               110000.00,  'approved',  1, '2026-01-13 09:00:00'),
    (16, 'PR-2026-016', 3, 'Procurement of ICT Supplies (Printer Inks and Photocopier Toners) for MWPSD',              110000.00,  'approved',  1, '2026-01-13 10:00:00'),
    (17, 'PR-2026-017', 2, 'Procurement of ICT Supplies (Printer Inks and Photocopier Toners) for MWPTD',              110000.00,  'approved',  1, '2026-01-13 11:00:00'),
    (18, 'PR-2026-018', 1, 'Procurement of Other Supplies and Materials (Janitorial supplies, Fuel, etc)',              200000.00,  'approved',  1, '2026-01-14 08:00:00'),
    (19, 'PR-2026-019', 1, 'Procurement of Semi-Office Equipment (Refrigerator, Wireless microphone, Paper shredder, laminating machine, binding machine, electric fan, puncher, and others)', 200000.00, 'approved', 1, '2026-01-14 09:00:00'),
    (20, 'PR-2026-020', 1, 'Procurement of Semi-ICT Equipment (LCD Projector, WIFI Router, Tablet, external hard drive, and others)', 190000.00, 'approved', 1, '2026-01-14 10:00:00'),
    (21, 'PR-2026-021', 1, 'Procurement of Semi Furnitures and Fixtures (Pedestal, Executive tables and chairs, Cabinets, and others)', 200000.00, 'approved', 1, '2026-01-14 11:00:00'),
    (22, 'PR-2026-022', 1, 'Meals and Snacks for SPMS Coaching and Integration',                                        23000.00,  'approved',  1, '2026-01-15 08:00:00'),
    (23, 'PR-2026-023', 1, 'Meals and Snacks for R.A. 6713: Code of Conduct and Ethical Standards',                      45000.00,  'approved',  1, '2026-02-02 08:00:00'),
    (24, 'PR-2026-024', 2, 'Meals and Snacks for Advanced Case Management Training for Protection Division Officers',    30000.00,  'approved',  1, '2026-02-02 09:00:00'),
    (25, 'PR-2026-025', 1, 'Meals and Snacks for Bagong Pilipinas Serbisyo Fair',                                       100000.00, 'pending',   1, '2026-02-10 08:00:00'),
    (26, 'PR-2026-026', 1, 'Meals and Snacks for Handog ng Pangulo',                                                     70000.00, 'pending',   1, '2026-02-10 09:00:00'),
    (27, 'PR-2026-027', 1, 'Meals and Snacks for Labor Day Celebration',                                                  25000.00, 'pending',   1, '2026-02-10 10:00:00'),
    (28, 'PR-2026-028', 1, 'Meals and Snacks for Organizational Development / Capability Enhancement Training',          250000.00, 'pending',   1, '2026-02-12 08:00:00'),
    (29, 'PR-2026-029', 5, 'Supply and Delivery of Quarterly Common-Used Supplies and Equipment (Q1)',                   200000.00, 'approved',  1, '2026-01-06 08:00:00'),
    (30, 'PR-2026-030', 4, 'Capability Building Program for Children of OFWs at PNUM',                                   48125.00, 'approved',  1, '2026-01-15 08:00:00'),
    (31, 'PR-2026-031', 3, 'Conduct of Dialogue with Provincial PESO, City PESO, and DOLE Field Offices',                52748.80, 'approved',  1, '2026-01-15 09:00:00'),
    (32, 'PR-2026-032', 4, 'Mental Health Awareness and Stress Management Seminar',                                     271280.00, 'approved',  1, '2026-01-16 08:00:00'),
    (33, 'PR-2026-033', 4, 'Reintegration Education Seminar',                                                           191720.00, 'approved',  1, '2026-01-16 09:00:00'),
    (34, 'PR-2026-034', 3, 'Conduct of Job Fair during Migrants Day',                                                   133900.00, 'approved',  1, '2026-01-16 10:00:00'),
    (35, 'PR-2026-035', 3, 'Procurement of Capital Outlay (ICT, Office Equipment, Furniture and Fixture) for MWPSD',    435000.00, 'pending',   1, '2026-02-03 08:00:00')
ON CONFLICT (pr_number) DO NOTHING;

SELECT setval('purchaserequests_id_seq', 35);

-- ============================================================
-- STEP 3a: PR ITEMS
-- ============================================================
INSERT INTO pr_items (pr_id, item_code, item_name, unit, quantity, unit_price) VALUES
    (1,  'APP-2026-001', 'Security Guard Services - 12 months',              'LOT', 1, 960000.00),
    (2,  'APP-2026-002', 'Janitorial Services - 12 months',                  'LOT', 1, 720000.00),
    (3,  'APP-2026-003', 'Repairs and Maintenance - Motor Vehicle',          'LOT', 1, 300000.00),
    (4,  'APP-2026-004', 'Repairs and Maintenance - Office Equipment',       'LOT', 1, 500000.00),
    (5,  'APP-2026-005', 'Postage and Courier Services - FAD',               'LOT', 1, 110000.00),
    (6,  'APP-2026-006', 'Postage and Courier Services - MWPTD',             'LOT', 1, 50000.00),
    (7,  'APP-2026-007', 'Postage and Courier Services - MWPSD',             'LOT', 1, 50000.00),
    (8,  'APP-2026-009', 'Internet Service - FAD',                           'LOT', 1, 120000.00),
    (9,  'APP-2026-010', 'Internet Service - WRSD',                          'LOT', 1, 100000.00),
    (10, 'APP-2026-011', 'Internet Service - MWPSD',                         'LOT', 1, 100000.00),
    (11, 'APP-2026-012', 'Internet Service - MWPTD',                         'LOT', 1, 100000.00),
    (12, 'APP-2026-013', 'Water Utility Services',                           'LOT', 1, 200000.00),
    (13, 'APP-2026-014', 'Electricity Utility Services',                     'LOT', 1, 522652.56),
    (14, 'APP-2026-015', 'Printer Inks and Photocopier Toners',              'LOT', 1, 170000.00),
    (15, 'APP-2026-016', 'Printer Inks and Photocopier Toners',              'LOT', 1, 110000.00),
    (16, 'APP-2026-017', 'Printer Inks and Photocopier Toners',              'LOT', 1, 110000.00),
    (17, 'APP-2026-018', 'Printer Inks and Photocopier Toners',              'LOT', 1, 110000.00),
    (18, 'APP-2026-019', 'Janitorial Supplies, Fuel, and other Materials',   'LOT', 1, 200000.00),
    (19, 'APP-2026-020', 'Semi-Expendable Office Equipment',                 'LOT', 1, 200000.00),
    (20, 'APP-2026-021', 'Semi-Expendable ICT Equipment',                    'LOT', 1, 190000.00),
    (21, 'APP-2026-022', 'Semi-Expendable Furnitures and Fixtures',          'LOT', 1, 200000.00),
    (22, 'APP-2026-023', 'Meals and Snacks - SPMS',                          'LOT', 1, 23000.00),
    (23, 'APP-2026-026', 'Meals and Snacks - R.A. 6713',                     'LOT', 1, 45000.00),
    (24, 'APP-2026-033', 'Meals and Snacks - Case Management Training',      'LOT', 1, 30000.00),
    (25, 'APP-2026-034', 'Meals and Snacks - Bagong Pilipinas Serbisyo Fair','LOT', 1, 100000.00),
    (26, 'APP-2026-036', 'Meals and Snacks - Handog ng Pangulo',             'LOT', 1, 70000.00),
    (27, 'APP-2026-039', 'Meals and Snacks - Labor Day',                     'LOT', 1, 25000.00),
    (28, 'APP-2026-054', 'Meals and Snacks - Org Development',               'LOT', 1, 250000.00),
    (29, 'APP-2026-064', 'Common-Use Supplies and Equipment Q1',             'LOT', 1, 200000.00),
    (30, 'APP-2026-057', 'Meals, Snacks, Supplies - OFW Children PNUM',      'LOT', 1, 48125.00),
    (31, 'APP-2026-058', 'Meals, Snacks, Supplies - Dialogue PESO/DOLE',     'LOT', 1, 52748.80),
    (32, 'APP-2026-059', 'Meals, Snacks, Supplies - Mental Health Seminar',  'LOT', 1, 271280.00),
    (33, 'APP-2026-060', 'Meals, Snacks, Supplies - Reintegration Seminar',  'LOT', 1, 191720.00),
    (34, 'APP-2026-061', 'Meals, Snacks, Supplies - Job Fair Migrants Day',  'LOT', 1, 133900.00),
    (35, 'APP-2026-063', 'ICT, Office Equipment, Furniture and Fixture',     'LOT', 1, 435000.00);


-- ============================================================
-- STEP 4: RFQs (for approved PRs that have started procurement)
-- ============================================================
INSERT INTO rfqs (id, rfq_number, pr_id, date_prepared, submission_deadline, abc_amount, status, created_by, created_at) VALUES
    (1,  'RFQ-2026-001', 1,  '2026-01-08', '2026-01-15', 960000.00,  'closed',  1, '2026-01-08 08:00:00'),
    (2,  'RFQ-2026-002', 2,  '2026-01-08', '2026-01-15', 720000.00,  'closed',  1, '2026-01-08 09:00:00'),
    (3,  'RFQ-2026-003', 3,  '2026-02-05', '2026-02-12', 300000.00,  'closed',  1, '2026-02-05 08:00:00'),
    (4,  'RFQ-2026-004', 4,  '2026-02-05', '2026-02-12', 500000.00,  'closed',  1, '2026-02-05 09:00:00'),
    (5,  'RFQ-2026-005', 5,  '2026-01-09', '2026-01-14', 110000.00,  'closed',  1, '2026-01-09 08:00:00'),
    (6,  'RFQ-2026-006', 14, '2026-01-15', '2026-01-22', 170000.00,  'closed',  1, '2026-01-15 08:00:00'),
    (7,  'RFQ-2026-007', 15, '2026-01-15', '2026-01-22', 110000.00,  'closed',  1, '2026-01-15 09:00:00'),
    (8,  'RFQ-2026-008', 16, '2026-01-15', '2026-01-22', 110000.00,  'closed',  1, '2026-01-15 10:00:00'),
    (9,  'RFQ-2026-009', 17, '2026-01-15', '2026-01-22', 110000.00,  'closed',  1, '2026-01-15 11:00:00'),
    (10, 'RFQ-2026-010', 18, '2026-01-16', '2026-01-23', 200000.00,  'closed',  1, '2026-01-16 08:00:00'),
    (11, 'RFQ-2026-011', 19, '2026-01-16', '2026-01-23', 200000.00,  'closed',  1, '2026-01-16 09:00:00'),
    (12, 'RFQ-2026-012', 20, '2026-01-16', '2026-01-23', 190000.00,  'closed',  1, '2026-01-16 10:00:00'),
    (13, 'RFQ-2026-013', 21, '2026-01-16', '2026-01-23', 200000.00,  'closed',  1, '2026-01-16 11:00:00'),
    (14, 'RFQ-2026-014', 22, '2026-01-17', '2026-01-24', 23000.00,   'closed',  1, '2026-01-17 08:00:00'),
    (15, 'RFQ-2026-015', 23, '2026-02-04', '2026-02-10', 45000.00,   'closed',  1, '2026-02-04 08:00:00'),
    (16, 'RFQ-2026-016', 24, '2026-02-04', '2026-02-10', 30000.00,   'closed',  1, '2026-02-04 09:00:00'),
    (17, 'RFQ-2026-017', 30, '2026-01-17', '2026-01-24', 48125.00,   'closed',  1, '2026-01-17 09:00:00'),
    (18, 'RFQ-2026-018', 31, '2026-01-17', '2026-01-24', 52748.80,   'closed',  1, '2026-01-17 10:00:00'),
    (19, 'RFQ-2026-019', 32, '2026-01-19', '2026-01-26', 271280.00,  'closed',  1, '2026-01-19 08:00:00'),
    (20, 'RFQ-2026-020', 33, '2026-01-19', '2026-01-26', 191720.00,  'closed',  1, '2026-01-19 09:00:00'),
    (21, 'RFQ-2026-021', 34, '2026-01-19', '2026-01-26', 133900.00,  'closed',  1, '2026-01-19 10:00:00'),
    (22, 'RFQ-2026-022', 29, '2026-01-08', '2026-01-15', 200000.00,  'closed',  1, '2026-01-08 10:00:00')
ON CONFLICT (rfq_number) DO NOTHING;

SELECT setval('rfqs_id_seq', 22);

-- ============================================================
-- STEP 4a: RFQ ITEMS
-- ============================================================
INSERT INTO rfq_items (rfq_id, item_code, item_name, unit, quantity, abc_unit_cost) VALUES
    (1,  'APP-2026-001', 'Security Guard Services - 12 months',         'LOT', 1, 960000.00),
    (2,  'APP-2026-002', 'Janitorial Services - 12 months',             'LOT', 1, 720000.00),
    (3,  'APP-2026-003', 'Repairs and Maintenance - Motor Vehicle',     'LOT', 1, 300000.00),
    (4,  'APP-2026-004', 'Repairs and Maintenance - Office Equipment',  'LOT', 1, 500000.00),
    (5,  'APP-2026-005', 'Postage and Courier Services - FAD',          'LOT', 1, 110000.00),
    (6,  'APP-2026-015', 'Printer Inks and Toners - FAD',               'LOT', 1, 170000.00),
    (7,  'APP-2026-016', 'Printer Inks and Toners - WRSD',              'LOT', 1, 110000.00),
    (8,  'APP-2026-017', 'Printer Inks and Toners - MWPSD',             'LOT', 1, 110000.00),
    (9,  'APP-2026-018', 'Printer Inks and Toners - MWPTD',             'LOT', 1, 110000.00),
    (10, 'APP-2026-019', 'Janitorial Supplies, Fuel, etc',              'LOT', 1, 200000.00),
    (11, 'APP-2026-020', 'Semi-Expendable Office Equipment',            'LOT', 1, 200000.00),
    (12, 'APP-2026-021', 'Semi-Expendable ICT Equipment',               'LOT', 1, 190000.00),
    (13, 'APP-2026-022', 'Semi-Expendable Furnitures and Fixtures',     'LOT', 1, 200000.00),
    (14, 'APP-2026-023', 'Meals and Snacks - SPMS',                     'LOT', 1, 23000.00),
    (15, 'APP-2026-026', 'Meals and Snacks - R.A. 6713',                'LOT', 1, 45000.00),
    (16, 'APP-2026-033', 'Meals and Snacks - Case Management',          'LOT', 1, 30000.00),
    (17, 'APP-2026-057', 'Meals, Snacks - OFW Children PNUM',           'LOT', 1, 48125.00),
    (18, 'APP-2026-058', 'Meals, Snacks - Dialogue PESO/DOLE',          'LOT', 1, 52748.80),
    (19, 'APP-2026-059', 'Meals, Snacks - Mental Health Seminar',       'LOT', 1, 271280.00),
    (20, 'APP-2026-060', 'Meals, Snacks - Reintegration Seminar',       'LOT', 1, 191720.00),
    (21, 'APP-2026-061', 'Meals, Snacks - Job Fair Migrants Day',       'LOT', 1, 133900.00),
    (22, 'APP-2026-064', 'Common-Use Supplies and Equipment Q1',        'LOT', 1, 200000.00);

-- ============================================================
-- STEP 4b: RFQ SUPPLIERS
-- ============================================================
INSERT INTO rfq_suppliers (rfq_id, supplier_id, invited_at, responded) VALUES
    -- Security Guard
    (1, 1, '2026-01-08', true),
    (1, 2, '2026-01-08', true),
    -- Janitorial
    (2, 1, '2026-01-08', true),
    (2, 9, '2026-01-08', true),
    -- Motor Vehicle Repairs
    (3, 5, '2026-02-05', true),
    (3, 8, '2026-02-05', false),
    -- Office Equipment Repairs
    (4, 5, '2026-02-05', true),
    (4, 1, '2026-02-05', true),
    -- Postage FAD
    (5, 7, '2026-01-09', true),
    -- ICT Supplies FAD
    (6, 1, '2026-01-15', true),
    (6, 4, '2026-01-15', true),
    -- ICT Supplies WRSD
    (7, 1, '2026-01-15', true),
    -- ICT Supplies MWPSD
    (8, 1, '2026-01-15', true),
    -- ICT Supplies MWPTD
    (9, 1, '2026-01-15', true),
    -- Other Supplies
    (10, 2, '2026-01-16', true),
    (10, 9, '2026-01-16', true),
    -- Semi-Office Equipment
    (11, 1, '2026-01-16', true),
    (11, 8, '2026-01-16', true),
    -- Semi-ICT Equipment
    (12, 1, '2026-01-16', true),
    (12, 4, '2026-01-16', true),
    -- Furnitures
    (13, 8, '2026-01-16', true),
    (13, 2, '2026-01-16', true),
    -- SPMS Meals
    (14, 9, '2026-01-17', true),
    -- RA 6713 Meals
    (15, 9, '2026-02-04', true),
    -- Case Management Meals
    (16, 9, '2026-02-04', true),
    -- OFW Children PNUM
    (17, 9, '2026-01-17', true),
    -- Dialogue PESO/DOLE
    (18, 9, '2026-01-17', true),
    -- Mental Health Seminar
    (19, 9, '2026-01-19', true),
    (19, 2, '2026-01-19', true),
    -- Reintegration Seminar
    (20, 9, '2026-01-19', true),
    -- Job Fair
    (21, 9, '2026-01-19', true),
    (21, 2, '2026-01-19', true),
    -- CSE Q1
    (22, 3, '2026-01-08', true);


-- ============================================================
-- STEP 5: ABSTRACTS (for closed RFQs)
-- ============================================================
INSERT INTO abstracts (id, abstract_number, rfq_id, date_prepared, purpose, status, recommended_supplier_id, recommended_amount, created_by, created_at) VALUES
    (1,  'ABS-2026-001', 1,  '2026-01-16', 'Security Guard Services FY 2026',                 'approved',  1, 960000.00,  1, '2026-01-16 08:00:00'),
    (2,  'ABS-2026-002', 2,  '2026-01-16', 'Janitorial Services FY 2026',                     'approved',  9, 720000.00,  1, '2026-01-16 09:00:00'),
    (3,  'ABS-2026-003', 3,  '2026-02-13', 'Repairs and Maintenance - Motor Vehicle',         'approved',  5, 295000.00,  1, '2026-02-13 08:00:00'),
    (4,  'ABS-2026-004', 4,  '2026-02-13', 'Repairs and Maintenance - Office Equipment',      'approved',  5, 490000.00,  1, '2026-02-13 09:00:00'),
    (5,  'ABS-2026-005', 5,  '2026-01-15', 'Postage and Courier - FAD',                       'approved',  7, 108500.00,  1, '2026-01-15 08:00:00'),
    (6,  'ABS-2026-006', 6,  '2026-01-23', 'ICT Supplies - FAD',                              'approved',  1, 168000.00,  1, '2026-01-23 08:00:00'),
    (7,  'ABS-2026-007', 7,  '2026-01-23', 'ICT Supplies - WRSD',                             'approved',  1, 109000.00,  1, '2026-01-23 09:00:00'),
    (8,  'ABS-2026-008', 8,  '2026-01-23', 'ICT Supplies - MWPSD',                            'approved',  1, 109000.00,  1, '2026-01-23 10:00:00'),
    (9,  'ABS-2026-009', 9,  '2026-01-23', 'ICT Supplies - MWPTD',                            'approved',  1, 109000.00,  1, '2026-01-23 11:00:00'),
    (10, 'ABS-2026-010', 10, '2026-01-24', 'Other Supplies and Materials',                     'approved',  2, 198000.00,  1, '2026-01-24 08:00:00'),
    (11, 'ABS-2026-011', 11, '2026-01-24', 'Semi-Office Equipment',                           'approved',  1, 198000.00,  1, '2026-01-24 09:00:00'),
    (12, 'ABS-2026-012', 12, '2026-01-24', 'Semi-ICT Equipment',                              'approved',  4, 188000.00,  1, '2026-01-24 10:00:00'),
    (13, 'ABS-2026-013', 13, '2026-01-24', 'Semi Furnitures and Fixtures',                     'approved',  8, 198000.00,  1, '2026-01-24 11:00:00'),
    (14, 'ABS-2026-014', 14, '2026-01-25', 'Meals and Snacks - SPMS',                         'approved',  9, 22500.00,   1, '2026-01-25 08:00:00'),
    (15, 'ABS-2026-015', 15, '2026-02-11', 'Meals and Snacks - R.A. 6713',                    'approved',  9, 44500.00,   1, '2026-02-11 08:00:00'),
    (16, 'ABS-2026-016', 16, '2026-02-11', 'Meals and Snacks - Case Management Training',     'approved',  9, 29500.00,   1, '2026-02-11 09:00:00'),
    (17, 'ABS-2026-017', 17, '2026-01-25', 'OFW Children Capability Building - PNUM',         'approved',  9, 47500.00,   1, '2026-01-25 09:00:00'),
    (18, 'ABS-2026-018', 18, '2026-01-25', 'Dialogue with PESO/DOLE',                         'approved',  9, 52000.00,   1, '2026-01-25 10:00:00'),
    (19, 'ABS-2026-019', 19, '2026-01-27', 'Mental Health Awareness Seminar',                  'approved',  9, 270000.00,  1, '2026-01-27 08:00:00'),
    (20, 'ABS-2026-020', 20, '2026-01-27', 'Reintegration Education Seminar',                  'approved',  9, 190000.00,  1, '2026-01-27 09:00:00'),
    (21, 'ABS-2026-021', 21, '2026-01-27', 'Job Fair during Migrants Day',                     'approved',  9, 133000.00,  1, '2026-01-27 10:00:00'),
    (22, 'ABS-2026-022', 22, '2026-01-16', 'Common-Use Supplies and Equipment Q1',             'approved',  3, 200000.00,  1, '2026-01-16 10:00:00')
ON CONFLICT (abstract_number) DO NOTHING;

SELECT setval('abstracts_id_seq', 22);

-- ============================================================
-- STEP 5a: ABSTRACT QUOTATIONS
-- ============================================================
INSERT INTO abstract_quotations (id, abstract_id, supplier_id, bid_amount, is_compliant, remarks, rank_no) VALUES
    (1,  1,  1, 960000.00, true,  'Lowest compliant bid', 1),
    (2,  1,  2, 980000.00, true,  'Second lowest',        2),
    (3,  2,  9, 720000.00, true,  'Lowest compliant bid', 1),
    (4,  2,  1, 750000.00, true,  'Second lowest',        2),
    (5,  3,  5, 295000.00, true,  'Lowest compliant bid', 1),
    (6,  4,  5, 490000.00, true,  'Lowest compliant bid', 1),
    (7,  4,  1, 498000.00, true,  'Second lowest',        2),
    (8,  5,  7, 108500.00, true,  'Lowest compliant bid', 1),
    (9,  6,  1, 168000.00, true,  'Lowest compliant bid', 1),
    (10, 6,  4, 172000.00, true,  'Second lowest',        2),
    (11, 7,  1, 109000.00, true,  'Lowest compliant bid', 1),
    (12, 8,  1, 109000.00, true,  'Lowest compliant bid', 1),
    (13, 9,  1, 109000.00, true,  'Lowest compliant bid', 1),
    (14, 10, 2, 198000.00, true,  'Lowest compliant bid', 1),
    (15, 10, 9, 199500.00, true,  'Second lowest',        2),
    (16, 11, 1, 198000.00, true,  'Lowest compliant bid', 1),
    (17, 11, 8, 199000.00, true,  'Second lowest',        2),
    (18, 12, 4, 188000.00, true,  'Lowest compliant bid', 1),
    (19, 12, 1, 189500.00, true,  'Second lowest',        2),
    (20, 13, 8, 198000.00, true,  'Lowest compliant bid', 1),
    (21, 13, 2, 199000.00, true,  'Second lowest',        2),
    (22, 14, 9, 22500.00,  true,  'Lowest compliant bid', 1),
    (23, 15, 9, 44500.00,  true,  'Lowest compliant bid', 1),
    (24, 16, 9, 29500.00,  true,  'Lowest compliant bid', 1),
    (25, 17, 9, 47500.00,  true,  'Lowest compliant bid', 1),
    (26, 18, 9, 52000.00,  true,  'Lowest compliant bid', 1),
    (27, 19, 9, 270000.00, true,  'Lowest compliant bid', 1),
    (28, 19, 2, 271000.00, true,  'Second lowest',        2),
    (29, 20, 9, 190000.00, true,  'Lowest compliant bid', 1),
    (30, 21, 9, 133000.00, true,  'Lowest compliant bid', 1),
    (31, 21, 2, 133500.00, true,  'Second lowest',        2),
    (32, 22, 3, 200000.00, true,  'Agency-to-Agency',     1)
ON CONFLICT DO NOTHING;

SELECT setval('abstract_quotations_id_seq', 32);

-- ============================================================
-- STEP 5b: ABSTRACT QUOTE ITEMS
-- ============================================================
INSERT INTO abstract_quote_items (abstract_quotation_id, item_description, quantity, unit, unit_price) VALUES
    (1,  'Security Guard Services - 12 months',    1, 'LOT', 960000.00),
    (2,  'Security Guard Services - 12 months',    1, 'LOT', 980000.00),
    (3,  'Janitorial Services - 12 months',        1, 'LOT', 720000.00),
    (4,  'Janitorial Services - 12 months',        1, 'LOT', 750000.00),
    (5,  'Motor Vehicle Repairs and Maintenance',   1, 'LOT', 295000.00),
    (6,  'Office Equipment Repairs and Maintenance',1, 'LOT', 490000.00),
    (7,  'Office Equipment Repairs and Maintenance',1, 'LOT', 498000.00),
    (8,  'Postage and Courier Services',            1, 'LOT', 108500.00),
    (9,  'Printer Inks and Toners - FAD',           1, 'LOT', 168000.00),
    (10, 'Printer Inks and Toners - FAD',           1, 'LOT', 172000.00),
    (11, 'Printer Inks and Toners - WRSD',          1, 'LOT', 109000.00),
    (12, 'Printer Inks and Toners - MWPSD',         1, 'LOT', 109000.00),
    (13, 'Printer Inks and Toners - MWPTD',         1, 'LOT', 109000.00),
    (14, 'Janitorial Supplies, Fuel, etc',          1, 'LOT', 198000.00),
    (15, 'Janitorial Supplies, Fuel, etc',          1, 'LOT', 199500.00),
    (16, 'Semi-Expendable Office Equipment',        1, 'LOT', 198000.00),
    (17, 'Semi-Expendable Office Equipment',        1, 'LOT', 199000.00),
    (18, 'Semi-Expendable ICT Equipment',           1, 'LOT', 188000.00),
    (19, 'Semi-Expendable ICT Equipment',           1, 'LOT', 189500.00),
    (20, 'Semi-Expendable Furnitures and Fixtures',  1, 'LOT', 198000.00),
    (21, 'Semi-Expendable Furnitures and Fixtures',  1, 'LOT', 199000.00),
    (22, 'Meals and Snacks - SPMS',                  1, 'LOT', 22500.00),
    (23, 'Meals and Snacks - R.A. 6713',             1, 'LOT', 44500.00),
    (24, 'Meals and Snacks - Case Management',       1, 'LOT', 29500.00),
    (25, 'Meals, Snacks - OFW Children PNUM',        1, 'LOT', 47500.00),
    (26, 'Meals, Snacks - Dialogue PESO/DOLE',       1, 'LOT', 52000.00),
    (27, 'Meals, Snacks - Mental Health Seminar',     1, 'LOT', 270000.00),
    (28, 'Meals, Snacks - Mental Health Seminar',     1, 'LOT', 271000.00),
    (29, 'Meals, Snacks - Reintegration Seminar',     1, 'LOT', 190000.00),
    (30, 'Meals, Snacks - Job Fair Migrants Day',     1, 'LOT', 133000.00),
    (31, 'Meals, Snacks - Job Fair Migrants Day',     1, 'LOT', 133500.00),
    (32, 'Common-Use Supplies and Equipment Q1',      1, 'LOT', 200000.00);


-- ============================================================
-- STEP 6: POST-QUALIFICATIONS
-- ============================================================
INSERT INTO post_qualifications (id, postqual_number, abstract_id, bidder_name, documents_verified, technical_compliance, financial_validation, twg_result, findings, status, created_by, created_at) VALUES
    (1,  'PQ-2026-001', 1,  'MID-TOWN COMPUTERS AND SERVICES',     '{"philgeps": true, "tax_clearance": true, "business_permit": true, "omnibus_sworn": true}'::jsonb,  'Compliant', 'Validated', 'Passed', 'All documents verified and in order',     'completed', 1, '2026-01-17 08:00:00'),
    (2,  'PQ-2026-002', 2,  'COMPAÑERO COMMERCIAL',                 '{"philgeps": true, "tax_clearance": true, "business_permit": true, "omnibus_sworn": true}'::jsonb,  'Compliant', 'Validated', 'Passed', 'All documents verified',                   'completed', 1, '2026-01-17 09:00:00'),
    (3,  'PQ-2026-003', 3,  'AIRMASTERS AIRCONDITIONING SERVICES',  '{"philgeps": true, "tax_clearance": true, "business_permit": true, "omnibus_sworn": true}'::jsonb,  'Compliant', 'Validated', 'Passed', 'Supplier qualifications confirmed',        'completed', 1, '2026-02-14 08:00:00'),
    (4,  'PQ-2026-004', 4,  'AIRMASTERS AIRCONDITIONING SERVICES',  '{"philgeps": true, "tax_clearance": true, "business_permit": true, "omnibus_sworn": true}'::jsonb,  'Compliant', 'Validated', 'Passed', 'Technical capability verified',             'completed', 1, '2026-02-14 09:00:00'),
    (5,  'PQ-2026-005', 5,  'KIMSON COMMERCIAL',                    '{"philgeps": true, "tax_clearance": true, "business_permit": true}'::jsonb,                          'Compliant', 'Validated', 'Passed', 'Documents complete and verified',           'completed', 1, '2026-01-16 08:00:00'),
    (6,  'PQ-2026-006', 6,  'MID-TOWN COMPUTERS AND SERVICES',     '{"philgeps": true, "tax_clearance": true, "business_permit": true, "omnibus_sworn": true}'::jsonb,   'Compliant', 'Validated', 'Passed', 'ICT supplier qualifications confirmed',    'completed', 1, '2026-01-24 08:00:00'),
    (7,  'PQ-2026-007', 7,  'MID-TOWN COMPUTERS AND SERVICES',     '{"philgeps": true, "tax_clearance": true, "business_permit": true, "omnibus_sworn": true}'::jsonb,   'Compliant', 'Validated', 'Passed', 'ICT supplier qualifications confirmed',    'completed', 1, '2026-01-24 09:00:00'),
    (8,  'PQ-2026-008', 8,  'MID-TOWN COMPUTERS AND SERVICES',     '{"philgeps": true, "tax_clearance": true, "business_permit": true, "omnibus_sworn": true}'::jsonb,   'Compliant', 'Validated', 'Passed', 'ICT supplier qualifications confirmed',    'completed', 1, '2026-01-24 10:00:00'),
    (9,  'PQ-2026-009', 9,  'MID-TOWN COMPUTERS AND SERVICES',     '{"philgeps": true, "tax_clearance": true, "business_permit": true, "omnibus_sworn": true}'::jsonb,   'Compliant', 'Validated', 'Passed', 'ICT supplier qualifications confirmed',    'completed', 1, '2026-01-24 11:00:00'),
    (10, 'PQ-2026-010', 10, 'RFY MARKETING',                        '{"philgeps": true, "tax_clearance": true, "business_permit": true}'::jsonb,                          'Compliant', 'Validated', 'Passed', 'Supplier qualifications confirmed',        'completed', 1, '2026-01-25 08:00:00'),
    (11, 'PQ-2026-011', 11, 'MID-TOWN COMPUTERS AND SERVICES',     '{"philgeps": true, "tax_clearance": true, "business_permit": true, "omnibus_sworn": true}'::jsonb,   'Compliant', 'Validated', 'Passed', 'Office equipment supplier verified',       'completed', 1, '2026-01-25 09:00:00'),
    (12, 'PQ-2026-012', 12, 'LINK NETWORK SOLUTIONS INC.',          '{"philgeps": true, "tax_clearance": true, "business_permit": true, "omnibus_sworn": true}'::jsonb,   'Compliant', 'Validated', 'Passed', 'ICT vendor qualifications confirmed',      'completed', 1, '2026-01-25 10:00:00'),
    (13, 'PQ-2026-013', 13, 'FMJ Information Technology Solutions',  '{"philgeps": true, "tax_clearance": true, "business_permit": true}'::jsonb,                          'Compliant', 'Validated', 'Passed', 'Furniture supplier qualifications OK',     'completed', 1, '2026-01-25 11:00:00'),
    (14, 'PQ-2026-014', 14, 'COMPAÑERO COMMERCIAL',                 '{"philgeps": true, "tax_clearance": true, "business_permit": true}'::jsonb,                          'Compliant', 'Validated', 'Passed', 'Catering verified',                        'completed', 1, '2026-01-26 08:00:00'),
    (15, 'PQ-2026-015', 15, 'COMPAÑERO COMMERCIAL',                 '{"philgeps": true, "tax_clearance": true, "business_permit": true}'::jsonb,                          'Compliant', 'Validated', 'Passed', 'Catering verified',                        'completed', 1, '2026-02-12 08:00:00'),
    (16, 'PQ-2026-016', 16, 'COMPAÑERO COMMERCIAL',                 '{"philgeps": true, "tax_clearance": true, "business_permit": true}'::jsonb,                          'Compliant', 'Validated', 'Passed', 'Catering verified',                        'completed', 1, '2026-02-12 09:00:00'),
    (17, 'PQ-2026-017', 19, 'COMPAÑERO COMMERCIAL',                 '{"philgeps": true, "tax_clearance": true, "business_permit": true}'::jsonb,                          'Compliant', 'Validated', 'Passed', 'Catering verified',                        'completed', 1, '2026-01-28 08:00:00'),
    (18, 'PQ-2026-018', 20, 'COMPAÑERO COMMERCIAL',                 '{"philgeps": true, "tax_clearance": true, "business_permit": true}'::jsonb,                          'Compliant', 'Validated', 'Passed', 'Catering verified',                        'completed', 1, '2026-01-28 09:00:00'),
    (19, 'PQ-2026-019', 21, 'COMPAÑERO COMMERCIAL',                 '{"philgeps": true, "tax_clearance": true, "business_permit": true}'::jsonb,                          'Compliant', 'Validated', 'Passed', 'Catering verified',                        'completed', 1, '2026-01-28 10:00:00'),
    (20, 'PQ-2026-020', 22, 'PROCUREMENT SERVICE',                  '{"philgeps": true}'::jsonb,                                                                          'Compliant', 'Validated', 'Passed', 'Agency-to-Agency procurement',             'completed', 1, '2026-01-17 08:00:00')
ON CONFLICT (postqual_number) DO NOTHING;

SELECT setval('post_qualifications_id_seq', 20);


-- ============================================================
-- STEP 7: BAC RESOLUTIONS
-- ============================================================
INSERT INTO bac_resolutions (id, resolution_number, abstract_id, resolution_date, procurement_mode, abc_amount, recommended_supplier_id, recommended_awardee_name, bid_amount, status, created_by, created_at) VALUES
    (1,  'BACR-2026-001', 1,  '2026-01-17', 'SVP',    960000.00,  1, 'MID-TOWN COMPUTERS AND SERVICES',     960000.00,  'approved', 1, '2026-01-17 10:00:00'),
    (2,  'BACR-2026-002', 2,  '2026-01-17', 'SVP',    720000.00,  9, 'COMPAÑERO COMMERCIAL',                 720000.00,  'approved', 1, '2026-01-17 11:00:00'),
    (3,  'BACR-2026-003', 3,  '2026-02-14', 'SVP',    300000.00,  5, 'AIRMASTERS AIRCONDITIONING SERVICES',  295000.00,  'approved', 1, '2026-02-14 10:00:00'),
    (4,  'BACR-2026-004', 4,  '2026-02-14', 'SVP',    500000.00,  5, 'AIRMASTERS AIRCONDITIONING SERVICES',  490000.00,  'approved', 1, '2026-02-14 11:00:00'),
    (5,  'BACR-2026-005', 5,  '2026-01-16', 'SVP',    110000.00,  7, 'KIMSON COMMERCIAL',                    108500.00,  'approved', 1, '2026-01-16 10:00:00'),
    (6,  'BACR-2026-006', 6,  '2026-01-24', 'SVP',    170000.00,  1, 'MID-TOWN COMPUTERS AND SERVICES',     168000.00,  'approved', 1, '2026-01-24 14:00:00'),
    (7,  'BACR-2026-007', 7,  '2026-01-24', 'SVP',    110000.00,  1, 'MID-TOWN COMPUTERS AND SERVICES',     109000.00,  'approved', 1, '2026-01-24 15:00:00'),
    (8,  'BACR-2026-008', 8,  '2026-01-24', 'SVP',    110000.00,  1, 'MID-TOWN COMPUTERS AND SERVICES',     109000.00,  'approved', 1, '2026-01-24 16:00:00'),
    (9,  'BACR-2026-009', 9,  '2026-01-24', 'SVP',    110000.00,  1, 'MID-TOWN COMPUTERS AND SERVICES',     109000.00,  'approved', 1, '2026-01-24 17:00:00'),
    (10, 'BACR-2026-010', 10, '2026-01-25', 'SVP',    200000.00,  2, 'RFY MARKETING',                        198000.00,  'approved', 1, '2026-01-25 10:00:00'),
    (11, 'BACR-2026-011', 11, '2026-01-25', 'SVP',    200000.00,  1, 'MID-TOWN COMPUTERS AND SERVICES',     198000.00,  'approved', 1, '2026-01-25 11:00:00'),
    (12, 'BACR-2026-012', 12, '2026-01-25', 'SVP',    190000.00,  4, 'LINK NETWORK SOLUTIONS INC.',          188000.00,  'approved', 1, '2026-01-25 14:00:00'),
    (13, 'BACR-2026-013', 13, '2026-01-25', 'SVP',    200000.00,  8, 'FMJ Information Technology Solutions',  198000.00,  'approved', 1, '2026-01-25 15:00:00'),
    (14, 'BACR-2026-014', 14, '2026-01-26', 'SVP',    23000.00,   9, 'COMPAÑERO COMMERCIAL',                  22500.00,  'approved', 1, '2026-01-26 10:00:00'),
    (15, 'BACR-2026-015', 15, '2026-02-12', 'SVP',    45000.00,   9, 'COMPAÑERO COMMERCIAL',                  44500.00,  'approved', 1, '2026-02-12 10:00:00'),
    (16, 'BACR-2026-016', 16, '2026-02-12', 'SVP',    30000.00,   9, 'COMPAÑERO COMMERCIAL',                  29500.00,  'approved', 1, '2026-02-12 11:00:00'),
    (17, 'BACR-2026-017', 19, '2026-01-28', 'SVP',    271280.00,  9, 'COMPAÑERO COMMERCIAL',                 270000.00,  'approved', 1, '2026-01-28 10:00:00'),
    (18, 'BACR-2026-018', 20, '2026-01-28', 'SVP',    191720.00,  9, 'COMPAÑERO COMMERCIAL',                 190000.00,  'approved', 1, '2026-01-28 11:00:00'),
    (19, 'BACR-2026-019', 21, '2026-01-28', 'SVP',    133900.00,  9, 'COMPAÑERO COMMERCIAL',                 133000.00,  'approved', 1, '2026-01-28 14:00:00'),
    (20, 'BACR-2026-020', 22, '2026-01-17', 'OTHERS', 200000.00,  3, 'PROCUREMENT SERVICE',                  200000.00,  'approved', 1, '2026-01-17 14:00:00')
ON CONFLICT (resolution_number) DO NOTHING;

SELECT setval('bac_resolutions_id_seq', 20);


-- ============================================================
-- STEP 8: NOTICES OF AWARD
-- ============================================================
INSERT INTO notices_of_award (id, noa_number, bac_resolution_id, supplier_id, contract_amount, date_issued, bidder_receipt_date, status, created_by, created_at) VALUES
    (1,  'NOA-2026-001', 1,  1, 960000.00, '2026-01-19', '2026-01-20', 'received', 1, '2026-01-19 08:00:00'),
    (2,  'NOA-2026-002', 2,  9, 720000.00, '2026-01-19', '2026-01-20', 'received', 1, '2026-01-19 09:00:00'),
    (3,  'NOA-2026-003', 3,  5, 295000.00, '2026-02-16', '2026-02-17', 'received', 1, '2026-02-16 08:00:00'),
    (4,  'NOA-2026-004', 4,  5, 490000.00, '2026-02-16', '2026-02-17', 'received', 1, '2026-02-16 09:00:00'),
    (5,  'NOA-2026-005', 5,  7, 108500.00, '2026-01-17', '2026-01-19', 'received', 1, '2026-01-17 08:00:00'),
    (6,  'NOA-2026-006', 6,  1, 168000.00, '2026-01-26', '2026-01-27', 'received', 1, '2026-01-26 08:00:00'),
    (7,  'NOA-2026-007', 7,  1, 109000.00, '2026-01-26', '2026-01-27', 'received', 1, '2026-01-26 09:00:00'),
    (8,  'NOA-2026-008', 8,  1, 109000.00, '2026-01-26', '2026-01-27', 'received', 1, '2026-01-26 10:00:00'),
    (9,  'NOA-2026-009', 9,  1, 109000.00, '2026-01-26', '2026-01-27', 'received', 1, '2026-01-26 11:00:00'),
    (10, 'NOA-2026-010', 10, 2, 198000.00, '2026-01-27', '2026-01-28', 'received', 1, '2026-01-27 08:00:00'),
    (11, 'NOA-2026-011', 11, 1, 198000.00, '2026-01-27', '2026-01-28', 'received', 1, '2026-01-27 09:00:00'),
    (12, 'NOA-2026-012', 12, 4, 188000.00, '2026-01-27', '2026-01-28', 'received', 1, '2026-01-27 10:00:00'),
    (13, 'NOA-2026-013', 13, 8, 198000.00, '2026-01-27', '2026-01-28', 'received', 1, '2026-01-27 11:00:00'),
    (14, 'NOA-2026-014', 14, 9, 22500.00,  '2026-01-27', '2026-01-28', 'received', 1, '2026-01-27 14:00:00'),
    (15, 'NOA-2026-015', 15, 9, 44500.00,  '2026-02-13', '2026-02-14', 'received', 1, '2026-02-13 08:00:00'),
    (16, 'NOA-2026-016', 16, 9, 29500.00,  '2026-02-13', '2026-02-14', 'received', 1, '2026-02-13 09:00:00'),
    (17, 'NOA-2026-017', 17, 9, 270000.00, '2026-01-29', '2026-01-30', 'received', 1, '2026-01-29 08:00:00'),
    (18, 'NOA-2026-018', 18, 9, 190000.00, '2026-01-29', '2026-01-30', 'received', 1, '2026-01-29 09:00:00'),
    (19, 'NOA-2026-019', 19, 9, 133000.00, '2026-01-29', '2026-01-30', 'received', 1, '2026-01-29 10:00:00'),
    (20, 'NOA-2026-020', 20, 3, 200000.00, '2026-01-19', '2026-01-20', 'received', 1, '2026-01-19 10:00:00')
ON CONFLICT (noa_number) DO NOTHING;

SELECT setval('notices_of_award_id_seq', 20);


-- ============================================================
-- STEP 9: LINK EXISTING POs BACK TO NEW PRs AND NOAs
-- (where the PO purpose matches an APP project)
-- ============================================================
-- These are the 20 pre-existing POs from Excel data (CY 2025).
-- They predate the APP FY 2026 items, so they remain unlinked.
-- New POs based on APP FY 2026 can be created via the UI.


COMMIT;

-- ============================================================
-- END OF APP SEED DATA
-- ============================================================
