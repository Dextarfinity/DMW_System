const { Pool } = require('pg');
const pool = new Pool({ host: '192.168.100.235', port: 5432, database: 'dmw_db', user: 'postgres', password: 'dmw123' });

/**
 * Migration: Add 'section' column to procurementplans
 * Section = top-level grouping (yellow header in Excel PPMP)
 * Category = item catalog category (bold underlined subsection)
 * 
 * Sections based on Philippine PPMP Excel templates:
 *   OFFICE OPERATION - Office supplies, ICT supplies, cleaning, semi-ICT, semi-office equip
 *   SEMI- FURNITURE & FIXTURES - Semi-expendable furniture
 *   TRAININGS & ACTIVITIES - Trainings, seminars, events
 *   CAPITAL OUTLAY - Major equipment purchases
 *   GENERAL PROCUREMENT - Catch-all for activities, events, services
 */

// Section mapping: category → section
const CATEGORY_TO_SECTION = {
  // OFFICE OPERATION
  'EXPENDABLE': 'OFFICE OPERATION',
  'ICT OFFICE SUPPLIES EXPENSES': 'OFFICE OPERATION',
  'OFFICE SUPPLIES EXPENSES': 'OFFICE OPERATION',
  'CLEANING EQUIPMENT AND SUPPLIES': 'OFFICE OPERATION',
  'PAPER MATERIALS AND PRODUCTS': 'OFFICE OPERATION',
  'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES': 'OFFICE OPERATION',
  'INFORMATION AND COMMUNICATION TECHNOLOGY (ICT) EQUIPMENT AND DEVICES AND ACCESSORIES': 'OFFICE OPERATION',
  'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)': 'OFFICE OPERATION',
  'OTHER SUPPLIES AND MATERIALS': 'OFFICE OPERATION',
  'OTHER MOOE': 'OFFICE OPERATION',
  'SOFTWARE': 'OFFICE OPERATION',
  'SEMI-ICT EQUIPMENT': 'OFFICE OPERATION',
  'SEMI-OFFICE EQUIPMENT': 'OFFICE OPERATION',
  'SEMI-EXPENDABLE': 'OFFICE OPERATION',
  'ALCOHOL OR ACETONE BASED ANTISEPTICS': 'OFFICE OPERATION',
  'BATTERIES AND CELLS AND ACCESSORIES': 'OFFICE OPERATION',
  'COLOR COMPOUNDS AND DISPERSIONS': 'OFFICE OPERATION',
  'CONSUMER ELECTRONICS': 'OFFICE OPERATION',
  'FILMS': 'OFFICE OPERATION',
  'FLAG OR ACCESSORIES': 'OFFICE OPERATION',
  'LIGHTING AND FIXTURES AND ACCESSORIES': 'OFFICE OPERATION',
  'MANUFACTURING COMPONENTS AND SUPPLIES': 'OFFICE OPERATION',
  'MEASURING AND OBSERVING AND TESTING EQUIPMENT': 'OFFICE OPERATION',
  'PERFUMES OR COLOGNES OR FRAGRANCES': 'OFFICE OPERATION',
  'PESTICIDES OR PEST REPELLENTS': 'OFFICE OPERATION',
  'PRINTED PUBLICATIONS': 'OFFICE OPERATION',
  'ARTS AND CRAFTS EQUIPMENT AND ACCESSORIES AND SUPPLIES': 'OFFICE OPERATION',
  'AUDIO AND VISUAL EQUIPMENT AND SUPPLIES': 'OFFICE OPERATION',
  'HEATING AND VENTILATION AND AIR CIRCULATION': 'OFFICE OPERATION',
  'FIRE FIGHTING EQUIPMENT': 'OFFICE OPERATION',
  'CLOUD COMPUTING SERVICES': 'OFFICE OPERATION',
  'AIRLINE TICKETS': 'OFFICE OPERATION',

  // SEMI- FURNITURE & FIXTURES
  'SEMI-FURNITURE & FIXTURES': 'SEMI- FURNITURE & FIXTURES',
  'FURNITURE AND FURNISHINGS': 'SEMI- FURNITURE & FIXTURES',

  // TRAININGS & ACTIVITIES
  'TRAININGS & ACTIVITIES': 'TRAININGS & ACTIVITIES',

  // CAPITAL OUTLAY
  'CAPITAL OUTLAY': 'CAPITAL OUTLAY',
  'MOTOR VEHICLE': 'CAPITAL OUTLAY',
};

(async () => {
  try {
    // Step 1: Add section column if it doesn't exist
    const colCheck = await pool.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name='procurementplans' AND column_name='section'
    `);

    if (colCheck.rows.length === 0) {
      await pool.query(`ALTER TABLE procurementplans ADD COLUMN section VARCHAR(200)`);
      console.log('Added section column to procurementplans');
    } else {
      console.log('Section column already exists');
    }

    // Step 2: Backfill section from category
    const plans = await pool.query(`
      SELECT pp.id, pp.category, it.category as item_category 
      FROM procurementplans pp 
      LEFT JOIN items it ON pp.item_id = it.id 
      WHERE pp.is_deleted = false
    `);

    let updated = 0;
    for (const row of plans.rows) {
      const cat = row.item_category || row.category || '';
      const section = CATEGORY_TO_SECTION[cat] || 'GENERAL PROCUREMENT';
      await pool.query(`UPDATE procurementplans SET section = $1 WHERE id = $2`, [section, row.id]);
      updated++;
    }
    console.log(`Backfilled section for ${updated} entries`);

    // Step 3: Verify
    const verify = await pool.query(`
      SELECT section, COUNT(*) as cnt 
      FROM procurementplans 
      WHERE is_deleted = false 
      GROUP BY section 
      ORDER BY section
    `);
    console.log('\nSection distribution:');
    verify.rows.forEach(r => console.log(`  ${r.section || 'NULL'}: ${r.cnt} entries`));

    // Also show section → category breakdown
    const breakdown = await pool.query(`
      SELECT pp.section, COALESCE(it.category, pp.category) as cat, COUNT(*) as cnt
      FROM procurementplans pp 
      LEFT JOIN items it ON pp.item_id = it.id 
      WHERE pp.is_deleted = false 
      GROUP BY pp.section, COALESCE(it.category, pp.category)
      ORDER BY pp.section, cat
    `);
    console.log('\nSection → Category breakdown:');
    let lastSection = '';
    breakdown.rows.forEach(r => {
      if (r.section !== lastSection) {
        console.log(`\n  [${r.section}]`);
        lastSection = r.section;
      }
      console.log(`    ${r.cat || 'UNCATEGORIZED'}: ${r.cnt}`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
})();
