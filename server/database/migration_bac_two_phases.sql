-- ============================================================
-- MIGRATION: Support Two-Phase BAC Resolutions
-- Version: 1.0
-- Date: March 2026
-- Description: 
--   Adds bac_resolution_type column to distinguish between:
--   1. MODE DETERMINATION (sets procurement mode after RFQ)
--   2. WINNER DETERMINATION (sets winning bidder after TWG)
-- ============================================================

-- Add resolution type column
ALTER TABLE bac_resolutions
ADD COLUMN IF NOT EXISTS bac_resolution_type VARCHAR(50) DEFAULT 'WINNER_DETERMINATION' 
    CHECK (bac_resolution_type IN ('MODE_DETERMINATION', 'WINNER_DETERMINATION'));

-- Create index for filtering by type
CREATE INDEX IF NOT EXISTS idx_bacres_type ON bac_resolutions(bac_resolution_type);

-- Document the workflow:
-- 1. PR is APPROVED
-- 2. BAC RESOLUTION (MODE DETERMINATION) - determines procurement mode, creates  RFQ
-- 3. RFQ process (supplier invitations, responses)
-- 4. ABSTRACT OF QUOTATION - evaluates bids
-- 5. POST-QUALIFICATION / TWG - technical and financial analysis
-- 6. BAC RESOLUTION (WINNER DETERMINATION) - announces the winner
-- 7. NOTICE OF AWARD - formal notification to winning supplier
-- 8. PURCHASE ORDERS - create PO for each winning bid
-- 9. INSPECTION & ACCEPTANCE REPORT (IAR) - receive and inspect goods

-- View to show both phase  of BAC resolutions
CREATE OR REPLACE VIEW vw_bac_resolutions_by_phase AS
SELECT 
    br.id,
    br.resolution_number,
    br.bac_resolution_type as phase,
    CASE 
        WHEN br.bac_resolution_type = 'MODE_DETERMINATION' THEN 'Determines Procurement Mode'
        WHEN br.bac_resolution_type = 'WINNER_DETERMINATION' THEN 'Determines Winning Bidder'
        ELSE 'Unknown'
    END as phase_description,
    br.abstract_id,
    ab.abstract_number,
    br.procurement_mode,
    br.recommended_supplier_id,
    br.recommended_awardee_name,
    br.bid_amount,
    br.abc_amount,
    br.status,
    br.resolution_date,
    br.created_by,
    br.created_at,
    br.updated_at
FROM bac_resolutions br
LEFT JOIN abstracts ab ON br.abstract_id = ab.id
ORDER BY br.abstract_id, 
         CASE WHEN br.bac_resolution_type = 'MODE_DETERMINATION' THEN 1 ELSE 2 END,
         br.created_at;

-- Extended view with supplier details
CREATE OR REPLACE VIEW vw_bac_resolutions_detailed AS
SELECT 
    br.id,
    br.resolution_number,
    br.bac_resolution_type,
    br.abstract_id,
    ab.abstract_number,
    rf.pr_id,
    pr.pr_number,
    br.procurement_mode,
    s.name as supplier_name,
    s.tin as supplier_tin,
    s.address as supplier_address,
    br.recommended_awardee_name,
    br.bid_amount,
    br.abc_amount,
    br.philgeps_required,
    br.status,
    br.resolution_date,
    u.full_name as created_by_name,
    br.created_at,
    br.updated_at,
    br.approved_at
FROM bac_resolutions br
LEFT JOIN abstracts ab ON br.abstract_id = ab.id
LEFT JOIN rfqs rf ON ab.rfq_id = rf.id
LEFT JOIN purchaserequests pr ON rf.pr_id = pr.id
LEFT JOIN suppliers s ON br.recommended_supplier_id = s.id
LEFT JOIN users u ON br.created_by = u.id;

-- ============================================================
-- WORKFLOW DESCRIPTION
-- ============================================================
-- NEW PROCUREMENT PROCESS FLOW:
--
-- 1. PURCHASE REQUEST (PR)
--    ├─ Status: pending_approval → approved → rejected/cancelled
--    └─ User: Encoder proposes
--
-- 2. BAC RESOLUTION (PHASE 1: MODE DETERMINATION)
--    ├─ Type: MODE_DETERMINATION
--    ├─ Purpose: Determine the final mode of procurement
--    ├─ Created: After PR approval, before RFQ
--    ├─ Procurement Mode: SVP, SVPDC, DC, Competitive Bidding, etc.
--    └─ Output: Procurement mode decision
--
-- 3. RFQ (REQUEST FOR QUOTATION)
--    ├─ Created: After MODE DETERMINATION
--    ├─ Activities: Invite suppliers, receive quotations
--    └─ Status: on_going → completed/cancelled
--
-- 4. ABSTRACT OF QUOTATION (AOQ)
--    ├─ Purpose: Evaluate and abstract supplier bids
--    ├─ Created: After RFQ completion
--    └─ Activities: Rank suppliers, identify top 3, recommend 1-3
--
-- 5. POST-QUALIFICATION / TWG (TECHNICAL WORKING GROUP)
--    ├─ Purpose: Verify winning bidder's technical & financial capacity
--    ├─ Document verification: Licenses, insurance, company registry
--    └─ Status: on_going → completed/cancelled
--
-- 6. BAC RESOLUTION (PHASE 2: WINNER DETERMINATION)
--    ├─ Type: WINNER_DETERMINATION
--    ├─ Purpose: Formally declare the winning bidder/supplier
--    ├─ Created: After POST-QUALIFICATION completion
--    ├─ Recommended Supplier: The chosen supplier
--    └─ Output: Official declaration of winner
--
-- 7. NOTICE OF AWARD (NOA)
--    ├─ Created: After WINNER DETERMINATION
--    ├─ Recipient: Winning supplier
--    └─ Activities: Issue formal award letter
--
-- 8. PURCHASE ORDERS (PO)
--    ├─ Created: After NOA issued
--    ├─ One PO per PR item or per supplier
--    └─ Status: for_signing → signed
--
-- 9. INSPECTION & ACCEPTANCE REPORT (IAR)
--    ├─ Created: After goods received
--    ├─ Activities: Inspect goods, verify quantity & quality
--    └─ Status: to_be_checked → on_going → verified
--
-- OPTIONAL: 10. REQUISITION & ISSUE SLIP (RIS)
--     └─ Use for moving goods between divisions/offices
