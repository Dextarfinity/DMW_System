# PPMP Unit Display Fix - MWPTD Issue

## Current Status
- [x] Analyzed frontend: `formatQuantitySize()` correct
- [x] Confirmed issue: MWPTD shows only quantity, missing unit/price
- [x] Plan approved by user

## Implementation Steps
- [ ] 1. Read DB schema (`server/database/schema.sql`) → verify `procurementplans.unit`, `unit_price`
- [ ] 2. Read `server/server.js` → find `/api/ppmp` endpoint, check JOIN logic
- [ ] 3. Fix backend query → ensure `unit`/`unit_price` returned for all divisions
- [ ] 4. Test edit modal → save → verify table display "25 pieces @ ₱150.00/ pieces"
- [ ] 5. Verify ALL divisions (FAD, WRSD, MWPSD, MWPTD)
- [ ] 6. Update TODO.md → mark complete → attempt_completion

## Next Action
Examine `server/database/schema.sql`
