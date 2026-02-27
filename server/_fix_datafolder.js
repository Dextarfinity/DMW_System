const { Pool } = require('pg');
const pool = new Pool({ host:'192.168.100.235', port:5432, database:'dmw_db', user:'postgres', password:'dmw123' });

async function main() {
  // MWPSD dept_id = 3
  const result = await pool.query(
    `UPDATE procurementplans SET dept_id = 3, updated_at = CURRENT_TIMESTAMP WHERE id = 71 RETURNING id, dept_id, item_description, description`,
  );
  console.log('Updated:', JSON.stringify(result.rows[0]));
  
  // Verify
  const check = await pool.query(`
    SELECT pp.id, pp.dept_id, d.code as dept_code, pp.item_description, pp.description 
    FROM procurementplans pp 
    LEFT JOIN departments d ON pp.dept_id = d.id 
    WHERE pp.id = 71
  `);
  console.log('Verified:', JSON.stringify(check.rows[0]));
  
  pool.end();
}
main().catch(e => { console.error(e); pool.end(); });
