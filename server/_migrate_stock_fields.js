const { Pool } = require('pg');
const pool = new Pool({ user:'postgres', host:'192.168.100.235', database:'dmw_db', password:'dmw123', port:5432 });

(async () => {
  try {
    await pool.query("ALTER TABLE stock_cards ADD COLUMN IF NOT EXISTS issue_office VARCHAR(255)");
    await pool.query("ALTER TABLE stock_cards ADD COLUMN IF NOT EXISTS no_of_days_to_consume INT");
    await pool.query("ALTER TABLE supplies_ledger_cards ADD COLUMN IF NOT EXISTS issue_office VARCHAR(255)");
    await pool.query("ALTER TABLE supplies_ledger_cards ADD COLUMN IF NOT EXISTS no_of_days_to_consume INT");
    console.log('Migration completed successfully');
    
    const sc = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'stock_cards' ORDER BY ordinal_position");
    console.log('stock_cards columns:', sc.rows.map(r => r.column_name).join(', '));
    const slc = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'supplies_ledger_cards' ORDER BY ordinal_position");
    console.log('supplies_ledger_cards columns:', slc.rows.map(r => r.column_name).join(', '));
  } catch(err) { console.error('Migration failed:', err.message); }
  finally { await pool.end(); }
})();
