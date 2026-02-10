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
app.use(cors({ origin: '*' })); // Allow LAN access
app.use(bodyParser.json());
app.use(express.json());

// PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.DB_USER || 'dmw_app',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'dmw_procurement',
  password: process.env.DB_PASSWORD || 'SecurePass2026#DMW',
  port: parseInt(process.env.DB_PORT) || 5432,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// Get Local IP Address for LAN access
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'dmw_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// ==================== MIDDLEWARE ====================

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based Authorization Middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// ==================== AUTH ROUTES ====================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      `SELECT u.*, d.name as department_name, d.code as department_code 
       FROM users u 
       LEFT JOIN departments d ON u.dept_id = d.id 
       WHERE u.username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, dept_id: user.dept_id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        department: user.department_name,
        department_code: user.department_code
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.role, d.name as department_name, d.code as department_code 
       FROM users u 
       LEFT JOIN departments d ON u.dept_id = d.id 
       WHERE u.id = $1`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== DEPARTMENTS ROUTES ====================

app.get('/api/departments', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== USERS ROUTES ====================

app.get('/api/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.role, u.created_at, d.name as department_name 
       FROM users u 
       LEFT JOIN departments d ON u.dept_id = d.id 
       ORDER BY u.id`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { username, password, role, dept_id } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, role, dept_id) VALUES ($1, $2, $3, $4) RETURNING id, username, role',
      [username, password_hash, role, dept_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ITEMS ROUTES ====================

app.get('/api/items', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/items', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { code, name, description, unit, unit_price, category } = req.body;
    const result = await pool.query(
      'INSERT INTO items (code, name, description, unit, unit_price, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [code, name, description, unit, unit_price, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PROCUREMENT PLANS ROUTES ====================

app.get('/api/plans', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT pp.*, i.name as item_name, i.code as item_code, i.unit, 
             d.name as department_name, u.username as created_by_name
      FROM procurementplans pp
      LEFT JOIN items i ON pp.item_id = i.id
      LEFT JOIN departments d ON pp.dept_id = d.id
      LEFT JOIN users u ON pp.created_by = u.id
    `;
    
    // If not admin, filter by department
    if (req.user.role !== 'admin' && req.user.role !== 'auditor') {
      query += ' WHERE pp.dept_id = $1';
      const result = await pool.query(query + ' ORDER BY pp.id', [req.user.dept_id]);
      return res.json(result.rows);
    }
    
    const result = await pool.query(query + ' ORDER BY pp.id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/plans', authenticateToken, authorizeRoles('admin', 'manager', 'officer'), async (req, res) => {
  try {
    const { item_id, dept_id, q1_qty, q2_qty, q3_qty, q4_qty, total_amount } = req.body;
    const result = await pool.query(
      `INSERT INTO procurementplans (item_id, dept_id, q1_qty, q2_qty, q3_qty, q4_qty, total_amount, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [item_id, dept_id || req.user.dept_id, q1_qty || 0, q2_qty || 0, q3_qty || 0, q4_qty || 0, total_amount, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/plans/:id', authenticateToken, authorizeRoles('admin', 'manager', 'officer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { q1_qty, q2_qty, q3_qty, q4_qty, total_amount, status } = req.body;
    const result = await pool.query(
      `UPDATE procurementplans 
       SET q1_qty = $1, q2_qty = $2, q3_qty = $3, q4_qty = $4, total_amount = $5, status = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [q1_qty, q2_qty, q3_qty, q4_qty, total_amount, status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PURCHASE REQUESTS ROUTES ====================

app.get('/api/purchase-requests', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT pr.*, d.name as department_name, u.username as requested_by_name
      FROM purchaserequests pr
      LEFT JOIN departments d ON pr.dept_id = d.id
      LEFT JOIN users u ON pr.requested_by = u.id
    `;
    
    if (req.user.role !== 'admin' && req.user.role !== 'auditor') {
      query += ' WHERE pr.dept_id = $1';
      const result = await pool.query(query + ' ORDER BY pr.created_at DESC', [req.user.dept_id]);
      return res.json(result.rows);
    }
    
    const result = await pool.query(query + ' ORDER BY pr.created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/purchase-requests', authenticateToken, authorizeRoles('admin', 'manager', 'officer'), async (req, res) => {
  try {
    const { pr_number, purpose, total_amount, dept_id } = req.body;
    const result = await pool.query(
      `INSERT INTO purchaserequests (pr_number, purpose, total_amount, dept_id, requested_by) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [pr_number, purpose, total_amount, dept_id || req.user.dept_id, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SUPPLIERS ROUTES ====================

app.get('/api/suppliers', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suppliers ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/suppliers', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { name, contact_person, phone, email, address } = req.body;
    const result = await pool.query(
      'INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, contact_person, phone, email, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PURCHASE ORDERS ROUTES ====================

app.get('/api/purchase-orders', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT po.*, s.name as supplier_name, u.username as created_by_name
      FROM purchaseorders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN users u ON po.created_by = u.id
      ORDER BY po.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server_ip: getLocalIP()
  });
});

// ==================== SERVER START ====================

const PORT = parseInt(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  console.log('========================================');
  console.log('   DMW Procurement System API Server   ');
  console.log('========================================');
  console.log(`✅ Server running on:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${localIP}:${PORT}`);
  console.log('----------------------------------------');
  console.log('📡 API Endpoints:');
  console.log(`   Health:     GET  /api/health`);
  console.log(`   Login:      POST /api/auth/login`);
  console.log(`   Plans:      GET  /api/plans`);
  console.log(`   Requests:   GET  /api/purchase-requests`);
  console.log('========================================');
});
