const { Pool } = require('pg');
const pool = new Pool({ host:'192.168.100.235', port:5432, database:'dmw_db', user:'postgres', password:'dmw123' });

async function main() {
  // Item catalog categories
  let r = await pool.query('SELECT category, COUNT(*) as cnt FROM items WHERE category IS NOT NULL GROUP BY category ORDER BY category');
  console.log('=== ITEM CATALOG CATEGORIES ===');
  r.rows.forEach(x => console.log('  ', x.category, ':', x.cnt));
  console.log('Total categories:', r.rows.length);

  // Sample items per category
  r = await pool.query('SELECT id, code, name, category, unit, unit_price, description FROM items ORDER BY category, name LIMIT 30');
  console.log('\n=== SAMPLE ITEMS ===');
  r.rows.forEach(x => console.log(x.code, '|', x.name, '|', x.category, '|', x.unit, '| P' + x.unit_price, '|', (x.description||'').substring(0,40)));

  // Current PPMP categories vs item_category from JOIN
  r = await pool.query(`SELECT pp.id, pp.category, pp.item_id, pp.description, it.category as item_cat, it.name as item_name
    FROM procurementplans pp LEFT JOIN items it ON pp.item_id = it.id
    ORDER BY pp.category LIMIT 20`);
  console.log('\n=== PPMP ROWS (with item link) ===');
  r.rows.forEach(x => console.log('PPMP#' + x.id, '| ppmp_cat:', x.category, '| item_id:', x.item_id, '| item_cat:', x.item_cat, '| item:', x.item_name, '| desc:', (x.description||'').substring(0,40)));

  await pool.end();
}
main().catch(e => { console.error(e); pool.end(); });
