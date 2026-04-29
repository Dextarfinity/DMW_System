# Server Distribution Guide (Build Once, Distribute to All Clients)

## Overview

The server builds the application once using `npm run dist`, and the resulting installers are distributed to all client PCs via USB flash drive. All clients then connect to the server automatically without any manual configuration.

## Step 1: Server PC - Build the Application

On the **SERVER PC** where this project is located:

```bash
# Navigate to project root
cd "c:\Users\Kurt\Desktop\PROCUREMENT SYSTEM - Copy\DMW_System"

# Install dependencies (if not already done)
npm install

# Build the application
npm run dist
```

**Output:** Creates two files in `dist/` folder:
- `Procurement Plan System Setup X.X.X.exe` — **NSIS Installer** (recommended for distribution)
- `Procurement Plan System X.X.X.exe` — Portable executable (no installation needed)

**Size:** ~150-200 MB total (both files combined)

## Step 2: Prepare USB Flash Drive

### Requirements:
- USB flash drive with **at least 256 MB** available space
- USB 2.0 or higher (USB 3.0 recommended for faster copy)

### Copy Files to USB:

1. Insert USB flash drive into server PC
2. Create a folder on USB: `DMW_Procurement_System_vX.X.X` (e.g., `DMW_Procurement_System_v1.0.0`)
3. Copy these files from `dist/` to the USB folder:
   ```
   dist/
   ├── Procurement Plan System Setup 1.0.0.exe    ← Copy this to USB
   ├── Procurement Plan System 1.0.0.exe          ← Or copy this (portable version)
   └── resources/                                  ← Copy entire resources folder
   ```

### Optional: Create README on USB

Create a file `INSTALL_INSTRUCTIONS.txt` on USB with:
```
DMW PROCUREMENT SYSTEM - CLIENT INSTALLATION

1. Insert this USB drive into client PC
2. Double-click: "Procurement Plan System Setup X.X.X.exe"
3. Follow installation wizard
4. Click "Finish" to launch application
5. Application will auto-discover server - no IP configuration needed
6. Wait for "✓ Server is UP" message
7. Login with your credentials

NO MANUAL IP CONFIGURATION REQUIRED - Server auto-discovery is automatic!

Support: Contact your IT administrator if connection fails.
```

## Step 3: Distribute USB to All Client PCs

### Distribution Steps:

1. **Label USB drive** with version number and date (e.g., "DMW v1.0.0 - 2026-04-29")
2. **Copy USB** or use multiple USB drives if distributing to many clients
3. **Create distribution list** with client PC names/locations
4. **Deliver USB** to each client PC location

### Tracking:
Keep a record:
| Client PC Name | IP Address | Installation Date | Installer Version | Notes |
|---|---|---|---|---|
| CLIENT-001 | 192.168.1.50 | 2026-04-29 | 1.0.0 | ✓ Installed |
| CLIENT-002 | 192.168.1.51 | 2026-04-29 | 1.0.0 | ✓ Installed |

## Step 4: Client PC Installation

Each client PC performs these steps:

```bash
# 1. Insert USB drive
# 2. Open USB drive in File Explorer
# 3. Double-click: "Procurement Plan System Setup X.X.X.exe"

# 4. Follow Windows Installer wizard:
#    - Click "Next"
#    - Accept license agreement
#    - Choose installation folder (default is fine)
#    - Click "Install"
#    - Wait for installation to complete
#    - Click "Finish"

# 5. Application launches automatically
# 6. Watch console (Ctrl+Shift+I) for discovery messages:
#    [BROADCAST] ✓ Received broadcast from 192.168.x.x
#    [DISCOVERY] ✓✓✓ SERVER FOUND at 192.168.x.x:3000
#    [UI] ✓ Server is UP - Loading frontend

# 7. Login screen appears - use your credentials
```

**Installation takes:** ~2-3 minutes per PC

**Disk space required:** ~200-300 MB on client PC

## Step 5: Verify Client Connection

**On Server PC**, watch console output when clients connect:

```bash
# In server folder
npm run dev

# Watch for client connections:
# [SOCKET] Client connected: socket-id-123 from 192.168.1.50
# [SOCKET] Client: CLIENT-001 logged in as "officer1"
# [UI] All connected clients: 15 active users
```

**Count connected clients** to verify all installations successful.

## Step 6: Real-Time Updates (No Rebuild Needed!)

Once all clients are installed and connected, you can make updates **without rebuilding**:

### Update Frontend (HTML/JS/CSS):
```bash
# On SERVER PC, edit files:
# - renderer/scripts/app.js
# - renderer/styles/main.css
# - renderer/index.html

# Restart server:
npm run dev
# OR if using PM2:
pm2 restart dmw-server

# All connected clients see changes immediately!
```

### Update Backend (API):
```bash
# On SERVER PC, edit:
# - server/server.js
# - server/routes/*.js

# Restart server:
npm run dev

# All clients get new data via Socket.IO instantly!
```

## Rebuilding & Redistribution

### When to rebuild?
Only rebuild if you're **distributing to NEW clients** or **updating the Electron app itself** (main.js changes).

```bash
# On SERVER PC:
npm run dist

# This creates new installers in dist/
# Copy new files to USB
# Distribute to new clients

# NOTE: Existing clients DON'T need to reinstall!
# They get updates via Socket.IO real-time sync
```

### When NOT to rebuild?
- ✅ API changes → Just restart server, all clients get updates
- ✅ Frontend changes → Just restart server, all clients get updates  
- ✅ Database changes → Just run migration, all clients see new data
- ❌ Electron app changes → Need rebuild + redistribute
- ❌ New major version → Need rebuild + redistribute

## Troubleshooting Client Installations

| Problem | Solution |
|---------|----------|
| **"Installation failed"** | Ensure USB drive has enough space, restart Windows, try different USB drive |
| **"Cannot connect to server"** | Verify server PC is running `npm run dev`, check Windows firewall allows port 3000 and 5555 |
| **"Loading forever..."** | Check server console for errors, verify database is connected, try restarting server |
| **"Wrong credentials"** | Verify user exists in database, check password is correct |
| **"Installer won't run"** | Disable antivirus temporarily, run as Administrator, check Windows UAC settings |

## Firewall Configuration (Server PC)

Before distributing, ensure server PC firewall allows clients to connect:

```powershell
# Run as Administrator in PowerShell:

# Allow Express API port
New-NetFirewallRule -DisplayName "DMW API Server" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000

# Allow UDP server discovery
New-NetFirewallRule -DisplayName "DMW Server Discovery" -Direction Inbound -Action Allow -Protocol UDP -LocalPort 5555

# Verify rules:
Get-NetFirewallRule -DisplayName "DMW*"
```

## Summary: Build Once, Deploy Everywhere

| Phase | Who | What | Where |
|-------|-----|------|-------|
| **Build** | Server PC | `npm run dist` | Creates dist/ folder |
| **Package** | Server PC | Copy dist/ to USB | USB ready for distribution |
| **Distribute** | Admin | Give USB to clients | USB in hand to each PC |
| **Install** | Client PC | Run .exe installer | Client PC disk |
| **Connect** | Client PC | App launches | Auto-discovers server |
| **Sync** | Server PC | Make changes | All clients see updates via Socket.IO |
| **Update** | Multiple | Restart server | `npm run dev` or `pm2 restart dmw-server` |

## Next Steps

1. ✅ Build: `npm run dist` on server
2. → Copy dist/ to USB
3. → Distribute USB to client PCs
4. → Each client installs from USB
5. → All clients auto-discover server
6. → Verify all clients connected (watch server console)
7. → Make any updates (changes auto-sync to all clients)
8. → No rebuilds needed for frontend/backend changes!

---

**Key Benefit:** One build, unlimited deployments, real-time updates to all clients without restart!
