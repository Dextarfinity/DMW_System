const { Pool } = require('pg');
const pool = new Pool({
  host: '192.168.100.235',
  port: 5432,
  database: 'dmw_db',
  user: 'postgres',
  password: 'dmw123'
});

(async () => {
  const r1 = await pool.query("SELECT DISTINCT LOWER(TRIM(unit)) as u FROM items WHERE unit IS NOT NULL AND TRIM(unit) != '' ORDER BY u");
  console.log('DISTINCT UNITS:', r1.rows.map(r => r.u));

  const r2 = await pool.query("SELECT DISTINCT category FROM items WHERE category IS NOT NULL AND TRIM(category) != '' ORDER BY category");
  console.log('DISTINCT CATEGORIES:', r2.rows.map(r => r.category));

  const r3 = await pool.query('SELECT id, abbreviation, name FROM uoms ORDER BY abbreviation');
  console.log('EXISTING UOMS:', r3.rows);

  await pool.end();
})();
