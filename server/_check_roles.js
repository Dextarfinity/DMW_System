const { Pool } = require('pg');
const pool = new Pool({ host: '192.168.100.235', port: 5432, database: 'dmw_db', user: 'postgres', password: 'dmw123' });

(async () => {
  try {
    const res = await pool.query(`
      SELECT u.id, u.username, u.full_name, u.role, u.secondary_role, d.name as department
      FROM users u LEFT JOIN departments d ON u.dept_id = d.id
      ORDER BY u.role, u.username
    `);
    console.table(res.rows);
    
    console.log('\n--- Distinct roles ---');
    const roles = await pool.query('SELECT DISTINCT role FROM users ORDER BY role');
    roles.rows.forEach(r => console.log(' ', r.role));
    
    console.log('\n--- Distinct secondary_roles ---');
    const sec = await pool.query('SELECT DISTINCT secondary_role FROM users WHERE secondary_role IS NOT NULL ORDER BY secondary_role');
    sec.rows.forEach(r => console.log(' ', r.secondary_role));
    
    console.log('\n--- Departments ---');
    const depts = await pool.query('SELECT id, name, code FROM departments ORDER BY id');
    console.table(depts.rows);
  } catch (e) { console.error(e.message); }
  pool.end();
})();
