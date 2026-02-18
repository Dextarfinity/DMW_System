-- =====================================================
-- DMW CARAGA INTEGRATED PROCUREMENT & INVENTORY SYSTEM
-- Version: 2.0.0
-- Generated: February 12, 2026
-- Integration: Procurement System + Inventory Management
-- =====================================================

-- CREATE DATABASE dmw_caraga_system;
-- CREATE USER dmw_app WITH PASSWORD 'SecurePass2026#DMW';
-- GRANT ALL PRIVILEGES ON DATABASE dmw_caraga_system TO dmw_app;

-- Enable UUID extension (for future use if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE MASTER DATA
-- =====================================================

-- DEPARTMENTS / DIVISIONS (5 offices)
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO departments (name, code, description) VALUES
('Finance and Administrative Division', 'FAD', 'Handles finance, HR, and administrative matters'),
('Welfare Reintegration Services Division', 'WRSD', 'Provides welfare and reintegration services for OFWs'),
('Migrant Workers Protection Services Division', 'MWPSD', 'Handles protection and legal assistance for migrant workers'),
('Migrant Workers Protection Training Division', 'MWPTD', 'Processes documentation and deployment of migrant workers'),
('Office of Regional Director', 'ORD', 'Regional executive office')
ON CONFLICT (code) DO NOTHING;

-- DESIGNATIONS / POSITIONS
CREATE TABLE IF NOT EXISTS designations (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EMPLOYEES (separate from system users - for property accountability)
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    employee_code VARCHAR(50) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    designation_id INT REFERENCES designations(id) ON DELETE SET NULL,
    dept_id INT REFERENCES departments(id) ON DELETE SET NULL,
    email VARCHAR(100),
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'retired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(dept_id);
CREATE INDEX IF NOT EXISTS idx_employees_designation ON employees(designation_id);
CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employee_code);

-- USERS (System accounts for login/access control)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    role VARCHAR(30) NOT NULL CHECK (
        role IN (
            'admin',
            'hope',
            'bac_chair',
            'bac_secretariat',
            'twg_member',
            'division_head',
            'end_user',
            'supply_officer',
            'inspector',
            'auditor',
            'manager',
            'officer',
            'viewer',
            'chief'
        )
    ),
    dept_id INT REFERENCES departments(id) ON DELETE SET NULL,
    employee_id INT REFERENCES employees(id) ON DELETE SET NULL, -- link to employee record
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_dept ON users(dept_id);
CREATE INDEX IF NOT EXISTS idx_users_employee ON users(employee_id);

-- FUND CLUSTERS
CREATE TABLE IF NOT EXISTS fund_clusters (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROCUREMENT MODES
CREATE TABLE IF NOT EXISTS procurement_modes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- UACS CODES (Government Accounting Classification)
CREATE TABLE IF NOT EXISTS uacs_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100),
    name TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_uacs_code ON uacs_codes(code);
CREATE INDEX IF NOT EXISTS idx_uacs_category ON uacs_codes(category);

-- UNITS OF MEASURE
CREATE TABLE IF NOT EXISTS uoms (
    id SERIAL PRIMARY KEY,
    abbreviation VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ATTACHMENTS (Generic File Storage)
-- =====================================================

CREATE TABLE IF NOT EXISTS attachments (
    id SERIAL PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255),
    mime_type VARCHAR(120),
    file_size_bytes BIGINT DEFAULT 0,
    storage_path TEXT,
    checksum_sha256 VARCHAR(64),
    uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);

-- Entity Attachments (link files to any record type)
CREATE TABLE IF NOT EXISTS entity_attachments (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    attachment_id INT REFERENCES attachments(id) ON DELETE CASCADE,
    description TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_entity_attachments_entity ON entity_attachments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_attachments_attachment ON entity_attachments(attachment_id);

-- =====================================================
-- ITEMS / INVENTORY CATALOG (Enhanced for Inventory)
-- =====================================================

CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    stock_no VARCHAR(100),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL,
    unit_price DECIMAL(12,2) DEFAULT 0,
    category VARCHAR(100), -- EXPENDABLE, SEMI-EXPENDABLE, CAPITAL OUTLAY, etc.
    uacs_code VARCHAR(50) REFERENCES uacs_codes(code),
    -- Inventory fields
    quantity INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_items_code ON items(code);
CREATE INDEX IF NOT EXISTS idx_items_stock_no ON items(stock_no);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_uacs ON items(uacs_code);

COMMENT ON TABLE items IS 'Main catalog for both procurement and inventory - includes quantity tracking for inventory management';

-- =====================================================
-- SUPPLIERS / VENDORS
-- =====================================================

CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    tin VARCHAR(50),
    org_type VARCHAR(50) CHECK (org_type IN ('Government', 'Non-Government')),
    tax_type VARCHAR(50) CHECK (tax_type IN ('VAT', 'Non-VAT')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- =====================================================
-- PROCUREMENT MODULE
-- =====================================================

-- PROCUREMENT PLANS (PPMP/APP)
CREATE TABLE IF NOT EXISTS procurementplans (
    id SERIAL PRIMARY KEY,
    dept_id INT REFERENCES departments(id) ON DELETE SET NULL,
    fiscal_year INT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'completed')),
    remarks TEXT,
    total_amount DECIMAL(12,2) DEFAULT 0,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    approved_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plans_dept ON procurementplans(dept_id);
CREATE INDEX IF NOT EXISTS idx_plans_status ON procurementplans(status);
CREATE INDEX IF NOT EXISTS idx_plans_year ON procurementplans(fiscal_year);

CREATE TABLE IF NOT EXISTS plan_items (
    id SERIAL PRIMARY KEY,
    plan_id INT REFERENCES procurementplans(id) ON DELETE CASCADE,
    item_code VARCHAR(50) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    item_description TEXT,
    unit VARCHAR(50) NOT NULL,
    unit_price DECIMAL(12,2) DEFAULT 0,
    category VARCHAR(100),
    q1_qty INT DEFAULT 0,
    q1_status VARCHAR(20) DEFAULT 'pending',
    q2_qty INT DEFAULT 0,
    q2_status VARCHAR(20) DEFAULT 'pending',
    q3_qty INT DEFAULT 0,
    q3_status VARCHAR(20) DEFAULT 'pending',
    q4_qty INT DEFAULT 0,
    q4_status VARCHAR(20) DEFAULT 'pending',
    total_qty INT GENERATED ALWAYS AS (COALESCE(q1_qty, 0) + COALESCE(q2_qty, 0) + COALESCE(q3_qty, 0) + COALESCE(q4_qty, 0)) STORED,
    total_price DECIMAL(12,2) GENERATED ALWAYS AS ((COALESCE(q1_qty, 0) + COALESCE(q2_qty, 0) + COALESCE(q3_qty, 0) + COALESCE(q4_qty, 0)) * unit_price) STORED,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plan_items_plan ON plan_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_items_code ON plan_items(item_code);

-- PURCHASE REQUESTS
CREATE TABLE IF NOT EXISTS purchaserequests (
    id SERIAL PRIMARY KEY,
    pr_number VARCHAR(50) UNIQUE NOT NULL,
    dept_id INT REFERENCES departments(id) ON DELETE SET NULL,
    purpose TEXT,
    total_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed', 'cancelled')),
    requested_by INT REFERENCES users(id) ON DELETE SET NULL,
    approved_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pr_number ON purchaserequests(pr_number);
CREATE INDEX IF NOT EXISTS idx_pr_dept ON purchaserequests(dept_id);
CREATE INDEX IF NOT EXISTS idx_pr_status ON purchaserequests(status);

CREATE TABLE IF NOT EXISTS pr_items (
    id SERIAL PRIMARY KEY,
    pr_id INT REFERENCES purchaserequests(id) ON DELETE CASCADE,
    item_code VARCHAR(50) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    item_description TEXT,
    unit VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pr_items_pr ON pr_items(pr_id);
CREATE INDEX IF NOT EXISTS idx_pr_items_code ON pr_items(item_code);

-- RFQ (Request for Quotation)
CREATE TABLE IF NOT EXISTS rfqs (
    id SERIAL PRIMARY KEY,
    rfq_number VARCHAR(50) UNIQUE NOT NULL,
    pr_id INT REFERENCES purchaserequests(id) ON DELETE SET NULL,
    date_prepared DATE,
    submission_deadline DATE,
    abc_amount DECIMAL(12,2) DEFAULT 0,
    philgeps_required BOOLEAN DEFAULT FALSE,
    philgeps_posted_from DATE,
    philgeps_posted_until DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'closed', 'cancelled')),
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rfqs_pr ON rfqs(pr_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);

CREATE TABLE IF NOT EXISTS rfq_items (
    id SERIAL PRIMARY KEY,
    rfq_id INT REFERENCES rfqs(id) ON DELETE CASCADE,
    item_code VARCHAR(50),
    item_name VARCHAR(200) NOT NULL,
    item_description TEXT,
    unit VARCHAR(50),
    category VARCHAR(100),
    quantity INT NOT NULL DEFAULT 1,
    abc_unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    abc_total_cost DECIMAL(12,2) GENERATED ALWAYS AS (quantity * abc_unit_cost) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rfq_items_rfq ON rfq_items(rfq_id);

CREATE TABLE IF NOT EXISTS rfq_suppliers (
    id SERIAL PRIMARY KEY,
    rfq_id INT REFERENCES rfqs(id) ON DELETE CASCADE,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    invited_at DATE,
    responded BOOLEAN DEFAULT FALSE,
    response_received_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rfq_suppliers_rfq ON rfq_suppliers(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_suppliers_supplier ON rfq_suppliers(supplier_id);

-- ABSTRACT OF QUOTATION (AOQ)
CREATE TABLE IF NOT EXISTS abstracts (
    id SERIAL PRIMARY KEY,
    abstract_number VARCHAR(50) UNIQUE NOT NULL,
    rfq_id INT REFERENCES rfqs(id) ON DELETE SET NULL,
    date_prepared DATE,
    purpose TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'cancelled')),
    recommended_supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    recommended_amount DECIMAL(12,2) DEFAULT 0,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_abstracts_rfq ON abstracts(rfq_id);
CREATE INDEX IF NOT EXISTS idx_abstracts_status ON abstracts(status);

CREATE TABLE IF NOT EXISTS abstract_quotations (
    id SERIAL PRIMARY KEY,
    abstract_id INT REFERENCES abstracts(id) ON DELETE CASCADE,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    bid_amount DECIMAL(12,2) DEFAULT 0,
    is_compliant BOOLEAN DEFAULT FALSE,
    remarks TEXT,
    rank_no INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_abstract_quotes_abstract ON abstract_quotations(abstract_id);
CREATE INDEX IF NOT EXISTS idx_abstract_quotes_supplier ON abstract_quotations(supplier_id);

CREATE TABLE IF NOT EXISTS abstract_quote_items (
    id SERIAL PRIMARY KEY,
    abstract_quotation_id INT REFERENCES abstract_quotations(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    quantity NUMERIC(14,2) DEFAULT 1,
    unit VARCHAR(50),
    unit_price DECIMAL(12,2) DEFAULT 0,
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_abstract_quote_items_quote ON abstract_quote_items(abstract_quotation_id);

-- POST-QUALIFICATION (TWG)
CREATE TABLE IF NOT EXISTS post_qualifications (
    id SERIAL PRIMARY KEY,
    postqual_number VARCHAR(50) UNIQUE NOT NULL,
    abstract_id INT REFERENCES abstracts(id) ON DELETE SET NULL,
    bidder_name VARCHAR(200),
    documents_verified JSONB DEFAULT '{}'::jsonb,
    technical_compliance JSONB DEFAULT '{}'::jsonb,
    financial_validation JSONB DEFAULT '{}'::jsonb,
    twg_result VARCHAR(20) CHECK (twg_result IN ('PASS', 'FAIL')),
    findings TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'failed', 'cancelled')),
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_postqual_abstract ON post_qualifications(abstract_id);

-- BAC RESOLUTION
CREATE TABLE IF NOT EXISTS bac_resolutions (
    id SERIAL PRIMARY KEY,
    resolution_number VARCHAR(50) UNIQUE NOT NULL,
    abstract_id INT REFERENCES abstracts(id) ON DELETE SET NULL,
    resolution_date DATE,
    procurement_mode VARCHAR(30) DEFAULT 'SVP' CHECK (procurement_mode IN ('SVP', 'SVPDC', 'DC_SHOPPING', 'OTHERS')),
    abc_amount DECIMAL(12,2) DEFAULT 0,
    recommended_supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    recommended_awardee_name VARCHAR(255),
    bid_amount DECIMAL(12,2) DEFAULT 0,
    philgeps_required BOOLEAN DEFAULT FALSE,
    philgeps_posted_from DATE,
    philgeps_posted_until DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected', 'cancelled')),
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    approved_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bacres_abstract ON bac_resolutions(abstract_id);
CREATE INDEX IF NOT EXISTS idx_bacres_status ON bac_resolutions(status);

-- NOTICE OF AWARD (NOA)
CREATE TABLE IF NOT EXISTS notices_of_award (
    id SERIAL PRIMARY KEY,
    noa_number VARCHAR(50) UNIQUE NOT NULL,
    bac_resolution_id INT REFERENCES bac_resolutions(id) ON DELETE SET NULL,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    contract_amount DECIMAL(12,2) DEFAULT 0,
    date_issued DATE,
    bidder_receipt_date DATE,
    status VARCHAR(20) DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'received', 'cancelled')),
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    approved_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_noa_bacres ON notices_of_award(bac_resolution_id);
CREATE INDEX IF NOT EXISTS idx_noa_status ON notices_of_award(status);

-- PURCHASE ORDERS (Enhanced with Inventory Integration)
CREATE TABLE IF NOT EXISTS purchaseorders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    pr_id INT REFERENCES purchaserequests(id) ON DELETE SET NULL,
    noa_id INT REFERENCES notices_of_award(id) ON DELETE SET NULL,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    total_amount DECIMAL(12,2) DEFAULT 0,
    fund_cluster VARCHAR(100),
    delivery_term VARCHAR(100),
    payment_term VARCHAR(100),
    delivery_address TEXT,
    -- Document status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'delivered', 'completed', 'cancelled')),
    -- UI/Case workflow status
    workflow_status VARCHAR(30) DEFAULT 'pending' CHECK (
        workflow_status IN (
            'pending',
            'on_process',
            'awaiting_delivery',
            'for_payment',
            'paid_ada',
            'for_signing',
            'signed',
            'submitted_to_coa',
            'cancelled'
        )
    ),
    expected_delivery_date DATE,
    delivery_date DATE,
    -- Supplier acceptance
    accepted_at TIMESTAMP,
    accepted_by INT REFERENCES users(id) ON DELETE SET NULL,
    supplier_conforme_attachment_id INT REFERENCES attachments(id) ON DELETE SET NULL,
    -- Delivery event
    delivered_at TIMESTAMP,
    delivered_by INT REFERENCES users(id) ON DELETE SET NULL,
    -- Payment tracking
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'for_payment', 'paid_ada')),
    payment_date DATE,
    ada_reference_no VARCHAR(100),
    obr_no VARCHAR(100),
    -- Audit fields
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    approved_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_po_number ON purchaseorders(po_number);
CREATE INDEX IF NOT EXISTS idx_po_supplier ON purchaseorders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchaseorders(status);
CREATE INDEX IF NOT EXISTS idx_po_workflow_status ON purchaseorders(workflow_status);
CREATE INDEX IF NOT EXISTS idx_po_pr ON purchaseorders(pr_id);
CREATE INDEX IF NOT EXISTS idx_po_noa ON purchaseorders(noa_id);

CREATE TABLE IF NOT EXISTS po_items (
    id SERIAL PRIMARY KEY,
    po_id INT REFERENCES purchaseorders(id) ON DELETE CASCADE,
    item_id INT REFERENCES items(id) ON DELETE SET NULL,
    item_code VARCHAR(50) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    item_description TEXT,
    unit VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_po_items_po ON po_items(po_id);
CREATE INDEX IF NOT EXISTS idx_po_items_code ON po_items(item_code);
CREATE INDEX IF NOT EXISTS idx_po_items_item ON po_items(item_id);

-- IAR (Inspection and Acceptance Report) - Links to Inventory
CREATE TABLE IF NOT EXISTS iars (
    id SERIAL PRIMARY KEY,
    iar_number VARCHAR(50) UNIQUE NOT NULL,
    po_id INT REFERENCES purchaseorders(id) ON DELETE SET NULL,
    inspection_date DATE,
    delivery_date DATE,
    invoice_number VARCHAR(80),
    invoice_date DATE,
    delivery_receipt_number VARCHAR(80),
    inspection_result VARCHAR(20) DEFAULT 'pending' CHECK (inspection_result IN ('pending', 'accepted', 'rejected', 'partial')),
    findings TEXT,
    inspected_by INT REFERENCES users(id) ON DELETE SET NULL,
    date_inspected DATE,
    received_by INT REFERENCES users(id) ON DELETE SET NULL,
    date_received DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'cancelled')),
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_iars_po ON iars(po_id);
CREATE INDEX IF NOT EXISTS idx_iars_status ON iars(status);

CREATE TABLE IF NOT EXISTS iar_items (
    id SERIAL PRIMARY KEY,
    iar_id INT REFERENCES iars(id) ON DELETE CASCADE,
    item_id INT REFERENCES items(id) ON DELETE SET NULL,
    item_code VARCHAR(50) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    quantity INT NOT NULL,
    unit_cost DECIMAL(12,2) DEFAULT 0,
    total_cost DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_iar_items_iar ON iar_items(iar_id);
CREATE INDEX IF NOT EXISTS idx_iar_items_item ON iar_items(item_id);

-- PO PACKET (Supporting Docs + Signing Gate)
CREATE TABLE IF NOT EXISTS po_packets (
    id SERIAL PRIMARY KEY,
    po_id INT UNIQUE REFERENCES purchaseorders(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'for_signing', 'signed', 'submitted_to_coa', 'cancelled')),
    compiled_at TIMESTAMP,
    compiled_by INT REFERENCES users(id) ON DELETE SET NULL,
    chief_signed_at TIMESTAMP,
    chief_signed_by INT REFERENCES users(id) ON DELETE SET NULL,
    director_signed_at TIMESTAMP,
    director_signed_by INT REFERENCES users(id) ON DELETE SET NULL,
    packet_attachment_id INT REFERENCES attachments(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_po_packets_status ON po_packets(status);

-- COA SUBMISSION
CREATE TABLE IF NOT EXISTS coa_submissions (
    id SERIAL PRIMARY KEY,
    submission_number VARCHAR(50) UNIQUE NOT NULL,
    po_id INT REFERENCES purchaseorders(id) ON DELETE SET NULL,
    iar_id INT REFERENCES iars(id) ON DELETE SET NULL,
    po_packet_id INT REFERENCES po_packets(id) ON DELETE SET NULL,
    submission_date DATE,
    received_by_coa VARCHAR(120),
    coa_receipt_date DATE,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'received', 'returned', 'completed', 'cancelled')),
    documents_included JSONB DEFAULT '{}'::jsonb,
    coa_packet_attachment_id INT REFERENCES attachments(id) ON DELETE SET NULL,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coa_po ON coa_submissions(po_id);
CREATE INDEX IF NOT EXISTS idx_coa_status ON coa_submissions(status);

-- =====================================================
-- INVENTORY MANAGEMENT MODULE
-- =====================================================

-- STOCK CARDS (Quantity tracking for EXPENDABLE items)
CREATE TABLE IF NOT EXISTS stock_cards (
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

CREATE INDEX IF NOT EXISTS idx_stock_item ON stock_cards(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_date ON stock_cards(date);
CREATE INDEX IF NOT EXISTS idx_stock_reference ON stock_cards(reference);

COMMENT ON TABLE stock_cards IS 'Quantity and value tracking for expendable items (office supplies, consumables)';

-- PROPERTY CARDS (for SEMI-EXPENDABLE and CAPITAL OUTLAY items)
CREATE TABLE IF NOT EXISTS property_cards (
    id SERIAL PRIMARY KEY,
    property_number VARCHAR(100) UNIQUE NOT NULL,
    item_id INT REFERENCES items(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    acquisition_cost DECIMAL(15,2),
    acquisition_date DATE,
    issued_to VARCHAR(255),
    issued_to_employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    issued_date DATE,
    received_date DATE,
    ics_no VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'disposed', 'transferred', 'for_repair')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_number ON property_cards(property_number);
CREATE INDEX IF NOT EXISTS idx_property_issued_to ON property_cards(issued_to_employee_id);
CREATE INDEX IF NOT EXISTS idx_property_status ON property_cards(status);
CREATE INDEX IF NOT EXISTS idx_property_item ON property_cards(item_id);

COMMENT ON TABLE property_cards IS 'Property records for semi-expendable and capital outlay items with accountability';

-- PROPERTY LEDGER CARDS (Transaction history for property items)
CREATE TABLE IF NOT EXISTS property_ledger_cards (
    id SERIAL PRIMARY KEY,
    property_number VARCHAR(100) REFERENCES property_cards(property_number),
    description TEXT,
    acquisition_date DATE,
    acquisition_cost DECIMAL(15,2),
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

CREATE INDEX IF NOT EXISTS idx_ledger_property ON property_ledger_cards(property_number);
CREATE INDEX IF NOT EXISTS idx_ledger_date ON property_ledger_cards(date);
CREATE INDEX IF NOT EXISTS idx_ledger_reference ON property_ledger_cards(reference);

COMMENT ON TABLE property_ledger_cards IS 'Detailed transaction history for property items (value-based tracking)';

-- INVENTORY CUSTODIAN SLIPS (ICS) - Property accountability transfers
CREATE TABLE IF NOT EXISTS inventory_custodian_slips (
    id SERIAL PRIMARY KEY,
    ics_no VARCHAR(100) UNIQUE NOT NULL,
    date_of_issue DATE NOT NULL,
    property_number VARCHAR(100) REFERENCES property_cards(property_number),
    description TEXT,
    inventory_no VARCHAR(100),
    ppe_no VARCHAR(100),
    issued_to VARCHAR(255),
    issued_to_employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    received_by_employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    received_by_position VARCHAR(255),
    other_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ics_no ON inventory_custodian_slips(ics_no);
CREATE INDEX IF NOT EXISTS idx_ics_property ON inventory_custodian_slips(property_number);
CREATE INDEX IF NOT EXISTS idx_ics_issued_to ON inventory_custodian_slips(issued_to_employee_id);
CREATE INDEX IF NOT EXISTS idx_ics_date ON inventory_custodian_slips(date_of_issue);

COMMENT ON TABLE inventory_custodian_slips IS 'Formal transfer of property accountability between custodians';

-- =====================================================
-- SYSTEM TABLES
-- =====================================================

-- COUNTERS (Auto-numbering sequences)
CREATE TABLE IF NOT EXISTS counters (
    counter_name VARCHAR(100) PRIMARY KEY,
    year INTEGER,
    count INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE counters IS 'Auto-incrementing counters for document numbers (ICS, IAR, PO, Property Numbers)';

-- AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(created_at);

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Current Stock Levels View
CREATE OR REPLACE VIEW vw_current_stock AS
SELECT 
    i.id,
    i.code,
    i.stock_no,
    i.name AS description,
    i.category,
    i.unit,
    i.quantity AS system_qty,
    COALESCE(
        (SELECT balance_qty FROM stock_cards 
         WHERE item_id = i.id 
         ORDER BY date DESC, transaction_no DESC 
         LIMIT 1), 
        0
    ) AS stock_card_balance,
    i.reorder_point,
    i.unit_price,
    CASE 
        WHEN i.quantity <= i.reorder_point AND i.quantity > 0 THEN 'Low Stock'
        WHEN i.quantity = 0 THEN 'Out of Stock'
        ELSE 'In Stock'
    END AS stock_status
FROM items i
WHERE i.category = 'EXPENDABLE'
AND i.is_active = TRUE;

COMMENT ON VIEW vw_current_stock IS 'Real-time stock levels for expendable items with low stock alerts';

-- Purchase Order Summary View
CREATE OR REPLACE VIEW vw_po_summary AS
SELECT 
    po.id,
    po.po_number,
    po.po_date,
    s.name AS supplier_name,
    po.total_amount,
    po.status,
    po.workflow_status,
    COUNT(poi.id) AS item_count,
    COALESCE((SELECT COUNT(*) FROM iars WHERE po_id = po.id), 0) AS iar_count,
    CASE 
        WHEN po.workflow_status = 'submitted_to_coa' THEN 'Complete'
        WHEN po.workflow_status = 'cancelled' THEN 'Cancelled'
        ELSE 'In Progress'
    END AS completion_status
FROM purchaseorders po
LEFT JOIN suppliers s ON po.supplier_id = s.id
LEFT JOIN po_items poi ON po.id = poi.po_id
GROUP BY po.id, po.po_number, po.po_date, s.name, po.total_amount, po.status, po.workflow_status;

COMMENT ON VIEW vw_po_summary IS 'Purchase order summary with supplier, items, and completion status';

-- Property Accountability View
CREATE OR REPLACE VIEW vw_property_accountability AS
SELECT 
    pc.property_number,
    pc.description,
    pc.acquisition_cost,
    pc.issued_to,
    e.full_name AS custodian_name,
    e.employee_code AS custodian_code,
    d.name AS custodian_department,
    pc.issued_date,
    pc.status,
    ics.ics_no,
    ics.received_by_position
FROM property_cards pc
LEFT JOIN employees e ON pc.issued_to_employee_id = e.id
LEFT JOIN departments d ON e.dept_id = d.id
LEFT JOIN inventory_custodian_slips ics ON pc.ics_no = ics.ics_no
WHERE pc.status = 'active';

COMMENT ON VIEW vw_property_accountability IS 'Active property with current custodian accountability';

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get next counter value
CREATE OR REPLACE FUNCTION get_next_counter(
    p_counter_name VARCHAR(100),
    p_year INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    INSERT INTO counters (counter_name, year, count, updated_at)
    VALUES (p_counter_name, p_year, 1, CURRENT_TIMESTAMP)
    ON CONFLICT (counter_name) 
    DO UPDATE SET 
        count = CASE 
            WHEN counters.year = p_year THEN counters.count + 1
            ELSE 1
        END,
        year = p_year,
        updated_at = CURRENT_TIMESTAMP
    RETURNING count INTO v_count;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_next_counter IS 'Auto-increment counter with year reset support';

-- Function to update item quantity
CREATE OR REPLACE FUNCTION update_item_quantity(
    p_item_id INT,
    p_quantity_change INT
) RETURNS VOID AS $$
BEGIN
    UPDATE items 
    SET 
        quantity = quantity + p_quantity_change,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_item_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update item quantity when IAR is completed
CREATE OR REPLACE FUNCTION trg_update_stock_on_iar()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Update item quantities for all items in this IAR
        UPDATE items i
        SET quantity = quantity + ii.quantity,
            updated_at = CURRENT_TIMESTAMP
        FROM iar_items ii
        WHERE ii.iar_id = NEW.id
        AND i.id = ii.item_id
        AND i.category = 'EXPENDABLE';

        -- Create stock card entries
        INSERT INTO stock_cards (
            item_id, item_code, item_name, transaction_no, date, reference,
            receipt_qty, receipt_unit_cost, receipt_total_cost,
            balance_qty, balance_unit_cost, balance_total_cost
        )
        SELECT 
            ii.item_id,
            ii.item_code,
            ii.item_name,
            COALESCE((SELECT MAX(transaction_no) + 1 FROM stock_cards WHERE item_id = ii.item_id), 0),
            NEW.date_received,
            'IAR-' || NEW.iar_number,
            ii.quantity,
            ii.unit_cost,
            ii.total_cost,
            i.quantity,
            ii.unit_cost,
            i.quantity * ii.unit_cost
        FROM iar_items ii
        JOIN items i ON ii.item_id = i.id
        WHERE ii.iar_id = NEW.id
        AND i.category = 'EXPENDABLE';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_iar_update_stock
AFTER UPDATE ON iars
FOR EACH ROW
EXECUTE FUNCTION trg_update_stock_on_iar();

COMMENT ON TRIGGER trg_iar_update_stock ON iars IS 'Auto-updates item quantities and creates stock cards when IAR is completed';

-- Trigger for audit logging on items
CREATE OR REPLACE FUNCTION trg_audit_items()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, new_data)
        VALUES ('items', NEW.id, 'INSERT', row_to_json(NEW)::jsonb);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_data, new_data)
        VALUES ('items', NEW.id, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_data)
        VALUES ('items', OLD.id, 'DELETE', row_to_json(OLD)::jsonb);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_items_log
AFTER INSERT OR UPDATE OR DELETE ON items
FOR EACH ROW
EXECUTE FUNCTION trg_audit_items();

-- =====================================================
-- GRANT PERMISSIONS (Commented - using postgres directly)
-- =====================================================

-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dmw_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dmw_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO dmw_app;

-- =====================================================
-- END OF INTEGRATED SCHEMA
-- =====================================================
