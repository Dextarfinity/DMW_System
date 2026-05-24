-- =============================================================================
-- MIGRATION: Multi-stage approval columns for rfqs, abstracts, bac_resolutions
-- When all 3 stages approved → status becomes 'completed'
-- Safe to run multiple times (IF NOT EXISTS).
-- =============================================================================

BEGIN;

-- ── rfqs ──────────────────────────────────────────────────────────────────────
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS approved_by_budget    BOOLEAN   DEFAULT FALSE;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS budget_approver_id    INTEGER;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS budget_approver_name  TEXT;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS budget_approved_at    TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS approved_by_hope      BOOLEAN   DEFAULT FALSE;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS hope_approver_id      INTEGER;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS hope_approver_name    TEXT;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS hope_approved_at      TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS approved_by_chief     BOOLEAN   DEFAULT FALSE;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS chief_approver_id     INTEGER;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS chief_approver_name   TEXT;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS chief_approved_at     TIMESTAMP WITHOUT TIME ZONE;

-- ── abstracts ─────────────────────────────────────────────────────────────────
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS approved_by_budget    BOOLEAN   DEFAULT FALSE;
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS budget_approver_id    INTEGER;
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS budget_approver_name  TEXT;
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS budget_approved_at    TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS approved_by_hope      BOOLEAN   DEFAULT FALSE;
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS hope_approver_id      INTEGER;
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS hope_approver_name    TEXT;
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS hope_approved_at      TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS approved_by_chief     BOOLEAN   DEFAULT FALSE;
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS chief_approver_id     INTEGER;
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS chief_approver_name   TEXT;
ALTER TABLE abstracts ADD COLUMN IF NOT EXISTS chief_approved_at     TIMESTAMP WITHOUT TIME ZONE;

-- ── bac_resolutions ───────────────────────────────────────────────────────────
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS approved_by_budget    BOOLEAN   DEFAULT FALSE;
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS budget_approver_id    INTEGER;
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS budget_approver_name  TEXT;
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS budget_approved_at    TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS approved_by_hope      BOOLEAN   DEFAULT FALSE;
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS hope_approver_id      INTEGER;
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS hope_approver_name    TEXT;
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS hope_approved_at      TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS approved_by_chief     BOOLEAN   DEFAULT FALSE;
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS chief_approver_id     INTEGER;
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS chief_approver_name   TEXT;
ALTER TABLE bac_resolutions ADD COLUMN IF NOT EXISTS chief_approved_at     TIMESTAMP WITHOUT TIME ZONE;

COMMIT;

-- =============================================================================
-- SERVER: Add PUT /:table/:id/approve handler (same pattern for all 3 tables)
--
-- app.put('/rfqs/:id/approve',            requireAuth, makeApproveHandler('rfqs'));
-- app.put('/abstracts/:id/approve',       requireAuth, makeApproveHandler('abstracts'));
-- app.put('/bac-resolutions/:id/approve', requireAuth, makeApproveHandler('bac_resolutions'));
--
-- function makeApproveHandler(table) {
--   return async (req, res) => {
--     const doc    = await db.query(`SELECT * FROM ${table} WHERE id=$1`, [req.params.id]);
--     const roles  = req.user.roles || [req.user.role];
--     const isAdmin    = roles.some(r => ['admin','system_admin'].includes(r));
--     const approveAll = isAdmin && req.body.approve_all === true;
--     const now  = new Date();
--     const name = req.user.full_name;
--     const uid  = req.user.id;
--     let updates = {};
--
--     if (approveAll) {
--       // Admin approves all three stages → immediately completed
--       updates = {
--         approved_by_budget: true, budget_approver_name: name, budget_approver_id: uid, budget_approved_at: now,
--         approved_by_hope:   true, hope_approver_name:   name, hope_approver_id:   uid, hope_approved_at:   now,
--         approved_by_chief:  true, chief_approver_name:  name, chief_approver_id:  uid, chief_approved_at:  now,
--         status: 'completed',
--       };
--     } else if (roles.includes('budget_consultant') && !doc.approved_by_budget) {
--       updates = { approved_by_budget: true, budget_approver_name: name, budget_approver_id: uid, budget_approved_at: now };
--     } else if (roles.includes('hope') && !doc.approved_by_hope) {
--       updates = { approved_by_hope: true, hope_approver_name: name, hope_approver_id: uid, hope_approved_at: now };
--     } else if (roles.some(r => ['bac_chair'].includes(r)) && !doc.approved_by_chief) {
--       updates = { approved_by_chief: true, chief_approver_name: name, chief_approver_id: uid, chief_approved_at: now };
--     } else {
--       return res.status(403).json({ message: 'Already approved or insufficient role.' });
--     }
--
--     // Auto-complete when all 3 stages done
--     const b = updates.approved_by_budget ?? doc.approved_by_budget;
--     const h = updates.approved_by_hope   ?? doc.approved_by_hope;
--     const c = updates.approved_by_chief  ?? doc.approved_by_chief;
--     if (b && h && c && !updates.status) updates.status = 'completed';
--
--     await db.query(`UPDATE ${table} SET ... WHERE id=$1`, [req.params.id]);
--     res.json({ message: updates.status === 'completed' ? 'Document completed!' : 'Stage approved.' });
--   };
-- }
-- =============================================================================
