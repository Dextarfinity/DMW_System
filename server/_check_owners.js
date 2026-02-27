const { Pool } = require('pg');
const pool = new Pool({ host:'192.168.100.235', port:5432, database:'dmw_db', user:'postgres', password:'dmw123' });

async function main() {
  // Check the audit trail / created_by to determine original division
  const result = await pool.query(`
    SELECT pp.id, pp.created_by, u.username, u.dept_id as user_dept_id, d.code as user_dept_code
    FROM procurementplans pp
    LEFT JOIN users u ON pp.created_by = u.id
    LEFT JOIN departments d ON u.dept_id = d.id
    WHERE pp.id IN (70, 86)
  `);
  console.log('=== Entry owner info ===');
  result.rows.forEach(r => console.log(JSON.stringify(r)));

  // Check nearby entries for context
  const nearby = await pool.query(`
    SELECT id, dept_id, description, item_description 
    FROM procurementplans 
    WHERE id BETWEEN 65 AND 90 
    ORDER BY id
  `);
  console.log('\n=== Entries 65-90 for context ===');
  nearby.rows.forEach(r => console.log('ID ' + r.id + ': dept_id=' + r.dept_id + ', desc=' + (r.description || r.item_description || 'NULL').substring(0, 50)));

  pool.end();
}
main().catch(e => { console.error(e); pool.end(); });
