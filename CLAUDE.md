# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DMW Procurement Plan System** — A desktop application for managing procurement plans, purchase requests, and purchase orders. It's built on Electron with an Express.js backend and PostgreSQL database.

### Key Components

- **Desktop Client** (Electron): `main.js` + `renderer/` folder
  - Dynamic server discovery (tries localhost, then discovers IPs from server)
  - Real-time updates via Socket.io
  
- **Backend API** (Express.js): `server/` folder
  - RESTful API endpoints
  - PostgreSQL database connection
  - JWT authentication
  - Database migrations in `server/database/migrations/`
  
- **Database** (PostgreSQL): Schema in `server/database/schema.sql`
  - User authentication and role-based access control (5 roles: Admin, Manager, Procurement Officer, Viewer, Auditor)
  - Procurement data models: Plans, Purchase Requests, Purchase Orders, Items, Suppliers, Departments
  - Activity logging for audit trail

### 5 User Roles (RBAC)

- **Admin** — Full system access, user management
- **Manager** — Approve/reject plans, view all data
- **Procurement Officer** — Create/edit plans, manage requests
- **Viewer** — Read-only access to reports
- **Auditor** — Read-only plus audit logs

### Modules (25+ Pages)

Dashboard, PPMP (Procurement Plan), APP (Annual Procurement Plan), PR (Purchase Request), RFQ, PO (Purchase Order), Abstract, Post-Qualification, BAC Resolution, NOA, IAR, RIS, Items Catalog, Suppliers, Stock, Property Reports, etc.

---

## Development Commands

### Frontend (Electron Desktop App)

```bash
# Install dependencies (run once)
npm install

# Run in development mode
npm start

# Build installers (.exe setup + portable)
npm run dist
```

### Backend (Express API Server)

```bash
# Navigate to server folder
cd server

# Install dependencies (run once)
npm install

# Run production mode
npm start

# Run development mode with auto-reload
npm run dev
```

### Database Setup

```bash
# From server/ folder, initialize database
psql -U dmw_app -d dmw_procurement -f database/schema.sql

# Load seed data (optional)
psql -U dmw_app -d dmw_procurement -f database/seed.sql
```

### Helpful Scripts (in server/ folder)

Various migration/utility scripts exist (e.g., `_check_roles.js`, `_create_activity_logs.js`). Run with:
```bash
node _script_name.js
```

---

## Environment Configuration

### `.env` File (Server)

Located at `server/.env`, controls database connection and API settings:

```env
DB_USER=dmw_app
DB_HOST=localhost           # or remote IP for LAN
DB_NAME=dmw_procurement
DB_PASSWORD=SecurePass2026#DMW
DB_PORT=5432
PORT=3000
HOST=0.0.0.0               # for LAN access
JWT_SECRET=your_secret_key_here
```

### Server Auto-Discovery (Electron)

- `main.js` implements **dynamic IP discovery**
- Client tries localhost first, then calls `server/api/server-ips` for network IPs
- Falls back to localhost if no IPs discovered
- No hardcoded IP addresses needed

---

## Architecture Details

### Electron App Flow

1. `main.js` creates BrowserWindow and loads `renderer/index.html`
2. Calls `discoverServer()` to find backend API (localhost → LAN IPs)
3. Establishes Socket.io connection for real-time updates
4. IPC communication between main process and renderer

### Frontend (renderer/)

- `renderer/index.html` — Single-page app with 25+ hidden divs (one per module)
- `renderer/scripts/app.js` — Page navigation, API calls, role-based visibility, Socket.io listeners
- `renderer/styles/main.css` — All styling (no component framework, vanilla JS)
- `renderer/assets/` — Images and icons

### Backend (server/)

- `server.js` — Express setup, middleware (CORS, auth), API route registration
- `server/database/` — SQL schema and migrations
- Socket.io listener for real-time updates
- JWT authentication middleware
- File upload handling with Multer

### Key Dependencies

**Frontend (Electron):**
- `electron`, `electron-builder` — Desktop app framework and build tool
- `socket.io-client` — Real-time websocket communication
- `xlsx` — Excel file generation/parsing

**Backend (Express):**
- `express` — REST API framework
- `pg` — PostgreSQL connection pool
- `jsonwebtoken` — JWT authentication
- `bcrypt` — Password hashing
- `multer` — File uploads
- `socket.io` — Real-time communication
- `pdf-lib` — PDF generation
- `nodemon` — Auto-reload during development

---

## Testing & Validation

### Testing Database Connection

```bash
# From server folder, test with:
curl http://localhost:3000/api/health

# Should return: {"status":"OK","timestamp":"...","server_ip":"..."}
```

### Testing from LAN

```bash
# Get server IP:
ipconfig

# Test from another machine on LAN:
curl http://192.168.x.x:3000/api/health
```

### Firewall Configuration

Windows Firewall must allow:
- Port **3000** (Express API)
- Port **5432** (PostgreSQL, if accessed from LAN)

---

## Common Workflows

### Adding a New Page/Module

1. Add HTML section in `renderer/index.html` with unique `id="newPageId"`
2. Add role permissions to `rolePermissions` object in `renderer/scripts/app.js`
3. Add menu item in nav with `onclick="navigateTo('newPageId')"`
4. Implement page functions (form handlers, data loading, Socket.io listeners)
5. Add corresponding API endpoints in `server/` if needed
6. Test navigation and refresh persistence (uses browser hash + localStorage)

### Adding API Endpoint

1. Create handler in appropriate file in `server/` (e.g., `routes/plans.js`)
2. Register route in `server.js` with `app.post('/api/...', authMiddleware, handler)`
3. Add JWT authentication middleware where needed (`authMiddleware`)
4. Test with curl or Postman
5. Call from frontend via `fetch()` or Socket.io emit

### Database Schema Changes

1. Create SQL migration file in `server/database/migrations/`
2. Test migration logic in development
3. Document migration steps
4. Run on production database before deploying server code

---

## Network Server Discovery (Enhanced)

**How It Works:**

The Electron app uses a 5-step dynamic discovery process to find the backend server across any network:

1. **Localhost First** — Tries `localhost:3000` (local development mode)
2. **Local Network Scan** — Scans all active network interfaces on the client PC (Ethernet, WiFi, etc.)
3. **Server Advertisement** — Queries server's `/api/server-ips` endpoint to get all advertised IPs
4. **Candidate Racing** — Tests all discovered IPs in parallel via `/api/health`
5. **Fallback** — Falls back to localhost if no server responds

**See:** `main.js` — `getLocalNetworkIPs()`, `fetchServerIPsFromServer()`, `discoverServer()`

**Server-Side Detection:**

The backend detects all available network IPs via:
- `server/server.js` → `getLocalIP()` — returns primary IPv4 address
- `server/server.js` → `getAllLocalIPs()` — returns all non-internal IPv4 addresses
- `GET /api/server-ips` endpoint — advertises all available IPs and network interfaces

**Debugging:**

Open DevTools (Ctrl+Shift+I) to see discovery logs:
```
[DISCOVERY] Starting dynamic server discovery...
[DISCOVERY] Scanning local network interfaces...
[DISCOVERY] Testing X candidate IPs...
[DISCOVERY] ✓✓✓ SERVER FOUND at 192.168.x.x:3000 ✓✓✓
```

---

## Routing & Page Persistence (Current Implementation)

**Issue Being Fixed:** Pages reset to dashboard on refresh or browser back/forward.

**Solution:** Hash-based routing with localStorage fallback
- Frontend uses `window.location.hash = pageId`
- `window.onhashchange` handler re-navigates when user uses browser navigation
- `localStorage.getItem('dmw_active_page')` provides fallback
- DOMContentLoaded checks hash first, then localStorage, defaults to dashboard

**See:** `renderer/scripts/app.js` — `navigateTo()`, `navigateToFromHash()`, `window.onhashchange`

---

## Default Credentials (for testing)

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| fad_manager | admin123 | Manager (FAD) |
| officer1 | admin123 | Officer |

⚠️ Change after first login in production.

---

## Build & Distribution

### Create Windows Installer

```bash
npm run dist
```

Creates:
- `dist/Procurement Plan System Setup X.X.X.exe` — NSIS installer
- `dist/Procurement Plan System X.X.X.exe` — Portable executable

Configuration in `package.json` under `"build"` key.

---

## Useful File Locations

| Purpose | Path |
|---------|------|
| Main Electron process | `main.js` |
| Frontend HTML | `renderer/index.html` |
| Frontend JavaScript | `renderer/scripts/app.js` |
| Frontend Styles | `renderer/styles/main.css` |
| Backend entry point | `server/server.js` |
| Database schema | `server/database/schema.sql` |
| Migration scripts | `server/database/migrations/` |
| API routes | `server/routes/` (if modularized) |
| Environment config | `server/.env` |
| Build config | `package.json` (build section) |

---

## Git & Deployment

- Always commit before major changes
- Use descriptive commit messages referencing which pages/modules are affected
- Test on fresh install before pushing to production
- Database backups are stored in `database_backup_*/` folders

---

## Troubleshooting

### "Cannot connect to server"
- Ensure backend is running: `npm run dev` in `server/` folder
- Check `server/.env` database credentials
- Verify PostgreSQL is running and accessible
- For LAN issues: ensure `HOST=0.0.0.0` in `.env` and firewall allows port 3000

### Page resets to dashboard on refresh
- Check that hash-based routing is implemented in `renderer/scripts/app.js`
- Verify `window.location.hash` is set when navigating
- Check `window.onhashchange` listener is registered

### Form data not persisting
- Backend must be running and connected
- Check Socket.io connection in browser console
- Verify API endpoint is defined and returns correct status codes

### Database migration issues
- Always test migrations on a backup database first
- Ensure `psql` is in PATH or use full path to command
- Verify user permissions with `GRANT` statements in schema.sql
