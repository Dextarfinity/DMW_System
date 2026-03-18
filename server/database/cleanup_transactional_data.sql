-- ============================================================
-- CLEANUP SCRIPT: Delete All Transactional Data
-- Version: 1.0
-- Date: March 2026
-- Description: Removes all data from Purchase Request through IAR tables
--              while preserving master data (PPMP, items, employees, etc)
--              WARNING: This is destructive and cannot be undone without backup
-- ============================================================

-- Before running: BACKUP YOUR DATABASE!
-- SELECT pg_dump(dbname) > backup_before_cleanup.sql

-- ==============================================================================
-- DELETE IN CORRECT ORDER (TO RESPECT FOREIGN KEY CONSTRAINTS)
-- ==============================================================================

-- 1. Delete IAR entries and related data
DELETE FROM iar_items WHERE iar_id IN (SELECT id FROM iars);
DELETE FROM iars;

-- 2. Delete PO entries and related data
DELETE FROM po_items WHERE po_id IN (SELECT id FROM purchaseorders);
DELETE FROM purchaseorders;

-- 3. Delete NOA entries and related data
DELETE FROM notices_of_award;

-- 4. Delete BAC Resolution entries (both procurement mode and winner determination)
DELETE FROM bac_resolution_items WHERE bac_res_id IN (SELECT id FROM bac_resolutions);
DELETE FROM bac_resolutions;

-- 5. Delete Post-Qualification/TWG entries
DELETE FROM post_qualification_items WHERE post_qual_id IN (SELECT id FROM post_qualifications);
DELETE FROM post_qualifications;

-- 6. Delete Abstract entries and related data
DELETE FROM abstract_items WHERE abstract_id IN (SELECT id FROM abstracts);
DELETE FROM abstract_quotations WHERE abstract_id IN (SELECT id FROM abstracts);
DELETE FROM abstract_quote_items WHERE quotation_id IN (SELECT id FROM abstract_quotations);
DELETE FROM abstracts;

-- 7. Delete RFQ entries and related data
DELETE FROM rfq_items WHERE rfq_id IN (SELECT id FROM rfqs);
DELETE FROM rfq_suppliers WHERE rfq_id IN (SELECT id FROM rfqs);
DELETE FROM rfqs;

-- 8. Delete Purchase Request entries and related data
DELETE FROM pr_items WHERE pr_id IN (SELECT id FROM purchaserequests);
DELETE FROM purchaserequests;

-- ==============================================================================
-- VERIFY DELETION
-- ==============================================================================
-- After deletion, check with:
-- SELECT COUNT(*) FROM purchaserequests;
-- SELECT COUNT(*) FROM rfqs;
-- SELECT COUNT(*) FROM abstracts;
-- SELECT COUNT(*) FROM post_qualifications;
-- SELECT COUNT(*) FROM bac_resolutions;
-- SELECT COUNT(*) FROM notices_of_award;
-- SELECT COUNT(*) FROM purchaseorders;
-- SELECT COUNT(*) FROM iars;
-- SELECT COUNT(*) FROM pr_items;
-- SELECT COUNT(*) FROM rfq_items;
-- SELECT COUNT(*) FROM abstract_items;
-- SELECT COUNT(*) FROM post_qualification_items;
-- SELECT COUNT(*) FROM bac_resolution_items;
-- SELECT COUNT(*) FROM iar_items;

-- ==============================================================================
-- RESET SEQUENCES (optional, to restart ID numbering from 1)
-- ==============================================================================
-- ALTER SEQUENCE purchaserequests_id_seq RESTART WITH 1;
-- ALTER SEQUENCE rfqs_id_seq RESTART WITH 1;
-- ALTER SEQUENCE abstracts_id_seq RESTART WITH 1;
-- ALTER SEQUENCE post_qualifications_id_seq RESTART WITH 1;
-- ALTER SEQUENCE bac_resolutions_id_seq RESTART WITH 1;
-- ALTER SEQUENCE notices_of_award_id_seq RESTART WITH 1;
-- ALTER SEQUENCE purchaseorders_id_seq RESTART WITH 1;
-- ALTER SEQUENCE iars_id_seq RESTART WITH 1;

-- Cleanup complete!
-- All transactional data has been deleted.
-- Master data (PPMP, items, employees, divisions, etc) remains intact.
