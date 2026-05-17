-- =============================================================================
-- MIGRATION: One-to-Many Joint Tables for the Full Procurement Chain
-- =============================================================================
-- Current state (one-to-one FK columns):
--   rfqs.pr_id                     → purchaserequests
--   abstracts.rfq_id               → rfqs
--   bac_resolutions.abstract_id    → abstracts
--   post_qualifications.abstract_id → abstracts
--   notices_of_award.bac_resolution_id + notices_of_award.rfq_id → bac_resolutions + rfqs
--   purchaseorders.pr_id + purchaseorders.noa_id → purchaserequests + notices_of_award
--   iars.po_id                     → purchaseorders
--
-- Goal: Add joint (bridge) tables so each step can link to MANY records of the
--       preceding step, while keeping existing FK columns for backward-compatibility.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. PR → RFQ  (one PR can spawn many RFQs, one RFQ can reference many PRs)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pr_rfq_links (
    id                  SERIAL PRIMARY KEY,
    pr_id               INTEGER NOT NULL
                            REFERENCES purchaserequests(id) ON DELETE CASCADE,
    rfq_id              INTEGER NOT NULL
                            REFERENCES rfqs(id) ON DELETE CASCADE,
    linked_at           TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    linked_by           INTEGER REFERENCES users(id),
    notes               TEXT,
    CONSTRAINT uq_pr_rfq UNIQUE (pr_id, rfq_id)
);

CREATE INDEX IF NOT EXISTS idx_pr_rfq_links_pr  ON pr_rfq_links(pr_id);
CREATE INDEX IF NOT EXISTS idx_pr_rfq_links_rfq ON pr_rfq_links(rfq_id);

-- Back-fill from existing rfqs.pr_id so no data is lost
INSERT INTO pr_rfq_links (pr_id, rfq_id)
SELECT pr_id, id
FROM   rfqs
WHERE  pr_id IS NOT NULL
ON CONFLICT (pr_id, rfq_id) DO NOTHING;

COMMENT ON TABLE pr_rfq_links IS
  'Bridge: one Purchase Request can generate many RFQs; one RFQ can cover many PRs.';

-- ---------------------------------------------------------------------------
-- 2. RFQ → Abstract of Quotation
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rfq_abstract_links (
    id                  SERIAL PRIMARY KEY,
    rfq_id              INTEGER NOT NULL
                            REFERENCES rfqs(id) ON DELETE CASCADE,
    abstract_id         INTEGER NOT NULL
                            REFERENCES abstracts(id) ON DELETE CASCADE,
    linked_at           TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    linked_by           INTEGER REFERENCES users(id),
    notes               TEXT,
    CONSTRAINT uq_rfq_abstract UNIQUE (rfq_id, abstract_id)
);

CREATE INDEX IF NOT EXISTS idx_rfq_abstract_links_rfq      ON rfq_abstract_links(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_abstract_links_abstract ON rfq_abstract_links(abstract_id);

-- Back-fill from existing abstracts.rfq_id
INSERT INTO rfq_abstract_links (rfq_id, abstract_id)
SELECT rfq_id, id
FROM   abstracts
WHERE  rfq_id IS NOT NULL
ON CONFLICT (rfq_id, abstract_id) DO NOTHING;

COMMENT ON TABLE rfq_abstract_links IS
  'Bridge: one RFQ can produce many Abstracts of Quotation; one Abstract can consolidate many RFQs.';

-- ---------------------------------------------------------------------------
-- 3. Abstract of Quotation → BAC Resolution
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS abstract_bac_resolution_links (
    id                  SERIAL PRIMARY KEY,
    abstract_id         INTEGER NOT NULL
                            REFERENCES abstracts(id) ON DELETE CASCADE,
    bac_resolution_id   INTEGER NOT NULL
                            REFERENCES bac_resolutions(id) ON DELETE CASCADE,
    linked_at           TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    linked_by           INTEGER REFERENCES users(id),
    notes               TEXT,
    CONSTRAINT uq_abstract_bac_reso UNIQUE (abstract_id, bac_resolution_id)
);

CREATE INDEX IF NOT EXISTS idx_abrl_abstract    ON abstract_bac_resolution_links(abstract_id);
CREATE INDEX IF NOT EXISTS idx_abrl_bac_reso    ON abstract_bac_resolution_links(bac_resolution_id);

-- Back-fill from existing bac_resolutions.abstract_id
INSERT INTO abstract_bac_resolution_links (abstract_id, bac_resolution_id)
SELECT abstract_id, id
FROM   bac_resolutions
WHERE  abstract_id IS NOT NULL
ON CONFLICT (abstract_id, bac_resolution_id) DO NOTHING;

COMMENT ON TABLE abstract_bac_resolution_links IS
  'Bridge: one Abstract can result in many BAC Resolutions; one BAC Resolution can cover many Abstracts.';

-- ---------------------------------------------------------------------------
-- 4. BAC Resolution → Post-Qualification  (and TWG evaluation)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bac_resolution_postqual_links (
    id                  SERIAL PRIMARY KEY,
    bac_resolution_id   INTEGER NOT NULL
                            REFERENCES bac_resolutions(id) ON DELETE CASCADE,
    post_qualification_id INTEGER NOT NULL
                            REFERENCES post_qualifications(id) ON DELETE CASCADE,
    linked_at           TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    linked_by           INTEGER REFERENCES users(id),
    notes               TEXT,
    CONSTRAINT uq_bac_reso_postqual UNIQUE (bac_resolution_id, post_qualification_id)
);

CREATE INDEX IF NOT EXISTS idx_brpql_bac_reso   ON bac_resolution_postqual_links(bac_resolution_id);
CREATE INDEX IF NOT EXISTS idx_brpql_postqual   ON bac_resolution_postqual_links(post_qualification_id);

-- Back-fill: post_qualifications.abstract_id → resolve bac_resolution via abstract_bac_resolution_links
INSERT INTO bac_resolution_postqual_links (bac_resolution_id, post_qualification_id)
SELECT DISTINCT abrl.bac_resolution_id, pq.id
FROM   post_qualifications pq
JOIN   abstract_bac_resolution_links abrl ON abrl.abstract_id = pq.abstract_id
ON CONFLICT (bac_resolution_id, post_qualification_id) DO NOTHING;

-- Also add direct abstract_id → post_qualification bridge for completeness
CREATE TABLE IF NOT EXISTS abstract_postqual_links (
    id                  SERIAL PRIMARY KEY,
    abstract_id         INTEGER NOT NULL
                            REFERENCES abstracts(id) ON DELETE CASCADE,
    post_qualification_id INTEGER NOT NULL
                            REFERENCES post_qualifications(id) ON DELETE CASCADE,
    linked_at           TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    linked_by           INTEGER REFERENCES users(id),
    notes               TEXT,
    CONSTRAINT uq_abstract_postqual UNIQUE (abstract_id, post_qualification_id)
);

CREATE INDEX IF NOT EXISTS idx_apql_abstract    ON abstract_postqual_links(abstract_id);
CREATE INDEX IF NOT EXISTS idx_apql_postqual    ON abstract_postqual_links(post_qualification_id);

INSERT INTO abstract_postqual_links (abstract_id, post_qualification_id)
SELECT abstract_id, id
FROM   post_qualifications
WHERE  abstract_id IS NOT NULL
ON CONFLICT (abstract_id, post_qualification_id) DO NOTHING;

COMMENT ON TABLE abstract_postqual_links IS
  'Bridge: one Abstract can trigger many Post-Qualification / TWG evaluations.';
COMMENT ON TABLE bac_resolution_postqual_links IS
  'Bridge: one BAC Resolution can reference many Post-Qualifications.';

-- ---------------------------------------------------------------------------
-- 5. Post-Qualification → Notice of Award
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS postqual_noa_links (
    id                      SERIAL PRIMARY KEY,
    post_qualification_id   INTEGER NOT NULL
                                REFERENCES post_qualifications(id) ON DELETE CASCADE,
    noa_id                  INTEGER NOT NULL
                                REFERENCES notices_of_award(id) ON DELETE CASCADE,
    linked_at               TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    linked_by               INTEGER REFERENCES users(id),
    notes                   TEXT,
    CONSTRAINT uq_postqual_noa UNIQUE (post_qualification_id, noa_id)
);

CREATE INDEX IF NOT EXISTS idx_pqnl_postqual ON postqual_noa_links(post_qualification_id);
CREATE INDEX IF NOT EXISTS idx_pqnl_noa      ON postqual_noa_links(noa_id);

COMMENT ON TABLE postqual_noa_links IS
  'Bridge: one Post-Qualification can lead to many NOAs (e.g. partial awards per lot).';

-- Also bridge BAC Resolution → NOA directly (existing relationship)
CREATE TABLE IF NOT EXISTS bac_resolution_noa_links (
    id                  SERIAL PRIMARY KEY,
    bac_resolution_id   INTEGER NOT NULL
                            REFERENCES bac_resolutions(id) ON DELETE CASCADE,
    noa_id              INTEGER NOT NULL
                            REFERENCES notices_of_award(id) ON DELETE CASCADE,
    linked_at           TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    linked_by           INTEGER REFERENCES users(id),
    notes               TEXT,
    CONSTRAINT uq_bac_reso_noa UNIQUE (bac_resolution_id, noa_id)
);

CREATE INDEX IF NOT EXISTS idx_brnl_bac_reso ON bac_resolution_noa_links(bac_resolution_id);
CREATE INDEX IF NOT EXISTS idx_brnl_noa      ON bac_resolution_noa_links(noa_id);

-- Back-fill from existing notices_of_award.bac_resolution_id
INSERT INTO bac_resolution_noa_links (bac_resolution_id, noa_id)
SELECT bac_resolution_id, id
FROM   notices_of_award
WHERE  bac_resolution_id IS NOT NULL
ON CONFLICT (bac_resolution_id, noa_id) DO NOTHING;

COMMENT ON TABLE bac_resolution_noa_links IS
  'Bridge: one BAC Resolution can issue many NOAs (multi-lot or partial awards).';

-- ---------------------------------------------------------------------------
-- 6. NOA → Purchase Order
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS noa_po_links (
    id          SERIAL PRIMARY KEY,
    noa_id      INTEGER NOT NULL
                    REFERENCES notices_of_award(id) ON DELETE CASCADE,
    po_id       INTEGER NOT NULL
                    REFERENCES purchaseorders(id) ON DELETE CASCADE,
    linked_at   TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    linked_by   INTEGER REFERENCES users(id),
    notes       TEXT,
    CONSTRAINT uq_noa_po UNIQUE (noa_id, po_id)
);

CREATE INDEX IF NOT EXISTS idx_noa_po_links_noa ON noa_po_links(noa_id);
CREATE INDEX IF NOT EXISTS idx_noa_po_links_po  ON noa_po_links(po_id);

-- Back-fill from existing purchaseorders.noa_id
INSERT INTO noa_po_links (noa_id, po_id)
SELECT noa_id, id
FROM   purchaseorders
WHERE  noa_id IS NOT NULL
ON CONFLICT (noa_id, po_id) DO NOTHING;

COMMENT ON TABLE noa_po_links IS
  'Bridge: one NOA can generate many Purchase Orders (e.g. phased deliveries, partial lots).';

-- Also bridge PR → PO (existing purchaseorders.pr_id relationship)
CREATE TABLE IF NOT EXISTS pr_po_links (
    id          SERIAL PRIMARY KEY,
    pr_id       INTEGER NOT NULL
                    REFERENCES purchaserequests(id) ON DELETE CASCADE,
    po_id       INTEGER NOT NULL
                    REFERENCES purchaseorders(id) ON DELETE CASCADE,
    linked_at   TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    linked_by   INTEGER REFERENCES users(id),
    notes       TEXT,
    CONSTRAINT uq_pr_po UNIQUE (pr_id, po_id)
);

CREATE INDEX IF NOT EXISTS idx_pr_po_links_pr ON pr_po_links(pr_id);
CREATE INDEX IF NOT EXISTS idx_pr_po_links_po ON pr_po_links(po_id);

INSERT INTO pr_po_links (pr_id, po_id)
SELECT pr_id, id
FROM   purchaseorders
WHERE  pr_id IS NOT NULL
ON CONFLICT (pr_id, po_id) DO NOTHING;

COMMENT ON TABLE pr_po_links IS
  'Bridge: one PR can be fulfilled by many POs; one PO can consolidate many PRs.';

-- ---------------------------------------------------------------------------
-- 7. PO → IAR  (one PO can have many partial-delivery IARs)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS po_iar_links (
    id          SERIAL PRIMARY KEY,
    po_id       INTEGER NOT NULL
                    REFERENCES purchaseorders(id) ON DELETE CASCADE,
    iar_id      INTEGER NOT NULL
                    REFERENCES iars(id) ON DELETE CASCADE,
    linked_at   TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    linked_by   INTEGER REFERENCES users(id),
    notes       TEXT,
    CONSTRAINT uq_po_iar UNIQUE (po_id, iar_id)
);

CREATE INDEX IF NOT EXISTS idx_po_iar_links_po  ON po_iar_links(po_id);
CREATE INDEX IF NOT EXISTS idx_po_iar_links_iar ON po_iar_links(iar_id);

-- Back-fill from existing iars.po_id
INSERT INTO po_iar_links (po_id, iar_id)
SELECT po_id, id
FROM   iars
WHERE  po_id IS NOT NULL
ON CONFLICT (po_id, iar_id) DO NOTHING;

COMMENT ON TABLE po_iar_links IS
  'Bridge: one PO can be received in many IARs (partial deliveries / multiple inspection batches).';

-- ---------------------------------------------------------------------------
-- 8. Convenience view: full procurement chain trace per PR
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_procurement_chain AS
SELECT
    pr.id               AS pr_id,
    pr.pr_number,
    pr.status           AS pr_status,
    r.id                AS rfq_id,
    r.rfq_number,
    r.status            AS rfq_status,
    a.id                AS abstract_id,
    a.abstract_number,
    a.status            AS abstract_status,
    br.id               AS bac_resolution_id,
    br.resolution_number,
    br.status           AS bac_resolution_status,
    pq.id               AS post_qualification_id,
    pq.postqual_number,
    pq.status           AS postqual_status,
    n.id                AS noa_id,
    n.noa_number,
    n.status            AS noa_status,
    po.id               AS po_id,
    po.po_number,
    po.status           AS po_status,
    iar.id              AS iar_id,
    iar.iar_number,
    iar.acceptance      AS iar_acceptance_status
FROM purchaserequests pr
LEFT JOIN pr_rfq_links          prl  ON prl.pr_id         = pr.id
LEFT JOIN rfqs                  r    ON r.id               = prl.rfq_id
LEFT JOIN rfq_abstract_links    ral  ON ral.rfq_id         = r.id
LEFT JOIN abstracts             a    ON a.id               = ral.abstract_id
LEFT JOIN abstract_bac_resolution_links abrl ON abrl.abstract_id = a.id
LEFT JOIN bac_resolutions       br   ON br.id              = abrl.bac_resolution_id
LEFT JOIN abstract_postqual_links apql ON apql.abstract_id = a.id
LEFT JOIN post_qualifications   pq   ON pq.id              = apql.post_qualification_id
LEFT JOIN bac_resolution_noa_links brnl ON brnl.bac_resolution_id = br.id
LEFT JOIN notices_of_award      n    ON n.id               = brnl.noa_id
LEFT JOIN noa_po_links          npl  ON npl.noa_id         = n.id
LEFT JOIN purchaseorders        po   ON po.id              = npl.po_id
LEFT JOIN po_iar_links          pil  ON pil.po_id          = po.id
LEFT JOIN iars                  iar  ON iar.id             = pil.iar_id;

COMMENT ON VIEW vw_procurement_chain IS
  'Full end-to-end procurement chain trace: PR → RFQ → AOQ → BAC Reso → Post-Qual → NOA → PO → IAR.';

COMMIT;

