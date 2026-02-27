const { Pool } = require('pg');
const pool = new Pool({ host:'192.168.100.235', port:5432, database:'dmw_db', user:'postgres', password:'dmw123' });

async function main() {
  const result = await pool.query(`
    SELECT id, item_id, dept_id, description, item_description, status, updated_at
    FROM procurementplans 
    WHERE dept_id IS NULL AND is_deleted = false
    ORDER BY id
  `);
  console.log('Entries with NULL dept_id:', result.rows.length);
  result.rows.forEach(r => {
    console.log('ID ' + r.id + ': item_id=' + (r.item_id||'NULL') + ', status=' + r.status + ', updated=' + r.updated_at);
    console.log('  desc: ' + (r.description || r.item_description || 'NULL').substring(0, 60));
  });
  pool.end();
}
main().catch(e => { console.error(e); pool.end(); });
