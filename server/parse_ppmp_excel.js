const XLSX = require('xlsx');
const path = require('path');

const files = [
  path.join(__dirname, '..', 'DMW', 'ppmp', 'MWPSD-PPMP 2026.xlsx'),
  path.join(__dirname, '..', 'DMW', 'ppmp', 'MWPTD PPMP 2026.xlsx'),
  path.join(__dirname, '..', 'DMW', 'ppmp', 'NGPA PPMP 2026 FAD.xlsx'),
  path.join(__dirname, '..', 'DMW', 'ppmp', 'NGPA_PPMP-of-DMW-WRSD Caraga.xlsx'),
];

files.forEach(f => {
  console.log('\n========================================');
  console.log('FILE:', path.basename(f));
  console.log('========================================');
  try {
    const wb = XLSX.readFile(f);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    
    // Find the header row (look for "General Description" or "Column 1")
    let headerRow = -1;
    for (let i = 0; i < Math.min(20, data.length); i++) {
      const row = data[i];
      const rowStr = row.join(' ').toLowerCase();
      if (rowStr.includes('general description') || rowStr.includes('column 1') || rowStr.includes('description and objective')) {
        headerRow = i;
        break;
      }
    }
    
    console.log('Header row index:', headerRow);
    if (headerRow >= 0) {
      console.log('Headers:', data[headerRow].slice(0, 12).map((h,i) => `[${i}]=${h}`).join(' | '));
    }
    
    // Print first 80 data rows after header to see the format
    const startRow = headerRow >= 0 ? headerRow + 1 : 5;
    console.log('\n--- DATA ROWS ---');
    for (let i = startRow; i < Math.min(startRow + 80, data.length); i++) {
      const row = data[i];
      if (!row || row.every(c => c === '' || c === null || c === undefined)) continue;
      
      const col1 = String(row[0] || '').trim();
      const col2 = String(row[1] || '').trim();
      const col3 = String(row[2] || '').trim();
      const col10 = row[9] !== undefined ? String(row[9]).trim() : '';
      
      // Detect if it's a section/subsection header or item row
      const isSection = col1 && !col2 && !col3;
      const isItem = col1 && col2;
      
      if (isSection) {
        console.log(`\nROW ${i} [SECTION/SUBSECTION]: "${col1}" | Budget: ${col10}`);
      } else if (col1) {
        console.log(`ROW ${i} [ITEM]: Col1="${col1.substring(0,80)}" | Col2="${col2}" | Col3="${col3}" | Budget="${col10}"`);
      }
    }
  } catch (err) {
    console.error('Error reading', path.basename(f), ':', err.message);
  }
});
