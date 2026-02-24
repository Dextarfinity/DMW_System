-- ============================================================
-- EMPLOYEES SEED DATA (from List of Employees.xlsx)
-- 30 employees with full details: designation, division, phone, email
-- ============================================================

-- Add new designations not yet in the table
INSERT INTO designations (id, name) VALUES
    (16, 'Director IV'),
    (17, 'Admin Officer IV')
ON CONFLICT DO NOTHING;

SELECT setval('designations_id_seq', (SELECT MAX(id) FROM designations));

-- Clear existing employees (cascade will handle FK refs)
DELETE FROM employees;

-- Insert all 30 employees from Excel
-- Designation IDs reference:
--   1=OIC Regional Director, 2=Chief LEO, 3=SAO, 4=Admin Asst. II,
--   5=Chief Administrative Officer, 6=Admin Officer III, 7=Sup. LEO,
--   8=LEO III, 9=Sr. LEO, 10=Admin Officer V, 11=LEO I, 12=LEO II,
--   13=Accountant III, 14=Admin Asst. III, 15=Admin Officer I,
--   16=Director IV, 17=Admin Officer IV
-- Department IDs: 1=FAD, 2=MWPTD, 3=MWPSD, 4=WRSD, 5=ORD

INSERT INTO employees (id, employee_code, full_name, designation_id, dept_id, phone, email, status) VALUES
    -- Finance and Administrative Division (FAD) — 11 employees
    (1,  'DMW-FAD-001',  'LIGIE T. ANGELES',                8,  1, '09074022747', 'ligie.tadena@dmw.gov.ph',          'active'),
    (2,  'DMW-FAD-002',  'BEALAH JOY T. CAMARIN',           13, 1, '09462936657', 'camarinbjt@gmail.com',             'active'),
    (3,  'DMW-FAD-003',  'CHARISH MAE D. CAGADAS',          4,  1, '09658034780', 'charish.dalit@dmw.gov.ph',         'active'),
    (4,  'DMW-FAD-004',  'REGIENALD S. ESPALDON',           5,  1, '09173268611', 'regienald.espaldon@dmw.gov.ph',    'active'),
    (5,  'DMW-FAD-005',  'MARK E. MARASIGAN',               15, 1, '09504801548', 'markem03@gmail.com',               'active'),
    (6,  'DMW-FAD-006',  'JOHN LOUIE A. MEDILLO',           17, 1, '09318151927', 'john.medillo@dmw.gov.ph',          'active'),
    (7,  'DMW-FAD-007',  'GIOVANNI S. PAREDES',             3,  1, '09173029101', 'giovanni.paredes@dmw.gov.ph',      'active'),
    (8,  'DMW-FAD-008',  'GARY P. SALADORES',               10, 1, '09278197040', 'gary.saladores@dmw.gov.ph',        'active'),
    (9,  'DMW-FAD-009',  'SHELLA CLAIRE L. SOMBILON',       14, 1, '09308088206', 'shellylim22143@gmail.com',         'active'),
    (10, 'DMW-FAD-010',  'JOMAR LIAN U. TOLIAO',            6,  1, '09466640103', 'jomar.toliao@dmw.gov.ph',          'active'),

    -- Migrant Workers Protection and Trafficking Division (MWPTD) — 4 employees
    (11, 'DMW-MWPTD-001', 'CHRIS ANN M. CABODBOD',          12, 2, '09464398859', 'chrisann.cabodbod@dmw.gov.ph',     'active'),
    (12, 'DMW-MWPTD-002', 'CHERRYL C. OCULAM',              9,  2, '09465046701', 'cheryl.oculam@dmw.gov.ph',         'active'),
    (13, 'DMW-MWPTD-003', 'AL S. POLINAR',                  12, 2, '09482711134', 'al.polinar@dmw.gov.ph',            'active'),
    (14, 'DMW-MWPTD-004', 'RAY ANGELO A. SAJOR',            11, 2, '09507646979', 'rayangelosajor@gmail.com',         'active'),

    -- Migrant Workers Processing and Service Division (MWPSD) — 7 employees
    (15, 'DMW-MWPSD-001', 'JUNE NEIL P. ENSOMO',            11, 3, '09765594779', 'ejuneneil@gmail.com',              'active'),
    (16, 'DMW-MWPSD-002', 'MARISSA A. GARAY',               7,  3, '09663246232', 'magaray826@gmail.com',             'active'),
    (17, 'DMW-MWPSD-003', 'IAN JOSHUA E. PAQUEO',           8,  3, '09639138417', 'ian.paqueo@dmw.gov.ph',            'active'),
    (18, 'DMW-MWPSD-004', 'EDDIE PARAGUYA',                 9,  3, '09369810716', 'eddie.paraguya@dmw.gov.ph',        'active'),
    (19, 'DMW-MWPSD-005', 'APPLE MAE C. TANDOY',            8,  3, '09932815510', 'applemaetandoy96@gmail.com',       'active'),
    (20, 'DMW-MWPSD-006', 'AURORA JEAN A. TORRALBA',        11, 3, '09298100672', 'ajeanabad@gmail.com',              'active'),
    (21, 'DMW-MWPSD-007', 'JOANINE BLYTH ROSS C. VILLARINO',8, 3, '09954134982', 'joanine.villarino@dmw.gov.ph',     'active'),

    -- Welfare and Reintegration Services Division (WRSD) — 6 employees
    (22, 'DMW-WRSD-001', 'REYNON E. ARLAN',                 7,  4, '09911772281', 'reynonarlan.labor@gmail.com',       'active'),
    (23, 'DMW-WRSD-002', 'RITCHEL T. BEBERA',               11, 4, '09493117938', 'ritchelbebera@gmail.com',          'active'),
    (24, 'DMW-WRSD-003', 'GERALD F. DELOS REYES',           12, 4, '09276708609', 'gerald.delosreyes@dmw.gov.ph',     'active'),
    (25, 'DMW-WRSD-004', 'ANNE JANE M. HALLASGO',           9,  4, '09761677933', 'anne.hallasgo@dmw.gov.ph',         'active'),
    (26, 'DMW-WRSD-005', 'REGIE B. LAGRAMADA',              11, 4, '09858048272', 'regslags@gmail.com',               'active'),
    (27, 'DMW-WRSD-006', 'EVAL B. MAKINANO',                2,  4, '09544782267', 'makinanoeval.mcdrm9@gmail.com',    'active'),
    (28, 'DMW-WRSD-007', 'BERLY S. POLINAR',                8,  4, '09382312119', 'berly.sain@dmw.gov.ph',           'active'),

    -- Office of the Regional Director (ORD) — 2 employees
    (29, 'DMW-ORD-001',  'RITCHEL M. BUTAO',                16, 5, '09853263078', 'ritchel.butao@dmw.gov.ph',         'active'),
    (30, 'DMW-ORD-002',  'KRISTY A. SUAN',                  12, 5, '09458306191', 'alvarezkristy94@gmail.com',        'active');

-- Reset sequence
SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees));

-- Verify
SELECT e.id, e.employee_code, e.full_name, d2.name AS designation, d.name AS division, e.phone, e.email
FROM employees e
LEFT JOIN designations d2 ON e.designation_id = d2.id
LEFT JOIN departments d ON e.dept_id = d.id
ORDER BY e.dept_id, e.full_name;
