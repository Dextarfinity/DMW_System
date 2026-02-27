const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('DMW/items-catalog-pdbms/APP-CSE 2026 Form.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const range = XLSX.utils.decode_range(ws['!ref']);

let currentCategory = '';
let items = [];

for (let r = 31; r <= range.e.r; r++) {
  const a = ws[XLSX.utils.encode_cell({r, c:0})];
  const b = ws[XLSX.utils.encode_cell({r, c:1})];
  const c2 = ws[XLSX.utils.encode_cell({r, c:2})];
  const d = ws[XLSX.utils.encode_cell({r, c:3})];
  const y = ws[XLSX.utils.encode_cell({r, c:25})]; // unit price col Z

  const aV = a ? String(a.v).trim() : '';
  const bV = b ? String(b.v).trim() : '';
  const cV = c2 ? String(c2.v).trim() : '';
  const dV = d ? String(d.v).trim() : '';
  const price = y ? parseFloat(y.v) || 0 : 0;

  // Category row: col A has text, col B/C/D empty, not a number
  if (aV && !bV && !cV && !dV && isNaN(aV)) {
    if (!aV.startsWith('PART') && !aV.startsWith('A.') && !aV.startsWith('B.') &&
        !aV.startsWith('C.') && !aV.startsWith('D.') && !aV.startsWith('E.') &&
        !aV.startsWith('We ') && !aV.startsWith('Consistent')) {
      // Clean category name - remove (Note: ...) and line breaks
      currentCategory = aV.replace(/\s*\(Note:.*\)/gi, '').replace(/\r?\n.*/g, '').trim();
    }
    continue;
  }

  // Item row: col A is a number, col B has stock_no
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

// Deduplicate by stock_no
const seen = new Set();
const unique = items.filter(i => {
  if (seen.has(i.stock_no)) return false;
  seen.add(i.stock_no);
  return true;
});

console.log('Total items:', items.length, ', Unique by stock_no:', unique.length);

// Escape single quotes for SQL
function esc(s) {
  return s.replace(/'/g, "''");
}

// Build SQL
let sql = '-- APP-CSE 2026 Item Catalog Import\n';
sql += '-- Generated from APP-CSE 2026 Form.xlsx\n';
sql += '-- Total unique items: ' + unique.length + '\n';
sql += '-- stock_no and uacs_code are set to NULL (editable later)\n\n';
sql += 'BEGIN;\n\n';

for (const item of unique) {
  sql += `INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, is_active)\n`;
  sql += `  VALUES ('${esc(item.stock_no)}', NULL, '${esc(item.name)}', '${esc(item.name)}', '${esc(item.unit)}', ${item.price}, '${esc(item.category)}', NULL, TRUE)\n`;
  sql += `  ON CONFLICT (code) DO UPDATE SET\n`;
  sql += `    name = EXCLUDED.name,\n`;
  sql += `    description = EXCLUDED.description,\n`;
  sql += `    unit = EXCLUDED.unit,\n`;
  sql += `    unit_price = EXCLUDED.unit_price,\n`;
  sql += `    category = EXCLUDED.category,\n`;
  sql += `    is_active = TRUE,\n`;
  sql += `    updated_at = CURRENT_TIMESTAMP;\n\n`;
}

sql += 'COMMIT;\n';

fs.writeFileSync('server/database/seed_app_cse_2026.sql', sql);
console.log('SQL file written: server/database/seed_app_cse_2026.sql');
console.log('Unique categories:', [...new Set(unique.map(i => i.category))].length);
