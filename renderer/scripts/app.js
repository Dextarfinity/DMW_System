// Procurement Plan System - Frontend Application
// Static template without dynamic backend

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the application
  initApp();
});

function initApp() {
  // Set current date
  updateCurrentDate();
  
  // Setup navigation
  setupNavigation();
  
  // Setup login form
  setupLoginForm();
  
  // Setup sidebar toggle
  setupSidebarToggle();
  
  // Setup logout
  setupLogout();
  
  // Setup modal handlers
  setupModals();
  
  // Setup button handlers
  setupButtonHandlers();
}

// Update current date display
function updateCurrentDate() {
  const dateElement = document.getElementById('currentDate');
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateElement.textContent = new Date().toLocaleDateString('en-US', options);
}

// Navigation Setup
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  const pageTitle = document.getElementById('pageTitle');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active from all nav items
      navItems.forEach(nav => nav.classList.remove('active'));
      // Add active to clicked item
      item.classList.add('active');
      
      // Get page id
      const pageId = item.dataset.page;
      
      // Hide all pages
      pages.forEach(page => page.classList.remove('active'));
      
      // Show selected page
      const targetPage = document.getElementById(`page-${pageId}`);
      if (targetPage) {
        targetPage.classList.add('active');
      }
      
      // Update page title
      const titles = {
        'dashboard': 'Dashboard',
        'procurement-plans': 'Procurement Plans',
        'purchase-requests': 'Purchase Requests',
        'purchase-orders': 'Purchase Orders',
        'items': 'Items Catalog',
        'suppliers': 'Suppliers',
        'departments': 'Departments',
        'users': 'User Management',
        'reports': 'Reports'
      };
      pageTitle.textContent = titles[pageId] || 'Dashboard';
      
      // Close sidebar on mobile
      if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('show');
      }
    });
  });
}

// Login Form Setup
function setupLoginForm() {
  const loginForm = document.getElementById('loginForm');
  const loginOverlay = document.getElementById('loginOverlay');
  
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const role = document.getElementById('roleSelect').value;
    
    // Store user info (demo mode)
    sessionStorage.setItem('currentUser', JSON.stringify({
      username: username,
      role: role
    }));
    
    // Update UI based on role
    updateUIForRole(role, username);
    
    // Hide login overlay
    loginOverlay.classList.add('hidden');
  });
  
  // Check if already logged in
  const currentUser = sessionStorage.getItem('currentUser');
  if (currentUser) {
    const user = JSON.parse(currentUser);
    updateUIForRole(user.role, user.username);
    loginOverlay.classList.add('hidden');
  }
}

// Update UI based on user role
function updateUIForRole(role, username) {
  const userName = document.querySelector('.user-name');
  const userRole = document.querySelector('.user-role');
  
  const roleNames = {
    'admin': 'Administrator',
    'manager': 'Manager',
    'officer': 'Procurement Officer',
    'viewer': 'Viewer',
    'auditor': 'Auditor'
  };
  
  userName.textContent = username || 'User';
  userRole.textContent = roleNames[role] || 'User';
  
  // Hide/show menu items based on role
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    const page = item.dataset.page;
    
    // Role-based visibility
    switch(role) {
      case 'viewer':
        // Viewers can only see dashboard and reports
        if (['users', 'suppliers'].includes(page)) {
          item.style.display = 'none';
        }
        break;
      case 'auditor':
        // Auditors can see most but not manage users
        if (page === 'users') {
          item.style.display = 'none';
        }
        break;
      case 'officer':
        // Officers can't manage users
        if (page === 'users') {
          item.style.display = 'none';
        }
        break;
      default:
        // Admin and Manager see everything
        item.style.display = 'flex';
    }
  });
  
  // Disable action buttons for viewers and auditors
  if (role === 'viewer' || role === 'auditor') {
    document.querySelectorAll('.btn-primary, .btn-icon.danger, .btn-icon.success').forEach(btn => {
      if (!btn.closest('.login-modal') && !btn.closest('.report-card')) {
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
      }
    });
  }
}

// Sidebar Toggle Setup
function setupSidebarToggle() {
  const toggleBtn = document.getElementById('toggleSidebar');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.querySelector('.main-content');
  
  toggleBtn.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('show');
    } else {
      sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('expanded');
    }
  });
}

// Logout Setup
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  const loginOverlay = document.getElementById('loginOverlay');
  
  logoutBtn.addEventListener('click', () => {
    // Clear session
    sessionStorage.removeItem('currentUser');
    
    // Reset UI
    document.querySelectorAll('.nav-item').forEach(item => {
      item.style.display = 'flex';
    });
    
    document.querySelectorAll('.btn-primary, .btn-icon').forEach(btn => {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    });
    
    // Show login overlay
    loginOverlay.classList.remove('hidden');
    
    // Clear form
    document.getElementById('loginForm').reset();
  });
}

// Modal Setup
function setupModals() {
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  
  modalClose.addEventListener('click', closeModal);
  
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

function openModal(title, content) {
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  modalTitle.textContent = title;
  modalBody.innerHTML = content;
  modalOverlay.classList.add('show');
}

function closeModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  modalOverlay.classList.remove('show');
}

// Button Handlers Setup
function setupButtonHandlers() {
  // New Procurement Plan
  document.getElementById('newPlanBtn')?.addEventListener('click', () => {
    openModal('New Procurement Plan', getProcurementPlanForm());
  });
  
  // New Purchase Request
  document.getElementById('newPRBtn')?.addEventListener('click', () => {
    openModal('New Purchase Request', getPurchaseRequestForm());
  });
  
  // New Purchase Order
  document.getElementById('newPOBtn')?.addEventListener('click', () => {
    openModal('New Purchase Order', getPurchaseOrderForm());
  });
  
  // New Item
  document.getElementById('newItemBtn')?.addEventListener('click', () => {
    openModal('Add New Item', getItemForm());
  });
  
  // New Supplier
  document.getElementById('newSupplierBtn')?.addEventListener('click', () => {
    openModal('Add Supplier', getSupplierForm());
  });
  
  // New Department
  document.getElementById('newDeptBtn')?.addEventListener('click', () => {
    openModal('Add Department', getDepartmentForm());
  });
  
  // New User
  document.getElementById('newUserBtn')?.addEventListener('click', () => {
    openModal('Add User', getUserForm());
  });
}

// Form Templates
function getProcurementPlanForm() {
  return `
    <form id="planForm">
      <div class="form-row">
        <div class="form-group">
          <label>Item</label>
          <select class="form-select" required>
            <option value="">Select Item</option>
            <option value="1">Bond Paper A4 (500 sheets)</option>
            <option value="2">Computer Desktop i5</option>
            <option value="3">Executive Office Chair</option>
          </select>
        </div>
        <div class="form-group">
          <label>Department</label>
          <select class="form-select" required>
            <option value="">Select Department</option>
            <option value="1">Administrative Department</option>
            <option value="2">IT Department</option>
            <option value="3">HR Department</option>
            <option value="4">Finance Department</option>
          </select>
        </div>
      </div>
      <div class="form-row-4">
        <div class="form-group">
          <label>Q1 Qty</label>
          <input type="number" min="0" value="0">
        </div>
        <div class="form-group">
          <label>Q2 Qty</label>
          <input type="number" min="0" value="0">
        </div>
        <div class="form-group">
          <label>Q3 Qty</label>
          <input type="number" min="0" value="0">
        </div>
        <div class="form-group">
          <label>Q4 Qty</label>
          <input type="number" min="0" value="0">
        </div>
      </div>
      <div class="form-group">
        <label>Remarks</label>
        <textarea rows="3" placeholder="Enter remarks..."></textarea>
      </div>
      <div class="form-row">
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Save as Draft</button>
      </div>
    </form>
  `;
}

function getPurchaseRequestForm() {
  return `
    <form id="prForm">
      <div class="form-group">
        <label>PR Number</label>
        <input type="text" value="PR-2026-XXX" readonly>
      </div>
      <div class="form-group">
        <label>Purpose</label>
        <textarea rows="3" placeholder="Enter purpose of request..." required></textarea>
      </div>
      <div class="form-group">
        <label>Department</label>
        <select class="form-select" required>
          <option value="">Select Department</option>
          <option value="1">Administrative Department</option>
          <option value="2">IT Department</option>
          <option value="3">HR Department</option>
          <option value="4">Finance Department</option>
        </select>
      </div>
      <div class="form-group">
        <label>Link to Procurement Plan</label>
        <select class="form-select">
          <option value="">Select Plan (Optional)</option>
          <option value="1">PP-2026-001 - Office Supplies</option>
          <option value="2">PP-2026-002 - IT Equipment</option>
        </select>
      </div>
      <div class="form-row">
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Submit Request</button>
      </div>
    </form>
  `;
}

function getPurchaseOrderForm() {
  return `
    <form id="poForm">
      <div class="form-group">
        <label>PO Number</label>
        <input type="text" value="PO-2026-XXX" readonly>
      </div>
      <div class="form-group">
        <label>Purchase Request Reference</label>
        <select class="form-select" required>
          <option value="">Select PR</option>
          <option value="1">PR-2026-001 - Office Supplies for Q1</option>
          <option value="2">PR-2026-002 - IT Equipment Upgrade</option>
        </select>
      </div>
      <div class="form-group">
        <label>Supplier</label>
        <select class="form-select" required>
          <option value="">Select Supplier</option>
          <option value="1">ABC Trading Corporation</option>
          <option value="2">XYZ Computer Solutions</option>
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Total Amount</label>
          <input type="number" step="0.01" placeholder="0.00" required>
        </div>
        <div class="form-group">
          <label>Mode of Payment</label>
          <select class="form-select" required>
            <option value="">Select</option>
            <option value="check">Check</option>
            <option value="cash">Cash</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Create PO</button>
      </div>
    </form>
  `;
}

function getItemForm() {
  return `
    <form id="itemForm">
      <div class="form-group">
        <label>Item Name</label>
        <input type="text" placeholder="Enter item name" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Category</label>
          <select class="form-select" required>
            <option value="">Select Category</option>
            <option value="office">Office Supplies</option>
            <option value="it">IT Equipment</option>
            <option value="furniture">Furniture</option>
            <option value="cleaning">Cleaning Materials</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>Unit</label>
          <select class="form-select" required>
            <option value="">Select Unit</option>
            <option value="piece">Piece</option>
            <option value="ream">Ream</option>
            <option value="box">Box</option>
            <option value="set">Set</option>
            <option value="unit">Unit</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Estimated Unit Price (₱)</label>
        <input type="number" step="0.01" placeholder="0.00" required>
      </div>
      <div class="form-row">
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Add Item</button>
      </div>
    </form>
  `;
}

function getSupplierForm() {
  return `
    <form id="supplierForm">
      <div class="form-group">
        <label>Company Name</label>
        <input type="text" placeholder="Enter company name" required>
      </div>
      <div class="form-group">
        <label>Address</label>
        <textarea rows="2" placeholder="Enter full address" required></textarea>
      </div>
      <div class="form-group">
        <label>Contact Number</label>
        <input type="tel" placeholder="+63 XX XXX XXXX" required>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" placeholder="email@company.com">
      </div>
      <div class="form-row">
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Add Supplier</button>
      </div>
    </form>
  `;
}

function getDepartmentForm() {
  return `
    <form id="deptForm">
      <div class="form-group">
        <label>Department Code</label>
        <input type="text" placeholder="e.g., ADM, IT, HR" maxlength="10" required>
      </div>
      <div class="form-group">
        <label>Department Name</label>
        <input type="text" placeholder="Enter full department name" required>
      </div>
      <div class="form-row">
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Add Department</button>
      </div>
    </form>
  `;
}

function getUserForm() {
  return `
    <form id="userForm">
      <div class="form-row">
        <div class="form-group">
          <label>Username</label>
          <input type="text" placeholder="Enter username" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" placeholder="Enter password" required>
        </div>
      </div>
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" placeholder="Enter full name" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Role</label>
          <select class="form-select" required>
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="officer">Procurement Officer</option>
            <option value="viewer">Viewer</option>
            <option value="auditor">Auditor</option>
          </select>
        </div>
        <div class="form-group">
          <label>Department</label>
          <select class="form-select" required>
            <option value="">Select Department</option>
            <option value="1">Administrative Department</option>
            <option value="2">IT Department</option>
            <option value="3">HR Department</option>
            <option value="4">Finance Department</option>
            <option value="5">General Services</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Add User</button>
      </div>
    </form>
  `;
}

// Expose closeModal to global scope for inline onclick handlers
window.closeModal = closeModal;
