const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const os = require('os');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'dmw_db',
  password: process.env.DB_PASSWORD || 'kurt09908',
  port: parseInt(process.env.DB_PORT) || 5433,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('ERROR connecting to PostgreSQL:', err.stack);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

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
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Insufficient permissions' });
    next();
  };
};

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
      `SELECT u.*, d.name as department_name, d.code as department_code 
       FROM users u LEFT JOIN departments d ON u.dept_id = d.id 
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
      { id: user.id, username: user.username, role: user.role, dept_id: user.dept_id },
      JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }
    );
    res.json({
      token,
      user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role, department: user.department_name, department_code: user.department_code }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
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
      `SELECT u.id, u.username, u.full_name, u.role, u.email, d.name as department_name, d.code as department_code 
       FROM users u LEFT JOIN departments d ON u.dept_id = d.id WHERE u.id = $1`, [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// DASHBOARD
// ==============================================================================

app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const [items, plans, prs, pos, suppliers, users, departments, 
           stockCards, propertyCards, ics, employees,
           lowStock, outOfStock,
           semiExpItems, capitalOutlayItems,
           pendingIARs, pendingRIS, tripTickets] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM items WHERE is_active = TRUE'),
      pool.query('SELECT COUNT(*) FROM procurementplans'),
      pool.query('SELECT COUNT(*) FROM purchaserequests'),
      pool.query('SELECT COUNT(*) FROM purchaseorders'),
      pool.query('SELECT COUNT(*) FROM suppliers WHERE is_active = TRUE'),
      pool.query('SELECT COUNT(*) FROM users WHERE is_active = TRUE'),
      pool.query('SELECT COUNT(*) FROM departments'),
      pool.query('SELECT COUNT(*) FROM stock_cards'),
      pool.query('SELECT COUNT(*) FROM property_cards'),
      pool.query('SELECT COUNT(*) FROM inventory_custodian_slips'),
      pool.query('SELECT COUNT(*) FROM employees WHERE status = \'active\''),
      pool.query('SELECT 0 as count'),
      pool.query('SELECT 0 as count'),
      pool.query('SELECT COUNT(*) FROM received_semi_expendable_items'),
      pool.query('SELECT COUNT(*) FROM received_capital_outlay_items'),
      pool.query("SELECT COUNT(*) FROM iars WHERE status = 'draft'"),
      pool.query("SELECT COUNT(*) FROM requisition_issue_slips WHERE status = 'PENDING'"),
      pool.query('SELECT COUNT(*) FROM trip_tickets'),
    ]);

    res.json({
      totalItems: parseInt(items.rows[0].count),
      totalPlans: parseInt(plans.rows[0].count),
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
      pendingRIS: parseInt(pendingRIS.rows[0].count),
      totalTripTickets: parseInt(tripTickets.rows[0].count),
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
app.get('/api/divisions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM divisions ORDER BY name');
    res.json(result.rows);
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
      `SELECT u.id, u.username, u.full_name, u.email, u.role, u.is_active, u.last_login, u.created_at,
              d.name as department_name, d.code as department_code
       FROM users u LEFT JOIN departments d ON u.dept_id = d.id ORDER BY u.id`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.email, u.role, u.dept_id, u.is_active, u.employee_id, u.last_login, u.created_at,
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
    await pool.query('UPDATE users SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deactivated' });
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
    const { employee_code, full_name, designation_id, dept_id, email, phone, status } = req.body;
    const result = await pool.query(
      `INSERT INTO employees (employee_code, full_name, designation_id, dept_id, email, phone, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [employee_code, full_name, designation_id, dept_id, email, phone, status || 'active']
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
    const { category, active_only } = req.query;
    let query = `SELECT i.*, uc.name as uacs_name, uc.category as uacs_category
                 FROM items i LEFT JOIN uacs_codes uc ON i.uacs_code = uc.code`;
    const params = [];
    const conditions = [];
    if (category) { conditions.push(`i.category = $${params.length + 1}`); params.push(category); }
    if (active_only === 'true') { conditions.push('i.is_active = TRUE'); }
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
    const { code, stock_no, name, description, unit, unit_price, category, uacs_code, quantity, reorder_point, gam_classification, semi_expendable_classification } = req.body;
    const result = await pool.query(
      `INSERT INTO items (code, stock_no, name, description, unit, unit_price, category, uacs_code, quantity, reorder_point, gam_classification, semi_expendable_classification) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [code, stock_no, name, description, unit, unit_price || 0, category, uacs_code, quantity || 0, reorder_point || 0, gam_classification, semi_expendable_classification]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const { code, stock_no, name, description, unit, unit_price, category, uacs_code, quantity, reorder_point, is_active, gam_classification, semi_expendable_classification } = req.body;
    const result = await pool.query(
      `UPDATE items SET code=$1, stock_no=$2, name=$3, description=$4, unit=$5, unit_price=$6, category=$7, uacs_code=$8, 
       quantity=$9, reorder_point=$10, is_active=$11, gam_classification=$12, semi_expendable_classification=$13, updated_at=CURRENT_TIMESTAMP
       WHERE id=$14 RETURNING *`,
      [code, stock_no, name, description, unit, unit_price, category, uacs_code, quantity, reorder_point, is_active !== false, gam_classification, semi_expendable_classification, req.params.id]
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
    const isChief = chiefRoles.includes(req.user.role);
    
    let query = `SELECT pp.*, d.name as department_name, d.code as department_code,
              u.username as created_by_name,
              au.username as approved_by_name
       FROM procurementplans pp
       LEFT JOIN departments d ON pp.dept_id = d.id
       LEFT JOIN users u ON pp.created_by = u.id
       LEFT JOIN users au ON pp.approved_by = au.id`;
    const params = [];
    
    // If dept_id filter is passed via query param, use it
    if (req.query.dept_id) {
      params.push(req.query.dept_id);
      query += ` WHERE pp.dept_id = $${params.length}`;
    } else if (isChief && req.user.dept_id) {
      // Chiefs only see their own division
      params.push(req.user.dept_id);
      query += ` WHERE pp.dept_id = $${params.length}`;
    }
    
    query += ` ORDER BY pp.created_at DESC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/plans/:id', authenticateToken, async (req, res) => {
  try {
    const plan = await pool.query(
      `SELECT pp.*, d.name as department_name FROM procurementplans pp LEFT JOIN departments d ON pp.dept_id = d.id WHERE pp.id = $1`,
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
    const { dept_id, fiscal_year, status, remarks, total_amount, items } = req.body;
    const planResult = await client.query(
      `INSERT INTO procurementplans (dept_id, fiscal_year, status, remarks, total_amount, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [dept_id || req.user.dept_id, fiscal_year || new Date().getFullYear(), status || 'draft', remarks, total_amount || 0, req.user.id]
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

app.put('/api/plans/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { dept_id, fiscal_year, status, remarks, total_amount, items } = req.body;
    const result = await client.query(
      `UPDATE procurementplans SET dept_id=$1, fiscal_year=$2, status=$3, remarks=$4, total_amount=$5, updated_at=CURRENT_TIMESTAMP
       WHERE id=$6 RETURNING *`,
      [dept_id, fiscal_year, status, remarks, total_amount, req.params.id]
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
    await pool.query('DELETE FROM procurementplans WHERE id = $1', [req.params.id]);
    res.json({ message: 'Plan deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET all plan items across all plans (for the APP page)
app.get('/api/plan-items', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pi.*, pp.fiscal_year, pp.status as plan_status, pp.dept_id,
              d.name as department_name, d.code as department_code
       FROM plan_items pi
       JOIN procurementplans pp ON pi.plan_id = pp.id
       LEFT JOIN departments d ON pp.dept_id = d.id
       ORDER BY pi.id`
    );
    res.json(result.rows);
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
    const result = await pool.query(
      `SELECT pr.*, d.name as department_name, u.username as requested_by_name
       FROM purchaserequests pr
       LEFT JOIN departments d ON pr.dept_id = d.id
       LEFT JOIN users u ON pr.requested_by = u.id
       ORDER BY pr.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/purchase-requests/:id', authenticateToken, async (req, res) => {
  try {
    const pr = await pool.query(
      `SELECT pr.*, d.name as department_name FROM purchaserequests pr LEFT JOIN departments d ON pr.dept_id = d.id WHERE pr.id = $1`,
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
    const { pr_number, purpose, total_amount, dept_id, status, items } = req.body;
    const prResult = await client.query(
      `INSERT INTO purchaserequests (pr_number, purpose, total_amount, dept_id, status, requested_by) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [pr_number, purpose, total_amount || 0, dept_id || req.user.dept_id, status || 'pending', req.user.id]
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
    res.status(201).json(pr);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.put('/api/purchase-requests/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { pr_number, purpose, total_amount, dept_id, status, items } = req.body;
    const result = await client.query(
      `UPDATE purchaserequests SET pr_number=$1, purpose=$2, total_amount=$3, dept_id=$4, status=$5, updated_at=CURRENT_TIMESTAMP
       WHERE id=$6 RETURNING *`,
      [pr_number, purpose, total_amount, dept_id, status, req.params.id]
    );
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
    res.json(result.rows[0]);
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
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/purchase-requests/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM purchaserequests WHERE id = $1', [req.params.id]);
    res.json({ message: 'PR deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// RFQ (Request for Quotation)
// ==============================================================================

app.get('/api/rfqs', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, pr.pr_number, u.username as created_by_name
       FROM rfqs r LEFT JOIN purchaserequests pr ON r.pr_id = pr.id
       LEFT JOIN users u ON r.created_by = u.id ORDER BY r.created_at DESC`
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
    const { rfq_number, pr_id, date_prepared, submission_deadline, abc_amount, philgeps_required, status, items, suppliers } = req.body;
    const rfqResult = await client.query(
      `INSERT INTO rfqs (rfq_number, pr_id, date_prepared, submission_deadline, abc_amount, philgeps_required, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [rfq_number, pr_id, date_prepared, submission_deadline, abc_amount||0, philgeps_required||false, status||'draft', req.user.id]
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
  try {
    const { rfq_number, pr_id, date_prepared, submission_deadline, abc_amount, philgeps_required, status } = req.body;
    const result = await pool.query(
      `UPDATE rfqs SET rfq_number=$1, pr_id=$2, date_prepared=$3, submission_deadline=$4, abc_amount=$5, philgeps_required=$6, status=$7, updated_at=CURRENT_TIMESTAMP
       WHERE id=$8 RETURNING *`,
      [rfq_number, pr_id, date_prepared, submission_deadline, abc_amount, philgeps_required, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/rfqs/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM rfqs WHERE id = $1', [req.params.id]);
    res.json({ message: 'RFQ deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// ABSTRACT OF QUOTATION (AOQ)
// ==============================================================================

app.get('/api/abstracts', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, r.rfq_number, s.name as recommended_supplier_name, u.username as created_by_name
       FROM abstracts a LEFT JOIN rfqs r ON a.rfq_id = r.id
       LEFT JOIN suppliers s ON a.recommended_supplier_id = s.id
       LEFT JOIN users u ON a.created_by = u.id ORDER BY a.created_at DESC`
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
    const { abstract_number, rfq_id, date_prepared, purpose, status, recommended_supplier_id, recommended_amount, quotations } = req.body;
    const absResult = await client.query(
      `INSERT INTO abstracts (abstract_number, rfq_id, date_prepared, purpose, status, recommended_supplier_id, recommended_amount, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [abstract_number, rfq_id, date_prepared, purpose, status||'draft', recommended_supplier_id, recommended_amount||0, req.user.id]
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
  try {
    const { abstract_number, rfq_id, date_prepared, purpose, status, recommended_supplier_id, recommended_amount } = req.body;
    const result = await pool.query(
      `UPDATE abstracts SET abstract_number=$1, rfq_id=$2, date_prepared=$3, purpose=$4, status=$5, recommended_supplier_id=$6, recommended_amount=$7, updated_at=CURRENT_TIMESTAMP
       WHERE id=$8 RETURNING *`,
      [abstract_number, rfq_id, date_prepared, purpose, status, recommended_supplier_id, recommended_amount, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/abstracts/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM abstracts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Abstract deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// POST-QUALIFICATION (TWG)
// ==============================================================================

app.get('/api/post-qualifications', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pq.*, a.abstract_number FROM post_qualifications pq LEFT JOIN abstracts a ON pq.abstract_id = a.id ORDER BY pq.created_at DESC`
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
    const { postqual_number, abstract_id, bidder_name, documents_verified, technical_compliance, financial_validation, twg_result, findings, status } = req.body;
    const result = await pool.query(
      `INSERT INTO post_qualifications (postqual_number, abstract_id, bidder_name, documents_verified, technical_compliance, financial_validation, twg_result, findings, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [postqual_number, abstract_id, bidder_name, documents_verified||'{}', technical_compliance||'{}', financial_validation||'{}', twg_result, findings, status||'draft', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/post-qualifications/:id', authenticateToken, async (req, res) => {
  try {
    const { postqual_number, abstract_id, bidder_name, documents_verified, technical_compliance, financial_validation, twg_result, findings, status } = req.body;
    const result = await pool.query(
      `UPDATE post_qualifications SET postqual_number=$1, abstract_id=$2, bidder_name=$3, documents_verified=$4, technical_compliance=$5, financial_validation=$6, twg_result=$7, findings=$8, status=$9, updated_at=CURRENT_TIMESTAMP
       WHERE id=$10 RETURNING *`,
      [postqual_number, abstract_id, bidder_name, documents_verified, technical_compliance, financial_validation, twg_result, findings, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// BAC RESOLUTION
// ==============================================================================

app.get('/api/bac-resolutions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT br.*, a.abstract_number, s.name as supplier_name
       FROM bac_resolutions br LEFT JOIN abstracts a ON br.abstract_id = a.id
       LEFT JOIN suppliers s ON br.recommended_supplier_id = s.id ORDER BY br.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/bac-resolutions', authenticateToken, async (req, res) => {
  try {
    const { resolution_number, abstract_id, resolution_date, procurement_mode, abc_amount, recommended_supplier_id, recommended_awardee_name, bid_amount, status } = req.body;
    const result = await pool.query(
      `INSERT INTO bac_resolutions (resolution_number, abstract_id, resolution_date, procurement_mode, abc_amount, recommended_supplier_id, recommended_awardee_name, bid_amount, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [resolution_number, abstract_id, resolution_date, procurement_mode||'SVP', abc_amount||0, recommended_supplier_id, recommended_awardee_name, bid_amount||0, status||'draft', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/bac-resolutions/:id', authenticateToken, async (req, res) => {
  try {
    const { resolution_number, abstract_id, resolution_date, procurement_mode, abc_amount, recommended_supplier_id, recommended_awardee_name, bid_amount, status } = req.body;
    const result = await pool.query(
      `UPDATE bac_resolutions SET resolution_number=$1, abstract_id=$2, resolution_date=$3, procurement_mode=$4, abc_amount=$5, recommended_supplier_id=$6, recommended_awardee_name=$7, bid_amount=$8, status=$9, updated_at=CURRENT_TIMESTAMP
       WHERE id=$10 RETURNING *`,
      [resolution_number, abstract_id, resolution_date, procurement_mode, abc_amount, recommended_supplier_id, recommended_awardee_name, bid_amount, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/bac-resolutions/:id/approve', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE bac_resolutions SET status='approved', approved_by=$1, approved_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *`,
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

// ==============================================================================
// NOTICE OF AWARD (NOA)
// ==============================================================================

app.get('/api/notices-of-award', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, br.resolution_number, s.name as supplier_name
       FROM notices_of_award n LEFT JOIN bac_resolutions br ON n.bac_resolution_id = br.id
       LEFT JOIN suppliers s ON n.supplier_id = s.id ORDER BY n.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/notices-of-award', authenticateToken, async (req, res) => {
  try {
    const { noa_number, bac_resolution_id, supplier_id, contract_amount, date_issued, status } = req.body;
    const result = await pool.query(
      `INSERT INTO notices_of_award (noa_number, bac_resolution_id, supplier_id, contract_amount, date_issued, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [noa_number, bac_resolution_id, supplier_id, contract_amount||0, date_issued, status||'issued', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/notices-of-award/:id', authenticateToken, async (req, res) => {
  try {
    const { noa_number, bac_resolution_id, supplier_id, contract_amount, date_issued, bidder_receipt_date, status } = req.body;
    const result = await pool.query(
      `UPDATE notices_of_award SET noa_number=$1, bac_resolution_id=$2, supplier_id=$3, contract_amount=$4, date_issued=$5, bidder_receipt_date=$6, status=$7, updated_at=CURRENT_TIMESTAMP
       WHERE id=$8 RETURNING *`,
      [noa_number, bac_resolution_id, supplier_id, contract_amount, date_issued, bidder_receipt_date, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==============================================================================
// PURCHASE ORDERS
// ==============================================================================

app.get('/api/purchase-orders', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT po.*, s.name as supplier_name, s.address as supplier_address, s.tin as supplier_tin,
              u.username as created_by_name, pr.pr_number
       FROM purchaseorders po
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       LEFT JOIN users u ON po.created_by = u.id
       LEFT JOIN purchaserequests pr ON po.pr_id = pr.id
       ORDER BY po.created_at DESC`
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
            status, workflow_status, expected_delivery_date, po_date, purpose, mode_of_procurement, place_of_delivery, items } = req.body;
    const poResult = await client.query(
      `INSERT INTO purchaseorders (po_number, pr_id, noa_id, supplier_id, total_amount, payment_terms, delivery_address,
       status, workflow_status, expected_delivery_date, po_date, purpose, mode_of_procurement, place_of_delivery, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [po_number, pr_id, noa_id, supplier_id, total_amount||0, payment_terms, delivery_address,
       status||'pending', workflow_status||'pending', expected_delivery_date, po_date, purpose, mode_of_procurement, place_of_delivery, req.user.id]
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
    res.status(201).json(po);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.put('/api/purchase-orders/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { po_number, pr_id, noa_id, supplier_id, total_amount, payment_terms, delivery_address,
            status, workflow_status, expected_delivery_date, delivery_date, po_date, purpose, mode_of_procurement, place_of_delivery, items } = req.body;
    const result = await client.query(
      `UPDATE purchaseorders SET po_number=$1, pr_id=$2, noa_id=$3, supplier_id=$4, total_amount=$5, payment_terms=$6, delivery_address=$7,
       status=$8, workflow_status=$9, expected_delivery_date=$10, delivery_date=$11, po_date=$12, purpose=$13, mode_of_procurement=$14, place_of_delivery=$15, updated_at=CURRENT_TIMESTAMP
       WHERE id=$16 RETURNING *`,
      [po_number, pr_id, noa_id, supplier_id, total_amount, payment_terms, delivery_address,
       status, workflow_status, expected_delivery_date, delivery_date, po_date, purpose, mode_of_procurement, place_of_delivery, req.params.id]
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
      `SELECT iar.*, po.po_number, s.name as supplier_name
       FROM iars iar LEFT JOIN purchaseorders po ON iar.po_id = po.id
       LEFT JOIN suppliers s ON po.supplier_id = s.id WHERE iar.id = $1`, [req.params.id]
    );
    if (iar.rows.length === 0) return res.status(404).json({ error: 'IAR not found' });
    const items = await pool.query(
      `SELECT ii.*, i.category as item_category, i.uacs_code, i.stock_no
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
            delivery_receipt_number, inspection_result, findings, purpose, status, items } = req.body;
    const iarResult = await client.query(
      `INSERT INTO iars (iar_number, po_id, inspection_date, delivery_date, invoice_number, invoice_date,
       delivery_receipt_number, inspection_result, findings, purpose, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [iar_number, po_id, inspection_date, delivery_date, invoice_number, invoice_date,
       delivery_receipt_number, inspection_result||'pending', findings, purpose, status||'draft', req.user.id]
    );
    const iar = iarResult.rows[0];
    if (items && items.length > 0) {
      for (const item of items) {
        await client.query(
          `INSERT INTO iar_items (iar_id, item_id, item_code, item_name, quantity, unit_cost, category, brand, model, serial_no, ppe_no, inventory_no, generated_item_id, remarks)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
          [iar.id, item.item_id, item.item_code, item.item_name, item.quantity, item.unit_cost||0,
           item.category, item.brand, item.model, item.serial_no, item.ppe_no, item.inventory_no, item.generated_item_id, item.remarks]
        );
      }
    }
    await client.query('COMMIT');
    res.status(201).json(iar);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

app.put('/api/iars/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { iar_number, po_id, inspection_date, delivery_date, invoice_number, invoice_date,
            delivery_receipt_number, inspection_result, findings, purpose, status, items } = req.body;
    const result = await client.query(
      `UPDATE iars SET iar_number=$1, po_id=$2, inspection_date=$3, delivery_date=$4, invoice_number=$5, invoice_date=$6,
       delivery_receipt_number=$7, inspection_result=$8, findings=$9, purpose=$10, status=$11, updated_at=CURRENT_TIMESTAMP WHERE id=$12 RETURNING *`,
      [iar_number, po_id, inspection_date, delivery_date, invoice_number, invoice_date, delivery_receipt_number, inspection_result, findings, purpose, status, req.params.id]
    );
    if (items) {
      await client.query('DELETE FROM iar_items WHERE iar_id = $1', [req.params.id]);
      for (const item of items) {
        await client.query(
          `INSERT INTO iar_items (iar_id, item_id, item_code, item_name, quantity, unit_cost, category, brand, model, serial_no, ppe_no, inventory_no, generated_item_id, remarks)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
          [req.params.id, item.item_id, item.item_code, item.item_name, item.quantity, item.unit_cost||0,
           item.category, item.brand, item.model, item.serial_no, item.ppe_no, item.inventory_no, item.generated_item_id, item.remarks]
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
    await client.query("UPDATE iars SET status='completed', inspection_result='accepted', inspected_by=$1, date_inspected=CURRENT_DATE, received_by=$1, date_received=CURRENT_DATE, updated_at=CURRENT_TIMESTAMP WHERE id=$2",
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

    await client.query("UPDATE iars SET status='draft', inspection_result='pending', updated_at=CURRENT_TIMESTAMP WHERE id=$1", [iarId]);
    if (iar.po_id) {
      await client.query("UPDATE purchaseorders SET status='delivered', updated_at=CURRENT_TIMESTAMP WHERE id=$1", [iar.po_id]);
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
    let query = `SELECT sc.*, i.name as item_name, i.unit, i.stock_no as item_stock_no
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
    let query = `SELECT slc.*, i.name as item_name, i.unit, i.stock_no
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
        `INSERT INTO stock_cards (item_id, item_code, item_name, transaction_no, date, reference, issue_qty, issue_unit_cost, issue_total_cost, balance_qty, balance_unit_cost, balance_total_cost)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [item.item_id, item.code, item.item_name, nextTxNo.rows[0].next, ris.ris_date || new Date(), 'RIS-' + ris.ris_no,
         item.quantity, unitCost, issueCost, balQty, balQty > 0 ? balCost / balQty : 0, balCost]
      );

      // Create supplies ledger card issue entry
      const lastSLC = await client.query('SELECT balance_qty, balance_total_cost FROM supplies_ledger_cards WHERE item_id = $1 ORDER BY date DESC, transaction_no DESC LIMIT 1', [item.item_id]);
      const prevLQty = lastSLC.rows.length > 0 ? lastSLC.rows[0].balance_qty : 0;
      const prevLCost = lastSLC.rows.length > 0 ? parseFloat(lastSLC.rows[0].balance_total_cost) : 0;
      const balLQty = Math.max(prevLQty - item.quantity, 0);
      const balLCost = Math.max(prevLCost - issueCost, 0);
      const nextLTxNo = await client.query('SELECT COALESCE(MAX(transaction_no), 0) + 1 as next FROM supplies_ledger_cards WHERE item_id = $1', [item.item_id]);

      await client.query(
        `INSERT INTO supplies_ledger_cards (item_id, item_code, item_name, transaction_no, date, reference, issue_qty, issue_unit_cost, issue_total_cost, balance_qty, balance_unit_cost, balance_total_cost)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [item.item_id, item.code, item.item_name, nextLTxNo.rows[0].next, ris.ris_date || new Date(), 'RIS-' + ris.ris_no,
         item.quantity, unitCost, issueCost, balLQty, balLQty > 0 ? balLCost / balLQty : 0, balLCost]
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

// ==============================================================================
// COA SUBMISSIONS
// ==============================================================================

app.get('/api/coa-submissions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cs.*, po.po_number, iar.iar_number FROM coa_submissions cs
       LEFT JOIN purchaseorders po ON cs.po_id = po.id LEFT JOIN iars iar ON cs.iar_id = iar.id
       ORDER BY cs.created_at DESC`
    );
    res.json(result.rows);
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

// RSMI - Report on Supplies and Materials Issued
app.get('/api/reports/rsmi', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const result = await pool.query(
      `SELECT sc.item_id, sc.item_code, sc.item_name, i.stock_no, i.unit, i.unit_price,
              SUM(sc.receipt_qty) as total_received, SUM(sc.issue_qty) as total_issued,
              SUM(sc.receipt_total_cost) as total_received_cost, SUM(sc.issue_total_cost) as total_issued_cost
       FROM stock_cards sc LEFT JOIN items i ON sc.item_id = i.id
       WHERE ($1::date IS NULL OR sc.date >= $1::date) AND ($2::date IS NULL OR sc.date <= $2::date)
       GROUP BY sc.item_id, sc.item_code, sc.item_name, i.stock_no, i.unit, i.unit_price
       ORDER BY sc.item_name`,
      [start_date || null, end_date || null]
    );
    res.json(result.rows);
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
// AUDIT LOG
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
// HEALTH CHECK
// ==============================================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), server_ip: getLocalIP() });
});

// ==============================================================================
// SERVER START
// ==============================================================================

const PORT = parseInt(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  console.log('========================================');
  console.log('  DMW Procurement & Inventory System    ');
  console.log('  Full API Server v3.0                  ');
  console.log('========================================');
  console.log(`Server running on:`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Network: http://${localIP}:${PORT}`);
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
  console.log('  Health:        GET /api/health');
  console.log('========================================');
});
