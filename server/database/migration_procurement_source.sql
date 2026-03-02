-- ============================================================
-- Migration: Add procurement_source categorization
-- Categories: 'PS-DBM', 'NON PS-DBM', 'PAPs'
-- Date: 2026-03-02
-- ============================================================

-- 1. Add procurement_source to items table
-- PS-DBM = Available in Procurement Service - DBM
-- NON PS-DBM = Not available in PS-DBM but in items catalog
-- Items in the catalog are either PS-DBM or NON PS-DBM
ALTER TABLE items ADD COLUMN IF NOT EXISTS procurement_source VARCHAR(20) DEFAULT 'NON PS-DBM';

-- 2. Add procurement_source to procurementplans table
-- PPMP entries can be PS-DBM, NON PS-DBM (from items catalog), or PAPs (expenses not in catalog)
ALTER TABLE procurementplans ADD COLUMN IF NOT EXISTS procurement_source VARCHAR(20) DEFAULT 'NON PS-DBM';

-- 3. Ensure the missing columns exist on procurementplans (they may already exist in live DB)
ALTER TABLE procurementplans ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE procurementplans ADD COLUMN IF NOT EXISTS item_id INT REFERENCES items(id) ON DELETE SET NULL;
ALTER TABLE procurementplans ADD COLUMN IF NOT EXISTS section VARCHAR(100) DEFAULT 'GENERAL PROCUREMENT';
ALTER TABLE procurementplans ADD COLUMN IF NOT EXISTS item_description TEXT;

-- 4. Add procurement_source to iar_items table
-- IAR items from catalog inherit PS-DBM/NON PS-DBM; PAPs items won't appear in IAR typically
ALTER TABLE iar_items ADD COLUMN IF NOT EXISTS procurement_source VARCHAR(20);

-- 5. Add procurement_source to po_items table (if it exists)
ALTER TABLE po_items ADD COLUMN IF NOT EXISTS procurement_source VARCHAR(20);

-- 6. Add procurement_source to purchase requests table
ALTER TABLE purchaserequests ADD COLUMN IF NOT EXISTS procurement_source VARCHAR(20);

-- 7. Create indexes for filtering performance
CREATE INDEX IF NOT EXISTS idx_items_procurement_source ON items(procurement_source);
CREATE INDEX IF NOT EXISTS idx_plans_procurement_source ON procurementplans(procurement_source);

-- 8. Update existing items: Mark common PS-DBM items from the standard CSE catalog
-- These are items commonly available in PS-DBM Common-Use Supplies and Equipment
UPDATE items SET procurement_source = 'PS-DBM' WHERE procurement_source IS NULL OR procurement_source = 'NON PS-DBM'
AND (
  UPPER(name) LIKE '%BOND PAPER%' OR
  UPPER(name) LIKE '%CARTRIDGE%' OR
  UPPER(name) LIKE '%INK CARTRIDGE%' OR
  UPPER(name) LIKE '%TONER%' OR
  UPPER(name) LIKE '%FOLDER%' OR
  UPPER(name) LIKE '%RECORD BOOK%' OR
  UPPER(name) LIKE '%STAPLER%' OR
  UPPER(name) LIKE '%TAPE%' OR
  UPPER(name) LIKE '%ENVELOPE%' OR
  UPPER(name) LIKE '%PAPER CLIP%' OR
  UPPER(name) LIKE '%BATTERY%' OR
  UPPER(name) LIKE '%BALLPEN%' OR
  UPPER(name) LIKE '%SIGN PEN%' OR
  UPPER(name) LIKE '%CORRECTION%' OR
  UPPER(name) LIKE '%SCISSORS%' OR
  UPPER(name) LIKE '%RULER%' OR
  UPPER(name) LIKE '%ERASER%' OR
  UPPER(name) LIKE '%MARKER%' OR
  UPPER(name) LIKE '%PENCIL%' OR
  UPPER(name) LIKE '%NOTEBOOK%' OR
  UPPER(name) LIKE '%PAD PAPER%' OR
  UPPER(name) LIKE '%STAMP PAD%' OR
  UPPER(name) LIKE '%DATA FILE%' OR
  UPPER(name) LIKE '%INDEX TAB%' OR
  UPPER(name) LIKE '%BINDER CLIP%' OR
  UPPER(name) LIKE '%PUSH PIN%' OR
  UPPER(name) LIKE '%RUBBER BAND%' OR
  UPPER(name) LIKE '%GLUE%' OR
  UPPER(name) LIKE '%FASTENER%' OR
  UPPER(name) LIKE '%PUNCHER%' OR
  UPPER(name) LIKE '%CUTTER%' OR
  UPPER(name) LIKE '%TOILET TISSUE%' OR
  UPPER(name) LIKE '%DISINFECTANT%' OR
  UPPER(name) LIKE '%ALCOHOL%' OR
  UPPER(name) LIKE '%FLASH DRIVE%' OR
  UPPER(name) LIKE '%MOUSE%' OR
  UPPER(name) LIKE '%EXTERNAL HARD%'
);

-- 9. Set all existing procurementplans entries that reference an item_id to inherit the item's procurement_source
UPDATE procurementplans pp SET procurement_source = i.procurement_source
FROM items i WHERE pp.item_id = i.id AND pp.item_id IS NOT NULL;

-- 10. Any remaining plans without item_id that exist are likely PAPs or custom entries
-- We'll leave them as NON PS-DBM by default; users can reclassify
