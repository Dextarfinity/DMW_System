-- ============================================================
-- DMW Procurement System Database Schema
-- Version: 1.0.0
-- Date: February 2026
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

-- Insert DMW Divisions
INSERT INTO departments (name, code, description) VALUES
('Finance and Administrative Division', 'FAD', 'Handles finance, HR, and administrative matters'),
('Welfare Reintegration Services Division', 'WRSD', 'Provides welfare and reintegration services for OFWs'),
('Migrant Workers Protection Division', 'MWPD', 'Handles protection and legal assistance for migrant workers'),
('Migrant Workers Processing Division', 'MWProD', 'Processes documentation and deployment of migrant workers'),
('Office of Regional Director', 'ORD', 'Regional executive office')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    role VARCHAR(20) CHECK (role IN ('admin', 'manager', 'officer', 'viewer', 'auditor')) NOT NULL,
    dept_id INT REFERENCES departments(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_dept ON users(dept_id);

-- ============================================================
-- ITEMS TABLE (Reference Catalog Only - not FK linked)
-- Used as a lookup/reference for populating line items
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
-- PROCUREMENT PLANS TABLE (PPMP/APP) - One department has many plans
-- ============================================================
CREATE TABLE IF NOT EXISTS procurementplans (
    id SERIAL PRIMARY KEY,
    dept_id INT REFERENCES departments(id) ON DELETE SET NULL,
    fiscal_year INT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'completed')),
    remarks TEXT,
    total_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Audit fields
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    approved_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plans_dept ON procurementplans(dept_id);
CREATE INDEX IF NOT EXISTS idx_plans_status ON procurementplans(status);
CREATE INDEX IF NOT EXISTS idx_plans_year ON procurementplans(fiscal_year);

-- ============================================================
-- PROCUREMENT PLAN ITEMS TABLE - One plan has many items (1:N)
-- Item details embedded to avoid many-to-many with items catalog
-- ============================================================
CREATE TABLE IF NOT EXISTS plan_items (
    id SERIAL PRIMARY KEY,
    plan_id INT REFERENCES procurementplans(id) ON DELETE CASCADE,
    
    -- Embedded item details (denormalized for 1:N relationship)
    item_code VARCHAR(50) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    item_description TEXT,
    unit VARCHAR(50) NOT NULL,
    unit_price DECIMAL(12,2) DEFAULT 0,
    category VARCHAR(100),
    
    -- Quarterly quantities
    q1_qty INT DEFAULT 0,
    q1_status VARCHAR(20) DEFAULT 'pending',
    q2_qty INT DEFAULT 0,
    q2_status VARCHAR(20) DEFAULT 'pending',
    q3_qty INT DEFAULT 0,
    q3_status VARCHAR(20) DEFAULT 'pending',
    q4_qty INT DEFAULT 0,
    q4_status VARCHAR(20) DEFAULT 'pending',
    
    -- Computed totals
    total_qty INT GENERATED ALWAYS AS (COALESCE(q1_qty, 0) + COALESCE(q2_qty, 0) + COALESCE(q3_qty, 0) + COALESCE(q4_qty, 0)) STORED,
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (
        (COALESCE(q1_qty, 0) + COALESCE(q2_qty, 0) + COALESCE(q3_qty, 0) + COALESCE(q4_qty, 0)) * unit_price
    ) STORED,
    
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
-- PURCHASE REQUESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS purchaserequests (
    id SERIAL PRIMARY KEY,
    pr_number VARCHAR(50) UNIQUE NOT NULL,
    dept_id INT REFERENCES departments(id) ON DELETE SET NULL,
    purpose TEXT,
    total_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed', 'cancelled')),
    
    -- Audit fields
    requested_by INT REFERENCES users(id) ON DELETE SET NULL,
    approved_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pr_number ON purchaserequests(pr_number);
CREATE INDEX IF NOT EXISTS idx_pr_dept ON purchaserequests(dept_id);
CREATE INDEX IF NOT EXISTS idx_pr_status ON purchaserequests(status);

-- ============================================================
-- PURCHASE REQUEST ITEMS TABLE - One PR has many items (1:N)
-- Item details embedded to avoid many-to-many with items catalog
-- ============================================================
CREATE TABLE IF NOT EXISTS pr_items (
    id SERIAL PRIMARY KEY,
    pr_id INT REFERENCES purchaserequests(id) ON DELETE CASCADE,
    
    -- Embedded item details (denormalized for 1:N relationship)
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
-- PURCHASE ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS purchaseorders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    pr_id INT REFERENCES purchaserequests(id) ON DELETE SET NULL,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    total_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'delivered', 'completed', 'cancelled')),
    delivery_date DATE,
    
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

-- ============================================================
-- PURCHASE ORDER ITEMS TABLE - One PO has many items (1:N)
-- Item details embedded to avoid many-to-many with items catalog
-- ============================================================
CREATE TABLE IF NOT EXISTS po_items (
    id SERIAL PRIMARY KEY,
    po_id INT REFERENCES purchaseorders(id) ON DELETE CASCADE,
    
    -- Embedded item details (denormalized for 1:N relationship)
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
-- AUDIT LOG TABLE (for tracking changes)
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
-- ============================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dmw_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dmw_app;

-- ============================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================

-- Insert sample admin user (password: admin123)
-- Password hash generated with bcrypt (10 rounds)
INSERT INTO users (username, password_hash, full_name, role, dept_id) VALUES
('admin', '$2b$10$rIC/P7aVr1.bnKxHQ9HQxOYJhGxHGxZ.xXHZx0V7Uj1QHxz7z3x7K', 'System Administrator', 'admin', 1)
ON CONFLICT (username) DO NOTHING;

-- Insert sample items
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
