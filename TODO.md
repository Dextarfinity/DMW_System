# PPMP Unit Display Fix - MWPTD Issue

## Current Status
- [x] Analyzed frontend: `formatQuantitySize()` correct
- [x] Confirmed issue: MWPTD shows only quantity, missing unit/price
- [x] Plan approved by user

## Implementation Steps
- [x] 1. Read DB schema (`server/database/schema.sql`) → `procurementplans` MISSING unit/unit_price (in `plan_items`)
- [ ] 2. Read `server/server.js` → `/api/ppmp` JOIN logic
- [ ] 3. Fix frontend `formatQuantitySize()` → use `p.item_unit` fallback
- [ ] 4. Test edit modal → verify table display "25 pieces @ ₱150.00/ pieces"
- [ ] 5. Verify ALL divisions work
- [ ] 6. Update TODO.md → complete

## Next Action
Read `server/server.js` → confirm `/api/ppmp` endpoint

## Next Action
Examine `server/database/schema.sql`
