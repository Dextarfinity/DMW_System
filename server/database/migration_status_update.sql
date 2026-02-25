-- ============================================================
-- MIGRATION: Update ALL status values across transaction tables
-- Maps old DB values → new user-specified status values
-- ============================================================

-- ============================================================
-- 1. PURCHASE REQUESTS
-- Old: pending, approved, rejected, processed, cancelled
-- New: pending_approval, approved, rejected, cancelled
-- ============================================================
ALTER TABLE purchaserequests DROP CONSTRAINT IF EXISTS purchaserequests_status_check;
ALTER TABLE purchaserequests ALTER COLUMN status TYPE VARCHAR(30);
UPDATE purchaserequests SET status = 'pending_approval' WHERE status IN ('pending', 'draft');
UPDATE purchaserequests SET status = 'approved' WHERE status = 'processed';
ALTER TABLE purchaserequests ADD CONSTRAINT purchaserequests_status_check
  CHECK (status IN ('pending_approval','approved','rejected','cancelled'));
ALTER TABLE purchaserequests ALTER COLUMN status SET DEFAULT 'pending_approval';

-- ============================================================
-- 2. RFQs
-- Old: draft, posted, closed, cancelled
-- New: on_going, completed, cancelled
-- ============================================================
ALTER TABLE rfqs DROP CONSTRAINT IF EXISTS rfqs_status_check;
ALTER TABLE rfqs ALTER COLUMN status TYPE VARCHAR(30);
UPDATE rfqs SET status = 'on_going' WHERE status IN ('draft', 'posted');
UPDATE rfqs SET status = 'completed' WHERE status = 'closed';
ALTER TABLE rfqs ADD CONSTRAINT rfqs_status_check
  CHECK (status IN ('on_going','completed','cancelled'));
ALTER TABLE rfqs ALTER COLUMN status SET DEFAULT 'on_going';

-- ============================================================
-- 3. ABSTRACTS
-- Old: draft, submitted, approved, cancelled
-- New: on_going, completed, cancelled
-- ============================================================
ALTER TABLE abstracts DROP CONSTRAINT IF EXISTS abstracts_status_check;
ALTER TABLE abstracts ALTER COLUMN status TYPE VARCHAR(30);
UPDATE abstracts SET status = 'on_going' WHERE status IN ('draft', 'submitted');
UPDATE abstracts SET status = 'completed' WHERE status = 'approved';
ALTER TABLE abstracts ADD CONSTRAINT abstracts_status_check
  CHECK (status IN ('on_going','completed','cancelled'));
ALTER TABLE abstracts ALTER COLUMN status SET DEFAULT 'on_going';

-- ============================================================
-- 4. POST-QUALIFICATIONS
-- Old: draft, completed, cancelled
-- New: on_going, completed, cancelled
-- ============================================================
ALTER TABLE post_qualifications DROP CONSTRAINT IF EXISTS post_qualifications_status_check;
ALTER TABLE post_qualifications ALTER COLUMN status TYPE VARCHAR(30);
UPDATE post_qualifications SET status = 'on_going' WHERE status = 'draft';
ALTER TABLE post_qualifications ADD CONSTRAINT post_qualifications_status_check
  CHECK (status IN ('on_going','completed','cancelled'));
ALTER TABLE post_qualifications ALTER COLUMN status SET DEFAULT 'on_going';

-- ============================================================
-- 5. BAC RESOLUTIONS
-- Old: draft, approved, rejected, cancelled
-- New: on_going, completed, cancelled
-- ============================================================
ALTER TABLE bac_resolutions DROP CONSTRAINT IF EXISTS bac_resolutions_status_check;
ALTER TABLE bac_resolutions ALTER COLUMN status TYPE VARCHAR(30);
UPDATE bac_resolutions SET status = 'on_going' WHERE status IN ('draft', 'rejected');
UPDATE bac_resolutions SET status = 'completed' WHERE status = 'approved';
ALTER TABLE bac_resolutions ADD CONSTRAINT bac_resolutions_status_check
  CHECK (status IN ('on_going','completed','cancelled'));
ALTER TABLE bac_resolutions ALTER COLUMN status SET DEFAULT 'on_going';

-- ============================================================
-- 6. NOTICES OF AWARD
-- Old: draft, issued, received, cancelled
-- New: awaiting_noa, with_noa, cancelled
-- ============================================================
ALTER TABLE notices_of_award DROP CONSTRAINT IF EXISTS notices_of_award_status_check;
ALTER TABLE notices_of_award ALTER COLUMN status TYPE VARCHAR(30);
UPDATE notices_of_award SET status = 'awaiting_noa' WHERE status IN ('draft');
UPDATE notices_of_award SET status = 'with_noa' WHERE status IN ('issued', 'received');
ALTER TABLE notices_of_award ADD CONSTRAINT notices_of_award_status_check
  CHECK (status IN ('awaiting_noa','with_noa','cancelled'));
ALTER TABLE notices_of_award ALTER COLUMN status SET DEFAULT 'awaiting_noa';

-- ============================================================
-- 7. PURCHASE ORDERS
-- Old status: pending, approved, delivered, completed, cancelled
-- New status: for_signing, signed, cancelled
-- Old workflow_status stays as-is since it's a separate concern
-- ============================================================
ALTER TABLE purchaseorders DROP CONSTRAINT IF EXISTS purchaseorders_status_check;
ALTER TABLE purchaseorders ALTER COLUMN status TYPE VARCHAR(30);
UPDATE purchaseorders SET status = 'for_signing' WHERE status IN ('pending', 'draft');
UPDATE purchaseorders SET status = 'signed' WHERE status IN ('approved', 'delivered', 'completed');
ALTER TABLE purchaseorders ADD CONSTRAINT purchaseorders_status_check
  CHECK (status IN ('for_signing','signed','cancelled'));
ALTER TABLE purchaseorders ALTER COLUMN status SET DEFAULT 'for_signing';

-- ============================================================
-- 8. IARs
-- Old status: draft, completed, cancelled
-- New status: inspection_ongoing, inspected_verified, complete, partial, cancelled
-- Old inspection_result: pending, accepted, rejected, partial
-- New inspection_result: on_going, inspected_verified, rejected, partial
-- ============================================================
-- iars table has no 'status' column; it uses 'inspection_result' and 'acceptance'
-- Update inspection_result values to match new labels
ALTER TABLE iars DROP CONSTRAINT IF EXISTS iars_inspection_result_check;
ALTER TABLE iars ALTER COLUMN inspection_result TYPE VARCHAR(30);
UPDATE iars SET inspection_result = 'inspected_verified' WHERE inspection_result IN ('accepted','verified');
UPDATE iars SET inspection_result = 'on_going' WHERE inspection_result IN ('pending','to_be_checked');
ALTER TABLE iars ADD CONSTRAINT iars_inspection_result_check
  CHECK (inspection_result IN ('on_going','inspected_verified','rejected','partial'));
ALTER TABLE iars ALTER COLUMN inspection_result SET DEFAULT 'on_going';

-- Update acceptance values
ALTER TABLE iars DROP CONSTRAINT IF EXISTS iars_acceptance_check;
ALTER TABLE iars ALTER COLUMN acceptance TYPE VARCHAR(30);
ALTER TABLE iars ADD CONSTRAINT iars_acceptance_check
  CHECK (acceptance IN ('to_be_checked','complete','partial'));
ALTER TABLE iars ALTER COLUMN acceptance SET DEFAULT 'to_be_checked';

-- ============================================================
-- DONE! All status values now match user-specified labels.
-- ============================================================
