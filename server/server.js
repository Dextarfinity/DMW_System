const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const compression = require('compression');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const os = require('os');
const http = require('http');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { PDFDocument } = require('pdf-lib');
const { Server: SocketIOServer } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = http.createServer(app);

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB per file
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg', 'image/png', 'image/jpg'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Accepted: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG'));
    }
  }
});

// ==============================================================================
// MIDDLEWARE
// ==============================================================================

// CORS — allow any origin so every client PC on the LAN can reach the server
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'],
  credentials: false
}));

// Gzip compression — dramatically speeds up JSON data fetching for clients
app.use(compression({ level: 6, threshold: 1024 }));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// UTF-8 + no-cache headers for API responses so clients always get fresh data
app.use((req, res, next) => {
  res.charset = 'utf-8';
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Request logging — logs method, URL, status, and duration for every request
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl !== '/api/health') {
      const logLine = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
      if (res.statusCode >= 500) console.error(logLine);
      else console.log(logLine);
    }
  });
  next();
});

// Request timeout — abort if any request takes longer than 2 minutes
const REQUEST_TIMEOUT = 120000;
app.use((req, res, next) => {
  req.setTimeout(REQUEST_TIMEOUT, () => {
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timed out. Please try again.' });
    }
  });
  next();
});

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve renderer (frontend) files so Electron clients load UI from the server.
// This makes ALL frontend changes on the server propagate to every client automatically.
const RENDERER_DIR = path.join(__dirname, '..', 'renderer');
app.use(express.static(RENDERER_DIR, {
  etag: false,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // No-cache for HTML/JS/CSS so clients always get the latest version
    if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// ==============================================================================
// REAL-TIME BROADCAST MIDDLEWARE
// ==============================================================================
// Intercepts every successful POST, PUT, PATCH, DELETE response and broadcasts
// a "data_changed" event to ALL connected Electron clients via Socket.IO.
// This way when Client A inserts/updates/deletes data, Clients B, C, D, etc.
// instantly know which resource changed and can refresh their views.
// ==============================================================================

// Map API paths to resource names for clean event broadcasting
const RESOURCE_MAP = {
  '/api/departments': 'departments',
  '/api/divisions': 'divisions',
  '/api/offices': 'offices',
  '/api/users': 'users',
  '/api/designations': 'designations',
  '/api/employees': 'employees',
  '/api/fund-clusters': 'fund-clusters',
  '/api/procurement-modes': 'procurement-modes',
  '/api/uacs-codes': 'uacs-codes',
  '/api/uoms': 'uoms',
  '/api/suppliers': 'suppliers',
  '/api/items': 'items',
  '/api/plans': 'plans',
  '/api/paps': 'paps',
  '/api/plan-items': 'plan-items',
  '/api/app-settings': 'app-settings',
  '/api/app-budget-summary': 'app-budget-summary',
  '/api/purchase-requests': 'purchase-requests',
  '/api/rfqs': 'rfqs',
  '/api/abstracts': 'abstracts',
  '/api/post-qualifications': 'post-qualifications',
  '/api/bac-resolutions': 'bac-resolutions',
  '/api/notices-of-award': 'notices-of-award',
  '/api/purchase-orders': 'purchase-orders',
  '/api/iars': 'iars',
  '/api/stock-cards': 'stock-cards',
  '/api/supplies-ledger-cards': 'supplies-ledger-cards',
  '/api/property-cards': 'property-cards',
  '/api/property-ledger-cards': 'property-ledger-cards',
  '/api/ics': 'ics',
  '/api/pars': 'pars',
  '/api/ptrs': 'ptrs',
  '/api/ris': 'ris',
  '/api/received-semi-expendable': 'received-semi-expendable',
  '/api/received-capital-outlay': 'received-capital-outlay',
  '/api/trip-tickets': 'trip-tickets',
  '/api/po-packets': 'po-packets',
  '/api/coa-submissions': 'coa-submissions',
  '/api/settings': 'settings',
  '/api/notifications': 'notifications',
  '/api/attachments': 'attachments',
};

function getResourceFromPath(urlPath) {
  // Strip query string
  const cleanPath = urlPath.split('?')[0];
  // Try exact match first, then match base path (e.g. /api/items/123 → items)
  if (RESOURCE_MAP[cleanPath]) return RESOURCE_MAP[cleanPath];
  for (const [prefix, resource] of Object.entries(RESOURCE_MAP)) {
    if (cleanPath.startsWith(prefix + '/') || cleanPath === prefix) return resource;
  }
  // Fallback: extract from /api/<resource>/...
  const match = cleanPath.match(/^\/api\/([a-z-]+)/);
  return match ? match[1] : null;
}

function getActionFromMethod(method) {
  switch (method) {
    case 'POST': return 'created';
    case 'PUT': case 'PATCH': return 'updated';
    case 'DELETE': return 'deleted';
    default: return 'changed';
  }
}

// This middleware hooks into res.json() so that AFTER a successful mutation
// response is sent, it broadcasts to all other Electron clients.
app.use((req, res, next) => {
  // Only intercept mutations (not GET/OPTIONS/HEAD)
  if (['GET', 'OPTIONS', 'HEAD'].includes(req.method)) return next();

  const originalJson = res.json.bind(res);
  res.json = function (body) {
    // Call original first so the requesting client gets its response
    const result = originalJson(body);

    // Only broadcast on success (2xx status codes)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const resource = getResourceFromPath(req.originalUrl || req.url);
      if (resource && global.io) {
        const action = getActionFromMethod(req.method);
        const event = {
          resource,
          action,
          timestamp: new Date().toISOString(),
          user: req.user ? { id: req.user.id, username: req.user.username } : null,
          url: req.originalUrl,
          // Include the record id if available (from URL param or response body)
          recordId: req.params?.id || body?.id || null,
        };
        // Broadcast to ALL connected clients so every Electron app refreshes
        global.io.emit('data_changed', event);
      }
    }
    return result;
  };
  next();
});

// ==
// POSTGRESQL CONNECTION POOL  (with auto-reconnect)
// ==============================================================================
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '192.168.100.235',
  database: process.env.DB_NAME || 'dmw_db',
  password: process.env.DB_PASSWORD || 'dmw123',
  port: parseInt(process.env.DB_PORT) || 5432,
  client_encoding: 'UTF8',
  max: 20,                        // Maximum connections in the pool
  idleTimeoutMillis: 30000,       // Close idle connections after 30 s
  connectionTimeoutMillis: 10000, // Fail fast if DB unreachable for 10 s
  allowExitOnIdle: false,         // Keep pool alive for server lifetime
  statement_timeout: 60000,       // Cancel any query running > 60 s
  query_timeout: 60000,           // Same at libpq level
});

// Log pool errors globally so they never crash the process
pool.on('error', (err) => {
  console.error('[POOL] Unexpected error on idle client:', err.message);
});

// Initial connection + auto-reconnect heartbeat every 30 s
let dbConnected = false;
async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    client.release();
    if (!dbConnected) {
      dbConnected = true;
      console.log('Connected to PostgreSQL database');
    }
  } catch (err) {
    dbConnected = false;
    console.error('[POOL] Database connection failed — retrying in 30 s:', err.message);
  }
}
checkDatabaseConnection();                       // first attempt
setInterval(checkDatabaseConnection, 30000);     // heartbeat every 30 s

// Helper: safe query wrapper — returns empty result instead of crashing when a
//         table does not exist yet (useful while upgrading / migrating schema)
async function safeQuery(text, params) {
  try {
    return await pool.query(text, params);
  } catch (err) {
    // Table-not-found or column-not-found errors — log and return empty
    if (err.code === '42P01' || err.code === '42703') {
      console.warn(`[SAFE-QUERY] Skipped — ${err.message.split('\n')[0]}`);
      return { rows: [{ count: '0' }], rowCount: 0 };
    }
    throw err;   // re-throw everything else so normal error handling kicks in
  }
}

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

const JWT_SECRET = process.env.JWT_SECRET || 'dmw_procurement_secret_key_2026_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// ==============================================================================
// MIDDLEWARE
// ==============================================================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const userRoles = [req.user.role, req.user.secondary_role].filter(Boolean);
    if (!userRoles.some(r => roles.includes(r))) return res.status(403).json({ error: 'Insufficient permissions' });
    next();
  };
};

// ==============================================================================
// ACTIVITY LOGGING HELPER
// ==============================================================================

// Dedup cache: prevent duplicate logs from clients that fire the same request twice
const _recentLogs = new Map();
const DEDUP_WINDOW_MS = 3000; // 3-second window

function logActivity(pool, { userId, username, action, tableName, recordId, reference, description, oldData, newData, ipAddress }) {
  // Build a dedup key from the core fields (ignore old/new data)
  const dedupKey = `${userId || ''}|${username || ''}|${action}|${tableName}|${recordId || ''}|${reference || ''}|${ipAddress || ''}`;
  const now = Date.now();
  const lastTime = _recentLogs.get(dedupKey);
  if (lastTime && (now - lastTime) < DEDUP_WINDOW_MS) {
    // Duplicate within window — skip
    return;
  }
  _recentLogs.set(dedupKey, now);
  // Prune stale entries periodically (keep map small)
  if (_recentLogs.size > 500) {
    for (const [k, t] of _recentLogs) {
      if (now - t > DEDUP_WINDOW_MS) _recentLogs.delete(k);
    }
  }

  pool.query(
    `INSERT INTO activity_logs (user_id, username, action, table_name, record_id, reference, description, old_data, new_data, ip_address)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [userId || null, username || null, action, tableName, recordId || null, reference || null, description || null,
     oldData ? JSON.stringify(oldData) : null, newData ? JSON.stringify(newData) : null, ipAddress || null]
  ).catch(err => console.error('[ACTIVITY LOG] Error:', err.message));
}

// Map API paths to table names for auto-logging
const apiToTableMap = {
  'auth': 'users',
  'departments': 'departments', 'divisions': 'divisions', 'offices': 'offices',
  'users': 'users', 'designations': 'designations', 'employees': 'employees',
  'fund-clusters': 'fund_clusters', 'procurement-modes': 'procurement_modes',
  'uacs-codes': 'uacs_codes', 'uoms': 'uoms', 'suppliers': 'suppliers',
  'items': 'items', 'plans': 'procurementplans', 'plan-items': 'plan_items',
  'paps': 'paps', 'app-settings': 'app_settings',
  'purchase-requests': 'purchaserequests', 'rfqs': 'rfqs',
  'abstracts': 'abstracts', 'post-qualifications': 'post_qualifications',
  'bac-resolutions': 'bac_resolutions', 'notices-of-award': 'notices_of_award',
  'purchase-orders': 'purchaseorders', 'iars': 'iars',
  'stock-cards': 'stock_cards', 'supplies-ledger-cards': 'supplies_ledger_cards',
  'property-cards': 'property_cards', 'property-ledger-cards': 'property_ledger_cards',
  'ics': 'inventory_custodian_slips', 'pars': 'property_acknowledgement_receipts',
  'ris': 'requisition_issue_slips', 'trip-tickets': 'trip_tickets',
  'coa-submissions': 'coa_submissions', 'po-packets': 'po_packets',
  'received-semi-expendable': 'received_semi_expendable_items',
  'received-capital-outlay': 'received_capital_outlay_items',
  'notifications': 'notifications', 'attachments': 'attachments'
};

function getTableFromPath(url) {
  const clean = url.split('?')[0];
  const match = clean.match(/^\/api\/([a-z-]+)/);
  if (!match) return null;
  return apiToTableMap[match[1]] || match[1];
}

function getActionFromHttpMethod(method, url) {
  if (url.includes('/auth/login')) return 'LOGIN';
  if (url.includes('/auth/logout')) return 'LOGOUT';
  if (url.includes('/auth/register')) return 'CREATE';
  if (url.includes('/accept') || url.includes('/post')) return 'POST';
  if (url.includes('/unpost')) return 'UNPOST';
  if (url.includes('/approve')) return 'UPDATE';
  if (url.includes('/set-status')) return 'UPDATE';
  if (url.includes('/restore')) return 'UPDATE';
  switch (method) {
    case 'POST': return 'CREATE';
    case 'PUT': case 'PATCH': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    default: return method;
  }
}

function getDescriptionFromAction(action, tableName, reference) {
  const readable = tableName.replace(/_/g, ' ');
  switch (action) {
    case 'CREATE': return `Created ${readable}${reference ? ': ' + reference : ''}`;
    case 'UPDATE': return `Updated ${readable}${reference ? ': ' + reference : ''}`;
    case 'DELETE': return `Deleted ${readable}${reference ? ': ' + reference : ''}`;
    case 'POST': return `Posted ${readable}${reference ? ': ' + reference : ''}`;
    case 'UNPOST': return `Unposted ${readable}${reference ? ': ' + reference : ''}`;
    case 'LOGIN': return `User ${reference || 'unknown'} logged in`;
    case 'LOGOUT': return `User ${reference || 'unknown'} logged out`;
    default: return `${action} on ${readable}${reference ? ': ' + reference : ''}`;
  }
}

// Auto-logging middleware for all mutations
app.use('/api', (req, res, next) => {
  if (['GET', 'OPTIONS', 'HEAD'].includes(req.method)) return next();
  // Skip: activity-logs, audit-log, health
  const path = req.path || req.url;
  if (path.includes('activity-logs') || path.includes('audit-log') || path === '/health') return next();

  let alreadyLogged = false;
  const originalJson = res.json;
  res.json = function(body) {
    // Only log on success (2xx), and only once per request
    if (!alreadyLogged && res.statusCode >= 200 && res.statusCode < 300) {
      alreadyLogged = true;
      const tableName = getTableFromPath(req.originalUrl || req.url);
      if (tableName) {
        const action = getActionFromHttpMethod(req.method, req.originalUrl || req.url);
        const recordId = body?.id || body?.user?.id || req.params?.id || null;
        const reference = body?.ris_no || body?.pr_number || body?.po_number || body?.iar_number ||
                          body?.rfq_no || body?.abstract_no || body?.resolution_no || body?.noa_no ||
                          body?.name || body?.username || body?.user?.username || body?.ics_no || body?.par_no ||
                          body?.trip_ticket_no || body?.property_number || null;
        const ip = req.ip || req.connection?.remoteAddress || null;
        // For login/register, req.user is not set — extract from response body
        const user = req.user || {};
        const userId = user.id || body?.user?.id || null;
        const username = user.username || body?.user?.username || req.body?.username || null;
        logActivity(pool, {
          userId, username,
          action, tableName, recordId: parseInt(recordId) || null,
          reference: reference ? String(reference) : null,
          description: getDescriptionFromAction(action, tableName, reference),
          oldData: null,
          newData: req.method === 'DELETE' ? null : (typeof body === 'object' ? body : null),
          ipAddress: ip
        });
      }
    }
    return originalJson.call(this, body);
  };
  next();
});

// ==============================================================================
// ROUTE ALIASES - rewrite short frontend paths to actual server paths
// Must be placed BEFORE all route definitions
// ==============================================================================
const routeAliases = {
  '/api/ppmp': '/api/plans',
  '/api/pr': '/api/purchase-requests',
  '/api/rfq': '/api/rfqs',
  '/api/abstract': '/api/abstracts',
  '/api/postqual': '/api/post-qualifications',
  '/api/bac-resolution': '/api/bac-resolutions',
  '/api/noa': '/api/notices-of-award',
  '/api/po': '/api/purchase-orders',
  '/api/iar': '/api/iars',
  '/api/po-packet': '/api/po-packets',
  '/api/coa': '/api/coa-submissions',
  '/api/auth/signup': '/api/auth/register'
};

app.use((req, res, next) => {
  for (const [alias, target] of Object.entries(routeAliases)) {
    if (req.path === alias || req.path.startsWith(alias + '/')) {
      req.url = req.url.replace(alias, target);
      break;
    }
  }
  next();
});

// ==============================================================================
// AUTH ROUTES
// ==============================================================================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query(
      `SELECT u.*, d.name as department_name, d.code as department_code,
              des.name as designation_name
       FROM users u 
       LEFT JOIN departments d ON u.dept_id = d.id 
       LEFT JOIN employees e ON u.employee_id = e.id
       LEFT JOIN designations des ON e.designation_id = des.id
       WHERE u.username = $1`, [username]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];

    // Support both bcrypt hashed and plain text passwords
    let validPassword = false;
    if (user.password_hash.startsWith('$2')) {
      validPassword = await bcrypt.compare(password, user.password_hash);
    } else {
      validPassword = (password === user.password_hash);
    }
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, secondary_role: user.secondary_role || null, dept_id: user.dept_id },
      JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }
    );
    const roles = [user.role, user.secondary_role].filter(Boolean);

    res.json({
      token,
      user: { id: user.id, username: user.username, full_name: user.full_name, email: user.email, role: user.role, secondary_role: user.secondary_role || null, roles, dept_id: user.dept_id, department: user.department_name, department_code: user.department_code, designation: user.designation_name }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    res.json({ message: 'Logged out', username: req.user?.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, full_name, email, role, dept_id } = req.body;
    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Username already exists' });
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, full_name, email, role, dept_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, full_name, role, dept_id`,
      [username, password_hash, full_name, email, role || 'viewer', dept_id]
    );
    const newUser = result.rows[0];
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role, dept_id: newUser.dept_id },
      JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }
    );
    res.status(201).json({
      token,
      user: { id: newUser.id, username: newUser.username, full_name: newUser.full_name, role: newUser.role }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.role, u.secondary_role, u.email, u.dept_id, d.name as department_name, d.code as department_code,
              des.name as designation_name
       FROM users u 
       LEFT JOIN departments d ON u.dept_id = d.id 
       LEFT JOIN employees e ON u.employee_id = e.id
       LEFT JOIN designations des ON e.designation_id = des.id
       WHERE u.id = $1`, [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const u = result.rows[0];
    u.roles = [u.role, u.secondary_role].filter(Boolean);
    res.json(u);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Change Password
app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get user's current password hash
    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = userResult.rows[0];

    // Verify current password (support both bcrypt hashed and plain text)
    let validPassword = false;
    if (user.password_hash.startsWith('$2')) {
      validPassword = await bcrypt.compare(current_password, user.password_hash);
    } else {
      validPassword = (current_password === user.password_hash);
    }
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and save new password
    const newHash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Update Own Profile (self-service)
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { username, full_name, email, dept_id } = req.body;
    if (!username || !full_name) {
      return res.status(400).json({ error: 'Username and full name are required' });
    }

    // Check if username is taken by another user
    const existing = await pool.query('SELECT id FROM users WHERE username = $1 AND id != $2', [username, req.user.id]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Username is already taken by another user' });
    }

    await pool.query(
      `UPDATE users SET username=$1, full_name=$2, email=$3, dept_id=$4, updated_at=CURRENT_TIMESTAMP WHERE id=$5`,
      [username, full_name, email || null, dept_id || null, req.user.id]
    );

    // Return updated user with department info
    const result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.role, u.email, u.dept_id, d.name as department_name, d.code as department_code
       FROM users u LEFT JOIN departments d ON u.dept_id = d.id WHERE u.id = $1`, [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ==============================================================================
// DASHBOARD
// ==============================================================================

app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const [
      // Counts
      items, plans, ppmpItems, prs, pos, suppliers, users, departments,
      stockCards, propertyCards, ics, employees,
      lowStock, outOfStock,
      semiExpItems, capitalOutlayItems,
      pendingIARs, iarsTotal, pendingRIS, tripTickets,
      rfqs, abstracts, postQuals, bacRes, noas, poPackets, coaSubs,
      // Status breakdowns
      prByStatus, poByStatus, iarByStatus,
      // PPMP per division
      ppmpByDiv,
      // Budget utilization
      totalPPMPBudget,
      // Recent PRs
      recentPRs,
      // Procurement tracker
      procurementTracker,
      // Alerts
      overduePRs,
      overdueRFQs,
      rejectedPRs,
      pendingPOs
    ] = await Promise.all([
      // Basic counts — uses safeQuery so missing tables don't crash the dashboard
      safeQuery('SELECT COUNT(*) FROM items WHERE is_active = TRUE'),
      safeQuery('SELECT COUNT(*) FROM procurementplans'),
      safeQuery("SELECT COUNT(*) FROM procurementplans WHERE ppmp_no IS NOT NULL"),
      safeQuery('SELECT COUNT(*) FROM purchaserequests'),
      safeQuery('SELECT COUNT(*) FROM purchaseorders'),
      safeQuery('SELECT COUNT(*) FROM suppliers WHERE is_active = TRUE'),
      safeQuery('SELECT COUNT(*) FROM users WHERE is_active = TRUE'),
      safeQuery('SELECT COUNT(*) FROM departments'),
      safeQuery('SELECT COUNT(*) FROM stock_cards'),
      safeQuery('SELECT COUNT(*) FROM property_cards'),
      safeQuery('SELECT COUNT(*) FROM inventory_custodian_slips'),
      safeQuery("SELECT COUNT(*) FROM employees WHERE status = 'active'"),
      safeQuery("SELECT COUNT(*) FROM items WHERE is_active = TRUE AND quantity > 0 AND quantity <= reorder_point"),
      safeQuery("SELECT COUNT(*) FROM items WHERE is_active = TRUE AND quantity = 0"),
      safeQuery('SELECT COUNT(*) FROM received_semi_expendable_items'),
      safeQuery('SELECT COUNT(*) FROM received_capital_outlay_items'),
      safeQuery("SELECT COUNT(*) FROM iars WHERE acceptance != 'complete'"),
      safeQuery('SELECT COUNT(*) FROM iars'),
      safeQuery("SELECT COUNT(*) FROM requisition_issue_slips WHERE status = 'PENDING'"),
      safeQuery('SELECT COUNT(*) FROM trip_tickets'),
      safeQuery('SELECT COUNT(*) FROM rfqs'),
      safeQuery('SELECT COUNT(*) FROM abstracts'),
      safeQuery('SELECT COUNT(*) FROM post_qualifications'),
      safeQuery('SELECT COUNT(*) FROM bac_resolutions'),
      safeQuery('SELECT COUNT(*) FROM notices_of_award'),
      safeQuery('SELECT COUNT(*) FROM po_packets'),
      safeQuery('SELECT COUNT(*) FROM coa_submissions'),
      // Status breakdowns
      safeQuery("SELECT status, COUNT(*)::int as count FROM purchaserequests GROUP BY status"),
      safeQuery("SELECT status, COUNT(*)::int as count FROM purchaseorders GROUP BY status"),
      safeQuery("SELECT acceptance, COUNT(*)::int as count FROM iars GROUP BY acceptance"),
      // PPMP by division
      safeQuery("SELECT d.code, COUNT(*)::int as count, COALESCE(SUM(pp.total_amount),0) as budget FROM procurementplans pp JOIN departments d ON pp.dept_id = d.id WHERE pp.ppmp_no IS NOT NULL GROUP BY d.code ORDER BY d.code"),
      // Total PPMP budget
      safeQuery("SELECT COALESCE(SUM(total_amount),0) as total FROM procurementplans WHERE ppmp_no IS NOT NULL"),
      // Recent PRs with department + item descriptions
      safeQuery(`SELECT pr.id, pr.pr_number, pr.purpose, pr.status, pr.total_amount, d.code as dept_code, pr.created_at,
        COALESCE(
          (SELECT string_agg(pi.item_name, ', ' ORDER BY pi.id) FROM pr_items pi WHERE pi.pr_id = pr.id),
          'N/A'
        ) as item_descriptions
        FROM purchaserequests pr LEFT JOIN departments d ON pr.dept_id = d.id ORDER BY pr.created_at DESC LIMIT 50`),
      // Recent activity log removed,
      // Procurement Tracker: each PR's current step in the process
      safeQuery(`SELECT
        pr.id, pr.pr_number, pr.purpose, pr.status as pr_status, pr.total_amount, d.code as dept_code, pr.created_at,
        COALESCE((SELECT string_agg(pi.item_name, ', ' ORDER BY pi.id) FROM pr_items pi WHERE pi.pr_id = pr.id), 'N/A') as item_descriptions,
        rfq.rfq_number, rfq.status as rfq_status,
        ab.abstract_number, ab.status as abstract_status,
        pq.postqual_number, pq.status as postqual_status,
        br.resolution_number, br.status as bac_status,
        noa.noa_number, noa.status as noa_status,
        po.po_number, po.status as po_status,
        iar.iar_number, iar.acceptance as iar_acceptance, iar.inspection_result as iar_inspection
      FROM purchaserequests pr
      LEFT JOIN departments d ON pr.dept_id = d.id
      LEFT JOIN rfqs rfq ON rfq.pr_id = pr.id
      LEFT JOIN abstracts ab ON ab.rfq_id = rfq.id
      LEFT JOIN post_qualifications pq ON pq.abstract_id = ab.id
      LEFT JOIN bac_resolutions br ON br.abstract_id = ab.id
      LEFT JOIN notices_of_award noa ON noa.bac_resolution_id = br.id
      LEFT JOIN purchaseorders po ON po.noa_id = noa.id
      LEFT JOIN iars iar ON iar.po_id = po.id
      ORDER BY pr.created_at DESC LIMIT 50`),
      // Overdue / Alerts data
      safeQuery(`SELECT COUNT(*) FROM purchaserequests WHERE status = 'pending_approval' AND created_at < NOW() - INTERVAL '5 days'`),
      safeQuery(`SELECT COUNT(*) FROM rfqs WHERE status = 'on_going' AND created_at < NOW() - INTERVAL '3 days'`),
      safeQuery(`SELECT COUNT(*) FROM purchaserequests WHERE status = 'rejected'`),
      safeQuery(`SELECT COUNT(*) FROM purchaseorders WHERE status = 'for_signing'`)
    ]);

    // Build status maps
    const prStatusMap = {};
    prByStatus.rows.forEach(r => { prStatusMap[r.status] = r.count; });
    const poStatusMap = {};
    poByStatus.rows.forEach(r => { poStatusMap[r.status] = r.count; });
    const iarStatusMap = {};
    iarByStatus.rows.forEach(r => { iarStatusMap[r.acceptance] = r.count; });

    // Build division PPMP map
    const divisionPPMP = {};
    ppmpByDiv.rows.forEach(r => { divisionPPMP[r.code] = { count: r.count, budget: parseFloat(r.budget) }; });

    res.json({
      // Summary counts
      totalItems: parseInt(items.rows[0].count),
      totalPlans: parseInt(plans.rows[0].count),
      totalPPMPItems: parseInt(ppmpItems.rows[0].count),
      totalPRs: parseInt(prs.rows[0].count),
      totalPOs: parseInt(pos.rows[0].count),
      totalSuppliers: parseInt(suppliers.rows[0].count),
      totalUsers: parseInt(users.rows[0].count),
      totalDepartments: parseInt(departments.rows[0].count),
      totalStockCards: parseInt(stockCards.rows[0].count),
      totalPropertyCards: parseInt(propertyCards.rows[0].count),
      totalICS: parseInt(ics.rows[0].count),
      totalEmployees: parseInt(employees.rows[0].count),
      lowStockItems: parseInt(lowStock.rows[0].count),
      outOfStockItems: parseInt(outOfStock.rows[0].count),
      totalSemiExpendable: parseInt(semiExpItems.rows[0].count),
      totalCapitalOutlay: parseInt(capitalOutlayItems.rows[0].count),
      pendingIARs: parseInt(pendingIARs.rows[0].count),
      totalIARs: parseInt(iarsTotal.rows[0].count),
      pendingRIS: parseInt(pendingRIS.rows[0].count),
      totalTripTickets: parseInt(tripTickets.rows[0].count),
      totalRFQs: parseInt(rfqs.rows[0].count),
      totalAbstracts: parseInt(abstracts.rows[0].count),
      totalPostQuals: parseInt(postQuals.rows[0].count),
      totalBACResolutions: parseInt(bacRes.rows[0].count),
      totalNOAs: parseInt(noas.rows[0].count),
      totalPOPackets: parseInt(poPackets.rows[0].count),
      totalCOA: parseInt(coaSubs.rows[0].count),
      // Status breakdowns
      prByStatus: prStatusMap,
      poByStatus: poStatusMap,
      iarByStatus: iarStatusMap,
      // Division PPMP
      divisionPPMP: divisionPPMP,
      totalPPMPBudget: parseFloat(totalPPMPBudget.rows[0].total),
      // Recent PRs
      recentPRs: recentPRs.rows,
      // Recent activity removed
      // Procurement tracker
      procurementTracker: procurementTracker.rows,
      // Alerts
      alerts: {
        overduePRs: parseInt(overduePRs.rows[0].count),
        overdueRFQs: parseInt(overdueRFQs.rows[0].count),
        rejectedPRs: parseInt(rejectedPRs.rows[0].count),
        pendingPOs: parseInt(pendingPOs.rows[0].count)
      }
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// DEPARTMENTS / DIVISIONS / OFFICES
// ==============================================================================

// --- Departments ---
app.get('/api/departments', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments ORDER BY name');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/departments', authenticateToken, async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const result = await pool.query(
      'INSERT INTO departments (name, code, description) VALUES ($1, $2, $3) RETURNING *',
      [name, code, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/departments/:id', authenticateToken, async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const result = await pool.query(
      'UPDATE departments SET name=$1, code=$2, description=$3 WHERE id=$4 RETURNING *',
      [name, code, description, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/departments/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM departments WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Divisions ---
// GET divisions is public (no auth) for signup form
app.get('/api/divisions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM divisions ORDER BY name');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/divisions/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM divisions WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Division not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/divisions', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query('INSERT INTO divisions (name, description) VALUES ($1, $2) RETURNING *', [name, description]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/divisions/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query('UPDATE divisions SET name=$1, description=$2 WHERE id=$3 RETURNING *', [name, description, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/divisions/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM divisions WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Offices ---
app.get('/api/offices', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM offices ORDER BY name');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/offices/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM offices WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Office not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/offices', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query('INSERT INTO offices (name, description) VALUES ($1, $2) RETURNING *', [name, description]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/offices/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query('UPDATE offices SET name=$1, description=$2 WHERE id=$3 RETURNING *', [name, description, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/offices/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM offices WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// USERS
// ==============================================================================

app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.email, u.role, u.secondary_role, u.is_active, u.last_login, u.created_at,
              d.name as department_name, d.code as department_code
       FROM users u LEFT JOIN departments d ON u.dept_id = d.id ORDER BY u.id`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.email, u.role, u.secondary_role, u.dept_id, u.is_active, u.employee_id, u.last_login, u.created_at,
              d.name as department_name, d.code as department_code
       FROM users u LEFT JOIN departments d ON u.dept_id = d.id WHERE u.id = $1`, [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { username, password, full_name, email, role, dept_id, employee_id } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, full_name, email, role, dept_id, employee_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, full_name, role`,
      [username, password_hash, full_name, email, role, dept_id, employee_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/users/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { username, full_name, email, role, dept_id, is_active, employee_id, password } = req.body;
    
    // If password is provided, hash it and update
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [password_hash, req.params.id]);
    }
    
    const result = await pool.query(
      `UPDATE users SET username=$1, full_name=$2, email=$3, role=$4, dept_id=$5, is_active=$6, employee_id=$7, updated_at=CURRENT_TIMESTAMP
       WHERE id=$8 RETURNING id, username, full_name, role`,
      [username, full_name, email, role, dept_id, is_active, employee_id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/users/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    // Check if permanent delete requested
    if (req.query.permanent === 'true') {
      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, username', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json({ message: 'User permanently deleted', user: result.rows[0] });
    } else {
      await pool.query('UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [req.params.id]);
      res.json({ message: 'User deactivated' });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Reactivate user
app.patch('/api/users/:id/activate', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE users SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, username, full_name, role',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User activated', user: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Promote/change user role
app.patch('/api/users/:id/role', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required' });
    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username, full_name, role',
      [role, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Role updated', user: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// DESIGNATIONS
// ==============================================================================

app.get('/api/designations', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM designations ORDER BY name');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/designations/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM designations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Designation not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/designations', authenticateToken, async (req, res) => {
  try {
    const { code, name, description } = req.body;
    const result = await pool.query(
      'INSERT INTO designations (code, name, description) VALUES ($1, $2, $3) RETURNING *',
      [code, name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/designations/:id', authenticateToken, async (req, res) => {
  try {
    const { code, name, description } = req.body;
    const result = await pool.query(
      'UPDATE designations SET code=$1, name=$2, description=$3 WHERE id=$4 RETURNING *',
      [code, name, description, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/designations/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM designations WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// EMPLOYEES
// ==============================================================================

app.get('/api/employees', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, d.name as department_name, des.name as designation_name
       FROM employees e 
       LEFT JOIN departments d ON e.dept_id = d.id 
       LEFT JOIN designations des ON e.designation_id = des.id
       ORDER BY e.full_name`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, d.name as department_name, des.name as designation_name
       FROM employees e 
       LEFT JOIN departments d ON e.dept_id = d.id 
       LEFT JOIN designations des ON e.designation_id = des.id
       WHERE e.id = $1`, [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/employees', authenticateToken, async (req, res) => {
  try {
    const { employee_code, full_name, designation_id, dept_id, department_id, email, phone, status } = req.body;
    const deptValue = dept_id || department_id || null;
    const result = await pool.query(
      `INSERT INTO employees (employee_code, full_name, designation_id, dept_id, email, phone, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [employee_code, full_name, designation_id, deptValue, email, phone, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    const { employee_code, full_name, designation_id, dept_id, email, phone, status } = req.body;
    const result = await pool.query(
      `UPDATE employees SET employee_code=$1, full_name=$2, designation_id=$3, dept_id=$4, email=$5, phone=$6, status=$7, updated_at=CURRENT_TIMESTAMP
       WHERE id=$8 RETURNING *`,
      [employee_code, full_name, designation_id, dept_id, email, phone, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM employees WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// FUND CLUSTERS
// ==============================================================================

app.get('/api/fund-clusters', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fund_clusters ORDER BY code');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/fund-clusters/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fund_clusters WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Fund cluster not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/fund-clusters', authenticateToken, async (req, res) => {
  try {
    const { code, name, description } = req.body;
    const result = await pool.query(
      'INSERT INTO fund_clusters (code, name, description) VALUES ($1, $2, $3) RETURNING *',
      [code, name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/fund-clusters/:id', authenticateToken, async (req, res) => {
  try {
    const { code, name, description } = req.body;
    const result = await pool.query(
      'UPDATE fund_clusters SET code=$1, name=$2, description=$3 WHERE id=$4 RETURNING *',
      [code, name, description, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/fund-clusters/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM fund_clusters WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// PROCUREMENT MODES
// ==============================================================================

app.get('/api/procurement-modes', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM procurement_modes ORDER BY name');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/procurement-modes/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM procurement_modes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Procurement mode not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/procurement-modes', authenticateToken, async (req, res) => {
  try {
    const { code, name, description } = req.body;
    const result = await pool.query(
      'INSERT INTO procurement_modes (code, name, description) VALUES ($1, $2, $3) RETURNING *',
      [code, name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/procurement-modes/:id', authenticateToken, async (req, res) => {
  try {
    const { code, name, description } = req.body;
    const result = await pool.query(
      'UPDATE procurement_modes SET code=$1, name=$2, description=$3 WHERE id=$4 RETURNING *',
      [code, name, description, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/procurement-modes/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM procurement_modes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// UACS CODES
// ==============================================================================

app.get('/api/uacs-codes', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM uacs_codes ORDER BY code');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/uacs-codes/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM uacs_codes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'UACS code not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/uacs-codes', authenticateToken, async (req, res) => {
  try {
    const { code, category, name, description } = req.body;
    const result = await pool.query(
      'INSERT INTO uacs_codes (code, category, name, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [code, category, name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/uacs-codes/:id', authenticateToken, async (req, res) => {
  try {
    const { code, category, name, description } = req.body;
    const result = await pool.query(
      'UPDATE uacs_codes SET code=$1, category=$2, name=$3, description=$4 WHERE id=$5 RETURNING *',
      [code, category, name, description, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/uacs-codes/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM uacs_codes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// UNITS OF MEASURE (UOM)
// ==============================================================================

app.get('/api/uoms', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM uoms ORDER BY name');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/uoms/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM uoms WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'UOM not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/uoms', authenticateToken, async (req, res) => {
  try {
    const { abbreviation, name } = req.body;
    const result = await pool.query(
      'INSERT INTO uoms (abbreviation, name) VALUES ($1, $2) RETURNING *',
      [abbreviation, name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/uoms/:id', authenticateToken, async (req, res) => {
  try {
    const { abbreviation, name } = req.body;
    const result = await pool.query(
      'UPDATE uoms SET abbreviation=$1, name=$2 WHERE id=$3 RETURNING *',
      [abbreviation, name, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/uoms/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM uoms WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// SUPPLIERS
// ==============================================================================

app.get('/api/suppliers', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suppliers WHERE is_active = TRUE ORDER BY name');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/suppliers/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/suppliers', authenticateToken, async (req, res) => {
  try {
    const { name, contact_person, phone, email, address, tin, org_type, tax_type } = req.body;
    const result = await pool.query(
      `INSERT INTO suppliers (name, contact_person, phone, email, address, tin, org_type, tax_type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, contact_person, phone, email, address, tin, org_type, tax_type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/suppliers/:id', authenticateToken, async (req, res) => {
  try {
    const { name, contact_person, phone, email, address, tin, org_type, tax_type, is_active } = req.body;
    const result = await pool.query(
      `UPDATE suppliers SET name=$1, contact_person=$2, phone=$3, email=$4, address=$5, tin=$6, org_type=$7, tax_type=$8, is_active=$9, updated_at=CURRENT_TIMESTAMP
       WHERE id=$10 RETURNING *`,
      [name, contact_person, phone, email, address, tin, org_type, tax_type, is_active !== false, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/suppliers/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE suppliers SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Supplier deactivated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// ITEMS (Master Catalog - Procurement + Inventory)
// ==============================================================================

app.get('/api/items', authenticateToken, async (req, res) => {
  try {
    const { category, active_only, procurement_source } = req.query;
    let query = `SELECT i.*, uc.name as uacs_name, uc.category as uacs_category
                 FROM items i LEFT JOIN uacs_codes uc ON i.uacs_code = uc.code`;
    const params = [];
    const conditions = [];
    if (category) { conditions.push(`i.category = $${params.length + 1}`); params.push(category); }
    if (active_only === 'true') { conditions.push('i.is_active = TRUE'); }
    if (procurement_source) { conditions.push(`i.procurement_source = $${params.length + 1}`); params.push(procurement_source); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY i.name';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, uc.name as uacs_name FROM items i LEFT JOIN uacs_codes uc ON i.uacs_code = uc.code WHERE i.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/items', authenticateToken, async (req, res) => {
  try {
    const { code, stock_no, name, description, unit, unit_price, category, uacs_code, quantity, reorder_point, gam_classification, semi_expendable_classification, procurement_source } = req.body;
    const result = await pool.query(
      `INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, quantity, reorder_point, gam_classification, semi_expendable_classification, procurement_source) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [code, stock_no, name, description, unit, unit_price || 0, category, uacs_code, quantity || 0, reorder_point || 0, gam_classification, semi_expendable_classification, procurement_source || 'NON PS-DBM']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const { code, stock_no, name, description, unit, unit_price, category, uacs_code, quantity, reorder_point, is_active, gam_classification, semi_expendable_classification, procurement_source } = req.body;
    const result = await pool.query(
      `UPDATE items SET code=$1, stock_no=$2, name=$3, description=$4, unit=$5, unit_price=$6, category=$7, uacs_code=$8, 
       quantity=$9, reorder_point=$10, is_active=$11, gam_classification=$12, semi_expendable_classification=$13, procurement_source=$14, updated_at=CURRENT_TIMESTAMP
       WHERE id=$15 RETURNING *`,
      [code, stock_no, name, description, unit, unit_price, category, uacs_code, quantity, reorder_point, is_active !== false, gam_classification, semi_expendable_classification, procurement_source || 'NON PS-DBM', req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE items SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Item deactivated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Running Inventory
app.get('/api/items/inventory/running', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, uc.name as uacs_name,
              CASE WHEN i.quantity <= i.reorder_point AND i.quantity > 0 THEN 'Low Stock'
                   WHEN i.quantity = 0 THEN 'Out of Stock'
                   ELSE 'In Stock' END AS stock_status
       FROM items i LEFT JOIN uacs_codes uc ON i.uacs_code = uc.code
       WHERE i.is_active = TRUE ORDER BY i.name`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// PROCUREMENT PLANS (PPMP/APP)
// ==============================================================================

app.get('/api/plans', authenticateToken, async (req, res) => {
  try {
    // Chief roles can only see their own division's PPMP
    const chiefRoles = ['chief_fad', 'chief_wrsd', 'chief_mwpsd', 'chief_mwptd'];
    const userRoles = [req.user.role, req.user.secondary_role].filter(Boolean);
    const isChief = userRoles.some(r => chiefRoles.includes(r));
    
    let query = `SELECT pp.*, d.name as department_name, d.code as department_code,
              u.username as created_by_name,
              au.username as approved_by_name,
              cu.username as chief_approver_name,
              hu.username as hope_approver_name,
              it.name as item_name, it.unit as item_unit, it.unit_price as item_unit_price,
              it.category as item_category, it.description as item_description_detail,
              it.procurement_source as item_procurement_source,
              pp.item_description, pp.section as section
       FROM procurementplans pp
       LEFT JOIN departments d ON pp.dept_id = d.id
       LEFT JOIN users u ON pp.created_by = u.id
       LEFT JOIN users au ON pp.approved_by = au.id
       LEFT JOIN users cu ON pp.approved_by_chief = cu.id
       LEFT JOIN users hu ON pp.approved_by_hope = hu.id
       LEFT JOIN items it ON pp.item_id = it.id`;
    const params = [];
    const conditions = [];
    
    // If dept_id filter is passed via query param, use it
    if (req.query.dept_id) {
      params.push(req.query.dept_id);
      conditions.push(`pp.dept_id = $${params.length}`);
    } else if (isChief && req.user.dept_id) {
      // Chiefs only see their own division
      params.push(req.user.dept_id);
      conditions.push(`pp.dept_id = $${params.length}`);
    }

    // Fiscal year filter
    if (req.query.fiscal_year) {
      params.push(req.query.fiscal_year);
      conditions.push(`pp.fiscal_year = $${params.length}`);
    }

    // Procurement mode filter
    if (req.query.procurement_mode) {
      params.push(req.query.procurement_mode);
      conditions.push(`pp.procurement_mode = $${params.length}`);
    }

    // Procurement source filter (PS-DBM, NON PS-DBM, PAPs)
    if (req.query.procurement_source) {
      params.push(req.query.procurement_source);
      conditions.push(`pp.procurement_source = $${params.length}`);
    }

    // Only return PPMP line items (with ppmp_no) unless explicitly requesting all
    if (req.query.ppmp_only !== 'false') {
      conditions.push(`pp.ppmp_no IS NOT NULL`);
    }

    // Exclude soft-deleted unless explicitly requesting them
    if (req.query.include_deleted !== 'true') {
      conditions.push(`(pp.is_deleted = false OR pp.is_deleted IS NULL)`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }
    
    query += ` ORDER BY pp.section ASC NULLS LAST, pp.category ASC NULLS LAST, pp.ppmp_no ASC, pp.created_at DESC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/plans/:id', authenticateToken, async (req, res) => {
  try {
    const plan = await pool.query(
      `SELECT pp.*, d.name as department_name, d.code as department_code,
              it.name as item_name, it.unit as item_unit, it.unit_price as item_unit_price,
              it.category as item_category, it.description as item_description_detail
       FROM procurementplans pp 
       LEFT JOIN departments d ON pp.dept_id = d.id 
       LEFT JOIN items it ON pp.item_id = it.id
       WHERE pp.id = $1`,
      [req.params.id]
    );
    if (plan.rows.length === 0) return res.status(404).json({ error: 'Plan not found' });
    const items = await pool.query('SELECT * FROM plan_items WHERE plan_id = $1 ORDER BY id', [req.params.id]);
    res.json({ ...plan.rows[0], items: items.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/plans', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { dept_id, fiscal_year, status, remarks, total_amount, items,
            ppmp_no, description, project_type, quantity_size, procurement_mode,
            pre_procurement, start_date, end_date, delivery_period, fund_source,
            category, item_id, section, item_description, procurement_source } = req.body;

    const deptId = dept_id || req.user.dept_id;
    const fy = fiscal_year || new Date().getFullYear();

    // Auto-generate PPMP number or validate uniqueness of provided one
    let finalPpmpNo = ppmp_no;
    const deptResult2 = deptId ? await client.query('SELECT code FROM departments WHERE id = $1', [deptId]) : { rows: [] };
    const deptCode2 = deptResult2.rows.length > 0 ? deptResult2.rows[0].code : 'DMW';
    const autoPrefix = `PPMP-${deptCode2}-${fy}-`;

    if (finalPpmpNo) {
      // Check if provided ppmp_no already exists — if so, regenerate
      const dupCheck = await client.query('SELECT id FROM procurementplans WHERE ppmp_no = $1', [finalPpmpNo]);
      if (dupCheck.rows.length > 0) {
        const seqResult = await client.query(
          `SELECT COALESCE(MAX(CAST(SUBSTRING(ppmp_no FROM LENGTH($1)+1) AS INTEGER)), 0) as max_seq
           FROM procurementplans WHERE ppmp_no LIKE $2`,
          [autoPrefix, autoPrefix + '%']
        );
        finalPpmpNo = autoPrefix + String((seqResult.rows[0].max_seq || 0) + 1).padStart(3, '0');
      }
    } else if (deptId) {
      const seqResult = await client.query(
        `SELECT COALESCE(MAX(CAST(SUBSTRING(ppmp_no FROM LENGTH($1)+1) AS INTEGER)), 0) as max_seq
         FROM procurementplans WHERE ppmp_no LIKE $2`,
        [autoPrefix, autoPrefix + '%']
      );
      finalPpmpNo = autoPrefix + String((seqResult.rows[0].max_seq || 0) + 1).padStart(3, '0');
    }

    const planResult = await client.query(
      `INSERT INTO procurementplans (dept_id, fiscal_year, status, remarks, total_amount, created_by,
        ppmp_no, description, project_type, quantity_size, procurement_mode, pre_procurement, start_date, end_date, delivery_period, fund_source,
        category, item_id, section, item_description, procurement_source) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING *`,
      [deptId, fy, status || 'draft', remarks, total_amount || 0, req.user.id,
       finalPpmpNo, description, project_type || 'Goods', quantity_size, procurement_mode || 'Small Value Procurement',
       pre_procurement || 'NO', start_date, end_date, delivery_period, fund_source || 'GAA',
       category || null, item_id || null, section || 'GENERAL PROCUREMENT', item_description || null, procurement_source || 'NON PS-DBM']
    );
    const plan = planResult.rows[0];
    if (items && items.length > 0) {
      for (const item of items) {
        await client.query(
          `INSERT INTO plan_items (plan_id, item_code, item_name, item_description, unit, unit_price, category, q1_qty, q2_qty, q3_qty, q4_qty, remarks)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [plan.id, item.item_code, item.item_name, item.item_description, item.unit, item.unit_price || 0, item.category, item.q1_qty||0, item.q2_qty||0, item.q3_qty||0, item.q4_qty||0, item.remarks]
        );
      }
    }
    await client.query('COMMIT');
    res.status(201).json(plan);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

// Batch create multiple PPMP entries at once
app.post('/api/plans/batch', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { entries } = req.body;
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'No entries provided' });
    }

    const createdIds = [];
    for (const entry of entries) {
      const { dept_id, fiscal_year, status, remarks, total_amount,
              ppmp_no, description, project_type, quantity_size, procurement_mode,
              pre_procurement, start_date, end_date, delivery_period, fund_source,
              category, item_id, section, item_description, procurement_source } = entry;

      const deptId = dept_id || req.user.dept_id;
      const fy = fiscal_year || new Date().getFullYear();

      // Auto-generate PPMP number or validate uniqueness
      let finalPpmpNo = ppmp_no;
      const deptResultB = deptId ? await client.query('SELECT code FROM departments WHERE id = $1', [deptId]) : { rows: [] };
      const deptCodeB = deptResultB.rows.length > 0 ? deptResultB.rows[0].code : 'DMW';
      const batchPrefix = `PPMP-${deptCodeB}-${fy}-`;

      if (finalPpmpNo) {
        // Check if provided ppmp_no already exists — if so, regenerate
        const dupCheck = await client.query('SELECT id FROM procurementplans WHERE ppmp_no = $1', [finalPpmpNo]);
        if (dupCheck.rows.length > 0) {
          const seqResult = await client.query(
            `SELECT COALESCE(MAX(CAST(SUBSTRING(ppmp_no FROM LENGTH($1)+1) AS INTEGER)), 0) as max_seq
             FROM procurementplans WHERE ppmp_no LIKE $2`,
            [batchPrefix, batchPrefix + '%']
          );
          finalPpmpNo = batchPrefix + String((seqResult.rows[0].max_seq || 0) + 1 + createdIds.length).padStart(3, '0');
        }
      } else if (deptId) {
        const seqResult = await client.query(
          `SELECT COALESCE(MAX(CAST(SUBSTRING(ppmp_no FROM LENGTH($1)+1) AS INTEGER)), 0) as max_seq
           FROM procurementplans WHERE ppmp_no LIKE $2`,
          [batchPrefix, batchPrefix + '%']
        );
        finalPpmpNo = batchPrefix + String((seqResult.rows[0].max_seq || 0) + 1 + createdIds.length).padStart(3, '0');
      }

      const planResult = await client.query(
        `INSERT INTO procurementplans (dept_id, fiscal_year, status, remarks, total_amount, created_by,
          ppmp_no, description, project_type, quantity_size, procurement_mode, pre_procurement, start_date, end_date, delivery_period, fund_source,
          category, item_id, section, item_description, procurement_source) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING id`,
        [deptId, fy, status || 'pending', remarks, total_amount || 0, req.user.id,
         finalPpmpNo, description, project_type || 'Goods', quantity_size, procurement_mode || 'Small Value Procurement',
         pre_procurement || 'NO', start_date, end_date, delivery_period, fund_source || 'GAA',
         category || null, item_id || null, section || 'GENERAL PROCUREMENT', item_description || null, procurement_source || 'NON PS-DBM']
      );
      createdIds.push(planResult.rows[0].id);
    }

    await client.query('COMMIT');
    res.status(201).json({ count: createdIds.length, ids: createdIds });
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.put('/api/plans/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { dept_id, fiscal_year, status, remarks, total_amount, items,
            ppmp_no, description, project_type, quantity_size, procurement_mode,
            pre_procurement, start_date, end_date, delivery_period, fund_source,
            category, item_id, section, item_description, procurement_source } = req.body;
    const result = await client.query(
      `UPDATE procurementplans SET dept_id=$1, fiscal_year=$2, status=$3, remarks=$4, total_amount=$5,
        ppmp_no=$7, description=$8, project_type=$9, quantity_size=$10, procurement_mode=$11,
        pre_procurement=$12, start_date=$13, end_date=$14, delivery_period=$15, fund_source=$16,
        category=$17, item_id=$18, section=$19, item_description=$20, procurement_source=$21,
        updated_at=CURRENT_TIMESTAMP
       WHERE id=$6 RETURNING *`,
      [dept_id, fiscal_year, status, remarks, total_amount, req.params.id,
       ppmp_no, description, project_type, quantity_size, procurement_mode,
       pre_procurement, start_date, end_date, delivery_period, fund_source,
       category || null, item_id || null, section || 'GENERAL PROCUREMENT', item_description || null, procurement_source || 'NON PS-DBM']
    );
    if (items) {
      await client.query('DELETE FROM plan_items WHERE plan_id = $1', [req.params.id]);
      for (const item of items) {
        await client.query(
          `INSERT INTO plan_items (plan_id, item_code, item_name, item_description, unit, unit_price, category, q1_qty, q2_qty, q3_qty, q4_qty, remarks)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [req.params.id, item.item_code, item.item_name, item.item_description, item.unit, item.unit_price||0, item.category, item.q1_qty||0, item.q2_qty||0, item.q3_qty||0, item.q4_qty||0, item.remarks]
        );
      }
    }
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.delete('/api/plans/:id', authenticateToken, async (req, res) => {
  try {
    const reason = req.body?.reason || 'Removed by user';
    // Soft-delete: mark as deleted but keep the record for budget tracking
    const result = await pool.query(
      `UPDATE procurementplans SET is_deleted = true, deleted_at = NOW(), deleted_reason = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id, reason]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Plan not found' });
    const plan = result.rows[0];
    res.json({ 
      message: 'Plan removed — budget of ₱' + parseFloat(plan.total_amount).toLocaleString('en-PH', {minimumFractionDigits:2}) + ' is now available for reallocation.',
      freed_budget: parseFloat(plan.total_amount)
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Restore a soft-deleted plan
app.put('/api/plans/:id/restore', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE procurementplans SET is_deleted = false, deleted_at = NULL, deleted_reason = NULL, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Plan not found' });
    res.json({ message: 'Plan restored successfully', plan: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Approve a PPMP (dual approval: HOPE + Chief FAD)
app.put('/api/plans/:id/approve', authenticateToken, async (req, res) => {
  try {
    const userRoles = [req.user.role, req.user.secondary_role].filter(Boolean);
    const userId = req.user.id;
    
    // Only chief_fad and hope can approve
    if (!userRoles.some(r => ['chief_fad', 'hope', 'admin'].includes(r))) {
      return res.status(403).json({ error: 'Only HOPE and Chief FAD can approve PPMPs' });
    }
    // Determine effective role for approval (prefer chief_fad or hope over admin)
    const userRole = userRoles.find(r => ['chief_fad', 'hope'].includes(r)) || userRoles.find(r => r === 'admin') || userRoles[0];

    // Get current plan
    const plan = await pool.query('SELECT * FROM procurementplans WHERE id = $1', [req.params.id]);
    if (plan.rows.length === 0) return res.status(404).json({ error: 'Plan not found' });
    
    const p = plan.rows[0];
    if (p.status === 'approved') return res.status(400).json({ error: 'PPMP is already fully approved' });

    let updateFields = [];
    let updateValues = [];
    let paramIdx = 1;

    if (userRole === 'chief_fad' || (userRole === 'admin')) {
      if (p.approved_by_chief && userRole !== 'admin') {
        return res.status(400).json({ error: 'Already approved by Chief FAD' });
      }
      updateFields.push(`approved_by_chief = $${paramIdx++}`);
      updateValues.push(userId);
      updateFields.push(`chief_approved_at = $${paramIdx++}`);
      updateValues.push(new Date());
    }

    if (userRole === 'hope' || (userRole === 'admin')) {
      if (p.approved_by_hope && userRole !== 'admin') {
        return res.status(400).json({ error: 'Already approved by HOPE' });
      }
      updateFields.push(`approved_by_hope = $${paramIdx++}`);
      updateValues.push(userId);
      updateFields.push(`hope_approved_at = $${paramIdx++}`);
      updateValues.push(new Date());
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(req.params.id);

    await pool.query(
      `UPDATE procurementplans SET ${updateFields.join(', ')} WHERE id = $${paramIdx}`,
      updateValues
    );

    // Check if both approvals are now present
    const updated = await pool.query('SELECT * FROM procurementplans WHERE id = $1', [req.params.id]);
    const up = updated.rows[0];
    
    if (up.approved_by_chief && up.approved_by_hope) {
      // Both approved — set status to approved
      await pool.query(
        `UPDATE procurementplans SET status = 'approved', approved_by = $1, approved_at = NOW(), updated_at = NOW() WHERE id = $2`,
        [userId, req.params.id]
      );
      const final = await pool.query(
        `SELECT pp.*, u1.username as chief_approver_name, u2.username as hope_approver_name
         FROM procurementplans pp
         LEFT JOIN users u1 ON pp.approved_by_chief = u1.id
         LEFT JOIN users u2 ON pp.approved_by_hope = u2.id
         WHERE pp.id = $1`, [req.params.id]
      );
      return res.json({ message: 'PPMP fully approved! Both HOPE and Chief FAD have approved.', status: 'approved', plan: final.rows[0] });
    }

    // Only one approval so far
    const partial = await pool.query(
      `SELECT pp.*, u1.username as chief_approver_name, u2.username as hope_approver_name
       FROM procurementplans pp
       LEFT JOIN users u1 ON pp.approved_by_chief = u1.id
       LEFT JOIN users u2 ON pp.approved_by_hope = u2.id
       WHERE pp.id = $1`, [req.params.id]
    );
    const whoApproved = userRole === 'chief_fad' ? 'Chief FAD' : userRole === 'hope' ? 'HOPE' : 'Admin';
    const whoRemains = up.approved_by_chief ? 'HOPE' : 'Chief FAD';
    res.json({ message: `Approved by ${whoApproved}. Awaiting approval from ${whoRemains}.`, status: 'pending', plan: partial.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET all plan items across all plans (for the APP page)
// Returns PPMP entries from procurementplans directly, with codes transformed to APP codes
app.get('/api/plan-items', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pp.id, pp.ppmp_no,
              REPLACE(pp.ppmp_no, 'PPMP-', 'APP-') as item_code,
              pp.description as item_name,
              pp.description as item_description,
              'lot' as unit,
              pp.total_amount as unit_price,
              pp.total_amount as total_price,
              1 as total_qty,
              pp.project_type as category,
              pp.procurement_mode,
              pp.procurement_source,
              pp.fund_source,
              pp.fiscal_year,
              pp.status as plan_status,
              pp.dept_id,
              pp.remarks,
              pp.start_date, pp.end_date,
              d.name as department_name,
              d.code as department_code
       FROM procurementplans pp
       LEFT JOIN departments d ON pp.dept_id = d.id
       WHERE pp.ppmp_no IS NOT NULL AND (pp.is_deleted = false OR pp.is_deleted IS NULL) AND pp.status = 'approved'
       ORDER BY pp.id`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET removed/deleted plan items (for Available Budget tracking)
app.get('/api/plan-items/removed', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pp.id, pp.ppmp_no,
              REPLACE(pp.ppmp_no, 'PPMP-', 'APP-') as item_code,
              pp.description as item_name,
              pp.description as item_description,
              pp.total_amount,
              pp.project_type as category,
              pp.procurement_mode,
              pp.fiscal_year,
              pp.deleted_at, pp.deleted_reason,
              pp.dept_id,
              d.name as department_name,
              d.code as department_code
       FROM procurementplans pp
       LEFT JOIN departments d ON pp.dept_id = d.id
       WHERE pp.ppmp_no IS NOT NULL AND pp.is_deleted = true
       ORDER BY pp.deleted_at DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET APP budget summary (total allocated, active, available)
app.get('/api/app-budget-summary', authenticateToken, async (req, res) => {
  try {
    const fy = req.query.fiscal_year || new Date().getFullYear();
    const result = await pool.query(
      `SELECT 
        COALESCE(SUM(total_amount), 0) as total_budget,
        COALESCE(SUM(CASE WHEN is_deleted = false OR is_deleted IS NULL THEN total_amount ELSE 0 END), 0) as active_budget,
        COALESCE(SUM(CASE WHEN is_deleted = true THEN total_amount ELSE 0 END), 0) as available_budget,
        COUNT(*) FILTER (WHERE is_deleted = false OR is_deleted IS NULL) as active_count,
        COUNT(*) FILTER (WHERE is_deleted = true) as removed_count
       FROM procurementplans
       WHERE ppmp_no IS NOT NULL AND fiscal_year = $1 AND status = 'approved'`,
      [fy]
    );
    // Department breakdown
    const deptResult = await pool.query(
      `SELECT d.code as department_code, d.name as department_name,
              COALESCE(SUM(pp.total_amount), 0) as total,
              COALESCE(SUM(CASE WHEN pp.is_deleted = false OR pp.is_deleted IS NULL THEN pp.total_amount ELSE 0 END), 0) as active,
              COALESCE(SUM(CASE WHEN pp.is_deleted = true THEN pp.total_amount ELSE 0 END), 0) as available,
              COUNT(*) FILTER (WHERE pp.is_deleted = false OR pp.is_deleted IS NULL) as active_count,
              COUNT(*) FILTER (WHERE pp.is_deleted = true) as removed_count
       FROM procurementplans pp
       LEFT JOIN departments d ON pp.dept_id = d.id
       WHERE pp.ppmp_no IS NOT NULL AND pp.fiscal_year = $1 AND pp.status = 'approved'
       GROUP BY d.code, d.name ORDER BY d.code`,
      [fy]
    );
    res.json({ ...result.rows[0], by_department: deptResult.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST consolidate PPMP into APP
// This just returns summary since APP now reads directly from procurementplans
app.post('/api/plan-items/consolidate', authenticateToken, async (req, res) => {
  try {
    const fiscalYear = req.body.fiscal_year || new Date().getFullYear();
    
    // Get all active (non-deleted) PPMP entries for this fiscal year
    const result = await pool.query(
      `SELECT COUNT(*) as item_count, 
              COALESCE(SUM(pp.total_amount), 0) as total_abc
       FROM procurementplans pp
       WHERE pp.ppmp_no IS NOT NULL AND pp.fiscal_year = $1 AND (pp.is_deleted = false OR pp.is_deleted IS NULL) AND pp.status = 'approved'`,
      [fiscalYear]
    );

    // Get total including deleted (original approved budget)
    const totalResult = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total_approved,
              COALESCE(SUM(CASE WHEN is_deleted = true THEN total_amount ELSE 0 END), 0) as available_budget
       FROM procurementplans WHERE ppmp_no IS NOT NULL AND fiscal_year = $1 AND status = 'approved'`,
      [fiscalYear]
    );

    // Get breakdown by department
    const deptBreakdown = await pool.query(
      `SELECT d.name as department_name, COUNT(*) as count, 
              COALESCE(SUM(pp.total_amount), 0) as total
       FROM procurementplans pp
       LEFT JOIN departments d ON pp.dept_id = d.id
       WHERE pp.ppmp_no IS NOT NULL AND pp.fiscal_year = $1 AND (pp.is_deleted = false OR pp.is_deleted IS NULL)
       GROUP BY d.name ORDER BY d.name`,
      [fiscalYear]
    );

    res.json({
      message: `APP consolidated from ${result.rows[0].item_count} active PPMP entries for FY ${fiscalYear}.`,
      created: 0,
      total_items: parseInt(result.rows[0].item_count),
      total_abc: parseFloat(result.rows[0].total_abc),
      total_approved: parseFloat(totalResult.rows[0].total_approved),
      available_budget: parseFloat(totalResult.rows[0].available_budget),
      by_department: deptBreakdown.rows
    });
  } catch (err) {
    console.error('Consolidation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// PAP (Programs, Activities & Projects) MANAGEMENT
// ==============================================================================

// GET all PAPs
app.get('/api/paps', authenticateToken, async (req, res) => {
  try {
    let query = `SELECT p.*, d.name as department_name, d.code as department_code,
                        u.username as created_by_name,
                        COALESCE((SELECT SUM(pi.total_amount) FROM pap_items pi WHERE pi.pap_id = p.id), 0) as items_total,
                        COALESCE((SELECT COUNT(*) FROM pap_items pi WHERE pi.pap_id = p.id), 0) as item_count
                 FROM paps p
                 LEFT JOIN departments d ON p.dept_id = d.id
                 LEFT JOIN users u ON p.created_by = u.id`;
    const params = [];
    const conditions = [];

    if (req.query.dept_id) {
      params.push(req.query.dept_id);
      conditions.push(`p.dept_id = $${params.length}`);
    }
    if (req.query.fiscal_year) {
      params.push(req.query.fiscal_year);
      conditions.push(`p.fiscal_year = $${params.length}`);
    }
    if (req.query.status) {
      params.push(req.query.status);
      conditions.push(`p.status = $${params.length}`);
    }
    // Exclude soft-deleted
    conditions.push(`(p.is_deleted = false OR p.is_deleted IS NULL)`);

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }
    query += ` ORDER BY p.created_at DESC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET single PAP with items
app.get('/api/paps/:id', authenticateToken, async (req, res) => {
  try {
    const pap = await pool.query(
      `SELECT p.*, d.name as department_name, d.code as department_code, u.username as created_by_name
       FROM paps p
       LEFT JOIN departments d ON p.dept_id = d.id
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = $1`, [req.params.id]
    );
    if (pap.rows.length === 0) return res.status(404).json({ error: 'PAP not found' });

    const items = await pool.query(
      `SELECT pi.*, it.name as catalog_item_name, it.code as catalog_item_code,
              it.category as catalog_category, it.unit as catalog_unit, it.unit_price as catalog_unit_price,
              it.procurement_source as catalog_procurement_source
       FROM pap_items pi
       LEFT JOIN items it ON pi.item_id = it.id
       WHERE pi.pap_id = $1 ORDER BY pi.id`, [req.params.id]
    );
    res.json({ ...pap.rows[0], items: items.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREATE PAP
app.post('/api/paps', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { pap_name, description, dept_id, fiscal_year, estimated_budget, account_code,
            quarter, mop, centralize, period_jan, period_feb, period_mar, period_apr,
            period_may, period_jun, period_jul, period_aug, period_sep, period_oct,
            period_nov, period_dec, items } = req.body;

    if (!pap_name) return res.status(400).json({ error: 'PAP Name is required' });

    const deptId = dept_id || req.user.dept_id;
    const fy = fiscal_year || new Date().getFullYear();

    // Auto-generate PAP code: PAP-{DEPT}-{YEAR}-{SEQ}
    let papCode = null;
    if (deptId) {
      const deptResult = await client.query('SELECT code FROM departments WHERE id = $1', [deptId]);
      const deptCode = deptResult.rows.length > 0 ? deptResult.rows[0].code : 'DMW';
      const prefix = `PAP-${deptCode}-${fy}-`;
      const seqResult = await client.query(
        `SELECT COALESCE(MAX(CAST(SUBSTRING(pap_code FROM LENGTH($1)+1) AS INTEGER)), 0) as max_seq
         FROM paps WHERE pap_code LIKE $2`,
        [prefix, prefix + '%']
      );
      const nextSeq = String((seqResult.rows[0].max_seq || 0) + 1).padStart(3, '0');
      papCode = prefix + nextSeq;
    }

    const papResult = await client.query(
      `INSERT INTO paps (pap_code, pap_name, description, dept_id, fiscal_year, estimated_budget,
        account_code, quarter, mop, centralize, period_jan, period_feb, period_mar, period_apr,
        period_may, period_jun, period_jul, period_aug, period_sep, period_oct, period_nov,
        period_dec, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
       RETURNING *`,
      [papCode, pap_name, description || pap_name, deptId, fy, estimated_budget || 0,
       account_code || null, quarter || 0, mop || null, centralize || false,
       period_jan || false, period_feb || false, period_mar || false, period_apr || false,
       period_may || false, period_jun || false, period_jul || false, period_aug || false,
       period_sep || false, period_oct || false, period_nov || false, period_dec || false,
       req.user.id]
    );
    const pap = papResult.rows[0];

    // Insert PAP items if provided
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        await client.query(
          `INSERT INTO pap_items (pap_id, item_id, item_code, product_category, account_code,
            product_description, available_at, quantity, uom, unit_price, total_amount,
            procurement_source, remarks)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          [pap.id, item.item_id || null, item.item_code || null, item.product_category || null,
           item.account_code || null, item.product_description || null, item.available_at || null,
           item.quantity || 0, item.uom || null, item.unit_price || 0,
           item.total_amount || (parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)),
           item.procurement_source || 'PAPs', item.remarks || null]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json(pap);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

// UPDATE PAP
app.put('/api/paps/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { pap_name, description, dept_id, fiscal_year, estimated_budget, account_code,
            quarter, mop, centralize, period_jan, period_feb, period_mar, period_apr,
            period_may, period_jun, period_jul, period_aug, period_sep, period_oct,
            period_nov, period_dec, status, items } = req.body;

    const result = await client.query(
      `UPDATE paps SET pap_name=$1, description=$2, dept_id=$3, fiscal_year=$4, estimated_budget=$5,
        account_code=$6, quarter=$7, mop=$8, centralize=$9,
        period_jan=$10, period_feb=$11, period_mar=$12, period_apr=$13,
        period_may=$14, period_jun=$15, period_jul=$16, period_aug=$17,
        period_sep=$18, period_oct=$19, period_nov=$20, period_dec=$21,
        status=COALESCE($22, status), updated_at=CURRENT_TIMESTAMP
       WHERE id=$23 RETURNING *`,
      [pap_name, description, dept_id, fiscal_year, estimated_budget || 0,
       account_code || null, quarter || 0, mop || null, centralize || false,
       period_jan || false, period_feb || false, period_mar || false, period_apr || false,
       period_may || false, period_jun || false, period_jul || false, period_aug || false,
       period_sep || false, period_oct || false, period_nov || false, period_dec || false,
       status || null, req.params.id]
    );
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'PAP not found' });
    }

    // Replace items if provided — UPSERT to preserve existing pap_items.id
    if (items && Array.isArray(items)) {
      // Get existing item IDs for this PAP
      const existingRes = await client.query('SELECT id FROM pap_items WHERE pap_id = $1', [req.params.id]);
      const existingIds = new Set(existingRes.rows.map(r => r.id));
      const incomingIds = new Set();

      for (const item of items) {
        if (item.id && existingIds.has(item.id)) {
          // UPDATE existing item
          incomingIds.add(item.id);
          await client.query(
            `UPDATE pap_items SET item_id=$1, item_code=$2, product_category=$3, account_code=$4,
              product_description=$5, available_at=$6, quantity=$7, uom=$8, unit_price=$9,
              total_amount=$10, procurement_source=$11, remarks=$12
             WHERE id=$13 AND pap_id=$14`,
            [item.item_id || null, item.item_code || null, item.product_category || null,
             item.account_code || null, item.product_description || null, item.available_at || null,
             item.quantity || 0, item.uom || null, item.unit_price || 0,
             item.total_amount || (parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)),
             item.procurement_source || 'PAPs', item.remarks || null, item.id, req.params.id]
          );
        } else {
          // INSERT new item
          await client.query(
            `INSERT INTO pap_items (pap_id, item_id, item_code, product_category, account_code,
              product_description, available_at, quantity, uom, unit_price, total_amount,
              procurement_source, remarks)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
            [req.params.id, item.item_id || null, item.item_code || null, item.product_category || null,
             item.account_code || null, item.product_description || null, item.available_at || null,
             item.quantity || 0, item.uom || null, item.unit_price || 0,
             item.total_amount || (parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)),
             item.procurement_source || 'PAPs', item.remarks || null]
          );
        }
      }

      // DELETE items that were removed (exist in DB but not in incoming)
      for (const existId of existingIds) {
        if (!incomingIds.has(existId)) {
          await client.query('DELETE FROM pap_items WHERE id = $1 AND pap_id = $2', [existId, req.params.id]);
        }
      }
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

// DELETE PAP (soft-delete)
app.delete('/api/paps/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE paps SET is_deleted = true, deleted_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'PAP not found' });
    res.json({ message: 'PAP removed successfully', pap: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// UPDATE PAP MOP (Mode of Procurement)
app.put('/api/paps/:id/mop', authenticateToken, async (req, res) => {
  try {
    const { mop } = req.body;
    const result = await pool.query(
      `UPDATE paps SET mop = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [mop, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'PAP not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ADD item to PAP
app.post('/api/paps/:id/items', authenticateToken, async (req, res) => {
  try {
    const { item_id, item_code, product_category, account_code, product_description,
            available_at, quantity, uom, unit_price, total_amount, procurement_source, remarks } = req.body;
    const result = await pool.query(
      `INSERT INTO pap_items (pap_id, item_id, item_code, product_category, account_code,
        product_description, available_at, quantity, uom, unit_price, total_amount,
        procurement_source, remarks)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [req.params.id, item_id || null, item_code || null, product_category || null,
       account_code || null, product_description || null, available_at || null,
       quantity || 0, uom || null, unit_price || 0,
       total_amount || (parseFloat(quantity || 0) * parseFloat(unit_price || 0)),
       procurement_source || 'NON PS-DBM', remarks || null]
    );
    // Update PAP estimated_budget
    await pool.query(
      `UPDATE paps SET estimated_budget = COALESCE((SELECT SUM(total_amount) FROM pap_items WHERE pap_id = $1), 0),
        updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [req.params.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE item from PAP
app.delete('/api/paps/:papId/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM pap_items WHERE id = $1 AND pap_id = $2 RETURNING *',
      [req.params.itemId, req.params.papId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'PAP item not found' });
    // Update PAP estimated_budget
    await pool.query(
      `UPDATE paps SET estimated_budget = COALESCE((SELECT SUM(total_amount) FROM pap_items WHERE pap_id = $1), 0),
        updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [req.params.papId]
    );
    res.json({ message: 'PAP item removed', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// APP SETTINGS (version tracking)
// ==============================================================================

app.get('/api/app-settings/:year', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.full_name as set_by_name FROM app_settings s LEFT JOIN users u ON s.set_by = u.id WHERE s.fiscal_year = $1`,
      [req.params.year]
    );
    if (result.rows.length === 0) {
      return res.json({ fiscal_year: parseInt(req.params.year), app_type: 'indicative', update_count: 0, remarks: '' });
    }
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/app-settings/:year', authenticateToken, async (req, res) => {
  try {
    const { app_type, remarks } = req.body;
    const year = parseInt(req.params.year);
    // If setting to 'updated', increment count; otherwise reset to 0
    let updateCount = 0;
    if (app_type === 'updated') {
      const existing = await pool.query('SELECT update_count FROM app_settings WHERE fiscal_year = $1', [year]);
      updateCount = existing.rows.length > 0 ? (parseInt(existing.rows[0].update_count) || 0) + 1 : 1;
    }
    const result = await pool.query(
      `INSERT INTO app_settings (fiscal_year, app_type, update_count, set_by, set_at, remarks)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
       ON CONFLICT (fiscal_year) DO UPDATE SET
         app_type = EXCLUDED.app_type,
         update_count = CASE WHEN EXCLUDED.app_type = 'updated' THEN app_settings.update_count + 1 ELSE 0 END,
         set_by = EXCLUDED.set_by,
         set_at = CURRENT_TIMESTAMP,
         remarks = EXCLUDED.remarks
       RETURNING *`,
      [year, app_type, updateCount, req.user.id, remarks || '']
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// PURCHASE REQUESTS
// ==============================================================================

app.get('/api/purchase-requests', authenticateToken, async (req, res) => {
  try {
    const userRoles = [req.user.role, req.user.secondary_role].filter(Boolean);
    const canSeeAllDrafts = userRoles.some(r => ['admin', 'hope'].includes(r));
    const result = await pool.query(
      `SELECT pr.*, d.name as department_name, d.code as department_code, u.username as requested_by_name,
              pri.quantity as item_quantity, pri.unit as item_unit, pri.unit_price as item_unit_price,
              pri.item_name as first_item_name, pri.item_description as first_item_description,
              (SELECT COUNT(*) FROM pr_items WHERE pr_id = pr.id) as item_count
       FROM purchaserequests pr
       LEFT JOIN departments d ON pr.dept_id = d.id
       LEFT JOIN users u ON pr.requested_by = u.id
       LEFT JOIN LATERAL (SELECT * FROM pr_items WHERE pr_id = pr.id ORDER BY id LIMIT 1) pri ON true
       WHERE (pr.status != 'draft' OR pr.requested_by = $1 OR $2 = true)
       ORDER BY pr.created_at DESC`,
      [req.user.id, canSeeAllDrafts]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/purchase-requests/:id', authenticateToken, async (req, res) => {
  try {
    const pr = await pool.query(
      `SELECT pr.*, d.name as department_name, d.code as department_code,
              u1.full_name as requested_by_name,
              u2.full_name as approved_by_name,
              -- "Requested by" signatory: WRSD uses their own chief, all others use FAD chief (ESPALDON)
              CASE WHEN d.code = 'WRSD'
                THEN wrsd_chief.full_name
                ELSE fad_chief.full_name
              END as chief_name,
              CASE WHEN d.code = 'WRSD'
                THEN wrsd_desig.name
                ELSE fad_desig.name
              END as chief_designation,
              hope_user.full_name as hope_name,
              hope_desig.name as hope_designation
       FROM purchaserequests pr
       LEFT JOIN departments d ON pr.dept_id = d.id
       LEFT JOIN users u1 ON pr.requested_by = u1.id
       LEFT JOIN users u2 ON pr.approved_by = u2.id
       -- FAD chief (ESPALDON) for FAD/MWPSD/MWPTD
       LEFT JOIN departments fad_dept ON fad_dept.code = 'FAD'
       LEFT JOIN users fad_chief ON fad_chief.dept_id = fad_dept.id AND fad_chief.role LIKE 'chief_%'
       LEFT JOIN employees fad_emp ON fad_chief.employee_id = fad_emp.id
       LEFT JOIN designations fad_desig ON fad_emp.designation_id = fad_desig.id
       -- WRSD chief (MAKINANO) for WRSD only
       LEFT JOIN departments wrsd_dept ON wrsd_dept.code = 'WRSD'
       LEFT JOIN users wrsd_chief ON wrsd_chief.dept_id = wrsd_dept.id AND wrsd_chief.role LIKE 'chief_%'
       LEFT JOIN employees wrsd_emp ON wrsd_chief.employee_id = wrsd_emp.id
       LEFT JOIN designations wrsd_desig ON wrsd_emp.designation_id = wrsd_desig.id
       -- HOPE (Approved by)
       LEFT JOIN users hope_user ON hope_user.role = 'hope'
       LEFT JOIN employees hope_emp ON hope_user.employee_id = hope_emp.id
       LEFT JOIN designations hope_desig ON hope_emp.designation_id = hope_desig.id
       WHERE pr.id = $1`,
      [req.params.id]
    );
    if (pr.rows.length === 0) return res.status(404).json({ error: 'PR not found' });
    const items = await pool.query('SELECT * FROM pr_items WHERE pr_id = $1 ORDER BY id', [req.params.id]);
    res.json({ ...pr.rows[0], items: items.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/purchase-requests', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { pr_number, purpose, total_amount, dept_id, status, item_specifications, items } = req.body;
    const deptId = dept_id || req.user.dept_id;
    const fy = new Date().getFullYear();

    // Auto-generate PR number dynamically: PR-{DEPT}-{YEAR}-{SEQ}
    let finalPrNumber = pr_number;
    if (!finalPrNumber || !finalPrNumber.includes('-')) {
      const deptResult = await client.query('SELECT code FROM departments WHERE id = $1', [deptId]);
      const deptCode = deptResult.rows.length > 0 ? deptResult.rows[0].code : 'DMW';
      const prefix = `PR-${deptCode}-${fy}-`;
      const seqResult = await client.query(
        `SELECT COALESCE(MAX(CAST(SUBSTRING(pr_number FROM LENGTH($1)+1) AS INTEGER)), 0) as max_seq
         FROM purchaserequests WHERE pr_number LIKE $2`,
        [prefix, prefix + '%']
      );
      const nextSeq = String((seqResult.rows[0].max_seq || 0) + 1).padStart(3, '0');
      finalPrNumber = prefix + nextSeq;
    }

    const prResult = await client.query(
      `INSERT INTO purchaserequests (pr_number, purpose, total_amount, dept_id, status, requested_by, item_specifications) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [finalPrNumber, purpose, total_amount || 0, deptId, status || 'pending_approval', req.user.id, item_specifications || null]
    );
    const pr = prResult.rows[0];
    if (items && items.length > 0) {
      for (const item of items) {
        await client.query(
          `INSERT INTO pr_items (pr_id, item_code, item_name, item_description, unit, category, quantity, unit_price, remarks)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [pr.id, item.item_code, item.item_name, item.item_description, item.unit, item.category, item.quantity||1, item.unit_price||0, item.remarks]
        );
      }
    }
    await client.query('COMMIT');
    
    // Notify approvers about new PR (skip for drafts)
    if (status !== 'draft') {
      broadcastNotification({
        type: 'approval',
        icon: 'fas fa-file-signature',
        title: `${finalPrNumber} Pending Approval`,
        message: `${purpose || 'New purchase request'} requires your approval`,
        reference_type: 'purchase_request',
        reference_id: pr.id,
        reference_code: finalPrNumber,
        roles: ['admin', 'manager', 'division_head', 'hope']
      });
    }
    
    res.status(201).json(pr);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.put('/api/purchase-requests/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { pr_number, purpose, total_amount, dept_id, status, item_specifications, items } = req.body;
    // Only update dept_id if explicitly provided, otherwise preserve existing value
    let result;
    if (dept_id !== undefined && dept_id !== null) {
      result = await client.query(
        `UPDATE purchaserequests SET pr_number=$1, purpose=$2, total_amount=$3, dept_id=$4, status=$5, item_specifications=$6, updated_at=CURRENT_TIMESTAMP
         WHERE id=$7 RETURNING *`,
        [pr_number, purpose, total_amount, dept_id, status, item_specifications || null, req.params.id]
      );
    } else {
      result = await client.query(
        `UPDATE purchaserequests SET pr_number=$1, purpose=$2, total_amount=$3, status=$4, item_specifications=$5, updated_at=CURRENT_TIMESTAMP
         WHERE id=$6 RETURNING *`,
        [pr_number, purpose, total_amount, status, item_specifications || null, req.params.id]
      );
    }
    if (items) {
      await client.query('DELETE FROM pr_items WHERE pr_id = $1', [req.params.id]);
      for (const item of items) {
        await client.query(
          `INSERT INTO pr_items (pr_id, item_code, item_name, item_description, unit, category, quantity, unit_price, remarks)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [req.params.id, item.item_code, item.item_name, item.item_description, item.unit, item.category, item.quantity||1, item.unit_price||0, item.remarks]
        );
      }
    }
    await client.query('COMMIT');
    const pr = result.rows[0];
    // If status changed to pending_approval (e.g. draft submitted), notify approvers
    if (status === 'pending_approval' && pr) {
      broadcastNotification({
        type: 'approval',
        icon: 'fas fa-file-signature',
        title: `${pr.pr_number} Pending Approval`,
        message: `${purpose || 'Purchase request'} requires your approval`,
        reference_type: 'purchase_request',
        reference_id: pr.id,
        reference_code: pr.pr_number,
        roles: ['admin', 'manager', 'division_head', 'hope']
      });
    }
    res.json(pr);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.put('/api/purchase-requests/:id/approve', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE purchaserequests SET status='approved', approved_by=$1, approved_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP
       WHERE id=$2 RETURNING *`,
      [req.user.id, req.params.id]
    );
    const pr = result.rows[0];
    
    // Notify the requester that their PR was approved
    if (pr && pr.requested_by) {
      createNotification(pr.requested_by, {
        type: 'approval',
        icon: 'fas fa-check-circle',
        title: `${pr.pr_number} Approved`,
        message: 'Your purchase request has been approved',
        reference_type: 'purchase_request',
        reference_id: pr.id,
        reference_code: pr.pr_number
      });
    }
    
    res.json(pr);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/purchase-requests/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM purchaserequests WHERE id = $1', [req.params.id]);
    res.json({ message: 'PR deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/purchase-requests/:id/set-status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query('UPDATE purchaserequests SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'PR not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// RFQ (Request for Quotation)
// ==============================================================================

app.get('/api/rfqs', authenticateToken, async (req, res) => {
  try {
    const userRoles = [req.user.role, req.user.secondary_role].filter(Boolean);
    const canSeeAllDrafts = userRoles.some(r => ['admin', 'hope'].includes(r));
    const result = await pool.query(
      `SELECT r.*, pr.pr_number, u.username as created_by_name,
              pri.quantity as pr_item_quantity, pri.unit as pr_item_unit, pri.item_name as pr_item_name,
              pr.dept_id as pr_dept_id, d.code as department_code
       FROM rfqs r LEFT JOIN purchaserequests pr ON r.pr_id = pr.id
       LEFT JOIN departments d ON pr.dept_id = d.id
       LEFT JOIN users u ON r.created_by = u.id
       LEFT JOIN LATERAL (SELECT quantity, unit, item_name FROM pr_items WHERE pr_id = pr.id ORDER BY id LIMIT 1) pri ON true
       WHERE (r.status != 'draft' OR r.created_by = $1 OR $2 = true)
       ORDER BY r.created_at DESC`,
      [req.user.id, canSeeAllDrafts]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/rfqs/:id', authenticateToken, async (req, res) => {
  try {
    const rfq = await pool.query(
      `SELECT r.*, pr.pr_number FROM rfqs r LEFT JOIN purchaserequests pr ON r.pr_id = pr.id WHERE r.id = $1`, [req.params.id]
    );
    if (rfq.rows.length === 0) return res.status(404).json({ error: 'RFQ not found' });
    const items = await pool.query('SELECT * FROM rfq_items WHERE rfq_id = $1 ORDER BY id', [req.params.id]);
    const suppliers = await pool.query(
      `SELECT rs.*, s.name as supplier_name FROM rfq_suppliers rs LEFT JOIN suppliers s ON rs.supplier_id = s.id WHERE rs.rfq_id = $1`,
      [req.params.id]
    );
    res.json({ ...rfq.rows[0], items: items.rows, suppliers: suppliers.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/rfqs', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rfq_number, pr_id, date_prepared, submission_deadline, abc_amount, philgeps_required, status, item_specifications, items, suppliers } = req.body;
    const rfqResult = await client.query(
      `INSERT INTO rfqs (rfq_number, pr_id, date_prepared, submission_deadline, abc_amount, philgeps_required, status, created_by, item_specifications)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [rfq_number, pr_id, date_prepared, submission_deadline, abc_amount||0, philgeps_required||false, status||'on_going', req.user.id, item_specifications || null]
    );
    const rfq = rfqResult.rows[0];
    if (items) for (const it of items) {
      await client.query(
        `INSERT INTO rfq_items (rfq_id, item_code, item_name, item_description, unit, category, quantity, abc_unit_cost)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [rfq.id, it.item_code, it.item_name, it.item_description, it.unit, it.category, it.quantity||1, it.abc_unit_cost||0]
      );
    }
    if (suppliers) for (const s of suppliers) {
      await client.query(
        'INSERT INTO rfq_suppliers (rfq_id, supplier_id, invited_at) VALUES ($1,$2,$3)',
        [rfq.id, s.supplier_id, s.invited_at || new Date()]
      );
    }
    await client.query('COMMIT');
    res.status(201).json(rfq);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.put('/api/rfqs/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rfq_number, pr_id, date_prepared, submission_deadline, abc_amount, philgeps_required, status, item_specifications, items } = req.body;
    const result = await client.query(
      `UPDATE rfqs SET rfq_number=$1, pr_id=$2, date_prepared=$3, submission_deadline=$4, abc_amount=$5, philgeps_required=$6, status=$7, item_specifications=$8, updated_at=CURRENT_TIMESTAMP
       WHERE id=$9 RETURNING *`,
      [rfq_number, pr_id, date_prepared, submission_deadline, abc_amount, philgeps_required, status, item_specifications||null, req.params.id]
    );
    // Update rfq_items if items array is provided
    if (items && Array.isArray(items)) {
      await client.query('DELETE FROM rfq_items WHERE rfq_id = $1', [req.params.id]);
      for (const it of items) {
        await client.query(
          `INSERT INTO rfq_items (rfq_id, item_code, item_name, item_description, unit, category, quantity, abc_unit_cost)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [req.params.id, it.item_code||'', it.item_name||'', it.item_description||null, it.unit||'', it.category||null, it.quantity||1, it.abc_unit_cost||0]
        );
      }
    }
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.delete('/api/rfqs/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM rfqs WHERE id = $1', [req.params.id]);
    res.json({ message: 'RFQ deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/rfqs/:id/set-status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query('UPDATE rfqs SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'RFQ not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// ABSTRACT OF QUOTATION (AOQ)
// ==============================================================================

app.get('/api/abstracts', authenticateToken, async (req, res) => {
  try {
    const userRoles = [req.user.role, req.user.secondary_role].filter(Boolean);
    const canSeeAllDrafts = userRoles.some(r => ['admin', 'hope'].includes(r));
    const result = await pool.query(
      `SELECT a.*, r.rfq_number, s.name as recommended_supplier_name, u.username as created_by_name,
              pr.dept_id as pr_dept_id, dept.code as department_code
       FROM abstracts a LEFT JOIN rfqs r ON a.rfq_id = r.id
       LEFT JOIN purchaserequests pr ON r.pr_id = pr.id
       LEFT JOIN departments dept ON pr.dept_id = dept.id
       LEFT JOIN suppliers s ON a.recommended_supplier_id = s.id
       LEFT JOIN users u ON a.created_by = u.id
       WHERE (a.status != 'draft' OR a.created_by = $1 OR $2 = true)
       ORDER BY a.created_at DESC`,
      [req.user.id, canSeeAllDrafts]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/abstracts/:id', authenticateToken, async (req, res) => {
  try {
    const abstract = await pool.query('SELECT * FROM abstracts WHERE id = $1', [req.params.id]);
    if (abstract.rows.length === 0) return res.status(404).json({ error: 'Abstract not found' });
    const quotations = await pool.query(
      `SELECT aq.*, s.name as supplier_name FROM abstract_quotations aq LEFT JOIN suppliers s ON aq.supplier_id = s.id WHERE aq.abstract_id = $1 ORDER BY aq.rank_no`,
      [req.params.id]
    );
    for (const q of quotations.rows) {
      const items = await pool.query('SELECT * FROM abstract_quote_items WHERE abstract_quotation_id = $1', [q.id]);
      q.items = items.rows;
    }
    res.json({ ...abstract.rows[0], quotations: quotations.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/abstracts', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { abstract_number, rfq_id, date_prepared, purpose, status, recommended_supplier_id, recommended_amount, item_specifications, quotations } = req.body;
    const absResult = await client.query(
      `INSERT INTO abstracts (abstract_number, rfq_id, date_prepared, purpose, status, recommended_supplier_id, recommended_amount, created_by, item_specifications)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [abstract_number, rfq_id, date_prepared, purpose, status||'on_going', recommended_supplier_id, recommended_amount||0, req.user.id, item_specifications || null]
    );
    const abs = absResult.rows[0];
    if (quotations) for (const q of quotations) {
      const qResult = await client.query(
        `INSERT INTO abstract_quotations (abstract_id, supplier_id, bid_amount, is_compliant, remarks, rank_no) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [abs.id, q.supplier_id, q.bid_amount||0, q.is_compliant||false, q.remarks, q.rank_no]
      );
      if (q.items) for (const it of q.items) {
        await client.query(
          `INSERT INTO abstract_quote_items (abstract_quotation_id, item_description, quantity, unit, unit_price) VALUES ($1,$2,$3,$4,$5)`,
          [qResult.rows[0].id, it.item_description, it.quantity||1, it.unit, it.unit_price||0]
        );
      }
    }
    await client.query('COMMIT');
    res.status(201).json(abs);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.put('/api/abstracts/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { abstract_number, rfq_id, date_prepared, purpose, status, recommended_supplier_id, recommended_amount, item_specifications, quotations } = req.body;
    const result = await client.query(
      `UPDATE abstracts SET abstract_number=$1, rfq_id=$2, date_prepared=$3, purpose=$4, status=$5, recommended_supplier_id=$6, recommended_amount=$7, item_specifications=$8, updated_at=CURRENT_TIMESTAMP
       WHERE id=$9 RETURNING *`,
      [abstract_number, rfq_id, date_prepared, purpose, status, recommended_supplier_id, recommended_amount, item_specifications || null, req.params.id]
    );
    // If quotations are provided, replace existing ones
    if (quotations) {
      // Delete existing quote items first (child), then quotations (parent)
      const existingQuots = await client.query('SELECT id FROM abstract_quotations WHERE abstract_id = $1', [req.params.id]);
      for (const eq of existingQuots.rows) {
        await client.query('DELETE FROM abstract_quote_items WHERE abstract_quotation_id = $1', [eq.id]);
      }
      await client.query('DELETE FROM abstract_quotations WHERE abstract_id = $1', [req.params.id]);
      // Insert new quotations
      for (const q of quotations) {
        const qResult = await client.query(
          `INSERT INTO abstract_quotations (abstract_id, supplier_id, bid_amount, is_compliant, remarks, rank_no) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
          [req.params.id, q.supplier_id, q.bid_amount||0, q.is_compliant||false, q.remarks, q.rank_no]
        );
        if (q.items) for (const it of q.items) {
          await client.query(
            `INSERT INTO abstract_quote_items (abstract_quotation_id, item_description, quantity, unit, unit_price) VALUES ($1,$2,$3,$4,$5)`,
            [qResult.rows[0].id, it.item_description, it.quantity||1, it.unit, it.unit_price||0]
          );
        }
      }
    }
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.delete('/api/abstracts/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM abstracts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Abstract deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/abstracts/:id/set-status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query('UPDATE abstracts SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Abstract not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// POST-QUALIFICATION (TWG)
// ==============================================================================

app.get('/api/post-qualifications', authenticateToken, async (req, res) => {
  try {
    const userRoles = [req.user.role, req.user.secondary_role].filter(Boolean);
    const canSeeAllDrafts = userRoles.some(r => ['admin', 'hope'].includes(r));
    const result = await pool.query(
      `SELECT pq.*,
        a.abstract_number,
        eh.full_name as twg_head_name,
        em1.full_name as twg_member1_name,
        em2.full_name as twg_member2_name,
        em3.full_name as twg_member3_name,
        em4.full_name as twg_member4_name,
        s1.name as bidder1_name,
        s2.name as bidder2_name,
        s3.name as bidder3_name,
        pr.dept_id as pr_dept_id, dept.code as department_code
       FROM post_qualifications pq
       LEFT JOIN abstracts a ON pq.abstract_id = a.id
       LEFT JOIN rfqs r ON a.rfq_id = r.id
       LEFT JOIN purchaserequests pr ON r.pr_id = pr.id
       LEFT JOIN departments dept ON pr.dept_id = dept.id
       LEFT JOIN employees eh ON pq.twg_head_id = eh.id
       LEFT JOIN employees em1 ON pq.twg_member1_id = em1.id
       LEFT JOIN employees em2 ON pq.twg_member2_id = em2.id
       LEFT JOIN employees em3 ON pq.twg_member3_id = em3.id
       LEFT JOIN employees em4 ON pq.twg_member4_id = em4.id
       LEFT JOIN suppliers s1 ON pq.bidder1_supplier_id = s1.id
       LEFT JOIN suppliers s2 ON pq.bidder2_supplier_id = s2.id
       LEFT JOIN suppliers s3 ON pq.bidder3_supplier_id = s3.id
       WHERE (pq.status != 'draft' OR pq.created_by = $1 OR $2 = true)
       ORDER BY pq.created_at DESC`,
      [req.user.id, canSeeAllDrafts]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/post-qualifications/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM post_qualifications WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post-qualification not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/post-qualifications', authenticateToken, async (req, res) => {
  try {
    const { postqual_number, abstract_id, bidder_name, documents_verified, technical_compliance, financial_validation, twg_result, findings, status, twg_head_id, twg_member1_id, twg_member2_id, twg_member3_id, twg_member4_id, bidder1_supplier_id, bidder2_supplier_id, bidder3_supplier_id } = req.body;
    const result = await pool.query(
      `INSERT INTO post_qualifications (postqual_number, abstract_id, bidder_name, documents_verified, technical_compliance, financial_validation, twg_result, findings, status, created_by, twg_head_id, twg_member1_id, twg_member2_id, twg_member3_id, twg_member4_id, bidder1_supplier_id, bidder2_supplier_id, bidder3_supplier_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
      [postqual_number, abstract_id, bidder_name, documents_verified||'{}', technical_compliance||'{}', financial_validation||'{}', twg_result, findings, status||'on_going', req.user.id, twg_head_id||null, twg_member1_id||null, twg_member2_id||null, twg_member3_id||null, twg_member4_id||null, bidder1_supplier_id||null, bidder2_supplier_id||null, bidder3_supplier_id||null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/post-qualifications/:id', authenticateToken, async (req, res) => {
  try {
    const { postqual_number, abstract_id, bidder_name, documents_verified, technical_compliance, financial_validation, twg_result, findings, status, twg_head_id, twg_member1_id, twg_member2_id, twg_member3_id, twg_member4_id, bidder1_supplier_id, bidder2_supplier_id, bidder3_supplier_id } = req.body;
    const result = await pool.query(
      `UPDATE post_qualifications SET postqual_number=$1, abstract_id=$2, bidder_name=$3, documents_verified=$4, technical_compliance=$5, financial_validation=$6, twg_result=$7, findings=$8, status=$9, twg_head_id=$10, twg_member1_id=$11, twg_member2_id=$12, twg_member3_id=$13, twg_member4_id=$14, bidder1_supplier_id=$15, bidder2_supplier_id=$16, bidder3_supplier_id=$17, updated_at=CURRENT_TIMESTAMP
       WHERE id=$18 RETURNING *`,
      [postqual_number, abstract_id, bidder_name, documents_verified, technical_compliance, financial_validation, twg_result, findings, status, twg_head_id||null, twg_member1_id||null, twg_member2_id||null, twg_member3_id||null, twg_member4_id||null, bidder1_supplier_id||null, bidder2_supplier_id||null, bidder3_supplier_id||null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/post-qualifications/:id/set-status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query('UPDATE post_qualifications SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post-Qualification not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/post-qualifications/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM post_qualifications WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post-Qualification not found' });
    res.json({ message: 'Post-Qualification deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// BAC RESOLUTION
// ==============================================================================

app.get('/api/bac-resolutions', authenticateToken, async (req, res) => {
  try {
    const userRoles = [req.user.role, req.user.secondary_role].filter(Boolean);
    const canSeeAllDrafts = userRoles.some(r => ['admin', 'hope'].includes(r));
    const result = await pool.query(
      `SELECT br.*, a.abstract_number, s.name as supplier_name,
       ec.full_name as chairperson_name, ev.full_name as vice_chairperson_name,
       em1.full_name as member1_name, em2.full_name as member2_name, em3.full_name as member3_name,
       eh.full_name as hope_name,
       pr.dept_id as pr_dept_id, dept.code as department_code
       FROM bac_resolutions br LEFT JOIN abstracts a ON br.abstract_id = a.id
       LEFT JOIN rfqs r ON a.rfq_id = r.id
       LEFT JOIN purchaserequests pr ON r.pr_id = pr.id
       LEFT JOIN departments dept ON pr.dept_id = dept.id
       LEFT JOIN suppliers s ON br.recommended_supplier_id = s.id
       LEFT JOIN employees ec ON br.bac_chairperson_id = ec.id
       LEFT JOIN employees ev ON br.bac_vice_chairperson_id = ev.id
       LEFT JOIN employees em1 ON br.bac_member1_id = em1.id
       LEFT JOIN employees em2 ON br.bac_member2_id = em2.id
       LEFT JOIN employees em3 ON br.bac_member3_id = em3.id
       LEFT JOIN employees eh ON br.hope_id = eh.id
       WHERE (br.status != 'draft' OR br.created_by = $1 OR $2 = true)
       ORDER BY br.created_at DESC`,
      [req.user.id, canSeeAllDrafts]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/bac-resolutions/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT br.*, a.abstract_number, s.name as supplier_name,
       ec.full_name as chairperson_name, ev.full_name as vice_chairperson_name,
       em1.full_name as member1_name, em2.full_name as member2_name, em3.full_name as member3_name,
       eh.full_name as hope_name
       FROM bac_resolutions br LEFT JOIN abstracts a ON br.abstract_id = a.id
       LEFT JOIN suppliers s ON br.recommended_supplier_id = s.id
       LEFT JOIN employees ec ON br.bac_chairperson_id = ec.id
       LEFT JOIN employees ev ON br.bac_vice_chairperson_id = ev.id
       LEFT JOIN employees em1 ON br.bac_member1_id = em1.id
       LEFT JOIN employees em2 ON br.bac_member2_id = em2.id
       LEFT JOIN employees em3 ON br.bac_member3_id = em3.id
       LEFT JOIN employees eh ON br.hope_id = eh.id
       WHERE br.id = $1`, [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'BAC Resolution not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/bac-resolutions', authenticateToken, async (req, res) => {
  try {
    const { resolution_number, abstract_id, resolution_date, procurement_mode, abc_amount, recommended_supplier_id, recommended_awardee_name, bid_amount, status, bac_chairperson_id, bac_vice_chairperson_id, bac_member1_id, bac_member2_id, bac_member3_id, hope_id } = req.body;
    const result = await pool.query(
      `INSERT INTO bac_resolutions (resolution_number, abstract_id, resolution_date, procurement_mode, abc_amount, recommended_supplier_id, recommended_awardee_name, bid_amount, status, created_by, bac_chairperson_id, bac_vice_chairperson_id, bac_member1_id, bac_member2_id, bac_member3_id, hope_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [resolution_number, abstract_id, resolution_date, procurement_mode||'SVP', abc_amount||0, recommended_supplier_id, recommended_awardee_name, bid_amount||0, status||'on_going', req.user.id, bac_chairperson_id||null, bac_vice_chairperson_id||null, bac_member1_id||null, bac_member2_id||null, bac_member3_id||null, hope_id||null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/bac-resolutions/:id', authenticateToken, async (req, res) => {
  try {
    const { resolution_number, abstract_id, resolution_date, procurement_mode, abc_amount, recommended_supplier_id, recommended_awardee_name, bid_amount, status, bac_chairperson_id, bac_vice_chairperson_id, bac_member1_id, bac_member2_id, bac_member3_id, hope_id } = req.body;
    const result = await pool.query(
      `UPDATE bac_resolutions SET resolution_number=$1, abstract_id=$2, resolution_date=$3, procurement_mode=$4, abc_amount=$5, recommended_supplier_id=$6, recommended_awardee_name=$7, bid_amount=$8, status=$9, bac_chairperson_id=$10, bac_vice_chairperson_id=$11, bac_member1_id=$12, bac_member2_id=$13, bac_member3_id=$14, hope_id=$15, updated_at=CURRENT_TIMESTAMP
       WHERE id=$16 RETURNING *`,
      [resolution_number, abstract_id, resolution_date, procurement_mode, abc_amount, recommended_supplier_id, recommended_awardee_name, bid_amount, status, bac_chairperson_id||null, bac_vice_chairperson_id||null, bac_member1_id||null, bac_member2_id||null, bac_member3_id||null, hope_id||null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/bac-resolutions/:id/approve', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE bac_resolutions SET status='completed', approved_by=$1, approved_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *`,
      [req.user.id, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/bac-resolutions/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM bac_resolutions WHERE id = $1', [req.params.id]);
    res.json({ message: 'BAC Resolution deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/bac-resolutions/:id/set-status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query('UPDATE bac_resolutions SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'BAC Resolution not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// NOTICE OF AWARD (NOA)
// ==============================================================================

app.get('/api/notices-of-award', authenticateToken, async (req, res) => {
  try {
    const userRoles = [req.user.role, req.user.secondary_role].filter(Boolean);
    const canSeeAllDrafts = userRoles.some(r => ['admin', 'hope'].includes(r));
    const result = await pool.query(
      `SELECT n.*, br.resolution_number, s.name as supplier_name, pq.postqual_number,
              r.rfq_number,
              pr.dept_id as pr_dept_id, dept.code as department_code
       FROM notices_of_award n LEFT JOIN bac_resolutions br ON n.bac_resolution_id = br.id
       LEFT JOIN suppliers s ON n.supplier_id = s.id
       LEFT JOIN rfqs r ON n.rfq_id = r.id
       LEFT JOIN abstracts a ON br.abstract_id = a.id
       LEFT JOIN purchaserequests pr ON r.pr_id = pr.id
       LEFT JOIN departments dept ON pr.dept_id = dept.id
       LEFT JOIN post_qualifications pq ON pq.abstract_id = a.id
       WHERE (n.status != 'draft' OR n.created_by = $1 OR $2 = true)
       ORDER BY n.created_at DESC`,
      [req.user.id, canSeeAllDrafts]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/notices-of-award/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, br.resolution_number, s.name as supplier_name, s.address as supplier_address,
              r.rfq_number
       FROM notices_of_award n LEFT JOIN bac_resolutions br ON n.bac_resolution_id = br.id
       LEFT JOIN suppliers s ON n.supplier_id = s.id
       LEFT JOIN rfqs r ON n.rfq_id = r.id
       WHERE n.id = $1`, [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'NOA not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/notices-of-award', authenticateToken, async (req, res) => {
  try {
    const { noa_number, bac_resolution_id, supplier_id, rfq_id, contract_amount, date_issued, company_name, address, status } = req.body;
    const result = await pool.query(
      `INSERT INTO notices_of_award (noa_number, bac_resolution_id, supplier_id, rfq_id, contract_amount, date_issued, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [noa_number, bac_resolution_id, supplier_id, rfq_id, contract_amount||0, date_issued, status||'issued', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/notices-of-award/:id', authenticateToken, async (req, res) => {
  try {
    const { noa_number, bac_resolution_id, supplier_id, rfq_id, contract_amount, date_issued, bidder_receipt_date, status } = req.body;
    const result = await pool.query(
      `UPDATE notices_of_award SET noa_number=$1, bac_resolution_id=$2, supplier_id=$3, rfq_id=$4, contract_amount=$5, date_issued=$6, bidder_receipt_date=$7, status=$8, updated_at=CURRENT_TIMESTAMP
       WHERE id=$9 RETURNING *`,
      [noa_number, bac_resolution_id, supplier_id, rfq_id, contract_amount, date_issued, bidder_receipt_date, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/notices-of-award/:id/set-status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query('UPDATE notices_of_award SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'NOA not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/notices-of-award/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM notices_of_award WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'NOA not found' });
    res.json({ message: 'NOA deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// PURCHASE ORDERS
// ==============================================================================

app.get('/api/purchase-orders', authenticateToken, async (req, res) => {
  try {
    const userRoles = [req.user.role, req.user.secondary_role].filter(Boolean);
    const canSeeAllDrafts = userRoles.some(r => ['admin', 'hope'].includes(r));
    const result = await pool.query(
      `SELECT po.*, s.name as supplier_name, s.address as supplier_address, s.tin as supplier_tin,
              u.username as created_by_name, pr.pr_number, noa.noa_number,
              pr.dept_id as pr_dept_id, d.code as department_code
       FROM purchaseorders po
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       LEFT JOIN users u ON po.created_by = u.id
       LEFT JOIN purchaserequests pr ON po.pr_id = pr.id
       LEFT JOIN departments d ON pr.dept_id = d.id
       LEFT JOIN notices_of_award noa ON po.noa_id = noa.id
       WHERE (po.status != 'draft' OR po.created_by = $1 OR $2 = true)
       ORDER BY po.created_at DESC`,
      [req.user.id, canSeeAllDrafts]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/purchase-orders/:id', authenticateToken, async (req, res) => {
  try {
    const po = await pool.query(
      `SELECT po.*, s.name as supplier_name, s.address as supplier_address, s.tin as supplier_tin
       FROM purchaseorders po LEFT JOIN suppliers s ON po.supplier_id = s.id WHERE po.id = $1`, [req.params.id]
    );
    if (po.rows.length === 0) return res.status(404).json({ error: 'PO not found' });
    const items = await pool.query(
      `SELECT poi.*, i.stock_no, i.category as item_category FROM po_items poi LEFT JOIN items i ON poi.item_id = i.id WHERE poi.po_id = $1 ORDER BY poi.id`,
      [req.params.id]
    );
    res.json({ ...po.rows[0], items: items.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/purchase-orders', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { po_number, pr_id, noa_id, supplier_id, total_amount, payment_terms, delivery_address,
            status, workflow_status, expected_delivery_date, po_date, purpose, mode_of_procurement, place_of_delivery, item_specifications, items } = req.body;
    const poResult = await client.query(
      `INSERT INTO purchaseorders (po_number, pr_id, noa_id, supplier_id, total_amount, payment_terms, delivery_address,
       status, workflow_status, expected_delivery_date, po_date, purpose, mode_of_procurement, place_of_delivery, created_by, item_specifications)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [po_number, pr_id, noa_id, supplier_id, total_amount||0, payment_terms, delivery_address,
       status||'for_signing', workflow_status||'pending', expected_delivery_date, po_date, purpose, mode_of_procurement, place_of_delivery, req.user.id, item_specifications || null]
    );
    const po = poResult.rows[0];
    if (items && items.length > 0) {
      for (const item of items) {
        await client.query(
          `INSERT INTO po_items (po_id, item_id, item_code, item_name, item_description, unit, category, quantity, unit_price, uom, remarks)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [po.id, item.item_id, item.item_code, item.item_name, item.item_description, item.unit, item.category, item.quantity||1, item.unit_price||0, item.uom, item.remarks]
        );
      }
    }
    await client.query('COMMIT');
    
    // Notify about new PO
    broadcastNotification({
      type: 'delivery',
      icon: 'fas fa-receipt',
      title: `${po_number} Created`,
      message: `New Purchase Order issued – ${purpose || 'awaiting processing'}`,
      reference_type: 'purchase_order',
      reference_id: po.id,
      reference_code: po_number,
      roles: ['admin', 'supply_officer', 'inspector']
    });
    
    res.status(201).json(po);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.put('/api/purchase-orders/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { po_number, pr_id, noa_id, supplier_id, total_amount, payment_terms, delivery_address,
            status, workflow_status, expected_delivery_date, delivery_date, po_date, purpose, mode_of_procurement, place_of_delivery, item_specifications, items } = req.body;
    const result = await client.query(
      `UPDATE purchaseorders SET po_number=$1, pr_id=$2, noa_id=$3, supplier_id=$4, total_amount=$5, payment_terms=$6, delivery_address=$7,
       status=$8, workflow_status=$9, expected_delivery_date=$10, delivery_date=$11, po_date=$12, purpose=$13, mode_of_procurement=$14, place_of_delivery=$15, item_specifications=$16, updated_at=CURRENT_TIMESTAMP
       WHERE id=$17 RETURNING *`,
      [po_number, pr_id, noa_id, supplier_id, total_amount, payment_terms, delivery_address,
       status, workflow_status, expected_delivery_date, delivery_date, po_date, purpose, mode_of_procurement, place_of_delivery, item_specifications || null, req.params.id]
    );
    if (items) {
      await client.query('DELETE FROM po_items WHERE po_id = $1', [req.params.id]);
      for (const item of items) {
        await client.query(
          `INSERT INTO po_items (po_id, item_id, item_code, item_name, item_description, unit, category, quantity, unit_price, uom, remarks)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [req.params.id, item.item_id, item.item_code, item.item_name, item.item_description, item.unit, item.category, item.quantity||1, item.unit_price||0, item.uom, item.remarks]
        );
      }
    }
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.put('/api/purchase-orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, workflow_status } = req.body;
    const updates = [];
    const params = [];
    let idx = 1;
    if (status) { updates.push(`status = $${idx++}`); params.push(status); }
    if (workflow_status) { updates.push(`workflow_status = $${idx++}`); params.push(workflow_status); }
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);
    const result = await pool.query(
      `UPDATE purchaseorders SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, params
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/purchase-orders/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM purchaseorders WHERE id = $1', [req.params.id]);
    res.json({ message: 'PO deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/purchase-orders/:id/set-status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query('UPDATE purchaseorders SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'PO not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// IAR (Inspection and Acceptance Report) - FULL INVENTORY INTEGRATION
// ==============================================================================

app.get('/api/iars', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT iar.*, po.po_number, s.name as supplier_name,
              u1.username as inspected_by_name, u2.username as received_by_name
       FROM iars iar
       LEFT JOIN purchaseorders po ON iar.po_id = po.id
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       LEFT JOIN users u1 ON iar.inspected_by = u1.id
       LEFT JOIN users u2 ON iar.received_by = u2.id
       ORDER BY iar.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/iars/:id', authenticateToken, async (req, res) => {
  try {
    const iar = await pool.query(
      `SELECT iar.*, po.po_number, po.po_date, s.name as supplier_name,
              u1.username as inspected_by_name, u2.username as received_by_name
       FROM iars iar LEFT JOIN purchaseorders po ON iar.po_id = po.id
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       LEFT JOIN users u1 ON iar.inspected_by = u1.id
       LEFT JOIN users u2 ON iar.received_by = u2.id
       WHERE iar.id = $1`, [req.params.id]
    );
    if (iar.rows.length === 0) return res.status(404).json({ error: 'IAR not found' });
    const items = await pool.query(
      `SELECT ii.*, i.category as item_category, i.uacs_code, i.stock_no, i.procurement_source as item_procurement_source
       FROM iar_items ii LEFT JOIN items i ON ii.item_id = i.id WHERE ii.iar_id = $1 ORDER BY ii.id`,
      [req.params.id]
    );
    res.json({ ...iar.rows[0], items: items.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/iars', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { iar_number, po_id, inspection_date, delivery_date, invoice_number, invoice_date,
            delivery_receipt_number, inspection_result, findings, purpose, acceptance, item_specifications, items } = req.body;
    const iarResult = await client.query(
      `INSERT INTO iars (iar_number, po_id, inspection_date, delivery_date, invoice_number, invoice_date,
       delivery_receipt_number, inspection_result, findings, purpose, acceptance, created_by, item_specifications)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [iar_number, po_id, inspection_date, delivery_date, invoice_number, invoice_date,
       delivery_receipt_number, inspection_result||'on_going', findings, purpose, acceptance||'to_be_checked', req.user.id, item_specifications || null]
    );
    const iar = iarResult.rows[0];
    if (items && items.length > 0) {
      for (const item of items) {
        await client.query(
          `INSERT INTO iar_items (iar_id, item_id, item_code, item_name, quantity, unit_cost, category, brand, model, serial_no, ppe_no, inventory_no, generated_item_id, remarks, procurement_source)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
          [iar.id, item.item_id, item.item_code, item.item_name, item.quantity, item.unit_cost||0,
           item.category, item.brand, item.model, item.serial_no, item.ppe_no, item.inventory_no, item.generated_item_id, item.remarks, item.procurement_source || null]
        );
      }
    }
    await client.query('COMMIT');
    
    // Notify about new IAR
    broadcastNotification({
      type: 'submission',
      icon: 'fas fa-clipboard-check',
      title: `${iar_number} Created`,
      message: `Inspection & Acceptance Report filed – ${inspection_result || 'pending inspection'}`,
      reference_type: 'iar',
      reference_id: iar.id,
      reference_code: iar_number,
      roles: ['admin', 'supply_officer', 'inspector', 'manager']
    });
    
    res.status(201).json(iar);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.put('/api/iars/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { iar_number, po_id, inspection_date, delivery_date, invoice_number, invoice_date,
            delivery_receipt_number, inspection_result, findings, purpose, acceptance, item_specifications, items } = req.body;
    const result = await client.query(
      `UPDATE iars SET iar_number=$1, po_id=$2, inspection_date=$3, delivery_date=$4, invoice_number=$5, invoice_date=$6,
       delivery_receipt_number=$7, inspection_result=$8, findings=$9, purpose=$10, acceptance=$11, item_specifications=$12, updated_at=CURRENT_TIMESTAMP WHERE id=$13 RETURNING *`,
      [iar_number, po_id, inspection_date, delivery_date, invoice_number, invoice_date, delivery_receipt_number, inspection_result, findings, purpose, acceptance, item_specifications || null, req.params.id]
    );
    if (items) {
      await client.query('DELETE FROM iar_items WHERE iar_id = $1', [req.params.id]);
      for (const item of items) {
        await client.query(
          `INSERT INTO iar_items (iar_id, item_id, item_code, item_name, quantity, unit_cost, category, brand, model, serial_no, ppe_no, inventory_no, generated_item_id, remarks, procurement_source)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
          [req.params.id, item.item_id, item.item_code, item.item_name, item.quantity, item.unit_cost||0,
           item.category, item.brand, item.model, item.serial_no, item.ppe_no, item.inventory_no, item.generated_item_id, item.remarks, item.procurement_source || null]
        );
      }
    }
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

// Accept/Complete IAR - Updates inventory
app.put('/api/iars/:id/accept', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const iarId = req.params.id;

    // Get IAR and its items
    const iarResult = await client.query(
      `SELECT iar.*, po.po_number, po.supplier_id FROM iars iar LEFT JOIN purchaseorders po ON iar.po_id = po.id WHERE iar.id = $1`, [iarId]
    );
    if (iarResult.rows.length === 0) throw new Error('IAR not found');
    const iar = iarResult.rows[0];

    const iarItemsResult = await client.query(
      `SELECT ii.*, i.category as item_master_category, i.uacs_code, i.stock_no, i.name as master_name, s.name as supplier_name
       FROM iar_items ii LEFT JOIN items i ON ii.item_id = i.id
       LEFT JOIN purchaseorders po ON $1 = po.id
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       WHERE ii.iar_id = $2`, [iar.po_id, iarId]
    );
    const iarItems = iarItemsResult.rows;

    // Get/init global counters
    let countersResult = await client.query("SELECT data FROM settings WHERE id = 'globalCounters'");
    let counters = countersResult.rows.length > 0 ? countersResult.rows[0].data : { ppeCounters: {}, inventoryCounters: {}, generatedItemIdCounter: 3 };

    const year = new Date(iar.inspection_date || new Date()).getFullYear();
    const month = String(new Date(iar.inspection_date || new Date()).getMonth() + 1).padStart(2, '0');

    const uacsToPpeMap = {
      '1040501000': { subMajor: '05', gl: '01' }, '1040502000': { subMajor: '05', gl: '02' },
      '1040503000': { subMajor: '05', gl: '03' }, '1040507000': { subMajor: '05', gl: '07' },
      '1040510000': { subMajor: '51', gl: '10' }, '1040512000': { subMajor: '51', gl: '12' },
      '1040513000': { subMajor: '51', gl: '13' }, '1040519000': { subMajor: '51', gl: '19' },
      '1040601000': { subMajor: '60', gl: '01' }, '1040602000': { subMajor: '60', gl: '02' },
      '1060101000': { subMajor: '01', gl: '01' }, '1060401000': { subMajor: '04', gl: '01' },
      '1060501000': { subMajor: '05', gl: '01' }, '1060502000': { subMajor: '05', gl: '02' },
      '1060503000': { subMajor: '05', gl: '03' }, '1060514000': { subMajor: '05', gl: '14' },
      '1060513000': { subMajor: '05', gl: '13' }, '1060511000': { subMajor: '05', gl: '11' },
      '1060512000': { subMajor: '05', gl: '12' }, '1080102000': { subMajor: '01', gl: '02' },
      '1060599000': { subMajor: '05', gl: '99' }, '1060601000': { subMajor: '06', gl: '01' },
      '1060701000': { subMajor: '07', gl: '01' }, '1060702000': { subMajor: '07', gl: '02' },
      '1069899000': { subMajor: '98', gl: '99' },
    };

    for (const item of iarItems) {
      const category = item.category || item.item_master_category || 'Expendable';
      counters.generatedItemIdCounter = (counters.generatedItemIdCounter || 3) + 1;
      const generatedItemId = String(counters.generatedItemIdCounter).padStart(2, '0');

      if (category === 'Expendable') {
        // Update item quantity
        await client.query('UPDATE items SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [item.quantity, item.item_id]);

        // Create stock card entry
        const lastSC = await client.query('SELECT balance_qty FROM stock_cards WHERE item_id = $1 ORDER BY date DESC, transaction_no DESC LIMIT 1', [item.item_id]);
        const prevBalance = lastSC.rows.length > 0 ? lastSC.rows[0].balance_qty : 0;
        const nextTxNo = await client.query('SELECT COALESCE(MAX(transaction_no), 0) + 1 as next FROM stock_cards WHERE item_id = $1', [item.item_id]);
        await client.query(
          `INSERT INTO stock_cards (item_id, item_code, item_name, transaction_no, date, reference, receipt_qty, receipt_unit_cost, receipt_total_cost, balance_qty, balance_unit_cost, balance_total_cost)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [item.item_id, item.item_code || item.stock_no, item.item_name || item.master_name, nextTxNo.rows[0].next,
           iar.inspection_date || new Date(), 'IAR-' + iar.iar_number, item.quantity, item.unit_cost, item.quantity * item.unit_cost,
           prevBalance + item.quantity, item.unit_cost, (prevBalance + item.quantity) * item.unit_cost]
        );

        // Create supplies ledger card entry
        const lastSLC = await client.query('SELECT balance_qty, balance_total_cost FROM supplies_ledger_cards WHERE item_id = $1 ORDER BY date DESC, transaction_no DESC LIMIT 1', [item.item_id]);
        const prevLedgerQty = lastSLC.rows.length > 0 ? lastSLC.rows[0].balance_qty : 0;
        const prevLedgerCost = lastSLC.rows.length > 0 ? parseFloat(lastSLC.rows[0].balance_total_cost) : 0;
        const newBalQty = prevLedgerQty + item.quantity;
        const newBalCost = prevLedgerCost + (item.quantity * item.unit_cost);
        const nextLTxNo = await client.query('SELECT COALESCE(MAX(transaction_no), 0) + 1 as next FROM supplies_ledger_cards WHERE item_id = $1', [item.item_id]);
        await client.query(
          `INSERT INTO supplies_ledger_cards (item_id, item_code, item_name, transaction_no, date, reference, receipt_qty, receipt_unit_cost, receipt_total_cost, balance_qty, balance_unit_cost, balance_total_cost)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [item.item_id, item.item_code || item.stock_no, item.item_name || item.master_name, nextLTxNo.rows[0].next,
           iar.inspection_date || new Date(), 'IAR-' + iar.iar_number, item.quantity, item.unit_cost, item.quantity * item.unit_cost,
           newBalQty, newBalQty > 0 ? newBalCost / newBalQty : 0, newBalCost]
        );

        // Update IAR item with generated ID
        await client.query('UPDATE iar_items SET generated_item_id = $1 WHERE id = $2', [generatedItemId, item.id]);

      } else if (category === 'Semi-Expendable') {
        const ppeMap = uacsToPpeMap[item.uacs_code];
        if (ppeMap) {
          const ppeKey = `${year}-${ppeMap.subMajor}-${ppeMap.gl}`;
          counters.ppeCounters = counters.ppeCounters || {};
          counters.ppeCounters[ppeKey] = (counters.ppeCounters[ppeKey] || 0) + 1;
          const ppeNo = `${year}-${ppeMap.subMajor}-${ppeMap.gl}-${String(counters.ppeCounters[ppeKey]).padStart(4, '0')}`;

          const uacsDigits = item.uacs_code.slice(4, 8);
          const invKey = `${year}-${uacsDigits}`;
          counters.inventoryCounters = counters.inventoryCounters || {};
          counters.inventoryCounters[invKey] = (counters.inventoryCounters[invKey] || 0) + 1;
          const inventoryNo = `${uacsDigits}-${month}-${String(counters.inventoryCounters[invKey]).padStart(4, '0')}`;

          await client.query(
            `INSERT INTO received_semi_expendable_items (item_id, generated_item_id, item_description, inventory_no, ppe_no, serial_no, brand, model, status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Available')`,
            [item.item_id, generatedItemId, item.item_name || item.master_name, inventoryNo, ppeNo, item.serial_no, item.brand, item.model]
          );

          // Create property card
          const supplierResult = await client.query('SELECT s.name FROM suppliers s JOIN purchaseorders po ON po.supplier_id = s.id WHERE po.id = $1', [iar.po_id]);
          const supplierName = supplierResult.rows.length > 0 ? supplierResult.rows[0].name : '';
          await client.query(
            `INSERT INTO property_cards (property_number, item_id, description, acquisition_cost, acquisition_date, received_date, status)
             VALUES ($1,$2,$3,$4,$5,$5,'active')`,
            [ppeNo, item.item_id, item.item_name || item.master_name, item.unit_cost, iar.inspection_date || new Date()]
          );

          // Update IAR item
          await client.query('UPDATE iar_items SET generated_item_id=$1, ppe_no=$2, inventory_no=$3 WHERE id=$4',
            [generatedItemId, ppeNo, inventoryNo, item.id]
          );
        }

      } else if (category === 'Capital Outlay') {
        const ppeMap = uacsToPpeMap[item.uacs_code];
        if (ppeMap) {
          const ppeKey = `${year}-${ppeMap.subMajor}-${ppeMap.gl}`;
          counters.ppeCounters = counters.ppeCounters || {};
          counters.ppeCounters[ppeKey] = (counters.ppeCounters[ppeKey] || 0) + 1;
          const ppeNo = `${year}-${ppeMap.subMajor}-${ppeMap.gl}-${String(counters.ppeCounters[ppeKey]).padStart(4, '0')}`;

          await client.query(
            `INSERT INTO received_capital_outlay_items (item_id, generated_item_id, item_description, ppe_no, serial_no, brand, model, status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,'Available')`,
            [item.item_id, generatedItemId, item.item_name || item.master_name, ppeNo, item.serial_no, item.brand, item.model]
          );

          await client.query(
            `INSERT INTO property_cards (property_number, item_id, description, acquisition_cost, acquisition_date, received_date, status)
             VALUES ($1,$2,$3,$4,$5,$5,'active')`,
            [ppeNo, item.item_id, item.item_name || item.master_name, item.unit_cost, iar.inspection_date || new Date()]
          );

          await client.query('UPDATE iar_items SET generated_item_id=$1, ppe_no=$2 WHERE id=$3', [generatedItemId, ppeNo, item.id]);
        }
      }
    }

    // Update IAR status
    await client.query("UPDATE iars SET acceptance='complete', inspection_result='verified', inspected_by=$1, date_inspected=CURRENT_DATE, received_by=$1, date_received=CURRENT_DATE, updated_at=CURRENT_TIMESTAMP WHERE id=$2",
      [req.user.id, iarId]
    );

    // Update PO status
    if (iar.po_id) {
      await client.query("UPDATE purchaseorders SET status='completed', updated_at=CURRENT_TIMESTAMP WHERE id=$1", [iar.po_id]);
    }

    // Save counters
    await client.query("INSERT INTO settings (id, data) VALUES ('globalCounters', $1) ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = CURRENT_TIMESTAMP",
      [JSON.stringify(counters)]
    );

    await client.query('COMMIT');
    res.json({ message: 'IAR accepted and inventory updated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('IAR accept error:', err);
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

// Set IAR inspection_result and acceptance status
app.put('/api/iars/:id/set-status', authenticateToken, async (req, res) => {
  try {
    const { inspection_result, acceptance } = req.body;
    // Enforce: if inspection is on_going, acceptance must be to_be_checked
    const finalAcceptance = inspection_result === 'on_going' ? 'to_be_checked' : (acceptance || 'to_be_checked');
    const result = await pool.query(
      `UPDATE iars SET inspection_result=$1, acceptance=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3 RETURNING *`,
      [inspection_result, finalAcceptance, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'IAR not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Unpost IAR - Reverse inventory changes
app.put('/api/iars/:id/unpost', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const iarId = req.params.id;

    const iarResult = await client.query('SELECT * FROM iars WHERE id = $1', [iarId]);
    if (iarResult.rows.length === 0) throw new Error('IAR not found');
    const iar = iarResult.rows[0];

    const iarItemsResult = await client.query(
      `SELECT ii.*, i.category as item_master_category FROM iar_items ii LEFT JOIN items i ON ii.item_id = i.id WHERE ii.iar_id = $1`, [iarId]
    );

    for (const item of iarItemsResult.rows) {
      const category = item.category || item.item_master_category || 'Expendable';

      if (category === 'Expendable') {
        await client.query('UPDATE items SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [item.quantity, item.item_id]);
        await client.query("DELETE FROM stock_cards WHERE item_id = $1 AND reference = $2", [item.item_id, 'IAR-' + iar.iar_number]);
        await client.query("DELETE FROM supplies_ledger_cards WHERE item_id = $1 AND reference = $2", [item.item_id, 'IAR-' + iar.iar_number]);
      } else {
        if (item.ppe_no) {
          await client.query('DELETE FROM received_semi_expendable_items WHERE ppe_no = $1', [item.ppe_no]);
          await client.query('DELETE FROM received_capital_outlay_items WHERE ppe_no = $1', [item.ppe_no]);
          await client.query('DELETE FROM property_cards WHERE property_number = $1', [item.ppe_no]);
          await client.query('DELETE FROM property_ledger_cards WHERE property_number = $1', [item.ppe_no]);
        }
      }
    }

    await client.query("UPDATE iars SET acceptance='to_be_checked', inspection_result='to_be_checked', updated_at=CURRENT_TIMESTAMP WHERE id=$1", [iarId]);
    if (iar.po_id) {
      await client.query("UPDATE purchaseorders SET status='for_signing', updated_at=CURRENT_TIMESTAMP WHERE id=$1", [iar.po_id]);
    }

    await client.query('COMMIT');
    res.json({ message: 'IAR unposted and inventory reversed' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('IAR unpost error:', err);
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

app.delete('/api/iars/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM iars WHERE id = $1', [req.params.id]);
    res.json({ message: 'IAR deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// STOCK CARDS
// ==============================================================================

app.get('/api/stock-cards', authenticateToken, async (req, res) => {
  try {
    const { item_id } = req.query;
    let query = `SELECT sc.*, i.name as item_name, i.unit, i.stock_no as item_stock_no,
                        i.description as item_description, i.reorder_point, i.category as fund_cluster
                 FROM stock_cards sc LEFT JOIN items i ON sc.item_id = i.id`;
    const params = [];
    if (item_id) { query += ' WHERE sc.item_id = $1'; params.push(item_id); }
    query += ' ORDER BY sc.date ASC, sc.transaction_no ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get stock card grouped by item
app.get('/api/stock-cards/by-item', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (sc.item_id) sc.item_id, i.code, i.stock_no, i.name as item_name, i.unit, i.category,
              sc.balance_qty, sc.balance_unit_cost, sc.balance_total_cost,
              (SELECT COUNT(*) FROM stock_cards WHERE item_id = sc.item_id) as transaction_count
       FROM stock_cards sc JOIN items i ON sc.item_id = i.id
       ORDER BY sc.item_id, sc.date DESC, sc.transaction_no DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/stock-cards', authenticateToken, async (req, res) => {
  try {
    const { item_id, date, reference, receipt_qty, receipt_unit_cost, issue_qty, issue_unit_cost } = req.body;
    const lastSC = await pool.query('SELECT balance_qty, balance_total_cost FROM stock_cards WHERE item_id = $1 ORDER BY date DESC, transaction_no DESC LIMIT 1', [item_id]);
    const prevQty = lastSC.rows.length > 0 ? lastSC.rows[0].balance_qty : 0;
    const prevCost = lastSC.rows.length > 0 ? parseFloat(lastSC.rows[0].balance_total_cost) : 0;
    const balQty = prevQty + (receipt_qty || 0) - (issue_qty || 0);
    const receiptCost = (receipt_qty || 0) * (receipt_unit_cost || 0);
    const issueCost = (issue_qty || 0) * (issue_unit_cost || 0);
    const balCost = prevCost + receiptCost - issueCost;
    const nextTxNo = await pool.query('SELECT COALESCE(MAX(transaction_no), 0) + 1 as next FROM stock_cards WHERE item_id = $1', [item_id]);
    const item = await pool.query('SELECT code, name FROM items WHERE id = $1', [item_id]);
    const result = await pool.query(
      `INSERT INTO stock_cards (item_id, item_code, item_name, transaction_no, date, reference, receipt_qty, receipt_unit_cost, receipt_total_cost, issue_qty, issue_unit_cost, issue_total_cost, balance_qty, balance_unit_cost, balance_total_cost)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [item_id, item.rows[0]?.code, item.rows[0]?.name, nextTxNo.rows[0].next, date, reference,
       receipt_qty||0, receipt_unit_cost||0, receiptCost, issue_qty||0, issue_unit_cost||0, issueCost,
       balQty, balQty > 0 ? balCost / balQty : 0, balCost]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// SUPPLIES LEDGER CARDS
// ==============================================================================

app.get('/api/supplies-ledger-cards', authenticateToken, async (req, res) => {
  try {
    const { item_id } = req.query;
    let query = `SELECT slc.*, i.name as item_name, i.unit, i.stock_no, i.code as item_code_catalog,
                        i.description as item_description, i.reorder_point
                 FROM supplies_ledger_cards slc LEFT JOIN items i ON slc.item_id = i.id`;
    const params = [];
    if (item_id) { query += ' WHERE slc.item_id = $1'; params.push(item_id); }
    query += ' ORDER BY slc.date ASC, slc.transaction_no ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/supplies-ledger-cards/by-item', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (slc.item_id) slc.item_id, i.code, i.stock_no, i.name as item_name, i.unit, i.category,
              slc.balance_qty, slc.balance_unit_cost, slc.balance_total_cost,
              (SELECT COUNT(*) FROM supplies_ledger_cards WHERE item_id = slc.item_id) as transaction_count
       FROM supplies_ledger_cards slc JOIN items i ON slc.item_id = i.id
       ORDER BY slc.item_id, slc.date DESC, slc.transaction_no DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// PROPERTY CARDS
// ==============================================================================

app.get('/api/property-cards', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pc.*, i.name as item_name, i.category, e.full_name as custodian_name, d.name as department_name
       FROM property_cards pc
       LEFT JOIN items i ON pc.item_id = i.id
       LEFT JOIN employees e ON pc.issued_to_employee_id = e.id
       LEFT JOIN departments d ON e.dept_id = d.id
       ORDER BY pc.property_number`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/property-cards/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pc.*, i.name as item_name, e.full_name as custodian_name
       FROM property_cards pc LEFT JOIN items i ON pc.item_id = i.id
       LEFT JOIN employees e ON pc.issued_to_employee_id = e.id WHERE pc.id = $1`, [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Property card not found' });
    // Get ledger entries
    const ledger = await pool.query('SELECT * FROM property_ledger_cards WHERE property_number = $1 ORDER BY date, transaction_no', [result.rows[0].property_number]);
    res.json({ ...result.rows[0], ledger_entries: ledger.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/property-cards', authenticateToken, async (req, res) => {
  try {
    const { property_number, item_id, description, acquisition_cost, acquisition_date, issued_to, issued_to_employee_id, issued_date, received_date, ics_no, status } = req.body;
    const result = await pool.query(
      `INSERT INTO property_cards (property_number, item_id, description, acquisition_cost, acquisition_date, issued_to, issued_to_employee_id, issued_date, received_date, ics_no, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [property_number, item_id, description, acquisition_cost, acquisition_date, issued_to, issued_to_employee_id, issued_date, received_date, ics_no, status||'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/property-cards/:id', authenticateToken, async (req, res) => {
  try {
    const { property_number, item_id, description, acquisition_cost, acquisition_date, issued_to, issued_to_employee_id, issued_date, received_date, ics_no, status } = req.body;
    const result = await pool.query(
      `UPDATE property_cards SET property_number=$1, item_id=$2, description=$3, acquisition_cost=$4, acquisition_date=$5, issued_to=$6, issued_to_employee_id=$7, issued_date=$8, received_date=$9, ics_no=$10, status=$11, updated_at=CURRENT_TIMESTAMP
       WHERE id=$12 RETURNING *`,
      [property_number, item_id, description, acquisition_cost, acquisition_date, issued_to, issued_to_employee_id, issued_date, received_date, ics_no, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/property-cards/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM property_cards WHERE id = $1', [req.params.id]);
    res.json({ message: 'Property card deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// PROPERTY LEDGER CARDS
// ==============================================================================

app.get('/api/property-ledger-cards', authenticateToken, async (req, res) => {
  try {
    const { property_number } = req.query;
    let query = 'SELECT * FROM property_ledger_cards';
    const params = [];
    if (property_number) { query += ' WHERE property_number = $1'; params.push(property_number); }
    query += ' ORDER BY date ASC, transaction_no ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/property-ledger-cards', authenticateToken, async (req, res) => {
  try {
    const { property_number, description, acquisition_date, acquisition_cost, date, reference, receipt_qty, receipt_unit_cost, issue_qty, issue_unit_cost } = req.body;
    const nextTx = await pool.query('SELECT COALESCE(MAX(transaction_no), 0) + 1 as next FROM property_ledger_cards WHERE property_number = $1', [property_number]);
    const lastEntry = await pool.query('SELECT balance_qty, balance_total_cost FROM property_ledger_cards WHERE property_number = $1 ORDER BY date DESC, transaction_no DESC LIMIT 1', [property_number]);
    const prevQty = lastEntry.rows.length > 0 ? lastEntry.rows[0].balance_qty : 0;
    const prevCost = lastEntry.rows.length > 0 ? parseFloat(lastEntry.rows[0].balance_total_cost) : 0;
    const balQty = prevQty + (receipt_qty||0) - (issue_qty||0);
    const receiptCost = (receipt_qty||0) * (receipt_unit_cost||0);
    const issueCost = (issue_qty||0) * (issue_unit_cost||0);
    const balCost = prevCost + receiptCost - issueCost;
    const result = await pool.query(
      `INSERT INTO property_ledger_cards (property_number, description, acquisition_date, acquisition_cost, transaction_no, date, reference, receipt_qty, receipt_unit_cost, receipt_total_cost, issue_qty, issue_unit_cost, issue_total_cost, balance_qty, balance_unit_cost, balance_total_cost)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [property_number, description, acquisition_date, acquisition_cost, nextTx.rows[0].next, date, reference,
       receipt_qty||0, receipt_unit_cost||0, receiptCost, issue_qty||0, issue_unit_cost||0, issueCost,
       balQty, balQty > 0 ? balCost / balQty : 0, balCost]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// INVENTORY CUSTODIAN SLIPS (ICS)
// ==============================================================================

app.get('/api/ics', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ics.*, pc.description as property_description, pc.acquisition_cost,
              e1.full_name as issued_to_name, e2.full_name as received_by_name
       FROM inventory_custodian_slips ics
       LEFT JOIN property_cards pc ON ics.property_number = pc.property_number
       LEFT JOIN employees e1 ON ics.issued_to_employee_id = e1.id
       LEFT JOIN employees e2 ON ics.received_by_employee_id = e2.id
       ORDER BY ics.date_of_issue DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/ics/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ics.*, pc.description as property_description, pc.acquisition_cost,
              e1.full_name as issued_to_name, e2.full_name as received_by_name
       FROM inventory_custodian_slips ics
       LEFT JOIN property_cards pc ON ics.property_number = pc.property_number
       LEFT JOIN employees e1 ON ics.issued_to_employee_id = e1.id
       LEFT JOIN employees e2 ON ics.received_by_employee_id = e2.id
       WHERE ics.id = $1`, [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'ICS not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/ics', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { ics_no, date_of_issue, property_number, description, inventory_no, ppe_no, issued_to, issued_to_employee_id, received_by_employee_id, received_by_position, other_info } = req.body;

    // Auto-generate ICS number if not provided
    let finalIcsNo = ics_no;
    if (!finalIcsNo) {
      const year = new Date().getFullYear();
      let countersResult = await client.query("SELECT data FROM settings WHERE id = 'globalCounters'");
      let counters = countersResult.rows.length > 0 ? countersResult.rows[0].data : {};
      counters.icsCounters = counters.icsCounters || {};
      counters.icsCounters[year] = (counters.icsCounters[year] || 0) + 1;
      finalIcsNo = `ICS-${year}-${String(counters.icsCounters[year]).padStart(4, '0')}`;
      await client.query("INSERT INTO settings (id, data) VALUES ('globalCounters', $1) ON CONFLICT (id) DO UPDATE SET data = $1", [JSON.stringify(counters)]);
    }

    const result = await client.query(
      `INSERT INTO inventory_custodian_slips (ics_no, date_of_issue, property_number, description, inventory_no, ppe_no, issued_to, issued_to_employee_id, received_by_employee_id, received_by_position, other_info)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [finalIcsNo, date_of_issue, property_number, description, inventory_no, ppe_no, issued_to, issued_to_employee_id, received_by_employee_id, received_by_position, other_info]
    );

    // Update property card with ICS info
    if (property_number && issued_to_employee_id) {
      await client.query(
        `UPDATE property_cards SET issued_to_employee_id=$1, issued_to=$2, issued_date=$3, ics_no=$4, updated_at=CURRENT_TIMESTAMP WHERE property_number=$5`,
        [issued_to_employee_id, issued_to, date_of_issue, finalIcsNo, property_number]
      );
    }
    // Update received semi-expendable item status
    if (ppe_no) {
      await client.query("UPDATE received_semi_expendable_items SET status='Issued', issued_to=$1, issued_to_employee_id=$2, ics_no=$3, updated_at=CURRENT_TIMESTAMP WHERE ppe_no=$4",
        [issued_to, issued_to_employee_id, finalIcsNo, ppe_no]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.put('/api/ics/:id', authenticateToken, async (req, res) => {
  try {
    const { ics_no, date_of_issue, property_number, description, inventory_no, ppe_no, issued_to, issued_to_employee_id, received_by_employee_id, received_by_position, other_info } = req.body;
    const result = await pool.query(
      `UPDATE inventory_custodian_slips SET ics_no=$1, date_of_issue=$2, property_number=$3, description=$4, inventory_no=$5, ppe_no=$6, issued_to=$7, issued_to_employee_id=$8, received_by_employee_id=$9, received_by_position=$10, other_info=$11, updated_at=CURRENT_TIMESTAMP
       WHERE id=$12 RETURNING *`,
      [ics_no, date_of_issue, property_number, description, inventory_no, ppe_no, issued_to, issued_to_employee_id, received_by_employee_id, received_by_position, other_info, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/ics/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM inventory_custodian_slips WHERE id = $1', [req.params.id]);
    res.json({ message: 'ICS deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// PROPERTY ACKNOWLEDGEMENT RECEIPTS (PAR)
// ==============================================================================

app.get('/api/pars', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT par.*, e1.full_name as issued_to_name, e2.full_name as received_from_name, e3.full_name as received_by_name
       FROM property_acknowledgement_receipts par
       LEFT JOIN employees e1 ON par.issued_to_employee_id = e1.id
       LEFT JOIN employees e2 ON par.received_from_id = e2.id
       LEFT JOIN employees e3 ON par.received_by_id = e3.id
       ORDER BY par.date_of_issue DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/pars/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT par.*, e1.full_name as issued_to_name, e2.full_name as received_from_name, e3.full_name as received_by_name
       FROM property_acknowledgement_receipts par
       LEFT JOIN employees e1 ON par.issued_to_employee_id = e1.id
       LEFT JOIN employees e2 ON par.received_from_id = e2.id
       LEFT JOIN employees e3 ON par.received_by_id = e3.id
       WHERE par.id = $1`, [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'PAR not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/pars', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { par_no, ppe_no, description, issued_to, issued_to_employee_id, date_of_issue, received_from_id, received_from_position, received_by_id, received_by_position, other_info } = req.body;

    let finalParNo = par_no;
    if (!finalParNo) {
      const year = new Date().getFullYear();
      let countersResult = await client.query("SELECT data FROM settings WHERE id = 'globalCounters'");
      let counters = countersResult.rows.length > 0 ? countersResult.rows[0].data : {};
      counters.parCounters = counters.parCounters || {};
      counters.parCounters[year] = (counters.parCounters[year] || 0) + 1;
      finalParNo = `PAR-${year}-${String(counters.parCounters[year]).padStart(4, '0')}`;
      await client.query("INSERT INTO settings (id, data) VALUES ('globalCounters', $1) ON CONFLICT (id) DO UPDATE SET data = $1", [JSON.stringify(counters)]);
    }

    const result = await client.query(
      `INSERT INTO property_acknowledgement_receipts (par_no, ppe_no, description, issued_to, issued_to_employee_id, date_of_issue, received_from_id, received_from_position, received_by_id, received_by_position, other_info)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [finalParNo, ppe_no, description, issued_to, issued_to_employee_id, date_of_issue, received_from_id, received_from_position, received_by_id, received_by_position, other_info]
    );

    // Update capital outlay item status
    if (ppe_no) {
      await client.query("UPDATE received_capital_outlay_items SET status='Issued', issued_to=$1, issued_to_employee_id=$2, updated_at=CURRENT_TIMESTAMP WHERE ppe_no=$3",
        [issued_to, issued_to_employee_id, ppe_no]
      );
      await client.query("UPDATE property_cards SET issued_to=$1, issued_to_employee_id=$2, issued_date=$3, updated_at=CURRENT_TIMESTAMP WHERE property_number=$4",
        [issued_to, issued_to_employee_id, date_of_issue, ppe_no]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.put('/api/pars/:id', authenticateToken, async (req, res) => {
  try {
    const { par_no, ppe_no, description, issued_to, issued_to_employee_id, date_of_issue, received_from_id, received_from_position, received_by_id, received_by_position, other_info } = req.body;
    const result = await pool.query(
      `UPDATE property_acknowledgement_receipts SET par_no=$1, ppe_no=$2, description=$3, issued_to=$4, issued_to_employee_id=$5, date_of_issue=$6, received_from_id=$7, received_from_position=$8, received_by_id=$9, received_by_position=$10, other_info=$11, updated_at=CURRENT_TIMESTAMP
       WHERE id=$12 RETURNING *`,
      [par_no, ppe_no, description, issued_to, issued_to_employee_id, date_of_issue, received_from_id, received_from_position, received_by_id, received_by_position, other_info, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/pars/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM property_acknowledgement_receipts WHERE id = $1', [req.params.id]);
    res.json({ message: 'PAR deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// PROPERTY TRANSFER REPORTS (PTR)
// ==============================================================================

app.get('/api/ptrs', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ptr.*, e1.full_name as from_officer_name, e2.full_name as to_officer_name
       FROM property_transfer_reports ptr
       LEFT JOIN employees e1 ON ptr.from_accountable_officer_id = e1.id
       LEFT JOIN employees e2 ON ptr.to_accountable_officer_id = e2.id
       ORDER BY ptr.date DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/ptrs/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ptr.*, e1.full_name as from_officer_name, e2.full_name as to_officer_name
       FROM property_transfer_reports ptr
       LEFT JOIN employees e1 ON ptr.from_accountable_officer_id = e1.id
       LEFT JOIN employees e2 ON ptr.to_accountable_officer_id = e2.id
       WHERE ptr.id = $1`, [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'PTR not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/ptrs', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { ptr_no, date, from_accountable_officer_id, from_accountable_officer_name, to_accountable_officer_id, to_accountable_officer_name, description, property_number, acquisition_cost, status } = req.body;
    const result = await client.query(
      `INSERT INTO property_transfer_reports (ptr_no, date, from_accountable_officer_id, from_accountable_officer_name, to_accountable_officer_id, to_accountable_officer_name, description, property_number, acquisition_cost, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [ptr_no, date, from_accountable_officer_id, from_accountable_officer_name, to_accountable_officer_id, to_accountable_officer_name, description, property_number, acquisition_cost, status||'Pending']
    );

    // If status is completed, update property card custodian
    if ((status || 'Pending') === 'Completed' && property_number) {
      await client.query(
        `UPDATE property_cards SET issued_to_employee_id=$1, issued_to=$2, status='transferred', updated_at=CURRENT_TIMESTAMP WHERE property_number=$3`,
        [to_accountable_officer_id, to_accountable_officer_name, property_number]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.put('/api/ptrs/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { ptr_no, date, from_accountable_officer_id, from_accountable_officer_name, to_accountable_officer_id, to_accountable_officer_name, description, property_number, acquisition_cost, status } = req.body;
    const result = await client.query(
      `UPDATE property_transfer_reports SET ptr_no=$1, date=$2, from_accountable_officer_id=$3, from_accountable_officer_name=$4, to_accountable_officer_id=$5, to_accountable_officer_name=$6, description=$7, property_number=$8, acquisition_cost=$9, status=$10, updated_at=CURRENT_TIMESTAMP
       WHERE id=$11 RETURNING *`,
      [ptr_no, date, from_accountable_officer_id, from_accountable_officer_name, to_accountable_officer_id, to_accountable_officer_name, description, property_number, acquisition_cost, status, req.params.id]
    );

    if (status === 'Completed' && property_number) {
      await client.query(
        `UPDATE property_cards SET issued_to_employee_id=$1, issued_to=$2, status='transferred', updated_at=CURRENT_TIMESTAMP WHERE property_number=$3`,
        [to_accountable_officer_id, to_accountable_officer_name, property_number]
      );
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.delete('/api/ptrs/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM property_transfer_reports WHERE id = $1', [req.params.id]);
    res.json({ message: 'PTR deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// REQUISITION AND ISSUE SLIPS (RIS)
// ==============================================================================

app.get('/api/ris', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ris.*, 
              e1.full_name as requested_by_full_name,
              e2.full_name as approved_by_full_name,
              e3.full_name as issued_by_full_name,
              e4.full_name as received_by_full_name
       FROM requisition_issue_slips ris
       LEFT JOIN employees e1 ON ris.requested_by_id = e1.id
       LEFT JOIN employees e2 ON ris.approved_by_id = e2.id
       LEFT JOIN employees e3 ON ris.issued_by_id = e3.id
       LEFT JOIN employees e4 ON ris.received_by_id = e4.id
       ORDER BY ris.ris_date DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/ris/:id', authenticateToken, async (req, res) => {
  try {
    const ris = await pool.query(
      `SELECT ris.*,
              e1.full_name as requested_by_full_name,
              e2.full_name as approved_by_full_name,
              e3.full_name as issued_by_full_name,
              e4.full_name as received_by_full_name
       FROM requisition_issue_slips ris
       LEFT JOIN employees e1 ON ris.requested_by_id = e1.id
       LEFT JOIN employees e2 ON ris.approved_by_id = e2.id
       LEFT JOIN employees e3 ON ris.issued_by_id = e3.id
       LEFT JOIN employees e4 ON ris.received_by_id = e4.id
       WHERE ris.id = $1`, [req.params.id]
    );
    if (ris.rows.length === 0) return res.status(404).json({ error: 'RIS not found' });
    const items = await pool.query(
      `SELECT ri.*, i.name as item_name, i.unit as item_unit, i.stock_no FROM ris_items ri LEFT JOIN items i ON ri.item_id = i.id WHERE ri.ris_id = $1`,
      [req.params.id]
    );
    res.json({ ...ris.rows[0], items: items.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/ris', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { ris_no, division, ris_date, purpose, 
            requested_by_id, requested_by_name, requested_by_designation,
            approved_by_id, approved_by_name, approved_by_designation,
            issued_by_id, issued_by_name, issued_by_designation,
            received_by_id, received_by_name, received_by_designation,
            status, items } = req.body;

    let finalRisNo = ris_no;
    if (!finalRisNo) {
      const year = new Date().getFullYear();
      let countersResult = await client.query("SELECT data FROM settings WHERE id = 'globalCounters'");
      let counters = countersResult.rows.length > 0 ? countersResult.rows[0].data : {};
      counters.risCounters = counters.risCounters || {};
      counters.risCounters[year] = (counters.risCounters[year] || 0) + 1;
      finalRisNo = `RIS-${year}-${String(counters.risCounters[year]).padStart(4, '0')}`;
      await client.query("INSERT INTO settings (id, data) VALUES ('globalCounters', $1) ON CONFLICT (id) DO UPDATE SET data = $1", [JSON.stringify(counters)]);
    }

    const risResult = await client.query(
      `INSERT INTO requisition_issue_slips (ris_no, division, ris_date, purpose, requested_by_id, requested_by_name, requested_by_designation, approved_by_id, approved_by_name, approved_by_designation, issued_by_id, issued_by_name, issued_by_designation, received_by_id, received_by_name, received_by_designation, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [finalRisNo, division, ris_date, purpose, requested_by_id, requested_by_name, requested_by_designation, approved_by_id, approved_by_name, approved_by_designation, issued_by_id, issued_by_name, issued_by_designation, received_by_id, received_by_name, received_by_designation, status||'PENDING']
    );
    const ris = risResult.rows[0];

    if (items && items.length > 0) {
      for (const item of items) {
        await client.query(
          `INSERT INTO ris_items (ris_id, item_id, description, uom, quantity, unit_cost) VALUES ($1,$2,$3,$4,$5,$6)`,
          [ris.id, item.item_id, item.description, item.uom, item.quantity, item.unit_cost||0]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json(ris);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

// Post RIS - Deducts from inventory
app.put('/api/ris/:id/post', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const risId = req.params.id;

    const risResult = await client.query('SELECT * FROM requisition_issue_slips WHERE id = $1', [risId]);
    if (risResult.rows.length === 0) throw new Error('RIS not found');
    const ris = risResult.rows[0];

    const risItemsResult = await client.query(
      `SELECT ri.*, i.code, i.name as item_name, i.unit, i.unit_price FROM ris_items ri LEFT JOIN items i ON ri.item_id = i.id WHERE ri.ris_id = $1`,
      [risId]
    );

    for (const item of risItemsResult.rows) {
      // Deduct quantity
      await client.query('UPDATE items SET quantity = GREATEST(quantity - $1, 0), updated_at = CURRENT_TIMESTAMP WHERE id = $2', [item.quantity, item.item_id]);

      // Create stock card issue entry
      const lastSC = await client.query('SELECT balance_qty, balance_total_cost FROM stock_cards WHERE item_id = $1 ORDER BY date DESC, transaction_no DESC LIMIT 1', [item.item_id]);
      const prevQty = lastSC.rows.length > 0 ? lastSC.rows[0].balance_qty : 0;
      const prevCost = lastSC.rows.length > 0 ? parseFloat(lastSC.rows[0].balance_total_cost) : 0;
      const unitCost = item.unit_cost || item.unit_price || 0;
      const issueCost = item.quantity * unitCost;
      const balQty = Math.max(prevQty - item.quantity, 0);
      const balCost = Math.max(prevCost - issueCost, 0);
      const nextTxNo = await client.query('SELECT COALESCE(MAX(transaction_no), 0) + 1 as next FROM stock_cards WHERE item_id = $1', [item.item_id]);

      await client.query(
        `INSERT INTO stock_cards (item_id, item_code, item_name, transaction_no, date, reference, issue_qty, issue_unit_cost, issue_total_cost, balance_qty, balance_unit_cost, balance_total_cost, issue_office)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [item.item_id, item.code, item.item_name, nextTxNo.rows[0].next, ris.ris_date || new Date(), 'RIS-' + ris.ris_no,
         item.quantity, unitCost, issueCost, balQty, balQty > 0 ? balCost / balQty : 0, balCost, ris.division]
      );

      // Create supplies ledger card issue entry
      const lastSLC = await client.query('SELECT balance_qty, balance_total_cost FROM supplies_ledger_cards WHERE item_id = $1 ORDER BY date DESC, transaction_no DESC LIMIT 1', [item.item_id]);
      const prevLQty = lastSLC.rows.length > 0 ? lastSLC.rows[0].balance_qty : 0;
      const prevLCost = lastSLC.rows.length > 0 ? parseFloat(lastSLC.rows[0].balance_total_cost) : 0;
      const balLQty = Math.max(prevLQty - item.quantity, 0);
      const balLCost = Math.max(prevLCost - issueCost, 0);
      const nextLTxNo = await client.query('SELECT COALESCE(MAX(transaction_no), 0) + 1 as next FROM supplies_ledger_cards WHERE item_id = $1', [item.item_id]);

      await client.query(
        `INSERT INTO supplies_ledger_cards (item_id, item_code, item_name, transaction_no, date, reference, issue_qty, issue_unit_cost, issue_total_cost, balance_qty, balance_unit_cost, balance_total_cost, issue_office)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [item.item_id, item.code, item.item_name, nextLTxNo.rows[0].next, ris.ris_date || new Date(), 'RIS-' + ris.ris_no,
         item.quantity, unitCost, issueCost, balLQty, balLQty > 0 ? balLCost / balLQty : 0, balLCost, ris.division]
      );
    }

    await client.query("UPDATE requisition_issue_slips SET status='POSTED', updated_at=CURRENT_TIMESTAMP WHERE id=$1", [risId]);

    await client.query('COMMIT');
    res.json({ message: 'RIS posted and inventory updated' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('RIS post error:', err);
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

app.put('/api/ris/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { ris_no, division, ris_date, purpose, requested_by_id, requested_by_name, requested_by_designation,
            approved_by_id, approved_by_name, approved_by_designation, issued_by_id, issued_by_name, issued_by_designation,
            received_by_id, received_by_name, received_by_designation, status, items } = req.body;
    const result = await client.query(
      `UPDATE requisition_issue_slips SET ris_no=$1, division=$2, ris_date=$3, purpose=$4, 
       requested_by_id=$5, requested_by_name=$6, requested_by_designation=$7,
       approved_by_id=$8, approved_by_name=$9, approved_by_designation=$10,
       issued_by_id=$11, issued_by_name=$12, issued_by_designation=$13,
       received_by_id=$14, received_by_name=$15, received_by_designation=$16,
       status=$17, updated_at=CURRENT_TIMESTAMP WHERE id=$18 RETURNING *`,
      [ris_no, division, ris_date, purpose, requested_by_id, requested_by_name, requested_by_designation,
       approved_by_id, approved_by_name, approved_by_designation, issued_by_id, issued_by_name, issued_by_designation,
       received_by_id, received_by_name, received_by_designation, status, req.params.id]
    );
    if (items) {
      await client.query('DELETE FROM ris_items WHERE ris_id = $1', [req.params.id]);
      for (const item of items) {
        await client.query(
          `INSERT INTO ris_items (ris_id, item_id, description, uom, quantity, unit_cost) VALUES ($1,$2,$3,$4,$5,$6)`,
          [req.params.id, item.item_id, item.description, item.uom, item.quantity, item.unit_cost||0]
        );
      }
    }
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.delete('/api/ris/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM requisition_issue_slips WHERE id = $1', [req.params.id]);
    res.json({ message: 'RIS deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// RECEIVED SEMI-EXPENDABLE ITEMS
// ==============================================================================

app.get('/api/received-semi-expendable', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `SELECT rsei.*, i.name as item_name, i.unit, i.unit_price, i.uacs_code, e.full_name as issued_to_name
                 FROM received_semi_expendable_items rsei
                 LEFT JOIN items i ON rsei.item_id = i.id
                 LEFT JOIN employees e ON rsei.issued_to_employee_id = e.id`;
    const params = [];
    if (status) { query += ' WHERE rsei.status = $1'; params.push(status); }
    query += ' ORDER BY rsei.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/received-semi-expendable/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT rsei.*, i.name as item_name, i.unit, i.unit_price FROM received_semi_expendable_items rsei LEFT JOIN items i ON rsei.item_id = i.id WHERE rsei.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/received-semi-expendable/:id', authenticateToken, async (req, res) => {
  try {
    const { status, issued_to, issued_to_employee_id, ics_no, serial_no, brand, model } = req.body;
    const result = await pool.query(
      `UPDATE received_semi_expendable_items SET status=$1, issued_to=$2, issued_to_employee_id=$3, ics_no=$4, serial_no=$5, brand=$6, model=$7, updated_at=CURRENT_TIMESTAMP
       WHERE id=$8 RETURNING *`,
      [status, issued_to, issued_to_employee_id, ics_no, serial_no, brand, model, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// RECEIVED CAPITAL OUTLAY ITEMS
// ==============================================================================

app.get('/api/received-capital-outlay', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `SELECT rcoi.*, i.name as item_name, i.unit, i.unit_price, i.uacs_code, e.full_name as issued_to_name
                 FROM received_capital_outlay_items rcoi
                 LEFT JOIN items i ON rcoi.item_id = i.id
                 LEFT JOIN employees e ON rcoi.issued_to_employee_id = e.id`;
    const params = [];
    if (status) { query += ' WHERE rcoi.status = $1'; params.push(status); }
    query += ' ORDER BY rcoi.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/received-capital-outlay/:id', authenticateToken, async (req, res) => {
  try {
    const { status, issued_to, issued_to_employee_id, serial_no, brand, model } = req.body;
    const result = await pool.query(
      `UPDATE received_capital_outlay_items SET status=$1, issued_to=$2, issued_to_employee_id=$3, serial_no=$4, brand=$5, model=$6, updated_at=CURRENT_TIMESTAMP
       WHERE id=$7 RETURNING *`,
      [status, issued_to, issued_to_employee_id, serial_no, brand, model, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// TRIP TICKETS
// ==============================================================================

app.get('/api/trip-tickets', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trip_tickets ORDER BY date_of_travel DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/trip-tickets/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trip_tickets WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Trip ticket not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/trip-tickets', authenticateToken, async (req, res) => {
  try {
    const { trip_ticket_no, requesting_party, date_of_request, date_of_travel, return_date, contact_no,
            time_of_departure, purpose, destination, passengers, requested_by_employee, requested_by_designation,
            approved_by_employee, approved_by_designation, status } = req.body;

    let finalTripNo = trip_ticket_no;
    if (!finalTripNo) {
      const now = new Date();
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      let countersResult = await pool.query("SELECT data FROM settings WHERE id = 'tripTicketCounters'");
      let counters = countersResult.rows.length > 0 ? countersResult.rows[0].data : { counters: {} };
      counters.counters = counters.counters || {};
      counters.counters[yearMonth] = (counters.counters[yearMonth] || 0) + 1;
      finalTripNo = `TT-${yearMonth}-${String(counters.counters[yearMonth]).padStart(4, '0')}`;
      await pool.query("INSERT INTO settings (id, data) VALUES ('tripTicketCounters', $1) ON CONFLICT (id) DO UPDATE SET data = $1", [JSON.stringify(counters)]);
    }

    const result = await pool.query(
      `INSERT INTO trip_tickets (trip_ticket_no, requesting_party, date_of_request, date_of_travel, return_date, contact_no, time_of_departure, purpose, destination, passengers, requested_by_employee, requested_by_designation, approved_by_employee, approved_by_designation, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [finalTripNo, requesting_party, date_of_request, date_of_travel, return_date, contact_no, time_of_departure, purpose, destination, JSON.stringify(passengers||[]), requested_by_employee, requested_by_designation, approved_by_employee, approved_by_designation, status||'Pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/trip-tickets/:id', authenticateToken, async (req, res) => {
  try {
    const { trip_ticket_no, requesting_party, date_of_request, date_of_travel, return_date, contact_no,
            time_of_departure, purpose, destination, passengers, requested_by_employee, requested_by_designation,
            approved_by_employee, approved_by_designation, status } = req.body;
    const result = await pool.query(
      `UPDATE trip_tickets SET trip_ticket_no=$1, requesting_party=$2, date_of_request=$3, date_of_travel=$4, return_date=$5, contact_no=$6, time_of_departure=$7, purpose=$8, destination=$9, passengers=$10, requested_by_employee=$11, requested_by_designation=$12, approved_by_employee=$13, approved_by_designation=$14, status=$15, updated_at=CURRENT_TIMESTAMP
       WHERE id=$16 RETURNING *`,
      [trip_ticket_no, requesting_party, date_of_request, date_of_travel, return_date, contact_no, time_of_departure, purpose, destination, JSON.stringify(passengers||[]), requested_by_employee, requested_by_designation, approved_by_employee, approved_by_designation, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/trip-tickets/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM trip_tickets WHERE id = $1', [req.params.id]);
    res.json({ message: 'Trip ticket deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// PO PACKETS
// ==============================================================================

// Document Monitoring - comprehensive view of all POs with their document chain
app.get('/api/po-packets/monitoring', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        pr.id as pr_id, 
        pr.pr_number, pr.status as pr_status,
        pr.purpose, pr.total_amount as pr_amount, pr.created_at as pr_created_at,
        pr_req.full_name as pr_requested_by_name, pr_app.full_name as pr_approved_by_name,
        d.name as division_name, d.code as division_code,
        -- RFQ info
        rfq.id as rfq_id, rfq.rfq_number, rfq.status as rfq_status,
        rfq_u.full_name as rfq_created_by_name,
        -- Abstract info
        ab.id as abstract_id, ab.abstract_number, ab.status as abstract_status,
        ab_u.full_name as abstract_created_by_name,
        -- BAC Resolution info
        br.id as bac_res_id, br.resolution_number, br.status as bac_res_status,
        br_app.full_name as bac_res_approved_by_name,
        -- Post-Qualification info
        pq.id as postqual_id, pq.postqual_number, pq.status as postqual_status,
        pq_u.full_name as postqual_created_by_name,
        -- NOA info
        noa.id as noa_id, noa.noa_number, noa.status as noa_status,
        noa_u.full_name as noa_created_by_name,
        -- PO info
        po.id as po_id, po.po_number, po.total_amount, po.status as po_status,
        po.po_date, po.created_at as po_created_at,
        s.name as supplier_name,
        po_creator.full_name as po_created_by_name,
        po_approver.full_name as po_approved_by_name,
        -- IAR info
        iar.id as iar_id, iar.iar_number, iar.acceptance as iar_status,
        iar_insp.full_name as iar_inspected_by_name,
        iar_recv.full_name as iar_received_by_name,
        -- PO Packet info
        pp.id as packet_id, pp.status as packet_status,
        pp.compiled_at, pp.chief_signed_at, pp.director_signed_at,
        pp_chief.full_name as chief_signed_by_name,
        pp_dir.full_name as director_signed_by_name
      FROM purchaserequests pr
      LEFT JOIN departments d ON pr.dept_id = d.id
      LEFT JOIN users pr_req ON pr.requested_by = pr_req.id
      LEFT JOIN users pr_app ON pr.approved_by = pr_app.id
      LEFT JOIN rfqs rfq ON rfq.pr_id = pr.id
      LEFT JOIN users rfq_u ON rfq.created_by = rfq_u.id
      LEFT JOIN abstracts ab ON ab.rfq_id = rfq.id
      LEFT JOIN users ab_u ON ab.created_by = ab_u.id
      LEFT JOIN bac_resolutions br ON br.abstract_id = ab.id
      LEFT JOIN users br_app ON br.approved_by = br_app.id
      LEFT JOIN post_qualifications pq ON pq.abstract_id = ab.id
      LEFT JOIN users pq_u ON pq.created_by = pq_u.id
      LEFT JOIN notices_of_award noa ON noa.bac_resolution_id = br.id
      LEFT JOIN users noa_u ON noa.created_by = noa_u.id
      LEFT JOIN purchaseorders po ON po.pr_id = pr.id
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN users po_creator ON po.created_by = po_creator.id
      LEFT JOIN users po_approver ON po.approved_by = po_approver.id
      LEFT JOIN iars iar ON iar.po_id = po.id
      LEFT JOIN users iar_insp ON iar.inspected_by = iar_insp.id
      LEFT JOIN users iar_recv ON iar.received_by = iar_recv.id
      LEFT JOIN po_packets pp ON pp.po_id = po.id
      LEFT JOIN users pp_chief ON pp.chief_signed_by = pp_chief.id
      LEFT JOIN users pp_dir ON pp.director_signed_by = pp_dir.id
      ORDER BY pr.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { 
    console.error('PO Packet monitoring error:', err);
    res.status(500).json({ error: err.message }); 
  }
});

app.get('/api/po-packets', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pp.*, po.po_number FROM po_packets pp LEFT JOIN purchaseorders po ON pp.po_id = po.id ORDER BY pp.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/po-packets', authenticateToken, async (req, res) => {
  try {
    const { po_id, status, remarks } = req.body;
    const result = await pool.query(
      `INSERT INTO po_packets (po_id, status, compiled_by, compiled_at, remarks) VALUES ($1,$2,$3,CURRENT_TIMESTAMP,$4) RETURNING *`,
      [po_id, status||'draft', req.user.id, remarks]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/po-packets/:id', authenticateToken, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    let updates = ['status=$1', 'remarks=$2', 'updated_at=CURRENT_TIMESTAMP'];
    let params = [status, remarks];
    if (status === 'signed') { updates.push(`chief_signed_at=CURRENT_TIMESTAMP, chief_signed_by=$${params.length + 1}`); params.push(req.user.id); }
    params.push(req.params.id);
    const result = await pool.query(`UPDATE po_packets SET ${updates.join(', ')} WHERE id=$${params.length} RETURNING *`, params);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Chief Sign endpoint
app.put('/api/po-packets/:id/chief-sign', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE po_packets SET chief_signed_at=CURRENT_TIMESTAMP, chief_signed_by=$1,
       status = CASE WHEN director_signed_at IS NOT NULL THEN 'signed' ELSE 'for_signing' END,
       updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'PO Packet not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Director Sign endpoint
app.put('/api/po-packets/:id/director-sign', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE po_packets SET director_signed_at=CURRENT_TIMESTAMP, director_signed_by=$1,
       status = CASE WHEN chief_signed_at IS NOT NULL THEN 'signed' ELSE 'for_signing' END,
       updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'PO Packet not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/po-packets/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM po_packets WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'PO Packet not found' });
    res.json({ message: 'PO Packet deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// COA SUBMISSIONS
// ==============================================================================

app.get('/api/coa-submissions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cs.*, po.po_number, po.total_amount, iar.iar_number FROM coa_submissions cs
       LEFT JOIN purchaseorders po ON cs.po_id = po.id LEFT JOIN iars iar ON cs.iar_id = iar.id
       ORDER BY cs.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/coa-submissions/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cs.*, po.po_number, po.total_amount, po.supplier_id, po.purpose, po.place_of_delivery,
              s.name as supplier_name, iar.iar_number
       FROM coa_submissions cs
       LEFT JOIN purchaseorders po ON cs.po_id = po.id
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       LEFT JOIN iars iar ON cs.iar_id = iar.id
       WHERE cs.id = $1`, [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'COA Submission not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/coa-submissions', authenticateToken, async (req, res) => {
  try {
    const { submission_number, po_id, iar_id, po_packet_id, submission_date, status, documents_included } = req.body;
    const result = await pool.query(
      `INSERT INTO coa_submissions (submission_number, po_id, iar_id, po_packet_id, submission_date, status, documents_included, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [submission_number, po_id, iar_id, po_packet_id, submission_date, status||'submitted', documents_included||'{}', req.user.id]
    );
    // Update PO workflow status
    if (po_id) {
      await pool.query("UPDATE purchaseorders SET workflow_status='submitted_to_coa', updated_at=CURRENT_TIMESTAMP WHERE id=$1", [po_id]);
    }
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/coa-submissions/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM coa_submissions WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'COA Submission not found' });
    res.json({ message: 'COA Submission deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// SETTINGS / COUNTERS
// ==============================================================================

app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings ORDER BY id');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/settings/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Setting not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/settings/:id', authenticateToken, async (req, res) => {
  try {
    const { data } = req.body;
    const result = await pool.query(
      "INSERT INTO settings (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP RETURNING *",
      [req.params.id, JSON.stringify(data)]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// REPORTS QUERIES
// ==============================================================================

// RSMI - Report of Supplies and Materials Issued (Appendix 64)
app.get('/api/reports/rsmi', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Detail rows: individual RIS line items in the period
    const details = await pool.query(
      `SELECT ris.ris_no, ris.division as responsibility_center_code,
              i.stock_no, ri.description as item, i.unit, ri.quantity as quantity_issued,
              ri.unit_cost, (ri.quantity * ri.unit_cost) as amount,
              i.uacs_code as uacs_object_code, ri.item_id
       FROM requisition_issue_slips ris
       JOIN ris_items ri ON ri.ris_id = ris.id
       LEFT JOIN items i ON ri.item_id = i.id
       WHERE ris.status = 'POSTED'
         AND ($1::date IS NULL OR ris.ris_date >= $1::date)
         AND ($2::date IS NULL OR ris.ris_date <= $2::date)
       ORDER BY ris.ris_no, i.stock_no`,
      [start_date || null, end_date || null]
    );

    // Recapitulation: grouped by stock_no with totals and UACS
    const recapitulation = await pool.query(
      `SELECT i.stock_no, SUM(ri.quantity) as total_quantity,
              ri.unit_cost, SUM(ri.quantity * ri.unit_cost) as total_cost,
              i.uacs_code as uacs_object_code
       FROM requisition_issue_slips ris
       JOIN ris_items ri ON ri.ris_id = ris.id
       LEFT JOIN items i ON ri.item_id = i.id
       WHERE ris.status = 'POSTED'
         AND ($1::date IS NULL OR ris.ris_date >= $1::date)
         AND ($2::date IS NULL OR ris.ris_date <= $2::date)
       GROUP BY i.stock_no, ri.unit_cost, i.uacs_code
       ORDER BY i.stock_no`,
      [start_date || null, end_date || null]
    );

    // Grand total
    const grandTotal = details.rows.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    res.json({
      entity_name: 'DMW-CARAGA',
      date_from: start_date || null,
      date_to: end_date || null,
      details: details.rows,
      recapitulation: recapitulation.rows,
      grand_total: grandTotal
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// RPCI - Report on Physical Count of Inventories
app.get('/api/reports/rpci', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.id, i.code, i.stock_no, i.name, i.description, i.unit, i.unit_price, i.category,
              i.quantity as on_hand_qty, i.quantity * i.unit_price as on_hand_value,
              COALESCE(
                (SELECT sc.balance_qty FROM stock_cards sc WHERE sc.item_id = i.id ORDER BY sc.date DESC, sc.transaction_no DESC LIMIT 1), 0
              ) as card_balance,
              i.reorder_point
       FROM items i WHERE i.is_active = TRUE AND i.category = 'Expendable'
       ORDER BY i.name`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// RPCPPE - Report on Physical Count of PPE
app.get('/api/reports/rpcppe', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pc.property_number, pc.description, pc.acquisition_cost, pc.acquisition_date,
              pc.issued_to, e.full_name as custodian_name, d.name as department_name,
              pc.status, i.category, i.uacs_code
       FROM property_cards pc
       LEFT JOIN employees e ON pc.issued_to_employee_id = e.id
       LEFT JOIN departments d ON e.dept_id = d.id
       LEFT JOIN items i ON pc.item_id = i.id
       WHERE i.category IN ('Semi-Expendable', 'Capital Outlay')
       ORDER BY pc.property_number`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// IIRUP - Inventory and Inspection Report of Unserviceable Properties
app.get('/api/reports/iirup', authenticateToken, async (req, res) => {
  try {
    const semiExp = await pool.query(
      `SELECT rsei.*, i.name as item_name, i.unit_price, e.full_name as custodian_name
       FROM received_semi_expendable_items rsei
       LEFT JOIN items i ON rsei.item_id = i.id
       LEFT JOIN employees e ON rsei.issued_to_employee_id = e.id
       WHERE rsei.status = 'Unserviceable'`
    );
    const capitalOutlay = await pool.query(
      `SELECT rcoi.*, i.name as item_name, i.unit_price, e.full_name as custodian_name
       FROM received_capital_outlay_items rcoi
       LEFT JOIN items i ON rcoi.item_id = i.id
       LEFT JOIN employees e ON rcoi.issued_to_employee_id = e.id
       WHERE rcoi.status = 'Unserviceable'`
    );
    res.json({ semi_expendable: semiExp.rows, capital_outlay: capitalOutlay.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Stock Level Report
app.get('/api/reports/stock-levels', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.id, i.code, i.stock_no, i.name, i.category, i.unit, i.quantity, i.reorder_point, i.unit_price,
              CASE WHEN i.quantity = 0 THEN 'Out of Stock' WHEN i.quantity <= i.reorder_point THEN 'Low Stock' ELSE 'In Stock' END as stock_status
       FROM items i WHERE i.is_active = TRUE ORDER BY i.quantity ASC, i.name`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Property Accountability Report
app.get('/api/reports/property-accountability', authenticateToken, async (req, res) => {
  try {
    const { employee_id } = req.query;
    let query = `SELECT pc.property_number, pc.description, pc.acquisition_cost, pc.acquisition_date,
                        pc.issued_to, pc.issued_date, pc.status, e.full_name as custodian_name, d.name as department_name
                 FROM property_cards pc
                 LEFT JOIN employees e ON pc.issued_to_employee_id = e.id
                 LEFT JOIN departments d ON e.dept_id = d.id
                 WHERE pc.status = 'active'`;
    const params = [];
    if (employee_id) { query += ' AND pc.issued_to_employee_id = $1'; params.push(employee_id); }
    query += ' ORDER BY pc.property_number';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Monthly Travel Summary
app.get('/api/reports/monthly-travel-summary', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.query;
    let query = `SELECT * FROM trip_tickets WHERE 1=1`;
    const params = [];
    if (year) { query += ` AND EXTRACT(YEAR FROM date_of_travel) = $${params.length + 1}`; params.push(year); }
    if (month) { query += ` AND EXTRACT(MONTH FROM date_of_travel) = $${params.length + 1}`; params.push(month); }
    query += ' ORDER BY date_of_travel';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// AUDIT LOG (legacy)
// ==============================================================================

app.get('/api/audit-log', authenticateToken, authorizeRoles('admin', 'auditor'), async (req, res) => {
  try {
    const { table_name, limit: lim } = req.query;
    let query = `SELECT al.*, u.username FROM audit_log al LEFT JOIN users u ON al.user_id = u.id`;
    const params = [];
    if (table_name) { query += ' WHERE al.table_name = $1'; params.push(table_name); }
    query += ` ORDER BY al.created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(lim) || 100);
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// ACTIVITY LOGS (materialized view)
// ==============================================================================

// Get activity logs from materialized view (fast, includes user role & department)
app.get('/api/activity-logs', authenticateToken, authorizeRoles('admin', 'hope'), async (req, res) => {
  try {
    const { table_name, action, user_id, username, date_from, date_to, limit: lim, offset: off } = req.query;
    let query = 'SELECT * FROM activity_logs_view WHERE 1=1';
    const params = [];

    if (table_name) { params.push(table_name); query += ` AND table_name = $${params.length}`; }
    if (action) { params.push(action); query += ` AND action = $${params.length}`; }
    if (user_id) { params.push(parseInt(user_id)); query += ` AND user_id = $${params.length}`; }
    if (username) { params.push(`%${username}%`); query += ` AND (username ILIKE $${params.length} OR full_name ILIKE $${params.length})`; }
    if (date_from) { params.push(date_from); query += ` AND created_at >= $${params.length}::timestamp`; }
    if (date_to) { params.push(date_to + ' 23:59:59'); query += ` AND created_at <= $${params.length}::timestamp`; }

    // Count total for pagination
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ' ORDER BY created_at DESC';
    params.push(parseInt(lim) || 100);
    query += ` LIMIT $${params.length}`;
    params.push(parseInt(off) || 0);
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    res.json({ total, data: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get activity logs directly from table (real-time, no refresh needed)
app.get('/api/activity-logs/live', authenticateToken, authorizeRoles('admin', 'hope'), async (req, res) => {
  try {
    const { table_name, action, user_id, limit: lim } = req.query;
    let query = `SELECT al.*, u.full_name, COALESCE(u.role,'unknown') as user_role, u.secondary_role as user_secondary_role, COALESCE(d.name,'') as department
                 FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id LEFT JOIN departments d ON u.dept_id = d.id WHERE 1=1`;
    const params = [];
    if (table_name) { params.push(table_name); query += ` AND al.table_name = $${params.length}`; }
    if (action) { params.push(action); query += ` AND al.action = $${params.length}`; }
    if (user_id) { params.push(parseInt(user_id)); query += ` AND al.user_id = $${params.length}`; }
    query += ' ORDER BY al.created_at DESC';
    params.push(parseInt(lim) || 100);
    query += ` LIMIT $${params.length}`;
    const result = await pool.query(query, params);
    res.json({ logs: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Refresh the materialized view
app.post('/api/activity-logs/refresh', authenticateToken, authorizeRoles('admin', 'hope'), async (req, res) => {
  try {
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY activity_logs_view');
    res.json({ message: 'Activity logs view refreshed successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get activity summary (counts by action, by user, by table)
app.get('/api/activity-logs/summary', authenticateToken, authorizeRoles('admin', 'hope'), async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    const dateFilter = [];
    const params = [];
    if (date_from) { params.push(date_from); dateFilter.push(`created_at >= $${params.length}::timestamp`); }
    if (date_to) { params.push(date_to + ' 23:59:59'); dateFilter.push(`created_at <= $${params.length}::timestamp`); }
    const where = dateFilter.length > 0 ? 'WHERE ' + dateFilter.join(' AND ') : '';

    const byAction = await pool.query(`SELECT action, COUNT(*) as count FROM activity_logs ${where} GROUP BY action ORDER BY count DESC`, params);
    const byUser = await pool.query(`SELECT user_id, username, COUNT(*) as count FROM activity_logs ${where} GROUP BY user_id, username ORDER BY count DESC LIMIT 20`, params);
    const byTable = await pool.query(`SELECT table_name, COUNT(*) as count FROM activity_logs ${where} GROUP BY table_name ORDER BY count DESC`, params);
    const total = await pool.query(`SELECT COUNT(*) FROM activity_logs ${where}`, params);

    res.json({
      total: parseInt(total.rows[0].count),
      by_action: byAction.rows,
      by_user: byUser.rows,
      by_table: byTable.rows
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// HEALTH CHECK
// ==============================================================================

app.get('/api/health', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT NOW() AS time');
    dbConnected = true;
    const mem = process.memoryUsage();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      server_ip: getLocalIP(),
      uptime_seconds: Math.floor(process.uptime()),
      memory_mb: Math.round(mem.rss / 1024 / 1024),
      heap_used_mb: Math.round(mem.heapUsed / 1024 / 1024),
      db_connected: true,
      db_time: dbCheck.rows[0].time,
      pool_total: pool.totalCount,
      pool_idle: pool.idleCount,
      pool_waiting: pool.waitingCount
    });
  } catch (err) {
    dbConnected = false;
    res.status(503).json({
      status: 'DEGRADED',
      timestamp: new Date().toISOString(),
      server_ip: getLocalIP(),
      uptime_seconds: Math.floor(process.uptime()),
      db_connected: false,
      db_error: err.message
    });
  }
});

// ==============================================================================
// ==============================================================================
// FILE ATTACHMENT ENDPOINTS
// ==============================================================================

// Upload files and link to an entity (POST /api/attachments/upload)
// multipart form fields: entity_type, entity_id, description (optional), files[]
app.post('/api/attachments/upload', upload.array('files', 10), async (req, res) => {
  try {
    const { entity_type, entity_id, description } = req.body;
    if (!entity_type || !entity_id) {
      return res.status(400).json({ error: 'entity_type and entity_id are required' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const results = [];
    for (const file of req.files) {
      // Compute SHA256 checksum
      const fileBuffer = fs.readFileSync(file.path);
      const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // Insert into attachments table
      const attResult = await pool.query(
        `INSERT INTO attachments (original_name, stored_name, mime_type, file_size_bytes, storage_path, checksum_sha256)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [file.originalname, file.filename, file.mimetype, file.size, file.path, checksum]
      );
      const attachment = attResult.rows[0];

      // Link to entity
      await pool.query(
        `INSERT INTO entity_attachments (entity_type, entity_id, attachment_id, description)
         VALUES ($1, $2, $3, $4)`,
        [entity_type, parseInt(entity_id), attachment.id, description || file.originalname]
      );

      results.push(attachment);
    }

    res.json({ message: `${results.length} file(s) uploaded successfully`, attachments: results });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Download a specific attachment (GET /api/attachments/download/:id)
// MUST be defined BEFORE the :entity_type/:entity_id wildcard route
app.get('/api/attachments/download/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM attachments WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Attachment not found' });
    const att = result.rows[0];
    if (!fs.existsSync(att.storage_path)) return res.status(404).json({ error: 'File not found on disk' });
    res.setHeader('Content-Disposition', `attachment; filename="${att.original_name}"`);
    res.setHeader('Content-Type', att.mime_type);
    res.sendFile(path.resolve(att.storage_path));
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: err.message });
  }
});

// View/preview a specific attachment inline (GET /api/attachments/view/:id or /api/attachments/view/:id/filename.ext)
// MUST be defined BEFORE the :entity_type/:entity_id wildcard route
app.get(/^\/api\/attachments\/view\/(\d+)(?:\/.*)?$/, authenticateToken, async (req, res) => {
  req.params = { id: req.params[0] };
  try {
    const result = await pool.query('SELECT * FROM attachments WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Attachment not found' });
    const att = result.rows[0];
    if (!fs.existsSync(att.storage_path)) return res.status(404).json({ error: 'File not found on disk' });
    res.setHeader('Content-Disposition', `inline; filename="${att.original_name}"`);
    res.setHeader('Content-Type', att.mime_type);
    res.sendFile(path.resolve(att.storage_path));
  } catch (err) {
    console.error('View error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Merge multiple attachments into a single PDF (POST /api/attachments/merge-download)
app.post('/api/attachments/merge-download', async (req, res) => {
  try {
    const { attachmentIds } = req.body;
    if (!attachmentIds || !attachmentIds.length) return res.status(400).json({ error: 'No attachment IDs provided' });

    const result = await pool.query('SELECT * FROM attachments WHERE id = ANY($1) ORDER BY id', [attachmentIds]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No attachments found' });

    const mergedPdf = await PDFDocument.create();

    for (const att of result.rows) {
      if (!fs.existsSync(att.storage_path)) continue;
      const fileBytes = fs.readFileSync(att.storage_path);

      if (att.mime_type === 'application/pdf') {
        // Merge PDF pages
        try {
          const srcPdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
          const pages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
          pages.forEach(p => mergedPdf.addPage(p));
        } catch (pdfErr) {
          console.error(`Skipping corrupted PDF ${att.original_name}:`, pdfErr.message);
        }
      } else if (att.mime_type && att.mime_type.startsWith('image/')) {
        // Embed image as a full page
        try {
          let img;
          if (att.mime_type === 'image/png') {
            img = await mergedPdf.embedPng(fileBytes);
          } else {
            img = await mergedPdf.embedJpg(fileBytes);
          }
          const page = mergedPdf.addPage([img.width, img.height]);
          page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        } catch (imgErr) {
          console.error(`Skipping image ${att.original_name}:`, imgErr.message);
        }
      }
      // Non-PDF/image files are skipped (Word, Excel cannot be merged into PDF server-side)
    }

    if (mergedPdf.getPageCount() === 0) {
      return res.status(400).json({ error: 'No PDF or image files could be merged' });
    }

    const mergedBytes = await mergedPdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="PO_Packet_Merged.pdf"');
    res.send(Buffer.from(mergedBytes));
  } catch (err) {
    console.error('Merge download error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all attachments for an entity (GET /api/attachments/:entity_type/:entity_id)
app.get('/api/attachments/:entity_type/:entity_id', authenticateToken, async (req, res) => {
  try {
    const { entity_type, entity_id } = req.params;
    const result = await pool.query(
      `SELECT a.*, ea.description, ea.is_required, ea.id as link_id
       FROM entity_attachments ea
       JOIN attachments a ON a.id = ea.attachment_id
       WHERE ea.entity_type = $1 AND ea.entity_id = $2
       ORDER BY a.created_at DESC`,
      [entity_type, parseInt(entity_id)]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get attachments error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete attachment (DELETE /api/attachments/:id)
app.delete('/api/attachments/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM attachments WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Attachment not found' });
    const att = result.rows[0];

    // Delete from DB (cascades to entity_attachments)
    await pool.query('DELETE FROM attachments WHERE id = $1', [att.id]);

    // Delete file from disk
    if (fs.existsSync(att.storage_path)) fs.unlinkSync(att.storage_path);

    res.json({ message: 'Attachment deleted successfully' });
  } catch (err) {
    console.error('Delete attachment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// NOTIFICATIONS API
// ==============================================================================

// Helper: create a notification (used internally by other endpoints too)
async function createNotification(userId, { type = 'info', icon = 'fas fa-bell', title, message, reference_type, reference_id, reference_code }) {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, icon, title, message, reference_type, reference_id, reference_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, type, icon, title, message || '', reference_type || null, reference_id || null, reference_code || null]
    );
  } catch (err) {
    console.error('Create notification error:', err);
  }
}

// Broadcast notification to all users (or users with specific roles)
async function broadcastNotification({ type, icon, title, message, reference_type, reference_id, reference_code, roles }) {
  try {
    let users;
    if (roles && roles.length > 0) {
      users = await pool.query('SELECT id FROM users WHERE role = ANY($1) AND is_active != false', [roles]);
    } else {
      users = await pool.query('SELECT id FROM users WHERE is_active != false');
    }
    for (const u of users.rows) {
      await createNotification(u.id, { type, icon, title, message, reference_type, reference_id, reference_code });
    }
  } catch (err) {
    console.error('Broadcast notification error:', err);
  }
}

// GET /api/notifications — get notifications for current user
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const unreadOnly = req.query.unread === 'true';
    let query = 'SELECT * FROM notifications WHERE user_id = $1';
    const params = [req.user.id];
    if (unreadOnly) {
      query += ' AND is_read = false';
    }
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/count — get unread count
app.get('/api/notifications/count', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error('Notification count error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:id/read — mark single notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/read-all — mark all as read for current user
app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );
    res.json({ message: 'All notifications marked as read', count: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notifications/:id — delete a notification
app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notifications — clear all notifications for current user
app.delete('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM notifications WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ message: 'All notifications cleared', count: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// SERVER START
// ==============================================================================

// ==============================================================================
// GLOBAL ERROR HANDLER — catches any unhandled route/middleware errors
// ==============================================================================
app.use((err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ==============================================================================
// SERVER START + GRACEFUL SHUTDOWN
// ==============================================================================

const PORT = parseInt(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// ==============================================================================
// SOCKET.IO — Real-time communication with all Electron client apps
// ==============================================================================
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  // Electron apps connect over the LAN — keep connections alive aggressively
  pingInterval: 10000,   // ping every 10s
  pingTimeout: 30000,    // disconnect if no pong in 30s
  transports: ['websocket', 'polling'],  // prefer websocket for speed
});

// Make io globally accessible so the broadcast middleware can use it
global.io = io;

// Track connected Electron clients
const connectedClients = new Map(); // socketId → { username, connectedAt, ip }

io.on('connection', (socket) => {
  const clientIP = socket.handshake.address;
  const username = socket.handshake.query?.username || 'unknown';
  connectedClients.set(socket.id, {
    username,
    connectedAt: new Date().toISOString(),
    ip: clientIP
  });
  console.log(`[SOCKET] Client connected: ${username} (${clientIP}) — ${connectedClients.size} total`);

  // Notify all clients about the updated connection count
  io.emit('clients_count', { count: connectedClients.size });

  // Client can authenticate with their JWT after connecting
  socket.on('authenticate', (data) => {
    try {
      const decoded = jwt.verify(data.token, JWT_SECRET);
      const info = connectedClients.get(socket.id);
      if (info) {
        info.username = decoded.username;
        info.userId = decoded.id;
        info.role = decoded.role;
      }
      socket.emit('authenticated', { success: true, username: decoded.username });
      console.log(`[SOCKET] Authenticated: ${decoded.username} (${clientIP})`);
    } catch (err) {
      socket.emit('authenticated', { success: false, error: 'Invalid token' });
    }
  });

  // Client can request a manual refresh broadcast (e.g. after reconnecting)
  socket.on('request_refresh', (data) => {
    // Just re-emit to THIS client so it knows to reload its data
    socket.emit('data_changed', {
      resource: data?.resource || 'all',
      action: 'refresh',
      timestamp: new Date().toISOString(),
      user: null
    });
  });

  socket.on('disconnect', (reason) => {
    const info = connectedClients.get(socket.id);
    const who = info?.username || 'unknown';
    connectedClients.delete(socket.id);
    console.log(`[SOCKET] Client disconnected: ${who} (${reason}) — ${connectedClients.size} total`);
    io.emit('clients_count', { count: connectedClients.size });
  });
});

// API: Get connected Electron clients (for admin monitoring)
app.get('/api/connected-clients', authenticateToken, (req, res) => {
  const clients = [];
  for (const [socketId, info] of connectedClients) {
    clients.push({ socketId, ...info });
  }
  res.json({ count: clients.length, clients });
});

// ==============================================================================
// START HTTP + WEBSOCKET SERVER
// ==============================================================================

const server = httpServer.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  console.log('========================================');
  console.log('  DMW Procurement & Inventory System    ');
  console.log('  Full API Server v4.0 (Real-Time)      ');
  console.log('========================================');
  console.log(`Server running on:`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Network: http://${localIP}:${PORT}`);
  console.log(`  Socket:  ws://${localIP}:${PORT}`);
  console.log('----------------------------------------');
  console.log('Real-Time: Socket.IO enabled — all Electron clients sync instantly');
  console.log('----------------------------------------');
  console.log('API Endpoints:');
  console.log('  Auth:          POST /api/auth/login, /register');
  console.log('  Dashboard:     GET  /api/dashboard/stats');
  console.log('  Departments:   CRUD /api/departments');
  console.log('  Divisions:     CRUD /api/divisions');
  console.log('  Offices:       CRUD /api/offices');
  console.log('  Users:         CRUD /api/users');
  console.log('  Employees:     CRUD /api/employees');
  console.log('  Designations:  CRUD /api/designations');
  console.log('  Suppliers:     CRUD /api/suppliers');
  console.log('  Items:         CRUD /api/items');
  console.log('  Fund Clusters: CRUD /api/fund-clusters');
  console.log('  Proc Modes:    CRUD /api/procurement-modes');
  console.log('  UACS Codes:    CRUD /api/uacs-codes');
  console.log('  UOMs:          CRUD /api/uoms');
  console.log('  Plans:         CRUD /api/plans');
  console.log('  PRs:           CRUD /api/purchase-requests');
  console.log('  RFQs:          CRUD /api/rfqs');
  console.log('  Abstracts:     CRUD /api/abstracts');
  console.log('  Post-Qual:     CRUD /api/post-qualifications');
  console.log('  BAC Res:       CRUD /api/bac-resolutions');
  console.log('  NOA:           CRUD /api/notices-of-award');
  console.log('  POs:           CRUD /api/purchase-orders');
  console.log('  IARs:          CRUD /api/iars (+accept/unpost)');
  console.log('  Stock Cards:   GET/POST /api/stock-cards');
  console.log('  Ledger Cards:  GET/POST /api/supplies-ledger-cards');
  console.log('  Property Cards:CRUD /api/property-cards');
  console.log('  Prop Ledger:   GET/POST /api/property-ledger-cards');
  console.log('  ICS:           CRUD /api/ics');
  console.log('  PAR:           CRUD /api/pars');
  console.log('  PTR:           CRUD /api/ptrs');
  console.log('  RIS:           CRUD /api/ris (+post)');
  console.log('  Semi-Exp:      GET/PUT /api/received-semi-expendable');
  console.log('  Capital:       GET/PUT /api/received-capital-outlay');
  console.log('  Trip Tickets:  CRUD /api/trip-tickets');
  console.log('  PO Packets:    CRUD /api/po-packets');
  console.log('  COA Submit:    GET/POST /api/coa-submissions');
  console.log('  Settings:      CRUD /api/settings');
  console.log('  Reports:       GET /api/reports/*');
  console.log('  Audit Log:     GET /api/audit-log');
  console.log('  Activity Logs: GET /api/activity-logs, /live, /summary | POST /refresh');
  console.log('  Notifications: CRUD /api/notifications');
  console.log('  Health:        GET /api/health');
  console.log('  Clients:       GET /api/connected-clients');
  console.log('========================================');
});

// Graceful shutdown — lets pm2 restart cleanly
function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  // Notify all Electron clients that the server is going down
  if (io) {
    io.emit('server_shutdown', { message: 'Server is restarting, please wait...', timestamp: new Date().toISOString() });
    io.close();
  }
  server.close(() => {
    console.log('HTTP + WebSocket server closed.');
    pool.end(() => {
      console.log('Database pool closed.');
      process.exit(0);
    });
  });
  // Force exit after 10 seconds if connections won't close
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Catch unhandled promise rejections so the server never crashes silently
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});
