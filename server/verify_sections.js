const { Pool } = require('pg');
const pool = new Pool({ host: '192.168.100.235', port: 5432, database: 'dmw_db', user: 'postgres', password: 'dmw123' });

(async () => {
  try {
    const r = await pool.query(`
      SELECT pp.section, COALESCE(it.category, pp.category) as cat, pp.description
      FROM procurementplans pp
      LEFT JOIN items it ON pp.item_id = it.id
      WHERE pp.is_deleted = false AND pp.section = 'OFFICE OPERATION'
      ORDER BY cat, pp.ppmp_no
      LIMIT 20
    `);
    console.log('=== OFFICE OPERATION items ===');
    r.rows.forEach(x => console.log(`  ${x.cat} | ${(x.description || '').substring(0, 60)}`));
    
    const r2 = await pool.query(`
      SELECT pp.section, COALESCE(it.category, pp.category) as cat, COUNT(*) as cnt
      FROM procurementplans pp
      LEFT JOIN items it ON pp.item_id = it.id
      WHERE pp.is_deleted = false
      GROUP BY pp.section, COALESCE(it.category, pp.category)
      ORDER BY pp.section, cat
    `);
    console.log('\n=== Full Section → Category breakdown ===');
    let lastSec = '';
    r2.rows.forEach(x => {
      if (x.section !== lastSec) { console.log(`\n[${x.section}]`); lastSec = x.section; }
      console.log(`  ${x.cat}: ${x.cnt}`);
    });
  } catch(e) { console.error(e.message); }
  finally { await pool.end(); }
})();
