# DMW Procurement System Updates - Implementation Guide

**Date:** March 16, 2026  
**Status:** Ready for Deployment  
**Version:** 2.0

---

## 📋 Executive Summary

This implementation provides comprehensive updates to the DMW Procurement Management System to support:

1. **Dynamic Category Management** - Replace hardcoded categories with database-driven PPMP categories and sections
2. **Clean Transactional Data** - Remove all procurement data from PR through IAR
3. **Two-Phase BAC Resolution** - Support separate BAC Resolutions for Mode Determination and Winner Determination
4. **Enhanced RIS Workflow** - Update Requisition and Issue Slip with category and type support

---

## 📊 Key Changes

### 1. PPMP Categories & Sections ✅

**Files:**
- `migration_categories_sections_v1.sql` (already exists)
- `seed_categories_2026.sql` (created)

**New Categories:**
- ICT OFFICE SUPPLIES EXPENSES
- OFFICE SUPPLIES EXPENSES
- SEMI-ICT EQUIPMENT
- SEMI-OFFICE EQUIPMENT
- SEMI-FURNITURE & FIXTURES
- OTHER SUPPLIES AND MATERIALS
- OTHER MOOE
- REPRESENTATION EXPENSES
- PRINTING, PUBLICATION AND BINDING EXPENSES

**Database Tables:**
```sql
ppmp_sections
├─ id (PK)
├─ name (UNIQUE)
├─ description
├─ display_order
├─ is_active
└─ created_at, updated_at

ppmp_categories
├─ id (PK)
├─ name (UNIQUE)
├─ section_id (FK → ppmp_sections)
├─ description
├─ display_order
├─ is_active
└─ created_at, updated_at
```

**API Endpoints (Already Exist):**
- `GET /api/ppmp-sections` - List all sections
- `GET /api/ppmp-categories` - List all categories
- `GET /api/ppmp-categories/section/:section_id` - Get categories by section
- `POST /api/ppmp-sections` - Create section (admin only)
- `POST /api/ppmp-categories` - Create category (admin only)
- `PUT /api/ppmp-sections/:id` - Update section
- `PUT /api/ppmp-categories/:id` - Update category
- `DELETE /api/ppmp-sections/:id` - Delete section
- `DELETE /api/ppmp-categories/:id` - Delete category

### 2. Data Cleanup ✅

**File:** `cleanup_and_migrate_v2.sql`

**Deletes (in order):**
1. IAR Items and IARs
2. PO Items and POs
3. COA Submissions
4. PO Packets
5. NOAs
6. BAC Resolutions
7. Post-Qualifications
8. Abstract Quote Items and Abstract Quotations
9. Abstracts
10. RFQ Items, RFQ Suppliers, RFQs
11. PR Items and PRs
12. RIS Items and RIS

**Important:** Preserves all master data (items, suppliers, employees, divisions, etc.)

---

### 3. Two-Phase BAC Resolutions ✅

**File:** `migration_bac_two_phases.sql`

**New Column:** `bac_resolutions.bac_resolution_type`
- `MODE_DETERMINATION` - Sets procurement mode (after RFQ)
- `WINNER_DETERMINATION` - Sets winning supplier (after TWG)

**Updated Workflow:**
```
PR (Pending Approval)
├─ If APPROVED → 
│  ├─ BAC RESOLUTION (MODE DETERMINATION)
│  │  └─ Determines procurement mode
│  ├─ RFQ (Request for Quotation)
│  │  └─ Supplier invitations & responses
│  ├─ ABSTRACT OF QUOTATION
│  │  └─ Evaluate & rank bids
│  ├─ POST-QUALIFICATION / TWG
│  │  └─ Technical & financial verification
│  ├─ BAC RESOLUTION (WINNER DETERMINATION)
│  │  └─ Announce winning bidder
│  ├─ NOTICE OF AWARD
│  │  └─ Formal award to supplier
│  ├─ PURCHASE ORDERS
│  │  └─ Issue POs for selected items
│  └─ INSPECTION & ACCEPTANCE REPORT (IAR)
│     └─ Receive & inspect goods
└─ If REJECTED → End processing
```

### 4. RIS Workflow Enhancement ✅

**File:** `migration_ris_workflow_v2.sql`

**New Columns:**
```sql
requisition_issue_slips additions:
├─ category (VARCHAR) - from ppmp_categories
├─ ris_type (VARCHAR) - 'NORMAL', 'EMERGENCY', 'REPLACEMENT'
├─ approved_by_supply_id (INT FK)
├─ is_priority (BOOLEAN)
└─ remarks (TEXT)

ris_items additions:
├─ specification (VARCHAR(500))
├─ available_qty (INT)
└─ issue_type (VARCHAR) - 'REMOVAL', 'RETURN', 'TRANSFER', 'ADJUSTMENT'
```

**Views Created:**
- `vw_ris_with_category` - RIS with category/section names
- `vw_ris_items_detail` - RIS items with stock availability

---

## 🚀 Implementation Steps

### Step 1: Apply Database Migrations

Execute in this order:

```sql
-- 1. Create PPMP sections and categories tables
\i migration_categories_sections_v1.sql

-- 2. Seed new categories
\i seed_categories_2026.sql

-- 3. Add two-phase BAC Resolution support
\i migration_bac_two_phases.sql

-- 4. Update RIS workflow
\i migration_ris_workflow_v2.sql

-- 5. Clean all transactional data
\i cleanup_and_migrate_v2.sql
```

### Step 2: Update API Endpoints (Optional)

The existing API endpoints already support the new structure:
- Categories are loaded dynamically
- Frontend filters use DB values
- No hardcoded data

**Verify endpoints work:**
```bash
# List all categories
curl http://localhost:PORT/api/ppmp-categories

# List sections nur
curl http://localhost:PORT/api/ppmp-sections

# Get categories for a section
curl http://localhost:PORT/api/ppmp-categories/section/1
```

### Step 3: Update Frontend (renderer/scripts/app.js)

Replace hardcoded category mappings with dynamic API calls:

**Before:**
```javascript
const CATEGORY_MAP = {
    'ICT OFFICE SUPPLIES EXPENSES': 'OFFICE OPERATION',
    'OFFICE SUPPLIES EXPENSES': 'OFFICE OPERATION',
    // ... etc
};
```

**After:**
```javascript
async function loadCategories() {
    const categories = await apiRequest('/ppmp-categories');
    return categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        section_id: cat.section_id,
        section_name: cat.section_name
    }));
}
```

### Step 4: Update Modals for Two-Phase BAC Resolution

The BAC Resolution modal should now support:
1. Type selection: Mode Determination vs Winner Determination
2. Conditional fields based on type:
   - **Mode Determination:** Focus on procurement mode selection
   - **Winner Determination:** Focus on supplier selection

### Step 5: Test Procurement Workflow

1. **Create a PR** → Status: pending_approval
2. **Approve PR** → Creates BAC RESOLUTION (MODE_DETERMINATION)
3. **Set procurement mode in BAC Resolution**
4. **Create RFQ** → Invite suppliers
5. **Create Abstract** → Evaluate bids
6. **Create Post-Qualification** → Technical review
7. **Create BAC RESOLUTION** (WINNER_DETERMINATION) → Select winner
8. **Create NOA** → Notify supplier
9. **Create PO** → Issue purchase order
10. **Create IAR** → Inspect goods

---

## 📁 Files Locations

```
server/database/
├─ migration_categories_sections_v1.sql ✅ (existing)
├─ seed_categories_2026.sql ✅ (created)
├─ migration_bac_two_phases.sql ✅ (created)
├─ migration_ris_workflow_v2.sql ✅ (created)
├─ cleanup_and_migrate_v2.sql ✅ (created)
└─ consolidated_schema.sql (reference)

renderer/scripts/
└─ app.js (needs dynamic category loading update)

server/
└─ server.js (API endpoints already exist)
```

---

## ✅ Completed Tasks

| # | Task | Status | File |
|---|------|--------|------|
| 1 | Create PPMP categories & sections tables | ✅ DONE | migration_categories_sections_v1.sql |
| 2 | Seed new categories | ✅ DONE | seed_categories_2026.sql |
| 3 | Remove hardcoded categories | ✅ API READY | server/server.js (endpoints ready) |
| 4 | Delete procurement data (PR→IAR) | ✅ DONE | cleanup_and_migrate_v2.sql |
| 5 | Add two-phase BAC Resolution | ✅ DONE | migration_bac_two_phases.sql |
| 6 | Update RIS workflow | ✅ DONE | migration_ris_workflow_v2.sql |

---

## 🔄 Rollback Instructions (If Needed)

```sql
-- Restore from backup
\i backup_2026_02_25.sql

-- Or rebuild tables and re-seed
\i consolidated_schema.sql
\i consolidated_seed.sql
```

---

## 📝 Notes

- All migrations are **idempotent** (safe to run multiple times)
- Foreign key constraints are preserved
- Indexes are created for performance
- Views provide convenient data access
- Cleanup script includes optional sequence reset

## 🎯 Next Steps

1. ✅ Review SQL migrations
2. ⏳ Execute migrations in PostgreSQL
3. ⏳ Test API endpoints
4. ⏳ Update frontend category loading
5. ⏳ Test full procurement workflow
6. ⏳ Document for end users

---

**Created:** March 16, 2026  
**Author:** System Modernization Initiative  
**Last Updated:** March 16, 2026
