const { Pool } = require('pg');
const pool = new Pool({ user:'postgres', host:'192.168.100.235', database:'dmw_db', password:'dmw123', port:5432 });

(async () => {
  try {
    const tbl = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_log')");
    console.log('audit_log table exists:', tbl.rows[0].exists);
    
    if (tbl.rows[0].exists) {
      const cnt = await pool.query('SELECT COUNT(*) FROM audit_log');
      console.log('audit_log row count:', cnt.rows[0].count);
      const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'audit_log' ORDER BY ordinal_position");
      console.log('audit_log columns:', cols.rows.map(r => r.column_name + ' (' + r.data_type + ')').join(', '));
    }

    const mv = await pool.query("SELECT EXISTS (SELECT FROM pg_matviews WHERE matviewname = 'activity_logs_view')");
    console.log('activity_logs_view exists:', mv.rows[0].exists);

    const roles = await pool.query('SELECT DISTINCT role FROM users ORDER BY role');
    console.log('User roles:', roles.rows.map(r => r.role).join(', '));

    const tables = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
    console.log('\nAll tables:', tables.rows.map(r => r.tablename).join(', '));
  } catch(err) { console.error('Error:', err.message); }
  finally { await pool.end(); }
})();
