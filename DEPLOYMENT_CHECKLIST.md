# Deployment Checklist - Server Admin Quick Reference

**Last Updated:** 2026-04-29

## Pre-Deployment Checklist

Before building and distributing the application to clients, complete these checks:

### Code Quality
- [ ] All changes committed to git
- [ ] Latest code pulled from repository
- [ ] No uncommitted changes (`git status` is clean)
- [ ] Tests pass (if applicable)

### API Testing
- [ ] Server starts without errors: `npm run dev` in server folder
- [ ] Database connection works (`curl http://localhost:3000/api/health`)
- [ ] All API endpoints respond correctly
- [ ] No console errors or warnings

### Frontend Testing
- [ ] Application starts: `npm start` in main folder
- [ ] All pages load correctly
- [ ] Navigation works properly
- [ ] Socket.IO connection shows in console: `[UI] ✓ Server is UP`
- [ ] No JavaScript errors in console (Ctrl+Shift+I)

---

## Build & Distribution Steps

### Step 1: Clean Build (Server PC)

```bash
# Navigate to project root
cd "c:\Users\Kurt\Desktop\PROCUREMENT SYSTEM - Copy\DMW_System"

# Clean previous builds (optional, but recommended)
rm -r dist/
rm -r node_modules/
npm install

# Build application
npm run dist
```

**Expected Output:**
```
✓ Dist folder created: dist/
✓ dist/Procurement Plan System Setup 1.0.0.exe (200 MB)
✓ dist/Procurement Plan System 1.0.0.exe (200 MB)
✓ dist/resources/ (supporting files)
```

- [ ] Build completed without errors
- [ ] .exe files created in dist/
- [ ] File size is reasonable (~200 MB each)

### Step 2: Prepare USB Drive

**Hardware Check:**
- [ ] USB drive inserted and recognized
- [ ] USB drive has at least **256 MB** free space
- [ ] USB drive is formatted (Windows, NTFS or FAT32)

**Copy Files:**
```bash
# Create folder on USB
# Name: DMW_Procurement_System_v1.0.0

# Copy these files from dist/ to USB folder:
# 1. Procurement Plan System Setup 1.0.0.exe
# 2. Procurement Plan System 1.0.0.exe  
# 3. resources/ (entire folder)
```

- [ ] Setup .exe copied to USB
- [ ] Portable .exe copied to USB (optional)
- [ ] resources/ folder copied to USB
- [ ] USB drive label includes version number and date

**Optional: Create README**
- [ ] Create `INSTALL_INSTRUCTIONS.txt` on USB with installation steps

### Step 3: Verify Server Ready

Before distributing, ensure server is ready to receive client connections:

```bash
# In server folder
cd server
npm run dev
```

**Verify Output:**
```
✓ [DISCOVERY] Starting UDP broadcast on port 5555...
✓ Network: http://192.168.100.50:3000
✓ Database: Connected
✓ Express server listening on port 3000
```

- [ ] Server starts without errors
- [ ] UDP broadcast shows in console
- [ ] Server IP address detected correctly
- [ ] Database connection established
- [ ] No error messages

### Step 4: Create Distribution Record

**Keep Track of Installations:**

| # | Client PC Name | Location | IP Address | Installation Date | Installer Version | Status |
|---|---|---|---|---|---|---|
| 1 | CLIENT-001 | Floor 1 | 192.168.1.50 | | v1.0.0 | Pending |
| 2 | CLIENT-002 | Floor 2 | 192.168.1.51 | | v1.0.0 | Pending |
| 3 | CLIENT-003 | Floor 3 | 192.168.1.52 | | v1.0.0 | Pending |

- [ ] Created distribution list with client PC details
- [ ] Printed or saved distribution tracking sheet
- [ ] Backed up distribution list (email to self or cloud storage)

### Step 5: Distribute USB to Clients

- [ ] Copied USB drive or created multiple USB drives
- [ ] Each USB drive labeled with version number and date
- [ ] USB drives given to designated installers for client PCs
- [ ] Provided installation instructions to installers

**Optional: Installation Checklist for Installers**
```
For each client PC:
[ ] Insert USB drive
[ ] Double-click Setup .exe
[ ] Follow installation wizard
[ ] Click Finish to launch app
[ ] Wait for "✓ Server is UP" message
[ ] Verify connection successful
[ ] Record installation in tracking list
[ ] Eject USB drive
```

---

## Post-Deployment Verification

### Monitor Client Connections

```bash
# On SERVER PC, watch console while clients install
# You should see messages like:

[SOCKET] Client connected: socket-abc123 from 192.168.1.50
[SOCKET] Client: CLIENT-001 connected
[SOCKET] All active connections: 1
[SOCKET] Client: CLIENT-001 logged in as "officer1"
[SOCKET] All active connections: 2 (after second client)
...
```

- [ ] All expected clients appear in console
- [ ] Each client shows successful login
- [ ] No connection errors
- [ ] All clients appear within expected timeframe

### Test Client Functionality

For each client, verify:
- [ ] Application started without errors
- [ ] Server discovery successful (blue "Connected" indicator)
- [ ] Login accepted
- [ ] Dashboard data displays
- [ ] Navigation between pages works
- [ ] Real-time data updates appear

### Create Connection Report

```
DEPLOYMENT REPORT - v1.0.0
Date: 2026-04-29
Time: 14:00

Installations Completed:
- Total PCs: 15
- Successful: 15
- Failed: 0

Connected Clients:
- CLIENT-001: ✓ Connected (192.168.1.50)
- CLIENT-002: ✓ Connected (192.168.1.51)
- CLIENT-003: ✓ Connected (192.168.1.52)
... (list all)

Issues Found:
- None

Next Steps:
- Server running stable
- All clients receiving real-time updates
- Ready for production use
```

- [ ] Documented deployment date/time
- [ ] Counted successful installations
- [ ] Verified all clients connected
- [ ] Noted any issues or concerns
- [ ] Created backup of report

---

## Common Issues & Quick Fixes

### Build Issues

| Issue | Solution |
|-------|----------|
| `npm run dist` fails | Run `npm install` first, then `npm run dist` |
| No .exe files created | Check disk space, ensure no antivirus blocking, try `npm run dist` again |
| "Cannot find dist folder" | Build completed, check in project root directory |

### USB Distribution Issues

| Issue | Solution |
|-------|----------|
| USB not recognized | Try different USB port, restart PC, try different USB drive |
| Files won't copy | Ensure USB is not write-protected, format USB drive |
| USB too small | Files need ~200 MB, use USB 256 MB or larger |

### Client Installation Issues

| Issue | Solution |
|-------|----------|
| "Installation failed" error | Run installer as Administrator, disable antivirus temporarily |
| Setup .exe won't run | Try portable .exe instead, copy files to local drive first |
| App won't connect to server | Verify server is running, check firewall allows port 3000 and 5555 |

### Troubleshooting Commands

```bash
# On SERVER PC:
# Check if server is running
npm run dev

# Check database connection
curl http://localhost:3000/api/health

# Watch for client connections
# (monitor console output while clients install)

# Restart server if needed
npm run dev
# OR if using PM2:
pm2 restart dmw-server
pm2 logs dmw-server
```

---

## Making Updates After Deployment

### Scenario 1: Fix API Bug (No Rebuild Needed)

```bash
# 1. Edit server/server.js
# 2. Save file
# 3. Server auto-reloads (if using nodemon)
# OR manually restart:
npm run dev

# All connected clients see the fix immediately!
```

- [ ] Fixed code issue
- [ ] Restarted server
- [ ] Verified clients got update (watch Socket.IO messages)

### Scenario 2: Update Frontend UI (No Rebuild Needed)

```bash
# 1. Edit renderer/scripts/app.js or renderer/styles/main.css
# 2. Save file  
# 3. Restart server (server serves updated files dynamically)
npm run dev

# All connected clients see UI changes immediately!
```

- [ ] Updated frontend files
- [ ] Restarted server
- [ ] Verified clients updated (refresh not needed)

### Scenario 3: Major Changes (Rebuild & Redistribute)

```bash
# Only if Electron app changed (main.js):
# 1. Make changes
# 2. Rebuild: npm run dist
# 3. Copy new .exe to USB
# 4. Distribute USB to clients
# 5. Clients reinstall from new USB

# NOTE: Existing clients still work during rebuild!
# They stay connected and get updates via Socket.IO
# Only NEW installations use the new build
```

- [ ] Made code changes
- [ ] Built new version: `npm run dist`
- [ ] Copied to USB
- [ ] Created distribution list
- [ ] Distributed to new clients

---

## Maintenance & Monitoring

### Daily Checklist

- [ ] Server runs without errors (`npm run dev`)
- [ ] Database is accessible
- [ ] Firewall allows ports 3000 and 5555
- [ ] All client PCs successfully connect
- [ ] Socket.IO real-time updates working

### Weekly Checklist

- [ ] All API endpoints working correctly
- [ ] Database backups completed
- [ ] No console errors or warnings
- [ ] Performance acceptable (no lag)
- [ ] User reports addressed

### Monthly Checklist

- [ ] Code reviewed and tested
- [ ] Database maintenance performed
- [ ] Security updates applied
- [ ] Backups verified and restored
- [ ] Plan for next release

---

## Version Numbering

Use semantic versioning: `MAJOR.MINOR.PATCH`

- **1.0.0** → First release
- **1.1.0** → New features (increment MINOR)
- **1.0.1** → Bug fix (increment PATCH)
- **2.0.0** → Major changes (increment MAJOR)

Update version in:
- [ ] `package.json` (version field)
- [ ] USB drive label
- [ ] `SERVER_DISTRIBUTION_GUIDE.md`
- [ ] Distribution tracking sheet

---

## Emergency Rollback

If new version has critical issues:

```bash
# 1. Stop current server
npm stop
# OR: pm2 stop dmw-server

# 2. Revert code to last known good version
git log --oneline
git revert <commit-hash>
# OR: git checkout <commit-hash>

# 3. Rebuild (if Electron changes)
npm run dist

# 4. Restart server
npm run dev
# OR: pm2 start dmw-server

# 5. Verify clients reconnect and work
# 6. Plan fix and test before re-deploying
```

- [ ] Identified issue
- [ ] Reverted to last stable version
- [ ] Server restarted
- [ ] Clients reconnected
- [ ] Verified system stable

---

## Quick Reference Commands

```bash
# BUILD
cd "c:\Users\Kurt\Desktop\PROCUREMENT SYSTEM - Copy\DMW_System"
npm run dist

# START SERVER
cd server
npm run dev

# TEST
curl http://localhost:3000/api/health

# VIEW LOGS
npm run dev
# OR: pm2 logs dmw-server

# RESTART SERVER
npm run dev
# OR: pm2 restart dmw-server
```

---

**✓ Once all checkboxes are complete, you're ready to deploy!**
