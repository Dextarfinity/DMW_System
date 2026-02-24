const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function main() {
  const hash = await bcrypt.hash('dmw2026', 10);
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'dmw_db',
    password: 'kurt09908',
    port: 5433
  });
  
  // Fix ritchel.butao password
  const r1 = await pool.query(
    'UPDATE users SET password_hash=$1 WHERE username=$2 RETURNING id, username, full_name, role',
    [hash, 'ritchel.butao']
  );
  console.log('Updated ritchel.butao:', r1.rows[0]);
  
  // Verify it works
  const user = await pool.query('SELECT password_hash FROM users WHERE username=$1', ['ritchel.butao']);
  const match = await bcrypt.compare('dmw2026', user.rows[0].password_hash);
  console.log('Password verification:', match ? 'SUCCESS' : 'FAILED');
  
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
