const { Pool } = require('pg');
const pool = new Pool({
  host: '192.168.100.235',
  port: 5432,
  database: 'dmw_db',
  user: 'postgres',
  password: 'dmw123'
});

(async () => {
  // 1. Add missing UOMs
  const newUOMs = [
    ['BOOK', 'BOOK'],
    ['BUNDLE', 'BUNDLE'],
    ['CART', 'CARTRIDGE'],
    ['LENGTH', 'LENGTH'],
    ['LICENSE', 'LICENSE'],
    ['LOT', 'LOT'],
    ['PAD', 'PAD'],
    ['POUCH', 'POUCH'],
    ['SPOOL', 'SPOOL'],
    ['TICKET', 'TICKET'],
    ['TUBE', 'TUBE'],
    ['JAR', 'JAR'],
  ];

  for (const [abbr, name] of newUOMs) {
    try {
      await pool.query(
        'INSERT INTO uoms (abbreviation, name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [abbr, name]
      );
      console.log(`Added UOM: ${abbr} / ${name}`);
    } catch (err) {
      console.log(`Skipped UOM ${abbr}: ${err.message}`);
    }
  }

  // 2. Normalize items.unit to use abbreviation (uppercase)
  const mappings = [
    ['bottle', 'BOT'],
    ['gallon', 'GAL'],
    ['piece', 'PCS'],
    ['bot', 'BOT'],
    ['gal', 'GAL'],
    ['pcs', 'PCS'],
    ['box', 'BOX'],
    ['can', 'CAN'],
    ['dozen', 'DOZEN'],
    ['pack', 'PACK'],
    ['pair', 'PAIR'],
    ['ream', 'REAM'],
    ['roll', 'ROLL'],
    ['set', 'SET'],
    ['unit', 'UNIT'],
    ['bundle', 'BUNDLE'],
    ['cart', 'CART'],
    ['lot', 'LOT'],
    ['pad', 'PAD'],
    ['pouch', 'POUCH'],
    ['tube', 'TUBE'],
    ['book', 'BOOK'],
    ['license', 'LICENSE'],
    ['ticket', 'TICKET'],
  ];

  for (const [oldVal, newVal] of mappings) {
    const res = await pool.query(
      'UPDATE items SET unit = $1 WHERE LOWER(TRIM(unit)) = $2 AND unit != $1',
      [newVal, oldVal]
    );
    if (res.rowCount > 0) {
      console.log(`Normalized "${oldVal}" → "${newVal}" (${res.rowCount} rows)`);
    }
  }

  // 3. Verify
  const r = await pool.query('SELECT abbreviation, name FROM uoms ORDER BY abbreviation');
  console.log('\nAll UOMs now:', r.rows);

  const r2 = await pool.query("SELECT DISTINCT unit FROM items WHERE unit IS NOT NULL AND TRIM(unit) != '' ORDER BY unit");
  console.log('\nAll item units now:', r2.rows.map(r => r.unit));

  await pool.end();
  console.log('\nDone!');
})();
