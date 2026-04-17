# PPMP Unit Display Fix - MWPTD PAPs

## Current Issue
- Edit PPMP modal unit dropdown → table shows only "25" 
- Expected: "25 pieces @ ₱150.00/ pieces" (dynamic from DB)

## Plan Status
- [x] Step 1: Create TODO.md ✅
- [ ] Step 2: Read app.js to locate formatQuantitySize()
- [ ] Step 3: Fix formatQuantitySize() - PAPs fallback logic
- [ ] Step 4: Test edit → save → table refresh (all divisions)
- [ ] Step 5: Backend verification - /api/ppmp returns item_unit/unit_price
- [ ] Step 6: Complete & demo

## Technical Details
**Backend:** `/api/ppmp` → `procurementplans JOIN items` → `item_unit`, `item_unit_price`
**Frontend:** `formatQuantitySize(p)` → needs PAPs handling: `p.quantity_size + p.item_unit + p.item_unit_price`
**DB:** `procurementplans.unit`, `unit_price`, `quantity_size` + `plan_items` fallback
