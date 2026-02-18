-- Seed data for transaction tables (PR → RFQ → Abstract → PostQual → BAC Resolution → NOA)
BEGIN;

-- PURCHASE REQUESTS
INSERT INTO purchaserequests (id, pr_number, dept_id, purpose, total_amount, status, requested_by, created_at) VALUES
    (1,  'PR-2025-001', 1, 'Procurement of office supplies for FAD',                      59127.80,  'approved',  1, '2025-01-15 08:00:00'),
    (2,  'PR-2025-002', 5, 'Procurement of cork board and whiteboard for the use of DMW',  8900.00,   'approved',  1, '2025-05-10 09:00:00'),
    (3,  'PR-2025-003', 1, 'Supply and deliver of printer inks for DMW Caraga',             43450.00,  'approved',  1, '2025-06-20 10:00:00'),
    (4,  'PR-2025-004', 4, 'For Welfare and Reintegration Services Division Use',           5000.00,   'approved',  1, '2025-04-15 08:30:00'),
    (5,  'PR-2025-005', 1, 'Procurement of water dispenser for the use of DMW Caraga',      47370.00,  'approved',  1, '2025-07-10 09:00:00'),
    (6,  'PR-2025-006', 1, 'Procurement of air conditioning units for DMW Caraga',          322594.00, 'approved',  1, '2025-04-15 10:00:00'),
    (7,  'PR-2025-007', 1, 'Procurement of scanner for DMW Caraga',                         225540.00, 'pending',   1, '2025-09-25 08:00:00'),
    (8,  'PR-2025-008', 1, 'Procurement of additional printers for DMW Caraga CY 2025',     139986.00, 'pending',   1, '2025-09-25 09:00:00'),
    (9,  'PR-2025-009', 1, 'Furniture and fixture for DMW CARAGA',                           394000.00, 'processed', 1, '2025-10-15 10:00:00'),
    (10, 'PR-2025-010', 1, 'Supply and delivery of external hard drives',                    37440.00,  'processed', 1, '2025-07-15 08:00:00')
ON CONFLICT (pr_number) DO NOTHING;
SELECT setval('purchaserequests_id_seq', 10);

-- PR ITEMS
INSERT INTO pr_items (pr_id, item_code, item_name, unit, quantity, unit_price) VALUES
    (1, 'EXP-1764841369', 'BOND PAPER - A4, 80gsm',         'REAM', 50,  243.50),
    (1, 'EXP-1764925218', 'SIGN PEN, Extra fine tip, Black', 'PCS',  48,  55.00),
    (1, 'EXP-1764843129', 'STAPLE WIRE, standard',           'BOX',  30,  42.00),
    (2, 'SEM-1756121423', 'CORKBOARD - 4x8 ft.',  'UNIT', 2, 2500.00),
    (2, 'SEM-1756121448', 'WHITEBOARD - 4x8 ft.', 'UNIT', 2, 1950.00),
    (3, '8550374',  'EPSON INK 003 - Black',   'BOT', 20, 350.00),
    (3, '4977046',  'EPSON INK 003-CYAN',      'BOT', 15, 350.00),
    (3, '8615046',  'EPSON INK 003 - Magenta', 'BOT', 15, 350.00),
    (3, '9305209',  'EPSON INK 003 - Yellow',  'BOT', 15, 350.00),
    (4, 'EXP-1770049876', 'MOBILE PHONE (INFINIX)', 'PCS', 1, 5000.00),
    (5, 'EXP-1770048777', 'Water Dispenser', 'UNIT', 3, 15790.00),
    (6, 'EXP-1770050401', 'Floor Mounted Aircon', 'UNIT', 2, 89999.00),
    (6, 'EXP-1770050427', 'Split Type Aircon',    'UNIT', 3, 47532.00),
    (7, 'EXP-SCANNER-01', 'Document Scanner High Speed', 'UNIT', 3, 75180.00),
    (8, 'EXP-PRINTER-01', 'Multifunction Printer Laser', 'UNIT', 2, 69993.00),
    (9, 'EXP-FURN-01', 'Executive Office Desk',  'SET', 5, 45000.00),
    (9, 'EXP-FURN-02', 'Ergonomic Office Chair', 'PCS', 10, 16900.00),
    (10, 'EXP-HDD-01', 'External HDD 2TB USB 3.0', 'PCS', 6, 6240.00);

-- RFQs
INSERT INTO rfqs (id, rfq_number, pr_id, date_prepared, submission_deadline, abc_amount, status, created_by, created_at) VALUES
    (1, 'RFQ-2025-001', 1,  '2025-01-20', '2025-01-30', 59127.80,  'closed',  1, '2025-01-20 08:00:00'),
    (2, 'RFQ-2025-002', 2,  '2025-05-12', '2025-05-18', 8900.00,   'closed',  1, '2025-05-12 09:00:00'),
    (3, 'RFQ-2025-003', 3,  '2025-06-22', '2025-06-28', 43450.00,  'closed',  1, '2025-06-22 10:00:00'),
    (4, 'RFQ-2025-004', 5,  '2025-07-12', '2025-07-20', 47370.00,  'closed',  1, '2025-07-12 08:00:00'),
    (5, 'RFQ-2025-005', 6,  '2025-04-18', '2025-04-25', 322594.00, 'closed',  1, '2025-04-18 09:00:00'),
    (6, 'RFQ-2025-006', 7,  '2025-09-28', '2025-10-01', 225540.00, 'posted',  1, '2025-09-28 10:00:00'),
    (7, 'RFQ-2025-007', 9,  '2025-10-20', '2025-10-30', 394000.00, 'closed',  1, '2025-10-20 08:00:00'),
    (8, 'RFQ-2025-008', 10, '2025-07-18', '2025-07-25', 37440.00,  'closed',  1, '2025-07-18 09:00:00')
ON CONFLICT (rfq_number) DO NOTHING;
SELECT setval('rfqs_id_seq', 8);

-- RFQ ITEMS
INSERT INTO rfq_items (rfq_id, item_code, item_name, unit, quantity, abc_unit_cost) VALUES
    (1, 'EXP-1764841369', 'BOND PAPER - A4, 80gsm',         'REAM', 50,  243.50),
    (1, 'EXP-1764925218', 'SIGN PEN, Extra fine tip, Black', 'PCS',  48,  55.00),
    (2, 'SEM-1756121423', 'CORKBOARD - 4x8 ft.',  'UNIT', 2, 2500.00),
    (2, 'SEM-1756121448', 'WHITEBOARD - 4x8 ft.', 'UNIT', 2, 1950.00),
    (3, '8550374',  'EPSON INK 003 - Black',   'BOT', 20, 350.00),
    (3, '4977046',  'EPSON INK 003-CYAN',      'BOT', 15, 350.00),
    (4, 'EXP-1770048777', 'Water Dispenser', 'UNIT', 3, 15790.00),
    (5, 'EXP-1770050401', 'Floor Mounted Aircon', 'UNIT', 2, 89999.00),
    (5, 'EXP-1770050427', 'Split Type Aircon',    'UNIT', 3, 47532.00),
    (6, 'EXP-SCANNER-01', 'Document Scanner High Speed', 'UNIT', 3, 75180.00),
    (7, 'EXP-FURN-01', 'Executive Office Desk',  'SET', 5, 45000.00),
    (7, 'EXP-FURN-02', 'Ergonomic Office Chair', 'PCS', 10, 16900.00),
    (8, 'EXP-HDD-01', 'External HDD 2TB USB 3.0', 'PCS', 6, 6240.00);

-- RFQ SUPPLIERS
INSERT INTO rfq_suppliers (rfq_id, supplier_id, invited_at, responded) VALUES
    (1, 3, '2025-01-20', true),
    (1, 1, '2025-01-20', true),
    (2, 9, '2025-05-12', true),
    (2, 2, '2025-05-12', false),
    (3, 1, '2025-06-22', true),
    (4, 2, '2025-07-12', true),
    (5, 5, '2025-04-18', true),
    (5, 1, '2025-04-18', true),
    (6, 1, '2025-09-28', true),
    (6, 4, '2025-09-28', false),
    (7, 8, '2025-10-20', true),
    (8, 1, '2025-07-18', true);

-- ABSTRACTS
INSERT INTO abstracts (id, abstract_number, rfq_id, date_prepared, purpose, status, recommended_supplier_id, recommended_amount, created_by, created_at) VALUES
    (1, 'ABS-2025-001', 1, '2025-01-31', 'Office supplies for FAD',                      'approved',  3, 59127.80,  1, '2025-01-31 08:00:00'),
    (2, 'ABS-2025-002', 2, '2025-05-19', 'Cork board and whiteboard for DMW',             'approved',  9, 8900.00,   1, '2025-05-19 09:00:00'),
    (3, 'ABS-2025-003', 3, '2025-06-29', 'Printer inks for DMW Caraga',                   'approved',  1, 43450.00,  1, '2025-06-29 10:00:00'),
    (4, 'ABS-2025-004', 4, '2025-07-21', 'Water dispenser for DMW Caraga',                'approved',  2, 47370.00,  1, '2025-07-21 08:00:00'),
    (5, 'ABS-2025-005', 5, '2025-04-26', 'Air conditioning units for DMW Caraga',         'approved',  5, 322594.00, 1, '2025-04-26 09:00:00'),
    (6, 'ABS-2025-006', 7, '2025-10-31', 'Furniture and fixture for DMW CARAGA',          'submitted', 8, 394000.00, 1, '2025-10-31 10:00:00'),
    (7, 'ABS-2025-007', 8, '2025-07-26', 'External hard drives for DMW Caraga',           'approved',  1, 37440.00,  1, '2025-07-26 08:00:00')
ON CONFLICT (abstract_number) DO NOTHING;
SELECT setval('abstracts_id_seq', 7);

-- ABSTRACT QUOTATIONS
INSERT INTO abstract_quotations (id, abstract_id, supplier_id, bid_amount, is_compliant, remarks, rank_no) VALUES
    (1,  1, 3, 59127.80,  true,  'Lowest compliant bid',     1),
    (2,  1, 1, 62500.00,  true,  'Second lowest',            2),
    (3,  2, 9, 8900.00,   true,  'Lowest compliant bid',     1),
    (4,  3, 1, 43450.00,  true,  'Lowest compliant bid',     1),
    (5,  4, 2, 47370.00,  true,  'Lowest compliant bid',     1),
    (6,  5, 5, 322594.00, true,  'Lowest compliant bid',     1),
    (7,  5, 1, 345000.00, true,  'Second lowest',            2),
    (8,  6, 8, 394000.00, true,  'Lowest compliant bid',     1),
    (9,  7, 1, 37440.00,  true,  'Lowest compliant bid',     1)
ON CONFLICT DO NOTHING;
SELECT setval('abstract_quotations_id_seq', 9);

-- ABSTRACT QUOTE ITEMS
INSERT INTO abstract_quote_items (abstract_quotation_id, item_description, quantity, unit, unit_price) VALUES
    (1, 'BOND PAPER - A4, 80gsm',         50,  'REAM', 240.00),
    (1, 'SIGN PEN, Extra fine tip, Black', 48,  'PCS',  52.00),
    (2, 'BOND PAPER - A4, 80gsm',         50,  'REAM', 255.00),
    (3, 'CORKBOARD - 4x8 ft.',            2,   'UNIT', 2500.00),
    (3, 'WHITEBOARD - 4x8 ft.',           2,   'UNIT', 1950.00),
    (4, 'EPSON INK 003 - Black',          20,  'BOT',  345.00),
    (4, 'EPSON INK 003-CYAN',             15,  'BOT',  345.00),
    (5, 'Water Dispenser',                3,   'UNIT', 15790.00),
    (6, 'Floor Mounted Aircon',           2,   'UNIT', 89999.00),
    (6, 'Split Type Aircon',              3,   'UNIT', 47532.00),
    (8, 'Executive Office Desk',          5,   'SET',  45000.00),
    (8, 'Ergonomic Office Chair',         10,  'PCS',  16900.00),
    (9, 'External HDD 2TB USB 3.0',      6,   'PCS',  6240.00);

-- POST-QUALIFICATIONS
INSERT INTO post_qualifications (id, postqual_number, abstract_id, bidder_name, documents_verified, technical_compliance, financial_validation, twg_result, findings, status, created_by, created_at) VALUES
    (1, 'PQ-2025-001', 1, 'PROCUREMENT SERVICE',                '{"philgeps": true, "tax_clearance": true, "business_permit": true}'::jsonb,  'Compliant',     'Validated', 'Passed',         'All documents verified and in order', 'completed', 1, '2025-02-01 08:00:00'),
    (2, 'PQ-2025-002', 2, 'COMPAÑERO COMMERCIAL',               '{"philgeps": true, "tax_clearance": true, "business_permit": true}'::jsonb,  'Compliant',     'Validated', 'Passed',         'All documents verified',              'completed', 1, '2025-05-20 09:00:00'),
    (3, 'PQ-2025-003', 3, 'MID-TOWN COMPUTERS AND SERVICES',    '{"philgeps": true, "tax_clearance": true, "business_permit": true}'::jsonb,  'Compliant',     'Validated', 'Passed',         'Supplier qualifications confirmed',   'completed', 1, '2025-06-30 10:00:00'),
    (4, 'PQ-2025-004', 4, 'RFY MARKETING',                      '{"philgeps": true, "tax_clearance": true, "business_permit": true}'::jsonb,  'Compliant',     'Validated', 'Passed',         'Documents complete and verified',     'completed', 1, '2025-07-22 08:00:00'),
    (5, 'PQ-2025-005', 5, 'AIRMASTERS AIRCONDITIONING SERVICES','{"philgeps": true, "tax_clearance": true, "business_permit": true}'::jsonb,  'Compliant',     'Validated', 'Passed',         'Technical specs verified and passed',  'completed', 1, '2025-04-27 09:00:00'),
    (6, 'PQ-2025-006', 7, 'MID-TOWN COMPUTERS AND SERVICES',    '{"philgeps": true, "tax_clearance": true, "business_permit": true}'::jsonb,  'Compliant',     'Validated', 'Passed',         'All requirements met',                'completed', 1, '2025-07-27 10:00:00')
ON CONFLICT (postqual_number) DO NOTHING;
SELECT setval('post_qualifications_id_seq', 6);

-- BAC RESOLUTIONS
INSERT INTO bac_resolutions (id, resolution_number, abstract_id, resolution_date, procurement_mode, abc_amount, recommended_supplier_id, recommended_awardee_name, bid_amount, status, created_by, created_at) VALUES
    (1, 'BACR-2025-001', 1, '2025-02-01', 'OTHERS',  59127.80,  3, 'PROCUREMENT SERVICE',                59127.80,  'approved', 1, '2025-02-01 10:00:00'),
    (2, 'BACR-2025-002', 2, '2025-05-20', 'SVP',     8900.00,   9, 'COMPAÑERO COMMERCIAL',               8900.00,   'approved', 1, '2025-05-20 10:00:00'),
    (3, 'BACR-2025-003', 3, '2025-06-30', 'SVP',     43450.00,  1, 'MID-TOWN COMPUTERS AND SERVICES',    43450.00,  'approved', 1, '2025-06-30 10:00:00'),
    (4, 'BACR-2025-004', 4, '2025-07-22', 'SVP',     47370.00,  2, 'RFY MARKETING',                      47370.00,  'approved', 1, '2025-07-22 10:00:00'),
    (5, 'BACR-2025-005', 5, '2025-04-28', 'SVP',     322594.00, 5, 'AIRMASTERS AIRCONDITIONING SERVICES', 322594.00, 'approved', 1, '2025-04-28 10:00:00'),
    (6, 'BACR-2025-006', 7, '2025-07-28', 'SVP',     37440.00,  1, 'MID-TOWN COMPUTERS AND SERVICES',    37440.00,  'approved', 1, '2025-07-28 10:00:00')
ON CONFLICT (resolution_number) DO NOTHING;
SELECT setval('bac_resolutions_id_seq', 6);

-- NOTICES OF AWARD
INSERT INTO notices_of_award (id, noa_number, bac_resolution_id, supplier_id, contract_amount, date_issued, bidder_receipt_date, status, created_by, created_at) VALUES
    (1, 'NOA-2025-001', 1, 3, 59127.80,  '2025-02-02', '2025-02-03', 'received', 1, '2025-02-02 08:00:00'),
    (2, 'NOA-2025-002', 2, 9, 8900.00,   '2025-05-20', '2025-05-21', 'received', 1, '2025-05-20 08:00:00'),
    (3, 'NOA-2025-003', 3, 1, 43450.00,  '2025-07-01', '2025-07-02', 'received', 1, '2025-07-01 08:00:00'),
    (4, 'NOA-2025-004', 4, 2, 47370.00,  '2025-07-23', '2025-07-24', 'received', 1, '2025-07-23 08:00:00'),
    (5, 'NOA-2025-005', 5, 5, 322594.00, '2025-04-30', '2025-05-02', 'received', 1, '2025-04-30 08:00:00'),
    (6, 'NOA-2025-006', 6, 1, 37440.00,  '2025-07-28', '2025-07-29', 'issued',   1, '2025-07-28 08:00:00')
ON CONFLICT (noa_number) DO NOTHING;
SELECT setval('notices_of_award_id_seq', 6);

-- Link existing POs to PRs and NOAs
UPDATE purchaseorders SET pr_id = 1, noa_id = 1 WHERE id = 1;
UPDATE purchaseorders SET pr_id = 2, noa_id = 2 WHERE id = 2;
UPDATE purchaseorders SET pr_id = 3, noa_id = 3 WHERE id = 3;
UPDATE purchaseorders SET pr_id = 5, noa_id = 4 WHERE id = 5;
UPDATE purchaseorders SET pr_id = 6, noa_id = 5 WHERE id = 6;
UPDATE purchaseorders SET pr_id = 10, noa_id = 6 WHERE id = 16;

COMMIT;
