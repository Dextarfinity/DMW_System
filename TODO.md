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
