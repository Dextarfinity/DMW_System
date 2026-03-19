// Quick database check script
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dmw_db',
  password: 'dmw123',
  port: 5432,
});

async function checkTables() {
  try {
    console.log('Connecting to database...');

    // Check sections
    const sections = await pool.query('SELECT * FROM ppmp_sections WHERE is_active = true ORDER BY display_order');
    console.log('\n=== PPMP SECTIONS ===');
    console.log(`Found ${sections.rows.length} sections:`);
    sections.rows.forEach(s => console.log(`  - ${s.name}`));

    // Check categories
    const categories = await pool.query(`
      SELECT pc.name, ps.name as section_name
      FROM ppmp_categories pc
      JOIN ppmp_sections ps ON pc.section_id = ps.id
      WHERE pc.is_active = true
      ORDER BY pc.display_order
    `);
    console.log('\n=== PPMP CATEGORIES ===');
    console.log(`Found ${categories.rows.length} categories:`);
    categories.rows.forEach(c => console.log(`  - ${c.name} (${c.section_name})`));

    console.log('\n✓ Database connection and tables verified successfully!');
  } catch (err) {
    console.error('Error:', err.message);
    if (err.code === '42P01') {
      console.log('\n⚠ Tables do not exist. Run the migration script first.');
    }
  } finally {
    await pool.end();
  }
}

checkTables();
