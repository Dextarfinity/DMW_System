-- =============================================================================
-- SCHEMA PATCH: Missing columns + APP→PR bridge table
-- Run this against your PostgreSQL database if the server migrations haven't
-- run yet, or if you need to apply the changes manually.
-- Safe to run multiple times (all statements use IF NOT EXISTS / IF EXISTS).
-- =============================================================================

BEGIN;

-- ── purchaserequests: signatory columns ──────────────────────────────────────
ALTER TABLE purchaserequests ADD COLUMN IF NOT EXISTS requested_by_id   INTEGER;
ALTER TABLE purchaserequests ADD COLUMN IF NOT EXISTS requested_by_name TEXT;
ALTER TABLE purchaserequests ADD COLUMN IF NOT EXISTS approved_by_id    INTEGER;
ALTER TABLE purchaserequests ADD COLUMN IF NOT EXISTS approved_by_name  TEXT;

-- ── rfqs: signatory columns ───────────────────────────────────────────────────
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS bac_sec_id    INTEGER;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS bac_sec_name  TEXT;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS bac_chair_id  INTEGER;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS bac_chair_name TEXT;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS noted_by_id   INTEGER;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS noted_by_name TEXT;

-- ── notices_of_award: default status ─────────────────────────────────────────
ALTER TABLE notices_of_award ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'awaiting_noa';

-- =============================================================================
-- APP ITEMS → PURCHASE REQUEST  (many-to-many bridge)
-- One Purchase Request can be based on many APP/PPMP plan items.
-- One APP plan item can be referenced by many Purchase Requests.
-- =============================================================================
CREATE TABLE IF NOT EXISTS app_item_pr_links (
    id           SERIAL PRIMARY KEY,
    plan_item_id INTEGER NOT NULL,
    pr_id        INTEGER NOT NULL
                     REFERENCES purchaserequests(id) ON DELETE CASCADE,
    linked_by    INTEGER,
    linked_at    TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_app_item_pr UNIQUE (plan_item_id, pr_id)
);

CREATE INDEX IF NOT EXISTS idx_aipl_plan_item ON app_item_pr_links(plan_item_id);
CREATE INDEX IF NOT EXISTS idx_aipl_pr        ON app_item_pr_links(pr_id);

COMMENT ON TABLE app_item_pr_links IS
  'Bridge: one or many APP/PPMP plan items can be linked to one Purchase Request, '
  'and one plan item can span multiple Purchase Requests (e.g. split lots).';

-- =============================================================================
-- PURCHASE REQUEST → RFQ  (many-to-many bridge)
-- One RFQ can consolidate many PRs; one PR can appear in many RFQs.
-- =============================================================================
CREATE TABLE IF NOT EXISTS pr_rfq_links (
    id        SERIAL PRIMARY KEY,
    pr_id     INTEGER NOT NULL
                  REFERENCES purchaserequests(id) ON DELETE CASCADE,
    rfq_id    INTEGER NOT NULL
                  REFERENCES rfqs(id) ON DELETE CASCADE,
    linked_by INTEGER,
    linked_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_pr_rfq UNIQUE (pr_id, rfq_id)
);

CREATE INDEX IF NOT EXISTS idx_prrl_pr  ON pr_rfq_links(pr_id);
CREATE INDEX IF NOT EXISTS idx_prrl_rfq ON pr_rfq_links(rfq_id);

COMMENT ON TABLE pr_rfq_links IS
  'Bridge: one RFQ can consolidate many Purchase Requests; '
  'one PR can be split across many RFQs.';

-- Back-fill pr_rfq_links from existing rfqs.pr_id (preserves existing data)
INSERT INTO pr_rfq_links (pr_id, rfq_id)
SELECT pr_id, id FROM rfqs WHERE pr_id IS NOT NULL
ON CONFLICT (pr_id, rfq_id) DO NOTHING;

COMMIT;
