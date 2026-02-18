# DMW CARAGA INTEGRATED PROCUREMENT & INVENTORY SYSTEM
## Database Documentation v2.0

**Generated:** February 12, 2026  
**Database:** PostgreSQL 13+  
**Integration:** Complete Procurement + Inventory Management System

---

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [What's New in v2.0](#whats-new-in-v20)
3. [Database Architecture](#database-architecture)
4. [Quick Start](#quick-start)
5. [Module Integration](#module-integration)
6. [Key Workflows](#key-workflows)
7. [Common Queries](#common-queries)
8. [Migration Guide](#migration-guide)

---

## 🎯 System Overview

The **DMW CARAGA Integrated System** combines two critical modules:

### 1. **Procurement Module** (RFQ → Abstract → BAC → NOA → PO → COA)
- Complete procurement workflow from requisition to payment
- PhilGEPS integration tracking
- BAC resolution and TWG post-qualification
- Notice of Award (NOA) management
- Purchase Order tracking with workflow statuses
- COA submission and compliance

### 2. **Inventory Module** (Stock Control → Property Accountability)
- Real-time inventory tracking (Expendable, Semi-Expendable, Capital Outlay)
- Stock cards for consumables
- Property cards for equipment/furniture
- Inventory Custodian Slips (ICS) for accountability
- Property ledger cards for value tracking
- UACS code integration (COA compliance)

### 🔗 Integration Points
- **Purchase Orders → Inventory**: PO items linked to inventory catalog
- **IAR Completion → Stock Update**: Automatic inventory adjustment
- **Property Accountability**: Employee tracking for equipment custody
- **Cost Tracking**: Full procurement-to-inventory cost flow

---

## 🆕 What's New in v2.0

### Enhanced Features
1. ✅ **Unified Items Table**: Single catalog supports both procurement and inventory
2. ✅ **Automated Stock Updates**: IAR completion triggers inventory updates
3. ✅ **Employee-Property Linking**: Direct accountability through employee records
4. ✅ **UACS Code Integration**: Government accounting compliance
5. ✅ **Stock Card Automation**: Auto-creation on IAR completion
6. ✅ **Property Management**: Full lifecycle tracking with ICS
7. ✅ **Unified Reporting**: Cross-module views and analytics

### New Tables
- `employees` - Separate from system users for property accountability
- `designations` - Job positions/titles
- `fund_clusters` - Funding source tracking
- `procurement_modes` - Procurement method codes
- `uacs_codes` - Government accounting classification
- `uoms` - Units of measure
- `stock_cards` - Expendable item tracking
- `property_cards` - Semi-expendable/capital outlay items
- `property_ledger_cards` - Property transaction history
- `inventory_custodian_slips` - ICS for property transfers

### Enhanced Tables
- `items` - Added `stock_no`, `uacs_code`, `quantity`, `reorder_point`
- `po_items` - Added `item_id` foreign key
- `iar_items` - Added `item_id` foreign key
- `users` - Added `employee_id` foreign key
- `purchaseorders` - Added `obr_no`, `fund_cluster`

---

## 🗄️ Database Architecture

### Table Count: **37 Tables**

#### Core Master Data (10 tables)
- `departments` - 5 divisions (FAD, WRSD, MWPSD, MWPTD, ORD)
- `designations` - Job positions
- `employees` - Staff directory with accountability
- `users` - System accounts (login/access)
- `suppliers` - Vendor directory
- `fund_clusters` - Funding sources
- `procurement_modes` - Procurement methods
- `uacs_codes` - Government accounting codes
- `uoms` - Units of measure
- `items` - **Unified catalog** (procurement + inventory)

#### Procurement Module (17 tables)
- `procurementplans` + `plan_items` - PPMP/APP
- `purchaserequests` + `pr_items` - PR management
- `rfqs` + `rfq_items` + `rfq_suppliers` - RFQ process
- `abstracts` + `abstract_quotations` + `abstract_quote_items` - AOQ
- `post_qualifications` - TWG evaluation
- `bac_resolutions` - BAC decisions
- `notices_of_award` - NOA issuance
- `purchaseorders` + `po_items` - PO management
- `iars` + `iar_items` - Inspection & acceptance
- `po_packets` - Document compilation
- `coa_submissions` - COA compliance

#### Inventory Module (5 tables)
- `stock_cards` - Expendable item tracking
- `property_cards` - Semi-expendable/capital outlay
- `property_ledger_cards` - Property transaction history
- `inventory_custodian_slips` - ICS for accountability
- `counters` - Auto-numbering

#### System Tables (3 tables)
- `attachments` + `entity_attachments` - File storage
- `audit_log` - Activity tracking

---

## 🚀 Quick Start

### 1. Prerequisites
```bash
# Install PostgreSQL
brew install postgresql          # macOS
sudo apt install postgresql      # Ubuntu
```

### 2. Create Database
```bash
psql -U postgres
```

```sql
CREATE DATABASE dmw_caraga_system;
\c dmw_caraga_system
```

### 3. Run Schema
```bash
psql -U postgres -d dmw_caraga_system -f DMW_INTEGRATED_SCHEMA_v2.0.sql
```

### 4. Load Seed Data
```bash
psql -U postgres -d dmw_caraga_system -f DMW_INTEGRATED_SEED_v2.0.sql
```

### 5. Verify Installation
```sql
-- Check table count
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
-- Should return 37

-- Test views
SELECT * FROM vw_current_stock LIMIT 5;
SELECT * FROM vw_po_summary LIMIT 5;
SELECT * FROM vw_property_accountability LIMIT 5;

-- Check default users
SELECT username, role, full_name FROM users WHERE is_active = TRUE;
```

### 6. Default Credentials
```
Username: admin
Password: admin123

Other accounts:
- supply_officer / admin123
- procurement_officer / admin123
- bac_chair / admin123
- inspector1 / admin123
```

⚠️ **IMPORTANT**: Change all passwords before production deployment!

---

## 🔄 Module Integration

### How Procurement Connects to Inventory

```
┌─────────────────────────────────────────────────────────────┐
│ PROCUREMENT FLOW → INVENTORY UPDATE                          │
└─────────────────────────────────────────────────────────────┘

1. PURCHASE REQUEST (PR)
   ├─ pr_items references items.code
   └─ Quantity planning

2. PURCHASE ORDER (PO)
   ├─ po_items.item_id → items.id (FK)
   └─ Order placed with supplier

3. INSPECTION & ACCEPTANCE REPORT (IAR)
   ├─ iar_items.item_id → items.id (FK)
   ├─ Goods received and inspected
   └─ Status: 'completed'

4. AUTOMATIC INVENTORY UPDATE (Trigger)
   ├─ items.quantity += iar_items.quantity
   ├─ stock_cards entry created (for EXPENDABLE)
   └─ property_cards entry created (for SEMI-EXPENDABLE)

5. PROPERTY ISSUANCE (for Semi-Expendable)
   ├─ property_cards.issued_to_employee_id → employees.id
   ├─ inventory_custodian_slips (ICS) created
   └─ Accountability transferred
```

### Key Relationships

```sql
-- Items can be used in multiple contexts
items (id)
  ├─→ po_items.item_id
  ├─→ iar_items.item_id
  ├─→ stock_cards.item_id
  └─→ property_cards.item_id

-- Employees linked to system users
employees (id)
  ├─→ users.employee_id
  ├─→ property_cards.issued_to_employee_id
  └─→ inventory_custodian_slips.issued_to_employee_id

-- Purchase Orders drive inventory
purchaseorders (id)
  ├─→ po_items.po_id → items
  └─→ iars.po_id → iar_items → items (quantity update)
```

---

## 🔁 Key Workflows

### Workflow 1: Procurement-to-Inventory (Expendable Items)

```sql
-- Step 1: Create Purchase Order
INSERT INTO purchaseorders (po_number, supplier_id, total_amount, status)
VALUES ('2026-02-001', 1, 5000, 'approved');

-- Step 2: Add PO Items (linked to inventory catalog)
INSERT INTO po_items (po_id, item_id, item_code, quantity, unit_price)
VALUES (1, (SELECT id FROM items WHERE code = 'OF-001'), 'OF-001', 20, 250);

-- Step 3: Create IAR when goods arrive
INSERT INTO iars (iar_number, po_id, inspection_date, status)
VALUES ('2026-02-001', 1, '2026-02-12', 'draft');

-- Step 4: Add IAR Items
INSERT INTO iar_items (iar_id, item_id, item_code, quantity, unit_cost)
VALUES (1, (SELECT id FROM items WHERE code = 'OF-001'), 'OF-001', 20, 250);

-- Step 5: Complete IAR (triggers automatic updates!)
UPDATE iars SET status = 'completed', date_received = '2026-02-12' WHERE id = 1;
-- ✅ items.quantity automatically increased by 20
-- ✅ stock_cards entry automatically created
```

### Workflow 2: Property Accountability (Semi-Expendable)

```sql
-- Step 1: Property Card created (after IAR for semi-expendable item)
INSERT INTO property_cards (
    property_number, item_id, description, acquisition_cost, status
)
VALUES (
    '2026-05-01-0001',
    (SELECT id FROM items WHERE code = 'FN-001'),
    'OFFICE CHAIR',
    5500.00,
    'active'
);

-- Step 2: Create ICS for property transfer
INSERT INTO inventory_custodian_slips (
    ics_no, date_of_issue, property_number,
    issued_to, issued_to_employee_id
)
VALUES (
    '2026-02-0001',
    '2026-02-12',
    '2026-05-01-0001',
    'MARK E. MARASIGAN',
    (SELECT id FROM employees WHERE employee_code = 'EMP-007')
);

-- Step 3: Update Property Card
UPDATE property_cards
SET issued_to = 'MARK E. MARASIGAN',
    issued_to_employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP-007'),
    issued_date = '2026-02-12',
    ics_no = '2026-02-0001'
WHERE property_number = '2026-05-01-0001';
```

### Workflow 3: Stock Issuance (Expendable Items)

```sql
-- Issue bond paper to end user
INSERT INTO stock_cards (
    item_id, item_code, item_name, transaction_no, date, reference,
    issue_qty, balance_qty
)
SELECT 
    id,
    code,
    name,
    (SELECT MAX(transaction_no) + 1 FROM stock_cards WHERE item_id = i.id),
    CURRENT_DATE,
    'RIS-2026-02-001',
    10,  -- issued 10 reams
    quantity - 10
FROM items i
WHERE code = 'OF-001';

-- Update item quantity
UPDATE items SET quantity = quantity - 10 WHERE code = 'OF-001';
```

---

## 📊 Common Queries

### Inventory Management

#### Check Low Stock Items
```sql
SELECT * FROM vw_current_stock 
WHERE stock_status IN ('Low Stock', 'Out of Stock')
ORDER BY description;
```

#### Stock Movement History (Last 30 Days)
```sql
SELECT 
    sc.date,
    i.code,
    i.name,
    sc.reference,
    sc.receipt_qty,
    sc.issue_qty,
    sc.balance_qty,
    sc.balance_total_cost
FROM stock_cards sc
JOIN items i ON sc.item_id = i.id
WHERE sc.date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY sc.date DESC, i.code;
```

#### Items Needing Reorder
```sql
SELECT 
    code,
    name,
    category,
    quantity AS current_stock,
    reorder_point,
    (reorder_point - quantity) AS need_to_order,
    unit_price,
    (reorder_point - quantity) * unit_price AS estimated_cost
FROM items
WHERE quantity < reorder_point
AND category = 'EXPENDABLE'
AND is_active = TRUE
ORDER BY (reorder_point - quantity) DESC;
```

### Property Accountability

#### Active Property by Custodian
```sql
SELECT * FROM vw_property_accountability
WHERE custodian_name = 'MARK E. MARASIGAN'
ORDER BY issued_date DESC;
```

#### Property Ledger for Specific Item
```sql
SELECT 
    date,
    reference,
    CASE 
        WHEN receipt_qty > 0 THEN 'RECEIPT'
        WHEN issue_qty > 0 THEN 'ISSUE'
        ELSE 'ADJUSTMENT'
    END AS transaction_type,
    receipt_qty,
    receipt_total_cost,
    issue_qty,
    issue_total_cost,
    balance_qty,
    balance_total_cost
FROM property_ledger_cards
WHERE property_number = '2025-05-02-0001'
ORDER BY transaction_no;
```

#### Property Summary by Department
```sql
SELECT 
    d.code AS department,
    d.name AS department_name,
    COUNT(pc.id) AS total_properties,
    SUM(pc.acquisition_cost) AS total_value
FROM property_cards pc
JOIN employees e ON pc.issued_to_employee_id = e.id
JOIN departments d ON e.dept_id = d.id
WHERE pc.status = 'active'
GROUP BY d.code, d.name
ORDER BY total_value DESC;
```

### Procurement Reports

#### Purchase Orders Pending Delivery
```sql
SELECT * FROM vw_po_summary
WHERE workflow_status IN ('on_process', 'awaiting_delivery')
ORDER BY po_date DESC;
```

#### PO with Completed IAR
```sql
SELECT 
    po.po_number,
    po.total_amount,
    s.name AS supplier,
    iar.iar_number,
    iar.inspection_date,
    iar.status AS iar_status
FROM purchaseorders po
JOIN suppliers s ON po.supplier_id = s.id
LEFT JOIN iars iar ON po.id = iar.po_id
WHERE iar.status = 'completed'
ORDER BY iar.inspection_date DESC;
```

#### Procurement by Category (YTD)
```sql
SELECT 
    i.category,
    COUNT(DISTINCT po.id) AS po_count,
    SUM(poi.quantity) AS total_quantity,
    SUM(poi.total_price) AS total_value
FROM po_items poi
JOIN items i ON poi.item_id = i.id
JOIN purchaseorders po ON poi.po_id = po.id
WHERE EXTRACT(YEAR FROM po.created_at) = 2026
GROUP BY i.category
ORDER BY total_value DESC;
```

### Integration Queries

#### Items: Procurement vs Inventory Status
```sql
SELECT 
    i.code,
    i.name,
    i.quantity AS inventory_qty,
    COALESCE(SUM(poi.quantity), 0) AS total_ordered,
    COALESCE(SUM(ii.quantity), 0) AS total_received,
    COALESCE(SUM(poi.quantity), 0) - COALESCE(SUM(ii.quantity), 0) AS pending_delivery
FROM items i
LEFT JOIN po_items poi ON i.id = poi.item_id
LEFT JOIN purchaseorders po ON poi.po_id = po.id AND po.status != 'cancelled'
LEFT JOIN iar_items ii ON i.id = ii.item_id
LEFT JOIN iars iar ON ii.iar_id = iar.id AND iar.status = 'completed'
WHERE i.category = 'EXPENDABLE'
GROUP BY i.id, i.code, i.name, i.quantity
HAVING (COALESCE(SUM(poi.quantity), 0) - COALESCE(SUM(ii.quantity), 0)) > 0
ORDER BY pending_delivery DESC;
```

---

## 🔧 Migration Guide

### From Old Schema to v2.0

#### 1. Backup Existing Database
```bash
pg_dump dmw_procurement > backup_procurement_$(date +%Y%m%d).sql
```

#### 2. Export Existing Data
```sql
-- Export items
COPY items TO '/tmp/items_export.csv' CSV HEADER;

-- Export purchase orders
COPY purchaseorders TO '/tmp/po_export.csv' CSV HEADER;

-- Export suppliers
COPY suppliers TO '/tmp/suppliers_export.csv' CSV HEADER;
```

#### 3. Create New Database
```bash
createdb dmw_caraga_system
psql -U postgres -d dmw_caraga_system -f DMW_INTEGRATED_SCHEMA_v2.0.sql
```

#### 4. Import Data (adjust columns as needed)
```sql
-- Import suppliers (add new columns)
COPY suppliers (name, contact_person, phone, email, address, tin)
FROM '/tmp/suppliers_export.csv' CSV HEADER;

-- Import items (map old columns to new)
COPY items (code, name, description, unit, unit_price, category)
FROM '/tmp/items_export.csv' CSV HEADER;

-- Update items with default inventory values
UPDATE items SET 
    quantity = 0,
    reorder_point = 0,
    is_active = TRUE
WHERE quantity IS NULL;
```

#### 5. Map Old IDs to New IDs
```sql
-- Create temporary mapping table
CREATE TEMP TABLE item_id_mapping (
    old_id INT,
    new_id INT,
    code VARCHAR(50)
);

-- Populate mapping
INSERT INTO item_id_mapping (old_id, new_id, code)
SELECT old.id, new.id, new.code
FROM old_items old
JOIN items new ON old.code = new.code;

-- Update references in po_items
UPDATE po_items poi
SET item_id = m.new_id
FROM item_id_mapping m
WHERE poi.old_item_id = m.old_id;
```

---

## 📝 Important Notes

### Inventory Classification (Government Standard)
- **EXPENDABLE**: Consumable items (office supplies, fuel, etc.)
  - Tracked via `stock_cards` (quantity-based)
  - UACS: 104xxxx series

- **SEMI-EXPENDABLE**: Equipment/furniture < ₱15,000
  - Tracked via `property_cards` (accountability-based)
  - UACS: 104050x - 104061x series

- **CAPITAL OUTLAY**: Equipment/furniture ≥ ₱15,000
  - Tracked via `property_cards` (accountability-based)
  - UACS: 106xxxx series

### Triggers in Action
1. **IAR Completion** → Auto-updates `items.quantity` + creates `stock_cards`
2. **Item Changes** → Logged in `audit_log`
3. **Counter Functions** → Auto-increment with year reset

### Best Practices
1. Always link `po_items` and `iar_items` to `items.id` (not just code)
2. Use `employees` table for property accountability (not `users`)
3. Complete IAR only when goods are fully received and inspected
4. Create property cards immediately after IAR for semi-expendable items
5. Issue ICS before transferring property custody
6. Run `vw_current_stock` daily to monitor inventory levels

---

## 🛠️ Maintenance

### Daily Tasks
```sql
-- Check low stock
SELECT * FROM vw_current_stock WHERE stock_status != 'In Stock';

-- Check pending deliveries
SELECT * FROM vw_po_summary WHERE workflow_status = 'awaiting_delivery';

-- Check unlinked property
SELECT * FROM property_cards WHERE issued_to_employee_id IS NULL AND status = 'active';
```

### Weekly Tasks
```sql
-- Vacuum tables
VACUUM ANALYZE items;
VACUUM ANALYZE stock_cards;
VACUUM ANALYZE property_cards;

-- Archive old audit logs (keep 1 year)
DELETE FROM audit_log WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
```

### Monthly Reports
```sql
-- Stock movement summary
SELECT 
    TO_CHAR(date, 'YYYY-MM') AS month,
    SUM(receipt_qty) AS total_received,
    SUM(issue_qty) AS total_issued,
    AVG(balance_total_cost) AS avg_inventory_value
FROM stock_cards
WHERE date >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY TO_CHAR(date, 'YYYY-MM')
ORDER BY month DESC;
```

---

## 📞 Support

For technical assistance:
- **Database Admin**: [email]
- **Procurement Officer**: [email]
- **Supply Officer**: [email]
- **System Admin**: [email]

---

**Last Updated:** February 12, 2026  
**Version:** 2.0.0  
**License:** Government of the Philippines - DMW CARAGA  
