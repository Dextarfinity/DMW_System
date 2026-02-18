-- ============================================================
-- DMW CARAGA PROCUREMENT & INVENTORY SYSTEM
-- CONSOLIDATED DATABASE SCHEMA
-- Version: 4.0.0
-- Date: February 2026
-- Description: Single-file schema with ALL tables required by
--              server.js (44 tables + views). Replaces schema.sql,
--              schema_updated_v1_1.sql, and
--              schema_v3_inventory_integration.sql.
-- ============================================================

-- Run as postgres superuser:
--   CREATE DATABASE dmw_db;
-- Then connect:  \c dmw_db
-- Then run this file.

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. DEPARTMENTS (5 DMW Divisions)
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(100) NOT NULL,
    code  VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. DESIGNATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS designations (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(50),
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. EMPLOYEES
-- ============================================================
CREATE TABLE IF NOT EXISTS employees (
    id              SERIAL PRIMARY KEY,
    employee_code   VARCHAR(50),
    full_name       VARCHAR(200) NOT NULL,
    designation_id  INT REFERENCES designations(id) ON DELETE SET NULL,
    dept_id         INT REFERENCES departments(id) ON DELETE SET NULL,
    email           VARCHAR(100),
    phone           VARCHAR(50),
    status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(dept_id);
CREATE INDEX IF NOT EXISTS idx_employees_designation ON employees(designation_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

-- ============================================================
-- 4. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(100),
    email         VARCHAR(100),
    role          VARCHAR(30) NOT NULL CHECK (
                      role IN (
                          'admin','hope','bac_chair','bac_secretariat',
                          'twg_member','division_head','end_user',
                          'supply_officer','inspector','auditor',
                          'manager','officer','viewer'
                      )
                  ),
    dept_id       INT REFERENCES departments(id) ON DELETE SET NULL,
    employee_id   INT REFERENCES employees(id) ON DELETE SET NULL,
    is_active     BOOLEAN DEFAULT TRUE,
    last_login    TIMESTAMP,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_dept ON users(dept_id);

-- ============================================================
-- 5. FUND CLUSTERS
-- ============================================================
CREATE TABLE IF NOT EXISTS fund_clusters (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(50),
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 6. PROCUREMENT MODES
-- ============================================================
CREATE TABLE IF NOT EXISTS procurement_modes (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(50),
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 7. UACS CODES
-- ============================================================
CREATE TABLE IF NOT EXISTS uacs_codes (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(50) NOT NULL,
    category    VARCHAR(100),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_uacs_code ON uacs_codes(code);
CREATE INDEX IF NOT EXISTS idx_uacs_category ON uacs_codes(category);

-- ============================================================
-- 8. UNITS OF MEASURE (UOM)
-- ============================================================
CREATE TABLE IF NOT EXISTS uoms (
    id           SERIAL PRIMARY KEY,
    abbreviation VARCHAR(20) NOT NULL,
    name         VARCHAR(100) NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 9. DIVISIONS (separate from departments for inventory use)
-- ============================================================
CREATE TABLE IF NOT EXISTS divisions (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 10. OFFICES
-- ============================================================
CREATE TABLE IF NOT EXISTS offices (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 11. ITEMS (Reference Catalog + Inventory)
-- ============================================================
CREATE TABLE IF NOT EXISTS items (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(50) UNIQUE NOT NULL,
    stock_no    VARCHAR(50),
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    unit        VARCHAR(50) NOT NULL,
    unit_price  DECIMAL(12,2) DEFAULT 0,
    category    VARCHAR(100),
    uacs_code   VARCHAR(50),
    quantity    INT DEFAULT 0,
    reorder_point INT DEFAULT 0,
    gam_classification VARCHAR(100),
    semi_expendable_classification VARCHAR(20),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_items_code ON items(code);
CREATE INDEX IF NOT EXISTS idx_items_stock_no ON items(stock_no);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_uacs ON items(uacs_code);

-- ============================================================
-- 12. SUPPLIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    contact_person  VARCHAR(100),
    phone           VARCHAR(50),
    email           VARCHAR(100),
    address         TEXT,
    tin             VARCHAR(50),
    org_type        VARCHAR(50) CHECK (org_type IN ('Government','Non-Government')),
    tax_type        VARCHAR(50) CHECK (tax_type IN ('VAT','Non-VAT')),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- ============================================================
-- 13. ATTACHMENTS (generic file storage metadata)
-- ============================================================
CREATE TABLE IF NOT EXISTS attachments (
    id              SERIAL PRIMARY KEY,
    original_name   VARCHAR(255) NOT NULL,
    stored_name     VARCHAR(255),
    mime_type       VARCHAR(120),
    file_size_bytes BIGINT DEFAULT 0,
    storage_path    TEXT,
    checksum_sha256 VARCHAR(64),
    uploaded_by     INT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);

-- ============================================================
-- 14. ENTITY ATTACHMENTS (polymorphic link)
-- ============================================================
CREATE TABLE IF NOT EXISTS entity_attachments (
    id            SERIAL PRIMARY KEY,
    entity_type   VARCHAR(50) NOT NULL,
    entity_id     INT NOT NULL,
    attachment_id INT REFERENCES attachments(id) ON DELETE CASCADE,
    description   TEXT,
    is_required   BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_entity_attachments_entity     ON entity_attachments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_attachments_attachment  ON entity_attachments(attachment_id);

-- ============================================================
-- 15. PROCUREMENT PLANS (PPMP / APP)
-- ============================================================
CREATE TABLE IF NOT EXISTS procurementplans (
    id           SERIAL PRIMARY KEY,
    dept_id      INT REFERENCES departments(id) ON DELETE SET NULL,
    fiscal_year  INT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    status       VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','rejected','completed')),
    remarks      TEXT,
    total_amount DECIMAL(12,2) DEFAULT 0,
    created_by   INT REFERENCES users(id) ON DELETE SET NULL,
    approved_by  INT REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at  TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plans_dept   ON procurementplans(dept_id);
CREATE INDEX IF NOT EXISTS idx_plans_status ON procurementplans(status);
CREATE INDEX IF NOT EXISTS idx_plans_year   ON procurementplans(fiscal_year);

-- ============================================================
-- 16. PLAN ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS plan_items (
    id               SERIAL PRIMARY KEY,
    plan_id          INT REFERENCES procurementplans(id) ON DELETE CASCADE,
    item_code        VARCHAR(50) NOT NULL,
    item_name        VARCHAR(200) NOT NULL,
    item_description TEXT,
    unit             VARCHAR(50) NOT NULL,
    unit_price       DECIMAL(12,2) DEFAULT 0,
    category         VARCHAR(100),
    q1_qty INT DEFAULT 0, q1_status VARCHAR(20) DEFAULT 'pending',
    q2_qty INT DEFAULT 0, q2_status VARCHAR(20) DEFAULT 'pending',
    q3_qty INT DEFAULT 0, q3_status VARCHAR(20) DEFAULT 'pending',
    q4_qty INT DEFAULT 0, q4_status VARCHAR(20) DEFAULT 'pending',
    total_qty   INT GENERATED ALWAYS AS (
        COALESCE(q1_qty,0)+COALESCE(q2_qty,0)+COALESCE(q3_qty,0)+COALESCE(q4_qty,0)
    ) STORED,
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (
        (COALESCE(q1_qty,0)+COALESCE(q2_qty,0)+COALESCE(q3_qty,0)+COALESCE(q4_qty,0)) * unit_price
    ) STORED,
    remarks    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plan_items_plan ON plan_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_items_code ON plan_items(item_code);

-- ============================================================
-- 17. PURCHASE REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS purchaserequests (
    id           SERIAL PRIMARY KEY,
    pr_number    VARCHAR(50) UNIQUE NOT NULL,
    dept_id      INT REFERENCES departments(id) ON DELETE SET NULL,
    purpose      TEXT,
    total_amount DECIMAL(12,2) DEFAULT 0,
    status       VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','processed','cancelled')),
    requested_by INT REFERENCES users(id) ON DELETE SET NULL,
    approved_by  INT REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at  TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pr_number ON purchaserequests(pr_number);
CREATE INDEX IF NOT EXISTS idx_pr_dept   ON purchaserequests(dept_id);
CREATE INDEX IF NOT EXISTS idx_pr_status ON purchaserequests(status);

-- ============================================================
-- 18. PURCHASE REQUEST ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS pr_items (
    id               SERIAL PRIMARY KEY,
    pr_id            INT REFERENCES purchaserequests(id) ON DELETE CASCADE,
    item_code        VARCHAR(50) NOT NULL,
    item_name        VARCHAR(200) NOT NULL,
    item_description TEXT,
    unit             VARCHAR(50) NOT NULL,
    category         VARCHAR(100),
    quantity         INT NOT NULL DEFAULT 1,
    unit_price       DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_price      DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    remarks          TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pr_items_pr   ON pr_items(pr_id);
CREATE INDEX IF NOT EXISTS idx_pr_items_code ON pr_items(item_code);

-- ============================================================
-- 19. RFQ (Request for Quotation)
-- ============================================================
CREATE TABLE IF NOT EXISTS rfqs (
    id                   SERIAL PRIMARY KEY,
    rfq_number           VARCHAR(50) UNIQUE NOT NULL,
    pr_id                INT REFERENCES purchaserequests(id) ON DELETE SET NULL,
    date_prepared        DATE,
    submission_deadline  DATE,
    abc_amount           DECIMAL(12,2) DEFAULT 0,
    philgeps_required    BOOLEAN DEFAULT FALSE,
    philgeps_posted_from DATE,
    philgeps_posted_until DATE,
    status               VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','posted','closed','cancelled')),
    created_by           INT REFERENCES users(id) ON DELETE SET NULL,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rfqs_pr     ON rfqs(pr_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);

-- ============================================================
-- 20. RFQ ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS rfq_items (
    id               SERIAL PRIMARY KEY,
    rfq_id           INT REFERENCES rfqs(id) ON DELETE CASCADE,
    item_code        VARCHAR(50),
    item_name        VARCHAR(200) NOT NULL,
    item_description TEXT,
    unit             VARCHAR(50),
    category         VARCHAR(100),
    quantity         INT NOT NULL DEFAULT 1,
    abc_unit_cost    DECIMAL(12,2) NOT NULL DEFAULT 0,
    abc_total_cost   DECIMAL(12,2) GENERATED ALWAYS AS (quantity * abc_unit_cost) STORED,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rfq_items_rfq ON rfq_items(rfq_id);

-- ============================================================
-- 21. RFQ SUPPLIERS (invited suppliers per RFQ)
-- ============================================================
CREATE TABLE IF NOT EXISTS rfq_suppliers (
    id                   SERIAL PRIMARY KEY,
    rfq_id               INT REFERENCES rfqs(id) ON DELETE CASCADE,
    supplier_id          INT REFERENCES suppliers(id) ON DELETE SET NULL,
    invited_at           DATE,
    responded            BOOLEAN DEFAULT FALSE,
    response_received_at TIMESTAMP,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rfq_suppliers_rfq      ON rfq_suppliers(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_suppliers_supplier  ON rfq_suppliers(supplier_id);

-- ============================================================
-- 22. ABSTRACT OF QUOTATION (AOQ)
-- ============================================================
CREATE TABLE IF NOT EXISTS abstracts (
    id                       SERIAL PRIMARY KEY,
    abstract_number          VARCHAR(50) UNIQUE NOT NULL,
    rfq_id                   INT REFERENCES rfqs(id) ON DELETE SET NULL,
    date_prepared            DATE,
    purpose                  TEXT,
    status                   VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','cancelled')),
    recommended_supplier_id  INT REFERENCES suppliers(id) ON DELETE SET NULL,
    recommended_amount       DECIMAL(12,2) DEFAULT 0,
    created_by               INT REFERENCES users(id) ON DELETE SET NULL,
    created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_abstracts_rfq    ON abstracts(rfq_id);
CREATE INDEX IF NOT EXISTS idx_abstracts_status ON abstracts(status);

-- ============================================================
-- 23. ABSTRACT QUOTATIONS (bidder-level)
-- ============================================================
CREATE TABLE IF NOT EXISTS abstract_quotations (
    id            SERIAL PRIMARY KEY,
    abstract_id   INT REFERENCES abstracts(id) ON DELETE CASCADE,
    supplier_id   INT REFERENCES suppliers(id) ON DELETE SET NULL,
    bid_amount    DECIMAL(12,2) DEFAULT 0,
    is_compliant  BOOLEAN DEFAULT FALSE,
    remarks       TEXT,
    rank_no       INT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_abstract_quotes_abstract ON abstract_quotations(abstract_id);
CREATE INDEX IF NOT EXISTS idx_abstract_quotes_supplier ON abstract_quotations(supplier_id);

-- ============================================================
-- 24. ABSTRACT QUOTE ITEMS (per-supplier item pricing)
-- ============================================================
CREATE TABLE IF NOT EXISTS abstract_quote_items (
    id                     SERIAL PRIMARY KEY,
    abstract_quotation_id  INT REFERENCES abstract_quotations(id) ON DELETE CASCADE,
    item_description       TEXT NOT NULL,
    quantity               NUMERIC(14,2) DEFAULT 1,
    unit                   VARCHAR(50),
    unit_price             DECIMAL(12,2) DEFAULT 0,
    total_price            DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_abstract_quote_items_quote ON abstract_quote_items(abstract_quotation_id);

-- ============================================================
-- 25. POST-QUALIFICATION / TWG
-- ============================================================
CREATE TABLE IF NOT EXISTS post_qualifications (
    id                   SERIAL PRIMARY KEY,
    postqual_number      VARCHAR(50) UNIQUE NOT NULL,
    abstract_id          INT REFERENCES abstracts(id) ON DELETE SET NULL,
    bidder_name          VARCHAR(200),
    documents_verified   JSONB DEFAULT '{}'::jsonb,
    technical_compliance TEXT,
    financial_validation TEXT,
    twg_result           TEXT,
    findings             TEXT,
    status               VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','completed','cancelled')),
    created_by           INT REFERENCES users(id) ON DELETE SET NULL,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_postqual_abstract ON post_qualifications(abstract_id);

-- ============================================================
-- 26. BAC RESOLUTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS bac_resolutions (
    id                        SERIAL PRIMARY KEY,
    resolution_number         VARCHAR(50) UNIQUE NOT NULL,
    abstract_id               INT REFERENCES abstracts(id) ON DELETE SET NULL,
    resolution_date           DATE,
    procurement_mode          VARCHAR(30) DEFAULT 'SVP' CHECK (procurement_mode IN ('SVP','SVPDC','DC_SHOPPING','OTHERS')),
    abc_amount                DECIMAL(12,2) DEFAULT 0,
    recommended_supplier_id   INT REFERENCES suppliers(id) ON DELETE SET NULL,
    recommended_awardee_name  VARCHAR(255),
    bid_amount                DECIMAL(12,2) DEFAULT 0,
    philgeps_required         BOOLEAN DEFAULT FALSE,
    philgeps_posted_from      DATE,
    philgeps_posted_until     DATE,
    status                    VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','approved','rejected','cancelled')),
    created_by                INT REFERENCES users(id) ON DELETE SET NULL,
    approved_by               INT REFERENCES users(id) ON DELETE SET NULL,
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at               TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bacres_abstract ON bac_resolutions(abstract_id);
CREATE INDEX IF NOT EXISTS idx_bacres_status   ON bac_resolutions(status);

-- ============================================================
-- 27. NOTICES OF AWARD (NOA)
-- ============================================================
CREATE TABLE IF NOT EXISTS notices_of_award (
    id                  SERIAL PRIMARY KEY,
    noa_number          VARCHAR(50) UNIQUE NOT NULL,
    bac_resolution_id   INT REFERENCES bac_resolutions(id) ON DELETE SET NULL,
    supplier_id         INT REFERENCES suppliers(id) ON DELETE SET NULL,
    contract_amount     DECIMAL(12,2) DEFAULT 0,
    date_issued         DATE,
    bidder_receipt_date DATE,
    status              VARCHAR(20) DEFAULT 'issued' CHECK (status IN ('draft','issued','received','cancelled')),
    created_by          INT REFERENCES users(id) ON DELETE SET NULL,
    approved_by         INT REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_noa_bacres ON notices_of_award(bac_resolution_id);
CREATE INDEX IF NOT EXISTS idx_noa_status ON notices_of_award(status);

-- ============================================================
-- 28. PURCHASE ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS purchaseorders (
    id                      SERIAL PRIMARY KEY,
    po_number               VARCHAR(50) UNIQUE NOT NULL,
    pr_id                   INT REFERENCES purchaserequests(id) ON DELETE SET NULL,
    noa_id                  INT REFERENCES notices_of_award(id) ON DELETE SET NULL,
    supplier_id             INT REFERENCES suppliers(id) ON DELETE SET NULL,
    total_amount            DECIMAL(12,2) DEFAULT 0,

    -- Document status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','delivered','completed','cancelled')),

    -- Workflow status
    workflow_status VARCHAR(30) DEFAULT 'pending' CHECK (
        workflow_status IN (
            'pending','on_process','awaiting_delivery','for_payment',
            'paid_ada','for_signing','signed','submitted_to_coa','cancelled'
        )
    ),

    expected_delivery_date  DATE,
    delivery_date           DATE,
    delivery_address        TEXT,
    payment_terms           VARCHAR(100),
    po_date                 DATE,
    purpose                 TEXT,
    mode_of_procurement     VARCHAR(100),
    place_of_delivery       TEXT,

    -- Supplier acceptance
    accepted_at                     TIMESTAMP,
    accepted_by                     INT REFERENCES users(id) ON DELETE SET NULL,
    supplier_conforme_attachment_id INT REFERENCES attachments(id) ON DELETE SET NULL,

    -- Delivery
    delivered_at TIMESTAMP,
    delivered_by INT REFERENCES users(id) ON DELETE SET NULL,

    -- Payment
    payment_status   VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','for_payment','paid_ada')),
    payment_date     DATE,
    ada_reference_no VARCHAR(100),

    -- Audit
    created_by  INT REFERENCES users(id) ON DELETE SET NULL,
    approved_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_po_number          ON purchaseorders(po_number);
CREATE INDEX IF NOT EXISTS idx_po_supplier         ON purchaseorders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_status           ON purchaseorders(status);
CREATE INDEX IF NOT EXISTS idx_po_workflow_status   ON purchaseorders(workflow_status);
CREATE INDEX IF NOT EXISTS idx_po_pr               ON purchaseorders(pr_id);
CREATE INDEX IF NOT EXISTS idx_po_noa              ON purchaseorders(noa_id);

-- ============================================================
-- 29. PO ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS po_items (
    id               SERIAL PRIMARY KEY,
    po_id            INT REFERENCES purchaseorders(id) ON DELETE CASCADE,
    item_id          INT REFERENCES items(id) ON DELETE SET NULL,
    item_code        VARCHAR(50) NOT NULL,
    item_name        VARCHAR(200) NOT NULL,
    item_description TEXT,
    unit             VARCHAR(50) NOT NULL,
    uom              VARCHAR(50),
    category         VARCHAR(100),
    quantity         INT NOT NULL DEFAULT 1,
    unit_price       DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_price      DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    remarks          TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_po_items_po   ON po_items(po_id);
CREATE INDEX IF NOT EXISTS idx_po_items_code ON po_items(item_code);

-- ============================================================
-- 30. IARS (Inspection and Acceptance Report)
-- ============================================================
CREATE TABLE IF NOT EXISTS iars (
    id                      SERIAL PRIMARY KEY,
    iar_number              VARCHAR(50) UNIQUE NOT NULL,
    po_id                   INT REFERENCES purchaseorders(id) ON DELETE SET NULL,
    inspection_date         DATE,
    delivery_date           DATE,
    invoice_number          VARCHAR(80),
    invoice_date            DATE,
    delivery_receipt_number VARCHAR(80),
    inspection_result       VARCHAR(20) DEFAULT 'pending' CHECK (inspection_result IN ('pending','accepted','rejected','partial')),
    findings                TEXT,
    purpose                 TEXT,
    inspected_by            INT REFERENCES users(id) ON DELETE SET NULL,
    date_inspected          DATE,
    received_by             INT REFERENCES users(id) ON DELETE SET NULL,
    date_received           DATE,
    status                  VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','completed','cancelled')),
    created_by              INT REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_iars_po     ON iars(po_id);
CREATE INDEX IF NOT EXISTS idx_iars_status ON iars(status);

-- ============================================================
-- 31. IAR ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS iar_items (
    id                SERIAL PRIMARY KEY,
    iar_id            INT REFERENCES iars(id) ON DELETE CASCADE,
    item_id           INT REFERENCES items(id) ON DELETE SET NULL,
    item_code         VARCHAR(50),
    item_name         VARCHAR(200),
    quantity          INT NOT NULL DEFAULT 1,
    unit_cost         DECIMAL(12,2) DEFAULT 0,
    category          VARCHAR(100),
    brand             VARCHAR(100),
    model             VARCHAR(100),
    serial_no         VARCHAR(100),
    ppe_no            VARCHAR(100),
    inventory_no      VARCHAR(100),
    generated_item_id VARCHAR(50),
    remarks           TEXT,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_iar_items_iar  ON iar_items(iar_id);
CREATE INDEX IF NOT EXISTS idx_iar_items_item ON iar_items(item_id);

-- ============================================================
-- 32. STOCK CARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_cards (
    id                 SERIAL PRIMARY KEY,
    item_id            INT REFERENCES items(id) ON DELETE CASCADE,
    item_code          VARCHAR(50),
    item_name          VARCHAR(255),
    transaction_no     INT NOT NULL,
    date               DATE NOT NULL,
    reference          VARCHAR(255),
    receipt_qty        INT DEFAULT 0,
    receipt_unit_cost  DECIMAL(15,2) DEFAULT 0,
    receipt_total_cost DECIMAL(15,2) DEFAULT 0,
    issue_qty          INT DEFAULT 0,
    issue_unit_cost    DECIMAL(15,2) DEFAULT 0,
    issue_total_cost   DECIMAL(15,2) DEFAULT 0,
    balance_qty        INT DEFAULT 0,
    balance_unit_cost  DECIMAL(15,2) DEFAULT 0,
    balance_total_cost DECIMAL(15,2) DEFAULT 0,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sc_item ON stock_cards(item_id);
CREATE INDEX IF NOT EXISTS idx_sc_date ON stock_cards(date);

-- ============================================================
-- 33. SUPPLIES LEDGER CARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS supplies_ledger_cards (
    id                 SERIAL PRIMARY KEY,
    item_id            INT REFERENCES items(id) ON DELETE CASCADE,
    item_code          VARCHAR(50),
    item_name          VARCHAR(255),
    transaction_no     INT NOT NULL,
    date               DATE NOT NULL,
    reference          VARCHAR(255),
    receipt_qty        INT DEFAULT 0,
    receipt_unit_cost  DECIMAL(15,2) DEFAULT 0,
    receipt_total_cost DECIMAL(15,2) DEFAULT 0,
    issue_qty          INT DEFAULT 0,
    issue_unit_cost    DECIMAL(15,2) DEFAULT 0,
    issue_total_cost   DECIMAL(15,2) DEFAULT 0,
    balance_qty        INT DEFAULT 0,
    balance_unit_cost  DECIMAL(15,2) DEFAULT 0,
    balance_total_cost DECIMAL(15,2) DEFAULT 0,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_slc_item ON supplies_ledger_cards(item_id);
CREATE INDEX IF NOT EXISTS idx_slc_date ON supplies_ledger_cards(date);

-- ============================================================
-- 34. PROPERTY CARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS property_cards (
    id                    SERIAL PRIMARY KEY,
    property_number       VARCHAR(100),
    item_id               INT REFERENCES items(id) ON DELETE SET NULL,
    description           TEXT,
    acquisition_cost      DECIMAL(15,2) DEFAULT 0,
    acquisition_date      DATE,
    issued_to             VARCHAR(255),
    issued_to_employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    issued_date           DATE,
    received_date         DATE,
    ics_no                VARCHAR(100),
    status                VARCHAR(50) DEFAULT 'Active',
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pc_property ON property_cards(property_number);
CREATE INDEX IF NOT EXISTS idx_pc_item     ON property_cards(item_id);
CREATE INDEX IF NOT EXISTS idx_pc_employee ON property_cards(issued_to_employee_id);

-- ============================================================
-- 35. PROPERTY LEDGER CARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS property_ledger_cards (
    id                 SERIAL PRIMARY KEY,
    property_number    VARCHAR(100),
    description        TEXT,
    acquisition_date   DATE,
    acquisition_cost   DECIMAL(15,2) DEFAULT 0,
    transaction_no     INT NOT NULL,
    date               DATE NOT NULL,
    reference          VARCHAR(255),
    receipt_qty        INT DEFAULT 0,
    receipt_unit_cost  DECIMAL(15,2) DEFAULT 0,
    receipt_total_cost DECIMAL(15,2) DEFAULT 0,
    issue_qty          INT DEFAULT 0,
    issue_unit_cost    DECIMAL(15,2) DEFAULT 0,
    issue_total_cost   DECIMAL(15,2) DEFAULT 0,
    balance_qty        INT DEFAULT 0,
    balance_unit_cost  DECIMAL(15,2) DEFAULT 0,
    balance_total_cost DECIMAL(15,2) DEFAULT 0,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plc_property ON property_ledger_cards(property_number);

-- ============================================================
-- 36. INVENTORY CUSTODIAN SLIPS (ICS)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_custodian_slips (
    id                       SERIAL PRIMARY KEY,
    ics_no                   VARCHAR(100),
    date_of_issue            DATE,
    property_number          VARCHAR(100),
    description              TEXT,
    inventory_no             VARCHAR(100),
    ppe_no                   VARCHAR(100),
    issued_to                VARCHAR(255),
    issued_to_employee_id    INT REFERENCES employees(id) ON DELETE SET NULL,
    received_by_employee_id  INT REFERENCES employees(id) ON DELETE SET NULL,
    received_by_position     VARCHAR(255),
    other_info               TEXT,
    created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ics_no       ON inventory_custodian_slips(ics_no);
CREATE INDEX IF NOT EXISTS idx_ics_employee ON inventory_custodian_slips(issued_to_employee_id);

-- ============================================================
-- 37. RECEIVED SEMI-EXPENDABLE ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS received_semi_expendable_items (
    id                     SERIAL PRIMARY KEY,
    item_id                INT REFERENCES items(id) ON DELETE SET NULL,
    generated_item_id      VARCHAR(50),
    item_description       TEXT,
    inventory_no           VARCHAR(100),
    ics_no                 VARCHAR(100),
    ppe_no                 VARCHAR(100),
    serial_no              VARCHAR(100),
    issued_to              VARCHAR(255),
    issued_to_employee_id  INT REFERENCES employees(id) ON DELETE SET NULL,
    brand                  VARCHAR(100),
    model                  VARCHAR(100),
    status                 VARCHAR(50) DEFAULT 'Available' CHECK (status IN ('Available','Issued','For Repair','Unserviceable','Disposed')),
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rsei_item      ON received_semi_expendable_items(item_id);
CREATE INDEX IF NOT EXISTS idx_rsei_status    ON received_semi_expendable_items(status);
CREATE INDEX IF NOT EXISTS idx_rsei_ppe       ON received_semi_expendable_items(ppe_no);
CREATE INDEX IF NOT EXISTS idx_rsei_inventory ON received_semi_expendable_items(inventory_no);

-- ============================================================
-- 38. RECEIVED CAPITAL OUTLAY ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS received_capital_outlay_items (
    id                     SERIAL PRIMARY KEY,
    item_id                INT REFERENCES items(id) ON DELETE SET NULL,
    generated_item_id      VARCHAR(50),
    item_description       TEXT,
    ppe_no                 VARCHAR(100),
    serial_no              VARCHAR(100),
    issued_to              VARCHAR(255),
    issued_to_employee_id  INT REFERENCES employees(id) ON DELETE SET NULL,
    brand                  VARCHAR(100),
    model                  VARCHAR(100),
    status                 VARCHAR(50) DEFAULT 'Available' CHECK (status IN ('Available','Issued','For Repair','Unserviceable','Disposed')),
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rcoi_item   ON received_capital_outlay_items(item_id);
CREATE INDEX IF NOT EXISTS idx_rcoi_status ON received_capital_outlay_items(status);
CREATE INDEX IF NOT EXISTS idx_rcoi_ppe    ON received_capital_outlay_items(ppe_no);

-- ============================================================
-- 39. PROPERTY ACKNOWLEDGEMENT RECEIPTS (PAR)
-- ============================================================
CREATE TABLE IF NOT EXISTS property_acknowledgement_receipts (
    id                     SERIAL PRIMARY KEY,
    par_no                 VARCHAR(100) UNIQUE NOT NULL,
    ppe_no                 VARCHAR(100),
    description            TEXT,
    issued_to              VARCHAR(255),
    issued_to_employee_id  INT REFERENCES employees(id) ON DELETE SET NULL,
    date_of_issue          DATE NOT NULL,
    received_from_id       INT REFERENCES employees(id) ON DELETE SET NULL,
    received_from_position VARCHAR(255),
    received_by_id         INT REFERENCES employees(id) ON DELETE SET NULL,
    received_by_position   VARCHAR(255),
    other_info             TEXT,
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_par_no     ON property_acknowledgement_receipts(par_no);
CREATE INDEX IF NOT EXISTS idx_par_issued ON property_acknowledgement_receipts(issued_to_employee_id);

-- ============================================================
-- 40. PROPERTY TRANSFER REPORTS (PTR)
-- ============================================================
CREATE TABLE IF NOT EXISTS property_transfer_reports (
    id                            SERIAL PRIMARY KEY,
    ptr_no                        VARCHAR(100) UNIQUE NOT NULL,
    date                          DATE NOT NULL,
    from_accountable_officer_id   INT REFERENCES employees(id) ON DELETE SET NULL,
    from_accountable_officer_name VARCHAR(255),
    to_accountable_officer_id     INT REFERENCES employees(id) ON DELETE SET NULL,
    to_accountable_officer_name   VARCHAR(255),
    description                   TEXT,
    property_number               VARCHAR(100),
    acquisition_cost              DECIMAL(15,2),
    status                        VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending','Completed','Cancelled')),
    created_at                    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ptr_no   ON property_transfer_reports(ptr_no);
CREATE INDEX IF NOT EXISTS idx_ptr_from ON property_transfer_reports(from_accountable_officer_id);
CREATE INDEX IF NOT EXISTS idx_ptr_to   ON property_transfer_reports(to_accountable_officer_id);

-- ============================================================
-- 41. REQUISITION AND ISSUE SLIPS (RIS)
-- ============================================================
CREATE TABLE IF NOT EXISTS requisition_issue_slips (
    id                       SERIAL PRIMARY KEY,
    ris_no                   VARCHAR(100) UNIQUE NOT NULL,
    division                 VARCHAR(255),
    ris_date                 DATE NOT NULL,
    purpose                  TEXT,
    requested_by_id          INT REFERENCES employees(id) ON DELETE SET NULL,
    requested_by_name        VARCHAR(255),
    requested_by_designation VARCHAR(255),
    approved_by_id           INT REFERENCES employees(id) ON DELETE SET NULL,
    approved_by_name         VARCHAR(255),
    approved_by_designation  VARCHAR(255),
    issued_by_id             INT REFERENCES employees(id) ON DELETE SET NULL,
    issued_by_name           VARCHAR(255),
    issued_by_designation    VARCHAR(255),
    received_by_id           INT REFERENCES employees(id) ON DELETE SET NULL,
    received_by_name         VARCHAR(255),
    received_by_designation  VARCHAR(255),
    status                   VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','POSTED','CANCELLED')),
    created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ris_no     ON requisition_issue_slips(ris_no);
CREATE INDEX IF NOT EXISTS idx_ris_status ON requisition_issue_slips(status);
CREATE INDEX IF NOT EXISTS idx_ris_date   ON requisition_issue_slips(ris_date);

-- ============================================================
-- 42. RIS ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS ris_items (
    id          SERIAL PRIMARY KEY,
    ris_id      INT REFERENCES requisition_issue_slips(id) ON DELETE CASCADE,
    item_id     INT REFERENCES items(id) ON DELETE SET NULL,
    description VARCHAR(255),
    uom         VARCHAR(50),
    quantity    INT NOT NULL DEFAULT 0,
    unit_cost   DECIMAL(12,2) DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ris_items_ris  ON ris_items(ris_id);
CREATE INDEX IF NOT EXISTS idx_ris_items_item ON ris_items(item_id);

-- ============================================================
-- 43. TRIP TICKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS trip_tickets (
    id                       SERIAL PRIMARY KEY,
    trip_ticket_no           VARCHAR(100) UNIQUE NOT NULL,
    requesting_party         VARCHAR(255),
    date_of_request          DATE,
    date_of_travel           DATE,
    return_date              DATE,
    contact_no               VARCHAR(50),
    time_of_departure        VARCHAR(20),
    purpose                  TEXT,
    destination              TEXT,
    passengers               JSONB DEFAULT '[]'::jsonb,
    requested_by_employee    VARCHAR(255),
    requested_by_designation VARCHAR(255),
    approved_by_employee     VARCHAR(255),
    approved_by_designation  VARCHAR(255),
    status                   VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected','Completed','Cancelled')),
    created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trip_no     ON trip_tickets(trip_ticket_no);
CREATE INDEX IF NOT EXISTS idx_trip_status ON trip_tickets(status);

-- ============================================================
-- 44. PO PACKETS (Supporting Docs + Signing Gate)
-- ============================================================
CREATE TABLE IF NOT EXISTS po_packets (
    id                    SERIAL PRIMARY KEY,
    po_id                 INT UNIQUE REFERENCES purchaseorders(id) ON DELETE CASCADE,
    status                VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','for_signing','signed','submitted_to_coa','cancelled')),
    compiled_at           TIMESTAMP,
    compiled_by           INT REFERENCES users(id) ON DELETE SET NULL,
    chief_signed_at       TIMESTAMP,
    chief_signed_by       INT REFERENCES users(id) ON DELETE SET NULL,
    director_signed_at    TIMESTAMP,
    director_signed_by    INT REFERENCES users(id) ON DELETE SET NULL,
    packet_attachment_id  INT REFERENCES attachments(id) ON DELETE SET NULL,
    remarks               TEXT,
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_po_packets_status ON po_packets(status);

-- ============================================================
-- 45. COA SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS coa_submissions (
    id                       SERIAL PRIMARY KEY,
    submission_number        VARCHAR(50) UNIQUE NOT NULL,
    po_id                    INT REFERENCES purchaseorders(id) ON DELETE SET NULL,
    iar_id                   INT REFERENCES iars(id) ON DELETE SET NULL,
    po_packet_id             INT REFERENCES po_packets(id) ON DELETE SET NULL,
    submission_date          DATE,
    received_by_coa          VARCHAR(120),
    coa_receipt_date         DATE,
    status                   VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('draft','submitted','received','returned','completed','cancelled')),
    documents_included       JSONB DEFAULT '{}'::jsonb,
    coa_packet_attachment_id INT REFERENCES attachments(id) ON DELETE SET NULL,
    created_by               INT REFERENCES users(id) ON DELETE SET NULL,
    created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coa_po     ON coa_submissions(po_id);
CREATE INDEX IF NOT EXISTS idx_coa_status ON coa_submissions(status);

-- ============================================================
-- 46. SETTINGS / GLOBAL COUNTERS
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
    id         VARCHAR(100) PRIMARY KEY,
    data       JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 47. AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id         SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id  INT NOT NULL,
    action     VARCHAR(20) NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
    old_data   JSONB,
    new_data   JSONB,
    user_id    INT REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_user  ON audit_log(user_id);

-- ============================================================
-- VIEWS
-- ============================================================

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

-- ============================================================
-- END OF CONSOLIDATED SCHEMA
-- ============================================================
