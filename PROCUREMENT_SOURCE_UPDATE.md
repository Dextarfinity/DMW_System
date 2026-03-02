# Procurement Source Categorization Update

**Date:** March 2, 2026  
**Version:** 1.0  
**Scope:** Full-stack — Database, Server API, Electron Frontend (Items Catalog, PPMP, IAR)

---

## Overview

A new **Procurement Source** classification has been introduced across the entire procurement system to categorize every item and expense into one of three types:

| Source | Description | Where it exists |
|--------|------------|-----------------|
| **PS-DBM** | Available in Procurement Service – Department of Budget and Management (Common-Use Supplies & Equipment) | Items Catalog |
| **NON PS-DBM** | Not available via PS-DBM but tracked in the Items Catalog | Items Catalog |
| **PAPs** | Programs, Activities & Projects — budget line items for division activities (e.g., meals, transportation, honoraria, tarpaulin printing, tokens, training materials) | Items Catalog (categorized as PAPs) |

All three categories exist **in the Items Catalog**. PAPs items are regular catalog entries with `procurement_source = 'PAPs'`.

---

## Database Changes

### Migration File
`server/database/migration_procurement_source.sql`

### New Column: `procurement_source VARCHAR(20)`
Added to the following tables:

| Table | Default Value | Purpose |
|-------|--------------|---------|
| `items` | `'NON PS-DBM'` | Categorize each catalog item |
| `procurementplans` | `'NON PS-DBM'` | Track source per PPMP entry |
| `iar_items` | `NULL` | Track source per IAR line item |
| `po_items` | `NULL` | Track source per PO line item |
| `purchaserequests` | `NULL` | Track source per PR |

### Additional Columns on `procurementplans`
These were added to ensure schema-code consistency:
- `category VARCHAR(100)`
- `item_id INT REFERENCES items(id)`
- `section VARCHAR(100) DEFAULT 'GENERAL PROCUREMENT'`
- `item_description TEXT`

### Indexes
```sql
CREATE INDEX idx_items_procurement_source ON items(procurement_source);
CREATE INDEX idx_plans_procurement_source ON procurementplans(procurement_source);
```

### Auto-Classification
The migration auto-marks common PS-DBM items (bond paper, cartridges, toner, folders, envelopes, batteries, ballpen, etc.) and propagates `procurement_source` from `items` to linked `procurementplans` entries.

### How to Run
```bash
psql -U your_user -d your_database -f server/database/migration_procurement_source.sql
```

---

## Server API Changes

**File:** `server/server.js`

### Items Endpoints
| Endpoint | Change |
|----------|--------|
| `GET /api/items` | Supports `?procurement_source=` query filter |
| `POST /api/items` | Accepts `procurement_source` in request body (default: `'NON PS-DBM'`) |
| `PUT /api/items/:id` | Accepts `procurement_source` in request body |

### PPMP/Plans Endpoints
| Endpoint | Change |
|----------|--------|
| `GET /api/plans` | Returns `pp.procurement_source` and `it.procurement_source as item_procurement_source`; supports `?procurement_source=` filter |
| `POST /api/plans` | Accepts `procurement_source` (default: `'NON PS-DBM'`) |
| `POST /api/plans/batch` | Accepts `procurement_source` per entry |
| `PUT /api/plans/:id` | Accepts `procurement_source` |
| `GET /api/plan-items` | Returns `pp.procurement_source` |

### IAR Endpoints
| Endpoint | Change |
|----------|--------|
| `GET /api/iars/:id` | Returns `i.procurement_source as item_procurement_source` on each IAR item |
| `POST /api/iars` | Accepts `procurement_source` per IAR item |
| `PUT /api/iars/:id` | Accepts `procurement_source` per IAR item |

---

## Frontend Changes

**Files:** `renderer/scripts/app.js`, `renderer/index.html`, `renderer/styles/main.css`

### Items Catalog Page

- **Table** — New "Source" column displays a color-coded badge (PS-DBM / NON PS-DBM / PAPs)
- **Filter** — New "Source" dropdown filter in the toolbar (`All Sources`, `PS-DBM`, `NON PS-DBM`, `PAPs`)
- **New Item Modal** — Procurement Source dropdown with all 3 options
- **Edit Item Modal** — Procurement Source dropdown pre-selected with the item's current value

### PPMP Page

- **Table** — Each item row shows a procurement source badge next to the description
- **Filter** — New "Source" dropdown filter in the PPMP toolbar (filters via server query param)
- **New PPMP Modal** — Procurement Source selector at the top of the form:
  - Selecting **PS-DBM** or **NON PS-DBM**: Shows catalog items filtered to that source
  - Selecting **PAPs**: Shows catalog items filtered to PAPs **plus** an additional "Quick Add" section for manually entering PAPs expenses not yet in the catalog
- **Quick Add PAPs Section** — For expenses not yet in catalog:
  - Section selector (division activities: WRSD, MWPSD, MWPTD, FAD, Trainings, etc.)
  - PAP Category (Meals & Snacks, Tarpaulin Printing, Honorarium, Transportation Rental, Training Materials, Personalized Tokens, etc.)
  - Activity/Program Name, Expense Description, Unit, Quantity/Size, Total Budget
  - Items added here are saved with `item_id: null` and `procurement_source: 'PAPs'`
- **Edit PPMP Modal** — Procurement Source dropdown (PS-DBM / NON PS-DBM / PAPs) with current value pre-selected; included in save payload
- **View PPMP Modal** — Displays procurement source as a color-coded badge

### IAR Page

- **View IAR Modal** — Now fetches full IAR detail including items; displays an items table with a "Source" column showing procurement source badges per item

### CSS Styles

New `.source-badge` classes in `renderer/styles/main.css`:

| Class | Colors | Used For |
|-------|--------|----------|
| `.source-badge.psdbm` | Green text (#1e7e34) on light green (#e6f4ea) | PS-DBM items |
| `.source-badge.non-psdbm` | Blue text (#1a56db) on light blue (#e8f0fe) | NON PS-DBM items |
| `.source-badge.paps` | Orange text (#e65100) on light amber (#fff3e0) | PAPs items |

---

## New JavaScript Functions

| Function | Purpose |
|----------|---------|
| `togglePPMPSourceMode(source)` | Toggles PPMP form between source modes; filters catalog dropdown; shows/hides Quick Add PAPs section |
| `addPAPsItemToList()` | Adds a manual PAPs expense entry to the PAPs list |
| `removePAPsItem(index)` | Removes a PAPs item from the list |
| `updatePAPsItemBudget(index, val)` | Updates budget for a PAPs list item |
| `renderPAPsItemsList()` | Renders the PAPs items table in the PPMP modal |
| `filterItemsBySource(source)` | Client-side filter for Items Catalog table by source badge |

---

## Data Flow

```
Items Catalog (PS-DBM / NON PS-DBM / PAPs)
    │
    ▼
PPMP Entry ──────────────────────────────┐
    │  (procurement_source inherited     │
    │   from catalog item, or set to     │
    │   'PAPs' for manual entries)       │
    ▼                                    │
APP (Annual Procurement Plan)            │
    │                                    │
    ▼                                    │
Purchase Request ◄───────────────────────┘
    │  (procurement_source carried forward)
    ▼
Purchase Order
    │  (po_items.procurement_source)
    ▼
IAR (Inspection & Acceptance Report)
    │  (iar_items.procurement_source)
    ▼
Inventory
```

---

## PAPs Examples (from DMW Divisions)

| Division | Activity | Typical PAPs Expenses |
|----------|----------|----------------------|
| WRSD | Pre-Migration Orientation Seminar | Meals & Snacks, Tarpaulin Printing, Transportation Rental |
| MWPSD | Capability Building Activities | Training Materials, Honorarium, Printed Polo/T-shirt |
| MWPTD | Anti-Trafficking Campaigns | Personalized Tokens, Supplies & Materials, Representation Expenses |
| FAD | Financial Literacy Seminars | Meals & Snacks, Printing & Publication, Venue Rental |

---

## Notes

- The default `procurement_source` for new items is `'NON PS-DBM'`
- PAPs items in the catalog are standard items — the only difference is their `procurement_source` value
- The Quick Add PAPs section in the PPMP modal is a convenience tool for expenses not yet registered in the catalog; if a PAPs item already exists in the catalog, it should be selected from the catalog dropdown instead
- The migration must be run against the database before the updated server/frontend code is deployed



psql -U your_user -d your_database -f server/database/migration_pap_management.sql