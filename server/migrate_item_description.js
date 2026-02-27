/**
 * Migration: Add item_description column to procurementplans
 * 
 * This column stores the PPMP-specific description for each linked item.
 * It is separate from the items catalog description — it's the "subsection"
 * description entered during the PPMP creation process.
 * 
 * After adding the column, backfill from existing description field.
 */
const { Pool } = require('pg');

const pool = new Pool({
  host: '192.168.100.235',
  port: 5432,
  database: 'dmw_db',
  user: 'postgres',
  password: 'dmw123'
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('=== Adding item_description column to procurementplans ===\n');

    // 1. Add the column
    await client.query(`
      ALTER TABLE procurementplans 
      ADD COLUMN IF NOT EXISTS item_description TEXT
    `);
    console.log('✅ Column item_description added (or already exists)');

    // 2. Backfill: copy existing description into item_description
    //    for entries that have a linked item_id
    const result = await client.query(`
      UPDATE procurementplans 
      SET item_description = description 
      WHERE item_id IS NOT NULL 
        AND (item_description IS NULL OR item_description = '')
        AND description IS NOT NULL 
        AND description != ''
      RETURNING id, ppmp_no, item_id
    `);
    console.log(`✅ Backfilled ${result.rowCount} entries with existing descriptions`);

    // 3. Show sample data
    const sample = await client.query(`
      SELECT pp.id, pp.ppmp_no, pp.item_id, pp.description, pp.item_description,
             it.name as item_name, it.unit as item_unit
      FROM procurementplans pp
      LEFT JOIN items it ON pp.item_id = it.id
      WHERE pp.item_id IS NOT NULL
      ORDER BY pp.id
      LIMIT 5
    `);
    console.log('\nSample entries with item_description:');
    sample.rows.forEach(r => {
      console.log(`  #${r.id} ${r.ppmp_no} → item: ${r.item_name} (${r.item_unit})`);
      console.log(`    description: ${(r.description || '').substring(0, 60)}`);
      console.log(`    item_description: ${(r.item_description || '').substring(0, 60)}`);
    });

    console.log('\n✅ Migration complete!');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
