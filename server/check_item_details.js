const { Pool } = require('pg');
const pool = new Pool({ host: '192.168.100.235', port: 5432, database: 'dmw_db', user: 'postgres', password: 'dmw123' });

(async () => {
  try {
    // Show sample items with ALL fields to understand what description/unit data is available
    const r1 = await pool.query(`
      SELECT id, code, name, description, unit, unit_price, category
      FROM items 
      WHERE UPPER(name) LIKE '%INK%' OR UPPER(name) LIKE '%PAPER%' OR UPPER(name) LIKE '%ALCOHOL%'
      ORDER BY category, name
      LIMIT 30
    `);
    console.log('=== Sample items (INK/PAPER/ALCOHOL) ===');
    r1.rows.forEach(r => {
      console.log(`  [${r.id}] ${r.name}`);
      console.log(`    desc: "${r.description || 'NULL'}"`);
      console.log(`    unit: ${r.unit} | price: ${r.unit_price} | cat: ${r.category}`);
    });

    // Also show items with longer descriptions
    const r2 = await pool.query(`
      SELECT id, code, name, description, unit, unit_price, category
      FROM items 
      WHERE description IS NOT NULL AND LENGTH(description) > 10
      ORDER BY LENGTH(description) DESC
      LIMIT 10
    `);
    console.log('\n=== Items with longest descriptions ===');
    r2.rows.forEach(r => {
      console.log(`  [${r.id}] ${r.name}`);
      console.log(`    desc: "${r.description}"`);
      console.log(`    unit: ${r.unit} | cat: ${r.category}`);
    });

    // Show current PPMP entries that have item_id linked
    const r3 = await pool.query(`
      SELECT pp.id, pp.description as ppmp_desc, pp.item_id,
             it.name as item_name, it.description as item_desc, it.unit as item_unit
      FROM procurementplans pp
      JOIN items it ON pp.item_id = it.id
      WHERE pp.is_deleted = false
      LIMIT 15
    `);
    console.log('\n=== PPMP entries with linked items ===');
    r3.rows.forEach(r => {
      console.log(`  [${r.id}] item: ${r.item_name}`);
      console.log(`    ppmp_desc: "${r.ppmp_desc}"`);
      console.log(`    item_desc: "${r.item_desc || 'NULL'}"`);
      console.log(`    item_unit: ${r.item_unit}`);
    });
  } catch(e) { console.error(e.message); }
  finally { await pool.end(); }
})();
