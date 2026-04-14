-- Migration: Add BAC member signatories to abstracts table
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS vice_chairperson_id INTEGER REFERENCES employees(id);
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS bac_member1_id INTEGER REFERENCES employees(id);
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS bac_member2_id INTEGER REFERENCES employees(id);
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS bac_member3_id INTEGER REFERENCES employees(id);
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS bac_secretariat_id INTEGER REFERENCES employees(id);
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS bac_chairperson_id INTEGER REFERENCES employees(id);
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS regional_director_id INTEGER REFERENCES employees(id);
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS bac_secretariat2_id INTEGER REFERENCES employees(id);

-- Add supplier details columns to rfqs table for manual supplier entry
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS manual_supplier_name TEXT;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS manual_supplier_address TEXT;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS manual_supplier_tin TEXT;

-- Add missing columns to bac_resolutions for subject, description, bidders, and BAC members
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS bidders JSONB DEFAULT '[]';
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS bac_chairperson_id INTEGER REFERENCES employees(id);
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS bac_vice_chairperson_id INTEGER REFERENCES employees(id);
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS bac_member1_id INTEGER REFERENCES employees(id);
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS bac_member2_id INTEGER REFERENCES employees(id);
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS bac_member3_id INTEGER REFERENCES employees(id);
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS hope_id INTEGER REFERENCES employees(id);

-- Add consolidation tracking to app_settings
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS consolidated_at TIMESTAMP;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS consolidated_count INTEGER DEFAULT 0;
