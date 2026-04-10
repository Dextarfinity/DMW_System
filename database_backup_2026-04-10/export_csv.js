const { Pool } = require(require('path').join(__dirname, '..', 'server', 'node_modules', 'pg'));
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dmw_db',
  password: 'dmw123',
  port: 5432,
});

const CSV_DIR = path.join(__dirname, 'csv_tables');

async function exportAllTables() {
  if (!fs.existsSync(CSV_DIR)) fs.mkdirSync(CSV_DIR, { recursive: true });

  const { rows: tables } = await pool.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
  );

  console.log(`Found ${tables.length} tables to export.\n`);

  for (const { tablename } of tables) {
    try {
      const { rows, fields } = await pool.query(`SELECT * FROM "${tablename}" ORDER BY 1`);
      const headers = fields.map(f => f.name);

      // Build CSV content
      const csvLines = [headers.join(',')];
      for (const row of rows) {
        const line = headers.map(h => {
          const val = row[h];
          if (val === null || val === undefined) return '';
          const str = String(val);
          // Escape CSV: wrap in quotes if contains comma, newline, or quote
          if (str.includes(',') || str.includes('\n') || str.includes('"') || str.includes('\r')) {
            return '"' + str.replace(/"/g, '""') + '"';
          }
          return str;
        }).join(',');
        csvLines.push(line);
      }

      const filePath = path.join(CSV_DIR, `${tablename}.csv`);
      fs.writeFileSync(filePath, csvLines.join('\n'), 'utf8');
      console.log(`  [OK] ${tablename} — ${rows.length} rows`);
    } catch (err) {
      console.error(`  [ERR] ${tablename} — ${err.message}`);
    }
  }

  // Also export a summary with row counts
  const summaryLines = ['table_name,row_count'];
  for (const { tablename } of tables) {
    try {
      const { rows } = await pool.query(`SELECT COUNT(*) as cnt FROM "${tablename}"`);
      summaryLines.push(`${tablename},${rows[0].cnt}`);
    } catch (e) {
      summaryLines.push(`${tablename},ERROR`);
    }
  }
  fs.writeFileSync(path.join(__dirname, 'table_summary.csv'), summaryLines.join('\n'), 'utf8');
  console.log('\n  [OK] table_summary.csv written');

  await pool.end();
  console.log('\nBackup complete!');
}

exportAllTables().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});
