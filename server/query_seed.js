const { Pool } = require('pg');

const pool = new Pool({
  host: '192.168.100.235',
  port: 5432,
  database: 'dmw_db',
  user: 'postgres',
  password: 'dmw123'
});

async function querySeed() {
  try {
    // Query sections
    console.log('\n========== PPMP SECTIONS ==========');
    const sectionsResult = await pool.query('SELECT id, name, description, display_order, is_active FROM ppmp_sections ORDER BY display_order');
    console.table(sectionsResult.rows);

    // Query categories
    console.log('\n========== PPMP CATEGORIES ==========');
    const categoriesResult = await pool.query(`
      SELECT pc.id, pc.name, ps.name as section, pc.display_order, pc.is_active 
      FROM ppmp_categories pc
      JOIN ppmp_sections ps ON pc.section_id = ps.id
      ORDER BY ps.display_order, pc.display_order
    `);
    console.table(categoriesResult.rows);

    console.log('\n✅ Query completed successfully');
  } catch (err) {
    console.error('Query error:', err.message);
  } finally {
    await pool.end();
  }
}

querySeed();
