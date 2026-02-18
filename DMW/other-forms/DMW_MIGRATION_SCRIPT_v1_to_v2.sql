-- =====================================================
-- MIGRATION SCRIPT: v1.1 → v2.0
-- DMW CARAGA System Integration
-- Run this AFTER creating the new v2.0 database
-- =====================================================

-- This script helps migrate data from old procurement system
-- to the new integrated system

-- =====================================================
-- STEP 1: PREPARATION
-- =====================================================

-- Create temporary tables to hold mappings
CREATE TEMP TABLE old_item_mapping (
    old_id INT,
    old_code VARCHAR(50),
    new_id INT,
    new_code VARCHAR(50)
);

CREATE TEMP TABLE old_supplier_mapping (
    old_id INT,
    old_name VARCHAR(200),
    new_id INT,
    new_name VARCHAR(200)
);

CREATE TEMP TABLE old_user_mapping (
    old_id INT,
    old_username VARCHAR(50),
    new_id INT,
    new_username VARCHAR(50)
);

-- =====================================================
-- STEP 2: MAP OLD IDs TO NEW IDs
-- =====================================================

-- Map items (assumes items with same code are same item)
INSERT INTO old_item_mapping (old_id, old_code, new_id, new_code)
SELECT 
    old_items.id AS old_id,
    old_items.code AS old_code,
    new_items.id AS new_id,
    new_items.code AS new_code
FROM 
    old_dmw_procurement.items AS old_items
    JOIN dmw_caraga_system.items AS new_items 
    ON old_items.code = new_items.code;

-- Map suppliers (by name)
INSERT INTO old_supplier_mapping (old_id, old_name, new_id, new_name)
SELECT 
    old_sup.id AS old_id,
    old_sup.name AS old_name,
    new_sup.id AS new_id,
    new_sup.name AS new_name
FROM 
    old_dmw_procurement.suppliers AS old_sup
    JOIN dmw_caraga_system.suppliers AS new_sup 
    ON LOWER(TRIM(old_sup.name)) = LOWER(TRIM(new_sup.name));

-- Map users (by username)
INSERT INTO old_user_mapping (old_id, old_username, new_id, new_username)
SELECT 
    old_usr.id AS old_id,
    old_usr.username AS old_username,
    new_usr.id AS new_id,
    new_usr.username AS new_username
FROM 
    old_dmw_procurement.users AS old_usr
    JOIN dmw_caraga_system.users AS new_usr 
    ON old_usr.username = new_usr.username;

-- =====================================================
-- STEP 3: MIGRATE PURCHASE REQUESTS
-- =====================================================

-- Migrate PR headers
INSERT INTO dmw_caraga_system.purchaserequests (
    pr_number,
    dept_id,
    purpose,
    total_amount,
    status,
    requested_by,
    approved_by,
    created_at,
    updated_at,
    approved_at
)
SELECT 
    old_pr.pr_number,
    old_pr.dept_id,
    old_pr.purpose,
    old_pr.total_amount,
    old_pr.status,
    COALESCE(um1.new_id, old_pr.requested_by),
    COALESCE(um2.new_id, old_pr.approved_by),
    old_pr.created_at,
    old_pr.updated_at,
    old_pr.approved_at
FROM old_dmw_procurement.purchaserequests old_pr
LEFT JOIN old_user_mapping um1 ON old_pr.requested_by = um1.old_id
LEFT JOIN old_user_mapping um2 ON old_pr.approved_by = um2.old_id
WHERE old_pr.pr_number NOT IN (SELECT pr_number FROM dmw_caraga_system.purchaserequests);

-- Migrate PR items (with item_id mapping)
INSERT INTO dmw_caraga_system.pr_items (
    pr_id,
    item_code,
    item_name,
    item_description,
    unit,
    category,
    quantity,
    unit_price,
    remarks,
    created_at
)
SELECT 
    new_pr.id AS pr_id,
    old_pri.item_code,
    old_pri.item_name,
    old_pri.item_description,
    old_pri.unit,
    old_pri.category,
    old_pri.quantity,
    old_pri.unit_price,
    old_pri.remarks,
    old_pri.created_at
FROM old_dmw_procurement.pr_items old_pri
JOIN old_dmw_procurement.purchaserequests old_pr ON old_pri.pr_id = old_pr.id
JOIN dmw_caraga_system.purchaserequests new_pr ON old_pr.pr_number = new_pr.pr_number;

-- =====================================================
-- STEP 4: MIGRATE PURCHASE ORDERS
-- =====================================================

-- Migrate PO headers
INSERT INTO dmw_caraga_system.purchaseorders (
    po_number,
    pr_id,
    supplier_id,
    total_amount,
    status,
    workflow_status,
    expected_delivery_date,
    delivery_date,
    delivery_address,
    payment_terms,
    payment_status,
    payment_date,
    ada_reference_no,
    created_by,
    approved_by,
    created_at,
    updated_at,
    approved_at
)
SELECT 
    old_po.po_number,
    new_pr.id AS pr_id,
    COALESCE(sm.new_id, old_po.supplier_id) AS supplier_id,
    old_po.total_amount,
    old_po.status,
    old_po.workflow_status,
    old_po.expected_delivery_date,
    old_po.delivery_date,
    old_po.delivery_address,
    old_po.payment_terms,
    old_po.payment_status,
    old_po.payment_date,
    old_po.ada_reference_no,
    COALESCE(um1.new_id, old_po.created_by),
    COALESCE(um2.new_id, old_po.approved_by),
    old_po.created_at,
    old_po.updated_at,
    old_po.approved_at
FROM old_dmw_procurement.purchaseorders old_po
LEFT JOIN old_dmw_procurement.purchaserequests old_pr ON old_po.pr_id = old_pr.id
LEFT JOIN dmw_caraga_system.purchaserequests new_pr ON old_pr.pr_number = new_pr.pr_number
LEFT JOIN old_supplier_mapping sm ON old_po.supplier_id = sm.old_id
LEFT JOIN old_user_mapping um1 ON old_po.created_by = um1.old_id
LEFT JOIN old_user_mapping um2 ON old_po.approved_by = um2.old_id
WHERE old_po.po_number NOT IN (SELECT po_number FROM dmw_caraga_system.purchaseorders);

-- Migrate PO items (with item_id FK)
INSERT INTO dmw_caraga_system.po_items (
    po_id,
    item_id,
    item_code,
    item_name,
    item_description,
    unit,
    category,
    quantity,
    unit_price,
    remarks,
    created_at
)
SELECT 
    new_po.id AS po_id,
    im.new_id AS item_id,  -- Important: FK to items table
    old_poi.item_code,
    old_poi.item_name,
    old_poi.item_description,
    old_poi.unit,
    old_poi.category,
    old_poi.quantity,
    old_poi.unit_price,
    old_poi.remarks,
    old_poi.created_at
FROM old_dmw_procurement.po_items old_poi
JOIN old_dmw_procurement.purchaseorders old_po ON old_poi.po_id = old_po.id
JOIN dmw_caraga_system.purchaseorders new_po ON old_po.po_number = new_po.po_number
LEFT JOIN old_item_mapping im ON old_poi.item_code = im.old_code;

-- =====================================================
-- STEP 5: MIGRATE IARs
-- =====================================================

-- Migrate IAR headers
INSERT INTO dmw_caraga_system.iars (
    iar_number,
    po_id,
    inspection_date,
    delivery_date,
    invoice_number,
    delivery_receipt_number,
    inspection_result,
    findings,
    inspected_by,
    date_inspected,
    received_by,
    date_received,
    status,
    created_by,
    created_at,
    updated_at
)
SELECT 
    old_iar.iar_number,
    new_po.id AS po_id,
    old_iar.inspection_date,
    old_iar.delivery_date,
    old_iar.invoice_number,
    old_iar.delivery_receipt_number,
    old_iar.inspection_result,
    old_iar.findings,
    COALESCE(um1.new_id, old_iar.inspected_by),
    old_iar.date_inspected,
    COALESCE(um2.new_id, old_iar.received_by),
    old_iar.date_received,
    old_iar.status,
    COALESCE(um3.new_id, old_iar.created_by),
    old_iar.created_at,
    old_iar.updated_at
FROM old_dmw_procurement.iars old_iar
JOIN old_dmw_procurement.purchaseorders old_po ON old_iar.po_id = old_po.id
JOIN dmw_caraga_system.purchaseorders new_po ON old_po.po_number = new_po.po_number
LEFT JOIN old_user_mapping um1 ON old_iar.inspected_by = um1.old_id
LEFT JOIN old_user_mapping um2 ON old_iar.received_by = um2.old_id
LEFT JOIN old_user_mapping um3 ON old_iar.created_by = um3.old_id
WHERE old_iar.iar_number NOT IN (SELECT iar_number FROM dmw_caraga_system.iars);

-- NOTE: Do NOT migrate old IAR items yet - they need special handling
-- because the new system has item_id FK and will trigger inventory updates

-- =====================================================
-- STEP 6: INITIALIZE INVENTORY FOR MIGRATED ITEMS
-- =====================================================

-- For items that came from old system, set initial inventory
-- This should be done carefully based on physical count

UPDATE dmw_caraga_system.items
SET 
    quantity = 0,  -- Set based on actual physical count
    reorder_point = CASE 
        WHEN category = 'EXPENDABLE' THEN 20
        ELSE 0
    END,
    is_active = TRUE
WHERE quantity IS NULL;

-- =====================================================
-- STEP 7: VERIFICATION
-- =====================================================

-- Check migration results
SELECT 'Purchase Requests' AS table_name, COUNT(*) AS migrated_count
FROM dmw_caraga_system.purchaserequests
UNION ALL
SELECT 'PR Items', COUNT(*) FROM dmw_caraga_system.pr_items
UNION ALL
SELECT 'Purchase Orders', COUNT(*) FROM dmw_caraga_system.purchaseorders
UNION ALL
SELECT 'PO Items', COUNT(*) FROM dmw_caraga_system.po_items
UNION ALL
SELECT 'IARs', COUNT(*) FROM dmw_caraga_system.iars
UNION ALL
SELECT 'Items', COUNT(*) FROM dmw_caraga_system.items
UNION ALL
SELECT 'Suppliers', COUNT(*) FROM dmw_caraga_system.suppliers
UNION ALL
SELECT 'Users', COUNT(*) FROM dmw_caraga_system.users;

-- Check for unmapped items
SELECT 'Unmapped Items' AS issue, COUNT(*) AS count
FROM old_dmw_procurement.items old_i
WHERE old_i.code NOT IN (
    SELECT code FROM dmw_caraga_system.items
);

-- Check for unmapped suppliers
SELECT 'Unmapped Suppliers' AS issue, COUNT(*) AS count
FROM old_dmw_procurement.suppliers old_s
WHERE LOWER(TRIM(old_s.name)) NOT IN (
    SELECT LOWER(TRIM(name)) FROM dmw_caraga_system.suppliers
);

-- =====================================================
-- STEP 8: POST-MIGRATION TASKS
-- =====================================================

-- Update sequences to avoid conflicts
SELECT setval('dmw_caraga_system.purchaserequests_id_seq', 
    (SELECT MAX(id) FROM dmw_caraga_system.purchaserequests) + 1);

SELECT setval('dmw_caraga_system.purchaseorders_id_seq', 
    (SELECT MAX(id) FROM dmw_caraga_system.purchaseorders) + 1);

SELECT setval('dmw_caraga_system.iars_id_seq', 
    (SELECT MAX(id) FROM dmw_caraga_system.iars) + 1);

-- Refresh materialized views if any
-- REFRESH MATERIALIZED VIEW IF EXISTS your_view_name;

-- Vacuum and analyze
VACUUM ANALYZE dmw_caraga_system.items;
VACUUM ANALYZE dmw_caraga_system.purchaseorders;
VACUUM ANALYZE dmw_caraga_system.iars;

-- =====================================================
-- IMPORTANT NOTES
-- =====================================================

-- 1. This script assumes old database is named 'old_dmw_procurement'
--    and new database is 'dmw_caraga_system'
-- 2. Adjust database names as needed
-- 3. Some mappings may fail if data doesn't exist in new system
-- 4. IAR items migration is commented out to avoid accidental inventory updates
-- 5. After migration, manually verify critical data
-- 6. Update inventory quantities based on physical count
-- 7. Create property cards for existing equipment
-- 8. Generate ICS for current property custody

-- =====================================================
-- MANUAL STEPS AFTER MIGRATION
-- =====================================================

-- 1. Conduct physical inventory count
-- 2. Update items.quantity with actual counts
-- 3. Create property cards for existing semi-expendable items
-- 4. Issue ICS for current property holders
-- 5. Verify all procurement data migrated correctly
-- 6. Update user passwords
-- 7. Test workflows end-to-end
-- 8. Train users on new system

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================
