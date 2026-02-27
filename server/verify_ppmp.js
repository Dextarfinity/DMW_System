const { Pool } = require('pg');
const pool = new Pool({ host:'192.168.100.235', port:5432, database:'dmw_db', user:'postgres', password:'dmw123' });

async function main() {
  const r = await pool.query(`
    SELECT pp.id, pp.description, pp.category, it.name as item_name, it.category as item_category
    FROM procurementplans pp 
    LEFT JOIN items it ON pp.item_id = it.id
    WHERE pp.ppmp_no IS NOT NULL 
    ORDER BY COALESCE(it.category, pp.category) ASC NULLS LAST, pp.ppmp_no ASC
    LIMIT 10
  `);
  r.rows.forEach(x => {
    console.log('id:' + x.id + ' | groupCat:' + (x.item_category || x.category) + ' | item:' + (x.item_name || 'none') + ' | desc: ' + (x.description || '').substring(0, 60));
  });
  await pool.end();
}
main().catch(e => { console.error(e); pool.end(); });
