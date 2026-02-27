const { Pool } = require('pg');
const pool = new Pool({ host:'192.168.100.235', port:5432, database:'dmw_db', user:'postgres', password:'dmw123' });

async function main() {
  // Find DATA FOLDER in items catalog
  const items = await pool.query("SELECT id, code, name, category FROM items WHERE name ILIKE '%data folder%'");
  console.log('=== Items catalog matches ===');
  items.rows.forEach(r => console.log(JSON.stringify(r)));

  // Find DATA FOLDER in PPMP
  const plans = await pool.query(`
    SELECT pp.id, pp.item_id, pp.item_description, pp.description, pp.dept_id, pp.status, 
           pp.is_deleted, pp.section, pp.category, pp.fiscal_year,
           d.name as dept_name, d.code as dept_code
    FROM procurementplans pp 
    LEFT JOIN departments d ON pp.dept_id = d.id
    WHERE pp.description ILIKE '%data folder%' 
       OR pp.item_description ILIKE '%data folder%'
       OR pp.item_id IN (SELECT id FROM items WHERE name ILIKE '%data folder%')
    ORDER BY pp.id
  `);
  console.log('\n=== PPMP entries with DATA FOLDER ===');
  plans.rows.forEach(r => console.log(JSON.stringify(r)));

  // Check MWPSD department
  const dept = await pool.query("SELECT id, name, code FROM departments WHERE code ILIKE '%MWPSD%' OR name ILIKE '%MWPSD%' OR name ILIKE '%processing%'");
  console.log('\n=== MWPSD department ===');
  dept.rows.forEach(r => console.log(JSON.stringify(r)));

  // All MWPSD PPMP entries
  if (dept.rows.length > 0) {
    const deptId = dept.rows[0].id;
    const mwpsd = await pool.query(`
      SELECT pp.id, pp.item_id, pp.description, pp.item_description, pp.is_deleted, pp.status, pp.section, pp.category,
             it.name as item_name
      FROM procurementplans pp
      LEFT JOIN items it ON pp.item_id = it.id
      WHERE pp.dept_id = $1
      ORDER BY pp.id
    `, [deptId]);
    console.log('\n=== All MWPSD PPMP entries (dept_id=' + deptId + ') ===');
    mwpsd.rows.forEach(r => console.log('ID ' + r.id + ': deleted=' + r.is_deleted + ', item_id=' + r.item_id + ', item=' + (r.item_name||'NULL') + ', desc=' + (r.description||r.item_description||'NULL').substring(0,60)));
  }

  pool.end();
}
main().catch(e => { console.error(e); pool.end(); });
