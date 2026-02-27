const { Pool } = require('pg');
const p = new Pool({ host:'192.168.100.235', port:5432, database:'dmw_db', user:'postgres', password:'dmw123' });
p.query(`SELECT column_name, data_type, character_maximum_length, is_nullable, column_default 
         FROM information_schema.columns 
         WHERE table_name='procurementplans' 
         ORDER BY ordinal_position`)
  .then(r => { console.table(r.rows); p.end(); })
  .catch(e => { console.error(e.message); p.end(); });
