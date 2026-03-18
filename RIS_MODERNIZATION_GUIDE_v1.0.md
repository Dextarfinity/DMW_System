# RIS (Requisition and Issue Slip) Modernization Guide
**Version:** 1.0  
**Date:** March 16, 2026  
**Status:** Implementation Complete

---

## Executive Summary

The RIS (Requisition and Issue Slip) system has been completely modernized to support dynamic category management, requisition type classification, priority flags, and enhanced workflow tracking. All changes are **production-ready**, **dynamic** (no hardcoded data), and support full **CRUD operations**.

---

## What Changed

### 1. **Database Schema Enhancements** ✅
Migration file: `server/database/migration_ris_workflow_v2.sql`

**New Columns Added to `requisition_issue_slips` Table:**
```sql
-- Item category from ppmp_categories table
category VARCHAR(255)

-- Requisition type (NORMAL, EMERGENCY, REPLACEMENT)
ris_type VARCHAR(50) DEFAULT 'NORMAL' CHECK (...)

-- Priority flag
is_priority BOOLEAN DEFAULT FALSE

-- Supply officer approval separate from division head approval
approved_by_supply_id INT REFERENCES users(id) ON DELETE SET NULL

-- Additional notes/remarks
remarks TEXT
```

**New Columns Added to `ris_items` Table:**
```sql
-- Item specifications from catalog
specification VARCHAR(500)

-- Available stock quantity when issued
available_qty INT DEFAULT 0

-- Issue type (REMOVAL, RETURN, TRANSFER, ADJUSTMENT)
issue_type VARCHAR(50) DEFAULT 'REMOVAL' CHECK (...)
```

**New Database Views:**
1. `vw_ris_with_category` - RIS records with category and section names from catalog
2. `vw_ris_items_detail` - RIS items with stock availability and category information

---

### 2. **Frontend Form Updates** ✅
File: `renderer/scripts/app.js`

#### New RIS Modal (showNewRISModal)
**New Fields Added to Create Form:**

| Field | Type | Source | Dynamic |
|-------|------|--------|---------|
| **Category** | Dropdown | `/api/ppmp-categories` | ✅ Yes |
| **RIS Type** | Radio Buttons | NORMAL, EMERGENCY, REPLACEMENT | ✅ Yes |
| **Priority Flag** | Checkbox | Boolean | ✅ Yes |
| **Supply Officer Approval** | Dropdown | Employee list | ✅ Yes |
| **Remarks** | Textarea | Free text | ✅ Yes |

**Form Structure:**
```
┌─ Basic Information ─────────────┐
│ Date | Division                 │
│ Purpose | Category (Dynamic!)   │
├─ Requisition Type & Priority ──┤
│ [○ Normal] [○ Emergency] [○ Replacement]  │
│        [✓] Mark as Priority    │
├─ Approvals ───────────────────┤
│ Requested By (Dynamic!)        │
│ Approved By - Division Head    │
│ Supply Officer Approval (NEW)  │
│ Remarks (NEW)                  │
├─ Items ──────────────────────┤
│ [Item Selection] [Qty] [+]     │
└───────────────────────────────┘
```

#### Edit RIS Modal (showEditRISModal)
- All new fields are editable
- Same category dropdown (dynamic from API)
- RIS Type selection preserved from original record
- Priority flag can be toggled on/off
- Supply officer approval can be changed

#### View RIS Modal (showViewRISModal)
- Displays all new fields including:
  - Category name
  - RIS Type with color coding
  - Priority indicator (orange star ⭐)
  - Supply officer name
  - Remarks section
  - Items table with full details

---

### 3. **Table Display Enhancements** ✅
File: `renderer/scripts/app.js` - `renderRISTable()` function

**Updated Columns Display:**
| Column | Content | Features |
|--------|---------|----------|
| RIS No. | RIS number | - |
| Date | RIS creation date | - |
| Division | Division code | - |
| **Category (NEW)** | Category from ppmp_categories | Dynamic lookup |
| Purpose | Purpose of requisition | - |
| **Type (NEW)** | NORMAL / EMERGENCY / REPLACEMENT | Color-coded badge |
| Requested By | Employee name | - |
| Approved By | Division head | - |
| Status | PENDING / POSTED / CANCELLED | Status badge |
| Actions | View / Post / Edit / Delete | Standard buttons |

**Visual Enhancements:**
- RIS Type shows with color-coded badges:
  - 🟢 NORMAL (Green)
  - 🔴 EMERGENCY (Red)
  - 🟠 REPLACEMENT (Orange)
- Priority indicator: ⭐ PRIORITY (Orange star)
- Status updated from "draft" to "PENDING" for consistency

---

### 4. **API Endpoint Updates** ✅
File: `server/server.js`

#### POST `/api/ris` - Create New RIS
**Request Body (Enhanced):**
```json
{
  "ris_date": "2026-03-16",
  "division": "FAD",
  "purpose": "Office supplies replenishment",
  
  // NEW FIELDS:
  "category": "OFFICE SUPPLIES EXPENSES",
  "ris_type": "NORMAL",
  "is_priority": false,
  "remarks": "Urgent order needed",
  
  "requested_by_id": 5,
  "approved_by_id": 3,
  "approved_by_supply_id": 8,  // NEW
  
  "status": "PENDING",
  "items": [
    { "item_id": 1, "quantity": 10 },
    { "item_id": 2, "quantity": 5 }
  ]
}
```

**Response:**
- Returns complete RIS record with all new fields

#### PUT `/api/ris/:id` - Update RIS
**Request Body:**
- Same as POST (all fields are updateable)
- Does NOT include `ris_no` (auto-generated, read-only)
- Supports full record updates and item replacements

**Validations Enforced:**
```sql
CHECK (ris_type IN ('NORMAL', 'EMERGENCY', 'REPLACEMENT'))
CHECK (issue_type IN ('REMOVAL', 'RETURN', 'TRANSFER', 'ADJUSTMENT'))
```

#### GET `/api/ris` - List All RIS
**Response Includes:**
- All columns from requisition_issue_slips table
- Employee name lookups (requested_by_name, approved_by_name, etc.)
- Items array with item details

#### GET `/api/ris/:id` - Get Single RIS
**Response Structure:**
```json
{
  "id": 1,
  "ris_no": "RIS-2026-0001",
  "division": "FAD",
  "ris_date": "2026-03-16",
  "purpose": "...",
  "category": "OFFICE SUPPLIES EXPENSES",
  "ris_type": "NORMAL",
  "is_priority": false,
  "remarks": "...",
  "requested_by_id": 5,
  "requested_by_name": "John Doe",
  "approved_by_id": 3,
  "approved_by_name": "Jane Smith",
  "approved_by_supply_id": 8,          // NEW
  "issued_by_id": null,
  "received_by_id": null,
  "status": "PENDING",
  "items": [
    {
      "id": 10,
      "ris_id": 1,
      "item_id": 1,
      "item_name": "Ballpen",
      "quantity": 10,
      "uom": "box",
      "specification": "Blue ink, 0.7mm",
      "available_qty": 45,
      "issue_type": "REMOVAL",
      "unit_cost": 50.00
    }
  ],
  "created_at": "2026-03-16T10:30:00Z",
  "updated_at": "2026-03-16T10:30:00Z"
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (renderer/app.js)                   │
│                    RIS Modal Form                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │ category ──────────┐                            │    │
│  │ ris_type ──────────├──→ saveNewRIS()/          │    │
│  │ is_priority ───────┤    saveEditRIS()          │    │
│  │ approved_by_supply ├──→ POST/PUT /api/ris      │    │
│  │ remarks ───────────┘                            │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP POST/PUT
                   ▼
┌─────────────────────────────────────────────────────────┐
│            BACKEND (server/server.js)                    │
│           /api/ris (POST/PUT) Endpoints                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Extract fields from req.body                    │    │
│  │ ├─ category, ris_type, is_priority              │    │
│  │ ├─ approved_by_supply_id, remarks               │    │
│  │ └─ items (with item_id, quantity)               │    │
│  └──────────────┬──────────────────────────────────┘    │
│                 │                                       │
│  ┌──────────────▼──────────────────────────────────┐    │
│  │  BEGIN TRANSACTION                              │    │
│  │  1. Auto-generate RIS number (if needed)        │    │
│  │  2. INSERT requisition_issue_slips with ALL     │    │
│  │     fields including NEW columns                │    │
│  │  3. INSERT ris_items (if provided)              │    │
│  │  4. COMMIT or ROLLBACK                          │    │
│  └──────────────┬──────────────────────────────────┘    │
│                 │                                       │
│  ┌──────────────▼──────────────────────────────────┐    │
│  │ Return RIS record with all fields populated     │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────┬──────────────────────────────────┘
                      │ Response to Frontend
                      ▼
┌─────────────────────────────────────────────────────────┐
│         DATABASE  (PostgreSQL)                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ requisition_issue_slips table                   │    │
│  │ ├─ NEW: category VARCHAR(255)                   │    │
│  │ ├─ NEW: ris_type VARCHAR(50)                    │    │
│  │ ├─ NEW: is_priority BOOLEAN                     │    │
│  │ ├─ NEW: approved_by_supply_id INT               │    │
│  │ ├─ NEW: remarks TEXT                            │    │
│  │ └─ Plus 20+ existing columns                    │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ ris_items table                                 │    │
│  │ ├─ NEW: specification VARCHAR(500)              │    │
│  │ ├─ NEW: available_qty INT                       │    │
│  │ ├─ NEW: issue_type VARCHAR(50)                  │    │
│  │ └─ Plus existing columns                        │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ ppmp_categories table (LOOKUP)                  │    │
│  │ Used for dynamic category dropdown              │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Checklist

- ✅ Database migration file created: `migration_ris_workflow_v2.sql`
- ✅ New columns added to `requisition_issue_slips` table
- ✅ New columns added to `ris_items` table
- ✅ Database views created: `vw_ris_with_category`, `vw_ris_items_detail`
- ✅ Frontend: `showNewRISModal()` updated with all new fields
- ✅ Frontend: `showEditRISModal()` updated with all new fields
- ✅ Frontend: `showViewRISModal()` displays all new fields
- ✅ Frontend: `saveNewRIS()` sends all new fields to API
- ✅ Frontend: `saveEditRIS()` sends all new fields to API
- ✅ Frontend: `renderRISTable()` displays category and RIS type
- ✅ Backend: POST `/api/ris` updated to handle all new fields
- ✅ Backend: PUT `/api/ris/:id` updated to handle all new fields
- ✅ Backend: GET `/api/ris` returns all new fields
- ✅ Backend: GET `/api/ris/:id` returns all new fields with items
- ✅ Category dropdown dynamically loaded from `/api/ppmp-categories`
- ✅ Employee dropdown for supply officer approval
- ✅ All changes are DYNAMIC (no hardcoded data)
- ✅ Full CRUD support verified

---

## Deployment Steps

### Step 1: Apply Database Migration
```sql
-- Execute this file in PostgreSQL
psql -U postgres -d dmw_system -f server/database/migration_ris_workflow_v2.sql
```

### Step 2: Verify Database Changes
```sql
-- Verify new columns exist
\d requisition_issue_slips
\d ris_items

-- Verify views created
SELECT * FROM vw_ris_with_category LIMIT 1;
SELECT * FROM vw_ris_items_detail LIMIT 1;
```

### Step 3: Restart Server
```bash
cd /DMW_System
./STOP_SERVER.bat
./START_SERVER.bat
```

### Step 4: Test in Browser
1. Navigate to RIS page
2. Click **"New RIS"** button
3. Verify new fields:
   - ✅ Category dropdown loads from API
   - ✅ RIS Type radio buttons appear
   - ✅ Priority checkbox appears
   - ✅ Supply Officer Approval dropdown loads employees
   - ✅ Remarks textarea appears
4. Create a new RIS with all fields filled
5. Verify it appears in table with new columns displayed
6. Edit RIS and verify all fields are editable
7. View RIS detail modal and verify all fields display

---

## Backward Compatibility

- ✅ Existing RIS records work without modification
- ✅ New fields are NULLABLE (no existing data breaks)
- ✅ API endpoints accept requests with or without new fields
- ✅ Frontend gracefully handles missing data (shows "N/A")

---

## Example API Calls

### Create RIS (Complete Example)
```bash
curl -X POST http://localhost:3000/api/ris \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ris_date": "2026-03-16",
    "division": "FAD",
    "purpose": "Office supplies replenishment",
    "category": "OFFICE SUPPLIES EXPENSES",
    "ris_type": "NORMAL",
    "is_priority": false,
    "remarks": "Regular monthly order",
    "requested_by_id": 5,
    "approved_by_id": 3,
    "approved_by_supply_id": 8,
    "status": "PENDING",
    "items": [
      {
        "item_id": 1,
        "quantity": 10
      }
    ]
  }'
```

### Update RIS
```bash
curl -X PUT http://localhost:3000/api/ris/42 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "MOOE",
    "ris_type": "EMERGENCY",
    "is_priority": true,
    "remarks": "Urgent repair supplies needed",
    ...
  }'
```

---

## Troubleshooting

**Issue:** Category dropdown shows empty  
**Solution:** Verify `/api/ppmp-categories` endpoint returns data  
```javascript
// In browser console
apiRequest('/ppmp-categories').then(cats => console.log(cats));
```

**Issue:** Supply officer dropdown not loading  
**Solution:** Verify employees are loaded and dropdown ID is correct  
```javascript
loadEmployeesDropdown('editRISApprovedBySupply');
```

**Issue:** RIS type not saving  
**Solution:** Verify radio button name is correct in form (`editRisType` vs `risType`)

**Issue:** Remarks field empty when editing  
**Solution:** Check that `#editRISRemarks` textarea exists and has default value

---

## Performance Considerations

- Category dropdown is loaded once per modal open (cached in options)
- RIS table renders on demand (efficient HTML generation)
- Database queries use proper indexes on frequently searched columns
- No N+1 query problems (views handle JOINs efficiently)

---

## Future Enhancements

1. **RIS Approval Workflow** - Add status transitions (PENDING → APPROVED → POSTED)
2. **Category-based Routing** - Route RIS to different approval queues by category
3. **Stock Availability Check** - Before posting, flag insufficient stock
4. **RIS Templates** - Allow saving RIS as templates for repeated orders
5. **Batch RIS Operations** - Create multiple RIS entries from spreadsheet upload
6. **RIS Tracking Reports** - Dashboard showing RIS by type, priority, category

---

## Support & Questions

For issues or questions about the RIS modernization:
1. Check the troubleshooting section above
2. Review sample RIS records in the test database
3. Verify database migration ran successfully
4. Check browser console for JavaScript errors

---

**Created:** March 16, 2026  
**Status:** PRODUCTION READY ✅  
**All Changes:** DYNAMIC & CRUD-Enabled ✅
