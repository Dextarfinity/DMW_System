# DMW Caraga Procurement System
## Complete New Server Setup Guide
### Updated: February 25, 2026

---

## Table of Contents
1. [System Requirements](#1-system-requirements)
2. [Software Installation](#2-software-installation)
3. [pgAdmin 4 Setup](#3-pgadmin-4-setup)
4. [Database Setup](#4-database-setup)
5. [Application Setup](#5-application-setup)
6. [Network Configuration](#6-network-configuration)
7. [Starting the System](#7-starting-the-system)
8. [Troubleshooting](#8-troubleshooting)
9. [User Accounts](#9-user-accounts)
10. [Maintenance & Backup](#10-maintenance--backup)

---

## 1. System Requirements

### Minimum Hardware Requirements
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Processor | Intel Core i5 (4 cores) | Intel Core i7 (8 cores) |
| RAM | 8 GB | 16 GB |
| Storage | 50 GB SSD | 100 GB SSD |
| Network | 100 Mbps Ethernet | Gigabit Ethernet |

### Supported Operating Systems
- Windows 10 Pro/Enterprise (64-bit) - Build 1903 or later
- Windows 11 Pro/Enterprise (64-bit)
- Windows Server 2019 Standard/Datacenter
- Windows Server 2022 Standard/Datacenter

### Required Software Versions
| Software | Version | Download Link |
|----------|---------|---------------|
| PostgreSQL | 18.x | https://www.postgresql.org/download/windows/ |
| Node.js | 18.x LTS or 20.x LTS | https://nodejs.org/ |
| npm | 9.x+ (included with Node.js) | - |
| pgAdmin 4 | 8.x (included with PostgreSQL) | - |

---

## 2. Software Installation

### Step 2.1: Download Required Software

Before starting, download all installers:

1. **PostgreSQL 18:** https://www.postgresql.org/download/windows/
   - Click "Download the installer"
   - Select Windows x86-64
   - Download the latest PostgreSQL 18.x version

2. **Node.js LTS:** https://nodejs.org/
   - Click the "LTS" button (Long Term Support)
   - This downloads the Windows installer automatically

---

### Step 2.2: Install PostgreSQL 18 (Database Server)

**This is the most critical installation. Follow each step carefully.**

1. **Run the installer** (postgresql-18.x-x-windows-x64.exe)
   - Right-click → "Run as administrator"

2. **Welcome Screen**
   - Click **Next**

3. **Installation Directory**
   - Keep default: `C:\Program Files\PostgreSQL\18`
   - Click **Next**

4. **Select Components** ⚠️ IMPORTANT
   - ✅ PostgreSQL Server (REQUIRED)
   - ✅ pgAdmin 4 (REQUIRED - for database management)
   - ✅ Stack Builder (Optional)
   - ✅ Command Line Tools (REQUIRED)
   - Click **Next**

5. **Data Directory**
   - Keep default: `C:\Program Files\PostgreSQL\18\data`
   - Click **Next**

6. **Password** ⚠️ CRITICAL - DO NOT FORGET THIS
   ```
   Password: kurt09908
   Retype password: kurt09908
   ```
   - This is the PostgreSQL superuser (postgres) password
   - Click **Next**

7. **Port Number** ⚠️ CRITICAL
   ```
   Port: 5433
   ```
   - **NOT the default 5432** - We use 5433 to avoid conflicts
   - Click **Next**

8. **Advanced Options**
   - Locale: [Default locale]
   - Click **Next**

9. **Pre Installation Summary**
   - Review settings:
     - Installation Directory: C:\Program Files\PostgreSQL\18
     - Data Directory: C:\Program Files\PostgreSQL\18\data
     - Port: **5433**
   - Click **Next**

10. **Ready to Install**
    - Click **Next** to begin installation
    - Wait for installation to complete (2-5 minutes)

11. **Completing the PostgreSQL Setup Wizard**
    - ❌ Uncheck "Launch Stack Builder at exit" (not needed)
    - Click **Finish**

---

### Step 2.3: Verify PostgreSQL Installation

Open **PowerShell** and run:

```powershell
# Check PostgreSQL version
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" --version
```

**Expected output:**
```
psql (PostgreSQL) 18.x
```

Check if PostgreSQL service is running:
```powershell
# Check PostgreSQL service status
Get-Service -Name "postgresql*"
```

**Expected output:**
```
Status   Name               DisplayName
------   ----               -----------
Running  postgresql-x64-18  postgresql-x64-18
```

---

### Step 2.4: Install Node.js

1. **Run the installer** (node-v20.x.x-x64.msi or similar)

2. **Welcome Screen**
   - Click **Next**

3. **License Agreement**
   - Accept the terms
   - Click **Next**

4. **Destination Folder**
   - Keep default: `C:\Program Files\nodejs\`
   - Click **Next**

5. **Custom Setup**
   - Keep all defaults selected:
     - ✅ Node.js runtime
     - ✅ npm package manager
     - ✅ Online documentation shortcuts
     - ✅ Add to PATH
   - Click **Next**

6. **Tools for Native Modules** (Optional)
   - ❌ Uncheck "Automatically install the necessary tools..."
   - Click **Next**

7. **Ready to Install**
   - Click **Install**
   - Wait for completion

8. **Completing**
   - Click **Finish**

---

### Step 2.5: Verify Node.js Installation

Open **NEW PowerShell window** (important - to refresh PATH):

```powershell
# Check Node.js version
node --version
```
**Expected:** `v20.x.x` or `v18.x.x`

```powershell
# Check npm version
npm --version
```
**Expected:** `9.x.x` or `10.x.x`

---

## 3. pgAdmin 4 Setup

pgAdmin 4 is a graphical tool for managing PostgreSQL databases. It was installed with PostgreSQL.

### Step 3.1: Launch pgAdmin 4

1. Press `Windows Key` and type "pgAdmin"
2. Click **pgAdmin 4**
3. First launch may take 30-60 seconds to load

### Step 3.2: Set Master Password

On first launch, pgAdmin asks for a **Master Password**:
- This protects your saved server passwords
- Set it to something memorable: `dmw2026` (or your preference)
- Click **OK**

### Step 3.3: Create Server Connection (dmw_database)

1. In the left panel, right-click **Servers**
2. Select **Register** → **Server...**

3. **General Tab:**
   ```
   Name: dmw_database
   ```
   - This is just a display name in pgAdmin

4. **Connection Tab:** ⚠️ IMPORTANT
   ```
   Host name/address: localhost
   Port: 5433
   Maintenance database: postgres
   Username: postgres
   Password: kurt09908
   ✅ Save password: Yes (check this box)
   ```

5. Click **Save**

### Step 3.4: Verify Connection

1. In the left panel, expand **Servers**
2. Expand **dmw_database**
3. You should see:
   ```
   📁 Databases
      📁 postgres
   📁 Login/Group Roles
   📁 Tablespaces
   ```

If you see an error:
- Double-check the port is **5433** (not 5432)
- Verify password is `kurt09908`
- Make sure PostgreSQL service is running

### Step 3.5: Create the Database (dmw_db)

**Option A: Using pgAdmin 4 (Graphical)**

1. In pgAdmin, expand **Servers** → **dmw_database**
2. Right-click **Databases**
3. Select **Create** → **Database...**
4. **General Tab:**
   ```
   Database: dmw_db
   Owner: postgres
   ```
5. Click **Save**
6. You should now see `dmw_db` under Databases

**Option B: Using SQL Query**

1. In pgAdmin, click on **dmw_database** server
2. Click **Tools** → **Query Tool**
3. Enter this SQL:
   ```sql
   CREATE DATABASE dmw_db;
   ```
4. Click the **Execute** button (▶️) or press F5
5. You should see "Query returned successfully"

---

## 4. Database Setup

### Step 4.1: Copy Application Files

Copy the entire `DMW_System` folder to the new server.

**Recommended location:**
```
C:\Users\[YourUsername]\Desktop\PROCUREMENT SYSTEM\DMW_System\
```

**Folder structure should look like:**
```
DMW_System/
├── main.js
├── package.json
├── config.json
├── README.md
├── NEW_SERVER_SETUP_GUIDE.md
├── renderer/
│   ├── index.html
│   ├── scripts/
│   │   └── app.js
│   └── styles/
│       └── main.css
├── server/
│   ├── server.js
│   ├── package.json
│   └── database/
│       ├── SETUP_NEW_SERVER.bat
│       ├── consolidated_schema.sql
│       ├── consolidated_seed.sql
│       ├── seed_employees.sql
│       ├── seed_app_2026.sql
│       ├── seed_ppmp_2026.sql
│       ├── seed_users.sql
│       └── migration_status_update.sql
└── DMW/
    └── (documentation files)
```

---

### Step 4.2: Run the Automated Setup Script

**This is the EASIEST method - recommended for most users.**

1. Open **File Explorer**
2. Navigate to:
   ```
   DMW_System\server\database\
   ```
3. **Right-click** on `SETUP_NEW_SERVER.bat`
4. Select **Run as administrator**
5. Press any key when prompted

**What the script does:**
- Step 1: Creates `dmw_db` database (if not exists)
- Step 2: Creates 44 database tables
- Step 3: Adds dual-role support column
- Step 4: Seeds core data (departments, items, suppliers, etc.)
- Step 5: Seeds 30 employees
- Step 6: Seeds APP 2026 data (PRs, RFQs, Abstracts, etc.)
- Step 7: Seeds 104 PPMP items (4 divisions)
- Step 8: Runs status migration
- Step 9: Creates 10 user accounts
- Step 10: Verifies installation

6. Wait for completion (usually 1-2 minutes)
7. You should see: **"DATABASE SETUP COMPLETE!"**

**If you see errors, check the Troubleshooting section.**

---

### Step 4.3: Manual Database Setup (Alternative Method)

Use this if the batch file fails or you prefer manual control.

**Open PowerShell as Administrator:**

```powershell
# Step 1: Set password environment variable
$env:PGPASSWORD = "kurt09908"

# Step 2: Create the database (skip if already created in pgAdmin)
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -c "CREATE DATABASE dmw_db;"
```

```powershell
# Step 3: Navigate to database folder
cd "C:\Users\YourUsername\Desktop\PROCUREMENT SYSTEM\DMW_System\server\database"

# Step 4: Run schema (creates all 44 tables)
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -f consolidated_schema.sql

# Step 5: Add dual-role column
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS secondary_role VARCHAR(30);"

# Step 6: Run seed files (in this exact order)
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -f consolidated_seed.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -f seed_employees.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -f seed_app_2026.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -f seed_ppmp_2026.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -f migration_status_update.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -f seed_users.sql
```

---

### Step 4.4: Verify Database Setup in pgAdmin

1. Open **pgAdmin 4**
2. Refresh: Right-click **dmw_database** → **Refresh**
3. Expand: **Databases** → **dmw_db** → **Schemas** → **public** → **Tables**
4. You should see 44 tables including:
   - `users`
   - `employees`
   - `departments`
   - `items`
   - `suppliers`
   - `purchaseorders`
   - `purchaserequests`
   - `procurementplans`
   - ...and more

**To verify data count:**
1. Right-click on **dmw_db**
2. Select **Query Tool**
3. Run this query:
```sql
SELECT 'Users' AS entity, COUNT(*) AS count FROM users
UNION ALL SELECT 'Employees', COUNT(*) FROM employees
UNION ALL SELECT 'Items', COUNT(*) FROM items
UNION ALL SELECT 'PPMP Items', COUNT(*) FROM procurementplans WHERE ppmp_no IS NOT NULL
UNION ALL SELECT 'Purchase Requests', COUNT(*) FROM purchaserequests
UNION ALL SELECT 'Purchase Orders', COUNT(*) FROM purchaseorders
ORDER BY entity;
```

**Expected results:**
| entity | count |
|--------|-------|
| Employees | 30 |
| Items | 102 |
| PPMP Items | 104 |
| Purchase Orders | 20 |
| Purchase Requests | 35 |
| Users | 10 |

---

## 5. Application Setup

### Step 5.1: Install Server Dependencies

The backend server requires Node.js packages to run.

1. **Open PowerShell**
2. **Navigate to server folder:**
   ```powershell
   cd "C:\Users\YourUsername\Desktop\PROCUREMENT SYSTEM\DMW_System\server"
   ```

3. **Install dependencies:**
   ```powershell
   npm install
   ```

4. **Wait for installation** (may take 1-3 minutes depending on internet speed)

**Expected output:**
```
added 150 packages in 45s
```

**Packages installed include:**
| Package | Purpose |
|---------|---------|
| express | Web server framework |
| pg | PostgreSQL database driver |
| cors | Cross-origin resource sharing |
| body-parser | Request body parsing |
| bcrypt/bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| multer | File upload handling |
| pdf-lib | PDF generation |
| dotenv | Environment configuration |

---

### Step 5.2: Install Electron App Dependencies

The desktop application also requires Node.js packages.

1. **Navigate to main app folder:**
   ```powershell
   cd "C:\Users\YourUsername\Desktop\PROCUREMENT SYSTEM\DMW_System"
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Wait for installation** (may take 2-5 minutes)

**Expected output:**
```
added 200+ packages in 60s
```

---

### Step 5.3: Verify Server Configuration

Check that the server is configured correctly.

**Open `server/server.js` and verify these settings around line 10-20:**
```javascript
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'dmw_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'kurt09908'
});
```

---

### Step 5.4: Create Environment File (Optional but Recommended)

For easier configuration changes, create a `.env` file.

1. **Navigate to server folder:**
   ```
   DMW_System\server\
   ```

2. **Create new file named `.env`** (note the dot at the start)

3. **Add this content:**
   ```env
   # ============================================
   # DMW Procurement System - Environment Config
   # ============================================

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5433
   DB_NAME=dmw_db
   DB_USER=postgres
   DB_PASSWORD=kurt09908

   # Server Configuration
   PORT=3000
   NODE_ENV=production

   # JWT Configuration (for authentication)
   JWT_SECRET=dmw_procurement_secret_key_2026_CHANGE_THIS_IN_PRODUCTION
   JWT_EXPIRES_IN=8h

   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   ```

4. **Save the file**

**Note:** The `.env` file contains sensitive information. Do not share it publicly.

---

## 6. Network Configuration

### For Standalone Use (Single PC)

If the system will only be used on ONE computer:
- No network configuration needed
- Skip to Section 7: Starting the System

### For LAN/Network Access (Multiple PCs)

If other computers need to connect to this server:

---

### Step 6.1: Find Your Server's IP Address

1. **Open PowerShell**
2. **Run:**
   ```powershell
   ipconfig
   ```
3. **Find your IPv4 Address** under "Ethernet adapter" or "Wi-Fi adapter"
   ```
   IPv4 Address. . . . . . . : 192.168.1.100
   ```
4. **Note this IP address** - you'll need it for client configuration

---

### Step 6.2: Configure Windows Firewall

**Method A: Using PowerShell (Recommended)**

Open **PowerShell as Administrator** and run:

```powershell
# Allow PostgreSQL connections (port 5433)
New-NetFirewallRule -DisplayName "DMW PostgreSQL" -Direction Inbound -Protocol TCP -LocalPort 5433 -Action Allow

# Allow Node.js API server (port 3000)
New-NetFirewallRule -DisplayName "DMW API Server" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow

# Verify rules were created
Get-NetFirewallRule -DisplayName "DMW*" | Format-Table Name, DisplayName, Enabled
```

**Method B: Using Windows Defender Firewall GUI**

1. Press `Windows + R`, type `wf.msc`, press Enter
2. Click **Inbound Rules** in the left panel
3. Click **New Rule...** in the right panel

**For PostgreSQL:**
- Rule Type: Port → Next
- Protocol: TCP
- Specific local ports: `5433` → Next
- Action: Allow the connection → Next
- Profile: ✅ Domain, ✅ Private, ❌ Public → Next
- Name: `DMW PostgreSQL` → Finish

**Repeat for Node.js:**
- Port: `3000`
- Name: `DMW API Server`

---

### Step 6.3: Configure PostgreSQL for Remote Connections

By default, PostgreSQL only accepts local connections. To allow remote access:

**Step A: Edit pg_hba.conf**

1. **Open File Explorer**
2. **Navigate to:**
   ```
   C:\Program Files\PostgreSQL\18\data\
   ```
3. **Right-click `pg_hba.conf`** → Open with → Notepad (Run as Administrator)
4. **Find this section** (near the bottom):
   ```
   # IPv4 local connections:
   host    all    all    127.0.0.1/32    scram-sha-256
   ```
5. **Add this line below it:**
   ```
   # Allow DMW clients on local network
   host    dmw_db    postgres    192.168.1.0/24    scram-sha-256
   ```
   
   **Note:** Adjust `192.168.1.0/24` to match your network:
   - `192.168.1.0/24` allows 192.168.1.1 - 192.168.1.254
   - `192.168.0.0/24` allows 192.168.0.1 - 192.168.0.254
   - `10.0.0.0/24` allows 10.0.0.1 - 10.0.0.254

6. **Save the file**

**Step B: Edit postgresql.conf**

1. **Open `postgresql.conf`** in the same folder (as Administrator)
2. **Find this line** (around line 60):
   ```
   #listen_addresses = 'localhost'
   ```
3. **Change it to:**
   ```
   listen_addresses = '*'
   ```
   (Remove the # and change 'localhost' to '*')

4. **Save the file**

**Step C: Restart PostgreSQL Service**

```powershell
# Run PowerShell as Administrator
Restart-Service -Name "postgresql-x64-18"

# Verify it's running
Get-Service -Name "postgresql-x64-18"
```

---

### Step 6.4: Configure Client PCs

On each client PC that will connect to the server:

1. **Copy the `DMW_System` folder** to the client PC
2. **Edit `renderer/scripts/app.js`**
3. **Find this line** (around line 20):
   ```javascript
   const API_URL = 'http://localhost:3000/api';
   ```
4. **Change it to use the server's IP:**
   ```javascript
   const API_URL = 'http://192.168.1.100:3000/api';
   ```
   (Replace `192.168.1.100` with your server's actual IP)

5. **Install dependencies:**
   ```powershell
   cd "path\to\DMW_System"
   npm install
   ```

6. **Client PCs do NOT need:**
   - PostgreSQL installed
   - The server folder (`server/`)
   - The database folder (`server/database/`)

---

## 7. Starting the System

### Step 7.1: Start the API Server

**The server MUST be started FIRST before the app.**

1. **Open PowerShell**
2. **Navigate to server folder:**
   ```powershell
   cd "C:\Users\YourUsername\Desktop\PROCUREMENT SYSTEM\DMW_System\server"
   ```
3. **Start the server:**
   ```powershell
   node server.js
   ```

**Expected output:**
```
==============================================
  DMW CARAGA Procurement System - API Server
==============================================
Connected to PostgreSQL database
Database connection verified successfully
Server running on:
  - Local:   http://localhost:3000
  - Network: http://192.168.1.100:3000
==============================================
Press Ctrl+C to stop the server
```

**Keep this window open!** The server must keep running.

---

### Step 7.2: Start the Electron Application

**Open a NEW PowerShell window** (don't close the server window):

1. **Navigate to main folder:**
   ```powershell
   cd "C:\Users\YourUsername\Desktop\PROCUREMENT SYSTEM\DMW_System"
   ```
2. **Start the app:**
   ```powershell
   npm start
   ```

3. **The DMW Procurement System window will open**

---

### Step 7.3: Login Test

1. **At the login screen, enter:**
   ```
   Username: admin
   Password: admin123
   ```
2. **Click Login**
3. **You should see the Dashboard**

If login fails:
- Check if server window shows any errors
- Verify database is running
- See Troubleshooting section

---

### Step 7.4: Create Desktop Shortcuts (Recommended)

**Create "Start DMW Server.bat":**

1. Right-click Desktop → New → Text Document
2. Name it: `Start DMW Server.bat`
3. Edit and paste:
   ```batch
   @echo off
   title DMW Procurement System - API Server
   echo Starting DMW API Server...
   echo.
   cd /d "C:\Users\YourUsername\Desktop\PROCUREMENT SYSTEM\DMW_System\server"
   node server.js
   pause
   ```
4. Save and close
5. Double-click to test

**Create "Start DMW App.bat":**

```batch
@echo off
title DMW Procurement System
echo Starting DMW Application...
echo.
echo Make sure the API Server is running first!
echo.
timeout /t 3
cd /d "C:\Users\YourUsername\Desktop\PROCUREMENT SYSTEM\DMW_System"
npm start
```

---

### Step 7.5: Auto-Start on Windows Boot (Optional)

To start the server automatically when Windows starts:

1. Press `Windows + R`
2. Type: `shell:startup`
3. Press Enter (opens Startup folder)
4. Copy your "Start DMW Server.bat" shortcut here

---

## 8. Troubleshooting

### Issue: "Could not connect to PostgreSQL"

**Symptoms:**
- Server says "Connection refused" or "ECONNREFUSED"
- Cannot connect to database

**Solutions:**

1. **Check PostgreSQL service is running:**
   ```powershell
   Get-Service -Name "postgresql*"
   ```
   If not running:
   ```powershell
   Start-Service -Name "postgresql-x64-18"
   ```

2. **Verify port 5433:**
   ```powershell
   netstat -an | findstr "5433"
   ```
   Should show: `TCP 0.0.0.0:5433 ... LISTENING`

3. **Check password:**
   ```powershell
   $env:PGPASSWORD = "kurt09908"
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -c "SELECT 1"
   ```
   Should return: `?column? | 1`

---

### Issue: "psql is not recognized"

**Symptoms:**
- PowerShell says "'psql' is not recognized"

**Solutions:**

1. **Use full path:**
   ```powershell
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" --version
   ```

2. **Or add to PATH permanently:**
   - Search "Environment Variables" in Windows
   - Click "Environment Variables..."
   - Under "System variables", find "Path"
   - Click "Edit" → "New"
   - Add: `C:\Program Files\PostgreSQL\18\bin`
   - Click OK → OK → OK
   - Restart PowerShell

---

### Issue: "Port 3000 already in use"

**Symptoms:**
- Server says "EADDRINUSE: address already in use"

**Solutions:**

1. **Find what's using port 3000:**
   ```powershell
   netstat -ano | findstr ":3000"
   ```
   Note the PID number (last column)

2. **Kill the process:**
   ```powershell
   taskkill /PID 12345 /F
   ```
   (Replace 12345 with actual PID)

3. **Or use a different port:**
   - Edit `server/server.js`
   - Change `PORT = 3000` to `PORT = 3001`
   - Update `renderer/scripts/app.js` API_URL accordingly

---

### Issue: "Database dmw_db does not exist"

**Symptoms:**
- Error: `database "dmw_db" does not exist`

**Solutions:**

1. **Create the database:**
   ```powershell
   $env:PGPASSWORD = "kurt09908"
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -c "CREATE DATABASE dmw_db;"
   ```

2. **Then run the setup script again**

---

### Issue: "Permission denied" when running .bat file

**Solution:**
- Right-click the .bat file
- Select "Run as administrator"

---

### Issue: "Login failed" in the app

**Symptoms:**
- Correct username/password but login fails

**Solutions:**

1. **Check server is running** (look at server terminal for errors)

2. **Verify users exist:**
   ```powershell
   $env:PGPASSWORD = "kurt09908"
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -c "SELECT username, role FROM users;"
   ```

3. **Reset admin password:**
   ```powershell
   $env:PGPASSWORD = "kurt09908"
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -c "UPDATE users SET password = '\$2b\$10\$rqH8DmvPB.oGQxP.SaZY1uKpPh6DZhF5PRmF3A4lPMPX.D8K8AYxO' WHERE username = 'admin';"
   ```
   (This sets password to 'admin123')

---

### Issue: "npm: command not found"

**Solution:**
- Reinstall Node.js
- Make sure Node.js is added to PATH during installation
- Restart PowerShell after installation

---

### Issue: "Seed file error - duplicate key"

**Symptoms:**
- Error when running seed files
- "duplicate key value violates unique constraint"

**Solutions:**

1. **Drop and recreate database:**
   ```powershell
   $env:PGPASSWORD = "kurt09908"
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -c "DROP DATABASE IF EXISTS dmw_db;"
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -c "CREATE DATABASE dmw_db;"
   ```

2. **Run setup script again**

---

## 9. User Accounts

### Default Login Credentials

| # | Username | Password | Role | Division | Description |
|---|----------|----------|------|----------|-------------|
| 1 | admin | admin123 | Administrator | All | Full system access |
| 2 | regienald | dmw2026 | Division Head | FAD | Finance & Admin Division |
| 3 | cherryl | dmw2026 | Division Head | MWPTD | Migrant Workers Processing |
| 4 | marissa | dmw2026 | Division Head | MWPSD | Migrant Workers Programs |
| 5 | eval | dmw2026 | Division Head + BAC Chair | WRSD | Welfare & Reintegration |
| 6 | ritchel.butao | dmw2026 | HOPE | ORD | Head of Procuring Entity |
| 7 | mark | dmw2026 | Supply Officer | FAD | Inventory management |
| 8 | gary | dmw2026 | Supply Officer | FAD | Inventory management |
| 9 | giovanni | dmw2026 | BAC Secretariat | FAD | BAC documentation |
| 10 | jomar | dmw2026 | Officer | FAD | General access |

---

### Roles & Permissions Matrix

| Permission | Admin | HOPE | BAC Chair | Div Head | Supply | BAC Sec | Officer |
|------------|:-----:|:----:|:---------:|:--------:|:------:|:-------:|:-------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View All Divisions | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create PR | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Approve PR | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Manage RFQ/Abstract | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| BAC Resolution | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Notice of Award | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Purchase Orders | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Inventory | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| PPMP Management | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

### Division Codes

| Code | Full Name |
|------|-----------|
| ORD | Office of the Regional Director |
| FAD | Finance and Administrative Division |
| MWPTD | Migrant Workers Processing and Documentation Division |
| MWPSD | Migrant Workers Programs and Services Division |
| WRSD | Welfare and Reintegration Services Division |

---

## 10. Maintenance & Backup

### Database Backup

**Create a backup:**
```powershell
$env:PGPASSWORD = "kurt09908"
$backupDate = Get-Date -Format "yyyy-MM-dd"
& "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -U postgres -p 5433 -d dmw_db -F c -f "C:\Backups\dmw_db_$backupDate.backup"
```

**Restore from backup:**
```powershell
$env:PGPASSWORD = "kurt09908"
& "C:\Program Files\PostgreSQL\18\bin\pg_restore.exe" -U postgres -p 5433 -d dmw_db -c "C:\Backups\dmw_db_2026-02-25.backup"
```

---

### Recommended Backup Schedule

| Backup Type | Frequency | Retention |
|-------------|-----------|-----------|
| Full Database | Daily | 30 days |
| Transaction Log | Every 4 hours | 7 days |
| Off-site Copy | Weekly | 1 year |

---

### Database Maintenance

**Vacuum and analyze (run weekly):**
```powershell
$env:PGPASSWORD = "kurt09908"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -c "VACUUM ANALYZE;"
```

**Check database size:**
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -c "SELECT pg_size_pretty(pg_database_size('dmw_db'));"
```

---

### Log Files

**Server logs location:**
```
DMW_System\server\logs\
```

**PostgreSQL logs:**
```
C:\Program Files\PostgreSQL\18\data\log\
```

---

## Quick Reference Card

### Database Connection
| Setting | Value |
|---------|-------|
| Host | localhost (or server IP) |
| Port | 5433 |
| Database | dmw_db |
| User | postgres |
| Password | kurt09908 |

### API Server
| Setting | Value |
|---------|-------|
| URL | http://localhost:3000/api |
| Port | 3000 |
| JWT Expiry | 8 hours |

### Default Admin
| Setting | Value |
|---------|-------|
| Username | admin |
| Password | admin123 |

---

## Checklist for New Server Setup

Use this checklist to ensure nothing is missed:

- [ ] **PostgreSQL 18 installed**
  - [ ] Password set to `kurt09908`
  - [ ] Port set to `5433`
  - [ ] pgAdmin 4 included

- [ ] **Node.js LTS installed**
  - [ ] `node --version` works
  - [ ] `npm --version` works

- [ ] **pgAdmin 4 configured**
  - [ ] Server "dmw_database" created
  - [ ] Connected successfully

- [ ] **DMW_System folder copied**
  - [ ] All subfolders present
  - [ ] Database SQL files present

- [ ] **Database setup completed**
  - [ ] SETUP_NEW_SERVER.bat ran successfully
  - [ ] 44 tables created
  - [ ] 104 PPMP items loaded
  - [ ] 10 user accounts created

- [ ] **Dependencies installed**
  - [ ] `npm install` in server folder
  - [ ] `npm install` in DMW_System folder

- [ ] **Network configured** (if needed)
  - [ ] Firewall rules added
  - [ ] PostgreSQL configured for remote access
  - [ ] Client PCs configured with server IP

- [ ] **System started**
  - [ ] Server running (`node server.js`)
  - [ ] App starts (`npm start`)

- [ ] **Login tested**
  - [ ] admin/admin123 works
  - [ ] Dashboard displays correctly

---

## Support Contacts

For technical assistance:
- **DMW FAD Technical Support**
- **System Version:** 4.0.0
- **Last Updated:** February 25, 2026

---

*End of Setup Guide*
