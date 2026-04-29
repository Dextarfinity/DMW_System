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

cd "c:\Users\Kurt\Desktop\PROCUREMENT SYSTEM - Copy\DMW_System"; $env:PGPASSWORD='dmw123'; psql -U postgres -d dmw_db -f server/database/migration_pap_management.sql 2>&1



Instructions for Updating the Create and Edit PPMP Modal
Please implement the following updates to the Create and Edit PPMP modal, specifically within the PAPs Procurement Source section.
1. Section Title Update
Rename the section “Manual PAP Item Entry” to “PAP Details (Programs, Activities & Projects)”.
2. Remove Duplicate Section
Remove the existing “PAP Details (Programs, Activities & Projects)” section to prevent duplication and maintain a single unified section.
3. Enhancements to the PAP Details Section
Within the updated PAP Details (Programs, Activities & Projects) section, implement the following changes:
a. Unit Selection
Add a Unit dropdown field.
The dropdown options must be dynamically retrieved from the Units of Measure table.
b. Estimated Budget Calculation
Add an Estimated Budget field.
This field should be automatically calculated using the formula:
Estimated Budget = Unit Price × Quantity
The value should update in real time whenever the Unit Price or Quantity changes.
c. Field Adjustments
Rename Item Name to PAP Name.
Convert the Description field into a textarea to support longer and more detailed input.
4. Item Handling Logic
When users add manual items or select items from the Item Catalog, both types must be combined and treated as a single unified list of items within the system.
Additional Changes for Non-PSDBM Manual Entry (Procurement Source)
Please apply the following changes when creating Non-PSDBM items manually in the Procurement Source:
1. Unit Selection
Add a Unit dropdown field.
The dropdown options must be dynamically retrieved from the Units of Measure table.
2. Estimated Budget Calculation
Add an Estimated Budget field.
This value must be automatically calculated using the formula:
Estimated Budget = Unit Price × Quantity
3. Handling Logic
Items manually added and items selected from the Item Catalog should be treated as part of the same unified item list within the system.


ALSO IN THE PPMP PAGE WHEN EDITING A SPECIFIC PPMP WITH THE UNIT DROPdown IN THE EDIT PPMP ENTRY MODAL THEN SAVE CHANGES THEN THE QUANTITY AND SIZE COLUMN FOR SPECIFIC PPMP IS DISPLAYED LIKE THIS FOR EXAMPLE:

20 bottle @ ₱687.50/ bottle APPLY IT TO ALL PPMP IN ALL DIVISIONS AND SAVE IT TO THE DATABASE MAKE IT ALL DYNAMIC WHAT DISPLAYS IN THE PPMP PAGE

PPMP NO. GENERAL DESCRIPTION AND OBJECTIVE OF THE PROJECT TO BE PROCURED TYPE OF PROJECT
(GOODS, INFRASTRUCTURE, CONSULTING SERVICES) QUANTITY AND SIZE RECOMMENDED MODE OF PROCUREMENT PRE-PROCUREMENT CONFERENCE
(YES/NO) START OF PROCUREMENT ACTIVITY
(MM/YYYY) END OF PROCUREMENT ACTIVITY
(MM/YYYY) EXPECTED DELIVERY / IMPLEMENTATION PERIOD SOURCE OF FUNDS ESTIMATED BUDGET / ABC (₱) REMARKS STATUS

WILL BE SAVED IN THE PROCUREMENTPLANS TABLE IN THE DATABASE




IN APP PAGE ONCE THERE IS DELETION IN APP MAKE ALSO THE TOTAL APPROVED BUDGET AND AVAILABLE BUDGET DYNAMIC BASED ON THE APP DISPLAYED ON THE TABLE MAKE IT SYNCHRONIZED

AND ALSO WHEN THE USER REFRESHES APPLICATION AFTR REFRESHED IT WILL NOT GO BACK TO DASHBOARD PAGE ONLY IN THE CURRENT PAGE PLEASE FIX ALL THE ROUTING IN THIS APPLICATION AND MAKE IT PERFECT.


# DMW Procurement System - ROUTING FIX IMPLEMENTATION

## ✅ PLAN APPROVED: Fix refresh → stay on current page (ALL pages)

### CURRENT STATUS: [0/8] ⏳ Planning

## 📋 IMPLEMENTATION STEPS

### [ ] 1. CREATE TODO.md ✅ **DONE**

### [ ] 2. Update navigateTo(pageId) → set window.location.hash
- Add `window.location.hash = pageId`
- Store in localStorage
- Update nav menu active states

### [ ] 3. Add browser navigation handlers
```
window.onhashchange = () => navigateToFromHash()
window.onpopstate = () => navigateToFromHash()
```

### [ ] 4. Fix DOMContentLoaded initialization
- Parse `window.location.hash` on load
- Default to 'dashboard' only if empty
- Restore from localStorage backup

### [ ] 5. Update ALL nav menu links
- Add `onclick="navigateTo('pageId')"` to ALL nav items
- Add `data-page="pageId"` attributes

### [ ] 6. Add navigateToFromHash() helper
- Extract pageId from `window.location.hash.slice(1)`
- Validate against rolePermissions
- Call navigateTo(pageId)

### [ ] 7. Add localStorage persistence
```
localStorage.setItem('dmw_active_page', pageId)
localStorage.getItem('dmw_active_page')
```

### [ ] 8. **TEST ALL PAGES** 
```
✅ Dashboard     ✅ PPMP      ✅ APP  
✅ PR           ✅ RFQ       ✅ Abstract
✅ Post-Qual    ✅ BAC Reso  ✅ NOA
✅ PO           ✅ IAR       ✅ Items
✅ Suppliers    ✅ Stock     ✅ Property
✅ RIS          ✅ Reports
```

### [ ] 9. **PRODUCTION VERIFY**
```
DMW_System/RESTART_SERVER.bat
Test refresh on ALL pages
Test back/forward buttons
```

## 🔍 DEBUG COMMANDS (Keep for reference)
```
findstr /n /i "navigateTo\|activePageId\|dashboard" renderer/scripts/app.js
```

## 📝 NOTES
- File: `renderer/scripts/app.js` (VSCode open)
- Affects: ALL 25+ pages
- Backup: `git commit -m "pre-routing-fix"`


IN APP PAGE ONCE THERE IS DELETION IN APP MAKE ALSO THE TOTAL APPROVED BUDGET AND AVAILABLE BUDGET DYNAMIC BASED ON THE APP DISPLAYED ON THE TABLE MAKE IT SYNCHRONIZED

AND ALSO WHEN THE USER REFRESHES APPLICATION AFTR REFRESHED IT WILL NOT GO BACK TO DASHBOARD PAGE ONLY IN THE CURRENT PAGE PLEASE FIX ALL THE ROUTING IN THIS APPLICATION AND MAKE IT PERFECT

ALSO WHEN ALL THE CONSOLIDATED APP ARE DELETED THEN THE AVAILABLE BUDGET IS ALSO 0 

IN APP PAGE ONCE THERE IS DELETION IN APP MAKE ALSO THE TOTAL APPROVED BUDGET AND AVAILABLE BUDGET DYNAMIC BASED ON THE APP DISPLAYED ON THE TABLE MAKE IT SYNCHRONIZED


WHEN THERE IS NO CONSOLIDATED APP AND ALL THE APP ARE DELETED THEN THE AVAILABLE BUDGET WILL ALSO BE DELETED OR 0 BALANCE 

AND ALSO WHEN CONSOLIDATING FROM PPMP TO APP PAGE, ALL THE CONSOLIDATED APP MUST DISPLAY RIGHT AWAY NO REFRESH APPLICATION NEEDED IT WILL DISPLAY IN THE APP PAGE IN REAL TIME





OTHER APP PAGE BUGS:
1. WHEN EDITING THE APP IT SAYS NO APP ITEM FOUND AND NEED TO REFRESH THE APPLICATION TO EDIT IN ACTIONS TABLE NOT ONLY EDIT BUT ALL ACTIONS BUTTONS 

2. THE CONSOLIDATED APP DOES NOT DISPLAY IN THE APP TABLE UNLESS THE "View in APP Page" button, It must be displayed in the table before the modal shows like make the consolidation real time and dynamic.

3. FIX ADJUST APP BUDGET MODAL SAVE BUDGET BUTTON AND MAKE IT WORKING.

4. ALSO THE CONSOLIDATED CHECKMARK IN THE "Consolidate from PPMP" BUTTON NOT DISAPPEARS WHEN THE APPLICATION IS REFRESHED WHEN SETTING THE STATUS IN "Set Status" BUTTON

5. IN EDIT BUTTON IN APP, FETCH THE START DATE AND END DATE FROM THE DATABASE LIKE FETCHED IT IN DATE FORMAT ALSO IN THE EDIT APP ENTRY MODAL. 

6. THE CONSOLIDATION STATUS MUST BE IN REAL-TIME, "Consolidated" and "Not yet Consolidated" must always display in the "Consolidated from PPMP" BUTTON.







PLEASE FIX THIS OCCURING PROBLEM AND COMMUNICATE WITH THE SERVER TO ACCESS THE APP_ENTRIES TABLE IN THE DATABASE

The API says the budget was ALREADY 1000! But then the frontend gets 2000 back.

This means:

✅ procurementplans.total_amount = 1000 (database updated correctly)
❌ app_entries.estimated_budget = 2000 (NOT UPDATED!)
❌ GET /plan-items reads from app_entries and returns 2000
The two tables are OUT OF SYNC!

FOR THE AUTO DISCOVERY IP ADDRESSES, REMOVE THE DEFUALT IP ADRESSES SINCE THIS APPLICATION AUTO DETECTS THE CURRENT IP ADDRESS OF THE CONNECTED NETWORK OF THE SERVER THEN THE CLIENT SIDE WILL ALSO REFER TO THE SERVER'S IP ADDRESS IN ORDER TO ACCESS THE APPLICATION.

NOW, DELETE THESE FUNCTION WHEN INSTALLING THE APPLICATIONS AND REPLACE THE AUTO DETECTION OF THE SERVER 

// =====================================================
// EXTERNAL CONFIG - Server IPs loaded from userData
// This allows updating server IPs without rebuilding the app.
// Config file: %APPDATA%/procurement-plan-system/server-config.json
// =====================================================
const DEFAULT_SERVER_IPS = [
  '192.168.1.117',     // WiFi Network 
  '192.168.100.235'    // WiFi Network 

THESE FUNCTIONS CAN BE FOUND IN THE FOLLOWING FILES:
main.js
app.js




New-NetFirewallRule -DisplayName "DMW Server Discovery UDP" -Direction Inbound -Action Allow -Protocol UDP -LocalPort 5555