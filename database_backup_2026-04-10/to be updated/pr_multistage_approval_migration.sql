-- =============================================================================
-- MIGRATION: Multi-stage approval columns for purchaserequests
-- Mirrors approved_by_budget / approved_by_hope / approved_by_chief on plans.
-- Safe to run multiple times (IF NOT EXISTS).
-- =============================================================================

BEGIN;

ALTER TABLE purchaserequests ADD COLUMN IF NOT EXISTS approved_by_budget    BOOLEAN   DEFAULT FALSE;
ALTER TABLE purchaserequests ADD COLUMN IF NOT EXISTS budget_approver_id    INTEGER;
ALTER TABLE purchaserequests ADD COLUMN IF NOT EXISTS budget_approver_name  TEXT;
ALTER TABLE purchaserequests ADD COLUMN IF NOT EXISTS budget_approved_at    TIMESTAMP WITHOUT TIME ZONE;

ALTER TABLE purchaserequests ADD COLUMN IF NOT EXISTS approved_by_hope      BOOLEAN   DEFAULT FALSE;
ALTER TABLE purchaserequests ADD COLUMN IF NOT EXISTS hope_approver_id      INTEGER;
ALTER TABLE purchaserequests ADD COLUMN IF NOT EXISTS hope_approver_name    TEXT;
ALTER TABLE purchaserequests ADD COLUMN IF NOT EXISTS hope_approved_at      TIMESTAMP WITHOUT TIME ZONE;

ALTER TABLE purchaserequests ADD COLUMN IF NOT EXISTS approved_by_chief     BOOLEAN   DEFAULT FALSE;
ALTER TABLE purchaserequests ADD COLUMN IF NOT EXISTS chief_approver_id     INTEGER;
ALTER TABLE purchaserequests ADD COLUMN IF NOT EXISTS chief_approver_name   TEXT;
ALTER TABLE purchaserequests ADD COLUMN IF NOT EXISTS chief_approved_at     TIMESTAMP WITHOUT TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_pr_approved_by_budget ON purchaserequests(approved_by_budget);
CREATE INDEX IF NOT EXISTS idx_pr_approved_by_hope   ON purchaserequests(approved_by_hope);
CREATE INDEX IF NOT EXISTS idx_pr_approved_by_chief  ON purchaserequests(approved_by_chief);

COMMIT;

-- =============================================================================
-- SERVER: Update PUT /purchase-requests/:id/approve
--
-- The client sends { approve_all: true } when the user is admin.
-- For all other roles it sends an empty body {}.
--
-- Express/Node example:
--
--   app.put('/purchase-requests/:id/approve', requireAuth, async (req, res) => {
--     const pr = await getPR(req.params.id);
--     const roles  = req.user.roles || [req.user.role];
--     const isAdmin = roles.includes('admin');
--     const approveAll = isAdmin && req.body.approve_all === true;
--     const isWRSD = pr.department_code === 'WRSD';
--     const now = new Date();
--     const name = req.user.full_name;
--     const uid  = req.user.id;
--
--     let updates = {};
--
--     if (approveAll) {
--       // Admin approves all three stages at once
--       updates = {
--         approved_by_budget:   true, budget_approver_name:  name, budget_approver_id:  uid, budget_approved_at:  now,
--         approved_by_hope:     true, hope_approver_name:    name, hope_approver_id:    uid, hope_approved_at:    now,
--         approved_by_chief:    true, chief_approver_name:   name, chief_approver_id:   uid, chief_approved_at:   now,
--         status: 'approved',
--       };
--     } else if (roles.includes('budget_consultant') && !pr.approved_by_budget) {
--       updates = { approved_by_budget: true, budget_approver_name: name, budget_approver_id: uid, budget_approved_at: now };
--     } else if (roles.includes('hope') && !pr.approved_by_hope) {
--       updates = { approved_by_hope: true, hope_approver_name: name, hope_approver_id: uid, hope_approved_at: now };
--     } else if ((isWRSD ? roles.includes('chief_wrsd') : roles.some(r => ['chief_fad','bac_chair'].includes(r))) && !pr.approved_by_chief) {
--       updates = { approved_by_chief: true, chief_approver_name: name, chief_approver_id: uid, chief_approved_at: now };
--     } else {
--       return res.status(403).json({ message: 'You have already approved or lack the role.' });
--     }
--
--     // Auto-set status=approved when all three stages complete
--     const newBudget = updates.approved_by_budget  ?? pr.approved_by_budget;
--     const newHope   = updates.approved_by_hope    ?? pr.approved_by_hope;
--     const newChief  = updates.approved_by_chief   ?? pr.approved_by_chief;
--     if (newBudget && newHope && newChief && !updates.status) updates.status = 'approved';
--
--     await updatePR(req.params.id, updates);
--     res.json({ message: updates.status === 'approved' ? 'PR fully approved!' : 'Stage approved successfully.' });
--   });
-- =============================================================================
