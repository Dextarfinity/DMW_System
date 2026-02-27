// Insert APP-CSE 2026 items into the database
// Reads from extracted_items.json and inserts via pg directly

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const XLSX = require('../node_modules/xlsx');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '192.168.100.235',
  database: process.env.DB_NAME || 'dmw_db',
  password: process.env.DB_PASSWORD || 'dmw123',
  port: parseInt(process.env.DB_PORT) || 5432,
});

async function main() {
  // Extract items from Excel
  const wb = XLSX.readFile(path.join(__dirname, '..', 'DMW', 'items-catalog-pdbms', 'APP-CSE 2026 Form.xlsx'));
  const ws = wb.Sheets[wb.SheetNames[0]];
  const range = XLSX.utils.decode_range(ws['!ref']);

  let currentCategory = '';
  let items = [];

  for (let r = 31; r <= range.e.r; r++) {
    const a = ws[XLSX.utils.encode_cell({r, c:0})];
    const b = ws[XLSX.utils.encode_cell({r, c:1})];
    const c2 = ws[XLSX.utils.encode_cell({r, c:2})];
    const d = ws[XLSX.utils.encode_cell({r, c:3})];
    const y = ws[XLSX.utils.encode_cell({r, c:25})];

    const aV = a ? String(a.v).trim() : '';
    const bV = b ? String(b.v).trim() : '';
    const cV = c2 ? String(c2.v).trim() : '';
    const dV = d ? String(d.v).trim() : '';
    const price = y ? parseFloat(y.v) || 0 : 0;

    if (aV && !bV && !cV && !dV && isNaN(aV)) {
      if (!aV.startsWith('PART') && !aV.startsWith('A.') && !aV.startsWith('B.') &&
          !aV.startsWith('C.') && !aV.startsWith('D.') && !aV.startsWith('E.') &&
          !aV.startsWith('We ') && !aV.startsWith('Consistent')) {
        currentCategory = aV.replace(/\s*\(Note:.*\)/gi, '').replace(/\r?\n.*/g, '').trim();
      }
      continue;
    }

    if (aV && !isNaN(aV) && bV) {
      items.push({
        stock_no: bV,
        name: cV.replace(/\s+/g, ' ').trim(),
        unit: dV,
        price: price,
        category: currentCategory
      });
    }
  }

  // Deduplicate
  const seen = new Set();
  const unique = items.filter(i => {
    if (seen.has(i.stock_no)) return false;
    seen.add(i.stock_no);
    return true;
  });

  console.log(`Extracted ${unique.length} unique items from Excel`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let inserted = 0, updated = 0, errors = 0;

    for (const item of unique) {
      try {
        const result = await client.query(`
          INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)
          VALUES ($1, NULL, $2, $3, $4, $5, $6, NULL, TRUE)
          ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            unit = EXCLUDED.unit,
            unit_price = EXCLUDED.unit_price,
            category = EXCLUDED.category,
            is_active = TRUE,
            updated_at = CURRENT_TIMESTAMP
          RETURNING (xmax = 0) AS is_insert
        `, [item.stock_no, item.name, item.name, item.unit, item.price, item.category]);

        if (result.rows[0].is_insert) {
          inserted++;
        } else {
          updated++;
        }
      } catch (err) {
        console.error(`Error inserting ${item.stock_no}: ${err.message}`);
        errors++;
      }
    }

    await client.query('COMMIT');
    console.log(`\nDone!`);
    console.log(`  Inserted: ${inserted}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Errors: ${errors}`);
    console.log(`  Total: ${unique.length}`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
