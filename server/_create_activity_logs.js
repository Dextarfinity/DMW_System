const { Pool } = require('pg');
const pool = new Pool({ user:'postgres', host:'192.168.100.235', database:'dmw_db', password:'dmw123', port:5432 });

(async () => {
  try {
    console.log('=== Creating activity_logs table on remote DB ===');
    
    // 1. Create the activity_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id          SERIAL PRIMARY KEY,
        user_id     INT REFERENCES users(id) ON DELETE SET NULL,
        username    VARCHAR(50),
        action      VARCHAR(20) NOT NULL CHECK (action IN ('CREATE','READ','UPDATE','DELETE','POST','UNPOST','LOGIN','LOGOUT')),
        table_name  VARCHAR(100) NOT NULL,
        record_id   INT,
        reference   VARCHAR(255),
        description TEXT,
        old_data    JSONB,
        new_data    JSONB,
        ip_address  VARCHAR(50),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  activity_logs table created.');

    // 2. Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_activity_logs_table ON activity_logs(table_name)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at)');
    console.log('  indexes created.');

    // 3. Drop old materialized view if exists
    await pool.query('DROP MATERIALIZED VIEW IF EXISTS activity_logs_view');

    // 4. Create materialized view joining user info (role, full_name)
    await pool.query(`
      CREATE MATERIALIZED VIEW activity_logs_view AS
      SELECT
        al.id,
        al.user_id,
        al.username,
        COALESCE(u.full_name, al.username)   AS full_name,
        COALESCE(u.role, 'unknown')          AS user_role,
        u.secondary_role                     AS user_secondary_role,
        COALESCE(d.name, '')                 AS department,
        al.action,
        al.table_name,
        al.record_id,
        al.reference,
        al.description,
        al.old_data,
        al.new_data,
        al.ip_address,
        al.created_at
      FROM activity_logs al
      LEFT JOIN users u       ON al.user_id = u.id
      LEFT JOIN departments d ON u.dept_id  = d.id
      ORDER BY al.created_at DESC
    `);
    console.log('  activity_logs_view materialized view created.');

    // 5. Create unique index for concurrent refresh
    await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_activity_logs_view_id ON activity_logs_view(id)');
    console.log('  unique index on view created (enables CONCURRENTLY refresh).');

    // Verify
    const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'activity_logs' ORDER BY ordinal_position");
    console.log('\nactivity_logs columns:', cols.rows.map(r => r.column_name).join(', '));

    const mvCheck = await pool.query("SELECT EXISTS (SELECT FROM pg_matviews WHERE matviewname = 'activity_logs_view')");
    console.log('activity_logs_view exists:', mvCheck.rows[0].exists);

    const mvCols = await pool.query("SELECT attname FROM pg_attribute WHERE attrelid = 'activity_logs_view'::regclass AND attnum > 0 ORDER BY attnum");
    console.log('activity_logs_view columns:', mvCols.rows.map(r => r.attname).join(', '));

    console.log('\n=== Migration complete! ===');
  } catch(err) { 
    console.error('Migration failed:', err.message);
    console.error(err.stack);
  }
  finally { await pool.end(); }
})();
