const { Pool } = require('pg');
const pool = new Pool({ user:'postgres', host:'192.168.100.235', database:'dmw_db', password:'dmw123', port:5432 });

(async () => {
  try {
    // Check actual users columns
    const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");
    console.log('users columns:', cols.rows.map(r => r.column_name).join(', '));
  } catch(err) { console.error('Error:', err.message); }
  finally { await pool.end(); }
})();
