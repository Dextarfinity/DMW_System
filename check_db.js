const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dmw_db',
  password: 'dmw123',
  port: 5432
});

async function check() {
  try {
    const sections = await pool.query('SELECT * FROM ppmp_sections ORDER BY display_order');
    console.log('=== PPMP SECTIONS ===');
    console.log(JSON.stringify(sections.rows, null, 2));

    const categories = await pool.query(`
      SELECT pc.id, pc.name, ps.name as section_name
      FROM ppmp_categories pc
      JOIN ppmp_sections ps ON pc.section_id = ps.id
      ORDER BY pc.display_order
    `);
    console.log('\n=== PPMP CATEGORIES ===');
    console.log(JSON.stringify(categories.rows, null, 2));
  } catch (e) {
    console.error('ERROR:', e.message);
    if (e.message.includes('does not exist')) {
      console.log('\n>>> Tables not found. Run migration:');
      console.log('psql -U postgres -d dmw_db -f server/database/migration_categories_sections_v1.sql');
    }
  } finally {
    pool.end();
  }
}

check();
