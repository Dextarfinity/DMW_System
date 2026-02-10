# DMW Procurement System - Server Setup Guide

## Prerequisites

Before setting up the server, ensure you have the following installed on your server PC:

1. **Node.js LTS (v20+)** - Download from [nodejs.org](https://nodejs.org)
2. **PostgreSQL 16+** - Download from [postgresql.org](https://www.postgresql.org/download/windows/)
3. **Visual Studio Code** (optional, for editing)

Verify Node.js installation:
```bash
node -v
npm -v
```

---

## Step 1: PostgreSQL Installation & Configuration

### 1.1 Install PostgreSQL
1. Download PostgreSQL installer for Windows
2. Run installer and note down the **superuser password** you set
3. Default port is **5432** - keep this
4. Install pgAdmin 4 (included in installer)

### 1.2 Configure PostgreSQL for LAN Access

Open these files in the PostgreSQL data directory (usually `C:\Program Files\PostgreSQL\16\data`):

**postgresql.conf** - Find and modify:
```
listen_addresses = '*'
port = 5432
```

**pg_hba.conf** - Add at the end:
```
# Allow LAN connections (adjust subnet as needed)
host    all             all             192.168.1.0/24          md5
host    all             all             192.168.0.0/24          md5
```

### 1.3 Restart PostgreSQL Service
1. Press `Win + R`, type `services.msc`
2. Find **PostgreSQL** service
3. Right-click → **Restart**

### 1.4 Configure Windows Firewall
1. Open **Windows Defender Firewall**
2. Click **Advanced settings**
3. **Inbound Rules** → **New Rule**
4. Port → TCP → **5432** → Allow connection → Name: "PostgreSQL"
5. Repeat for port **3000** (Express API server)

---

## Step 2: Create Database

### 2.1 Open Command Prompt or pgAdmin

Using Command Prompt:
```bash
psql -U postgres
```

### 2.2 Create Database and User
```sql
-- Create database
CREATE DATABASE dmw_procurement;

-- Create application user
CREATE USER dmw_app WITH PASSWORD 'SecurePass2026#DMW';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dmw_procurement TO dmw_app;

-- Connect to the database
\c dmw_procurement

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO dmw_app;
```

### 2.3 Run Schema SQL
From the server folder, run:
```bash
psql -U dmw_app -d dmw_procurement -f database/schema.sql
```

Or copy the contents of `database/schema.sql` and run in pgAdmin Query Tool.

### 2.4 Run Seed Data (Optional)
```bash
psql -U dmw_app -d dmw_procurement -f database/seed.sql
```

---

## Step 3: Setup Express API Server

### 3.1 Install Dependencies
Open terminal in the `server` folder:
```bash
cd server
npm install
```

### 3.2 Configure Environment
Edit `.env` file with your settings:
```env
DB_USER=dmw_app
DB_HOST=localhost
DB_NAME=dmw_procurement
DB_PASSWORD=SecurePass2026#DMW
DB_PORT=5432
PORT=3000
HOST=0.0.0.0
JWT_SECRET=your_secret_key_here
```

### 3.3 Start Server
```bash
npm start
```

You should see:
```
========================================
   DMW Procurement System API Server   
========================================
✅ Server running on:
   Local:   http://localhost:3000
   Network: http://192.168.x.x:3000
========================================
```

---

## Step 4: Test the Setup

### 4.1 Health Check
Open browser: `http://localhost:3000/api/health`

Should return:
```json
{
  "status": "OK",
  "timestamp": "2026-02-04T...",
  "server_ip": "192.168.x.x"
}
```

### 4.2 Test from Another PC on LAN
Replace with your server's IP:
```bash
curl http://192.168.1.100:3000/api/health
```

---

## Step 5: Get Your Server IP

Run in Command Prompt:
```bash
ipconfig
```

Look for **IPv4 Address** under your active network adapter (e.g., `192.168.1.100`).

This is the IP you'll configure in Electron clients.

---

## Default Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| fad_manager | admin123 | Manager (FAD) |
| wrsd_manager | admin123 | Manager (WRSD) |
| officer1 | admin123 | Officer |

**⚠️ Change passwords after first login!**

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/health | Server health check | No |
| POST | /api/auth/login | User login | No |
| GET | /api/auth/me | Get current user | Yes |
| GET | /api/departments | List departments | Yes |
| GET | /api/users | List users | Admin |
| GET | /api/items | List items catalog | Yes |
| GET | /api/plans | List procurement plans | Yes |
| POST | /api/plans | Create procurement plan | Yes |
| GET | /api/purchase-requests | List purchase requests | Yes |
| GET | /api/suppliers | List suppliers | Yes |
| GET | /api/purchase-orders | List purchase orders | Yes |

---

## Troubleshooting

### Cannot connect to PostgreSQL
- Check if PostgreSQL service is running
- Verify `pg_hba.conf` has correct subnet
- Check firewall allows port 5432

### Cannot access server from LAN
- Run `ipconfig` to get correct IP
- Ensure firewall allows port 3000
- Check HOST is set to `0.0.0.0` in .env

### Authentication errors
- Verify database user password matches .env
- Check JWT_SECRET is set

---

## Production Recommendations

1. Use HTTPS (SSL certificate)
2. Use environment variables for secrets
3. Set up database backups
4. Consider using PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name dmw-api
   ```
