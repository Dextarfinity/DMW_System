const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dmw_db',
  password: 'dmw123',
  port: 5432
});

async function addTrainingSection() {
  try {
    // Check if section exists
    const check = await pool.query("SELECT id FROM ppmp_sections WHERE name = 'TRAINING AND ACTIVITIES'");
    if (check.rows.length === 0) {
      await pool.query(`
        INSERT INTO ppmp_sections (name, description, display_order, is_active)
        VALUES ('TRAINING AND ACTIVITIES', 'Training programs, seminars, conferences, and related activities', 5, TRUE)
      `);
      console.log('Added TRAINING AND ACTIVITIES section');
    } else {
      console.log('TRAINING AND ACTIVITIES section already exists');
    }

    // Verify all sections
    const sections = await pool.query('SELECT name, display_order FROM ppmp_sections ORDER BY display_order');
    console.log('\nAll sections:', sections.rows.map(s => s.name).join(', '));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    pool.end();
  }
}

addTrainingSection();
