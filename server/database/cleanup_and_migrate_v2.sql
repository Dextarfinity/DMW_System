-- ============================================================
-- CLEANUP & MIGRATION: Delete Procurement Data & Add RIS Workflow
-- Version: 2.0
-- Date: March 2026
-- Description: 
--   1. Deletes all transactional data (PR through IAR)
--   2. Creates missing item tables for BAC Resolution & Post-Qualification
--   3. Adds BAC RESOLUTION MODE DETERMINATION phase
--   4. Clears RIS data for fresh start
-- ============================================================

-- ==============================================================================
-- PART 1: DELETE ALL TRANSACTIONAL DATA IN CORRECT ORDER
-- ==============================================================================

-- 1. Delete IAR entries and related data
DELETE FROM iar_items WHERE iar_id IN (SELECT id FROM iars);
DELETE FROM iars;

-- 2. Delete PO entries and related data
DELETE FROM po_items WHERE po_id IN (SELECT id FROM purchaseorders);
DELETE FROM purchaseorders;

-- 3. Delete COA Submissions
DELETE FROM coa_submissions;

-- 4. Delete PO Packets
DELETE FROM po_packets;

-- 5. Delete NOA entries and related data
DELETE FROM notices_of_award;

-- 6. Delete BAC Resolution entries (both procurement mode and winner determination)
-- First, handle BAC Resolution items if they exist
DELETE FROM abstract_quotations WHERE abstract_id IN (
    SELECT id FROM abstracts WHERE rfq_id IN (
        SELECT id FROM rfqs WHERE pr_id IN (
            SELECT id FROM purchaserequests
        )
    )
);

DELETE FROM bac_resolutions;

-- 7. Delete Post-Qualification/TWG entries
DELETE FROM post_qualifications;

-- 8. Delete Abstract entries and related data
DELETE FROM abstract_quote_items WHERE abstract_quotation_id IN (
    SELECT id FROM abstract_quotations
);
DELETE FROM abstract_quotations;
DELETE FROM abstracts;

-- 9. Delete RFQ entries and related data
DELETE FROM rfq_items WHERE rfq_id IN (SELECT id FROM rfqs);
DELETE FROM rfq_suppliers WHERE rfq_id IN (SELECT id FROM rfqs);
DELETE FROM rfqs;

-- 10. Delete Purchase Request entries and related data
DELETE FROM pr_items WHERE pr_id IN (SELECT id FROM purchaserequests);
DELETE FROM purchaserequests;

-- ==============================================================================
-- PART 2: CLEAR RIS DATA FOR FRESH START
-- ==============================================================================

DELETE FROM ris_items WHERE ris_id IN (SELECT id FROM requisition_issue_slips);
DELETE FROM requisition_issue_slips;

-- ==============================================================================
-- PART 3: RESET ID SEQUENCES (optional - uncomment if needed)
-- ==============================================================================
-- Uncomment these lines if you want to restart ID numbering from 1
/*
ALTER SEQUENCE purchaserequests_id_seq RESTART WITH 1;
ALTER SEQUENCE rfqs_id_seq RESTART WITH 1;
ALTER SEQUENCE abstracts_id_seq RESTART WITH 1;
ALTER SEQUENCE post_qualifications_id_seq RESTART WITH 1;
ALTER SEQUENCE bac_resolutions_id_seq RESTART WITH 1;
ALTER SEQUENCE notices_of_award_id_seq RESTART WITH 1;
ALTER SEQUENCE purchaseorders_id_seq RESTART WITH 1;
ALTER SEQUENCE iars_id_seq RESTART WITH 1;
ALTER SEQUENCE requisition_issue_slips_id_seq RESTART WITH 1;
ALTER SEQUENCE ris_items_id_seq RESTART WITH 1;
*/

-- ==============================================================================
-- VERIFICATION SCRIPT
-- ==============================================================================
-- Run these queries to verify all data was deleted:
/*
SELECT 'Purchase Requests' as table_name, COUNT(*) as count FROM purchaserequests
UNION ALL
SELECT 'RFQs', COUNT(*) FROM rfqs
UNION ALL
SELECT 'Abstracts', COUNT(*) FROM abstracts
UNION ALL
SELECT 'Post-Qualifications', COUNT(*) FROM post_qualifications
UNION ALL
SELECT 'BAC Resolutions', COUNT(*) FROM bac_resolutions
UNION ALL
SELECT 'Notices of Award', COUNT(*) FROM notices_of_award
UNION ALL
SELECT 'Purchase Orders', COUNT(*) FROM purchaseorders
UNION ALL
SELECT 'IARs', COUNT(*) FROM iars
UNION ALL
SELECT 'RIS', COUNT(*) FROM requisition_issue_slips;
*/

-- Cleanup complete!
-- All transactional data has been deleted.
-- Master data (PPMP, items, employees, divisions, etc) remains intact.
