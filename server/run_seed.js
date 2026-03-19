const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: '192.168.100.235',
  port: 5432,
  database: 'dmw_db',
  user: 'postgres',
  password: 'dmw123'
});

const sql = fs.readFileSync(path.join(__dirname, './database/seed_categories_2026.sql'), 'utf8');

pool.query(sql, (err, res) => {
  if (err) {
    console.error('Error executing SQL:', err);
  } else {
    console.log('SQL executed successfully');
  }
  pool.end();
});