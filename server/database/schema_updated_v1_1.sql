-- ============================================================
-- DMW Procurement System Database Schema
-- Version: 1.1.0
-- Date: February 2026
-- Notes:
--  - Adds RFQ, Abstract of Quotation (AOQ), BAC Resolution, NOA, IAR, PO Packet/Signing, COA Submission, Attachments.
--  - Adds workflow statuses required by the updated UI (On Process → Awaiting Delivery → For Payment → Paid ADA).
-- ============================================================

-- Create database (run this separately in psql as postgres user)
-- CREATE DATABASE dmw_procurement;
-- CREATE USER dmw_app WITH PASSWORD 'SecurePass2026#DMW';
-- GRANT ALL PRIVILEGES ON DATABASE dmw_procurement TO dmw_app;
-- Connect to the database first: \c dmw_procurement

-- ============================================================
-- DEPARTMENTS TABLE (5 Divisions)
-- ============================================================

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
  ('Migrant Workers Protection Division', 'MWPD', 'Handles protection and legal assistance for migrant workers'),
  ('Migrant Workers Processing Division', 'MWProD', 'Processes documentation and deployment of migrant workers'),
  ('Office of Regional Director', 'ORD', 'Regional executive office')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- USERS TABLE
-- NOTE: Expanded roles to match the frontend roles.
-- ============================================================

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
      'viewer'
    )
  ),
  dept_id INT REFERENCES departments(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_dept ON users(dept_id);

-- ============================================================
-- ATTACHMENTS (generic file storage metadata)
-- ============================================================

CREATE TABLE IF NOT EXISTS attachments (
  id SERIAL PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255),
  mime_type VARCHAR(120),
  file_size_bytes BIGINT DEFAULT 0,
  storage_path TEXT,              -- path or URL depending on your storage strategy
  checksum_sha256 VARCHAR(64),
  uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);

-- Link attachments to any record (PR/RFQ/AOQ/BAC/NOA/PO/IAR/COA/etc.)
CREATE TABLE IF NOT EXISTS entity_attachments (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL, -- e.g., 'purchaserequests', 'rfqs', 'abstracts', 'bac_resolutions', 'purchaseorders', 'iars', 'coa_submissions', 'po_packets'
  entity_id INT NOT NULL,
  attachment_id INT REFERENCES attachments(id) ON DELETE CASCADE,
  description TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_entity_attachments_entity ON entity_attachments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_attachments_attachment ON entity_attachments(attachment_id);

-- ============================================================
-- ITEMS TABLE (Reference Catalog Only - not FK linked)
-- ============================================================

CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  unit VARCHAR(50) NOT NULL,
  unit_price DECIMAL(12,2) DEFAULT 0,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_items_code ON items(code);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);

-- ============================================================
-- PROCUREMENT PLANS (PPMP/APP)
-- ============================================================

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

-- ============================================================
-- SUPPLIERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(100),
  address TEXT,
  tin VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- ============================================================
-- PURCHASE REQUESTS
-- ============================================================

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

-- ============================================================
-- RFQ (Request for Quotation)
-- Captures PhilGEPS posting details when applicable.
-- ============================================================

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

-- ============================================================
-- ABSTRACT OF QUOTATION (AOQ)
-- Stores bidder comparisons + recommendation.
-- ============================================================

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

-- Optional per-item pricing per supplier
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

-- ============================================================
-- POST-QUALIFICATION (optional)
-- ============================================================

CREATE TABLE IF NOT EXISTS post_qualifications (
  id SERIAL PRIMARY KEY,
  postqual_number VARCHAR(50) UNIQUE NOT NULL,
  abstract_id INT REFERENCES abstracts(id) ON DELETE SET NULL,
  bidder_name VARCHAR(200),
  documents_verified JSONB DEFAULT '{}'::jsonb,
  findings TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'cancelled')),
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_postqual_abstract ON post_qualifications(abstract_id);

-- ============================================================
-- BAC RESOLUTION
-- Includes PhilGEPS posting fields as reflected in BAC resolutions.
-- ============================================================

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

-- ============================================================
-- NOTICE OF AWARD (NOA)
-- ============================================================

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

-- ============================================================
-- PURCHASE ORDERS
-- Adds workflow_status + acceptance/delivery/payment fields for the updated UI.
-- ============================================================

CREATE TABLE IF NOT EXISTS purchaseorders (
  id SERIAL PRIMARY KEY,
  po_number VARCHAR(50) UNIQUE NOT NULL,
  pr_id INT REFERENCES purchaserequests(id) ON DELETE SET NULL,
  noa_id INT REFERENCES notices_of_award(id) ON DELETE SET NULL,
  supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
  total_amount DECIMAL(12,2) DEFAULT 0,

  -- Document status (kept simple)
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'delivered', 'completed', 'cancelled')),

  -- UI/Case workflow status (required by updated process)
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
  delivery_address TEXT,
  payment_terms VARCHAR(100),

  -- Supplier acceptance (PO accepted)
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

-- ============================================================
-- IAR (Inspection and Acceptance Report)
-- ============================================================

CREATE TABLE IF NOT EXISTS iars (
  id SERIAL PRIMARY KEY,
  iar_number VARCHAR(50) UNIQUE NOT NULL,
  po_id INT REFERENCES purchaseorders(id) ON DELETE SET NULL,

  inspection_date DATE,
  delivery_date DATE,
  invoice_number VARCHAR(80),
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

-- ============================================================
-- PO PACKET (Supporting Docs) + Signing Gate (Chief + Director)
-- Required before COA submission per updated process.
-- ============================================================

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

  packet_attachment_id INT REFERENCES attachments(id) ON DELETE SET NULL, -- optional merged/scanned packet PDF
  remarks TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_po_packets_status ON po_packets(status);

-- ============================================================
-- COA SUBMISSION
-- Links to PO + IAR + PO Packet.
-- ============================================================

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

-- ============================================================
-- AUDIT LOG
-- ============================================================

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

-- ============================================================
-- GRANT PERMISSIONS TO APP USER
-- (Commented out - using postgres user directly)
-- ============================================================

-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dmw_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dmw_app;

-- ============================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================

INSERT INTO users (username, password_hash, full_name, role, dept_id) VALUES
  ('admin', '$2b$10$rIC/P7aVr1.bnKxHQ9HQxOYJhGxHGxZ.xXHZx0V7Uj1QHxz7z3x7K', 'System Administrator', 'admin', 1)
ON CONFLICT (username) DO NOTHING;

INSERT INTO items (code, name, description, unit, unit_price, category) VALUES
  ('IT-001', 'Desktop Computer', 'Standard office desktop computer', 'unit', 35000.00, 'IT Equipment'),
  ('IT-002', 'Laptop Computer', 'Standard office laptop', 'unit', 45000.00, 'IT Equipment'),
  ('IT-003', 'Printer (Laser)', 'Laser printer for office use', 'unit', 15000.00, 'IT Equipment'),
  ('OF-001', 'Bond Paper A4', 'A4 size bond paper, 500 sheets', 'ream', 250.00, 'Office Supplies'),
  ('OF-002', 'Ballpen (Blue)', 'Blue ballpoint pen', 'box', 150.00, 'Office Supplies'),
  ('OF-003', 'Folder (Long)', 'Long folder, kraft', 'bundle', 120.00, 'Office Supplies'),
  ('FN-001', 'Office Chair', 'Executive office chair', 'unit', 5500.00, 'Furniture'),
  ('FN-002', 'Office Desk', 'Standard office desk', 'unit', 8000.00, 'Furniture')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
