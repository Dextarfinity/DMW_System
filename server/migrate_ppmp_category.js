 const { Pool } = require('pg');
const pool = new Pool({
  host: '192.168.100.235',
  port: 5432,
  database: 'dmw_db',
  user: 'postgres',
  password: 'dmw123'
});

(async () => {
  // 1. Add category column if not exists
  await pool.query(`
    ALTER TABLE procurementplans 
    ADD COLUMN IF NOT EXISTS category VARCHAR(200)
  `);
  console.log('Added category column to procurementplans');

  // 2. Add item_id FK column if not exists
  await pool.query(`
    ALTER TABLE procurementplans 
    ADD COLUMN IF NOT EXISTS item_id INT REFERENCES items(id) ON DELETE SET NULL
  `);
  console.log('Added item_id FK column to procurementplans');

  // 3. Backfill category from description patterns for existing PPMP entries
  const mappings = [
    { pattern: '%ICT%supplies%', category: 'ICT OFFICE SUPPLIES EXPENSES' },
    { pattern: '%ICT%equipment%', category: 'SEMI-ICT EQUIPMENT' },
    { pattern: '%office%supplies%', category: 'OFFICE SUPPLIES EXPENSES' },
    { pattern: '%semi%office%', category: 'SEMI-OFFICE EQUIPMENT' },
    { pattern: '%semi%furniture%', category: 'SEMI-FURNITURE & FIXTURES' },
    { pattern: '%semi%ICT%', category: 'SEMI-ICT EQUIPMENT' },
    { pattern: '%other%supplies%', category: 'OTHER SUPPLIES AND MATERIALS' },
    { pattern: '%capital%outlay%', category: 'CAPITAL OUTLAY' },
    { pattern: '%hiring%security%', category: 'OTHER MOOE' },
    { pattern: '%hiring%job%', category: 'OTHER MOOE' },
    { pattern: '%hiring%janitorial%', category: 'OTHER MOOE' },
    { pattern: '%postage%', category: 'OTHER MOOE' },
    { pattern: '%internet%', category: 'OTHER MOOE' },
    { pattern: '%insurance%', category: 'OTHER MOOE' },
    { pattern: '%rent%', category: 'OTHER MOOE' },
    { pattern: '%water%', category: 'OTHER MOOE' },
    { pattern: '%electricity%', category: 'OTHER MOOE' },
    { pattern: '%fidelity%', category: 'OTHER MOOE' },
    { pattern: '%motor%vehicle%', category: 'OTHER MOOE' },
    { pattern: '%training%', category: 'TRAININGS & ACTIVITIES' },
    { pattern: '%conduct%', category: 'TRAININGS & ACTIVITIES' },
    { pattern: '%lecture%', category: 'TRAININGS & ACTIVITIES' },
    { pattern: '%orientation%', category: 'TRAININGS & ACTIVITIES' },
    { pattern: '%celebration%', category: 'TRAININGS & ACTIVITIES' },
    { pattern: '%capability%', category: 'TRAININGS & ACTIVITIES' },
    { pattern: '%bagong%', category: 'TRAININGS & ACTIVITIES' },
  ];

  for (const m of mappings) {
    const res = await pool.query(
      `UPDATE procurementplans SET category = $1 WHERE LOWER(description) LIKE LOWER($2) AND (category IS NULL OR category = '')`,
      [m.category, m.pattern]
    );
    if (res.rowCount > 0) console.log(`  Mapped "${m.pattern}" → "${m.category}" (${res.rowCount} rows)`);
  }

  // Set default category for any remaining entries without category
  const res = await pool.query(
    `UPDATE procurementplans SET category = 'GENERAL PROCUREMENT' WHERE (category IS NULL OR category = '') AND ppmp_no IS NOT NULL`
  );
  if (res.rowCount > 0) console.log(`  Set default category for ${res.rowCount} remaining entries`);

  // 4. Verify
  const cats = await pool.query(`SELECT category, COUNT(*) as cnt FROM procurementplans WHERE ppmp_no IS NOT NULL GROUP BY category ORDER BY category`);
  console.log('\nPPMP Categories:');
  cats.rows.forEach(r => console.log(`  ${r.category}: ${r.cnt} items`));

  await pool.end();
  console.log('\nDone!');
})();
