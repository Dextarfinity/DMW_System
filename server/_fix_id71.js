const { Pool } = require('pg');
const pool = new Pool({
  host: '192.168.100.235',
  port: 5432,
  database: 'dmw_db',
  user: 'postgres',
  password: 'dmw123'
});

async function fix() {
  // ID 71 has swapped data:
  // description currently has the materials text (should be item_description)
  // item_description currently has "DATA FOLDER\n   Unit: PCS" (should be description)
  
  const newDesc = 'DATA FOLDER';
  const newItemDesc = 'Materials: made of chipboard, 2.5mm thick, Dimension (WxHxL): 75mm (3") x 230mm (9") x 380mm (15"). With all steel lever arch file mechanism and taglia lock.\nUnit: PCS';
  
  const res = await pool.query(
    'UPDATE procurementplans SET description = $1, item_description = $2 WHERE id = 71',
    [newDesc, newItemDesc]
  );
  console.log('Fixed ID 71:', res.rowCount, 'row updated');
  
  // Verify
  const check = await pool.query('SELECT id, description, item_description, item_id FROM procurementplans WHERE id = 71');
  const row = check.rows[0];
  console.log('Verified:');
  console.log('  description:', JSON.stringify(row.description));
  console.log('  item_description:', JSON.stringify(row.item_description));
  
  await pool.end();
}

fix().catch(e => { console.error(e.message); pool.end(); });
