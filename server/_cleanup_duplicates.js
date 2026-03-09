const { Pool } = require('pg');
const pool = new Pool({ user:'postgres', host:'192.168.100.235', database:'dmw_db', password:'dmw123', port:5432 });

(async () => {
  try {
    // Delete duplicate activity_logs: for each pair where same user/action/table/record logged within 2 seconds, keep only the first
    const result = await pool.query(`
      DELETE FROM activity_logs a
      USING activity_logs b
      WHERE a.id > b.id
        AND a.user_id IS NOT DISTINCT FROM b.user_id
        AND a.action = b.action
        AND a.table_name = b.table_name
        AND a.record_id IS NOT DISTINCT FROM b.record_id
        AND a.reference IS NOT DISTINCT FROM b.reference
        AND ABS(EXTRACT(EPOCH FROM (a.created_at - b.created_at))) < 2
    `);
    console.log('Deleted', result.rowCount, 'duplicate rows');

    // Refresh the materialized view
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY activity_logs_view');
    console.log('Materialized view refreshed');

    // Show remaining logs
    const check = await pool.query('SELECT id, username, action, table_name, created_at FROM activity_logs ORDER BY created_at DESC LIMIT 15');
    console.log('\nRemaining logs:');
    check.rows.forEach(r => console.log(`  ${r.id} | ${r.username || '(null)'} | ${r.action} | ${r.table_name} | ${r.created_at}`));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
})();
