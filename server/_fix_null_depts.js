const { Pool } = require('pg');
const pool = new Pool({ host:'192.168.100.235', port:5432, database:'dmw_db', user:'postgres', password:'dmw123' });

async function main() {
  // ID 70: should be MWPTD (dept_id=2), between entries 69 (dept_id=2) and 71 (dept_id=3)
  await pool.query('UPDATE procurementplans SET dept_id = 2 WHERE id = 70');
  console.log('ID 70 -> dept_id=2 (MWPTD)');

  // ID 86: should be WRSD (dept_id=4), between entries 85 (dept_id=4) and 87 (dept_id=4)
  await pool.query('UPDATE procurementplans SET dept_id = 4 WHERE id = 86');
  console.log('ID 86 -> dept_id=4 (WRSD)');

  // Verify no more NULL dept_id
  const check = await pool.query("SELECT id, dept_id FROM procurementplans WHERE dept_id IS NULL AND is_deleted = false");
  console.log('\nRemaining NULL dept_id entries:', check.rows.length);
  check.rows.forEach(r => console.log('  ID', r.id));

  pool.end();
}
main().catch(e => { console.error(e); pool.end(); });
