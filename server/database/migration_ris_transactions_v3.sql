-- ============================================================
-- RIS (REQUISITION AND ISSUE SLIP) TRANSACTIONS SECTION
-- Version: 3.0
-- Date: March 17, 2026
-- Description: Complete RIS workflow for transactions
--              - Support manual item entry (auto-add to catalog)
--              - Track which roles can view each RIS
--              - Status workflow: PENDING → APPROVED
--              - Supply Officer notification and approval
-- ============================================================

-- 1. Add columns to track manually added items
ALTER TABLE items
ADD COLUMN IF NOT EXISTS is_manually_added BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_by_ris_id INT REFERENCES requisition_issue_slips(id) ON DELETE SET NULL;

COMMENT ON COLUMN items.is_manually_added IS 'Whether this item was manually added from RIS form';
COMMENT ON COLUMN items.created_by_ris_id IS 'The RIS ID that created this item if manually added';

-- 2. Add columns for better RIS tracking and workflow
ALTER TABLE requisition_issue_slips
ADD COLUMN IF NOT EXISTS office VARCHAR(100),
ADD COLUMN IF NOT EXISTS responsibility_center_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS created_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS notified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS notified_to_supply_officer BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN requisition_issue_slips.office IS 'Office/Department name';
COMMENT ON COLUMN requisition_issue_slips.responsibility_center_code IS 'RIS number or responsibility center code';
COMMENT ON COLUMN requisition_issue_slips.created_by_user_id IS 'User who created this RIS';
COMMENT ON COLUMN requisition_issue_slips.notified_at IS 'When supply officer was notified';
COMMENT ON COLUMN requisition_issue_slips.notified_to_supply_officer IS 'Whether supply officer has been notified';

-- 3. Create RIS Notifications table to track visibility
CREATE TABLE IF NOT EXISTS ris_notifications (
    id SERIAL PRIMARY KEY,
    ris_id INT NOT NULL REFERENCES requisition_issue_slips(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL, -- 'HOPE', 'BAC_SEC', 'BUDGET', 'CHIEF_FAD', 'ADMIN', 'SUPPLY_OFFICER'
    is_viewed BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ris_notifications_ris ON ris_notifications(ris_id);
CREATE INDEX idx_ris_notifications_role ON ris_notifications(role);

-- 4. Create RIS Approval Tracking table
CREATE TABLE IF NOT EXISTS ris_approvals (
    id SERIAL PRIMARY KEY,
    ris_id INT NOT NULL REFERENCES requisition_issue_slips(id) ON DELETE CASCADE,
    approved_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    approved_by_name VARCHAR(100),
    approved_by_designation VARCHAR(100),
    approval_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_type VARCHAR(50) NOT NULL, -- 'SUPPLY_OFFICER_APPROVAL', 'GENERAL_APPROVAL'
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ris_approvals_ris ON ris_approvals(ris_id);
CREATE INDEX idx_ris_approvals_approval_type ON ris_approvals(approval_type);

-- 5. Enhanced ris_items table with better tracking
ALTER TABLE ris_items
ADD COLUMN IF NOT EXISTS is_from_catalog BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS manual_entry_notes TEXT;

COMMENT ON COLUMN ris_items.is_from_catalog IS 'Whether item was selected from catalog (TRUE) or manually entered (FALSE)';
COMMENT ON COLUMN ris_items.manual_entry_notes IS 'Additional notes for manually entered items';

-- 6. Create view: RIS with all related data
CREATE OR REPLACE VIEW vw_ris_complete AS
SELECT 
    r.id,
    r.ris_no,
    r.division,
    r.office,
    r.ris_date,
    r.purpose,
    r.status,
    r.category,
    r.ris_type,
    r.is_priority,
    r.remarks,
    r.created_by_user_id,
    u1.full_name as created_by_name,
    u1.designation as created_by_designation,
    r.requested_by_id,
    e1.full_name as requested_by_name,
    e1.designation as requested_by_designation,
    r.approved_by_id,
    e2.full_name as approved_by_name,
    e2.designation as approved_by_designation,
    r.approved_by_supply_id,
    e3.full_name as supply_officer_name,
    e3.designation as supply_officer_designation,
    r.issued_by_id,
    e4.full_name as issued_by_name,
    e4.designation as issued_by_designation,
    r.received_by_id,
    e5.full_name as received_by_name,
    e5.designation as received_by_designation,
    r.responsibility_center_code,
    r.notified_to_supply_officer,
    r.notified_at,
    r.created_at,
    r.updated_at
FROM requisition_issue_slips r
LEFT JOIN users u1 ON r.created_by_user_id = u1.id
LEFT JOIN employees e1 ON r.requested_by_id = e1.id
LEFT JOIN employees e2 ON r.approved_by_id = e2.id
LEFT JOIN employees e3 ON r.approved_by_supply_id = e3.id
LEFT JOIN employees e4 ON r.issued_by_id = e4.id
LEFT JOIN employees e5 ON r.received_by_id = e5.id
ORDER BY r.ris_date DESC;

-- 7. Create view: RIS Items with stock info
CREATE OR REPLACE VIEW vw_ris_items_with_stock AS
SELECT 
    ri.id as ris_item_id,
    ri.ris_id,
    ri.item_id,
    ri.description,
    ri.specification,
    ri.uom,
    ri.quantity,
    ri.unit_cost,
    ri.is_from_catalog,
    ri.manual_entry_notes,
    COALESCE(i.name, ri.description) as item_name,
    COALESCE(i.stock_no, 'N/A') as stock_no,
    COALESCE(i.quantity, 0) as available_stock,
    i.category as item_category,
    i.reorder_point,
    CASE 
        WHEN i.quantity IS NULL THEN 0
        WHEN i.quantity >= ri.quantity THEN 1  -- Sufficient stock
        ELSE 0
    END as has_sufficient_stock,
    ri.created_at
FROM ris_items ri
LEFT JOIN items i ON ri.item_id = i.id
ORDER BY ri.ris_id, ri.created_at;

-- 8. Create audit table for RIS status changes
CREATE TABLE IF NOT EXISTS ris_status_history (
    id SERIAL PRIMARY KEY,
    ris_id INT NOT NULL REFERENCES requisition_issue_slips(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    changed_by_name VARCHAR(100),
    change_reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ris_status_history_ris ON ris_status_history(ris_id);
CREATE INDEX idx_ris_status_history_status ON ris_status_history(new_status);

-- 9. Stored Procedure: Add manual item to items catalog
CREATE OR REPLACE FUNCTION add_manual_item_to_catalog(
    p_description VARCHAR,
    p_uom VARCHAR,
    p_unit_price DECIMAL DEFAULT 0,
    p_category VARCHAR DEFAULT 'MANUAL ITEMS',
    p_ris_id INT DEFAULT NULL
) RETURNS TABLE(id INT, code VARCHAR, name VARCHAR) AS $$
DECLARE
    v_new_item_id INT;
    v_item_code VARCHAR;
BEGIN
    -- Generate unique code for manual item
    v_item_code := 'MAN-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || '-' || LPAD((RANDOM() * 999)::INT, 3, '0');
    
    -- Insert into items table
    INSERT INTO items (code, name, description, unit, unit_price, category, procurement_source, is_manually_added, created_by_ris_id, created_at, updated_at)
    VALUES (v_item_code, p_description, p_description, p_uom, p_unit_price, p_category, 'MANUAL_ENTRY', TRUE, p_ris_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING items.id INTO v_new_item_id;
    
    RETURN QUERY SELECT items.id, items.code, items.name FROM items WHERE items.id = v_new_item_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Stored Procedure: Create RIS with notifications
CREATE OR REPLACE FUNCTION create_ris_with_notifications(
    p_ris_data JSONB,
    p_items_data JSONB
) RETURNS TABLE(ris_id INT, ris_no VARCHAR, message VARCHAR) AS $$
DECLARE
    v_ris_id INT;
    v_ris_no VARCHAR;
    v_item JSONB;
    v_item_id INT;
    v_notification_roles VARCHAR[] := ARRAY['HOPE', 'BAC_SEC', 'BUDGET', 'CHIEF_FAD', 'ADMIN'];
    v_role VARCHAR;
BEGIN
    -- Insert RIS record
    INSERT INTO requisition_issue_slips (
        division, office, ris_date, purpose, category, ris_type, is_priority, remarks,
        requested_by_id, requested_by_name, requested_by_designation,
        approved_by_id, approved_by_name, approved_by_designation,
        approved_by_supply_id,
        created_by_user_id,
        status
    ) VALUES (
        p_ris_data->>'division',
        p_ris_data->>'office',
        (p_ris_data->>'ris_date')::DATE,
        p_ris_data->>'purpose',
        p_ris_data->>'category',
        COALESCE(p_ris_data->>'ris_type', 'NORMAL'),
        COALESCE((p_ris_data->>'is_priority')::BOOLEAN, FALSE),
        p_ris_data->>'remarks',
        (p_ris_data->>'requested_by_id')::INT,
        p_ris_data->>'requested_by_name',
        p_ris_data->>'requested_by_designation',
        (p_ris_data->>'approved_by_id')::INT,
        p_ris_data->>'approved_by_name',
        p_ris_data->>'approved_by_designation',
        (p_ris_data->>'approved_by_supply_id')::INT,
        (p_ris_data->>'created_by_user_id')::INT,
        'PENDING'
    ) RETURNING requisition_issue_slips.id, requisition_issue_slips.ris_no INTO v_ris_id, v_ris_no;

    -- Insert items
    IF p_items_data IS NOT NULL THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_items_data)
        LOOP
            v_item_id := COALESCE((v_item->>'item_id')::INT, NULL);
            
            INSERT INTO ris_items (ris_id, item_id, description, uom, quantity, unit_cost, is_from_catalog, manual_entry_notes)
            VALUES (v_ris_id, v_item_id, v_item->>'description', v_item->>'uom', (v_item->>'quantity')::INT, 
                    COALESCE((v_item->>'unit_cost')::DECIMAL, 0), COALESCE((v_item->>'is_from_catalog')::BOOLEAN, TRUE),
                    v_item->>'manual_entry_notes');
        END LOOP;
    END IF;

    -- Create notifications for all relevant roles
    FOREACH v_role IN ARRAY v_notification_roles
    LOOP
        INSERT INTO ris_notifications (ris_id, role, is_viewed, created_at)
        VALUES (v_ris_id, v_role, FALSE, CURRENT_TIMESTAMP);
    END LOOP;

    -- Mark supply officer as notified
    UPDATE requisition_issue_slips SET notified_to_supply_officer = TRUE, notified_at = CURRENT_TIMESTAMP WHERE id = v_ris_id;

    RETURN QUERY SELECT v_ris_id, v_ris_no, 'RIS created successfully with notifications'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- 11. Stored Procedure: Update RIS status to APPROVED
CREATE OR REPLACE FUNCTION approve_ris(
    p_ris_id INT,
    p_approved_by_user_id INT,
    p_approved_by_name VARCHAR,
    p_approved_by_designation VARCHAR,
    p_remarks TEXT DEFAULT NULL
) RETURNS TABLE(ris_id INT, new_status VARCHAR, message VARCHAR) AS $$
DECLARE
    v_old_status VARCHAR;
BEGIN
    -- Get current status
    SELECT status INTO v_old_status FROM requisition_issue_slips WHERE id = p_ris_id;
    
    -- Update RIS status to APPROVED
    UPDATE requisition_issue_slips SET status = 'APPROVED', updated_at = CURRENT_TIMESTAMP WHERE id = p_ris_id;
    
    -- Record approval
    INSERT INTO ris_approvals (ris_id, approved_by_user_id, approved_by_name, approved_by_designation, approval_type, remarks)
    VALUES (p_ris_id, p_approved_by_user_id, p_approved_by_name, p_approved_by_designation, 'SUPPLY_OFFICER_APPROVAL', p_remarks);
    
    -- Record status change in history
    INSERT INTO ris_status_history (ris_id, old_status, new_status, changed_by_user_id, changed_by_name, change_reason)
    VALUES (p_ris_id, v_old_status, 'APPROVED', p_approved_by_user_id, p_approved_by_name, p_remarks);
    
    RETURN QUERY SELECT p_ris_id, 'APPROVED'::VARCHAR, 'RIS approved successfully. Items are in stock and ready for issue.'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- WORKFLOW SUMMARY
-- ============================================================
-- 
-- USER FLOW:
-- 1. End User creates new RIS
--    - Selects items from ITEMS CATALOG
--    - OR manually adds items (auto-added to catalog for future use)
-- 2. System creates RIS with PENDING status
--    - Notifications sent to: HOPE, BAC_SEC, BUDGET, CHIEF_FAD, ADMIN
--    - Supply Officer (Mark E. Marasigan) automatically notified
-- 3. Supply Officer reviews:
--    - Catalog items: Can see available stock
--    - Manual items: Automatically added to ITEMS CATALOG
-- 4. Supply Officer approves RIS:
--    - Once items are confirmed in stock
--    - Status changes to APPROVED
-- 5. End User prints RIS template:
--    - For signatories (Requested by, Approved by, Issued by, Received by)
--    - Template shows all items and quantities
--
-- STATUS WORKFLOW:
--   PENDING (Initial) → APPROVED (Once items confirmed in stock)
--   PENDING → CANCELLED (If rejected by supply officer)
--   APPROVED → POSTED (After final issuance)
--
-- VISIBILITY:
--   All stakeholders can view PENDING or APPROVED RIS:
--   - HOPE (Humanitarian Operations)
--   - BAC_SEC (Bids and Awards Committee Secretary)
--   - BUDGET (Budget Officer)
--   - CHIEF_FAD (Chief, Finance and Administrative Division)
--   - ADMIN (Administrator)
--   - SUPPLY_OFFICER (Mark E. Marasigan)
-- 
-- ============================================================
