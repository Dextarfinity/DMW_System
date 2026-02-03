// DMW Caraga Procurement System - Frontend Application
// Static template version (no backend required)

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const loginOverlay = document.getElementById('loginOverlay');
  const loginForm = document.getElementById('loginForm');
  const appContainer = document.querySelector('.app-container');
  const sidebar = document.querySelector('.sidebar');
  const toggleSidebarBtn = document.getElementById('toggleSidebar');
  const mainContent = document.querySelector('.main-content');
  const pageTitle = document.getElementById('pageTitle');
  const currentDateEl = document.getElementById('currentDate');
  const userNameEl = document.getElementById('userName');
  const userRoleEl = document.getElementById('userRole');
  const logoutBtn = document.getElementById('logoutBtn');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const closeModalBtn = document.getElementById('closeModal');

  // Navigation items
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');

  // Current user state
  let currentUser = {
    name: '',
    role: '',
    division: ''
  };

  // Page titles mapping (As-Is System)
  const pageTitles = {
    dashboard: 'Dashboard',
    ppmp: 'Project Procurement Management Plan (PPMP)',
    app: 'Annual Procurement Plan (APP)',
    'purchase-requests': 'Purchase Requests',
    rfq: 'Request for Quotations (RFQ)',
    abstract: 'Abstract of Quotations',
    'post-qual': 'Post-Qualification (Optional)',
    'bac-resolution': 'BAC Resolution',
    noa: 'Notice of Award (NOA)',
    'purchase-orders': 'Purchase Orders',
    iar: 'Inspection & Acceptance Report (IAR) - Appendix 62',
    coa: 'COA Submission',
    items: 'Items Catalog',
    suppliers: 'Suppliers Directory',
    divisions: 'DMW Caraga Divisions (5 End-Users)',
    users: 'User Management',
    reports: 'Reports & KPIs'
  };

  // Initialize the app
  function init() {
    setCurrentDate();
    setupEventListeners();
    checkSession();
  }

  // Set current date in header
  function setCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-PH', options);
    if (currentDateEl) {
      currentDateEl.textContent = today;
    }
  }

  // Setup all event listeners
  function setupEventListeners() {
    // Login form
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }

    // Sidebar toggle
    if (toggleSidebarBtn) {
      toggleSidebarBtn.addEventListener('click', toggleSidebar);
    }

    // Navigation
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page) {
          navigateTo(page);
        }
      });
    });

    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }

    // Modal close
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeModal);
    }
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          closeModal();
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  }

  // Check if user has a session
  function checkSession() {
    const savedUser = localStorage.getItem('dmwUser');
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
      showApp();
    }
  }

  // Handle login
  function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('roleSelect').value;
    const division = document.getElementById('divisionSelect')?.value || 'FAD';

    // Static demo - accept any login
    if (username && password && role) {
      currentUser = {
        name: username,
        role: role,
        division: division
      };
      localStorage.setItem('dmwUser', JSON.stringify(currentUser));
      showApp();
    } else {
      alert('Please fill in all fields');
    }
  }

  // Show the main app
  function showApp() {
    if (loginOverlay) {
      loginOverlay.classList.add('hidden');
    }

    // Update user info in sidebar
    if (userNameEl) {
      userNameEl.textContent = currentUser.name;
    }
    if (userRoleEl) {
      userRoleEl.textContent = formatRole(currentUser.role) + ' - ' + currentUser.division;
    }

    // Apply role-based visibility
    applyRoleVisibility();

    // Navigate to dashboard
    navigateTo('dashboard');
  }

  // Format role for display (As-Is Roles)
  function formatRole(role) {
    const roleLabels = {
      admin: 'System Administrator',
      hope: 'HoPE (Regional Director)',
      bac_chair: 'BAC Chairperson',
      bac_sec: 'BAC Secretariat',
      twg: 'TWG Member',
      div_head: 'Division Head',
      end_user: 'End User',
      supply: 'Supply/Procurement Officer',
      inspector: 'Inspection/Property Custodian'
    };
    return roleLabels[role] || role;
  }

  // Role-based ACTION permissions (what each role can DO)
  const roleActionPermissions = {
    admin: {
      // Admin can do everything
      canCreatePPMP: true, canApprovePPMP: true, canViewPPMP: true,
      canCreateAPP: true, canApproveAPP: true, canConsolidateAPP: true, canViewAPP: true,
      canCreatePR: true, canApprovePR: true, canViewPR: true,
      canCreateRFQ: true, canSendRFQ: true, canViewRFQ: true,
      canCreateAbstract: true, canApproveAbstract: true, canViewAbstract: true,
      canCreatePostQual: true, canApprovePostQual: true, canViewPostQual: true,
      canCreateBACRes: true, canApproveBACRes: true, canViewBACRes: true,
      canCreateNOA: true, canApproveNOA: true, canViewNOA: true,
      canCreatePO: true, canApprovePO: true, canViewPO: true,
      canCreateIAR: true, canApproveIAR: true, canViewIAR: true,
      canCreateCOA: true, canSubmitCOA: true, canViewCOA: true,
      canCreateItem: true, canEditItem: true, canDeleteItem: true, canViewItem: true,
      canCreateSupplier: true, canEditSupplier: true, canDeleteSupplier: true, canViewSupplier: true,
      canCreateUser: true, canEditUser: true, canDeleteUser: true, canViewUser: true,
      canViewReports: true, canExportReports: true,
      canManageDivisions: true
    },
    hope: {
      // HoPE: Approvals for NOA, PO, final oversight
      canCreatePPMP: false, canApprovePPMP: true, canViewPPMP: true,
      canCreateAPP: false, canApproveAPP: true, canConsolidateAPP: false, canViewAPP: true,
      canCreatePR: false, canApprovePR: false, canViewPR: true,
      canCreateRFQ: false, canSendRFQ: false, canViewRFQ: true,
      canCreateAbstract: false, canApproveAbstract: false, canViewAbstract: true,
      canCreatePostQual: false, canApprovePostQual: false, canViewPostQual: true,
      canCreateBACRes: false, canApproveBACRes: true, canViewBACRes: true,
      canCreateNOA: false, canApproveNOA: true, canViewNOA: true,
      canCreatePO: false, canApprovePO: true, canViewPO: true,
      canCreateIAR: false, canApproveIAR: true, canViewIAR: true,
      canCreateCOA: false, canSubmitCOA: false, canViewCOA: true,
      canCreateItem: false, canEditItem: false, canDeleteItem: false, canViewItem: true,
      canCreateSupplier: false, canEditSupplier: false, canDeleteSupplier: false, canViewSupplier: true,
      canCreateUser: false, canEditUser: false, canDeleteUser: false, canViewUser: false,
      canViewReports: true, canExportReports: true,
      canManageDivisions: true
    },
    bac_chair: {
      // BAC Chair: Approves BAC resolutions, signs abstracts
      canCreatePPMP: false, canApprovePPMP: false, canViewPPMP: false,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: true,
      canCreatePR: false, canApprovePR: false, canViewPR: true,
      canCreateRFQ: false, canSendRFQ: false, canViewRFQ: true,
      canCreateAbstract: false, canApproveAbstract: true, canViewAbstract: true,
      canCreatePostQual: false, canApprovePostQual: true, canViewPostQual: true,
      canCreateBACRes: false, canApproveBACRes: true, canViewBACRes: true,
      canCreateNOA: false, canApproveNOA: false, canViewNOA: true,
      canCreatePO: false, canApprovePO: false, canViewPO: true,
      canCreateIAR: false, canApproveIAR: false, canViewIAR: true,
      canCreateCOA: false, canSubmitCOA: false, canViewCOA: false,
      canCreateItem: false, canEditItem: false, canDeleteItem: false, canViewItem: true,
      canCreateSupplier: false, canEditSupplier: false, canDeleteSupplier: false, canViewSupplier: true,
      canCreateUser: false, canEditUser: false, canDeleteUser: false, canViewUser: false,
      canViewReports: true, canExportReports: false,
      canManageDivisions: false
    },
    bac_sec: {
      // BAC Secretariat: Creates RFQ, Abstract, BAC Res, NOA, prepares documents
      canCreatePPMP: false, canApprovePPMP: false, canViewPPMP: true,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: true, canViewAPP: true,
      canCreatePR: false, canApprovePR: false, canViewPR: true,
      canCreateRFQ: true, canSendRFQ: true, canViewRFQ: true,
      canCreateAbstract: true, canApproveAbstract: false, canViewAbstract: true,
      canCreatePostQual: true, canApprovePostQual: false, canViewPostQual: true,
      canCreateBACRes: true, canApproveBACRes: false, canViewBACRes: true,
      canCreateNOA: true, canApproveNOA: false, canViewNOA: true,
      canCreatePO: true, canApprovePO: false, canViewPO: true,
      canCreateIAR: false, canApproveIAR: false, canViewIAR: true,
      canCreateCOA: true, canSubmitCOA: true, canViewCOA: true,
      canCreateItem: true, canEditItem: true, canDeleteItem: false, canViewItem: true,
      canCreateSupplier: true, canEditSupplier: true, canDeleteSupplier: false, canViewSupplier: true,
      canCreateUser: false, canEditUser: false, canDeleteUser: false, canViewUser: false,
      canViewReports: true, canExportReports: true,
      canManageDivisions: false
    },
    twg: {
      // TWG: Technical evaluation, post-qualification
      canCreatePPMP: false, canApprovePPMP: false, canViewPPMP: false,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: true,
      canCreatePR: false, canApprovePR: false, canViewPR: true,
      canCreateRFQ: false, canSendRFQ: false, canViewRFQ: true,
      canCreateAbstract: false, canApproveAbstract: false, canViewAbstract: true,
      canCreatePostQual: true, canApprovePostQual: false, canViewPostQual: true,
      canCreateBACRes: false, canApproveBACRes: false, canViewBACRes: false,
      canCreateNOA: false, canApproveNOA: false, canViewNOA: false,
      canCreatePO: false, canApprovePO: false, canViewPO: false,
      canCreateIAR: false, canApproveIAR: false, canViewIAR: false,
      canCreateCOA: false, canSubmitCOA: false, canViewCOA: false,
      canCreateItem: false, canEditItem: false, canDeleteItem: false, canViewItem: true,
      canCreateSupplier: false, canEditSupplier: false, canDeleteSupplier: false, canViewSupplier: true,
      canCreateUser: false, canEditUser: false, canDeleteUser: false, canViewUser: false,
      canViewReports: true, canExportReports: false,
      canManageDivisions: false
    },
    div_head: {
      // Division Head: Approves division PPMP, approves PR for their division
      canCreatePPMP: false, canApprovePPMP: true, canViewPPMP: true,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: true,
      canCreatePR: false, canApprovePR: true, canViewPR: true,
      canCreateRFQ: false, canSendRFQ: false, canViewRFQ: false,
      canCreateAbstract: false, canApproveAbstract: false, canViewAbstract: false,
      canCreatePostQual: false, canApprovePostQual: false, canViewPostQual: false,
      canCreateBACRes: false, canApproveBACRes: false, canViewBACRes: false,
      canCreateNOA: false, canApproveNOA: false, canViewNOA: false,
      canCreatePO: false, canApprovePO: false, canViewPO: false,
      canCreateIAR: false, canApproveIAR: false, canViewIAR: false,
      canCreateCOA: false, canSubmitCOA: false, canViewCOA: false,
      canCreateItem: false, canEditItem: false, canDeleteItem: false, canViewItem: true,
      canCreateSupplier: false, canEditSupplier: false, canDeleteSupplier: false, canViewSupplier: false,
      canCreateUser: false, canEditUser: false, canDeleteUser: false, canViewUser: false,
      canViewReports: true, canExportReports: false,
      canManageDivisions: false
    },
    end_user: {
      // End User: Creates PPMP, creates PR
      canCreatePPMP: true, canApprovePPMP: false, canViewPPMP: true,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: false,
      canCreatePR: true, canApprovePR: false, canViewPR: true,
      canCreateRFQ: false, canSendRFQ: false, canViewRFQ: false,
      canCreateAbstract: false, canApproveAbstract: false, canViewAbstract: false,
      canCreatePostQual: false, canApprovePostQual: false, canViewPostQual: false,
      canCreateBACRes: false, canApproveBACRes: false, canViewBACRes: false,
      canCreateNOA: false, canApproveNOA: false, canViewNOA: false,
      canCreatePO: false, canApprovePO: false, canViewPO: false,
      canCreateIAR: false, canApproveIAR: false, canViewIAR: false,
      canCreateCOA: false, canSubmitCOA: false, canViewCOA: false,
      canCreateItem: false, canEditItem: false, canDeleteItem: false, canViewItem: true,
      canCreateSupplier: false, canEditSupplier: false, canDeleteSupplier: false, canViewSupplier: false,
      canCreateUser: false, canEditUser: false, canDeleteUser: false, canViewUser: false,
      canViewReports: false, canExportReports: false,
      canManageDivisions: false
    },
    supply: {
      // Supply/Procurement Officer: Manages procurement process, creates PO, RFQ
      canCreatePPMP: false, canApprovePPMP: false, canViewPPMP: false,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: true,
      canCreatePR: false, canApprovePR: false, canViewPR: true,
      canCreateRFQ: true, canSendRFQ: true, canViewRFQ: true,
      canCreateAbstract: true, canApproveAbstract: false, canViewAbstract: true,
      canCreatePostQual: false, canApprovePostQual: false, canViewPostQual: false,
      canCreateBACRes: false, canApproveBACRes: false, canViewBACRes: false,
      canCreateNOA: true, canApproveNOA: false, canViewNOA: true,
      canCreatePO: true, canApprovePO: false, canViewPO: true,
      canCreateIAR: true, canApproveIAR: false, canViewIAR: true,
      canCreateCOA: true, canSubmitCOA: true, canViewCOA: true,
      canCreateItem: true, canEditItem: true, canDeleteItem: false, canViewItem: true,
      canCreateSupplier: true, canEditSupplier: true, canDeleteSupplier: false, canViewSupplier: true,
      canCreateUser: false, canEditUser: false, canDeleteUser: false, canViewUser: false,
      canViewReports: true, canExportReports: true,
      canManageDivisions: false
    },
    inspector: {
      // Inspection/Property Custodian: IAR, delivery inspection
      canCreatePPMP: false, canApprovePPMP: false, canViewPPMP: false,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: false,
      canCreatePR: false, canApprovePR: false, canViewPR: false,
      canCreateRFQ: false, canSendRFQ: false, canViewRFQ: false,
      canCreateAbstract: false, canApproveAbstract: false, canViewAbstract: false,
      canCreatePostQual: false, canApprovePostQual: false, canViewPostQual: false,
      canCreateBACRes: false, canApproveBACRes: false, canViewBACRes: false,
      canCreateNOA: false, canApproveNOA: false, canViewNOA: false,
      canCreatePO: false, canApprovePO: false, canViewPO: true,
      canCreateIAR: true, canApproveIAR: false, canViewIAR: true,
      canCreateCOA: false, canSubmitCOA: false, canViewCOA: true,
      canCreateItem: false, canEditItem: false, canDeleteItem: false, canViewItem: true,
      canCreateSupplier: false, canEditSupplier: false, canDeleteSupplier: false, canViewSupplier: false,
      canCreateUser: false, canEditUser: false, canDeleteUser: false, canViewUser: false,
      canViewReports: true, canExportReports: false,
      canManageDivisions: false
    }
  };

  // Get current user's permissions
  function getUserPermissions() {
    return roleActionPermissions[currentUser.role] || {};
  }

  // Check if user has a specific permission
  function hasPermission(permissionName) {
    const perms = getUserPermissions();
    return perms[permissionName] === true;
  }

  // Apply role-based UI visibility (As-Is Permissions)
  function applyRoleVisibility() {
    const role = currentUser.role;
    const perms = getUserPermissions();
    
    // Hide admin-only elements for non-admins
    const adminOnly = document.querySelectorAll('[data-role="admin"]');
    adminOnly.forEach(el => {
      el.style.display = role === 'admin' ? '' : 'none';
    });

    // Show/hide nav items based on role permissions (As-Is)
    const rolePermissions = {
      admin: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'coa', 'items', 'suppliers', 'divisions', 'users', 'reports'],
      hope: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'coa', 'items', 'suppliers', 'divisions', 'reports'],
      bac_chair: ['dashboard', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'items', 'suppliers', 'reports'],
      bac_sec: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'coa', 'items', 'suppliers', 'reports'],
      twg: ['dashboard', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'items', 'suppliers', 'reports'],
      div_head: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'items', 'reports'],
      end_user: ['dashboard', 'ppmp', 'purchase-requests', 'items'],
      supply: ['dashboard', 'app', 'purchase-requests', 'rfq', 'abstract', 'noa', 'purchase-orders', 'iar', 'coa', 'items', 'suppliers', 'reports'],
      inspector: ['dashboard', 'purchase-orders', 'iar', 'coa', 'items', 'reports'],
      auditor: ['dashboard', 'ppmp', 'app', 'pr', 'rfq', 'abstract', 'noa', 'po', 'iar', 'reports']
    };

    const allowedPages = rolePermissions[role] || [];
    navItems.forEach(item => {
      const page = item.dataset.page;
      if (page && !allowedPages.includes(page)) {
        item.style.display = 'none';
      } else {
        item.style.display = '';
      }
    });

    // Apply action-based button visibility
    applyActionPermissions();
  }

  // Apply action-level permissions to buttons and UI elements
  function applyActionPermissions() {
    const perms = getUserPermissions();

    // Map of permission to button selectors
    const permissionButtonMap = {
      // PPMP
      canCreatePPMP: ['[data-action="create-ppmp"]', '.btn-create-ppmp'],
      canApprovePPMP: ['[data-action="approve-ppmp"]', '.btn-approve-ppmp'],
      // APP
      canCreateAPP: ['[data-action="create-app"]'],
      canConsolidateAPP: ['[data-action="consolidate-app"]', '.btn-consolidate-app'],
      canApproveAPP: ['[data-action="approve-app"]'],
      // PR
      canCreatePR: ['[data-action="create-pr"]', '.btn-create-pr'],
      canApprovePR: ['[data-action="approve-pr"]', '.btn-approve-pr'],
      // RFQ
      canCreateRFQ: ['[data-action="create-rfq"]', '.btn-create-rfq'],
      canSendRFQ: ['[data-action="send-rfq"]'],
      // Abstract
      canCreateAbstract: ['[data-action="create-abstract"]', '.btn-create-abstract'],
      canApproveAbstract: ['[data-action="approve-abstract"]'],
      // Post-Qual
      canCreatePostQual: ['[data-action="create-postqual"]', '.btn-create-postqual'],
      canApprovePostQual: ['[data-action="approve-postqual"]'],
      // BAC Resolution
      canCreateBACRes: ['[data-action="create-bacres"]', '.btn-create-bacres'],
      canApproveBACRes: ['[data-action="approve-bacres"]'],
      // NOA
      canCreateNOA: ['[data-action="create-noa"]', '.btn-create-noa'],
      canApproveNOA: ['[data-action="approve-noa"]'],
      // PO
      canCreatePO: ['[data-action="create-po"]', '.btn-create-po'],
      canApprovePO: ['[data-action="approve-po"]'],
      // IAR
      canCreateIAR: ['[data-action="create-iar"]', '.btn-create-iar'],
      canApproveIAR: ['[data-action="approve-iar"]'],
      // COA
      canCreateCOA: ['[data-action="create-coa"]', '.btn-create-coa'],
      canSubmitCOA: ['[data-action="submit-coa"]'],
      // Items
      canCreateItem: ['[data-action="create-item"]', '.btn-create-item'],
      canEditItem: ['[data-action="edit-item"]', '.btn-edit-item'],
      canDeleteItem: ['[data-action="delete-item"]', '.btn-delete-item'],
      // Suppliers
      canCreateSupplier: ['[data-action="create-supplier"]', '.btn-create-supplier'],
      canEditSupplier: ['[data-action="edit-supplier"]', '.btn-edit-supplier'],
      canDeleteSupplier: ['[data-action="delete-supplier"]', '.btn-delete-supplier'],
      // Users
      canCreateUser: ['[data-action="create-user"]', '.btn-create-user'],
      canEditUser: ['[data-action="edit-user"]', '.btn-edit-user'],
      canDeleteUser: ['[data-action="delete-user"]', '.btn-delete-user'],
      // Reports
      canExportReports: ['[data-action="export-reports"]', '.btn-export'],
      // Divisions
      canManageDivisions: ['[data-action="manage-divisions"]']
    };

    // Apply visibility for each permission
    Object.keys(permissionButtonMap).forEach(permission => {
      const selectors = permissionButtonMap[permission];
      const hasAccess = perms[permission] === true;
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (hasAccess) {
            el.style.display = '';
            el.classList.remove('permission-hidden');
          } else {
            el.style.display = 'none';
            el.classList.add('permission-hidden');
          }
        });
      });
    });

    // Handle table action columns - hide entire column if no actions available
    hideEmptyActionColumns();
  }

  // Hide action columns in tables if user has no actions
  function hideEmptyActionColumns() {
    const perms = getUserPermissions();
    
    // Check each table's action column
    const tables = document.querySelectorAll('.data-table');
    tables.forEach(table => {
      const actionHeader = table.querySelector('th:last-child');
      if (actionHeader && actionHeader.textContent.trim().toLowerCase() === 'actions') {
        // Check if there are any visible action buttons
        const actionCells = table.querySelectorAll('td:last-child');
        let hasVisibleActions = false;
        
        actionCells.forEach(cell => {
          const visibleButtons = cell.querySelectorAll('button:not([style*="display: none"]):not(.permission-hidden)');
          if (visibleButtons.length > 0) {
            hasVisibleActions = true;
          }
        });

        // Hide entire action column if no visible actions
        if (!hasVisibleActions) {
          actionHeader.style.display = 'none';
          actionCells.forEach(cell => cell.style.display = 'none');
        } else {
          actionHeader.style.display = '';
          actionCells.forEach(cell => cell.style.display = '');
        }
      }
    });
  }

  // Toggle sidebar
  function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
  }

  // Navigate to page
  function navigateTo(pageId) {
    // Update active nav item
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.dataset.page === pageId) {
        item.classList.add('active');
      }
    });

    // Show active page
    pages.forEach(page => {
      page.classList.remove('active');
      if (page.id === pageId) {
        page.classList.add('active');
      }
    });

    // Update page title
    if (pageTitle) {
      pageTitle.textContent = pageTitles[pageId] || 'Dashboard';
    }

    // Re-apply action permissions for the current page
    setTimeout(() => {
      applyActionPermissions();
    }, 50);
  }

  // Handle logout
  function handleLogout() {
    localStorage.removeItem('dmwUser');
    currentUser = { name: '', role: '', division: '' };
    if (loginOverlay) {
      loginOverlay.classList.remove('hidden');
    }
    // Reset form
    if (loginForm) {
      loginForm.reset();
    }
  }

  // Open modal with content
  function openModal(title, contentHtml) {
    if (modalTitle) {
      modalTitle.textContent = title;
    }
    if (modalBody) {
      modalBody.innerHTML = contentHtml;
    }
    if (modalOverlay) {
      modalOverlay.classList.add('show');
    }
  }

  // Close modal
  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('show');
    }
  }

  // File attachment validation function
  window.validateAttachment = function(inputId, fieldName) {
    const fileInput = document.getElementById(inputId);
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert('⚠️ Required Attachment Missing!\n\nPlease upload: ' + fieldName + '\n\nThis document is required before submission.');
      return false;
    }
    return true;
  };

  // Validate multiple attachments
  window.validateMultipleAttachments = function(inputIds, fieldNames) {
    for (let i = 0; i < inputIds.length; i++) {
      const fileInput = document.getElementById(inputIds[i]);
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert('⚠️ Required Attachment Missing!\n\nPlease upload: ' + fieldNames[i] + '\n\nThis document is required before submission.');
        return false;
      }
    }
    return true;
  };

  // Update file label after selection
  window.updateFileLabel = function(input, labelId, isMultiple = false) {
    const label = document.getElementById(labelId);
    if (label) {
      if (input.files && input.files.length > 0) {
        if (isMultiple && input.files.length > 1) {
          label.textContent = input.files.length + ' files selected';
          label.style.color = '#28a745';
          label.style.fontWeight = '600';
        } else {
          label.textContent = input.files[0].name;
          label.style.color = '#28a745';
          label.style.fontWeight = '600';
        }
      } else {
        label.textContent = 'No file selected';
        label.style.color = '#666';
        label.style.fontWeight = 'normal';
      }
    }
  };

  // Format currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  }

  // Format date
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Modal Templates (As-Is PPMP per NGPA Form)
  window.showNewPPMPModal = function() {
    const html = `
      <form id="ppmpForm">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-info-circle"></i>
          PPMP Fields per NGPA Form: Project, Type, Qty/Size, Mode, Timeline, Fund Source, Budget
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Fiscal Year</label>
            <select class="form-select" required>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <div class="form-group">
            <label>Division (End-User)</label>
            <select class="form-select" required>
              <option value="FAD">FAD - Finance & Administrative</option>
              <option value="WRSD">WRSD - Welfare Reintegration Services</option>
              <option value="MWPSD">MWPSD - Migrant Workers Protection Services</option>
              <option value="MWPTD">MWPTD - Migrant Workers Protection Training</option>
              <option value="ORD">ORD - Office of Regional Director</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Project Title</label>
          <input type="text" placeholder="Enter project/procurement title" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Type</label>
            <select class="form-select" required>
              <option value="Services">Services</option>
              <option value="Goods">Goods</option>
              <option value="Supplies">Supplies</option>
              <option value="Equipment">Equipment</option>
              <option value="Catering">Catering</option>
              <option value="Utilities">Utilities</option>
              <option value="Infrastructure">Infrastructure</option>
            </select>
          </div>
          <div class="form-group">
            <label>Quantity/Size</label>
            <input type="text" placeholder="e.g., 12 months, 200 pax, 10 units" required>
          </div>
        </div>
        <div class="form-group">
          <label>Description/Specifications</label>
          <textarea rows="2" placeholder="Describe the procurement items/services"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Recommended Mode</label>
            <select class="form-select" required>
              <option value="SVP">Small Value Procurement (SVP)</option>
              <option value="DC">Direct Contracting</option>
              <option value="Shopping">Shopping</option>
              <option value="NP-Emergency">NP-Emergency Purchase</option>
            </select>
          </div>
          <div class="form-group">
            <label>Estimated Budget (ABC)</label>
            <input type="number" placeholder="0.00" step="0.01" min="0" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Source of Fund</label>
            <select class="form-select" required>
              <option value="GAA-MOOE">GAA - MOOE</option>
              <option value="GAA-CO">GAA - Capital Outlay</option>
              <option value="GAA-PS">GAA - Personnel Services</option>
              <option value="Special">Special Fund</option>
            </select>
          </div>
          <div class="form-group">
            <label>Fund Code/Charge</label>
            <input type="text" placeholder="e.g., 101-101-001">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Timeline Start</label>
            <select class="form-select" required>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
          <div class="form-group">
            <label>Timeline End</label>
            <select class="form-select" required>
              <option value="12">December</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label><strong>Required Attachments</strong> <span class="text-danger">*</span></label>
          <div class="attachment-box" style="background: #fff3cd; padding: 12px; border-radius: 6px; border: 2px dashed #ffc107;">
            <div style="margin-bottom: 10px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="file" id="ppmpAttachment" accept=".pdf,.doc,.docx,.xls,.xlsx" required style="display: none;" onchange="updateFileLabel(this, 'ppmpFileLabel')">
                <span class="btn btn-sm btn-warning"><i class="fas fa-upload"></i> Upload PPMP Supporting Document</span>
                <span id="ppmpFileLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </label>
            </div>
            <small style="color: #856404;"><i class="fas fa-exclamation-triangle"></i> Required: PPMP Form, Market Survey, or Price Quotation (PDF, DOC, XLS)</small>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" onclick="return validateAttachment('ppmpAttachment', 'PPMP Supporting Document')"><i class="fas fa-save"></i> Save PPMP Entry</button>
        </div>
      </form>
    `;
    openModal('Create New PPMP Entry (per NGPA Form)', html);
  };

  window.showNewPRModal = function() {
    const html = `
      <form id="prForm">
        <div class="info-banner warning-banner">
          <i class="fas fa-clock"></i>
          <strong>Timeline KPI:</strong> PRs must be submitted at least <strong>15 calendar days</strong> before scheduled activity. Division Head approval within <strong>5 calendar days</strong>.
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>PR Number</label>
            <input type="text" value="PR-2025-${String(Math.floor(Math.random() * 9000) + 1000)}" readonly>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Requesting Division</label>
            <select class="form-select" required>
              <option value="">-- Select Division --</option>
              <option value="FAD">FAD - Finance & Admin Division</option>
              <option value="WRSD">WRSD - Workers Resource Services Division</option>
              <option value="MWPSD">MWPSD - Migrant Workers Protection Services Division</option>
              <option value="MWPTD">MWPTD - Migrant Workers Programs & Training Division</option>
              <option value="ORD">ORD - Office of the Regional Director</option>
            </select>
          </div>
          <div class="form-group">
            <label>Requested By (End-User)</label>
            <input type="text" placeholder="Name of requisitioner" required>
          </div>
        </div>
        <div class="form-group">
          <label>Purpose/Justification</label>
          <textarea rows="2" placeholder="Purpose of the purchase request (ISO 9001:2015 Clause 8.2 - Customer Requirements)" required></textarea>
        </div>
        <div class="form-group">
          <label>Linked PPMP Entry (from Consolidated APP)</label>
          <select class="form-select" required>
            <option value="">-- Select PPMP/APP Entry --</option>
            <option value="ppmp-001">PPMP-001 - Office Supplies (FAD) - In APP</option>
            <option value="ppmp-002">PPMP-002 - IT Equipment (FAD) - In APP</option>
            <option value="ppmp-003">PPMP-003 - OFW Assistance Materials (WRSD) - In APP</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Procurement Mode</label>
            <select class="form-select" required>
              <option value="SVP">Small Value Procurement (≤₱1M)</option>
              <option value="DC">Direct Contracting</option>
              <option value="Shopping">Shopping</option>
            </select>
          </div>
          <div class="form-group">
            <label>Estimated Amount (ABC)</label>
            <input type="number" placeholder="0.00" step="0.01" min="0" required>
          </div>
        </div>
        <div class="form-group">
          <label>Scheduled Activity Date</label>
          <input type="date" required>
          <small style="color: #666;">PR must be filed 15 calendar days before this date</small>
        </div>
        <div class="form-group">
          <label><strong>Required Attachments</strong> <span class="text-danger">*</span></label>
          <div class="attachment-box" style="background: #fff3cd; padding: 12px; border-radius: 6px; border: 2px dashed #ffc107;">
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; margin-bottom: 5px; display: block;"><i class="fas fa-file-alt"></i> Route Slip / Annex 1 (MANDATORY)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="prRouteSlip" accept=".pdf,.doc,.docx" required style="display: none;" onchange="updateFileLabel(this, 'prRouteSlipLabel')">
                <button type="button" class="btn btn-sm btn-warning" onclick="document.getElementById('prRouteSlip').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="prRouteSlipLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 500; margin-bottom: 5px; display: block;"><i class="fas fa-file-alt"></i> Technical Specifications / TOR</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="prTechSpecs" accept=".pdf,.doc,.docx" style="display: none;" onchange="updateFileLabel(this, 'prTechSpecsLabel')">
                <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('prTechSpecs').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="prTechSpecsLabel" style="font-size: 12px; color: #666;">Optional</span>
              </div>
            </div>
            <div>
              <label style="font-weight: 500; margin-bottom: 5px; display: block;"><i class="fas fa-file-alt"></i> Market Survey / Price Quotations</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="prMarketSurvey" accept=".pdf,.doc,.docx,.xls,.xlsx" style="display: none;" onchange="updateFileLabel(this, 'prMarketSurveyLabel')">
                <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('prMarketSurvey').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="prMarketSurveyLabel" style="font-size: 12px; color: #666;">Optional</span>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-warning" onclick="return validateAttachment('prRouteSlip', 'Route Slip / Annex 1')"><i class="fas fa-save"></i> Save as Draft</button>
          <button type="button" class="btn btn-primary" onclick="submitPRForApproval()"><i class="fas fa-paper-plane"></i> Submit for Approval</button>
        </div>
      </form>
    `;
    openModal('Create Purchase Request (PR)', html);
  };

  window.submitPRForApproval = function() {
    if(!validateAttachment('prRouteSlip', 'Route Slip / Annex 1')) return;
    if(confirm('Submit this PR for Division Head approval? Timeline: 5 calendar days for approval.')) {
      alert('PR submitted for Division Head approval. Status: PR For Approval');
      closeModal();
    }
  };

  window.showNewRFQModal = function() {
    const html = `
      <form id="rfqForm">
        <div class="info-banner warning-banner">
          <i class="fas fa-exclamation-triangle"></i>
          <strong>PhilGEPS Posting:</strong> ABC ≥ ₱200,000 requires <strong>3 calendar days</strong> posting. Timeline: RFQ preparation within <strong>1-3 calendar days</strong> from PR approval.
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>RFQ Number</label>
            <input type="text" value="RFQ-2025-${String(Math.floor(Math.random() * 9000) + 1000)}" readonly>
          </div>
          <div class="form-group">
            <label>Date Prepared</label>
            <input type="date" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Linked Purchase Request (Approved)</label>
          <select class="form-select" required onchange="checkPhilGEPSRequirement(this)">
            <option value="">-- Select Approved PR --</option>
            <option value="pr-2025-001" data-abc="85000">PR-2025-001 - Office Supplies (₱85,000) - No PhilGEPS</option>
            <option value="pr-2025-002" data-abc="320000">PR-2025-002 - IT Equipment (₱320,000) - PhilGEPS Required</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>ABC (Approved Budget for Contract)</label>
            <input type="number" id="rfqABC" placeholder="0.00" step="0.01" min="0" required onchange="updatePhilGEPSIndicator(this.value)">
          </div>
          <div class="form-group">
            <label>Deadline for Quotation Submission</label>
            <input type="date" required>
          </div>
        </div>
        <div id="philgepsIndicator" class="form-group" style="display: none;">
          <div style="background: #d4edda; padding: 10px; border-radius: 4px; border-left: 4px solid #28a745;">
            <i class="fas fa-globe"></i> <strong>PhilGEPS Posting Required</strong>
            <p style="margin: 5px 0 0 0; font-size: 12px;">ABC ≥ ₱200,000 - Post for 3 calendar days minimum</p>
          </div>
        </div>
        <div class="form-group">
          <label>Invited Suppliers (minimum 3 for SVP)</label>
          <select class="form-select" multiple style="height: 120px;">
            <option value="sup-001" data-philgeps="platinum">🥇 ABC Office Supplies Corp. (PhilGEPS Platinum)</option>
            <option value="sup-002" data-philgeps="registered">✓ TechMart Solutions Inc. (PhilGEPS Registered)</option>
            <option value="sup-003" data-philgeps="registered">✓ Best Buy Trading (PhilGEPS Registered)</option>
            <option value="sup-004" data-philgeps="platinum">🥇 Quality Goods Inc. (PhilGEPS Platinum)</option>
            <option value="sup-005" data-philgeps="registered">✓ Metro Supplies Corp. (PhilGEPS Registered)</option>
          </select>
          <small style="color: #666;">Hold Ctrl/Cmd to select multiple. PhilGEPS registration verified suppliers preferred.</small>
        </div>
        <div class="form-group">
          <label>Special Instructions / Technical Specifications</label>
          <textarea rows="2" placeholder="Any special instructions for suppliers, delivery requirements, etc."></textarea>
        </div>
        <div class="form-group">
          <label><strong>Required Attachments</strong> <span class="text-danger">*</span></label>
          <div class="attachment-box" style="background: #e3f2fd; padding: 12px; border-radius: 6px; border: 2px dashed #2196f3;">
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; margin-bottom: 5px; display: block;"><i class="fas fa-file-alt"></i> RFQ Document (Signed)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="rfqDocument" accept=".pdf,.doc,.docx" required style="display: none;" onchange="updateFileLabel(this, 'rfqDocumentLabel')">
                <button type="button" class="btn btn-sm btn-primary" onclick="document.getElementById('rfqDocument').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="rfqDocumentLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div>
              <label style="font-weight: 500; margin-bottom: 5px; display: block;"><i class="fas fa-file-alt"></i> Technical Specifications / TOR</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="rfqTechSpecs" accept=".pdf,.doc,.docx" style="display: none;" onchange="updateFileLabel(this, 'rfqTechSpecsLabel')">
                <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('rfqTechSpecs').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="rfqTechSpecsLabel" style="font-size: 12px; color: #666;">Optional</span>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-warning" onclick="return validateAttachment('rfqDocument', 'RFQ Document')"><i class="fas fa-save"></i> Save Draft</button>
          <button type="button" class="btn btn-primary" onclick="sendRFQ()"><i class="fas fa-paper-plane"></i> Send RFQ</button>
        </div>
      </form>
    `;
    openModal('Create Request for Quotation (RFQ)', html);
  };

  window.updatePhilGEPSIndicator = function(abc) {
    const indicator = document.getElementById('philgepsIndicator');
    if (parseFloat(abc) >= 200000) {
      indicator.style.display = 'block';
    } else {
      indicator.style.display = 'none';
    }
  };

  window.sendRFQ = function() {
    if(!validateAttachment('rfqDocument', 'RFQ Document')) return;
    const abc = parseFloat(document.getElementById('rfqABC').value) || 0;
    if (abc >= 200000) {
      if(confirm('ABC ≥ ₱200,000. This RFQ will be posted to PhilGEPS for 3 calendar days. Continue?')) {
        alert('RFQ sent to suppliers and posted to PhilGEPS. Status: RFQ Posted');
        closeModal();
      }
    } else {
      if(confirm('Send this RFQ to invited suppliers?')) {
        alert('RFQ sent to invited suppliers. Status: RFQ Prepared');
        closeModal();
      }
    }
  };

  window.showNewAbstractModal = function() {
    const html = `
      <form id="abstractForm">
        <div class="info-banner kpi-banner">
          <i class="fas fa-clock"></i>
          <strong>Timeline KPI:</strong> Abstract preparation within <strong>1 calendar day</strong> from quotation deadline.
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Abstract Number</label>
            <input type="text" value="AOQ-2025-${String(Math.floor(Math.random() * 9000) + 1000)}" readonly>
          </div>
          <div class="form-group">
            <label>Date Prepared</label>
            <input type="date" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Linked RFQ</label>
          <select class="form-select" required>
            <option value="">-- Select RFQ with Quotations Received --</option>
            <option value="rfq-001">RFQ-2025-001 - Office Supplies (3 quotations)</option>
            <option value="rfq-002">RFQ-2025-002 - IT Equipment (4 quotations)</option>
          </select>
        </div>
        <div class="form-group">
          <label>TWG Technical Evaluation</label>
          <div style="background: #e3f2fd; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
            <small><i class="fas fa-users"></i> TWG evaluates technical specifications compliance</small>
          </div>
        </div>
        <div class="form-group">
          <label>Received Quotations (LCRB Analysis)</label>
          <table class="data-table" style="font-size: 12px;">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>PhilGEPS</th>
                <th>Quote Amount</th>
                <th>Tech Compliant</th>
                <th>LCRB Rank</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ABC Office Supplies</td>
                <td><span class="badge badge-philgeps-platinum">Platinum</span></td>
                <td><input type="number" placeholder="0.00" style="width: 100px;"></td>
                <td><input type="checkbox" checked></td>
                <td><select style="width: 60px;"><option>1</option><option>2</option><option>3</option></select></td>
              </tr>
              <tr>
                <td>TechMart Solutions</td>
                <td><span class="badge badge-philgeps-registered">Registered</span></td>
                <td><input type="number" placeholder="0.00" style="width: 100px;"></td>
                <td><input type="checkbox" checked></td>
                <td><select style="width: 60px;"><option>2</option><option>1</option><option>3</option></select></td>
              </tr>
              <tr>
                <td>Best Buy Trading</td>
                <td><span class="badge badge-philgeps-registered">Registered</span></td>
                <td><input type="number" placeholder="0.00" style="width: 100px;"></td>
                <td><input type="checkbox"></td>
                <td><select style="width: 60px;"><option>3</option><option>2</option><option>1</option></select></td>
              </tr>
            </tbody>
          </table>
          <small style="color: #666;">LCRB = Lowest Calculated & Responsive Bid. Rank by lowest compliant quote.</small>
        </div>
        <div class="form-group">
          <label>Requires Post-Qualification?</label>
          <select class="form-select" id="postQualRequired">
            <option value="no">No - Proceed to BAC Resolution</option>
            <option value="yes">Yes - Post-Qualification Required (3-5 days)</option>
          </select>
          <small style="color: #666;">Post-qualification recommended for complex procurements or when documentation needs verification.</small>
        </div>
        <div class="form-group">
          <label>BAC Secretariat Recommendation</label>
          <textarea rows="2" placeholder="LCRB recommendation for BAC Resolution..."></textarea>
        </div>
        <div class="form-group">
          <label><strong>Required Attachments</strong> <span class="text-danger">*</span></label>
          <div class="attachment-box" style="background: #e8f5e9; padding: 12px; border-radius: 6px; border: 2px dashed #4caf50;">
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; margin-bottom: 5px; display: block;"><i class="fas fa-file-alt"></i> Abstract of Quotations (Signed by BAC)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="abstractDocument" accept=".pdf,.doc,.docx" required style="display: none;" onchange="updateFileLabel(this, 'abstractDocumentLabel')">
                <button type="button" class="btn btn-sm btn-success" onclick="document.getElementById('abstractDocument').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="abstractDocumentLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; margin-bottom: 5px; display: block;"><i class="fas fa-file-alt"></i> Supplier Quotations (Scanned)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="supplierQuotations" accept=".pdf,.jpg,.jpeg,.png" required multiple style="display: none;" onchange="updateFileLabel(this, 'supplierQuotationsLabel', true)">
                <button type="button" class="btn btn-sm btn-success" onclick="document.getElementById('supplierQuotations').click()"><i class="fas fa-upload"></i> Upload Multiple</button>
                <span id="supplierQuotationsLabel" style="font-size: 12px; color: #666;">No files selected</span>
              </div>
            </div>
            <div>
              <label style="font-weight: 500; margin-bottom: 5px; display: block;"><i class="fas fa-file-alt"></i> TWG Evaluation Report</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="twgReport" accept=".pdf,.doc,.docx" style="display: none;" onchange="updateFileLabel(this, 'twgReportLabel')">
                <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('twgReport').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="twgReportLabel" style="font-size: 12px; color: #666;">Optional</span>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" onclick="return validateMultipleAttachments(['abstractDocument', 'supplierQuotations'], ['Abstract of Quotations', 'Supplier Quotations'])"><i class="fas fa-check-double"></i> Submit Abstract</button>
        </div>
      </form>
    `;
    openModal('Create Abstract of Quotations (AOQ)', html);
  };

  window.showNewNOAModal = function() {
    const html = `
      <form id="noaForm">
        <div class="info-banner kpi-banner">
          <i class="fas fa-clock"></i>
          <strong>Timeline KPI:</strong> NOA issuance within <strong>1 calendar day</strong> from BAC Resolution approval.
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>NOA Number</label>
            <input type="text" value="NOA-2025-${String(Math.floor(Math.random() * 9000) + 1000)}" readonly>
          </div>
          <div class="form-group">
            <label>Date Issued</label>
            <input type="date" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Linked BAC Resolution (Approved)</label>
          <select class="form-select" required>
            <option value="">-- Select BAC Resolution --</option>
            <option value="bacres-001">BAC-RES-2025-001 - Office Supplies (LCRB: ABC Office)</option>
            <option value="bacres-002">BAC-RES-2025-002 - IT Equipment (LCRB: TechMart)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Awarded Supplier (LCRB Winner)</label>
          <select class="form-select" required>
            <option value="">-- Select Winning Supplier --</option>
            <option value="sup-001">🥇 ABC Office Supplies Corp. (PhilGEPS Platinum)</option>
            <option value="sup-002">✓ TechMart Solutions Inc. (PhilGEPS Registered)</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Contract/Award Amount</label>
            <input type="number" placeholder="0.00" step="0.01" min="0" required>
          </div>
          <div class="form-group">
            <label>Delivery Period</label>
            <input type="text" placeholder="e.g., 15 calendar days from PO" required>
          </div>
        </div>
        <div class="form-group">
          <label>Approved By</label>
          <input type="text" value="HoPE / Regional Director" readonly>
        </div>
        <div class="form-group">
          <label><strong>Required Attachments</strong> <span class="text-danger">*</span></label>
          <div class="attachment-box" style="background: #fff8e1; padding: 12px; border-radius: 6px; border: 2px dashed #ff9800;">
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; margin-bottom: 5px; display: block;"><i class="fas fa-award"></i> NOA Document (Signed by HoPE)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="noaDocument" accept=".pdf,.doc,.docx" required style="display: none;" onchange="updateFileLabel(this, 'noaDocumentLabel')">
                <button type="button" class="btn btn-sm btn-warning" onclick="document.getElementById('noaDocument').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="noaDocumentLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div>
              <label style="font-weight: 600; margin-bottom: 5px; display: block;"><i class="fas fa-file-alt"></i> BAC Resolution (Approved)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="noaBacResolution" accept=".pdf,.doc,.docx" required style="display: none;" onchange="updateFileLabel(this, 'noaBacResolutionLabel')">
                <button type="button" class="btn btn-sm btn-warning" onclick="document.getElementById('noaBacResolution').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="noaBacResolutionLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" onclick="return validateMultipleAttachments(['noaDocument', 'noaBacResolution'], ['NOA Document', 'BAC Resolution'])"><i class="fas fa-award"></i> Issue NOA</button>
        </div>
      </form>
    `;
    openModal('Issue Notice of Award (NOA)', html);
  };

  window.showNewPOModal = function() {
    const html = `
      <form id="poForm">
        <div class="info-banner warning-banner">
          <i class="fas fa-exclamation-triangle"></i>
          <strong>Timeline KPI:</strong> PO approval within <strong>1 calendar day</strong>. Supplier must sign within <strong>7 calendar days</strong>. COA submission within <strong>5 calendar days</strong> from PO approval.
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>PO Number</label>
            <input type="text" value="PO-2025-${String(Math.floor(Math.random() * 9000) + 1000)}" readonly>
          </div>
          <div class="form-group">
            <label>Date Created</label>
            <input type="date" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Linked NOA (Issued)</label>
          <select class="form-select" required>
            <option value="">-- Select NOA --</option>
            <option value="noa-001">NOA-2025-001 - ABC Office Supplies (₱85,000)</option>
            <option value="noa-002">NOA-2025-002 - TechMart Solutions (₱320,000)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Supplier</label>
          <input type="text" id="poSupplier" value="" readonly placeholder="Auto-filled from NOA">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Total PO Amount</label>
            <input type="number" placeholder="0.00" step="0.01" required>
          </div>
          <div class="form-group">
            <label>Expected Delivery Date</label>
            <input type="date" required>
          </div>
        </div>
        <div class="form-group">
          <label>Delivery Address</label>
          <textarea rows="2">DMW Regional Office XIII (Caraga), Butuan City, Agusan del Norte</textarea>
        </div>
        <div class="form-group">
          <label>Payment Terms</label>
          <select class="form-select">
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="30days">30 Days from Delivery</option>
            <option value="gov">Government Standard Terms</option>
          </select>
        </div>
        <div class="form-group">
          <label>PO Status Tracking</label>
          <div style="background: #f8f9fa; padding: 10px; border-radius: 4px;">
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <span class="badge badge-po-approved">PO Approved</span>
              <span style="color: #ccc;">→</span>
              <span class="badge" style="background: #e9ecef; color: #666;">Sent to Supplier</span>
              <span style="color: #ccc;">→</span>
              <span class="badge" style="background: #e9ecef; color: #666;">PO Signed by Supplier</span>
            </div>
            <small style="color: #666; display: block; margin-top: 8px;">Supplier signature deadline: 7 calendar days from PO receipt</small>
          </div>
        </div>
        <div class="form-group">
          <label><strong>Required Attachments</strong> <span class="text-danger">*</span></label>
          <div class="attachment-box" style="background: #e3f2fd; padding: 12px; border-radius: 6px; border: 2px dashed #2196f3;">
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; margin-bottom: 5px; display: block;"><i class="fas fa-file-contract"></i> Purchase Order Document (Signed)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="poDocument" accept=".pdf,.doc,.docx" required style="display: none;" onchange="updateFileLabel(this, 'poDocumentLabel')">
                <button type="button" class="btn btn-sm btn-primary" onclick="document.getElementById('poDocument').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="poDocumentLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div>
              <label style="font-weight: 500; margin-bottom: 5px; display: block;"><i class="fas fa-file-signature"></i> Supplier Conforme / Signed PO</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="poSupplierConforme" accept=".pdf,.jpg,.jpeg,.png" style="display: none;" onchange="updateFileLabel(this, 'poSupplierConformeLabel')">
                <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('poSupplierConforme').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="poSupplierConformeLabel" style="font-size: 12px; color: #666;">Upload after supplier signs</span>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-warning" onclick="return validateAttachment('poDocument', 'Purchase Order Document')"><i class="fas fa-save"></i> Save Draft</button>
          <button type="button" class="btn btn-primary" onclick="approvePO()"><i class="fas fa-file-contract"></i> Approve PO</button>
        </div>
      </form>
    `;
    openModal('Create Purchase Order (PO)', html);
  };

  window.approvePO = function() {
    if(!validateAttachment('poDocument', 'Purchase Order Document')) return;
    if(confirm('Approve this Purchase Order? This will start the COA submission timeline (5 calendar days).')) {
      alert('PO Approved. Status: PO Approved. Sending to supplier for signature...');
      closeModal();
    }
  };

  window.showNewIARModal = function() {
    const html = `
      <form id="iarForm">
        <div class="info-banner">
          <i class="fas fa-file-alt"></i>
          <strong>IAR (Appendix 62)</strong> - Inspection & Acceptance Report per COA Circular. ISO 9001:2015 Clause 8.6 - Release of Products.
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>IAR Number (Appendix 62)</label>
            <input type="text" value="IAR-2025-${String(Math.floor(Math.random() * 9000) + 1000)}" readonly>
          </div>
          <div class="form-group">
            <label>Date of Inspection</label>
            <input type="date" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Linked Purchase Order (Delivered)</label>
          <select class="form-select" required>
            <option value="">-- Select Delivered PO --</option>
            <option value="po-001">PO-2025-001 - Office Supplies (Delivered: Today)</option>
            <option value="po-002">PO-2025-002 - IT Equipment (Delivered: Yesterday)</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Supplier</label>
            <input type="text" id="iarSupplier" placeholder="Auto-filled from PO" readonly>
          </div>
          <div class="form-group">
            <label>Invoice Number</label>
            <input type="text" placeholder="Supplier's Sales Invoice No." required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Delivery Receipt No.</label>
            <input type="text" placeholder="DR Number" required>
          </div>
          <div class="form-group">
            <label>Date of Actual Delivery</label>
            <input type="date" required>
          </div>
        </div>
        <div class="form-group">
          <label>Inspection Result (ISO 9001:2015 Clause 8.6)</label>
          <select class="form-select" required id="inspectionResult">
            <option value="">-- Select Inspection Result --</option>
            <option value="complete">✓ Complete & Compliant - Accept All</option>
            <option value="partial">⚠ Partial Delivery - Pending Balance</option>
            <option value="defect">✗ With Defects - For Replacement</option>
            <option value="rejected">✗ Rejected - Non-Compliant with Specs</option>
          </select>
        </div>
        <div class="form-group">
          <label>Inspection Findings / Remarks</label>
          <textarea rows="2" placeholder="Detail inspection findings, quantity verified, specs compliance, etc."></textarea>
        </div>
        <div class="form-group">
          <label><strong>Signatories (per Appendix 62)</strong></label>
          <div style="background: #f8f9fa; padding: 10px; border-radius: 4px;">
            <div class="form-row">
              <div class="form-group" style="margin-bottom: 5px;">
                <label style="font-size: 12px;">Inspected By (Inspection Officer / Property Custodian)</label>
                <input type="text" placeholder="Name of Inspector" required>
              </div>
              <div class="form-group" style="margin-bottom: 5px;">
                <label style="font-size: 12px;">Date Inspected</label>
                <input type="date" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 12px;">Received By (End-User / Supply Officer)</label>
                <input type="text" placeholder="Name of Receiver" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 12px;">Date Received</label>
                <input type="date" required>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label><strong>Required Attachments</strong> <span class="text-danger">*</span></label>
          <div class="attachment-box" style="background: #e8f5e9; padding: 12px; border-radius: 6px; border: 2px dashed #4caf50;">
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; margin-bottom: 5px; display: block;"><i class="fas fa-clipboard-check"></i> IAR Document (Signed - Appendix 62)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="iarDocument" accept=".pdf,.doc,.docx" required style="display: none;" onchange="updateFileLabel(this, 'iarDocumentLabel')">
                <button type="button" class="btn btn-sm btn-success" onclick="document.getElementById('iarDocument').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="iarDocumentLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; margin-bottom: 5px; display: block;"><i class="fas fa-file-invoice"></i> Supplier Invoice (Scanned)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="iarInvoice" accept=".pdf,.jpg,.jpeg,.png" required style="display: none;" onchange="updateFileLabel(this, 'iarInvoiceLabel')">
                <button type="button" class="btn btn-sm btn-success" onclick="document.getElementById('iarInvoice').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="iarInvoiceLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; margin-bottom: 5px; display: block;"><i class="fas fa-truck"></i> Delivery Receipt (Scanned)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="iarDeliveryReceipt" accept=".pdf,.jpg,.jpeg,.png" required style="display: none;" onchange="updateFileLabel(this, 'iarDeliveryReceiptLabel')">
                <button type="button" class="btn btn-sm btn-success" onclick="document.getElementById('iarDeliveryReceipt').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="iarDeliveryReceiptLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div>
              <label style="font-weight: 500; margin-bottom: 5px; display: block;"><i class="fas fa-camera"></i> Photos of Delivered Items</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="iarPhotos" accept=".jpg,.jpeg,.png" multiple style="display: none;" onchange="updateFileLabel(this, 'iarPhotosLabel', true)">
                <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('iarPhotos').click()"><i class="fas fa-upload"></i> Upload Multiple</button>
                <span id="iarPhotosLabel" style="font-size: 12px; color: #666;">Optional</span>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-success" onclick="return validateMultipleAttachments(['iarDocument', 'iarInvoice', 'iarDeliveryReceipt'], ['IAR Document', 'Supplier Invoice', 'Delivery Receipt'])"><i class="fas fa-clipboard-check"></i> Complete IAR</button>
        </div>
      </form>
    `;
    openModal('Inspection & Acceptance Report (IAR - Appendix 62)', html);
  };

  window.showNewItemModal = function() {
    const html = `
      <form id="itemForm">
        <div class="form-row">
          <div class="form-group">
            <label>Item Code</label>
            <input type="text" placeholder="Auto-generated" readonly>
          </div>
          <div class="form-group">
            <label>Category</label>
            <select class="form-select" required>
              <option value="">-- Select Category --</option>
              <option value="office">Office Supplies</option>
              <option value="it">IT Equipment</option>
              <option value="furniture">Furniture</option>
              <option value="services">Services</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Item Name</label>
          <input type="text" placeholder="Enter item name" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea rows="2" placeholder="Detailed description"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Unit of Measure</label>
            <select class="form-select" required>
              <option value="pc">Piece (pc)</option>
              <option value="box">Box</option>
              <option value="ream">Ream</option>
              <option value="set">Set</option>
              <option value="lot">Lot</option>
              <option value="unit">Unit</option>
            </select>
          </div>
          <div class="form-group">
            <label>Unit Price</label>
            <input type="number" placeholder="0.00" step="0.01" min="0" required>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Item</button>
        </div>
      </form>
    `;
    openModal('Add New Item', html);
  };

  window.showNewSupplierModal = function() {
    const html = `
      <form id="supplierForm">
        <div class="form-group">
          <label>Company Name</label>
          <input type="text" placeholder="Enter company name" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>PhilGEPS Registration No.</label>
            <input type="text" placeholder="e.g., PG-123456" required>
          </div>
          <div class="form-group">
            <label>TIN</label>
            <input type="text" placeholder="Tax Identification Number" required>
          </div>
        </div>
        <div class="form-group">
          <label>Contact Person</label>
          <input type="text" placeholder="Name of contact person" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" placeholder="Contact number" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" placeholder="Email address" required>
          </div>
        </div>
        <div class="form-group">
          <label>Address</label>
          <textarea rows="2" placeholder="Complete address" required></textarea>
        </div>
        <div class="form-group">
          <label>Categories</label>
          <select class="form-select" multiple style="height: 80px;">
            <option value="office">Office Supplies</option>
            <option value="it">IT Equipment</option>
            <option value="furniture">Furniture</option>
            <option value="services">Services</option>
          </select>
        </div>
        <div class="form-group">
          <label><strong>Required Attachments</strong> <span class="text-danger">*</span></label>
          <div class="attachment-box" style="background: #e8f5e9; padding: 12px; border-radius: 6px; border: 2px dashed #4caf50;">
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; margin-bottom: 5px; display: block;"><i class="fas fa-globe"></i> PhilGEPS Certificate of Registration</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="supplierPhilgeps" accept=".pdf,.jpg,.jpeg,.png" required style="display: none;" onchange="updateFileLabel(this, 'supplierPhilgepsLabel')">
                <button type="button" class="btn btn-sm btn-success" onclick="document.getElementById('supplierPhilgeps').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="supplierPhilgepsLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; margin-bottom: 5px; display: block;"><i class="fas fa-file-alt"></i> Business Permit / Mayor's Permit</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="supplierBusinessPermit" accept=".pdf,.jpg,.jpeg,.png" required style="display: none;" onchange="updateFileLabel(this, 'supplierBusinessPermitLabel')">
                <button type="button" class="btn btn-sm btn-success" onclick="document.getElementById('supplierBusinessPermit').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="supplierBusinessPermitLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div>
              <label style="font-weight: 500; margin-bottom: 5px; display: block;"><i class="fas fa-file-alt"></i> SEC/DTI Registration</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="supplierSecDti" accept=".pdf,.jpg,.jpeg,.png" style="display: none;" onchange="updateFileLabel(this, 'supplierSecDtiLabel')">
                <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('supplierSecDti').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="supplierSecDtiLabel" style="font-size: 12px; color: #666;">Optional</span>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" onclick="return validateMultipleAttachments(['supplierPhilgeps', 'supplierBusinessPermit'], ['PhilGEPS Certificate', 'Business Permit'])"><i class="fas fa-save"></i> Save Supplier</button>
        </div>
      </form>
    `;
    openModal('Add New Supplier', html);
  };

  window.showNewUserModal = function() {
    const html = `
      <form id="userForm">
        <div class="form-row">
          <div class="form-group">
            <label>First Name</label>
            <input type="text" placeholder="First name" required>
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input type="text" placeholder="Last name" required>
          </div>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" placeholder="Email address" required>
        </div>
        <div class="form-group">
          <label>Username</label>
          <input type="text" placeholder="Username for login" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Division</label>
            <select class="form-select" required>
              <option value="FAD">FAD - Finance & Administrative</option>
              <option value="WRSD">WRSD - Welfare Reintegration Services</option>
              <option value="MWPSD">MWPSD - Migrant Workers Protection Services</option>
              <option value="MWPTD">MWPTD - Migrant Workers Protection Training</option>
              <option value="ORD">ORD - Office of Regional Director</option>
            </select>
          </div>
          <div class="form-group">
            <label>Role</label>
            <select class="form-select" required>
              <option value="end_user">End User</option>
              <option value="div_head">Division Head</option>
              <option value="bac_sec">BAC Secretariat</option>
              <option value="bac_chair">BAC Chairperson</option>
              <option value="twg">TWG Member</option>
              <option value="supply">Supply/Procurement Officer</option>
              <option value="inspector">Inspection/Property Custodian</option>
              <option value="hope">HoPE (Regional Director)</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Temporary Password</label>
          <input type="password" placeholder="Set initial password" required>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-user-plus"></i> Create User</button>
        </div>
      </form>
    `;
    openModal('Create New User', html);
  };

  // BAC Resolution Modal
  window.showNewBACResolutionModal = function() {
    const html = `
      <form id="bacResForm">
        <div class="form-row">
          <div class="form-group">
            <label>Resolution No.</label>
            <input type="text" value="BAC-RES-2026-${String(Math.floor(Math.random() * 9000) + 1000)}" readonly>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Linked Abstract of Quotation</label>
          <select class="form-select" required>
            <option value="">-- Select Abstract --</option>
            <option value="abs-001">ABS-2026-001 - Security Services Q1</option>
            <option value="abs-002">ABS-2026-002 - Office Supplies</option>
          </select>
        </div>
        <div class="form-group">
          <label>Recommended Awardee (LCRB)</label>
          <input type="text" placeholder="Lowest Calculated Responsive Bidder" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Bid Amount</label>
            <input type="number" placeholder="0.00" step="0.01" required>
          </div>
          <div class="form-group">
            <label>ABC</label>
            <input type="number" placeholder="0.00" step="0.01" required>
          </div>
        </div>
        <div class="form-group">
          <label>BAC Recommendation</label>
          <textarea rows="3" placeholder="BAC hereby recommends the award to..." required></textarea>
        </div>
        <div class="form-group">
          <label><strong>Required Attachments</strong> <span class="text-danger">*</span></label>
          <div class="attachment-box" style="background: #fce4ec; padding: 12px; border-radius: 6px; border: 2px dashed #e91e63;">
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; margin-bottom: 5px; display: block;"><i class="fas fa-gavel"></i> BAC Resolution Document (Signed by BAC Members)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="bacResDocument" accept=".pdf,.doc,.docx" required style="display: none;" onchange="updateFileLabel(this, 'bacResDocumentLabel')">
                <button type="button" class="btn btn-sm" style="background: #e91e63; color: white;" onclick="document.getElementById('bacResDocument').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="bacResDocumentLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div>
              <label style="font-weight: 500; margin-bottom: 5px; display: block;"><i class="fas fa-file-alt"></i> Post-Qualification Report (if applicable)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="bacResPostQual" accept=".pdf,.doc,.docx" style="display: none;" onchange="updateFileLabel(this, 'bacResPostQualLabel')">
                <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('bacResPostQual').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="bacResPostQualLabel" style="font-size: 12px; color: #666;">Optional</span>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" onclick="return validateAttachment('bacResDocument', 'BAC Resolution Document')"><i class="fas fa-gavel"></i> Submit Resolution</button>
        </div>
      </form>
    `;
    openModal('Create BAC Resolution', html);
  };

  // Post-Qualification Modal
  window.showNewPostQualModal = function() {
    const html = `
      <form id="postQualForm">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-info-circle"></i>
          Validate eligibility documents per RA 9184 requirements.
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Post-Qual No.</label>
            <input type="text" value="PQ-2026-${String(Math.floor(Math.random() * 9000) + 1000)}" readonly>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Linked Abstract</label>
          <select class="form-select" required>
            <option value="">-- Select Abstract --</option>
            <option value="abs-001">ABS-2026-001 - Security Services Q1</option>
          </select>
        </div>
        <div class="form-group">
          <label>Bidder to Validate</label>
          <input type="text" placeholder="Company name" required>
        </div>
        <div class="form-group">
          <label>Document Checklist</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px; background: var(--bg-color); border-radius: 8px;">
            <label><input type="checkbox"> Income Tax Return (ITR)</label>
            <label><input type="checkbox"> Omnibus Sworn Statement</label>
            <label><input type="checkbox"> Business Permits/Registrations</label>
            <label><input type="checkbox"> PhilGEPS Certificate</label>
            <label><input type="checkbox"> BIR Certificate of Registration</label>
            <label><input type="checkbox"> Mayor's Permit</label>
            <label><input type="checkbox"> SEC/DTI Registration</label>
            <label><input type="checkbox"> PCAB License (if applicable)</label>
          </div>
        </div>
        <div class="form-group">
          <label>TWG Findings</label>
          <textarea rows="2" placeholder="Post-qualification findings..."></textarea>
        </div>
        <div class="form-group">
          <label><strong>Required Attachments</strong> <span class="text-danger">*</span></label>
          <div class="attachment-box" style="background: #e8eaf6; padding: 12px; border-radius: 6px; border: 2px dashed #3f51b5;">
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; margin-bottom: 5px; display: block;"><i class="fas fa-user-check"></i> Post-Qualification Report (TWG Signed)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="postQualReport" accept=".pdf,.doc,.docx" required style="display: none;" onchange="updateFileLabel(this, 'postQualReportLabel')">
                <button type="button" class="btn btn-sm" style="background: #3f51b5; color: white;" onclick="document.getElementById('postQualReport').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="postQualReportLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div>
              <label style="font-weight: 600; margin-bottom: 5px; display: block;"><i class="fas fa-folder-open"></i> Bidder Documents (Scanned)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="postQualBidderDocs" accept=".pdf,.jpg,.jpeg,.png" required multiple style="display: none;" onchange="updateFileLabel(this, 'postQualBidderDocsLabel', true)">
                <button type="button" class="btn btn-sm" style="background: #3f51b5; color: white;" onclick="document.getElementById('postQualBidderDocs').click()"><i class="fas fa-upload"></i> Upload Multiple</button>
                <span id="postQualBidderDocsLabel" style="font-size: 12px; color: #666;">No files selected</span>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" onclick="return validateMultipleAttachments(['postQualReport', 'postQualBidderDocs'], ['Post-Qualification Report', 'Bidder Documents'])"><i class="fas fa-user-check"></i> Complete Post-Qual</button>
        </div>
      </form>
    `;
    openModal('Post-Qualification Validation', html);
  };

  // COA Submission Modal
  window.showNewCOASubmissionModal = function() {
    const html = `
      <form id="coaForm">
        <div class="info-banner warning-banner" style="margin-bottom: 15px;">
          <i class="fas fa-clock"></i>
          <strong>Deadline:</strong> Submit within 5 calendar days from PO approval date.
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Submission No.</label>
            <input type="text" value="COA-2026-${String(Math.floor(Math.random() * 9000) + 1000)}" readonly>
          </div>
          <div class="form-group">
            <label>Submission Date</label>
            <input type="date" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Linked Purchase Order</label>
          <select class="form-select" required>
            <option value="">-- Select PO --</option>
            <option value="po-001">PO-JAN-2026-001 - Security Services</option>
            <option value="po-002">PO-JAN-2026-002 - Internet Subscription</option>
          </select>
        </div>
        <div class="form-group">
          <label>Linked IAR</label>
          <select class="form-select" required>
            <option value="">-- Select IAR --</option>
            <option value="iar-001">IAR-2026-001</option>
          </select>
        </div>
        <div class="form-group">
          <label><strong>Required COA Submission Packet</strong> <span class="text-danger">*</span></label>
          <div class="attachment-box" style="background: #fff3e0; padding: 12px; border-radius: 6px; border: 2px dashed #ff5722;">
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; margin-bottom: 5px; display: block;"><i class="fas fa-file-pdf"></i> Complete COA Packet (Single PDF)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="coaPacket" accept=".pdf" required style="display: none;" onchange="updateFileLabel(this, 'coaPacketLabel')">
                <button type="button" class="btn btn-sm" style="background: #ff5722; color: white;" onclick="document.getElementById('coaPacket').click()"><i class="fas fa-upload"></i> Upload PDF</button>
                <span id="coaPacketLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
              <small style="color: #666; display: block; margin-top: 5px;">Combine all documents into a single PDF file</small>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Documents Included in Packet (Checklist)</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 10px; background: var(--bg-color); border-radius: 8px; font-size: 13px;">
            <label><input type="checkbox" required> Purchase Request (PR)</label>
            <label><input type="checkbox" required> Route Slip / Annex 1</label>
            <label><input type="checkbox" required> Request for Quotation (RFQ)</label>
            <label><input type="checkbox" required> Abstract of Quotations</label>
            <label><input type="checkbox" required> BAC Resolution</label>
            <label><input type="checkbox" required> Notice of Award (NOA)</label>
            <label><input type="checkbox" required> Purchase Order (PO)</label>
            <label><input type="checkbox" required> Inspection & Acceptance Report</label>
            <label><input type="checkbox" required> Delivery Receipt</label>
            <label><input type="checkbox" required> Sales Invoice</label>
            <label><input type="checkbox"> PhilGEPS Posting (if ABC ≥ ₱200K)</label>
            <label><input type="checkbox"> Supplier Conforme</label>
          </div>
        </div>
        <div class="form-group">
          <label>Received by COA (Name)</label>
          <input type="text" placeholder="COA representative name" required>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" onclick="return validateAttachment('coaPacket', 'COA Submission Packet')"><i class="fas fa-file-export"></i> Submit to COA</button>
        </div>
      </form>
    `;
    openModal('COA Submission Packet', html);
  };

  // APP Consolidation function
  window.consolidateAPP = function() {
    alert('Consolidating PPMP entries from all 5 divisions into APP...\n\nThis will pull all approved PPMP items from:\n• FAD\n• WRSD\n• MWPSD\n• MWPTD\n• ORD');
  };

  // Expose closeModal to window for inline onclick handlers
  window.closeModal = closeModal;

  // Initialize the application
  init();
});