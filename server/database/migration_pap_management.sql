-- ============================================================
-- PAP (Programs, Activities & Projects) Management Tables
-- Migration: Creates paps + pap_items tables for proper PAP
-- entity management similar to reference system
-- Date: March 2, 2026
-- ============================================================

-- ============================================================
-- 1. PAPs (Parent entity for Programs, Activities & Projects)
-- ============================================================
CREATE TABLE IF NOT EXISTS paps (
    id                  SERIAL PRIMARY KEY,
    pap_code            VARCHAR(50) UNIQUE,
    pap_name            VARCHAR(255) NOT NULL,
    description         TEXT,
    dept_id             INT REFERENCES departments(id) ON DELETE SET NULL,
    fiscal_year         INT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    estimated_budget    DECIMAL(12,2) DEFAULT 0,
    account_code        VARCHAR(50),
    quarter             INT DEFAULT 0,
    mop                 VARCHAR(100),
    centralize          BOOLEAN DEFAULT FALSE,
    -- Period months (Jan-Dec checkboxes)
    period_jan          BOOLEAN DEFAULT FALSE,
    period_feb          BOOLEAN DEFAULT FALSE,
    period_mar          BOOLEAN DEFAULT FALSE,
    period_apr          BOOLEAN DEFAULT FALSE,
    period_may          BOOLEAN DEFAULT FALSE,
    period_jun          BOOLEAN DEFAULT FALSE,
    period_jul          BOOLEAN DEFAULT FALSE,
    period_aug          BOOLEAN DEFAULT FALSE,
    period_sep          BOOLEAN DEFAULT FALSE,
    period_oct          BOOLEAN DEFAULT FALSE,
    period_nov          BOOLEAN DEFAULT FALSE,
    period_dec          BOOLEAN DEFAULT FALSE,
    -- Metadata
    status              VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','completed','cancelled')),
    created_by          INT REFERENCES users(id) ON DELETE SET NULL,
    is_deleted          BOOLEAN DEFAULT FALSE,
    deleted_at          TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_paps_dept ON paps(dept_id);
CREATE INDEX IF NOT EXISTS idx_paps_fiscal_year ON paps(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_paps_status ON paps(status);
CREATE INDEX IF NOT EXISTS idx_paps_code ON paps(pap_code);

-- ============================================================
-- 2. PAP ITEMS (Child items under each PAP)
-- ============================================================
CREATE TABLE IF NOT EXISTS pap_items (
    id                  SERIAL PRIMARY KEY,
    pap_id              INT NOT NULL REFERENCES paps(id) ON DELETE CASCADE,
    item_id             INT REFERENCES items(id) ON DELETE SET NULL,
    item_code           VARCHAR(50),
    product_category    VARCHAR(100),
    account_code        VARCHAR(50),
    product_description TEXT,
    available_at        VARCHAR(100),
    quantity            DECIMAL(12,2) DEFAULT 0,
    uom                 VARCHAR(50),
    unit_price          DECIMAL(12,2) DEFAULT 0,
    total_amount        DECIMAL(12,2) DEFAULT 0,
    procurement_source  VARCHAR(20) DEFAULT 'NON PS-DBM',
    remarks             TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pap_items_pap ON pap_items(pap_id);
CREATE INDEX IF NOT EXISTS idx_pap_items_item ON pap_items(item_id);

-- ============================================================
-- 3. Link PAPs to PPMP entries (optional FK)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'procurementplans' AND column_name = 'pap_id') THEN
        ALTER TABLE procurementplans ADD COLUMN pap_id INT REFERENCES paps(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_plans_pap ON procurementplans(pap_id);
    END IF;
END $$;

-- Done
SELECT 'PAP management tables created successfully' AS status;
