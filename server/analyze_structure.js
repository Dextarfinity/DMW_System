const { Pool } = require('pg');
const pool = new Pool({ host: '192.168.100.235', port: 5432, database: 'dmw_db', user: 'postgres', password: 'dmw123' });

(async () => {
  try {
    // 1. PPMP columns
    const r1 = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='procurementplans' ORDER BY ordinal_position`);
    console.log('=== PPMP COLUMNS ===');
    r1.rows.forEach(c => console.log(`  ${c.column_name} - ${c.data_type}`));

    // 2. Distinct category + item_category combos
    const r2 = await pool.query(`
      SELECT DISTINCT pp.category as ppmp_category, it.category as item_category, it.gam_classification
      FROM procurementplans pp
      LEFT JOIN items it ON pp.item_id = it.id
      WHERE pp.is_deleted = false
      ORDER BY 1, 2
    `);
    console.log('\n=== PPMP category + item_category + gam_classification ===');
    r2.rows.forEach(r => console.log(`  ppmp: ${r.ppmp_category} | item_cat: ${r.item_category} | gam: ${r.gam_classification}`));

    // 3. Distinct gam_classification values
    const r3 = await pool.query(`SELECT DISTINCT gam_classification FROM items WHERE gam_classification IS NOT NULL ORDER BY 1`);
    console.log('\n=== Distinct gam_classification ===');
    r3.rows.forEach(r => console.log(`  ${r.gam_classification}`));

    // 4. Distinct item categories
    const r4 = await pool.query(`SELECT DISTINCT category FROM items ORDER BY 1`);
    console.log('\n=== Distinct item categories ===');
    r4.rows.forEach(r => console.log(`  ${r.category}`));

    // 5. Sample PPMP entries with all fields
    const r5 = await pool.query(`
      SELECT pp.id, pp.ppmp_no, pp.description, pp.category, pp.item_id, pp.project_type,
             it.name as item_name, it.category as item_category, it.gam_classification
      FROM procurementplans pp
      LEFT JOIN items it ON pp.item_id = it.id
      WHERE pp.is_deleted = false
      ORDER BY COALESCE(it.category, pp.category), pp.ppmp_no
      LIMIT 30
    `);
    console.log('\n=== Sample PPMP entries (first 30) ===');
    r5.rows.forEach(r => {
      console.log(`  [${r.id}] ${r.ppmp_no} | cat: ${r.category} | item_cat: ${r.item_category} | gam: ${r.gam_classification}`);
      console.log(`       desc: ${(r.description || '').substring(0, 80)}`);
    });

    // 6. Check project_type values
    const r6 = await pool.query(`SELECT DISTINCT project_type FROM procurementplans WHERE is_deleted=false ORDER BY 1`);
    console.log('\n=== Distinct project_type ===');
    r6.rows.forEach(r => console.log(`  ${r.project_type}`));

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
})();
