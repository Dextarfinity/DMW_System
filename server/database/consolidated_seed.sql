-- ============================================================
-- DMW CARAGA PROCUREMENT & INVENTORY SYSTEM
-- SEED DATA (from DMW AS-IS SYSTEM.xlsx)
-- Version: 4.0.0
-- Date: February 2026
-- ============================================================
-- Run AFTER consolidated_schema.sql:
--   psql -U postgres -d dmw_db -f consolidated_schema.sql
--   psql -U postgres -d dmw_db -f consolidated_seed.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. DEPARTMENTS (matches offices in Excel)
-- ============================================================
INSERT INTO departments (id, name, code, description) VALUES
    (1, 'Finance and Administrative Division', 'FAD', 'Handles finance, HR, and administrative matters'),
    (2, 'Migrant Workers Protection and Trafficking Division', 'MWPTD', 'Handles protection and anti-trafficking'),
    (3, 'Migrant Workers Processing and Service Division', 'MWPSD', 'Processes documentation and deployment'),
    (4, 'Welfare and Reintegration Services Division', 'WRSD', 'Provides welfare and reintegration services'),
    (5, 'Office of the Regional Director', 'ORD', 'Regional executive office')
ON CONFLICT (code) DO NOTHING;

SELECT setval('departments_id_seq', 5);

-- ============================================================
-- 2. DESIGNATIONS (15 records from Excel)
-- ============================================================
INSERT INTO designations (id, name) VALUES
    (1, 'OIC, Regional Director'),
    (2, 'Chief LEO'),
    (3, 'SAO'),
    (4, 'Admin Asst. II'),
    (5, 'Chief Administrative Officer'),
    (6, 'Admin Officer III'),
    (7, 'Sup. LEO'),
    (8, 'LEO III'),
    (9, 'Sr. LEO'),
    (10, 'Admin Officer V'),
    (11, 'LEO I'),
    (12, 'LEO II'),
    (13, 'Accountant III'),
    (14, 'Admin Asst. III'),
    (15, 'Admin Officer I')
ON CONFLICT DO NOTHING;

SELECT setval('designations_id_seq', 15);

-- ============================================================
-- 3. EMPLOYEES (33 records from Excel)
-- ============================================================
INSERT INTO employees (id, full_name) VALUES
    (1, 'KRISTY A. SUAN'),
    (2, 'MARISSA A. GARAY'),
    (3, 'RAY ANGELO A. SAJOR'),
    (4, 'RITCHEL T. BEBERA'),
    (5, 'AURORA JEAN A. TORRALBA'),
    (6, 'GIOVANNI S. PAREDES'),
    (7, 'CHERRYL C. OCULAM'),
    (8, 'GARY P. SALADORES'),
    (9, 'AL S. POLINAR'),
    (10, 'JUNE NEIL P. ENSOMO'),
    (11, 'JOMAR LIAN U. TOLIAO'),
    (12, 'JOVENCIO P. CARBONILLA, JR.'),
    (13, 'MARK E. MARASIGAN'),
    (14, 'ANTONIO LIGAN'),
    (15, 'REYNON A. ARLAN'),
    (16, 'SHELLA CLAIRE L. SOMBILON'),
    (17, 'APPLE MAE C. TANDOY'),
    (18, 'GERALD F. DE LOS REYES'),
    (19, 'CHARISH MAE G. DALIT'),
    (20, 'JOANINE BLYTH ROSS C. VILLARINO'),
    (21, 'REGIENALD S. ESPALDON'),
    (22, 'REGIE B. LAGRAMADA'),
    (23, 'BEALAH JOY T. CAMARIN'),
    (24, 'EDDIE PARAGUYA'),
    (25, 'CANDY JOY B. MAGLUPAY'),
    (26, 'IAN JOSHUA E. PAQUEO'),
    (27, 'RITCHEL M. BUTAO'),
    (28, 'JOHN LOUIE A. MEDILLO'),
    (29, 'ANNE JANE M. HALLASGO'),
    (30, 'LIGIE T. ANGELES'),
    (31, 'CHRIS ANN M. CABODBOD'),
    (32, 'EVAL B. MAKINANO'),
    (33, 'BERLY S. POLINAR')
ON CONFLICT DO NOTHING;

SELECT setval('employees_id_seq', 33);

-- ============================================================
-- 4. USERS (default admin)
-- ============================================================
INSERT INTO users (username, password_hash, full_name, role, dept_id) VALUES
    ('admin', '$2b$10$K8APPbX2pijPPtxaXNFV/u77/ZayGHJEnwcZ04RtAw2UDXYFvI27e', 'System Administrator', 'admin', 1)
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- 5. FUND CLUSTERS (1 record from Excel)
-- ============================================================
INSERT INTO fund_clusters (id, code, name) VALUES
    (1, '01', 'Regular Fund - 01')
ON CONFLICT DO NOTHING;

SELECT setval('fund_clusters_id_seq', 1);

-- ============================================================
-- 6. OFFICES (5 records from Excel)
-- ============================================================
INSERT INTO offices (id, name) VALUES
    (1, 'FAD'),
    (2, 'MWPTD'),
    (3, 'MWPSD'),
    (4, 'WRSD'),
    (5, 'ORD')
ON CONFLICT DO NOTHING;

SELECT setval('offices_id_seq', 5);

-- ============================================================
-- 7. PROCUREMENT MODES (4 records from Excel)
-- ============================================================
INSERT INTO procurement_modes (id, name) VALUES
    (1, 'Small Value Procurement - SVP'),
    (2, 'NP - Direct Retail'),
    (3, 'Public Bidding'),
    (4, 'Agency -To - Agency')
ON CONFLICT DO NOTHING;

SELECT setval('procurement_modes_id_seq', 4);

-- ============================================================
-- 8. UACS CODES (27 records from Excel)
-- ============================================================
INSERT INTO uacs_codes (id, category, code, name) VALUES
    (1, 'EXPENDABLE', '1040407000', 'Medical, Dental and Laboratory Supplies Inventory'),
    (2, 'CAPITAL OUTLAY', '1060503000', 'Information and Communications Technology Equipment'),
    (3, 'CAPITAL OUTLAY', '1060101000', 'Land'),
    (4, 'SEMI-EXPANDABLE', '1040602000', 'Semi-Expendable Books'),
    (5, 'EXPENDABLE', '1040406000', 'Drugs and Medicines Inventory'),
    (6, 'EXPENDABLE', '1040413000', 'Construction Materials Inventory'),
    (7, 'CAPITAL OUTLAY', '1060401000', 'Buildings'),
    (8, 'SEMI-EXPANDABLE', '1040507000', 'Semi-Expendable Communications Equipment'),
    (9, 'SEMI-EXPANDABLE', '1040502000', 'Semi-Expendable Office Equipment'),
    (10, 'SEMI-EXPANDABLE', '1040510000', 'Semi-Expendable Medical Equipment'),
    (11, 'SEMI-EXPANDABLE', '1040601000', 'Semi-Expendable Furniture and Fixtures'),
    (12, 'SEMI-EXPANDABLE', '1040503000', 'Semi-Expendable Information and Communications Technology Equipment'),
    (13, 'SEMI-EXPANDABLE', '1040501000', 'Semi-Expendable Machinery'),
    (14, 'CAPITAL OUTLAY', '1060599000', 'Other Machinery and Equipment'),
    (15, 'CAPITAL OUTLAY', '1060502000', 'Office Equipment'),
    (16, 'EXPENDABLE', '1040401000', 'Office Supplies Inventory'),
    (17, 'SEMI-EXPANDABLE', '1040511000', 'Semi-Expendable Printing Equipment'),
    (18, 'CAPITAL OUTLAY', '1060701000', 'Furniture and Fixtures'),
    (19, 'EXPENDABLE', '1040499000', 'Other Supplies and Materials Inventory'),
    (20, 'EXPENDABLE', '1040408000', 'Fuel, Oil and Lubricants Inventory'),
    (21, 'CAPITAL OUTLAY', '1060514000', 'Technical and Scientific Equipment'),
    (22, 'CAPITAL OUTLAY', '1060501000', 'Machinery'),
    (23, 'SEMI-EXPANDABLE', '1040519000', 'Semi-Expendable Other Machinery and Equipment'),
    (24, 'SEMI-EXPANDABLE', '1040513000', 'Semi-Expendable Technical and Scientific Equipment'),
    (25, 'EXPENDABLE', '1040402000', 'Accountable Forms, Plates and Stickers Inventory'),
    (26, 'SEMI-EXPANDABLE', '1040512000', 'Semi-Expendable Sports Equipment'),
    (27, 'CAPITAL OUTLAY', '1060601000', 'Motor Vehicles')
ON CONFLICT DO NOTHING;

SELECT setval('uacs_codes_id_seq', 27);

-- ============================================================
-- 9. UNITS OF MEASURE (12 records from Excel)
-- ============================================================
INSERT INTO uoms (id, abbreviation, name) VALUES
    (1, 'GAL', 'GALLON'),
    (2, 'DOZEN', 'DOZEN'),
    (3, 'CAN', 'CAN'),
    (4, 'UNIT', 'UNIT'),
    (5, 'PCS', 'PIECES'),
    (6, 'PACK', 'PACK'),
    (7, 'SET', 'SET'),
    (8, 'BOX', 'BOX'),
    (9, 'REAM', 'REAM'),
    (10, 'PAIR', 'PAIR'),
    (11, 'BOT', 'BOTTLE'),
    (12, 'ROLL', 'ROLL')
ON CONFLICT DO NOTHING;

SELECT setval('uoms_id_seq', 12);

-- ============================================================
-- 10. ITEMS (102 records from Excel)
-- stock_no comes from Excel STOCK NO. column
-- code = stock_no (used as unique code)
-- ============================================================
INSERT INTO items (id, code, stock_no, name, category, quantity, reorder_point, uacs_code, unit) VALUES
    (1, 'EXP-1764846650', 'EXP-1764846650', 'BATTERY - AAA', 'EXPENDABLE', 0, 20, '1040401000', 'PACK'),
    (2, 'EXP-1764924659', 'EXP-1764924659', 'HAND SANITIZER, 500 ML', 'EXPENDABLE', 0, 20, '1040401000', 'BOT'),
    (3, 'EXP-1770048484', 'EXP-1770048484', 'STEEL CABINET', 'EXPENDABLE', 0, 1, '1040499000', 'UNIT'),
    (4, 'EXP-1764848458', 'EXP-1764848458', 'PHOTO PAPER - A4, MATTE', 'EXPENDABLE', 0, 20, '1040401000', 'PACK'),
    (5, 'EXP-1764847228', 'EXP-1764847228', 'DISHWASHING LIQUID - 500 ML', 'EXPENDABLE', 0, 20, '1040401000', 'BOT'),
    (6, 'EXP-1770049876', 'EXP-1770049876', 'MOBILE PHONE (INFINIX)', 'EXPENDABLE', 0, 4, '1040499000', 'PCS'),
    (7, 'EXP-1770048935', 'EXP-1770048935', 'TRASHBIN', 'EXPENDABLE', 0, 20, '1040499000', 'UNIT'),
    (8, '4977046', '4977046', 'EPSON INK 003-CYAN', 'EXPENDABLE', 20, 10, '1040401000', 'BOT'),
    (9, 'EXP-1764847901', 'EXP-1764847901', 'FOOT RUGS - CLOTH, OBLONG OR RECTANGULAR, AND ANY COLOR', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (10, 'EXP-1770060237', 'EXP-1770060237', 'PRINTER (EPSON L3250)', 'EXPENDABLE', 0, 1, '1040499000', 'UNIT'),
    (11, '9474856', '9474856', 'ALCOHOL, ETHYL 500 ML', 'EXPENDABLE', 0, 10, '1040499000', 'BOT'),
    (12, 'EXP-1764843129', 'EXP-1764843129', 'STAPLE WIRE, standard', 'EXPENDABLE', 0, 20, '1040401000', 'BOX'),
    (13, 'EXP-1770048393', 'EXP-1770048393', 'Office Chairs', 'EXPENDABLE', 0, 20, '1040499000', 'PCS'),
    (14, 'EXP-1764847790', 'EXP-1764847790', 'Fastener - Metal, 50 sets/box', 'EXPENDABLE', 0, 20, '1040401000', 'BOX'),
    (15, 'EXP-1770042004', 'EXP-1770042004', 'Scissors', 'EXPENDABLE', 0, 0, '1040499000', 'PCS'),
    (16, 'EXP-1764848636', 'EXP-1764848636', 'Stapler - with staple remover', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (17, 'EXP-1770048358', 'EXP-1770048358', 'Office Table', 'EXPENDABLE', 0, 20, '1040499000', 'UNIT'),
    (18, 'EXP-1770618479', 'EXP-1770618479', 'Official Receipt', 'EXPENDABLE', 0, 10, '1040402000', 'PACK'),
    (19, 'EXP-1764841369', 'EXP-1764841369', 'BOND PAPER - A4, 80gsm', 'EXPENDABLE', 0, 20, '1040401000', 'REAM'),
    (20, 'EXP-1770049331', 'EXP-1770049331', 'Scanner (Epson Workforce)', 'EXPENDABLE', 0, 1, '1040499000', 'UNIT'),
    (21, 'EXP-1764847949', 'EXP-1764847949', 'Glue - 130g, all purpose', 'EXPENDABLE', 0, 20, '1040401000', 'BOT'),
    (22, 'EXP-1764846964', 'EXP-1764846964', 'Clip - Backfold, 19mm, black', 'EXPENDABLE', 0, 20, '1040401000', 'BOX'),
    (23, '9305209', '9305209', 'EPSON INK 003 - Yellow', 'EXPENDABLE', 20, 10, '1040401000', 'BOT'),
    (24, 'EXP-1764847006', 'EXP-1764847006', 'Clip - Backfold, 24mm, black', 'EXPENDABLE', 0, 20, '1040401000', 'BOX'),
    (25, 'SEM-1756121423', 'SEM-1756121423', 'CORKBOARD - 4x8 ft.', 'SEMI-EXPENDABLE', 0, 0, '1040502000', 'UNIT'),
    (26, 'EXP-1770050401', 'EXP-1770050401', 'Floor Mounted Aircon', 'EXPENDABLE', 0, 1, '1040499000', 'UNIT'),
    (27, 'EXP-1764842719', 'EXP-1764842719', 'FOLDER, with TAB, A4', 'EXPENDABLE', 0, 20, '1040401000', 'PACK'),
    (28, 'EXP-1764847579', 'EXP-1764847579', 'Dustpan - Metal, heavy duty', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (29, 'EXP-1764847987', 'EXP-1764847987', 'Insecticide - 500mL', 'EXPENDABLE', 0, 20, '1040401000', 'CAN'),
    (30, 'EXP-1764849016', 'EXP-1764849016', 'Toilet Deodorizer - Large, any color', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (31, 'EXP-1764924680', 'EXP-1764924680', 'HAND SOAP, LIQUID, 500mL', 'EXPENDABLE', 0, 20, '1040401000', 'BOT'),
    (32, 'EXP-1764847039', 'EXP-1764847039', 'Clip - Backfold, 32mm, black', 'EXPENDABLE', 0, 20, '1040401000', 'BOX'),
    (33, 'SEM-1756121448', 'SEM-1756121448', 'WHITEBOARD - 4x8 ft.', 'SEMI-EXPENDABLE', 0, 0, '1040502000', 'UNIT'),
    (34, 'EXP-1764847733', 'EXP-1764847733', 'Expanded folder - Green or White', 'EXPENDABLE', 0, 20, '1040401000', 'BOX'),
    (35, '8757832', '8757832', 'MASKING TAPE - 1" or 24mm', 'EXPENDABLE', 0, 36, '1040401000', 'ROLL'),
    (36, 'EXP-1764848331', 'EXP-1764848331', 'Pencil Sharpener - Mechanical, heavy duty, with dispenser', 'EXPENDABLE', 0, 20, '1040401000', 'UNIT'),
    (37, 'EXP-1770049695', 'EXP-1770049695', 'External Hard Drive', 'EXPENDABLE', 0, 5, '1040499000', 'PCS'),
    (38, 'EXP-1770041923', 'EXP-1770041923', 'Scotch Tape 2', 'EXPENDABLE', 0, 0, '1040499000', 'PCS'),
    (39, '5838350', '5838350', 'STAPLE REMOVER - plier type', 'EXPENDABLE', 0, 5, '1040401000', 'PCS'),
    (40, 'EXP-1764847114', 'EXP-1764847114', 'Clipboard - with cover', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (41, '8615046', '8615046', 'EPSON INK 003 - Magenta', 'EXPENDABLE', 20, 10, '1040401000', 'BOT'),
    (42, 'EXP-1770048438', 'EXP-1770048438', 'Foldable Table', 'EXPENDABLE', 0, 20, '1040499000', 'PCS'),
    (43, 'EXP-1764849116', 'EXP-1764849116', 'Trashbag - black, XXL', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (44, 'EXP-1770048777', 'EXP-1770048777', 'Water Dispenser', 'EXPENDABLE', 0, 1, '1040499000', 'UNIT'),
    (45, 'EXP-1764848060', 'EXP-1764848060', 'Lever Arch File - 50pcs/box, blue, landscape', 'EXPENDABLE', 0, 20, '1040401000', 'BOX'),
    (46, 'SEM-1755924858', 'SEM-1755924858', 'CELLPHONE', 'SEMI-EXPENDABLE', 0, 0, '1040507000', 'SET'),
    (47, 'EXP-1770049126', 'EXP-1770049126', 'Mobile Phone', 'EXPENDABLE', 0, 1, '1040499000', 'PCS'),
    (48, 'EXP-1764924625', 'EXP-1764924625', 'DATER STAMP', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (49, 'EXP-1764848563', 'EXP-1764848563', 'Record Book - 500 pages', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (50, 'EXP-1764849083', 'EXP-1764849083', 'Trashbag - black, medium', 'EXPENDABLE', 0, 20, '1040401000', 'PACK'),
    (51, 'EXP-1770050088', 'EXP-1770050088', 'Stamp (Customized, 2x1)', 'EXPENDABLE', 0, 1, '1040401000', 'PCS'),
    (52, 'EXP-1764842208', 'EXP-1764842208', 'ENVELOPE, EXPANDING, KRAFT', 'EXPENDABLE', 0, 20, '1040401000', 'BOX'),
    (53, 'EXP-1764843100', 'EXP-1764843100', 'SIGN PEN, Extra fine tip, Blue, (0.5mm)', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (54, 'EXP-1764847615', 'EXP-1764847615', 'Envelope - Mailing, white', 'EXPENDABLE', 0, 20, '1040401000', 'BOX'),
    (55, 'EXP-1770050316', 'EXP-1770050316', 'Customized dry Seal', 'EXPENDABLE', 0, 2, '1040499000', 'UNIT'),
    (56, 'EXP-1764924920', 'EXP-1764924920', 'PAPER CLIP, vinyl/plastic coated, jumbo 50mm', 'EXPENDABLE', 0, 20, '1040401000', 'BOX'),
    (57, 'EXP-1764846680', 'EXP-1764846680', 'Battery - AA', 'EXPENDABLE', 0, 20, '1040401000', 'PACK'),
    (58, 'EXP-1764847168', 'EXP-1764847168', 'Correction Tape - disposable, 8mm', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (59, 'EXP-1764842087', 'EXP-1764842087', 'ERASER FELT for blackboard/whiteboard', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (60, 'EXP-1764841530', 'EXP-1764841530', 'BOND PAPER - Legal, 80gsm', 'EXPENDABLE', 0, 20, '1040401000', 'REAM'),
    (61, 'EXP-1764925218', 'EXP-1764925218', 'SIGN PEN, Extra fine tip, Black', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (62, 'EXP-1764848536', 'EXP-1764848536', 'Record Book - 300 pages', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (63, 'EXP-1764846769', 'EXP-1764846769', 'Bleach - 500mL', 'EXPENDABLE', 0, 20, '1040401000', 'BOT'),
    (64, '6007260', '6007260', 'PRINTER', 'SEMI-EXPENDABLE', 0, 3, '1040502000', 'UNIT'),
    (65, 'EXP-1764848137', 'EXP-1764848137', 'Light bulb - 10 watts', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (66, 'EXP-1764848907', 'EXP-1764848907', 'Self Inking Stamp - Dater', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (67, 'EXP-1770041971', 'EXP-1770041971', 'Pencil - 12pcs/box', 'EXPENDABLE', 0, 0, '1040499000', 'BOX'),
    (68, '1630563', '1630563', 'SCISSORS - symmetrical, 65mm', 'EXPENDABLE', 0, 10, '1040401000', 'PAIR'),
    (69, 'EXP-1770049954', 'EXP-1770049954', 'Printer (Epson L5290)', 'EXPENDABLE', 0, 7, '1040499000', 'UNIT'),
    (70, 'EXP-1764848871', 'EXP-1764848871', 'Tissue Paper - 200m', 'EXPENDABLE', 0, 20, '1040401000', 'ROLL'),
    (71, 'EXP-1764842996', 'EXP-1764842996', 'PENCIL, Lead/Graphite, With Eraser', 'EXPENDABLE', 0, 20, '1040401000', 'DOZEN'),
    (72, 'EXP-1770042044', 'EXP-1770042044', 'Staple Remover', 'EXPENDABLE', 0, 0, '1040499000', 'PCS'),
    (73, 'EXP-1764849154', 'EXP-1764849154', 'Trashbin - 15L', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (74, 'EXP-1764847549', 'EXP-1764847549', 'Disinfectant Spray - 300-500g', 'EXPENDABLE', 0, 20, '1040401000', 'CAN'),
    (75, 'EXP-1764846850', 'EXP-1764846850', 'Broom - tambo with wooden handle', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (76, 'EXP-1770050427', 'EXP-1770050427', 'Split Type Aircon', 'EXPENDABLE', 0, 2, '1040499000', 'UNIT'),
    (77, 'EXP-1764924817', 'EXP-1764924817', 'PAPER CLIP, vinyl/plastic coated, 33mm', 'EXPENDABLE', 0, 20, '1040401000', 'BOX'),
    (78, 'EXP-1770048104', 'EXP-1770048104', 'EXECUTIVE TABLE', 'EXPENDABLE', 0, 20, '1040499000', 'UNIT'),
    (79, 'EXP-1764849197', 'EXP-1764849197', 'Water Bucket - 15-20L', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (80, 'EXP-1764925297', 'EXP-1764925297', 'TAPE, transparent, 24mm', 'EXPENDABLE', 0, 20, '1040401000', 'ROLL'),
    (81, 'EXP-1770048146', 'EXP-1770048146', 'EXECUTIVE CHAIR', 'EXPENDABLE', 0, 20, '1040499000', 'UNIT'),
    (82, 'EXP-1764848186', 'EXP-1764848186', 'Mop - spin type, with plastic basket and refill', 'EXPENDABLE', 0, 20, '1040401000', 'SET'),
    (83, 'EXP-1764848962', 'EXP-1764848962', 'Toilet Bowl Cleaner 900mL - 1L', 'EXPENDABLE', 0, 20, '1040401000', 'BOT'),
    (84, 'EXP-1764924568', 'EXP-1764924568', 'ALCOHOL, Ethyl, 1 Gallon', 'EXPENDABLE', 0, 20, '1040401000', 'GAL'),
    (85, 'CAP-AIRCON-3T', 'CAP-AIRCON-3T', 'AIRCON - Floor Mounted, 3T', 'CAPITAL OUTLAY', 0, 0, '1060502000', 'SET'),
    (86, 'EXP-1764848776', 'EXP-1764848776', 'Storage Box - Buffalo Skin or Arlin', 'EXPENDABLE', 0, 20, '1040401000', 'BOX'),
    (87, 'SEM-1756267224', 'SEM-1756267224', 'AIRCON - Wall Mount, 2Hp', 'SEMI-EXPENDABLE', 0, 0, '1040502000', 'SET'),
    (88, 'EXP-1764848605', 'EXP-1764848605', 'Scotch Tape - 1', 'EXPENDABLE', 0, 20, '1040401000', 'ROLL'),
    (89, 'EXP-1764848840', 'EXP-1764848840', 'Tabbing - Arrow Head or Sign Here', 'EXPENDABLE', 0, 20, '1040401000', 'PACK'),
    (90, 'EXP-1764848492', 'EXP-1764848492', 'Puncher - any color', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (91, '4209685', '4209685', 'CALCULATOR - compact, 12 digits', 'EXPENDABLE', 0, 5, '1040401000', 'UNIT'),
    (92, 'EXP-1764847830', 'EXP-1764847830', 'Folder - white, Long', 'EXPENDABLE', 0, 20, '1040401000', 'BOX'),
    (93, 'EXP-1764847063', 'EXP-1764847063', 'Clip - Backfold, 51mm, black', 'EXPENDABLE', 0, 20, '1040401000', 'BOX'),
    (94, 'EXP-1770045825', 'EXP-1770045825', 'MEETING TABLE WITH CHAIRS', 'EXPENDABLE', 0, 20, '1040499000', 'SET'),
    (95, 'EXP-1764847677', 'EXP-1764847677', 'Envelope - Mailing, window, white', 'EXPENDABLE', 0, 20, '1040401000', 'BOX'),
    (96, 'EXP-1764849231', 'EXP-1764849231', 'Water Dipper - Plastic', 'EXPENDABLE', 0, 20, '1040401000', 'PCS'),
    (97, 'EXP-1770047935', 'EXP-1770047935', 'SOFA SET', 'EXPENDABLE', 0, 20, '1040499000', 'UNIT'),
    (98, 'EXP-1764848419', 'EXP-1764848419', 'Philippine Flag - 2x3 ft', 'EXPENDABLE', 0, 5, '1040401000', 'PCS'),
    (99, 'EXP-1769585565', 'EXP-1769585565', 'SOFT BROOM - lanot', 'EXPENDABLE', 0, 20, '1040499000', 'PCS'),
    (100, 'EXP-1764845172', 'EXP-1764845172', 'Toilet Tissue Paper, 2Ply (100% Recycled)', 'EXPENDABLE', 0, 20, '1040401000', 'PACK'),
    (101, '8550374', '8550374', 'EPSON INK 003 - Black', 'EXPENDABLE', 50, 10, '1040401000', 'BOT'),
    (102, '2177501', '2177501', 'PENCIL - graphite with eraser', 'EXPENDABLE', 0, 60, '1040401000', 'PCS')
ON CONFLICT (code) DO NOTHING;

SELECT setval('items_id_seq', 102);

-- ============================================================
-- 11. SUPPLIERS (9 records from Excel)
-- ============================================================
INSERT INTO suppliers (id, name, address, org_type, tax_type, tin) VALUES
    (1, 'MID-TOWN COMPUTERS AND SERVICES', 'LOPEZ JAENA ST., BUTUAN CITY', 'Non-Government', 'VAT', '929-755-615-000'),
    (2, 'RFY MARKETING', 'P-8 AMBAGO, BUTUAN CITY', 'Non-Government', 'VAT', '287-464-966-00000'),
    (3, 'PROCUREMENT SERVICE', 'J.P. RIZAL AVE., BUTUAN CITY', 'Government', 'VAT', ''),
    (4, 'LINK NETWORK SOLUTIONS INC.', '', 'Non-Government', 'VAT', '007-002-021-000'),
    (5, 'AIRMASTERS AIRCONDITIONING SERVICES', 'PHASE 3, BLK 13 LOT 16-18, EMENVILLE SUBD., BRGY. AMBAGO, BUTUAN CITY', 'Non-Government', 'Non-VAT', '713-742-008-000'),
    (6, 'MICO''S KEY SHOP', 'R.CALO St., HUMABON POB.(BGY11) BUTUAN CITY', 'Non-Government', 'Non-VAT', '718-231-398-000'),
    (7, 'KIMSON COMMERCIAL', 'R. CALCO ST., BUTUAN CITY', 'Government', 'VAT', ''),
    (8, 'FMJ Information Technology Solutions', '4TH ST. VILLAGE 2 LIBERTAD, BUTUAN CITY', 'Non-Government', 'Non-VAT', '765-010-774-000'),
    (9, 'COMPAÑERO COMMERCIAL', 'LOPEZ JAENA ST., BUTUAN CITY', 'Non-Government', 'VAT', '128-218-254-000')
ON CONFLICT DO NOTHING;

SELECT setval('suppliers_id_seq', 9);

-- ============================================================
-- 12. PURCHASE ORDERS (20 unique POs from Excel)
-- NOTE: Some POs in original Firebase data shared PO numbers.
--       Suffixes (-B, -C) added to maintain UNIQUE constraint.
-- ============================================================
-- PO item_id mapping (Firebase item UID → PostgreSQL item id):
-- See items table above; IDs correspond to insertion order.

INSERT INTO purchaseorders (id, po_number, supplier_id, total_amount, status, mode_of_procurement,
    delivery_address, payment_terms, po_date, purpose, place_of_delivery) VALUES
    (1, 'BUT25-02224',   3, 59127.80,  'pending',   'Agency -To - Agency', 'J.P. RIZAL AVE., BUTUAN CITY',                                          '30 days', '2026-02-02', 'DMW1',                                                         'DMW-CARAGA, Butuan City'),
    (2, '2025-05-036B',  9, 8900.00,   'completed', 'Small Value Procurement - SVP', 'LOPEZ JAENA ST., BUTUAN CITY',                                 '30 days', '2025-05-20', 'Procurement of cork board and whiteboard for the use of DMW',  'DMW-CARAGA, Butuan City'),
    (3, '2025-07-064',   1, 43450.00,  'completed', 'Small Value Procurement - SVP', 'LOPEZ JAENA ST., BUTUAN CITY',                                 '30 days', '2025-07-01', 'Supply and deliver of printer inks for DMW Caraga',            'DMW-CARAGA, Butuan City'),
    (4, '2025-04-022',   1, 5000.00,   'pending',   'Small Value Procurement - SVP', 'LOPEZ JAENA ST., BUTUAN CITY',                                 '30 days', '2025-04-28', 'For Welfare and Reintegration Services Division Use',          'RO XIII-BUTUAN CITY'),
    (5, '2025-07-074',   2, 47370.00,  'pending',   'Small Value Procurement - SVP', 'P-8 AMBAGO, BUTUAN CITY',                                      '30 days', '2025-07-23', 'Procurement of water dispenser for the use of DMW Caraga',     'RO XIII-BUTUAN CITY'),
    (6, '2025-04-026',   5, 322594.00, 'pending',   'Small Value Procurement - SVP', 'PHASE 3, BLK 13 LOT 16-18, EMENVILLE SUBD., BRGY. AMBAGO, BUTUAN CITY', '30 days', '2025-04-30', 'Procurement of air conditioning units for the use of DMW Caraga', 'RO XIII-BUTUAN CITY'),
    (7, 'BUT25-02224-B', 3, 34026.90,  'pending',   'Agency -To - Agency', 'J.P. RIZAL AVE., BUTUAN CITY',                                          '30 days', '2026-02-02', 'DMW',                                                          'DMW-CARAGA, Butuan City'),
    (8, 'BUT25-02541',   1, 246809.00, 'pending',   'Agency -To - Agency', 'LOPEZ JAENA ST., BUTUAN CITY',                                          '30 days', '2026-02-02', 'DMW',                                                          'DMW-CARAGA, Butuan City'),
    (9, 'BUT25-02541-B', 3, 43450.00,  'pending',   'Agency -To - Agency', 'J.P. RIZAL AVE., BUTUAN CITY',                                          '30 days', '2026-02-02', 'DMW',                                                          'DMW-CARAGA, Butuan City'),
    (10, '2025-11-126',   8, 394000.00, 'pending',   'Small Value Procurement - SVP', '4TH ST. VILLAGE 2 LIBERTAD, BUTUAN CITY',                      '30 days', '2025-11-10', 'Furniture and fixture for DMW CARAGA',                         'RO XIII-BUTUAN CITY'),
    (11, '2025-10-109',   1, 225540.00, 'pending',   'Small Value Procurement - SVP', 'LOPEZ JAENA ST., BUTUAN CITY',                                 '30 days', '2025-10-03', 'Procurement of scanner for DMW Caraga',                        'RO XIII-BUTUAN CITY'),
    (12, '2025-05-047A',  6, 6820.00,   'pending',   'Small Value Procurement - SVP', 'R.CALO St., HUMABON POB.(BGY11) BUTUAN CITY',                  '30 days', '2025-04-28', 'Customized stamps for document and files of DMW RO XIII office', 'RO XIII-BUTUAN CITY'),
    (13, '2025-10-107',   1, 139986.00, 'pending',   'Small Value Procurement - SVP', 'LOPEZ JAENA ST., BUTUAN CITY',                                 '30 days', '2025-10-03', 'Procurement of additional printers for DMW Caraga CY 2025',    'RO XIII-BUTUAN CITY'),
    (14, '2025-05-047',   2, 39150.00,  'pending',   'Small Value Procurement - SVP', 'P-8 AMBAGO, BUTUAN CITY',                                      '30 days', '2025-05-26', 'Supply and delivery of trash bins and trash bags',             'RO XIII-BUTUAN CITY'),
    (15, '2025-06-063',   7, 9000.00,   'pending',   'Agency -To - Agency', 'R. CALCO ST., BUTUAN CITY',                                             '30 days', '2025-06-27', 'Procurement of dry seal for the use of DMW Caraga Regional Office', 'DMW-CARAGA, Butuan City'),
    (16, '2025-07-075',   1, 37440.00,  'pending',   'Small Value Procurement - SVP', 'LOPEZ JAENA ST., BUTUAN CITY',                                 '30 days', '2025-07-28', 'Supply and delivery of external hard drives',                  'RO XIII-BUTUAN CITY'),
    (17, 'BUT25-02541-C', 3, 49362.92,  'pending',   'Agency -To - Agency', 'J.P. RIZAL AVE., BUTUAN CITY',                                          '30 days', '2026-02-02', 'DMW',                                                          'DMW-CARAGA, Butuan City'),
    (18, '2025-05-047B',  4, 241110.00, 'pending',   'Small Value Procurement - SVP', '3RD FLOOR MATHEUS BLDG., GEN.LUNA POBLACION, MAKATI CITY',      '30 days', '2025-05-28', 'Supply and delivery of printer units for DMW Caraga',          'DMW-CARAGA, Butuan City'),
    (19, '2025-04-022-B', 1, 5000.00,   'completed', 'Small Value Procurement - SVP', 'LOPEZ JAENA ST., BUTUAN CITY',                                 '30 days', '2025-04-08', 'Cellphone for WRSD',                                           'DMW-CARAGA, Butuan City'),
    (20, '2025-07-071',   1, 20000.00,  'pending',   'Small Value Procurement - SVP', 'LOPEZ JAENA ST., BUTUAN CITY',                                 '30 days', '2025-07-10', 'Procurement of cellphone for the DMW Division''s Hotline',     'RO XIII-BUTUAN CITY')
ON CONFLICT (po_number) DO NOTHING;

SELECT setval('purchaseorders_id_seq', 20);

-- ============================================================
-- 13. PO ITEMS (items linked to each PO)
-- item_id references items(id) from section 10 above
-- ============================================================
INSERT INTO po_items (po_id, item_id, item_code, item_name, unit, quantity, unit_price) VALUES
    -- PO 1 (BUT25-02224): 10 items
    (1, 70, 'EXP-1764848871', 'Tissue Paper - 200m', 'ROLL', 1, 0),
    (1, 19, 'EXP-1764841369', 'BOND PAPER - A4, 80gsm', 'REAM', 1, 0),
    (1, 60, 'EXP-1764841530', 'BOND PAPER - Legal, 80gsm', 'REAM', 1, 0),
    (1, 59, 'EXP-1764842087', 'ERASER FELT for blackboard/whiteboard', 'PCS', 1, 0),
    (1, 52, 'EXP-1764842208', 'ENVELOPE, EXPANDING, KRAFT', 'BOX', 1, 0),
    (1, 27, 'EXP-1764842719', 'FOLDER, with TAB, A4', 'PACK', 1, 0),
    (1, 77, 'EXP-1764924817', 'PAPER CLIP, vinyl/plastic coated, 33mm', 'BOX', 1, 0),
    (1, 61, 'EXP-1764925218', 'SIGN PEN, Extra fine tip, Black', 'PCS', 1, 0),
    (1, 53, 'EXP-1764843100', 'SIGN PEN, Extra fine tip, Blue, (0.5mm)', 'PCS', 1, 0),
    (1, 12, 'EXP-1764843129', 'STAPLE WIRE, standard', 'BOX', 1, 0),
    -- PO 2 (2025-05-036B): 2 items
    (2, 25, 'SEM-1756121423', 'CORKBOARD - 4x8 ft.', 'UNIT', 1, 0),
    (2, 33, 'SEM-1756121448', 'WHITEBOARD - 4x8 ft.', 'UNIT', 1, 0),
    -- PO 3 (2025-07-064): 4 items
    (3, 101, '8550374', 'EPSON INK 003 - Black', 'BOT', 1, 0),
    (3, 8, '4977046', 'EPSON INK 003-CYAN', 'BOT', 1, 0),
    (3, 41, '8615046', 'EPSON INK 003 - Magenta', 'BOT', 1, 0),
    (3, 23, '9305209', 'EPSON INK 003 - Yellow', 'BOT', 1, 0),
    -- PO 4 (2025-04-022): 1 item
    (4, 6, 'EXP-1770049876', 'MOBILE PHONE (INFINIX)', 'PCS', 1, 0),
    -- PO 5 (2025-07-074): 1 item
    (5, 44, 'EXP-1770048777', 'Water Dispenser', 'UNIT', 1, 0),
    -- PO 6 (2025-04-026): 2 items
    (6, 26, 'EXP-1770050401', 'Floor Mounted Aircon', 'UNIT', 1, 0),
    (6, 76, 'EXP-1770050427', 'Split Type Aircon', 'UNIT', 1, 0),
    -- PO 7 (BUT25-02224-B): 11 items
    (7, 84, 'EXP-1764924568', 'ALCOHOL, Ethyl, 1 Gallon', 'GAL', 1, 0),
    (7, 58, 'EXP-1764847168', 'Correction Tape - disposable, 8mm', 'PCS', 1, 0),
    (7, 48, 'EXP-1764924625', 'DATER STAMP', 'PCS', 1, 0),
    (7, 2, 'EXP-1764924659', 'HAND SANITIZER, 500 ML', 'BOT', 1, 0),
    (7, 31, 'EXP-1764924680', 'HAND SOAP, LIQUID, 500mL', 'BOT', 1, 0),
    (7, 29, 'EXP-1764847987', 'Insecticide - 500mL', 'CAN', 1, 0),
    (7, 77, 'EXP-1764924817', 'PAPER CLIP, vinyl/plastic coated, 33mm', 'BOX', 1, 0),
    (7, 56, 'EXP-1764924920', 'PAPER CLIP, vinyl/plastic coated, jumbo 50mm', 'BOX', 1, 0),
    (7, 61, 'EXP-1764925218', 'SIGN PEN, Extra fine tip, Black', 'PCS', 1, 0),
    (7, 53, 'EXP-1764843100', 'SIGN PEN, Extra fine tip, Blue, (0.5mm)', 'PCS', 1, 0),
    (7, 88, 'EXP-1764848605', 'Scotch Tape - 1', 'ROLL', 1, 0),
    -- PO 8 (BUT25-02541): 45 items
    (8, 57, 'EXP-1764846680', 'Battery - AA', 'PACK', 1, 0),
    (8, 1, 'EXP-1764846650', 'BATTERY - AAA', 'PACK', 1, 0),
    (8, 63, 'EXP-1764846769', 'Bleach - 500mL', 'BOT', 1, 0),
    (8, 19, 'EXP-1764841369', 'BOND PAPER - A4, 80gsm', 'REAM', 1, 0),
    (8, 75, 'EXP-1764846850', 'Broom - tambo with wooden handle', 'PCS', 1, 0),
    (8, 22, 'EXP-1764846964', 'Clip - Backfold, 19mm, black', 'BOX', 1, 0),
    (8, 32, 'EXP-1764847039', 'Clip - Backfold, 32mm, black', 'BOX', 1, 0),
    (8, 93, 'EXP-1764847063', 'Clip - Backfold, 51mm, black', 'BOX', 1, 0),
    (8, 40, 'EXP-1764847114', 'Clipboard - with cover', 'PCS', 1, 0),
    (8, 58, 'EXP-1764847168', 'Correction Tape - disposable, 8mm', 'PCS', 1, 0),
    (8, 5, 'EXP-1764847228', 'DISHWASHING LIQUID - 500 ML', 'BOT', 1, 0),
    (8, 34, 'EXP-1764847733', 'Expanded folder - Green or White', 'BOX', 1, 0),
    (8, 14, 'EXP-1764847790', 'Fastener - Metal, 50 sets/box', 'BOX', 1, 0),
    (8, 92, 'EXP-1764847830', 'Folder - white, Long', 'BOX', 1, 0),
    (8, 9, 'EXP-1764847901', 'FOOT RUGS - CLOTH', 'PCS', 1, 0),
    (8, 21, 'EXP-1764847949', 'Glue - 130g, all purpose', 'BOT', 1, 0),
    (8, 29, 'EXP-1764847987', 'Insecticide - 500mL', 'CAN', 1, 0),
    (8, 45, 'EXP-1764848060', 'Lever Arch File - 50pcs/box', 'BOX', 1, 0),
    (8, 65, 'EXP-1764848137', 'Light bulb - 10 watts', 'PCS', 1, 0),
    (8, 82, 'EXP-1764848186', 'Mop - spin type', 'SET', 1, 0),
    (8, 36, 'EXP-1764848331', 'Pencil Sharpener', 'UNIT', 1, 0),
    (8, 98, 'EXP-1764848419', 'Philippine Flag - 2x3 ft', 'PCS', 1, 0),
    (8, 90, 'EXP-1764848492', 'Puncher - any color', 'PCS', 1, 0),
    (8, 62, 'EXP-1764848536', 'Record Book - 300 pages', 'PCS', 1, 0),
    (8, 49, 'EXP-1764848563', 'Record Book - 500 pages', 'PCS', 1, 0),
    (8, 38, 'EXP-1770041923', 'Scotch Tape 2', 'PCS', 1, 0),
    (8, 16, 'EXP-1764848636', 'Stapler - with staple remover', 'PCS', 1, 0),
    (8, 86, 'EXP-1764848776', 'Storage Box', 'BOX', 1, 0),
    (8, 89, 'EXP-1764848840', 'Tabbing - Arrow Head', 'PACK', 1, 0),
    (8, 70, 'EXP-1764848871', 'Tissue Paper - 200m', 'ROLL', 1, 0),
    (8, 66, 'EXP-1764848907', 'Self Inking Stamp - Dater', 'PCS', 1, 0),
    (8, 83, 'EXP-1764848962', 'Toilet Bowl Cleaner', 'BOT', 1, 0),
    (8, 50, 'EXP-1764849083', 'Trashbag - black, medium', 'PACK', 1, 0),
    (8, 43, 'EXP-1764849116', 'Trashbag - black, XXL', 'PCS', 1, 0),
    (8, 73, 'EXP-1764849154', 'Trashbin - 15L', 'PCS', 1, 0),
    (8, 79, 'EXP-1764849197', 'Water Bucket - 15-20L', 'PCS', 1, 0),
    (8, 96, 'EXP-1764849231', 'Water Dipper - Plastic', 'PCS', 1, 0),
    (8, 60, 'EXP-1764841530', 'BOND PAPER - Legal, 80gsm', 'REAM', 1, 0),
    (8, 24, 'EXP-1764847006', 'Clip - Backfold, 24mm, black', 'BOX', 1, 0),
    (8, 74, 'EXP-1764847549', 'Disinfectant Spray - 300-500g', 'CAN', 1, 0),
    (8, 28, 'EXP-1764847579', 'Dustpan - Metal, heavy duty', 'PCS', 1, 0),
    (8, 54, 'EXP-1764847615', 'Envelope - Mailing, white', 'BOX', 1, 0),
    (8, 95, 'EXP-1764847677', 'Envelope - Mailing, window, white', 'BOX', 1, 0),
    (8, 4, 'EXP-1764848458', 'PHOTO PAPER - A4, MATTE', 'PACK', 1, 0),
    (8, 30, 'EXP-1764849016', 'Toilet Deodorizer - Large, any color', 'PCS', 1, 0),
    -- PO 9 (BUT25-02541-B): 4 items
    (9, 101, '8550374', 'EPSON INK 003 - Black', 'BOT', 1, 0),
    (9, 8, '4977046', 'EPSON INK 003-CYAN', 'BOT', 1, 0),
    (9, 41, '8615046', 'EPSON INK 003 - Magenta', 'BOT', 1, 0),
    (9, 23, '9305209', 'EPSON INK 003 - Yellow', 'BOT', 1, 0),
    -- PO 10 (2025-11-126): 8 items
    (10, 94, 'EXP-1770045825', 'MEETING TABLE WITH CHAIRS', 'SET', 1, 0),
    (10, 97, 'EXP-1770047935', 'SOFA SET', 'UNIT', 1, 0),
    (10, 78, 'EXP-1770048104', 'EXECUTIVE TABLE', 'UNIT', 1, 0),
    (10, 81, 'EXP-1770048146', 'EXECUTIVE CHAIR', 'UNIT', 1, 0),
    (10, 17, 'EXP-1770048358', 'Office Table', 'UNIT', 1, 0),
    (10, 13, 'EXP-1770048393', 'Office Chairs', 'PCS', 1, 0),
    (10, 42, 'EXP-1770048438', 'Foldable Table', 'PCS', 1, 0),
    (10, 3, 'EXP-1770048484', 'STEEL CABINET', 'UNIT', 1, 0),
    -- PO 11 (2025-10-109): 1 item
    (11, 20, 'EXP-1770049331', 'Scanner (Epson Workforce)', 'UNIT', 1, 0),
    -- PO 12 (2025-05-047A): 1 item
    (12, 51, 'EXP-1770050088', 'Stamp (Customized, 2x1)', 'PCS', 1, 0),
    -- PO 13 (2025-10-107): 1 item
    (13, 69, 'EXP-1770049954', 'Printer (Epson L5290)', 'UNIT', 1, 0),
    -- PO 14 (2025-05-047): 2 items
    (14, 7, 'EXP-1770048935', 'TRASHBIN', 'UNIT', 1, 0),
    (14, 43, 'EXP-1764849116', 'Trashbag - black, XXL', 'PCS', 1, 0),
    -- PO 15 (2025-06-063): 1 item
    (15, 55, 'EXP-1770050316', 'Customized dry Seal', 'UNIT', 1, 0),
    -- PO 16 (2025-07-075): 1 item
    (16, 37, 'EXP-1770049695', 'External Hard Drive', 'PCS', 1, 0),
    -- PO 17 (BUT25-02541-C): 7 items
    (17, 11, '9474856', 'ALCOHOL, ETHYL 500 ML', 'BOT', 1, 0),
    (17, 19, 'EXP-1764841369', 'BOND PAPER - A4, 80gsm', 'REAM', 1, 0),
    (17, 67, 'EXP-1770041971', 'Pencil - 12pcs/box', 'BOX', 1, 0),
    (17, 15, 'EXP-1770042004', 'Scissors', 'PCS', 1, 0),
    (17, 72, 'EXP-1770042044', 'Staple Remover', 'PCS', 1, 0),
    (17, 35, '8757832', 'MASKING TAPE - 1" or 24mm', 'ROLL', 1, 0),
    (17, 60, 'EXP-1764841530', 'BOND PAPER - Legal, 80gsm', 'REAM', 1, 0),
    -- PO 18 (2025-05-047B): 1 item
    (18, 10, 'EXP-1770060237', 'PRINTER (EPSON L3250)', 'UNIT', 1, 0),
    -- PO 19 (2025-04-022-B): 1 item
    (19, 46, 'SEM-1755924858', 'CELLPHONE', 'SET', 1, 0),
    -- PO 20 (2025-07-071): 1 item
    (20, 47, 'EXP-1770049126', 'Mobile Phone', 'PCS', 1, 0);

-- ============================================================
-- 14. IARS (from Excel - 4 unique IARs with 7 item rows)
-- ============================================================
INSERT INTO iars (id, iar_number, po_id, inspection_date, invoice_number, invoice_date, purpose, status) VALUES
    (1, '2025-07-027', 3, '2025-07-04', '608',  '2025-07-04', 'Supply and deliver of printer inks for DMW Caraga', 'completed'),
    (2, '2025-07-028', 3, '2025-07-05', '608',  '2025-07-05', 'Supply and deliver of printer inks for DMW Caraga', 'completed'),
    (3, '2025-07-029', 3, '2025-07-06', '608',  '2025-07-06', 'Supply and deliver of printer inks for DMW Caraga', 'completed'),
    (4, '2025-07-030', 3, '2025-07-07', '608',  '2025-07-07', 'Supply and deliver of printer inks for DMW Caraga', 'completed'),
    (5, '2025-05-008', 19, '2025-05-02', '3727', '2025-05-02', 'Cellphone for WRSD', 'completed'),
    (6, '2025-05-18C', 2, '2025-05-27', '0',    '2025-05-27', 'Procurement of cork board and whiteboard for the use of DMW', 'completed'),
    (7, '2025-05-18C-B', 2, '2025-05-28', '1', '2025-05-28', 'Procurement of cork board and whiteboard for the use of DMW', 'completed')
ON CONFLICT (iar_number) DO NOTHING;

SELECT setval('iars_id_seq', 7);

-- IAR Items
INSERT INTO iar_items (iar_id, item_id, item_code, item_name, quantity, unit_cost) VALUES
    (1, 101, '8550374', 'EPSON INK 003 - Black', 50, 0),
    (2, 8, '4977046', 'EPSON INK 003-CYAN', 20, 0),
    (3, 41, '8615046', 'EPSON INK 003 - Magenta', 20, 0),
    (4, 23, '9305209', 'EPSON INK 003 - Yellow', 20, 0),
    (5, 46, 'SEM-1755924858', 'CELLPHONE', 1, 5000),
    (6, 25, 'SEM-1756121423', 'CORKBOARD - 4x8 ft.', 1, 4700),
    (7, 33, 'SEM-1756121448', 'WHITEBOARD - 4x8 ft.', 1, 4200);

-- ============================================================
-- 15. INVENTORY CUSTODIAN SLIPS (3 records from Excel)
-- ============================================================
INSERT INTO inventory_custodian_slips (id, ics_no, date_of_issue, description, inventory_no,
    issued_to, ppe_no, received_by_position) VALUES
    (1, '2026-01-0001', '2026-01-27', 'CORKBOARD - 4x8 ft.',   '5020-05-0001', 'MARK E. MARASIGAN',  '2025-05-02-0001', 'Admin Officer I'),
    (2, '2025-05-0002', '2025-05-27', 'WHITEBOARD - 4x8 ft.',  '5020-05-0002', 'MARK E. MARASIGAN',  '2025-05-02-0002', 'Admin Officer I'),
    (3, '2025-05-0001', '2025-05-02', 'CELLPHONE',             '5070-05-0001', 'REGIE B. LAGRAMADA', '2025-05-07-0001', 'LEO I')
ON CONFLICT DO NOTHING;

SELECT setval('inventory_custodian_slips_id_seq', 3);

-- ============================================================
-- 16. PROPERTY CARDS (3 records from Excel)
-- ============================================================
INSERT INTO property_cards (id, property_number, description, acquisition_cost, ics_no,
    issued_date, issued_to, received_date) VALUES
    (1, '2025-05-07-0001', 'CELLPHONE',           5000, '2025-05-0001', '2025-05-02', 'REGIE B. LAGRAMADA', '2025-05-02'),
    (2, '2025-05-02-0001', 'CORKBOARD - 4x8 ft.', 4700, '2026-01-0001', '2026-01-27', 'MARK E. MARASIGAN',  '2025-05-27'),
    (3, '2025-05-02-0002', 'WHITEBOARD - 4x8 ft.', 4200, '2025-05-0002', '2025-05-27', 'MARK E. MARASIGAN',  '2025-05-27')
ON CONFLICT DO NOTHING;

SELECT setval('property_cards_id_seq', 3);

-- ============================================================
-- 17. PROPERTY LEDGER CARDS (6 transactions from Excel)
-- ============================================================
INSERT INTO property_ledger_cards (property_number, description, acquisition_date, acquisition_cost,
    transaction_no, date, reference,
    receipt_qty, receipt_unit_cost, receipt_total_cost,
    issue_qty, issue_unit_cost, issue_total_cost,
    balance_qty, balance_unit_cost, balance_total_cost) VALUES
    -- CORKBOARD receipt
    ('2025-05-02-0001', 'CORKBOARD - 4x8 ft.', '2025-05-27', 4700, 0, '2025-05-27', 'IAR-For-2025-05-02-0001', 1, 4700, 4700, 0, 0, 0, 1, 4700, 4700),
    -- CORKBOARD issue
    ('2025-05-02-0001', 'CORKBOARD - 4x8 ft.', '2025-05-27', 4700, 1, '2026-01-27', 'ICS#2026-01-0001', 0, 0, 0, 1, 4700, 4700, 0, 0, 0),
    -- CELLPHONE receipt
    ('2025-05-07-0001', 'CELLPHONE', '2025-05-02', 5000, 0, '2025-05-02', 'IAR-For-2025-05-07-0001', 1, 5000, 5000, 0, 0, 0, 1, 5000, 5000),
    -- CELLPHONE issue
    ('2025-05-07-0001', 'CELLPHONE', '2025-05-02', 5000, 1, '2025-05-02', 'ICS#2025-05-0001', 0, 0, 0, 0, 0, 0, 0, 0, 0),
    -- WHITEBOARD receipt
    ('2025-05-02-0002', 'WHITEBOARD - 4x8 ft.', '2025-05-27', 4200, 0, '2025-05-27', 'IAR-For-2025-05-02-0002', 1, 4200, 4200, 0, 0, 0, 1, 4200, 4200),
    -- WHITEBOARD issue
    ('2025-05-02-0002', 'WHITEBOARD - 4x8 ft.', '2025-05-27', 4200, 1, '2025-05-27', 'ICS#2025-05-0002', 0, 0, 0, 1, 4200, 4200, 0, 0, 0);

-- ============================================================
-- 18. RECEIVED SEMI-EXPENDABLE ITEMS (3 records from Excel)
-- ============================================================
INSERT INTO received_semi_expendable_items (id, item_id, generated_item_id, ics_no, inventory_no,
    issued_to, item_description, ppe_no, brand, model, serial_no, status) VALUES
    (1, 33, '3', '2025-05-003', '5020-05-0002', 'MARK E. MARASIGAN', 'WHITEBOARD - 4x8 ft.', '2025-05-02-0002', 'N/A', 'N/A', 'N/A', 'Issued'),
    (2, 46, '9', '2025-05-001', '5070-05-0001', 'REGIE B. LAGRAMADA', 'CELLPHONE', '2025-05-07-0001', 'Infinix Smart 9', 'X6532', '1264570512019860', 'Issued'),
    (3, 25, '2', '2025-05-002', '5020-05-0001', 'MARK E. MARASIGAN', 'CORKBOARD - 4x8 ft.', '2025-05-02-0001', 'N/A', 'N/A', 'N/A', 'Issued')
ON CONFLICT DO NOTHING;

SELECT setval('received_semi_expendable_items_id_seq', 3);

-- ============================================================
-- 19. REQUISITION AND ISSUE SLIPS (2 unique RIS from Excel)
-- ============================================================
INSERT INTO requisition_issue_slips (id, ris_no, division, ris_date, purpose,
    approved_by_designation, approved_by_name,
    issued_by_designation, issued_by_name,
    received_by_designation, received_by_name,
    requested_by_designation, requested_by_name,
    status) VALUES
    (1, '2026-0001', 'MWPTD', '2026-01-07', '',
        'Admin Officer III', 'RITCHEL T. BEBERA',
        'Admin Officer V', 'GARY P. SALADORES',
        'Sr. LEO', 'CHERRYL C. OCULAM',
        'Sr. LEO', 'CHERRYL C. OCULAM',
        'POSTED'),
    (2, '2026-0002', 'WRSD', '2026-01-13', '',
        'SAO', 'GIOVANNI S. PAREDES',
        'Sr. LEO', 'GARY P. SALADORES',
        'LEO III', 'AURORA JEAN A. TORRALBA',
        'LEO III', 'AURORA JEAN A. TORRALBA',
        'POSTED')
ON CONFLICT (ris_no) DO NOTHING;

SELECT setval('requisition_issue_slips_id_seq', 2);

-- RIS Items (both RIS reference EPSON INK items)
INSERT INTO ris_items (ris_id, item_id, description, uom, quantity) VALUES
    (1, 101, 'EPSON INK 003 - Black', 'BOT', 1),
    (2, 101, 'EPSON INK 003 - Black', 'BOT', 1),
    (2, 8, 'EPSON INK 003-CYAN', 'BOT', 1);

-- ============================================================
-- 20. STOCK CARDS (4 items × 4 transactions each = 16 rows)
-- ============================================================
-- EPSON INK 003 - Cyan (item_id=8)
INSERT INTO stock_cards (item_id, item_code, item_name, transaction_no, date, reference,
    receipt_qty, receipt_unit_cost, receipt_total_cost,
    issue_qty, issue_unit_cost, issue_total_cost,
    balance_qty, balance_unit_cost, balance_total_cost) VALUES
    (8, '4977046', 'EPSON INK 003 - Cyan', 0, '2025-08-22', 'IAR-2025-07-064', 20, 0, 0, 0, 0, 0, 20, 0, 0),
    (8, '4977046', 'EPSON INK 003 - Cyan', 1, '2025-07-04', '2025-07-027', 20, 0, 0, 0, 0, 0, 40, 0, 0),
    (8, '4977046', 'EPSON INK 003 - Cyan', 2, '2025-07-04', '2025-07-027', 20, 0, 0, 0, 0, 0, 60, 0, 0),
    (8, '4977046', 'EPSON INK 003 - Cyan', 3, '2025-07-04', '2025-07-027', 20, 0, 0, 0, 0, 0, 80, 0, 0),
    -- EPSON INK 003 - Yellow (item_id=23)
    (23, '9305209', 'EPSON INK 003 - Yellow', 0, '2025-08-22', 'IAR-2025-07-064', 20, 0, 0, 0, 0, 0, 20, 0, 0),
    (23, '9305209', 'EPSON INK 003 - Yellow', 1, '2025-07-04', '2025-07-027', 20, 0, 0, 0, 0, 0, 40, 0, 0),
    (23, '9305209', 'EPSON INK 003 - Yellow', 2, '2025-07-04', '2025-07-027', 20, 0, 0, 0, 0, 0, 60, 0, 0),
    (23, '9305209', 'EPSON INK 003 - Yellow', 3, '2025-07-04', '2025-07-027', 20, 0, 0, 0, 0, 0, 80, 0, 0),
    -- EPSON INK 003 - Magenta (item_id=41)
    (41, '8615046', 'EPSON INK 003 - Magenta', 0, '2025-08-22', 'IAR-2025-07-064', 20, 0, 0, 0, 0, 0, 20, 0, 0),
    (41, '8615046', 'EPSON INK 003 - Magenta', 1, '2025-07-04', '2025-07-027', 20, 0, 0, 0, 0, 0, 40, 0, 0),
    (41, '8615046', 'EPSON INK 003 - Magenta', 2, '2025-07-04', '2025-07-027', 20, 0, 0, 0, 0, 0, 60, 0, 0),
    (41, '8615046', 'EPSON INK 003 - Magenta', 3, '2025-07-04', '2025-07-027', 20, 0, 0, 0, 0, 0, 80, 0, 0),
    -- EPSON INK 003 - Black (item_id=101)
    (101, '8550374', 'EPSON INK 003 - Black', 0, '2025-08-22', 'IAR-2025-07-064', 50, 0, 0, 0, 0, 0, 50, 0, 0),
    (101, '8550374', 'EPSON INK 003 - Black', 1, '2025-07-04', '2025-07-027', 50, 0, 0, 0, 0, 0, 100, 0, 0),
    (101, '8550374', 'EPSON INK 003 - Black', 2, '2025-07-04', '2025-07-027', 50, 0, 0, 0, 0, 0, 150, 0, 0),
    (101, '8550374', 'EPSON INK 003 - Black', 3, '2025-07-04', '2025-07-027', 50, 0, 0, 0, 0, 0, 200, 0, 0);

-- ============================================================
-- 21. SUPPLIES LEDGER CARDS (4 items × 4 transactions = 16 rows)
-- ============================================================
INSERT INTO supplies_ledger_cards (item_id, item_code, item_name, transaction_no, date, reference,
    receipt_qty, receipt_unit_cost, receipt_total_cost,
    issue_qty, issue_unit_cost, issue_total_cost,
    balance_qty, balance_unit_cost, balance_total_cost) VALUES
    -- EPSON INK 003 - Cyan (item_id=8) @ 395/bot
    (8, '4977046', 'EPSON INK 003 - Cyan', 0, '2025-08-22', 'IAR-2025-07-064', 20, 395, 7900, 0, 0, 0, 20, 395, 7900),
    (8, '4977046', 'EPSON INK 003 - Cyan', 1, '2025-07-04', '2025-07-027', 20, 395, 7900, 0, 0, 0, 40, 395, 15800),
    (8, '4977046', 'EPSON INK 003 - Cyan', 2, '2025-07-04', '2025-07-027', 20, 395, 7900, 0, 0, 0, 60, 395, 23700),
    (8, '4977046', 'EPSON INK 003 - Cyan', 3, '2025-07-04', '2025-07-027', 20, 395, 7900, 0, 0, 0, 80, 395, 31600),
    -- EPSON INK 003 - Yellow (item_id=23) @ 395/bot
    (23, '9305209', 'EPSON INK 003 - Yellow', 0, '2025-08-22', 'IAR-2025-07-064', 20, 395, 7900, 0, 0, 0, 20, 395, 7900),
    (23, '9305209', 'EPSON INK 003 - Yellow', 1, '2025-07-04', '2025-07-027', 20, 395, 7900, 0, 0, 0, 40, 395, 15800),
    (23, '9305209', 'EPSON INK 003 - Yellow', 2, '2025-07-04', '2025-07-027', 20, 395, 7900, 0, 0, 0, 60, 395, 23700),
    (23, '9305209', 'EPSON INK 003 - Yellow', 3, '2025-07-04', '2025-07-027', 20, 395, 7900, 0, 0, 0, 80, 395, 31600),
    -- EPSON INK 003 - Magenta (item_id=41) @ 395/bot
    (41, '8615046', 'EPSON INK 003 - Magenta', 0, '2025-08-22', 'IAR-2025-07-064', 20, 395, 7900, 0, 0, 0, 20, 395, 7900),
    (41, '8615046', 'EPSON INK 003 - Magenta', 1, '2025-07-04', '2025-07-027', 20, 395, 7900, 0, 0, 0, 40, 395, 15800),
    (41, '8615046', 'EPSON INK 003 - Magenta', 2, '2025-07-04', '2025-07-027', 20, 395, 7900, 0, 0, 0, 60, 395, 23700),
    (41, '8615046', 'EPSON INK 003 - Magenta', 3, '2025-07-04', '2025-07-027', 20, 395, 7900, 0, 0, 0, 80, 395, 31600),
    -- EPSON INK 003 - Black (item_id=101) @ 395/bot
    (101, '8550374', 'EPSON INK 003 - Black', 0, '2025-08-22', 'IAR-2025-07-064', 50, 395, 19750, 0, 0, 0, 50, 395, 19750),
    (101, '8550374', 'EPSON INK 003 - Black', 1, '2025-07-04', '2025-07-027', 50, 395, 19750, 0, 0, 0, 100, 395, 39500),
    (101, '8550374', 'EPSON INK 003 - Black', 2, '2025-07-04', '2025-07-027', 50, 395, 19750, 0, 0, 0, 150, 395, 59250),
    (101, '8550374', 'EPSON INK 003 - Black', 3, '2025-07-04', '2025-07-027', 50, 395, 19750, 0, 0, 0, 200, 395, 79000);

-- ============================================================
-- 22. TRIP TICKETS (3 records from Excel)
-- ============================================================
INSERT INTO trip_tickets (id, trip_ticket_no, requesting_party, date_of_request, date_of_travel,
    return_date, contact_no, time_of_departure, purpose, destination, passengers,
    requested_by_employee, requested_by_designation,
    approved_by_employee, approved_by_designation, status) VALUES
    (1, 'T2026-01-002', 'FAD', '2026-01-06', '2026-01-06', '2026-01-06',
        '09504801548', '13:00:00', 'Serve RFQ for 2026 mandatories', 'Butuan City',
        '["MARK E. MARASIGAN"]'::jsonb,
        'MARK E. MARASIGAN', 'Admin Officer I',
        'REGIENALD S. ESPALDON', 'Chief Administrative Officer', 'Approved'),
    (2, 'T2026-01-001', 'FAD', '2026-01-05', '2026-01-05', '2026-01-05',
        '09504801548', '13:00:00', 'Serve RFQ for 2026 mandatories', 'Butuan City',
        '["MARK E. MARASIGAN"]'::jsonb,
        'MARK E. MARASIGAN', 'Admin Officer I',
        'REGIENALD S. ESPALDON', 'Chief Administrative Officer', 'Approved'),
    (3, 'T2026-01-003', 'FAD', '2026-01-07', '2026-01-07', '2026-01-07',
        '09504801548', '02:00:00', 'To submit form of salary loan batch 2, get flash drive and USB', 'Butuan City',
        '["CHARISH MAE G. DALIT"]'::jsonb,
        'CHARISH MAE G. DALIT', 'Admin Asst. II',
        'REGIENALD S. ESPALDON', 'Chief Administrative Officer', 'Approved')
ON CONFLICT (trip_ticket_no) DO NOTHING;

SELECT setval('trip_tickets_id_seq', 3);

-- ============================================================
-- 23. SETTINGS / GLOBAL COUNTERS (from Excel)
-- ============================================================
INSERT INTO settings (id, data) VALUES
    ('globalCounters', '{
        "generatedItemIdCounter": 3,
        "iarItemCounter": 0,
        "itemIdCounter": 0,
        "ppeCounter": 0,
        "inventoryCounter": 0,
        "icsCounters": {"2025": 2, "2026": 1},
        "parCounters": {"2025": 0},
        "inventoryCounters": {"2025-5020": 2, "2025-5070": 1},
        "ppeCounters": {"2025-05-02 00:00:00": 2, "2025-05-07 00:00:00": 1}
    }'::jsonb),
    ('risCounters', '{
        "2025": 0,
        "2026": 2
    }'::jsonb),
    ('tripTicketCounter', '{
        "2025-08": 115,
        "2026-01": 3
    }'::jsonb)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP;

-- ============================================================
-- 24. DIVISIONS (mirror of offices for inventory use)
-- ============================================================
INSERT INTO divisions (id, name) VALUES
    (1, 'FAD'),
    (2, 'MWPTD'),
    (3, 'MWPSD'),
    (4, 'WRSD'),
    (5, 'ORD')
ON CONFLICT DO NOTHING;

SELECT setval('divisions_id_seq', 5);

-- ============================================================
-- 25-31. PROCUREMENT TRANSACTION DATA (APP FY 2026)
-- ============================================================
-- Transaction data (PRs, RFQs, Abstracts, Post-Qualifications,
-- BAC Resolutions, NOAs, and Procurement Plans) is now loaded
-- from the standalone file: seed_app_2026.sql
--
-- Source: NGPA Indicative-Final-Updated APP FY 2026 (official)
-- Run separately:
--   psql -U postgres -d dmw_db -p 5433 -f seed_app_2026.sql
-- ============================================================

COMMIT;

-- ============================================================
-- END OF SEED DATA
-- ============================================================
