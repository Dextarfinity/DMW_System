# DMW Caraga Procurement System
## New Server Setup Guide
### Updated: February 25, 2026

---

## Table of Contents
1. [System Requirements](#1-system-requirements)
2. [Software Installation](#2-software-installation)
3. [Database Setup](#3-database-setup)
4. [Application Setup](#4-application-setup)
5. [Network Configuration](#5-network-configuration)
6. [Starting the System](#6-starting-the-system)
7. [Troubleshooting](#7-troubleshooting)
8. [User Accounts](#8-user-accounts)

---

## 1. System Requirements

### Minimum Hardware
- **Processor:** Intel Core i5 or equivalent
- **RAM:** 8 GB minimum, 16 GB recommended
- **Storage:** 50 GB free space
- **Network:** Gigabit Ethernet for LAN deployment

### Operating System
- Windows 10/11 (64-bit)
- Windows Server 2019/2022

---

## 2. Software Installation

### Step 2.1: Install PostgreSQL 18

1. Download PostgreSQL 18 from: https://www.postgresql.org/download/windows/
2. Run the installer
3. **IMPORTANT:** During installation:
   - Set password to: `kurt09908`
   - Set port to: `5433`
   - Select "PostgreSQL Server" and "Command Line Tools"
4. Complete installation
5. Verify installation:
   ```powershell
   "C:\Program Files\PostgreSQL\18\bin\psql.exe" --version
   ```

### Step 2.2: Install Node.js

1. Download Node.js LTS from: https://nodejs.org/
2. Run the installer (include npm)
3. Verify installation:
   ```powershell
   node --version
   npm --version
   ```
   Expected: Node.js v18.x or higher, npm v9.x or higher

### Step 2.3: Install Git (Optional but Recommended)

1. Download Git from: https://git-scm.com/download/win
2. Install with default settings

---

## 3. Database Setup

### Step 3.1: Copy Application Files

Copy the entire `DMW_System` folder to the new server:
```
C:\Users\[Username]\Desktop\PROCUREMENT SYSTEM\DMW_System\
```

Or to any preferred location like:
```
C:\DMW_Procurement\DMW_System\
```

### Step 3.2: Run Database Setup Script

1. Open **Command Prompt as Administrator**
2. Navigate to the database folder:
   ```cmd
   cd "C:\Users\[Username]\Desktop\PROCUREMENT SYSTEM\DMW_System\server\database"
   ```
3. Run the setup script:
   ```cmd
   SETUP_NEW_SERVER.bat
   ```
4. Follow the prompts and wait for completion
5. Verify you see "DATABASE SETUP COMPLETE!"

### Step 3.3: Manual Database Setup (Alternative)

If the batch file fails, manually run:

```powershell
# Set environment variable for password
$env:PGPASSWORD = "kurt09908"

# Create database
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -c "CREATE DATABASE dmw_db;"

# Navigate to database folder
cd "C:\Users\[Username]\Desktop\PROCUREMENT SYSTEM\DMW_System\server\database"

# Run schema
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -f consolidated_schema.sql

# Run seed data
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -f consolidated_seed.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -f seed_employees.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -f seed_app_2026.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -f seed_ppmp_2026.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -f migration_status_update.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -d dmw_db -f seed_users.sql
```

---

## 4. Application Setup

### Step 4.1: Install Server Dependencies

```powershell
cd "C:\Users\[Username]\Desktop\PROCUREMENT SYSTEM\DMW_System\server"
npm install
```

This installs:
- express, pg, cors, body-parser
- bcrypt, bcryptjs, jsonwebtoken
- multer, pdf-lib, dotenv

### Step 4.2: Install Electron App Dependencies

```powershell
cd "C:\Users\[Username]\Desktop\PROCUREMENT SYSTEM\DMW_System"
npm install
```

### Step 4.3: Create Environment File (Optional)

Create `.env` file in `server` folder for custom configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=dmw_db
DB_USER=postgres
DB_PASSWORD=kurt09908

# Server Configuration
PORT=3000
JWT_SECRET=dmw_procurement_secret_key_2026_change_in_production
JWT_EXPIRES_IN=8h
```

---

## 5. Network Configuration

### For LAN/Network Access

#### Step 5.1: Configure Windows Firewall

1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Add Inbound Rules:
   - **PostgreSQL:** Port 5433 (TCP)
   - **Node.js Server:** Port 3000 (TCP)
   - **Electron App:** Port 3000 (TCP)

Or run as Administrator:
```powershell
netsh advfirewall firewall add rule name="DMW PostgreSQL" dir=in action=allow protocol=TCP localport=5433
netsh advfirewall firewall add rule name="DMW API Server" dir=in action=allow protocol=TCP localport=3000
```

#### Step 5.2: Configure PostgreSQL for Network Access

Edit `pg_hba.conf`:
```
C:\Program Files\PostgreSQL\18\data\pg_hba.conf
```

Add this line:
```
host    dmw_db    postgres    192.168.1.0/24    scram-sha-256
```

Edit `postgresql.conf`:
```
C:\Program Files\PostgreSQL\18\data\postgresql.conf
```

Change:
```
listen_addresses = '*'
```

Restart PostgreSQL service.

#### Step 5.3: Update Server for Network

For clients to connect from other PCs, update API_URL in client config:
```javascript
// In renderer/scripts/app.js (around line 20)
const API_URL = 'http://[SERVER_IP]:3000/api';
```

Replace `[SERVER_IP]` with the server's actual IP address (e.g., `192.168.1.100`).

---

## 6. Starting the System

### Step 6.1: Start the API Server

```powershell
cd "C:\Users\[Username]\Desktop\PROCUREMENT SYSTEM\DMW_System\server"
node server.js
```

You should see:
```
Connected to PostgreSQL database
Server running on:
  - Local:   http://localhost:3000
  - Network: http://192.168.x.x:3000
```

### Step 6.2: Start the Electron App

Open new terminal:
```powershell
cd "C:\Users\[Username]\Desktop\PROCUREMENT SYSTEM\DMW_System"
npm start
```

### Step 6.3: Create Desktop Shortcuts (Optional)

**Start Server.bat:**
```batch
@echo off
cd /d "C:\Users\[Username]\Desktop\PROCUREMENT SYSTEM\DMW_System\server"
node server.js
pause
```

**Start App.bat:**
```batch
@echo off
cd /d "C:\Users\[Username]\Desktop\PROCUREMENT SYSTEM\DMW_System"
npm start
```

---

## 7. Troubleshooting

### Database Connection Errors

**Error:** "Could not connect to PostgreSQL"
- Verify PostgreSQL service is running: `services.msc` → PostgreSQL
- Check port: `netstat -an | findstr 5433`
- Verify credentials in server.js or .env file

### PSQL Command Not Found

Add PostgreSQL to PATH:
```powershell
$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"
```

Or permanently via System Environment Variables.

### Port Already in Use

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /PID [PID_NUMBER] /F
```

### Permission Errors

- Run Command Prompt as Administrator
- Check folder permissions on DMW_System

---

## 8. User Accounts

### Default Login Credentials

| Username | Password | Role | Division |
|----------|----------|------|----------|
| admin | admin123 | Administrator | All |
| regienald | dmw2026 | Division Head | FAD |
| cherryl | dmw2026 | Division Head | MWPTD |
| marissa | dmw2026 | Division Head | MWPSD |
| eval | dmw2026 | Division Head + BAC Chair | WRSD |
| ritchel.butao | dmw2026 | HOPE | ORD |
| mark | dmw2026 | Supply Officer | FAD |
| gary | dmw2026 | Supply Officer | FAD |
| giovanni | dmw2026 | BAC Secretariat | FAD |
| jomar | dmw2026 | Officer | FAD |

### Roles & Permissions

- **admin:** Full access to all modules
- **hope:** Head of Procuring Entity - approvals
- **bac_chair:** BAC Chairperson functions
- **bac_secretariat:** BAC documentation
- **division_head:** Division-level approvals
- **supply_officer:** Inventory management
- **officer:** General access

---

## Database Connection Summary

| Setting | Value |
|---------|-------|
| Host | localhost |
| Port | 5433 |
| Database | dmw_db |
| User | postgres |
| Password | kurt09908 |

## API Server Summary

| Setting | Value |
|---------|-------|
| URL | http://localhost:3000/api |
| JWT Expiry | 8 hours |

---

## Quick Start Checklist

- [ ] PostgreSQL 18 installed (port 5433, password: kurt09908)
- [ ] Node.js LTS installed
- [ ] DMW_System folder copied to server
- [ ] SETUP_NEW_SERVER.bat executed successfully
- [ ] `npm install` in server folder
- [ ] `npm install` in DMW_System folder
- [ ] Firewall rules configured (ports 5433, 3000)
- [ ] Server started: `node server.js`
- [ ] App started: `npm start`
- [ ] Login tested with admin/admin123

---

## Support

For issues or questions, contact DMW FAD Technical Support.

**System Version:** 4.0.0  
**Last Updated:** February 25, 2026
