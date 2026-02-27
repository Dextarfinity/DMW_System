const { Pool } = require('pg');
const pool = new Pool({ host:'192.168.100.235', port:5432, database:'dmw_db', user:'postgres', password:'dmw123' });

pool.query('SELECT id, item_id, item_description, description, section, category FROM procurementplans ORDER BY id LIMIT 20')
  .then(r => {
    console.log('=== PPMP item_description vs description ===');
    r.rows.forEach(row => {
      console.log(`ID ${row.id}: item_id=${row.item_id || 'NULL'}, section=${row.section || 'NULL'}, category=${row.category || 'NULL'}`);
      console.log(`  item_description: ${(row.item_description || 'NULL').substring(0, 80)}`);
      console.log(`  description:      ${(row.description || 'NULL').substring(0, 80)}`);
    });
    pool.end();
  })
  .catch(e => { console.error(e.message); pool.end(); });
