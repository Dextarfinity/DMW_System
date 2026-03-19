-- ============================================================
-- RIS (REQUISITION AND ISSUE SLIP) WORKFLOW UPDATE
-- Version: 2.0
-- Date: March 2026
-- Description: Updates RIS table structure and workflow
--              to support dynamic supplier categories and
--              division-based requisitioning
-- ============================================================

-- Add new columns to support improved workflow
ALTER TABLE requisition_issue_slips 
ADD COLUMN IF NOT EXISTS category VARCHAR(255),
ADD COLUMN IF NOT EXISTS ris_type VARCHAR(50) DEFAULT 'NORMAL' CHECK (ris_type IN ('NORMAL', 'EMERGENCY', 'REPLACEMENT')),
ADD COLUMN IF NOT EXISTS approved_by_supply_id INT REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_priority BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Add comments to columns (PostgreSQL syntax)
COMMENT ON COLUMN requisition_issue_slips.category IS 'Item category (from ppmp_categories)';
COMMENT ON COLUMN requisition_issue_slips.ris_type IS 'Type of requisition (NORMAL, EMERGENCY, REPLACEMENT)';
COMMENT ON COLUMN requisition_issue_slips.approved_by_supply_id IS 'Supply officer who approved the RIS';
COMMENT ON COLUMN requisition_issue_slips.is_priority IS 'Whether this is a priority requisition';
COMMENT ON COLUMN requisition_issue_slips.remarks IS 'Additional remarks or notes';

-- Create index for category-based filtering
CREATE INDEX IF NOT EXISTS idx_ris_category ON requisition_issue_slips(category);
CREATE INDEX IF NOT EXISTS idx_ris_type ON requisition_issue_slips(ris_type);
CREATE INDEX IF NOT EXISTS idx_ris_priority ON requisition_issue_slips(is_priority);

-- Improve ris_items table with more detail columns
ALTER TABLE ris_items
ADD COLUMN IF NOT EXISTS specification VARCHAR(500),
ADD COLUMN IF NOT EXISTS available_qty INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS issue_type VARCHAR(50) DEFAULT 'REMOVAL' CHECK (issue_type IN ('REMOVAL', 'RETURN', 'TRANSFER', 'ADJUSTMENT'));

-- Add comments to ris_items columns (PostgreSQL syntax)
COMMENT ON COLUMN ris_items.specification IS 'Item specifications from catalog';
COMMENT ON COLUMN ris_items.available_qty IS 'Current available stock';
COMMENT ON COLUMN ris_items.issue_type IS 'Type of issue (REMOVAL, RETURN, TRANSFER, ADJUSTMENT)';

-- Create indexes for ris_items
CREATE INDEX IF NOT EXISTS idx_ris_items_description ON ris_items(description);
CREATE INDEX IF NOT EXISTS idx_ris_items_uom ON ris_items(uom);

-- View: RIS with category and section names from catalog
CREATE OR REPLACE VIEW vw_ris_with_category AS
SELECT 
    r.id,
    r.ris_no,
    r.division,
    r.ris_date,
    r.purpose,
    r.status,
    r.ris_type,
    r.is_priority,
    c.name as category_name,
    s.name as section_name,
    e1.full_name as requested_by_name,
    e2.full_name as approved_by_name,
    e3.full_name as issued_by_name,
    e4.full_name as received_by_name,
    r.created_at,
    r.updated_at
FROM requisition_issue_slips r
LEFT JOIN ppmp_categories c ON r.category = c.name
LEFT JOIN ppmp_sections s ON c.section_id = s.id
LEFT JOIN employees e1 ON r.requested_by_id = e1.id
LEFT JOIN employees e2 ON r.approved_by_id = e2.id
LEFT JOIN employees e3 ON r.issued_by_id = e3.id
LEFT JOIN employees e4 ON r.received_by_id = e4.id
ORDER BY r.ris_date DESC;

-- View: RIS Items with stock availability
CREATE OR REPLACE VIEW vw_ris_items_detail AS
SELECT 
    ri.id,
    ri.ris_id,
    ri.item_id,
    ri.description,
    ri.specification,
    ri.uom,
    ri.quantity,
    ri.unit_cost,
    ri.available_qty,
    ri.issue_type,
    i.name as item_name,
    i.category as item_category,
    i.quantity as total_stock,
    (i.quantity - COALESCE(ri.available_qty, 0)) as issued_qty,
    ri.created_at
FROM ris_items ri
LEFT JOIN items i ON ri.item_id = i.id
ORDER BY ri.created_at DESC;

-- ============================================================
-- WORKFLOW NOTES:
-- ============================================================
-- RIS Status Flow:
--   PENDING → POSTED (approved and issued)
--   PENDING → CANCELLED (rejected)
--
-- RIS Types:
--   NORMAL - Regular requisition
--   EMERGENCY - Urgent requisition
--   REPLACEMENT - Replacement for damaged/lost items
--
-- Issue Types (for ris_items):
--   REMOVAL - Item removed from inventory
--   RETURN - Item returned to inventory
--   TRANSFER - Item transferred between divisions
--   ADJUSTMENT - Inventory adjustment/correction
