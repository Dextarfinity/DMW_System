const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:123456@localhost/dmw_procurement'
});

(async () => {
  try {
    // Get MWPSD department ID
    const dept = await pool.query('SELECT id, code, name FROM departments WHERE code ILIKE $1', ['%MWPSD%']);
    console.log('\n=== MWPSD Department ===');
    console.log(JSON.stringify(dept.rows, null, 2));
    
    if (dept.rows.length > 0) {
      const deptId = dept.rows[0].id;
      
      // Get all PPMP entries for MWPSD (including deleted)
      const entries = await pool.query(`
        SELECT id, ppmp_no, status, total_amount, is_deleted, created_at
        FROM procurementplans
        WHERE dept_id = $1
        ORDER BY id ASC
      `, [deptId]);
      
      console.log('\n=== MWPSD PPMP Entries (ALL - including deleted) ===');
      console.log('Total count:', entries.rows.length);
      
      let activeTotal = 0;
      let deletedTotal = 0;
      let activeCount = 0;
      let deletedCount = 0;
      
      entries.rows.forEach((e, i) => {
        const isDeleted = e.is_deleted === true || e.is_deleted === 'true';
        const amount = parseFloat(e.total_amount) || 0;
        
        console.log(`${i+1}. ID=${e.id}, PPMP=${e.ppmp_no}, Status=${e.status}, Amount=${amount}, Deleted=${isDeleted}`);
        
        if (isDeleted) {
          deletedTotal += amount;
          deletedCount++;
        } else {
          activeTotal += amount;
          activeCount++;
        }
      });
      
      console.log('\n=== SUMMARY ===');
      console.log(`Active entries: ${activeCount} with total: ${activeTotal}`);
      console.log(`Deleted entries: ${deletedCount} with total: ${deletedTotal}`);
      console.log(`Grand total (all): ${activeTotal + deletedTotal}`);
      
      // Also check what a pure SQL SUM gives us
      const sqlTotal = await pool.query(`
        SELECT COUNT(*)::int as count, COALESCE(SUM(total_amount), 0)::float as total
        FROM procurementplans
        WHERE dept_id = $1 AND (is_deleted = false OR is_deleted IS NULL)
      `, [deptId]);
      
      console.log('\n=== SQL Aggregation Result ===');
      console.log('Active entries (from SQL):', sqlTotal.rows[0].count);
      console.log('Total budget (from SQL):', sqlTotal.rows[0].total);
    }
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
})();
