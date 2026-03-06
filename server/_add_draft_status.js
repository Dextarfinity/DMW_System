const { Pool } = require('pg');
const pool = new Pool({ host: '192.168.100.235', port: 5432, database: 'dmw_db', user: 'postgres', password: 'dmw123' });

async function run() {
  try {
    await pool.query("ALTER TABLE purchaserequests DROP CONSTRAINT IF EXISTS purchaserequests_status_check");
    await pool.query("ALTER TABLE purchaserequests ADD CONSTRAINT purchaserequests_status_check CHECK (status IN ('draft','pending_approval','approved','rejected','cancelled'))");
    console.log('OK: draft status added to purchaserequests constraint');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}
run();
