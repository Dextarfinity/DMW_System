const { Pool } = require('pg');
const pool = new Pool({ host: '192.168.100.235', port: 5432, database: 'dmw_db', user: 'postgres', password: 'dmw123' });

(async () => {
  try {
    // Check current PPMP descriptions to see format
    const r1 = await pool.query(`
      SELECT pp.id, pp.section, pp.category, pp.description, pp.item_id,
             it.name as item_name, it.category as item_category, it.unit as item_unit, it.description as item_desc
      FROM procurementplans pp
      LEFT JOIN items it ON pp.item_id = it.id
      WHERE pp.is_deleted = false
      ORDER BY pp.section, pp.category, pp.ppmp_no
    `);
    
    console.log('=== ALL PPMP entries: section → category → description ===');
    let lastSection = '', lastCat = '';
    r1.rows.forEach(r => {
      if (r.section !== lastSection) {
        console.log(`\n══════ [SECTION: ${r.section}] ══════`);
        lastSection = r.section;
        lastCat = '';
      }
      const cat = r.item_category || r.category || '?';
      if (cat !== lastCat) {
        console.log(`  ── [CATEGORY: ${cat}] ──`);
        lastCat = cat;
      }
      const descPreview = (r.description || '').replace(/\n/g, ' \\n ').substring(0, 80);
      console.log(`    [${r.id}] desc: "${descPreview}" | item: ${r.item_name || 'NONE'}`);
    });

    // Show INK-related items in catalog
    console.log('\n=== INK items in catalog ===');
    const r2 = await pool.query(`SELECT id, code, name, description, unit, category FROM items WHERE UPPER(name) LIKE '%INK%' ORDER BY name`);
    r2.rows.forEach(r => console.log(`  [${r.id}] ${r.name} | unit: ${r.unit} | cat: ${r.category} | desc: ${r.description || 'NULL'}`));

  } catch(e) { console.error(e.message); }
  finally { await pool.end(); }
})();
