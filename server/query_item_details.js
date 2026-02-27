const { Pool } = require('pg');
const pool = new Pool({ host:'192.168.100.235', port:5432, database:'dmw_db', user:'postgres', password:'dmw123' });

async function main() {
  // Items table columns
  let r = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='items' ORDER BY ordinal_position");
  console.log('=== items table columns ===');
  r.rows.forEach(x => console.log('  ', x.column_name, x.data_type));

  // INK items
  r = await pool.query("SELECT id, code, name, description, category, unit, unit_price FROM items WHERE name ILIKE '%INK%' ORDER BY name LIMIT 15");
  console.log('\n=== INK Items ===');
  r.rows.forEach(x => console.log(JSON.stringify(x)));

  // Paper items
  r = await pool.query("SELECT id, code, name, description, category, unit, unit_price FROM items WHERE name ILIKE '%Paper%' ORDER BY name LIMIT 10");
  console.log('\n=== Paper Items ===');
  r.rows.forEach(x => console.log(JSON.stringify(x)));

  // Alcohol items
  r = await pool.query("SELECT id, code, name, description, category, unit, unit_price FROM items WHERE name ILIKE '%alcohol%' OR name ILIKE '%staple%' ORDER BY name LIMIT 10");
  console.log('\n=== Alcohol/Staple Items ===');
  r.rows.forEach(x => console.log(JSON.stringify(x)));

  // Current PPMP rows sample
  r = await pool.query("SELECT pp.id, pp.description, pp.category, pp.item_id, it.name as item_name, it.description as item_desc, it.category as item_cat FROM procurementplans pp LEFT JOIN items it ON pp.item_id = it.id WHERE pp.item_id IS NOT NULL LIMIT 5");
  console.log('\n=== PPMP with linked items ===');
  r.rows.forEach(x => console.log(JSON.stringify(x)));

  // PPMP without linked items
  r = await pool.query("SELECT pp.id, pp.description, pp.category FROM procurementplans pp WHERE pp.item_id IS NULL LIMIT 10");
  console.log('\n=== PPMP without items ===');
  r.rows.forEach(x => console.log(JSON.stringify(x)));

  await pool.end();
}
main().catch(e => { console.error(e); pool.end(); });
