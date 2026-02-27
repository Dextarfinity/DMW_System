/**
 * Backfill PPMP entries: link to items catalog by matching description text to item names,
 * and reformat descriptions to match the Excel PPMP bullet format.
 */
const { Pool } = require('pg');
const pool = new Pool({
  host: '192.168.100.235',
  port: 5432,
  database: 'dmw_db',
  user: 'postgres',
  password: 'dmw123'
});

(async () => {
  // Load all items
  const itemsResult = await pool.query('SELECT id, code, name, description, category, unit, unit_price FROM items ORDER BY name');
  const items = itemsResult.rows;
  console.log(`Loaded ${items.length} catalog items`);

  // Load all PPMP entries
  const ppmpResult = await pool.query('SELECT id, description, category, item_id FROM procurementplans WHERE ppmp_no IS NOT NULL ORDER BY id');
  const plans = ppmpResult.rows;
  console.log(`Loaded ${plans.length} PPMP entries`);

  let linked = 0;
  let reformatted = 0;

  for (const plan of plans) {
    if (plan.item_id) continue; // Already linked
    const desc = (plan.description || '').toLowerCase().trim();
    if (!desc) continue;

    // Try to match description to an item name
    let bestMatch = null;
    let bestScore = 0;

    for (const item of items) {
      const itemName = (item.name || '').toLowerCase();
      const itemDesc = (item.description || '').toLowerCase();

      // Exact match
      if (desc === itemName || desc === itemDesc) {
        bestMatch = item;
        bestScore = 100;
        break;
      }

      // Description starts with item name
      if (desc.startsWith(itemName) && itemName.length > 3) {
        const score = itemName.length;
        if (score > bestScore) {
          bestMatch = item;
          bestScore = score;
        }
      }

      // Item name starts with description
      if (itemName.startsWith(desc) && desc.length > 3) {
        const score = desc.length;
        if (score > bestScore) {
          bestMatch = item;
          bestScore = score;
        }
      }

      // Description contains item name (or vice versa)
      if (desc.includes(itemName) && itemName.length > 5) {
        const score = itemName.length * 0.8;
        if (score > bestScore) {
          bestMatch = item;
          bestScore = score;
        }
      }

      // Check for key word matches for common items
      const descWords = desc.split(/[\s,\-()]+/).filter(w => w.length > 2);
      const itemWords = itemName.split(/[\s,\-()]+/).filter(w => w.length > 2);
      const matchCount = descWords.filter(w => itemWords.includes(w)).length;
      if (matchCount >= 2 && matchCount / Math.max(itemWords.length, 1) > 0.5) {
        const score = matchCount * 3;
        if (score > bestScore) {
          bestMatch = item;
          bestScore = score;
        }
      }
    }

    if (bestMatch && bestScore >= 5) {
      // Link to item and update category
      await pool.query(
        'UPDATE procurementplans SET item_id = $1, category = $2 WHERE id = $3',
        [bestMatch.id, bestMatch.category, plan.id]
      );
      console.log(`  Linked PPMP #${plan.id} "${(plan.description || '').substring(0, 40)}" → Item #${bestMatch.id} "${bestMatch.name}" [${bestMatch.category}]`);
      linked++;

      // Reformat description to Excel format if it's just a plain name
      const currentDesc = plan.description || '';
      const lines = currentDesc.split('\n').filter(l => l.trim());
      if (lines.length <= 1) {
        // Single-line description — reformat to Excel bullet style
        const header = (bestMatch.name.indexOf(',') > 0)
          ? bestMatch.name.substring(0, bestMatch.name.indexOf(',')).trim()
          : (bestMatch.name.indexOf(' - ') > 0)
            ? bestMatch.name.substring(0, bestMatch.name.indexOf(' - ')).trim()
            : bestMatch.name;
        
        let details = [];
        // Extract rest of name as detail
        if (header !== bestMatch.name) {
          const rest = bestMatch.name.substring(header.length).replace(/^[\s,\-]+/, '').trim();
          if (rest) details.push(rest);
        }
        // Add description if different
        if (bestMatch.description && bestMatch.description.trim() !== bestMatch.name.trim() && bestMatch.description.trim() !== header) {
          const d = bestMatch.description.trim();
          if (!details.some(x => x.toLowerCase().includes(d.toLowerCase()))) {
            details.push(d);
          }
        }
        if (bestMatch.unit) details.push('Unit: ' + bestMatch.unit);

        const newDesc = header + details.map(d => '\n   ' + d).join('');
        await pool.query('UPDATE procurementplans SET description = $1 WHERE id = $2', [newDesc, plan.id]);
        reformatted++;
      }
    }
  }

  console.log(`\nResults: ${linked} entries linked to items, ${reformatted} descriptions reformatted`);

  // Show final state
  const cats = await pool.query(`
    SELECT COALESCE(it.category, pp.category, 'UNLINKED') as cat, COUNT(*) as cnt,
           SUM(CASE WHEN pp.item_id IS NOT NULL THEN 1 ELSE 0 END) as linked
    FROM procurementplans pp 
    LEFT JOIN items it ON pp.item_id = it.id
    WHERE pp.ppmp_no IS NOT NULL
    GROUP BY COALESCE(it.category, pp.category, 'UNLINKED')
    ORDER BY cat
  `);
  console.log('\nFinal PPMP Categories (item_category → count / linked):');
  cats.rows.forEach(r => console.log(`  ${r.cat}: ${r.cnt} items (${r.linked} linked)`));

  await pool.end();
  console.log('\nDone!');
})().catch(err => { console.error(err); pool.end(); });
