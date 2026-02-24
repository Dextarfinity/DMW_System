const { Pool } = require('pg');
const p = new Pool({ host: 'localhost', port: 5433, user: 'postgres', password: 'kurt09908', database: 'dmw_db' });

async function check() {
  try {
    const r = await p.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('attachments','entity_attachments')`);
    console.log('Tables found:', r.rows.map(x => x.table_name));
    
    if (r.rows.length < 2) {
      console.log('MISSING TABLES - creating them now...');
      await p.query(`
        CREATE TABLE IF NOT EXISTS attachments (
          id SERIAL PRIMARY KEY,
          original_name VARCHAR(500) NOT NULL,
          stored_name VARCHAR(500) NOT NULL,
          mime_type VARCHAR(255),
          file_size_bytes BIGINT,
          storage_path TEXT NOT NULL,
          checksum_sha256 VARCHAR(64),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS entity_attachments (
          id SERIAL PRIMARY KEY,
          entity_type VARCHAR(100) NOT NULL,
          entity_id INTEGER NOT NULL,
          attachment_id INTEGER NOT NULL REFERENCES attachments(id) ON DELETE CASCADE,
          description TEXT,
          is_required BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_entity_attachments_lookup ON entity_attachments(entity_type, entity_id);
        CREATE INDEX IF NOT EXISTS idx_entity_attachments_attachment ON entity_attachments(attachment_id);
      `);
      console.log('Tables created successfully!');
    } else {
      console.log('Both tables exist.');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await p.end();
  }
}

check();
