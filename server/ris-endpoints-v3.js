// ==============================================================================
// RIS (REQUISITION AND ISSUE SLIP) TRANSACTIONS API ENDPOINTS
// Version: 3.0
// Date: March 17, 2026
// Description: Complete RIS workflow endpoints for the transactions section
// ==============================================================================

module.exports = function registerRISEndpoints(app, pool, authenticateToken, broadcastNotification) {
  
    // ============================================================
    // 1. GET ALL RIS - with visibility filtering by role
    // ============================================================
    app.get('/api/ris', authenticateToken, async (req, res) => {
      try {
        const userRoles = [req.user.role, req.user.secondary_role].filter(Boolean);
        
        // Determine which RIS records this user can see based on their role
        let visibilityCondition = '';
        const params = [];
        
        // Check if user has any of the viewable roles
        const viewableRoles = ['HOPE', 'BAC_SEC', 'BUDGET', 'CHIEF_FAD', 'ADMIN', 'SUPPLY_OFFICER'];
        const userCanViewAll = userRoles.some(r => 
          r.toUpperCase().includes('ADMIN') || 
          r.toUpperCase().includes('HOPE') ||
          r.toUpperCase().includes('CHIEF') ||
          r === 'supply_officer'
        );
        
        if (!userCanViewAll) {
          // Regular users can only see RIS where they were the requester or approver
          visibilityCondition = `WHERE r.requested_by_id = $1 OR r.approved_by_id = $1`;
          params.push(req.user.id);
        }
        
        const result = await pool.query(
          `SELECT r.*, 
                  u1.full_name as created_by_name,
                  u1.designation as created_by_designation,
                  e1.full_name as requested_by_name,
                  e1.designation as requested_by_designation,
                  e2.full_name as approved_by_name,
                  e2.designation as approved_by_designation,
                  e3.full_name as supply_officer_name,
                  e3.designation as supply_officer_designation,
                  e4.full_name as issued_by_name,
                  e4.designation as issued_by_designation,
                  e5.full_name as received_by_name,
                  e5.designation as received_by_designation
           FROM requisition_issue_slips r
           LEFT JOIN users u1 ON r.created_by_user_id = u1.id
           LEFT JOIN employees e1 ON r.requested_by_id = e1.id
           LEFT JOIN employees e2 ON r.approved_by_id = e2.id
           LEFT JOIN employees e3 ON r.approved_by_supply_id = e3.id
           LEFT JOIN employees e4 ON r.issued_by_id = e4.id
           LEFT JOIN employees e5 ON r.received_by_id = e5.id
           ${visibilityCondition}
           ORDER BY r.ris_date DESC`,
          params
        );
        res.json(result.rows);
      } catch (err) { res.status(500).json({ error: err.message }); }
    });
    
    // ============================================================
    // 2. GET SINGLE RIS WITH ITEMS
    // ============================================================
    app.get('/api/ris/:id', authenticateToken, async (req, res) => {
      try {
        const ris = await pool.query(
          `SELECT r.*, 
                  u1.full_name as created_by_name,
                  u1.designation as created_by_designation,
                  e1.full_name as requested_by_name,
                  e1.designation as requested_by_designation,
                  e2.full_name as approved_by_name,
                  e2.designation as approved_by_designation,
                  e3.full_name as supply_officer_name,
                  e3.designation as supply_officer_designation,
                  e4.full_name as issued_by_name,
                  e4.designation as issued_by_designation,
                  e5.full_name as received_by_name,
                  e5.designation as received_by_designation
           FROM requisition_issue_slips r
           LEFT JOIN users u1 ON r.created_by_user_id = u1.id
           LEFT JOIN employees e1 ON r.requested_by_id = e1.id
           LEFT JOIN employees e2 ON r.approved_by_id = e2.id
           LEFT JOIN employees e3 ON r.approved_by_supply_id = e3.id
           LEFT JOIN employees e4 ON r.issued_by_id = e4.id
           LEFT JOIN employees e5 ON r.received_by_id = e5.id
           WHERE r.id = $1`, [req.params.id]
        );
        if (ris.rows.length === 0) return res.status(404).json({ error: 'RIS not found' });
        
        // Get items with stock information
        const items = await pool.query(
          `SELECT ri.id as ris_item_id, ri.*, i.stock_no, i.quantity as available_stock, i.category as item_category
           FROM ris_items ri
           LEFT JOIN items i ON ri.item_id = i.id
           WHERE ri.ris_id = $1
           ORDER BY ri.created_at`,
          [req.params.id]
        );
        
        // Get approval history
        const approvals = await pool.query(
          `SELECT * FROM ris_approvals WHERE ris_id = $1 ORDER BY approval_date DESC`,
          [req.params.id]
        );
        
        // Get status history
        const statusHistory = await pool.query(
          `SELECT * FROM ris_status_history WHERE ris_id = $1 ORDER BY changed_at DESC`,
          [req.params.id]
        );
        
        res.json({
          ...ris.rows[0],
          items: items.rows,
          approvals: approvals.rows,
          status_history: statusHistory.rows
        });
      } catch (err) { res.status(500).json({ error: err.message }); }
    });
    
    // ============================================================
    // 3. CREATE NEW RIS WITH AUTOMATIC NOTIFICATIONS
    // ============================================================
    app.post('/api/ris', authenticateToken, async (req, res) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const { 
          division, 
          office, 
          ris_date, 
          purpose, 
          category, 
          ris_type, 
          is_priority, 
          remarks,
          requested_by_id, 
          requested_by_name, 
          requested_by_designation,
          approved_by_id, 
          approved_by_name, 
          approved_by_designation,
          approved_by_supply_id,
          responsibility_center_code,
          items 
        } = req.body;
    
        // Auto-generate RIS number: RIS-{YEAR}-{SEQ}
        let risNo = '';
        const year = new Date().getFullYear();
        const prefix = `RIS-${year}-`;
        const seqResult = await client.query(
          `SELECT COALESCE(MAX(CAST(SUBSTRING(ris_no FROM LENGTH($1)+1) AS INTEGER)), 0) as max_seq
           FROM requisition_issue_slips WHERE ris_no LIKE $2`,
          [prefix, prefix + '%']
        );
        risNo = prefix + String((seqResult.rows[0].max_seq || 0) + 1).padStart(4, '0');
    
        // Create RIS record
        const risResult = await client.query(
          `INSERT INTO requisition_issue_slips 
           (ris_no, division, office, ris_date, purpose, category, ris_type, is_priority, remarks,
            requested_by_id, requested_by_name, requested_by_designation,
            approved_by_id, approved_by_name, approved_by_designation,
            approved_by_supply_id,
            responsibility_center_code,
            created_by_user_id,
            status,
            notified_to_supply_officer)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,'PENDING',TRUE)
           RETURNING *`,
          [risNo, division, office, ris_date, purpose, category||null, ris_type||'NORMAL', 
           is_priority||false, remarks||null,
           requested_by_id, requested_by_name, requested_by_designation,
           approved_by_id, approved_by_name, approved_by_designation,
           approved_by_supply_id||null,
           responsibility_center_code||null,
           req.user.id]
        );
        const ris = risResult.rows[0];
    
        // Insert RIS items (from catalog or manual)
        if (items && items.length > 0) {
          for (const item of items) {
            let itemId = item.item_id;
            let isFromCatalog = true;
    
            // If item is manually entered and not in catalog, add it to catalog
            if (!itemId && item.is_manual) {
              const newItemResult = await client.query(
                `INSERT INTO items 
                 (code, name, description, unit, unit_price, category, procurement_source, is_manually_added, created_by_ris_id, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, 'MANUAL_ENTRY', TRUE, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 RETURNING id`,
                [
                  'MAN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                  item.description,
                  item.description,
                  item.uom,
                  item.unit_cost || 0,
                  'MANUAL ITEMS',
                  ris.id
                ]
              );
              itemId = newItemResult.rows[0].id;
              isFromCatalog = false;
            }
    
            // Insert RIS item
            await client.query(
              `INSERT INTO ris_items 
               (ris_id, item_id, description, uom, quantity, unit_cost, is_from_catalog, manual_entry_notes)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [ris.id, itemId||null, item.description, item.uom, item.quantity||1, 
               item.unit_cost||0, isFromCatalog, item.manual_entry_notes||null]
            );
          }
        }
    
        // Create notifications for all relevant roles
        const notificationRoles = ['HOPE', 'BAC_SEC', 'BUDGET', 'CHIEF_FAD', 'ADMIN', 'SUPPLY_OFFICER'];
        for (const role of notificationRoles) {
          await client.query(
            `INSERT INTO ris_notifications (ris_id, role, is_viewed, created_at)
             VALUES ($1, $2, FALSE, CURRENT_TIMESTAMP)`,
            [ris.id, role]
          );
        }
    
        // Record that supply officer was notified
        await client.query(
          `UPDATE requisition_issue_slips 
           SET notified_to_supply_officer = TRUE, notified_at = CURRENT_TIMESTAMP 
           WHERE id = $1`,
          [ris.id]
        );
    
        await client.query('COMMIT');
    
        // Send notification to supply officer (Mark E. Marasigan)
        broadcastNotification({
          type: 'notification',
          icon: 'fas fa-clipboard-list',
          title: `New RIS ${risNo} Created`,
          message: `New RIS from ${requested_by_name || 'End User'} requires your review and approval`,
          reference_type: 'ris',
          reference_id: ris.id,
          reference_code: risNo,
          roles: ['SUPPLY_OFFICER', 'ADMIN', 'CHIEF_FAD']
        });
    
        res.status(201).json({
          ...ris,
          message: 'RIS created successfully and notifications sent to all stakeholders'
        });
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating RIS:', err);
        res.status(500).json({ error: err.message });
      } finally {
        client.release();
      }
    });
    
    // ============================================================
    // 4. GET RIS NOTIFICATIONS FOR CURRENT USER
    // ============================================================
    app.get('/api/ris/notifications/pending', authenticateToken, async (req, res) => {
      try {
        const userRoles = [req.user.role, req.user.secondary_role].filter(Boolean);
        const userRoleUpper = userRoles.map(r => r.toUpperCase());
        
        // Map user roles to notification role codes
        const notificationRoles = [];
        if (userRoleUpper.includes('ADMIN')) notificationRoles.push('ADMIN', 'HOPE', 'BAC_SEC', 'BUDGET', 'CHIEF_FAD', 'SUPPLY_OFFICER');
        else if (userRoleUpper.some(r => r.includes('HOPE'))) notificationRoles.push('HOPE');
        else if (userRoleUpper.some(r => r.includes('BAC'))) notificationRoles.push('BAC_SEC');
        else if (userRoleUpper.some(r => r.includes('BUDGET'))) notificationRoles.push('BUDGET');
        else if (userRoleUpper.some(r => r.includes('CHIEF'))) notificationRoles.push('CHIEF_FAD');
        else if (userRoles.includes('supply_officer')) notificationRoles.push('SUPPLY_OFFICER');
        
        if (notificationRoles.length === 0) {
          return res.json([]);
        }
        
        const placeholders = notificationRoles.map((_, i) => `$${i + 1}`).join(',');
        const result = await pool.query(
          `SELECT r.*, rn.role, rn.is_viewed, rn.viewed_at
           FROM requisition_issue_slips r
           LEFT JOIN ris_notifications rn ON r.id = rn.ris_id
           WHERE rn.role IN (${placeholders}) AND rn.is_viewed = FALSE
           ORDER BY r.ris_date DESC`,
          notificationRoles
        );
        res.json(result.rows);
      } catch (err) { res.status(500).json({ error: err.message }); }
    });
    
    // ============================================================
    // 5. MARK RIS AS VIEWED
    // ============================================================
    app.put('/api/ris/:id/notifications/viewed', authenticateToken, async (req, res) => {
      try {
        const userRoles = [req.user.role, req.user.secondary_role].filter(Boolean);
        const userRoleUpper = userRoles.map(r => r.toUpperCase());
        
        // Determine user's primary notification role
        let notifRole = null;
        if (userRoleUpper.includes('ADMIN')) notifRole = 'ADMIN';
        else if (userRoleUpper.some(r => r.includes('HOPE'))) notifRole = 'HOPE';
        else if (userRoleUpper.some(r => r.includes('BAC'))) notifRole = 'BAC_SEC';
        else if (userRoleUpper.some(r => r.includes('BUDGET'))) notifRole = 'BUDGET';
        else if (userRoleUpper.some(r => r.includes('CHIEF'))) notifRole = 'CHIEF_FAD';
        else if (userRoles.includes('supply_officer')) notifRole = 'SUPPLY_OFFICER';
        
        if (!notifRole) {
          return res.status(403).json({ error: 'Your role cannot view RIS' });
        }
        
        const result = await pool.query(
          `UPDATE ris_notifications 
           SET is_viewed = TRUE, viewed_at = CURRENT_TIMESTAMP 
           WHERE ris_id = $1 AND role = $2
           RETURNING *`,
          [req.params.id, notifRole]
        );
        
        res.json({ message: 'Notification marked as viewed', notification: result.rows[0] });
      } catch (err) { res.status(500).json({ error: err.message }); }
    });
    
    // ============================================================
    // 6. SUPPLY OFFICER APPROVES RIS (Status: PENDING â†’ APPROVED)
    // ============================================================
    app.put('/api/ris/:id/approve', authenticateToken, async (req, res) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const { remarks } = req.body;
        const userId = req.user.id;
        
        // Verify user is supply officer or admin
        const userRoles = [req.user.role, req.user.secondary_role].filter(Boolean);
        const canApprove = userRoles.some(r => 
          r === 'supply_officer' || r.toUpperCase().includes('ADMIN') || r.toUpperCase().includes('CHIEF_FAD')
        );
        
        if (!canApprove) {
          await client.query('ROLLBACK');
          return res.status(403).json({ error: 'Only Supply Officer or Admin can approve RIS' });
        }
        
        // Get RIS to verify status
        const ris = await client.query('SELECT * FROM requisition_issue_slips WHERE id = $1', [req.params.id]);
        if (ris.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'RIS not found' });
        }
        
        const risRecord = ris.rows[0];
        if (risRecord.status !== 'PENDING') {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `RIS is already ${risRecord.status}. Cannot approve.` });
        }
        
        // Update RIS status to APPROVED
        const updateResult = await client.query(
          `UPDATE requisition_issue_slips 
           SET status = 'APPROVED', 
               approved_by_supply_id = $1,
               updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2 
           RETURNING *`,
          [userId, req.params.id]
        );
        
        // Record approval in approval history
        const userResult = await client.query('SELECT full_name, designation FROM users u LEFT JOIN employees e ON u.employee_id = e.id WHERE u.id = $1', [userId]);
        const approverName = userResult.rows.length > 0 ? userResult.rows[0].full_name : 'Supply Officer';
        const approverDesignation = userResult.rows.length > 0 && userResult.rows[0].designation ? userResult.rows[0].designation : 'Supply Officer';
        
        await client.query(
          `INSERT INTO ris_approvals 
           (ris_id, approved_by_user_id, approved_by_name, approved_by_designation, approval_type, remarks)
           VALUES ($1, $2, $3, $4, 'SUPPLY_OFFICER_APPROVAL', $5)`,
          [req.params.id, userId, approverName, approverDesignation, remarks||null]
        );
        
        // Record status change in history
        await client.query(
          `INSERT INTO ris_status_history 
           (ris_id, old_status, new_status, changed_by_user_id, changed_by_name, change_reason)
           VALUES ($1, 'PENDING', 'APPROVED', $2, $3, $4)`,
          [req.params.id, userId, approverName, 'Items confirmed in stock and approved for issue']
        );
        
        await client.query('COMMIT');
        
        // Notify the end user and other stakeholders that RIS is approved
        broadcastNotification({
          type: 'success',
          icon: 'fas fa-check-circle',
          title: `RIS ${risRecord.ris_no} Approved`,
          message: `Your RIS has been approved by Supply Officer. You can now print the template for signatories.`,
          reference_type: 'ris',
          reference_id: req.params.id,
          reference_code: risRecord.ris_no
        });
        
        res.json({
          message: 'RIS approved successfully',
          status: 'APPROVED',
          ris: updateResult.rows[0]
        });
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error approving RIS:', err);
        res.status(500).json({ error: err.message });
      } finally {
        client.release();
      }
    });
    
    // ============================================================
    // 7. CANCEL/REJECT RIS
    // ============================================================
    app.put('/api/ris/:id/cancel', authenticateToken, async (req, res) => {
      try {
        const { reason } = req.body;
        
        const result = await pool.query(
          `UPDATE requisition_issue_slips 
           SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP 
           WHERE id = $1 AND status = 'PENDING'
           RETURNING *`,
          [req.params.id]
        );
        
        if (result.rows.length === 0) {
          return res.status(400).json({ error: 'Can only cancel PENDING RIS' });
        }
        
        res.json({
          message: 'RIS cancelled',
          status: 'CANCELLED',
          ris: result.rows[0]
        });
      } catch (err) { res.status(500).json({ error: err.message }); }
    });
    
    // ============================================================
    // 8. GET RIS FOR PRINTING (with signatures)
    // ============================================================
    app.get('/api/ris/:id/print-template', authenticateToken, async (req, res) => {
      try {
        const ris = await pool.query(
          `SELECT r.*, 
                  e1.full_name as requested_by_name,
                  e1.designation as requested_by_designation,
                  e2.full_name as approved_by_name,
                  e2.designation as approved_by_designation,
                  e3.full_name as supply_officer_name,
                  e3.designation as supply_officer_designation,
                  e4.full_name as issued_by_name,
                  e4.designation as issued_by_designation,
                  e5.full_name as received_by_name,
                  e5.designation as received_by_designation
           FROM requisition_issue_slips r
           LEFT JOIN employees e1 ON r.requested_by_id = e1.id
           LEFT JOIN employees e2 ON r.approved_by_id = e2.id
           LEFT JOIN employees e3 ON r.approved_by_supply_id = e3.id
           LEFT JOIN employees e4 ON r.issued_by_id = e4.id
           LEFT JOIN employees e5 ON r.received_by_id = e5.id
           WHERE r.id = $1`, [req.params.id]
        );
        
        if (ris.rows.length === 0) return res.status(404).json({ error: 'RIS not found' });
        
        const items = await pool.query(
          `SELECT ri.*, i.stock_no FROM ris_items ri
           LEFT JOIN items i ON ri.item_id = i.id
           WHERE ri.ris_id = $1
           ORDER BY ri.id`,
          [req.params.id]
        );
        
        res.json({
          ...ris.rows[0],
          items: items.rows,
          print_template: true
        });
      } catch (err) { res.status(500).json({ error: err.message }); }
    });
    
    // ============================================================
    // 9. UPDATE RIS (for editing before approval)
    // ============================================================
    app.put('/api/ris/:id', authenticateToken, async (req, res) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const {
          division, office, ris_date, purpose, category, ris_type, is_priority, remarks,
          requested_by_id, requested_by_name, requested_by_designation,
          approved_by_id, approved_by_name, approved_by_designation,
          approved_by_supply_id,
          items
        } = req.body;
        
        // Check if RIS is still PENDING (can only edit pending RIS)
        const ris = await client.query('SELECT * FROM requisition_issue_slips WHERE id = $1', [req.params.id]);
        if (ris.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'RIS not found' });
        }
        
        if (ris.rows[0].status !== 'PENDING') {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Can only edit PENDING RIS' });
        }
        
        const result = await client.query(
          `UPDATE requisition_issue_slips 
           SET division=$1, office=$2, ris_date=$3, purpose=$4, category=$5, ris_type=$6, is_priority=$7, remarks=$8,
               requested_by_id=$9, requested_by_name=$10, requested_by_designation=$11,
               approved_by_id=$12, approved_by_name=$13, approved_by_designation=$14,
               approved_by_supply_id=$15,
               updated_at = CURRENT_TIMESTAMP
           WHERE id=$16
           RETURNING *`,
          [division, office, ris_date, purpose, category||null, ris_type||'NORMAL', is_priority||false, remarks||null,
           requested_by_id, requested_by_name, requested_by_designation,
           approved_by_id, approved_by_name, approved_by_designation,
           approved_by_supply_id||null,
           req.params.id]
        );
        
        // Update items if provided
        if (items && Array.isArray(items)) {
          await client.query('DELETE FROM ris_items WHERE ris_id = $1', [req.params.id]);
          for (const item of items) {
            let itemId = item.item_id;
            
            // If manual item, add to catalog
            if (!itemId && item.is_manual) {
              const newItemResult = await client.query(
                `INSERT INTO items 
                 (code, name, description, unit, unit_price, category, procurement_source, is_manually_added, created_by_ris_id)
                 VALUES ($1, $2, $3, $4, $5, 'MANUAL ITEMS', 'MANUAL_ENTRY', TRUE, $6)
                 RETURNING id`,
                ['MAN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                 item.description, item.description, item.uom, item.unit_cost||0, req.params.id]
              );
              itemId = newItemResult.rows[0].id;
            }
            
            await client.query(
              `INSERT INTO ris_items (ris_id, item_id, description, uom, quantity, unit_cost, is_from_catalog, manual_entry_notes)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [req.params.id, itemId||null, item.description, item.uom, item.quantity||1, item.unit_cost||0, !item.is_manual, item.manual_entry_notes||null]
            );
          }
        }
        
        await client.query('COMMIT');
        res.json({ message: 'RIS updated', ris: result.rows[0] });
      } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
      } finally {
        client.release();
      }
    });
    
    // ============================================================
    // 10. DELETE RIS (only PENDING status)
    // ============================================================
    app.delete('/api/ris/:id', authenticateToken, async (req, res) => {
      try {
        const ris = await pool.query('SELECT * FROM requisition_issue_slips WHERE id = $1', [req.params.id]);
        if (ris.rows.length === 0) return res.status(404).json({ error: 'RIS not found' });
        
        if (ris.rows[0].status !== 'PENDING') {
          return res.status(400).json({ error: 'Can only delete PENDING RIS' });
        }
        
        // Soft delete: mark as CANCELLED
        await pool.query(
          'UPDATE requisition_issue_slips SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['CANCELLED', req.params.id]
        );
        
        res.json({ message: 'RIS deleted (marked as cancelled)' });
      } catch (err) { res.status(500).json({ error: err.message }); }
    });
    
}
