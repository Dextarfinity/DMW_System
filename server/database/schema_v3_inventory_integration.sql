-- =====================================================
-- DMW CARAGA INTEGRATED PROCUREMENT & INVENTORY SYSTEM
-- Schema V3: Full Inventory Integration
-- Generated: February 13, 2026
-- Adds tables from OLD_INVENTORY-SYSTEM for full parity
-- =====================================================

-- =====================================================
-- 1. NEW TABLES: Divisions (separate from departments)
-- =====================================================
CREATE TABLE IF NOT EXISTS divisions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. NEW TABLES: Offices
-- =====================================================
CREATE TABLE IF NOT EXISTS offices (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. Extend suppliers table with org_type and tax_type
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'org_type') THEN
        ALTER TABLE suppliers ADD COLUMN org_type VARCHAR(50) CHECK (org_type IN ('Government', 'Non-Government'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'tax_type') THEN
        ALTER TABLE suppliers ADD COLUMN tax_type VARCHAR(50) CHECK (tax_type IN ('VAT', 'Non-VAT'));
    END IF;
END $$;

-- =====================================================
-- 4. NEW TABLE: Received Semi-Expendable Items
-- =====================================================
CREATE TABLE IF NOT EXISTS received_semi_expendable_items (
    id SERIAL PRIMARY KEY,
    item_id INT REFERENCES items(id) ON DELETE SET NULL,
    generated_item_id VARCHAR(50),
    item_description TEXT,
    inventory_no VARCHAR(100),
    ics_no VARCHAR(100),
    ppe_no VARCHAR(100),
    serial_no VARCHAR(100),
    issued_to VARCHAR(255),
    issued_to_employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Available' CHECK (status IN ('Available', 'Issued', 'For Repair', 'Unserviceable', 'Disposed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rsei_item ON received_semi_expendable_items(item_id);
CREATE INDEX IF NOT EXISTS idx_rsei_status ON received_semi_expendable_items(status);
CREATE INDEX IF NOT EXISTS idx_rsei_ppe ON received_semi_expendable_items(ppe_no);
CREATE INDEX IF NOT EXISTS idx_rsei_inventory ON received_semi_expendable_items(inventory_no);

-- =====================================================
-- 5. NEW TABLE: Received Capital Outlay Items
-- =====================================================
CREATE TABLE IF NOT EXISTS received_capital_outlay_items (
    id SERIAL PRIMARY KEY,
    item_id INT REFERENCES items(id) ON DELETE SET NULL,
    generated_item_id VARCHAR(50),
    item_description TEXT,
    ppe_no VARCHAR(100),
    serial_no VARCHAR(100),
    issued_to VARCHAR(255),
    issued_to_employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Available' CHECK (status IN ('Available', 'Issued', 'For Repair', 'Unserviceable', 'Disposed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rcoi_item ON received_capital_outlay_items(item_id);
CREATE INDEX IF NOT EXISTS idx_rcoi_status ON received_capital_outlay_items(status);
CREATE INDEX IF NOT EXISTS idx_rcoi_ppe ON received_capital_outlay_items(ppe_no);

-- =====================================================
-- 6. NEW TABLE: Property Acknowledgement Receipts (PAR)
-- =====================================================
CREATE TABLE IF NOT EXISTS property_acknowledgement_receipts (
    id SERIAL PRIMARY KEY,
    par_no VARCHAR(100) UNIQUE NOT NULL,
    ppe_no VARCHAR(100),
    description TEXT,
    issued_to VARCHAR(255),
    issued_to_employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    date_of_issue DATE NOT NULL,
    received_from_id INT REFERENCES employees(id) ON DELETE SET NULL,
    received_from_position VARCHAR(255),
    received_by_id INT REFERENCES employees(id) ON DELETE SET NULL,
    received_by_position VARCHAR(255),
    other_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_par_no ON property_acknowledgement_receipts(par_no);
CREATE INDEX IF NOT EXISTS idx_par_issued ON property_acknowledgement_receipts(issued_to_employee_id);

-- =====================================================
-- 7. NEW TABLE: Property Transfer Reports (PTR)
-- =====================================================
CREATE TABLE IF NOT EXISTS property_transfer_reports (
    id SERIAL PRIMARY KEY,
    ptr_no VARCHAR(100) UNIQUE NOT NULL,
    date DATE NOT NULL,
    from_accountable_officer_id INT REFERENCES employees(id) ON DELETE SET NULL,
    from_accountable_officer_name VARCHAR(255),
    to_accountable_officer_id INT REFERENCES employees(id) ON DELETE SET NULL,
    to_accountable_officer_name VARCHAR(255),
    description TEXT,
    property_number VARCHAR(100),
    acquisition_cost DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ptr_no ON property_transfer_reports(ptr_no);
CREATE INDEX IF NOT EXISTS idx_ptr_from ON property_transfer_reports(from_accountable_officer_id);
CREATE INDEX IF NOT EXISTS idx_ptr_to ON property_transfer_reports(to_accountable_officer_id);

-- =====================================================
-- 8. NEW TABLE: Requisition and Issue Slips (RIS)
-- =====================================================
CREATE TABLE IF NOT EXISTS requisition_issue_slips (
    id SERIAL PRIMARY KEY,
    ris_no VARCHAR(100) UNIQUE NOT NULL,
    division VARCHAR(255),
    ris_date DATE NOT NULL,
    purpose TEXT,
    requested_by_id INT REFERENCES employees(id) ON DELETE SET NULL,
    requested_by_name VARCHAR(255),
    requested_by_designation VARCHAR(255),
    approved_by_id INT REFERENCES employees(id) ON DELETE SET NULL,
    approved_by_name VARCHAR(255),
    approved_by_designation VARCHAR(255),
    issued_by_id INT REFERENCES employees(id) ON DELETE SET NULL,
    issued_by_name VARCHAR(255),
    issued_by_designation VARCHAR(255),
    received_by_id INT REFERENCES employees(id) ON DELETE SET NULL,
    received_by_name VARCHAR(255),
    received_by_designation VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'POSTED', 'CANCELLED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ris_no ON requisition_issue_slips(ris_no);
CREATE INDEX IF NOT EXISTS idx_ris_status ON requisition_issue_slips(status);
CREATE INDEX IF NOT EXISTS idx_ris_date ON requisition_issue_slips(ris_date);

-- =====================================================
-- 9. NEW TABLE: RIS Items
-- =====================================================
CREATE TABLE IF NOT EXISTS ris_items (
    id SERIAL PRIMARY KEY,
    ris_id INT REFERENCES requisition_issue_slips(id) ON DELETE CASCADE,
    item_id INT REFERENCES items(id) ON DELETE SET NULL,
    description VARCHAR(255),
    uom VARCHAR(50),
    quantity INT NOT NULL DEFAULT 0,
    unit_cost DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ris_items_ris ON ris_items(ris_id);
CREATE INDEX IF NOT EXISTS idx_ris_items_item ON ris_items(item_id);

-- =====================================================
-- 10. NEW TABLE: Trip Tickets
-- =====================================================
CREATE TABLE IF NOT EXISTS trip_tickets (
    id SERIAL PRIMARY KEY,
    trip_ticket_no VARCHAR(100) UNIQUE NOT NULL,
    requesting_party VARCHAR(255),
    date_of_request DATE,
    date_of_travel DATE,
    return_date DATE,
    contact_no VARCHAR(50),
    time_of_departure VARCHAR(20),
    purpose TEXT,
    destination TEXT,
    passengers JSONB DEFAULT '[]'::jsonb,
    requested_by_employee VARCHAR(255),
    requested_by_designation VARCHAR(255),
    approved_by_employee VARCHAR(255),
    approved_by_designation VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trip_no ON trip_tickets(trip_ticket_no);
CREATE INDEX IF NOT EXISTS idx_trip_status ON trip_tickets(status);

-- =====================================================
-- 11. Extend IAR items table with inventory fields
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'iar_items' AND column_name = 'category') THEN
        ALTER TABLE iar_items ADD COLUMN category VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'iar_items' AND column_name = 'brand') THEN
        ALTER TABLE iar_items ADD COLUMN brand VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'iar_items' AND column_name = 'model') THEN
        ALTER TABLE iar_items ADD COLUMN model VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'iar_items' AND column_name = 'serial_no') THEN
        ALTER TABLE iar_items ADD COLUMN serial_no VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'iar_items' AND column_name = 'ppe_no') THEN
        ALTER TABLE iar_items ADD COLUMN ppe_no VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'iar_items' AND column_name = 'inventory_no') THEN
        ALTER TABLE iar_items ADD COLUMN inventory_no VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'iar_items' AND column_name = 'generated_item_id') THEN
        ALTER TABLE iar_items ADD COLUMN generated_item_id VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'iar_items' AND column_name = 'remarks') THEN
        ALTER TABLE iar_items ADD COLUMN remarks TEXT;
    END IF;
END $$;

-- =====================================================
-- 12. Extend items table with GAM classification  
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'gam_classification') THEN
        ALTER TABLE items ADD COLUMN gam_classification VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'semi_expendable_classification') THEN
        ALTER TABLE items ADD COLUMN semi_expendable_classification VARCHAR(20);
    END IF;
END $$;

-- =====================================================
-- 13. Extend PO table with inventory fields
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchaseorders' AND column_name = 'po_date') THEN
        ALTER TABLE purchaseorders ADD COLUMN po_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchaseorders' AND column_name = 'purpose') THEN
        ALTER TABLE purchaseorders ADD COLUMN purpose TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchaseorders' AND column_name = 'mode_of_procurement') THEN
        ALTER TABLE purchaseorders ADD COLUMN mode_of_procurement VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchaseorders' AND column_name = 'place_of_delivery') THEN
        ALTER TABLE purchaseorders ADD COLUMN place_of_delivery TEXT;
    END IF;
END $$;

-- =====================================================
-- 14. Extend PO items with category
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'po_items' AND column_name = 'uom') THEN
        ALTER TABLE po_items ADD COLUMN uom VARCHAR(50);
    END IF;
END $$;

-- =====================================================
-- 15. NEW TABLE: Supplies Ledger Cards (like stock_cards but value-based)
-- =====================================================
CREATE TABLE IF NOT EXISTS supplies_ledger_cards (
    id SERIAL PRIMARY KEY,
    item_id INT REFERENCES items(id) ON DELETE CASCADE,
    item_code VARCHAR(50),
    item_name VARCHAR(255),
    transaction_no INT NOT NULL,
    date DATE NOT NULL,
    reference VARCHAR(255),
    receipt_qty INT DEFAULT 0,
    receipt_unit_cost DECIMAL(15,2) DEFAULT 0,
    receipt_total_cost DECIMAL(15,2) DEFAULT 0,
    issue_qty INT DEFAULT 0,
    issue_unit_cost DECIMAL(15,2) DEFAULT 0,
    issue_total_cost DECIMAL(15,2) DEFAULT 0,
    balance_qty INT DEFAULT 0,
    balance_unit_cost DECIMAL(15,2) DEFAULT 0,
    balance_total_cost DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_slc_item ON supplies_ledger_cards(item_id);
CREATE INDEX IF NOT EXISTS idx_slc_date ON supplies_ledger_cards(date);

-- =====================================================
-- 16. Settings/Global Counters table
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(100) PRIMARY KEY,
    data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert global counters if not exists
INSERT INTO settings (id, data) VALUES ('globalCounters', '{
    "counters": {},
    "ppeCounters": {},
    "inventoryCounters": {},
    "generatedItemIdCounter": 3,
    "icsCounters": {},
    "parCounters": {},
    "risCounters": {}
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 17. Additional Views
-- =====================================================

-- Running Inventory View
CREATE OR REPLACE VIEW vw_running_inventory AS
SELECT 
    i.id,
    i.code,
    i.stock_no,
    i.name,
    i.description,
    i.unit,
    i.unit_price,
    i.category,
    i.quantity,
    i.reorder_point,
    i.uacs_code,
    uc.name AS uacs_name,
    CASE 
        WHEN i.quantity <= i.reorder_point AND i.quantity > 0 THEN 'Low Stock'
        WHEN i.quantity = 0 THEN 'Out of Stock'
        ELSE 'In Stock'
    END AS stock_status
FROM items i
LEFT JOIN uacs_codes uc ON i.uacs_code = uc.code
WHERE i.is_active = TRUE
ORDER BY i.name;

-- Semi-Expendable Items View
CREATE OR REPLACE VIEW vw_semi_expendable_items AS
SELECT 
    rsei.*,
    i.name AS item_name,
    i.unit,
    i.unit_price,
    i.uacs_code,
    e.full_name AS issued_to_name
FROM received_semi_expendable_items rsei
LEFT JOIN items i ON rsei.item_id = i.id
LEFT JOIN employees e ON rsei.issued_to_employee_id = e.id;

-- Capital Outlay Items View
CREATE OR REPLACE VIEW vw_capital_outlay_items AS
SELECT 
    rcoi.*,
    i.name AS item_name,
    i.unit,
    i.unit_price,
    i.uacs_code,
    e.full_name AS issued_to_name
FROM received_capital_outlay_items rcoi
LEFT JOIN items i ON rcoi.item_id = i.id
LEFT JOIN employees e ON rcoi.issued_to_employee_id = e.id;

-- =====================================================
-- END OF V3 SCHEMA ADDITIONS
-- =====================================================
