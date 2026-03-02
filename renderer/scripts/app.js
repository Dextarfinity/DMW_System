// DMW Caraga Procurement System - Frontend Application
// Dynamic backend integration with PostgreSQL

// =====================================================
// DYNAMIC DATE UTILITIES — All dates are real-time
// =====================================================
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_DATE = new Date();

// Global caches for UOMs and item categories
let cachedUOMs = [];
let cachedItemCategories = [];

/** Get current fiscal year (same as calendar year for Philippine govt) */
function getCurrentFiscalYear() {
  return new Date().getFullYear();
}

/** Get short month name e.g. "Jan", "Feb" */
function getCurrentMonthShort() {
  return new Date().toLocaleString('en-US', { month: 'short' });
}

/** Generate fiscal year options for dropdowns (current year + previous 2 years) */
function getFiscalYearOptions(prefix = 'FY', selectedYear = null) {
  const cy = getCurrentFiscalYear();
  const sel = selectedYear || cy;
  let html = '';
  for (let y = cy; y >= cy - 2; y--) {
    html += `<option value="${y}" ${y === sel ? 'selected' : ''}>${prefix} ${y}</option>`;
  }
  return html;
}

/** Generate a dynamic document number with current year */
function generateDocNumber(prefix) {
  const yr = getCurrentFiscalYear();
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}-${yr}-${rand}`;
}

/** Format today as ISO date string (YYYY-MM-DD) */
function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

/** Format a date nicely e.g. "Feb 22, 2026" */
function formatDateNice(date) {
  return new Date(date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Wait for the DOM to load — populate ALL fiscal year spans & dynamic selects
document.addEventListener('DOMContentLoaded', function() {
  const currentYear = getCurrentFiscalYear();

  // Set all fiscal year spans (using class instead of duplicate IDs)
  document.querySelectorAll('.fiscal-year-display').forEach(el => {
    el.textContent = currentYear;
  });

  // Also handle legacy id="year" (first one only)
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = currentYear;

  // Populate all dynamic fiscal year selects
  document.querySelectorAll('.dynamic-fy-select').forEach(sel => {
    const prefix = sel.dataset.prefix || 'FY';
    sel.innerHTML = getFiscalYearOptions(prefix);
  });
});

// =====================================================
// PRINT HEADER LOGOS - Base64 encoded for print windows
// =====================================================
let dmwLogoBase64 = '';
let bagongPilipinasBase64 = '';
let dmwLogoFilePath = '';
let bpLogoFilePath = '';
try {
  const fs = require('fs');
  const nodePath = require('path');
  const assetsDir = nodePath.join(__dirname, '..', 'assets');
  if (!fs.existsSync(assetsDir)) {
    // fallback: try renderer/assets from workspace root
    const altDir = nodePath.join(__dirname, 'assets');
    if (fs.existsSync(altDir)) {
      const dmwFile = nodePath.join(altDir, 'image.png');
      const bpFile = nodePath.join(altDir, 'bagong-pilipinas.png');
      if (fs.existsSync(dmwFile)) { dmwLogoBase64 = 'data:image/png;base64,' + fs.readFileSync(dmwFile).toString('base64'); dmwLogoFilePath = dmwFile; }
      if (fs.existsSync(bpFile)) { bagongPilipinasBase64 = 'data:image/png;base64,' + fs.readFileSync(bpFile).toString('base64'); bpLogoFilePath = bpFile; }
    }
  } else {
    const dmwFile = nodePath.join(assetsDir, 'image.png');
    const bpFile = nodePath.join(assetsDir, 'bagong-pilipinas.png');
    if (fs.existsSync(dmwFile)) { dmwLogoBase64 = 'data:image/png;base64,' + fs.readFileSync(dmwFile).toString('base64'); dmwLogoFilePath = dmwFile; }
    if (fs.existsSync(bpFile)) { bagongPilipinasBase64 = 'data:image/png;base64,' + fs.readFileSync(bpFile).toString('base64'); bpLogoFilePath = bpFile; }
  }
} catch (e) {
  console.warn('Could not load print header logos:', e.message);
}

// Reusable print header HTML generator
function getPrintHeaderHTML() {
  return `
    <div class="print-header">
      <div class="header-left">
        ${dmwLogoBase64 ? `<img src="${dmwLogoBase64}" alt="DMW Logo">` : ''}
      </div>
      <div class="header-center">
        <div class="republic"><em>Republic of the Philippines</em></div>
        <div class="dept-name">Department of Migrant Workers</div>
        <div class="regional">Regional Office &ndash; XIII (Caraga)</div>
        <div class="address">3<sup>rd</sup> Floor Esquina Dos Building, J.C. Aquino Avenue corner Doongan Road, Butuan City,<br>Agusan del Norte, 8600</div>
      </div>
      <div class="header-right">
        ${bagongPilipinasBase64 ? `<img src="${bagongPilipinasBase64}" alt="Bagong Pilipinas">` : ''}
      </div>
    </div>
  `;
}

// Reusable print header CSS
function getPrintHeaderCSS() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&display=swap');
    .print-header {
      width: 720px;
      margin: 0 auto 10px auto;
      display: table;
      table-layout: fixed;
      border-bottom: 3px solid #333;
      padding-bottom: 8px;
    }
    .print-header .header-left,
    .print-header .header-center,
    .print-header .header-right {
      display: table-cell;
      vertical-align: middle;
      text-align: center;
    }
    .print-header .header-left {
      width: 105px;
      padding-right: 0;
    }
    .print-header .header-right {
      width: 95px;
      padding-left: 0;
    }
    .print-header .header-left img {
      width: 115px;
      height: 115px;
      object-fit: contain;
    }
    .print-header .header-right img {
      width: 85px;
      height: 85px;
      object-fit: contain;
    }
    .print-header .header-center {
      text-align: center;
      padding: 0;
    }
    .print-header .header-center .republic {
      font-size: 12pt;
      font-weight: normal;
      font-family: 'Times New Roman', Times, serif;
    }
    .print-header .header-center .dept-name {
      font-family: 'Old English Text MT', 'UnifrakturMaguntia', serif;
      font-size: 20pt;
      margin: 0;
      font-weight: normal;
      line-height: 1.2;
    }
    .print-header .header-center .regional {
      font-size: 12pt;
      font-weight: bold;
      font-family: Arial, sans-serif;
      margin: 2px 0;
    }
    .print-header .header-center .address {
      font-size: 7pt;
      font-family: 'Times New Roman', Times, serif;
      color: #333;
      margin-top: 2px;
      line-height: 1.3;
    }
  `;
}


// API Configuration - Use the server's network IP so other machines on the LAN can connect
const API_URL = (window.location.hostname === 'localhost' || window.location.protocol === 'file:')
  ? 'http://192.168.100.235:3000/api'
  : `http://${window.location.hostname}:3000/api`;

let authToken = null;
let currentUser = { name: '', role: '', roles: [], division: '' };

// --- Dual-role helper functions ---
// Check if the current user has a specific role (primary or secondary)
function userHasRole(r) {
  return (currentUser.roles || [r === currentUser.role]).includes(r);
}
// Check if the current user has ANY of the given roles
function userHasAnyRole(arr) {
  return (currentUser.roles || [currentUser.role]).some(r => arr.includes(r));
}
// Get the user's chief role (if any) from the roles array
function getUserChiefRole() {
  const chiefRoles = ['chief_fad', 'chief_wrsd', 'chief_mwpsd', 'chief_mwptd'];
  return (currentUser.roles || [currentUser.role]).find(r => chiefRoles.includes(r)) || null;
}
// Get merged page permissions for all user roles
function getMergedPermissions(rolePermissions) {
  const merged = new Set();
  (currentUser.roles || [currentUser.role]).forEach(r => {
    (rolePermissions[r] || []).forEach(p => merged.add(p));
  });
  return [...merged];
}

// Global data caches for filtering
let cachedPR = [], cachedRFQ = [], cachedAbstract = [], cachedPostQual = [];
let cachedBACRes = [], cachedNOA = [], cachedPO = [], cachedIAR = [];

// Global caches for divisions & procurement modes (populated once from DB)
let cachedDivisions = [];
let cachedProcModes = [];

// Fetch and cache divisions from DB
async function ensureDivisionsLoaded() {
  if (cachedDivisions.length) return cachedDivisions;
  try {
    cachedDivisions = await apiRequest('/divisions');
  } catch (e) { cachedDivisions = []; }
  return cachedDivisions;
}

// Fetch and cache procurement modes from DB
async function ensureProcModesLoaded() {
  if (cachedProcModes.length) return cachedProcModes;
  try {
    cachedProcModes = await apiRequest('/procurement-modes');
  } catch (e) { cachedProcModes = []; }
  return cachedProcModes;
}

// Build <option> HTML for divisions
function buildDivisionOptions(selectedCode, includeEmpty = true) {
  let html = includeEmpty ? '<option value="">-- Select Division --</option>' : '';
  cachedDivisions.forEach(d => {
    const code = d.code || d.abbreviation || d.name;
    const sel = (code === selectedCode) ? ' selected' : '';
    html += `<option value="${code}" data-deptid="${d.id}"${sel}>${code}</option>`;
  });
  return html;
}

// Build <option> HTML for divisions using ID as value (for user/employee/office forms)
function buildDivisionOptionsById(selectedId, includeEmpty = true, labelStyle = 'short') {
  let html = includeEmpty ? '<option value="">-- Select --</option>' : '';
  cachedDivisions.forEach(d => {
    const code = d.code || d.abbreviation || d.name;
    const sel = (String(d.id) === String(selectedId)) ? ' selected' : '';
    const label = labelStyle === 'long' ? `${code} - ${d.name}` : code;
    html += `<option value="${d.id}"${sel}>${label}</option>`;
  });
  return html;
}

// Build <option> HTML for procurement modes
function buildProcModeOptions(selectedMode, includeEmpty = false) {
  let html = includeEmpty ? '<option value="">-- Select Mode --</option>' : '';
  cachedProcModes.forEach(m => {
    const sel = (m.name === selectedMode) ? ' selected' : '';
    html += `<option value="${m.name}"${sel}>${m.name}</option>`;
  });
  return html;
}

// Populate the signup division dropdown from DB
async function populateSignupDivision() {
  const sel = document.getElementById('signupDivision');
  if (!sel) return;
  try {
    await ensureDivisionsLoaded();
  } catch (e) {
    // Divisions API requires auth - skip silently on login page
    return;
  }
  sel.innerHTML = '<option value="">Select Division...</option>';
  cachedDivisions.forEach(d => {
    const code = d.code || d.abbreviation || d.name;
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = `${d.name} (${code})`;
    sel.appendChild(opt);
  });
}

// API Helper Functions
async function apiRequest(endpoint, method = 'GET', data = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  
  const options = { method, headers };
  if (data && method !== 'GET') options.body = JSON.stringify(data);
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }
    return await response.json();
  } catch (err) {
    console.error(`API Error (${endpoint}):`, err);
    throw err;
  }
}

// Data loading functions
async function loadDashboardStats() {
  try {
    const stats = await apiRequest('/dashboard/stats');
    updateDashboardStats(stats);
    updateDashboardPipeline(stats);

    // Determine if user should see only their division
    const chiefDivMap = { chief_fad: 'FAD', chief_wrsd: 'WRSD', chief_mwpsd: 'MWPSD', chief_mwptd: 'MWPTD' };
    const role = currentUser.role || '';
    const isAdmin = userHasAnyRole(['admin', 'system_admin']);
    const isORD = (currentUser.division || '').toUpperCase() === 'ORD' || userHasRole('ord_manager');
    const canSeeAll = isAdmin || isORD;
    const chiefRole = getUserChiefRole();
    const userDiv = (chiefRole ? chiefDivMap[chiefRole] : null) || (currentUser.department_code || currentUser.division || '').toUpperCase();

    // Filter PRs by division for chiefs
    let recentPRs = stats.recentPRs || [];
    let trackerData = stats.procurementTracker || [];
    if (!canSeeAll && userDiv) {
      recentPRs = recentPRs.filter(pr => (pr.dept_code || '').toUpperCase() === userDiv);
      trackerData = trackerData.filter(r => (r.dept_code || '').toUpperCase() === userDiv);
    }

    updateDashboardRecentPRs(recentPRs);
    updateDashboardTracker(trackerData);
    updateDashboardDivisionPPMP(stats.divisionPPMP || {}, stats.totalPPMPBudget || 0, canSeeAll, userDiv);
    updateDashboardPRStatusSummary(stats.prByStatus || {});
    updateDashboardRecentActivity(stats.recentActivity || []);
  } catch (err) {
    console.error('Dashboard stats error:', err);
  }
}

async function loadItems() {
  try {
    const items = await apiRequest('/items');
    renderItemsTable(items);
    // Extract and cache distinct categories
    const cats = [...new Set(items.map(i => i.category).filter(Boolean))].sort();
    cachedItemCategories = cats;
    populateItemCategoryFilter(cats);
    return items;
  } catch (err) {
    console.log('Using demo items data');
    return [];
  }
}

/** Populate the itemCategoryFilter dropdown dynamically from loaded items */
function populateItemCategoryFilter(categories) {
  const sel = document.getElementById('itemCategoryFilter');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">All Categories</option>' +
    categories.map(c => `<option value="${c}" ${c === current ? 'selected' : ''}>${c}</option>`).join('');
}

/** Build <option> list for category dropdowns in modals */
function buildCategoryOptions(selectedValue) {
  return '<option value="">-- Select Category --</option>' +
    cachedItemCategories.map(c =>
      `<option value="${c}" ${c === selectedValue ? 'selected' : ''}>${c}</option>`
    ).join('');
}

/** Build <option> list for UOM dropdowns in modals */
function buildUOMOptions(selectedValue) {
  const sv = (selectedValue || '').toUpperCase();
  return '<option value="">-- Select Unit --</option>' +
    cachedUOMs.map(u =>
      `<option value="${u.abbreviation}" ${u.abbreviation === sv ? 'selected' : ''}>${u.abbreviation} - ${u.name}</option>`
    ).join('');
}

async function loadSuppliers() {
  try {
    const suppliers = await apiRequest('/suppliers');
    renderSuppliersTable(suppliers);
    return suppliers;
  } catch (err) {
    console.log('Using demo suppliers data');
    return [];
  }
}

async function loadUsers() {
  try {
    const users = await apiRequest('/users');
    renderUsersTable(users);
    return users;
  } catch (err) {
    console.log('Using demo users data');
    return [];
  }
}

async function loadPPMP() {
  const tbody = document.getElementById('ppmpTableBody');
  try {
    const chiefRoles = ['chief_fad', 'chief_wrsd', 'chief_mwpsd', 'chief_mwptd'];
    const isChief = userHasAnyRole(chiefRoles);

    const divFilter = document.getElementById('ppmpDivisionFilter');
    const modeFilter = document.getElementById('ppmpModeFilter');
    const catFilter = document.getElementById('ppmpCategoryFilter');
    const yearFilter = document.getElementById('ppmpYearFilter');
    const searchInput = document.getElementById('ppmpSearchInput');

    // For chiefs, auto-select their division and lock the dropdown
    if (isChief && divFilter) {
      const chiefDeptMap = { chief_fad: '1', chief_wrsd: '4', chief_mwpsd: '3', chief_mwptd: '2' };
      const chiefRole = getUserChiefRole();
      divFilter.value = chiefDeptMap[chiefRole] || '';
      divFilter.disabled = true;
      divFilter.style.opacity = '0.7';
    }

    // Read selected division ("all" = all divisions, specific number = one division)
    const selectedDept = divFilter ? divFilter.value : 'all';

    // Show loading indicator
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="15" class="text-center" style="padding:30px;color:#636e78;"><i class="fas fa-spinner fa-spin" style="font-size:20px;margin-right:8px;"></i>Loading PPMP data...</td></tr>';
    }

    // Build server query with all filters
    const selectedYear = yearFilter ? yearFilter.value : String(getCurrentFiscalYear());
    const selectedMode = modeFilter ? modeFilter.value : '';
    let url = '/ppmp?fiscal_year=' + selectedYear;
    if (selectedDept && selectedDept !== 'all') url += '&dept_id=' + selectedDept;
    if (selectedMode) url += '&procurement_mode=' + encodeURIComponent(selectedMode);

    const ppmp = await apiRequest(url);
    
    // Apply client-side text search across ALL visible columns
    const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const selectedCategory = catFilter ? catFilter.value : '';
    let filtered = ppmp;

    // Category filter (also matches section)
    if (selectedCategory) {
      filtered = filtered.filter(p => 
        (p.item_category || p.category || '') === selectedCategory ||
        (p.section || '') === selectedCategory
      );
    }

    if (searchText) {
      filtered = filtered.filter(p =>
        (p.ppmp_no || '').toLowerCase().includes(searchText) ||
        (p.description || '').toLowerCase().includes(searchText) ||
        (p.remarks || '').toLowerCase().includes(searchText) ||
        (p.procurement_mode || '').toLowerCase().includes(searchText) ||
        (p.quantity_size || '').toLowerCase().includes(searchText) ||
        (p.project_type || '').toLowerCase().includes(searchText) ||
        (p.fund_source || '').toLowerCase().includes(searchText) ||
        (p.start_date || '').toLowerCase().includes(searchText) ||
        (p.end_date || '').toLowerCase().includes(searchText) ||
        (p.delivery_period || '').toLowerCase().includes(searchText) ||
        (p.department_code || '').toLowerCase().includes(searchText) ||
        (p.department_name || '').toLowerCase().includes(searchText) ||
        (p.category || '').toLowerCase().includes(searchText) ||
        (p.item_category || '').toLowerCase().includes(searchText) ||
        (p.item_name || '').toLowerCase().includes(searchText) ||
        (p.item_description || '').toLowerCase().includes(searchText) ||
        (p.section || '').toLowerCase().includes(searchText) ||
        (p.status || '').toLowerCase().includes(searchText) ||
        String(p.total_amount || '').includes(searchText)
      );
    }

    // Populate category filter dropdown from loaded data (sections + categories)
    if (catFilter) {
      const currentVal = catFilter.value;
      const sections = [...new Set(ppmp.map(p => p.section).filter(Boolean))].sort();
      const cats = [...new Set(ppmp.map(p => p.item_category || p.category).filter(Boolean))].sort();
      let optionsHtml = '<option value="">All Sections / Categories</option>';
      if (sections.length > 0) {
        optionsHtml += '<optgroup label="── Sections ──">';
        sections.forEach(s => { optionsHtml += `<option value="${s}" ${s === currentVal ? 'selected' : ''}>${s}</option>`; });
        optionsHtml += '</optgroup>';
      }
      if (cats.length > 0) {
        optionsHtml += '<optgroup label="── Categories ──">';
        cats.forEach(c => { optionsHtml += `<option value="${c}" ${c === currentVal ? 'selected' : ''}>${c}</option>`; });
        optionsHtml += '</optgroup>';
      }
      catFilter.innerHTML = optionsHtml;
    }
    
    renderPPMPTable(filtered);

    // Update division banner
    let banner = document.getElementById('ppmpDivisionBanner');
    if (isChief) {
      const divName = currentUser.division || currentUser.department_code || '';
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'ppmpDivisionBanner';
        banner.className = 'ppmp-division-banner';
        const ppmpSection = document.getElementById('ppmp');
        const pageActions = ppmpSection?.querySelector('.page-actions');
        if (pageActions) {
          pageActions.parentNode.insertBefore(banner, pageActions);
        }
      }
      banner.innerHTML = `<i class="fas fa-building"></i> Showing PPMP for <strong>${divName}</strong> Division Only`;
      banner.style.display = '';
    } else if (banner) {
      banner.style.display = 'none';
    }

    return filtered;
  } catch (err) {
    console.error('Error loading PPMP:', err);
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="15" class="text-center" style="padding:30px;color:#e53e3e;"><i class="fas fa-exclamation-triangle" style="font-size:20px;margin-right:8px;"></i><strong>Failed to load PPMP data.</strong><br><small>Please check if the server is running and try again.</small><br><button class="btn btn-primary" style="margin-top:10px;" onclick="loadPPMP()"><i class="fas fa-redo"></i> Retry</button></td></tr>';
    }
    return [];
  }
}

// Initialize PPMP filter event listeners (called once after login)
function initPPMPFilters() {
  const divFilter = document.getElementById('ppmpDivisionFilter');
  const modeFilter = document.getElementById('ppmpModeFilter');
  const yearFilter = document.getElementById('ppmpYearFilter');
  const searchInput = document.getElementById('ppmpSearchInput');
  
  // Populate division filter from DB
  if (divFilter && divFilter.options.length <= 1) {
    apiRequest('/divisions').then(divisions => {
      divisions.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = d.code || d.name;
        divFilter.appendChild(opt);
      });
    }).catch(() => {});
  }

  // Populate mode filter from DB
  if (modeFilter && modeFilter.options.length <= 1) {
    apiRequest('/procurement-modes').then(modes => {
      modes.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.name;
        opt.textContent = m.name;
        modeFilter.appendChild(opt);
      });
    }).catch(() => {});
  }

  // Populate PR division filter from DB
  const prDivFilter = document.getElementById('prDivisionFilter');
  if (prDivFilter && prDivFilter.options.length <= 1) {
    apiRequest('/divisions').then(divisions => {
      divisions.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.code || d.name;
        opt.textContent = d.code || d.name;
        prDivFilter.appendChild(opt);
      });
    }).catch(() => {});
  }

  // Category filter
  const catFilter = document.getElementById('ppmpCategoryFilter');
  if (catFilter) catFilter.onchange = function() { loadPPMP(); };

  if (divFilter) divFilter.onchange = function() { loadPPMP(); };
  if (modeFilter) modeFilter.onchange = function() { loadPPMP(); };
  if (yearFilter) yearFilter.onchange = function() { loadPPMP(); };
  if (searchInput) {
    let debounce;
    searchInput.oninput = function() {
      clearTimeout(debounce);
      debounce = setTimeout(() => loadPPMP(), 300);
    };
  }
}

async function loadAPP() {
  try {
    const fy = getCurrentFiscalYear();
    const [items, appStatus, budgetSummary] = await Promise.all([
      apiRequest('/plan-items'),
      loadAPPStatus(fy),
      apiRequest('/app-budget-summary?fiscal_year=' + fy)
    ]);
    renderAPPTable(items, appStatus);
    updateAPPSummary(items, budgetSummary);
    updateAPPVersionBanner(appStatus);
    return items;
  } catch (err) {
    console.log('Using demo APP data');
    return [];
  }
}

async function loadAPPStatus(year) {
  try {
    const status = await apiRequest('/app-settings/' + year);
    window._appStatus = status;
    return status;
  } catch (err) {
    console.log('Could not load APP status');
    return { fiscal_year: year, app_type: 'indicative', update_count: 0 };
  }
}

async function loadPR() {
  try {
    const pr = await apiRequest('/pr');
    cachedPR = pr;

    // Lock division filter for non-admin/non-global roles
    const seeAllRoles = ['admin', 'hope', 'bac_chair', 'bac_secretariat'];
    const prDivFilter = document.getElementById('prDivisionFilter');
    if (prDivFilter && !userHasAnyRole(seeAllRoles)) {
      // Auto-select user's division code and disable dropdown
      const chiefDivCodeMap = { chief_fad: 'FAD', chief_wrsd: 'WRSD', chief_mwpsd: 'MWPSD', chief_mwptd: 'MWPTD' };
      const chiefRole = getUserChiefRole();
      const deptCode = chiefRole ? chiefDivCodeMap[chiefRole] : (currentUser.department_code || currentUser.division || '');
      if (deptCode) {
        prDivFilter.value = deptCode;
        prDivFilter.disabled = true;
        prDivFilter.style.opacity = '0.7';
      }
    } else if (prDivFilter) {
      prDivFilter.disabled = false;
      prDivFilter.style.opacity = '1';
    }

    filterPRTable();
    return pr;
  } catch (err) {
    console.log('Using demo PR data');
    return [];
  }
}
function filterPRTable() {
  const statusVal = document.getElementById('prStatusFilter')?.value || '';
  const divVal = document.getElementById('prDivisionFilter')?.value || '';
  let data = cachedPR;

  // Division-based filtering: only admin, hope, bac_chair, bac_secretariat see ALL PRs
  const seeAllRoles = ['admin', 'hope', 'bac_chair', 'bac_secretariat'];
  if (!userHasAnyRole(seeAllRoles)) {
    // Filter to user's own division only
    const userDeptCode = (currentUser.department_code || currentUser.division || '').toUpperCase();
    const userDeptId = currentUser.dept_id;
    if (userDeptId) {
      data = data.filter(r => String(r.dept_id) === String(userDeptId) || (r.department_code || '').toUpperCase() === userDeptCode);
    }
  }

  if (statusVal) data = data.filter(r => r.status === statusVal);
  if (divVal) data = data.filter(r => String(r.dept_id) === divVal || (r.department_code || '').toUpperCase() === divVal.toUpperCase() || (r.department_name || '').toLowerCase().includes(divVal.toLowerCase()));
  renderPRTable(data);
}

async function loadRFQ() {
  try {
    // Always ensure PR data is loaded so we can show quantity/unit from linked PRs
    if (!cachedPR || cachedPR.length === 0) {
      try { cachedPR = await apiRequest('/pr'); } catch(e) { console.log('Could not pre-load PRs for RFQ'); }
    }
    const rfq = await apiRequest('/rfq');
    cachedRFQ = rfq;
    filterRFQTable();
    return rfq;
  } catch (err) {
    console.log('Using demo RFQ data');
    return [];
  }
}
function filterRFQTable() {
  const statusVal = document.getElementById('rfqStatusFilter')?.value || '';
  let data = cachedRFQ;
  if (statusVal) data = data.filter(r => r.status === statusVal);
  renderRFQTable(data);
}

async function loadAbstract() {
  try {
    const abs = await apiRequest('/abstract');
    cachedAbstract = abs;
    filterAbstractTable();
    return abs;
  } catch (err) {
    console.log('Using demo Abstract data');
    return [];
  }
}
function filterAbstractTable() {
  const statusVal = document.getElementById('abstractStatusFilter')?.value || '';
  let data = cachedAbstract;
  if (statusVal) data = data.filter(r => r.status === statusVal);
  renderAbstractTable(data);
}

async function loadPostQual() {
  try {
    const pq = await apiRequest('/postqual');
    cachedPostQual = pq;
    filterPostQualTable();
    return pq;
  } catch (err) {
    console.log('Using demo PostQual data');
    return [];
  }
}
function filterPostQualTable() {
  const statusVal = document.getElementById('postQualStatusFilter')?.value || '';
  let data = cachedPostQual;
  if (statusVal) data = data.filter(r => r.status === statusVal);
  renderPostQualTable(data);
}

async function loadBACResolution() {
  try {
    const bacRes = await apiRequest('/bac-resolution');
    cachedBACRes = bacRes;
    filterBACResTable();
    return bacRes;
  } catch (err) {
    console.log('Using demo BAC Resolution data');
    return [];
  }
}
function filterBACResTable() {
  const statusVal = document.getElementById('bacResStatusFilter')?.value || '';
  let data = cachedBACRes;
  if (statusVal) data = data.filter(r => r.status === statusVal);
  renderBACResolutionTable(data);
}

async function loadNOA() {
  try {
    const noa = await apiRequest('/noa');
    cachedNOA = noa;
    filterNOATable();
    return noa;
  } catch (err) {
    console.log('Using demo NOA data');
    return [];
  }
}
function filterNOATable() {
  const statusVal = document.getElementById('noaStatusFilter')?.value || '';
  let data = cachedNOA;
  if (statusVal) data = data.filter(r => r.status === statusVal);
  renderNOATable(data);
}

async function loadPO() {
  try {
    const po = await apiRequest('/po');
    cachedPO = po;
    filterPOTable();
    return po;
  } catch (err) {
    console.log('Using demo PO data');
    return [];
  }
}
function filterPOTable() {
  const statusVal = document.getElementById('poStatusFilter')?.value || '';
  let data = cachedPO;
  if (statusVal) data = data.filter(r => r.status === statusVal);
  renderPOTable(data);
}

async function loadIAR() {
  try {
    const iar = await apiRequest('/iar');
    cachedIAR = iar;
    filterIARTable();
    return iar;
  } catch (err) {
    console.log('Using demo IAR data');
    return [];
  }
}
function filterIARTable() {
  const filterVal = document.getElementById('iarStatusFilter')?.value || '';
  let data = cachedIAR;
  if (filterVal) data = data.filter(r => r.inspection_result === filterVal || r.acceptance === filterVal);
  renderIARTable(data);
}

async function loadPOPacket() {
  try {
    const data = await apiRequest('/po-packets/monitoring');
    window._poPacketData = data;
    renderPOPacketTable(data);
    updatePOPacketSummary(data);
    return data;
  } catch (err) {
    console.log('PO Packet monitoring load error:', err);
    window._poPacketData = [];
    renderPOPacketTable([]);
    updatePOPacketSummary([]);
    return [];
  }
}

async function loadCOA() {
  try {
    const coa = await apiRequest('/coa');
    renderCOATable(coa);
    return coa;
  } catch (err) {
    console.log('Using demo COA data');
    return [];
  }
}

// ==================== INVENTORY MODULE LOADERS ====================

async function loadStockCards() {
  try {
    const cards = await apiRequest('/stock-cards');
    renderStockCardsTable(cards);
    return cards;
  } catch (err) {
    console.log('Using demo stock cards data');
    return [];
  }
}

async function loadPropertyCards() {
  try {
    const cards = await apiRequest('/property-cards');
    renderPropertyCardsTable(cards);
    return cards;
  } catch (err) {
    console.log('Using demo property cards data');
    return [];
  }
}

async function loadICS() {
  try {
    const ics = await apiRequest('/ics');
    renderICSTable(ics);
    return ics;
  } catch (err) {
    console.log('Using demo ICS data');
    return [];
  }
}

async function loadEmployees() {
  try {
    const employees = await apiRequest('/employees');
    renderEmployeesTable(employees);
    return employees;
  } catch (err) {
    console.log('Using demo employees data');
    return [];
  }
}

async function loadDepartments() {
  try {
    return await apiRequest('/departments');
  } catch (err) {
    console.log('Using demo departments');
    return [
      { id: 1, code: 'FAD', name: 'Finance & Administrative Division' },
      { id: 2, code: 'WRSD', name: 'Workers Resource Services Division' },
      { id: 3, code: 'MWPSD', name: 'Migrant Workers Protection Services Division' },
      { id: 4, code: 'MWPTD', name: 'Migrant Workers Programs & Training Division' },
      { id: 5, code: 'ORD', name: 'Office of the Regional Director' }
    ];
  }
}

// ==================== NEW INVENTORY & MASTER DATA LOADERS ====================

async function loadPAR() {
  try {
    const pars = await apiRequest('/pars');
    renderPARTable(pars);
    return pars;
  } catch (err) { console.log('Using demo PAR data'); return []; }
}

async function loadPTR() {
  try {
    const ptrs = await apiRequest('/ptrs');
    renderPTRTable(ptrs);
    return ptrs;
  } catch (err) { console.log('Using demo PTR data'); return []; }
}

async function loadRIS() {
  try {
    const ris = await apiRequest('/ris');
    renderRISTable(ris);
    return ris;
  } catch (err) { console.log('Using demo RIS data'); return []; }
}

async function loadSuppliesLedger() {
  try {
    const cards = await apiRequest('/supplies-ledger-cards');
    renderSuppliesLedgerTable(cards);
    return cards;
  } catch (err) { console.log('Using demo supplies ledger data'); return []; }
}

async function loadSemiExpendable() {
  try {
    const items = await apiRequest('/received-semi-expendable');
    renderSemiExpendableTable(items);
    return items;
  } catch (err) { console.log('Using demo semi-expendable data'); return []; }
}

async function loadCapitalOutlay() {
  try {
    const items = await apiRequest('/received-capital-outlay');
    renderCapitalOutlayTable(items);
    return items;
  } catch (err) { console.log('Using demo capital outlay data'); return []; }
}

async function loadTripTickets() {
  try {
    const tickets = await apiRequest('/trip-tickets');
    renderTripTicketsTable(tickets);
    return tickets;
  } catch (err) { console.log('Using demo trip tickets data'); return []; }
}

async function loadOffices() {
  try {
    const offices = await apiRequest('/offices');
    renderOfficesTable(offices);
    return offices;
  } catch (err) { console.log('Using demo offices data'); return []; }
}

async function loadDesignations() {
  try {
    const designations = await apiRequest('/designations');
    renderDesignationsTable(designations);
    return designations;
  } catch (err) { console.log('Using demo designations data'); return []; }
}

async function loadDivisions() {
  try {
    const divisions = await apiRequest('/divisions');
    renderDivisionsTable(divisions);
    renderDivisionsGrid(divisions);
    return divisions;
  } catch (err) { console.log('Using demo divisions data'); return []; }
}

async function loadFundClusters() {
  try {
    const fc = await apiRequest('/fund-clusters');
    renderFundClustersTable(fc);
    return fc;
  } catch (err) { console.log('Using demo fund clusters data'); return []; }
}

async function loadProcurementModes() {
  try {
    const modes = await apiRequest('/procurement-modes');
    renderProcurementModesTable(modes);
    return modes;
  } catch (err) { console.log('Using demo procurement modes data'); return []; }
}

let cachedUACSCodes = [];

async function loadUACSCodes() {
  try {
    const codes = await apiRequest('/uacs-codes');
    cachedUACSCodes = codes;
    filterUACSTable();
    return codes;
  } catch (err) { console.log('Using demo UACS codes data'); return []; }
}

function filterUACSTable() {
  const catVal = document.getElementById('uacsCategoryFilter')?.value || '';
  let data = cachedUACSCodes;
  if (catVal) data = data.filter(c => (c.category || '').toUpperCase() === catVal.toUpperCase());
  renderUACSCodesTable(data);
}

async function loadUOMs() {
  try {
    const uoms = await apiRequest('/uoms');
    cachedUOMs = uoms;
    renderUOMsTable(uoms);
    return uoms;
  } catch (err) { console.log('Using demo UOMs data'); return []; }
}

async function loadSettings() {
  try {
    const settings = await apiRequest('/settings');
    renderSettingsTable(settings);
    return settings;
  } catch (err) { console.log('Using demo settings data'); return []; }
}

// Dashboard stats update — all data from single API call
function updateDashboardStats(s) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  
  // Row 1 - Procurement
  set('statTotalPPMP', s.totalPPMPItems || 0);
  set('statTotalPRs', s.totalPRs || 0);
  set('statTotalPOs', s.totalPOs || 0);
  set('statTotalSuppliers', s.totalSuppliers || 0);
  
  // Row 2 - Inventory
  set('statTotalItems', s.totalItems || 0);
  set('statLowStock', (s.lowStockItems || 0) + ' / ' + (s.outOfStockItems || 0));
  set('statPendingIARs', s.pendingIARs || 0);
  set('statTotalEmployees', s.totalEmployees || 0);
  
  // Budget banner
  set('dashTotalBudget', '₱' + (s.totalPPMPBudget || 0).toLocaleString('en-PH', {minimumFractionDigits:2}));
  set('statTotalPlans', s.totalPPMPItems || 0);
  set('dashStockCards', s.totalStockCards || 0);
  set('statPropertyCards', s.totalPropertyCards || 0);
  set('statICS', s.totalICS || 0);
}

function updateDashboardPipeline(s) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('pipelinePR', s.totalPRs || 0);
  set('pipelineRFQ', s.totalRFQs || 0);
  set('pipelineAOQ', s.totalAbstracts || 0);
  set('pipelineTWG', s.totalPostQuals || 0);
  set('pipelineBAC', s.totalBACResolutions || 0);
  set('pipelineNOA', s.totalNOAs || 0);
  set('pipelinePO', s.totalPOs || 0);
  set('pipelineIAR', s.totalIARs || 0);
  set('pipelinePOPacket', s.totalPOPackets || 0);
  set('pipelineCOA', s.totalCOA || 0);
}

// Store full PR list for Show More
let _dashPRsFull = [];
let _dashPRsShowing = 10;

function updateDashboardRecentPRs(prs) {
  const tbody = document.getElementById('dashRecentPRsBody');
  if (!tbody) return;
  _dashPRsFull = prs;
  _dashPRsShowing = 10;
  if (!prs.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding:20px;color:#636e78;">No purchase requests for your division</td></tr>';
    // Hide show more
    const sm = document.getElementById('dashPRsShowMore');
    if (sm) sm.style.display = 'none';
    return;
  }
  renderDashPRRows(prs.slice(0, 10));
  // Show/hide Show More button
  const sm = document.getElementById('dashPRsShowMore');
  if (sm) sm.style.display = prs.length > 10 ? 'block' : 'none';
}

function renderDashPRRows(list) {
  const tbody = document.getElementById('dashRecentPRsBody');
  if (!tbody) return;
  tbody.innerHTML = list.map(pr => {
    const amount = parseFloat(pr.total_amount || 0).toLocaleString('en-PH', {minimumFractionDigits:2});
    const purpose = (pr.purpose || '').length > 40 ? pr.purpose.substring(0, 40) + '...' : (pr.purpose || '-');
    const items = (pr.item_descriptions || 'N/A').length > 50 ? pr.item_descriptions.substring(0, 50) + '...' : (pr.item_descriptions || 'N/A');
    const step = determinePRStep(pr);
    return `<tr>
      <td><strong>${pr.pr_number || '-'}</strong></td>
      <td style="font-size:12px;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${(pr.item_descriptions || '').replace(/"/g, '&quot;')}">${items}</td>
      <td>${purpose}</td>
      <td><span class="dept-badge">${pr.dept_code || '-'}</span></td>
      <td class="text-right">₱${amount}</td>
      <td>${step}</td>
    </tr>`;
  }).join('');
}

// Show More buttons for dashboard tables
window.showMoreDashPRs = function() {
  _dashPRsShowing = _dashPRsFull.length; // show all
  renderDashPRRows(_dashPRsFull);
  const sm = document.getElementById('dashPRsShowMore');
  if (sm) sm.style.display = 'none';
};

window.showMoreDashTracker = function() {
  _dashTrackerShowing = _dashTrackerFull.length; // show all
  renderDashTrackerRows(_dashTrackerFull);
  const sm = document.getElementById('dashTrackerShowMore');
  if (sm) sm.style.display = 'none';
};

function determinePRStep(pr) {
  const s = pr.status || '';
  const badge = (icon, label, bg, color) => `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:${color};background:${bg};padding:3px 10px;border-radius:12px;white-space:nowrap;"><i class="fas ${icon}" style="font-size:10px;"></i> ${label}</span>`;
  if (s === 'rejected') return badge('fa-times-circle', 'PR REJECTED', '#fff5f5', '#c53030');
  if (s === 'cancelled') return badge('fa-ban', 'PR CANCELLED', '#e2e8f0', '#636e78');
  if (s === 'pending_approval' || s === 'pending' || s === 'draft') return badge('fa-hourglass-half', 'PR PENDING APPROVAL', '#fffaf0', '#b7791f');
  if (s === 'approved') return badge('fa-arrow-right', 'PR APPROVED', '#ebf8ff', '#2b6cb0');
  return badge('fa-circle', s.toUpperCase(), '#e2e8f0', '#636e78');
}

function getTrackerStep(row) {
  // Walk the procurement chain from the end (IAR) back to PR
  // IAR — Inspection & Acceptance
  if (row.iar_acceptance || row.iar_inspection) {
    if (row.iar_acceptance === 'complete') return { label: 'IAR — Complete', color: '#38a169', icon: 'fa-clipboard-check' };
    if (row.iar_inspection === 'verified') return { label: 'IAR — Verified', color: '#38a169', icon: 'fa-clipboard-check' };
    if (row.iar_inspection === 'on_going') return { label: 'IAR — On Going', color: '#d69e2e', icon: 'fa-truck' };
    return { label: 'IAR — To Be Checked', color: '#636e78', icon: 'fa-hourglass-half' };
  }
  // Purchase Orders
  if (row.po_status) {
    const s = row.po_status.toLowerCase();
    if (s === 'signed') return { label: 'Purchase Order — Signed', color: '#38a169', icon: 'fa-receipt' };
    return { label: 'Purchase Order — For Signing', color: '#3182ce', icon: 'fa-receipt' };
  }
  // Notice of Award
  if (row.noa_status) {
    const s = row.noa_status.toLowerCase();
    if (s === 'with_noa') return { label: 'With NOA', color: '#805ad5', icon: 'fa-award' };
    return { label: 'Awaiting NOA', color: '#805ad5', icon: 'fa-award' };
  }
  // Post-Qualification
  if (row.postqual_status) {
    const s = row.postqual_status.toLowerCase();
    if (s === 'completed') return { label: 'Post-Qualification Completed', color: '#38a169', icon: 'fa-user-check' };
    return { label: 'Post-Qualification On-Going', color: '#e53e3e', icon: 'fa-user-check' };
  }
  // BAC Resolution
  if (row.bac_status) {
    const s = row.bac_status.toLowerCase();
    if (s === 'completed') return { label: 'BAC Resolution Completed', color: '#38a169', icon: 'fa-gavel' };
    return { label: 'BAC Resolution On-Going', color: '#d69e2e', icon: 'fa-gavel' };
  }
  // Abstract
  if (row.abstract_status) {
    const s = row.abstract_status.toLowerCase();
    if (s === 'completed') return { label: 'Abstract Completed', color: '#38a169', icon: 'fa-table' };
    return { label: 'Abstract On-Going', color: '#d69e2e', icon: 'fa-table' };
  }
  // RFQ
  if (row.rfq_status) {
    const s = row.rfq_status.toLowerCase();
    if (s === 'completed') return { label: 'RFQ Completed', color: '#38a169', icon: 'fa-file-invoice' };
    return { label: 'RFQ On-Going', color: '#3182ce', icon: 'fa-file-invoice' };
  }
  // PR level only
  const ps = (row.pr_status || 'pending_approval').toLowerCase();
  if (ps === 'approved') return { label: 'PR Approved', color: '#2b6cb0', icon: 'fa-arrow-right' };
  if (ps === 'rejected') return { label: 'PR Rejected', color: '#c53030', icon: 'fa-times' };
  if (ps === 'cancelled') return { label: 'PR Cancelled', color: '#636e78', icon: 'fa-ban' };
  return { label: 'PR Pending Approval', color: '#d69e2e', icon: 'fa-hourglass-half' };
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

// Toast notification system
window.showNotification = function(message, type = 'info') {
  // Remove existing notification if any
  const existing = document.getElementById('toastNotification');
  if (existing) existing.remove();

  const colors = {
    success: { bg: '#f0fff4', border: '#38a169', color: '#276749', icon: 'fa-check-circle' },
    error:   { bg: '#fff5f5', border: '#e53e3e', color: '#c53030', icon: 'fa-exclamation-circle' },
    warning: { bg: '#fffaf0', border: '#dd6b20', color: '#b7791f', icon: 'fa-exclamation-triangle' },
    info:    { bg: '#ebf8ff', border: '#3182ce', color: '#2b6cb0', icon: 'fa-info-circle' }
  };
  const c = colors[type] || colors.info;

  const toast = document.createElement('div');
  toast.id = 'toastNotification';
  toast.style.cssText = `position:fixed;top:20px;right:20px;z-index:99999;background:${c.bg};border:1px solid ${c.border};color:${c.color};padding:12px 20px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.15);font-size:13px;font-weight:600;display:flex;align-items:center;gap:10px;max-width:400px;animation:slideInRight 0.3s ease-out;`;
  toast.innerHTML = `<i class="fas ${c.icon}"></i><span>${message}</span><button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:${c.color};font-size:16px;margin-left:8px;padding:0;">&times;</button>`;
  document.body.appendChild(toast);

  // Auto-remove after 4 seconds
  setTimeout(() => { if (toast.parentElement) toast.remove(); }, 4000);
};

// Alias for showToast -> showNotification
window.showToast = window.showNotification;

// Universal status badge used across all transaction table renderers
function statusBadge(label, statusClass) {
  const colorMap = {
    completed: { bg: '#f0fff4', color: '#276749', icon: 'fa-check-double' },
    on_going: { bg: '#ebf8ff', color: '#2b6cb0', icon: 'fa-hourglass-half' },
    rejected: { bg: '#fff5f5', color: '#c53030', icon: 'fa-times-circle' },
    cancelled: { bg: '#e2e8f0', color: '#636e78', icon: 'fa-ban' },
    pending: { bg: '#fffaf0', color: '#b7791f', icon: 'fa-hourglass-half' }
  };
  const c = colorMap[statusClass] || colorMap['on_going'];
  return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:${c.color};background:${c.bg};padding:3px 10px;border-radius:12px;white-space:nowrap;"><i class="fas ${c.icon}" style="font-size:10px;"></i> ${label}</span>`;
}

function stepBadge(status) {
  if (!status) return '<span style="color:#cbd5e0;">—</span>';
  // Map new DB status values to display labels
  const labelMap = {
    pending_approval: 'PR PENDING APPROVAL', approved: 'APPROVED', rejected: 'REJECTED', cancelled: 'CANCELLED',
    on_going: 'ON-GOING', completed: 'COMPLETED',
    awaiting_noa: 'AWAITING NOA', with_noa: 'WITH NOA',
    for_signing: 'FOR SIGNING', signed: 'SIGNED',
    to_be_checked: 'TO BE CHECKED', inspection_ongoing: 'ON GOING', verified: 'VERIFIED', complete: 'COMPLETE', partial: 'PARTIAL'
  };
  const colors = { pending_approval: '#d69e2e', approved: '#38a169', on_going: '#3182ce', completed: '#38a169', rejected: '#c53030', cancelled: '#a0aec0', awaiting_noa: '#805ad5', with_noa: '#38a169', for_signing: '#3182ce', signed: '#38a169', to_be_checked: '#636e78', inspection_ongoing: '#d69e2e', verified: '#38a169', complete: '#38a169', partial: '#d69e2e' };
  const icons = { pending_approval: 'fa-hourglass-half', approved: 'fa-check', on_going: 'fa-spinner', completed: 'fa-check-double', rejected: 'fa-times', cancelled: 'fa-ban', awaiting_noa: 'fa-clock', with_noa: 'fa-award', for_signing: 'fa-pen', signed: 'fa-signature', to_be_checked: 'fa-hourglass-half', inspection_ongoing: 'fa-search', verified: 'fa-clipboard-check', complete: 'fa-check-double', partial: 'fa-exclamation-triangle' };
  const c = colors[status] || '#636e78';
  const i = icons[status] || 'fa-circle';
  const lbl = labelMap[status] || status.toUpperCase().replace(/_/g, ' ');
  return `<span style="display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:600;color:${c};"><i class="fas ${i}" style="font-size:10px;"></i>${lbl}</span>`;
}

// Store full tracker list for Show More
let _dashTrackerFull = [];
let _dashTrackerShowing = 10;

function updateDashboardTracker(rows) {
  const tbody = document.getElementById('dashTrackerBody');
  if (!tbody) return;
  _dashTrackerFull = rows;
  _dashTrackerShowing = 10;
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="12" class="text-center" style="padding:20px;color:#636e78;">No procurement records for your division</td></tr>';
    const sm = document.getElementById('dashTrackerShowMore');
    if (sm) sm.style.display = 'none';
    return;
  }
  renderDashTrackerRows(rows.slice(0, 10));
  const sm = document.getElementById('dashTrackerShowMore');
  if (sm) sm.style.display = rows.length > 10 ? 'block' : 'none';
}

function renderDashTrackerRows(list) {
  const tbody = document.getElementById('dashTrackerBody');
  if (!tbody) return;
  tbody.innerHTML = list.map(r => {
    const step = getTrackerStep(r);
    const items = (r.item_descriptions || 'N/A').length > 35 ? r.item_descriptions.substring(0, 35) + '...' : (r.item_descriptions || 'N/A');
    return `<tr>
      <td><strong>${r.pr_number || '-'}</strong></td>
      <td style="font-size:11px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${(r.item_descriptions||'').replace(/"/g,'&quot;')}">${items}</td>
      <td><span class="dept-badge">${r.dept_code || '-'}</span></td>
      <td style="text-align:center;">${stepBadge(r.pr_status)}</td>
      <td style="text-align:center;">${stepBadge(r.rfq_status)}</td>
      <td style="text-align:center;">${stepBadge(r.abstract_status)}</td>
      <td style="text-align:center;">${stepBadge(r.postqual_status)}</td>
      <td style="text-align:center;">${stepBadge(r.bac_status)}</td>
      <td style="text-align:center;">${stepBadge(r.noa_status)}</td>
      <td style="text-align:center;">${stepBadge(r.po_status)}</td>
      <td style="text-align:center;">${r.iar_inspection ? stepBadge(r.iar_inspection) : '<span style="color:#cbd5e0;">—</span>'}</td>
      <td><span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:${step.color};padding:3px 8px;border-radius:12px;background:${step.color}15;"><i class="fas ${step.icon}" style="font-size:10px;"></i>${step.label}</span></td>
    </tr>`;
  }).join('');
}


function updateDashboardPRStatusSummary(prStatus) {
  const container = document.getElementById('dashPRStatusSummary');
  if (!container) return;
  const statuses = [
    { key: 'pending', label: 'Pending', color: '#d69e2e', icon: 'fa-hourglass-half' },
    { key: 'approved', label: 'Approved', color: '#38a169', icon: 'fa-check' },
    { key: 'processed', label: 'Processed', color: '#3182ce', icon: 'fa-cog' },
    { key: 'rejected', label: 'Rejected', color: '#e53e3e', icon: 'fa-times' },
    { key: 'cancelled', label: 'Cancelled', color: '#a0aec0', icon: 'fa-ban' }
  ];
  const total = Object.values(prStatus).reduce((a, b) => a + b, 0) || 1;
  container.innerHTML = statuses.map(s => {
    const count = prStatus[s.key] || 0;
    const pct = Math.round((count / total) * 100);
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;">
      <div style="display:flex;align-items:center;gap:8px;">
        <i class="fas ${s.icon}" style="color:${s.color};width:16px;text-align:center;"></i>
        <span style="font-weight:500;">${s.label}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:80px;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:${s.color};border-radius:3px;"></div>
        </div>
        <span style="font-weight:700;color:${s.color};min-width:24px;text-align:right;">${count}</span>
      </div>
    </div>`;
  }).join('') + `<div style="text-align:right;padding-top:8px;font-size:12px;color:#4a5568;"><strong>Total PRs:</strong> ${Object.values(prStatus).reduce((a,b)=>a+b,0)}</div>`;
}

function updateDashboardDivisionPPMP(divData, totalBudget, canSeeAll, userDiv) {
  const container = document.getElementById('ppmpDivisionStats');
  if (!container) return;
  
  // Color map for divisions
  const divColorMap = { 'FAD': '#3182ce', 'WRSD': '#38a169', 'MWPSD': '#d69e2e', 'MWPTD': '#e53e3e', 'ORD': '#805ad5' };
  
  // Build from cached divisions (from DB), fallback to minimal list
  const allDivisions = cachedDivisions.length
    ? cachedDivisions.map(d => ({
        code: d.code || d.abbreviation || d.name,
        color: divColorMap[d.code || d.abbreviation] || '#718096',
        label: d.name
      }))
    : [
        { code: 'FAD', color: '#3182ce', label: 'Finance & Admin Division' },
        { code: 'WRSD', color: '#38a169', label: 'Welfare & Reintegration Services' },
        { code: 'MWPSD', color: '#d69e2e', label: 'Migrant Workers Processing' },
        { code: 'MWPTD', color: '#e53e3e', label: 'Migrant Workers Protection' }
      ];
  
  // Filter: chiefs see only their division, admin/ORD see all
  const divisions = canSeeAll ? allDivisions : allDivisions.filter(d => d.code === userDiv);
  
  if (!divisions.length) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:#636e78;">No PPMP data for your division</div>';
    return;
  }
  
  const maxBudget = Math.max(...divisions.map(d => (divData[d.code] || {}).budget || 0), 1);
  const shownBudget = canSeeAll ? totalBudget : (divData[userDiv] || {}).budget || 0;
  
  container.innerHTML = divisions.map(div => {
    const data = divData[div.code] || { count: 0, budget: 0 };
    const pct = Math.round((data.budget / maxBudget) * 100);
    const budgetStr = '₱' + data.budget.toLocaleString('en-PH', {minimumFractionDigits:2});
    return `
      <div class="division-item" style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span class="division-name" style="font-weight:600;">${div.code}</span>
          <span style="font-size:12px;color:#636e78;">${data.count} items &mdash; ${budgetStr}</span>
        </div>
        <div class="progress-bar" style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;">
          <div class="progress-fill" style="width:${pct}%;background:${div.color};height:100%;border-radius:4px;transition:width 0.6s ease;"></div>
        </div>
      </div>
    `;
  }).join('') + `
    <div style="text-align:right;padding-top:8px;border-top:1px solid #e2e8f0;font-size:13px;color:#4a5568;">
      <strong>${canSeeAll ? 'Grand Total' : userDiv + ' Total'}:</strong> ₱${shownBudget.toLocaleString('en-PH', {minimumFractionDigits:2})}
    </div>
  `;
}

function updateDashboardRecentActivity(activities) {
  const tbody = document.getElementById('dashRecentActivityBody');
  if (!tbody) return;
  if (!activities.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding:20px;color:#636e78;">No recent activity</td></tr>';
    return;
  }
  const typeIcons = { PR: 'fa-file-alt', PO: 'fa-shopping-cart', IAR: 'fa-truck' };
  const typeColors = { PR: '#3182ce', PO: '#38a169', IAR: '#d69e2e' };
  tbody.innerHTML = activities.map(a => {
    const icon = typeIcons[a.type] || 'fa-circle';
    const color = typeColors[a.type] || '#636e78';
    const statusClass = a.status === 'approved' ? 'approved' : a.status === 'pending' ? 'submitted' : a.status === 'completed' ? 'approved' : a.status;
    const desc = (a.description || '').length > 60 ? a.description.substring(0, 60) + '...' : (a.description || '-');
    const date = a.created_at ? new Date(a.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
    return `<tr>
      <td><i class="fas ${icon}" style="color:${color};margin-right:4px;"></i> ${a.type}</td>
      <td><strong>${a.ref_no || '-'}</strong></td>
      <td>${desc}</td>
      <td><span class="status-badge ${statusClass}">${a.status || '-'}</span></td>
      <td>${date}</td>
    </tr>`;
  }).join('');
}

// Table rendering functions
function renderItemsTable(items) {
  const tbody = document.getElementById('itemsTableBody');
  if (!tbody || !items.length) return;
  
  tbody.innerHTML = items.map(item => {
    const qty = parseInt(item.quantity) || 0;
    const reorder = parseInt(item.reorder_point) || 0;
    const isService = (item.category || '').toLowerCase() === 'services';
    let stockStatus = 'na';
    let stockLabel = 'N/A';
    if (!isService) {
      if (qty === 0) { stockStatus = 'out-of-stock'; stockLabel = 'Out of Stock'; }
      else if (qty <= reorder) { stockStatus = 'low-stock'; stockLabel = 'Low Stock'; }
      else { stockStatus = 'in-stock'; stockLabel = 'In Stock'; }
    }
    const isSemiOrCapital = ['SEMI-EXPENDABLE', 'CAPITAL OUTLAY'].includes(item.category);
    return `
    <tr>
      <td>${item.code || ''}</td>
      <td>${item.stock_no || '-'}</td>
      <td>${item.name || ''}</td>
      <td>${item.category || ''}</td>
      <td>${item.unit || ''}</td>
      <td>₱${parseFloat(item.unit_price || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>${isService ? '-' : qty}</td>
      <td>${isService ? '-' : reorder}</td>
      <td><span class="stock-badge ${stockStatus}">${stockLabel}</span></td>
      <td>${item.uacs_code || '-'}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewItemModal(${item.id})"><i class="fas fa-eye"></i></button>
          <button class="btn-icon" data-action="edit-item" title="Edit" onclick="showEditItemModal(${item.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon danger" data-action="delete-item" title="Delete" onclick="showDeleteConfirmModal('Item', ${item.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `}).join('');
}

function renderSuppliersTable(suppliers) {
  const tbody = document.getElementById('suppliersTableBody');
  if (!tbody) return;
  if (!suppliers || !suppliers.length) { tbody.innerHTML = '<tr><td colspan="7" class="text-center">No suppliers found</td></tr>'; return; }
  
  tbody.innerHTML = suppliers.map(s => `
    <tr>
      <td>SUP-${String(s.id).padStart(3, '0')}</td>
      <td>${s.name || ''}</td>
      <td>${s.address || ''}</td>
      <td>${s.phone || ''}</td>
      <td><span class="status-badge philgeps-platinum">Active</span></td>
      <td>${s.tin || ''}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" data-action="edit-supplier" title="Edit" onclick="showEditSupplierModal(${s.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon danger" data-action="delete-supplier" title="Delete" onclick="showDeleteConfirmModal('Supplier', ${s.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  
  // Store globally for filtering
  window._allUsers = users;
  
  if (!users.length) { 
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">No users found</td></tr>'; 
    return; 
  }
  
  const roleBadgeColors = {
    admin: '#dc2626', hope: '#7c3aed', bac_chair: '#0891b2', bac_secretariat: '#0891b2',
    twg_member: '#059669', division_head: '#d97706', end_user: '#6b7280', supply_officer: '#2563eb',
    inspector: '#be185d', ord_manager: '#dc2626', chief_fad: '#d97706', chief_wrsd: '#d97706',
    chief_mwpsd: '#d97706', chief_mwptd: '#d97706', manager: '#7c3aed', officer: '#2563eb',
    viewer: '#6b7280', auditor: '#059669'
  };
  
  const roleLabels = {
    admin: 'Admin', hope: 'HoPE', bac_chair: 'BAC Chair', bac_secretariat: 'BAC Sec',
    twg_member: 'TWG', division_head: 'Div Head', end_user: 'End User', supply_officer: 'Supply',
    inspector: 'Inspector', ord_manager: 'ORD Mgr', chief_fad: 'Chief FAD', chief_wrsd: 'Chief WRSD',
    chief_mwpsd: 'Chief MWPSD', chief_mwptd: 'Chief MWPTD', manager: 'Manager', officer: 'Officer',
    viewer: 'Viewer', auditor: 'Auditor'
  };
  
  const isAdmin = userHasRole('admin');
  
  tbody.innerHTML = users.map(u => {
    const badgeColor = roleBadgeColors[u.role] || '#6b7280';
    const roleLabel = roleLabels[u.role] || u.role;
    const lastLogin = u.last_login ? new Date(u.last_login).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never';
    
    return `<tr class="${u.is_active === false ? 'inactive-row' : ''}">
      <td><strong>USR-${String(u.id).padStart(3, '0')}</strong></td>
      <td>${u.username || ''}</td>
      <td>${u.full_name || ''}</td>
      <td>${u.email || '<span style="color:#999">—</span>'}</td>
      <td><span class="role-badge-pill" style="background:${badgeColor};color:#fff;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;">${roleLabel}${u.secondary_role ? ' / ' + (roleLabels[u.secondary_role] || u.secondary_role) : ''}</span></td>
      <td>${u.department_code || '—'}</td>
      <td><span class="status-badge ${u.is_active !== false ? 'approved' : 'rejected'}">${u.is_active !== false ? 'Active' : 'Inactive'}</span></td>
      <td style="font-size:11px;color:#666;">${lastLogin}</td>
      <td>
        <div class="action-buttons">
          ${isAdmin ? `
            <button class="btn-icon" data-action="edit-user" title="Edit User" onclick="showEditUserModal(${u.id})"><i class="fas fa-edit"></i></button>
            <button class="btn-icon" style="color:#7c3aed;" title="Change Role" onclick="showPromoteUserModal(${u.id}, '${u.username}', '${u.role}', '${(u.full_name || '').replace(/'/g, "\\'")}')"><i class="fas fa-user-shield"></i></button>
            ${u.is_active !== false 
              ? `<button class="btn-icon danger" data-action="delete-user" title="Deactivate" onclick="deactivateUser(${u.id}, '${u.username}')"><i class="fas fa-user-slash"></i></button>`
              : `<button class="btn-icon" style="color:#059669;" title="Reactivate" onclick="activateUser(${u.id}, '${u.username}')"><i class="fas fa-user-check"></i></button>`
            }
            <button class="btn-icon danger" title="Permanently Delete" onclick="permanentDeleteUser(${u.id}, '${u.username}')"><i class="fas fa-trash"></i></button>
          ` : `
            <button class="btn-icon" data-action="edit-user" title="Edit" onclick="showEditUserModal(${u.id})"><i class="fas fa-edit"></i></button>
          `}
        </div>
      </td>
    </tr>`;
  }).join('');
}

/** Format PPMP description for table display.
 *  Format:
 *    Other Supplies and Materials (...)    (bold title = General Description)
 *    ALCOHOL, Ethyl, 1 Gallon              (item name from catalog)
 *       Type: Steel,                       (item_description = additional info)
 *       Size: Width: 39 cm...
 */
function formatPPMPDescription(p) {
  const generalDesc = (p.description || '').trim();
  const itemName    = (p.item_name || '').trim();
  const itemDesc    = (p.item_description || '').trim();

  if (!generalDesc && !itemName && !itemDesc) return escapeHtml(p.remarks || '-');

  let html = '';

  // 1) General Description — bold title
  if (generalDesc) {
    html += '<strong>' + escapeHtml(generalDesc) + '</strong>';
  }

  // 2) Item Name from catalog — second line, semi-bold
  if (itemName) {
    html += '<div style="margin-top:2px;font-size:12px;font-weight:600;color:#2d3748;">' + escapeHtml(itemName) + '</div>';
  }

  // 3) item_description — additional specs/details, indented
  if (itemDesc) {
    const allLines = itemDesc.split('\n');
    html += '<div class="ppmp-desc-details">';
    allLines.forEach(l => {
      const trimmed = l.trim();
      if (trimmed) {
        html += '<div class="ppmp-desc-line">' + escapeHtml(trimmed) + '</div>';
      } else {
        html += '<div class="ppmp-desc-line" style="height:6px;"></div>';
      }
    });
    html += '</div>';
  }
  return html || escapeHtml(p.remarks || '-');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderPPMPTable(ppmp) {
  const tbody = document.getElementById('ppmpTableBody');
  if (!tbody) return;

  // Store all data globally
  window._ppmpData = ppmp;

  const ppmpItems = ppmp;
  
  if (!ppmpItems.length) { 
    tbody.innerHTML = '<tr><td colspan="14" class="text-center" style="padding:30px;color:#636e78;">No PPMP entries found for selected filters</td></tr>';
    const gtVal = document.getElementById('ppmpGrandTotalValue');
    const gtCount = document.getElementById('ppmpGrandTotalCount');
    if (gtVal) gtVal.textContent = '₱0.00';
    if (gtCount) gtCount.textContent = '0 items';
    return; 
  }
  
  function getDeptCode(plan) {
    if (plan.department_code) return plan.department_code;
    const name = plan.department_name;
    if (!name) return 'DMW';
    const lower = name.toLowerCase();
    if (lower.includes('finance')) return 'FAD';
    if (lower.includes('protection') && lower.includes('trafficking')) return 'MWPTD';
    if (lower.includes('processing') || lower.includes('service')) return 'MWPSD';
    if (lower.includes('welfare') || lower.includes('reintegration')) return 'WRSD';
    if (lower.includes('director')) return 'FAD';
    return name.substring(0,3).toUpperCase();
  }

  function getModeBadge(mode) {
    if (!mode) return { css: 'svp', label: 'Small Value Procurement' };
    const m = mode.toLowerCase();
    if (m.includes('direct')) return { css: 'dc', label: mode };
    if (m.includes('agency')) return { css: 'others', label: mode };
    if (m.includes('shopping')) return { css: 'shopping', label: mode };
    if (m.includes('competitive') || m.includes('public')) return { css: 'pb', label: mode };
    return { css: 'svp', label: mode };
  }

  // Calculate total budget
  let totalBudget = 0;
  ppmpItems.forEach(p => { totalBudget += parseFloat(p.total_amount || 0); });

  // Update grand total badge in header
  const gtVal = document.getElementById('ppmpGrandTotalValue');
  const gtCount = document.getElementById('ppmpGrandTotalCount');
  if (gtVal) gtVal.textContent = '₱' + totalBudget.toLocaleString('en-PH', {minimumFractionDigits: 2});
  if (gtCount) gtCount.textContent = ppmpItems.length + ' items';

  // Group items by item catalog category (from JOIN), fallback to ppmp category
  // 3-LEVEL HIERARCHY: Section → Category → Items
  const sectionMap = {}; // section → { categories: { cat → items[] } }
  const sectionOrder = [];
  ppmpItems.forEach(p => {
    const section = p.section || 'GENERAL PROCUREMENT';
    const cat = p.item_category || p.category || 'GENERAL PROCUREMENT';
    if (!sectionMap[section]) {
      sectionMap[section] = { categories: {}, categoryOrder: [] };
      sectionOrder.push(section);
    }
    if (!sectionMap[section].categories[cat]) {
      sectionMap[section].categories[cat] = [];
      sectionMap[section].categoryOrder.push(cat);
    }
    sectionMap[section].categories[cat].push(p);
  });

  let html = '';
  sectionOrder.forEach(section => {
    const sectionData = sectionMap[section];
    // Calculate section totals
    let sectionTotal = 0;
    let sectionCount = 0;
    sectionData.categoryOrder.forEach(cat => {
      sectionData.categories[cat].forEach(p => {
        sectionTotal += parseFloat(p.total_amount || 0);
        sectionCount++;
      });
    });

    // LEVEL 1: Section header row (yellow background, blue bold text — matches Excel PPMP)
    html += `
    <tr class="ppmp-section-header" data-section="${section}">
      <td colspan="12" class="ppmp-section-title">${section}</td>
      <td class="ppmp-section-budget text-right" colspan="1">₱${sectionTotal.toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td colspan="1" class="ppmp-section-count">${sectionCount} item${sectionCount !== 1 ? 's' : ''}</td>
    </tr>`;

    // Iterate categories under this section
    sectionData.categoryOrder.forEach(cat => {
      const items = sectionData.categories[cat];
      const catTotal = items.reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0);

      // LEVEL 2: Category/Subsection header — SKIP if category matches section name (avoid doubling)
      const catNorm = (cat || '').replace(/[^A-Z]/gi, '').toUpperCase();
      const secNorm = (section || '').replace(/[^A-Z]/gi, '').toUpperCase();
      const isDuplicate = catNorm === secNorm || cat === section;
      if (!isDuplicate) {
        html += `
    <tr class="ppmp-category-header" data-category="${cat}" data-section="${section}">
      <td colspan="11" class="ppmp-category-title">${cat}</td>
      <td class="ppmp-category-budget text-right" colspan="1">₱${catTotal.toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td colspan="2" class="ppmp-category-count">${items.length} item${items.length > 1 ? 's' : ''}</td>
    </tr>`;
      }

    // LEVEL 3: Item rows under this category
    items.forEach(p => {
      const deptCode = getDeptCode(p);
      const ppmpNo = p.ppmp_no || `PPMP-${deptCode}-${p.fiscal_year}-${String(p.id).padStart(3, '0')}`;
      const statusClass = p.status === 'approved' ? 'approved' : p.status === 'submitted' ? 'submitted' : p.status === 'pending' ? 'pending' : p.status === 'draft' ? 'draft' : p.status;
      const mode = getModeBadge(p.procurement_mode);
      
      let approvalInfo = '';
      if (p.status === 'pending') {
        const chiefDone = p.approved_by_chief ? `<span class="approval-badge chief-done" title="Approved by Chief FAD: ${p.chief_approver_name || ''}"><i class="fas fa-check-circle"></i> Chief FAD</span>` : `<span class="approval-badge chief-pending" title="Awaiting Chief FAD approval"><i class="fas fa-clock"></i> Chief FAD</span>`;
        const hopeDone = p.approved_by_hope ? `<span class="approval-badge hope-done" title="Approved by HOPE: ${p.hope_approver_name || ''}"><i class="fas fa-check-circle"></i> HOPE</span>` : `<span class="approval-badge hope-pending" title="Awaiting HOPE approval"><i class="fas fa-clock"></i> HOPE</span>`;
        approvalInfo = `<div class="approval-status-row">${chiefDone}${hopeDone}</div>`;
      }

      const userRole = window.currentUser?.role || '';
      const userRoles = currentUser.roles || [userRole];
      const canApprove = p.status === 'pending' && userRoles.some(r => ['chief_fad', 'hope', 'admin'].includes(r));
      const alreadyApprovedByChief = !!p.approved_by_chief;
      const alreadyApprovedByHope = !!p.approved_by_hope;
      const userAlreadyApproved = (userHasRole('chief_fad') && alreadyApprovedByChief) || (userHasRole('hope') && alreadyApprovedByHope);
      const showApproveBtn = canApprove && !userAlreadyApproved;

      html += `
      <tr class="ppmp-item-row" data-division="${deptCode}" data-mode="${p.procurement_mode || ''}" data-category="${cat}">
        <td class="ppmp-no-cell">${ppmpNo}</td>
        <td class="ppmp-desc-cell">${formatPPMPDescription(p)}</td>
        <td>${p.project_type || 'Goods'}</td>
        <td>${p.quantity_size || '-'}</td>
        <td><span class="mode-badge ${mode.css}">${mode.label}</span></td>
        <td>${p.pre_procurement || 'NO'}</td>
        <td>${p.start_date || '-'}</td>
        <td>${p.end_date || '-'}</td>
        <td>${p.delivery_period || '-'}</td>
        <td>${p.fund_source || 'GAA'}</td>
        <td class="text-right">₱${parseFloat(p.total_amount || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
        <td>${deptCode} - FY ${p.fiscal_year}</td>
        <td>
          <span class="status-badge ${statusClass}">${p.status}</span>
          ${approvalInfo}
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" data-action="view-ppmp" title="View" onclick="showViewPPMPModal(${p.id})"><i class="fas fa-eye"></i></button>
            <button class="btn-icon" data-action="edit-ppmp" title="Edit" onclick="showEditPPMPModal(${p.id})"><i class="fas fa-edit"></i></button>
            ${showApproveBtn ? `<button class="btn-icon success" data-action="approve-ppmp" title="Approve PPMP" onclick="showApprovePPMPModal(${p.id})"><i class="fas fa-check"></i></button>` : ''}
            <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('PPMP', ${p.id})"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
    });
    }); // end categoryOrder.forEach
  }); // end sectionOrder.forEach

  // Grand total footer
  html += `
    <tr style="background:#f0f4f8;font-weight:bold;border-top:2px solid #1a365d;">
      <td colspan="10" style="text-align:right;padding-right:15px;">Grand Total (${ppmpItems.length} items):</td>
      <td class="text-right">₱${totalBudget.toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td colspan="3"></td>
    </tr>`;

  tbody.innerHTML = html;
}

function renderAPPTable(items, appStatus) {
  const tbody = document.getElementById('appTableBody');
  if (!tbody) return;
  if (!items.length) { tbody.innerHTML = '<tr><td colspan="16" class="text-center">No APP entries found</td></tr>'; return; }

  // Use department_code from server first, fallback to deriving from name
  function getDeptCode(item) {
    if (item.department_code) return item.department_code;
    const name = item.department_name || item;
    if (!name || typeof name !== 'string') return 'DMW';
    const lower = name.toLowerCase();
    if (lower.includes('finance')) return 'FAD';
    if (lower.includes('protection') && lower.includes('trafficking')) return 'MWPTD';
    if (lower.includes('processing') || lower.includes('service')) return 'MWPSD';
    if (lower.includes('welfare') || lower.includes('reintegration')) return 'WRSD';
    if (lower.includes('director')) return 'ORD';
    return name.substring(0,3).toUpperCase();
  }

  function getProcMode(item) {
    // Use procurement_mode from parent plan if available
    const mode = item.procurement_mode || item.remarks || '';
    if (!mode) return { label: 'Small Value Procurement', css: 'svp' };
    const r = mode.toLowerCase();
    if (r.includes('competitive bidding') || r.includes('public bidding')) return { label: 'Competitive Bidding', css: 'cb' };
    if (r.includes('limited source')) return { label: 'Limited Source Bidding', css: 'others' };
    if (r.includes('direct contracting')) return { label: 'Direct Contracting', css: 'dc' };
    if (r.includes('repeat order')) return { label: 'Repeat Order', css: 'others' };
    if (r.includes('shopping')) return { label: 'Shopping', css: 'shopping' };
    if (r.includes('negotiated') && r.includes('two failed')) return { label: 'NP - Two Failed Biddings', css: 'others' };
    if (r.includes('negotiated') && r.includes('emergency')) return { label: 'NP - Emergency Cases', css: 'others' };
    if (r.includes('negotiated') && r.includes('small value')) return { label: 'NP - Small Value Procurement', css: 'svp' };
    if (r.includes('small value')) return { label: 'Small Value Procurement', css: 'svp' };
    if (r.includes('agency-to-agency') || r.includes('agency to agency')) return { label: 'Agency-To-Agency', css: 'others' };
    if (r.includes('negotiated')) return { label: 'Negotiated Procurement', css: 'others' };
    return { label: mode, css: 'svp' };
  }

  function getMonthFromRemarks(remarks) {
    if (!remarks) return '-';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (let m of months) {
      if (remarks.includes(m)) return m + ' ' + (remarks.match(/\\d{4}/) || [String(getCurrentFiscalYear())])[0];
    }
    return '-';
  }

  // Build version tag based on current APP status
  const st = appStatus || window._appStatus || { app_type: 'indicative', update_count: 0 };
  let versionTag = '';
  if (st.app_type === 'indicative') {
    versionTag = '<span class="version-tag indicative">Indicative</span>';
  } else if (st.app_type === 'final') {
    versionTag = '<span class="version-tag final">Final</span>';
  } else if (st.app_type === 'updated') {
    versionTag = '<span class="version-tag updated">Updated v' + (st.update_count || 1) + '</span>';
  }

  // Store items globally for modals
  window._appItems = items;

  // Determine role for division filtering
  const userRole = (currentUser && currentUser.role) || '';
  const chiefDivMap = { 'chief_fad': 'FAD', 'chief_wrsd': 'WRSD', 'chief_mwpsd': 'MWPSD', 'chief_mwptd': 'MWPTD' };
  const chiefRole = getUserChiefRole();
  const isChief = !!chiefRole;
  const chiefDiv = chiefRole ? chiefDivMap[chiefRole] : '';

  // Calculate total budget per division only (not overall PPMP total)
  // Chiefs see only their division total; admin/hope see all
  let divisionTotals = {};
  items.forEach(item => {
    const dc = getDeptCode(item);
    if (!divisionTotals[dc]) divisionTotals[dc] = { count: 0, budget: 0 };
    divisionTotals[dc].count++;
    divisionTotals[dc].budget += parseFloat(item.total_price || item.unit_price || 0);
  });

  let displayItems = items;
  let appTotalBudget = 0;
  let appTotalCount = 0;
  if (isChief) {
    displayItems = items.filter(item => getDeptCode(item) === chiefDiv);
    appTotalBudget = (divisionTotals[chiefDiv] || {}).budget || 0;
    appTotalCount = (divisionTotals[chiefDiv] || {}).count || 0;
  } else {
    Object.values(divisionTotals).forEach(d => { appTotalBudget += d.budget; appTotalCount += d.count; });
  }

  if (!displayItems.length) {
    tbody.innerHTML = '<tr><td colspan="16" class="text-center">No APP entries found' + (isChief ? ' for ' + chiefDiv + ' division' : '') + '</td></tr>';
    return;
  }

  tbody.innerHTML = displayItems.map(item => {
    const deptCode = getDeptCode(item);
    const mode = getProcMode(item);
    // Use actual start_date / end_date from PPMP
    const formatProcDate = (d) => {
      if (!d) return '-';
      // Handle YYYY-MM format from month input
      const parts = d.split('-');
      if (parts.length >= 2) {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return months[parseInt(parts[1])-1] + ' ' + parts[0];
      }
      return d;
    };
    const startDate = formatProcDate(item.start_date);
    const endDate = formatProcDate(item.end_date);
    const category = (item.category || 'EXPENDABLE').toUpperCase();
    let projectType = 'Goods';
    if (category === 'SERVICES') projectType = 'Services';
    else if (category === 'CAPITAL OUTLAY') projectType = 'Capital Outlay';
    const estBudget = parseFloat(item.total_price || item.unit_price || 0);

    return `
    <tr>
      <td>${item.item_code || '-'}</td>
      <td>${item.item_name || '-'}</td>
      <td>${deptCode}</td>
      <td>${item.item_description || '-'}</td>
      <td>${projectType}</td>
      <td><span class="mode-badge ${mode.css}">${mode.label}</span></td>
      <td>No</td>
      <td>LCRB</td>
      <td>${startDate}</td>
      <td>${endDate}</td>
      <td>GAA ${item.fiscal_year || String(getCurrentFiscalYear())}</td>
      <td>₱${estBudget.toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>-</td>
      <td class="app-version-col">${versionTag}</td>
      <td>-</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewAPPModal(${item.id})"><i class="fas fa-eye"></i></button>
          <button class="btn-icon" title="Create PR" onclick="showCreatePRFromAPPModal(${item.id})"><i class="fas fa-file-signature"></i></button>
        </div>
      </td>
    </tr>
  `;
  }).join('') + `
    <tr style="background:#f0f4f8;font-weight:bold;border-top:2px solid #1a365d;">
      <td colspan="11" style="text-align:right;padding-right:15px;">${isChief ? chiefDiv + ' ' : ''}Total (${appTotalCount} items):</td>
      <td>₱${appTotalBudget.toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td colspan="4"></td>
    </tr>
  `;
}

function updateAPPSummary(items, budgetSummary) {
  // Determine if chief — filter all stats to their division only
  const userRole = (currentUser && currentUser.role) || '';
  const chiefDivMap = { 'chief_fad': 'FAD', 'chief_wrsd': 'WRSD', 'chief_mwpsd': 'MWPSD', 'chief_mwptd': 'MWPTD' };
  const chiefRole2 = getUserChiefRole();
  const isChief = !!chiefRole2;
  const chiefDiv = chiefRole2 ? chiefDivMap[chiefRole2] : '';

  // Helper to get dept code from item
  function getItemDeptCode(item) {
    if (item.department_code) return item.department_code;
    const name = (item.department_name || '').toLowerCase();
    if (name.includes('finance')) return 'FAD';
    if (name.includes('protection') && name.includes('trafficking')) return 'MWPTD';
    if (name.includes('processing') || name.includes('service')) return 'MWPSD';
    if (name.includes('welfare') || name.includes('reintegration')) return 'WRSD';
    if (name.includes('director')) return 'ORD';
    return '';
  }

  // Filter items for chiefs
  const displayItems = isChief ? items.filter(i => getItemDeptCode(i) === chiefDiv) : items;

  const activeBudget = displayItems.reduce((sum, i) => sum + parseFloat(i.total_price || i.unit_price || 0), 0);
  const totalProjects = displayItems.length;

  // Budget summary — for chiefs use their division's data from by_department
  let totalApproved, availableBudget, removedCount;
  if (isChief && budgetSummary && budgetSummary.by_department) {
    const deptData = budgetSummary.by_department.find(d => d.department_code === chiefDiv);
    totalApproved = deptData ? parseFloat(deptData.total || 0) : 0;
    availableBudget = deptData ? parseFloat(deptData.available || 0) : 0;
    removedCount = deptData ? parseInt(deptData.removed_count || 0) : 0;
  } else {
    totalApproved = budgetSummary ? parseFloat(budgetSummary.total_budget || 0) : activeBudget;
    availableBudget = budgetSummary ? parseFloat(budgetSummary.available_budget || 0) : 0;
    removedCount = budgetSummary ? parseInt(budgetSummary.removed_count || 0) : 0;
  }

  // Update summary cards using IDs
  const elTotalApproved = document.getElementById('appTotalApproved');
  const elActiveBudget = document.getElementById('appActiveBudget');
  const elAvailableBudget = document.getElementById('appAvailableBudget');
  const elRemovedCount = document.getElementById('appRemovedCount');
  const elActiveProjects = document.getElementById('appActiveProjects');

  if (elTotalApproved) elTotalApproved.textContent = '₱' + totalApproved.toLocaleString('en-PH', {minimumFractionDigits: 2});
  if (elActiveBudget) elActiveBudget.textContent = '₱' + activeBudget.toLocaleString('en-PH', {minimumFractionDigits: 2});
  if (elAvailableBudget) elAvailableBudget.textContent = '₱' + availableBudget.toLocaleString('en-PH', {minimumFractionDigits: 2});
  if (elRemovedCount) elRemovedCount.textContent = removedCount;
  if (elActiveProjects) elActiveProjects.textContent = totalProjects;

  // Count items per mode of procurement (using filtered items)
  const modeCounts = {};
  displayItems.forEach(i => {
    const mode = (i.procurement_mode || 'Small Value Procurement').trim();
    if (!modeCounts[mode]) modeCounts[mode] = 0;
    modeCounts[mode]++;
  });

  // Color map for mode badges
  const modeColors = {
    'Competitive Bidding': '#1a365d',
    'Limited Source Bidding': '#6c5ce7',
    'Competitive Dialogue': '#0984e3',
    'Unsolicited Offer with Bid Matching': '#e17055',
    'Direct Contracting': '#d63031',
    'Direct Acquisition': '#e84393',
    'Repeat Order': '#fdcb6e',
    'Small Value Procurement': '#00b894',
    'Negotiated Procurement': '#636e72',
    'Direct Sales': '#fd79a8',
    'Direct Procurement for STI': '#a29bfe'
  };

  // Render division budget breakdown (admin/hope see all, chiefs see own division only)
  const divBudgetContainer = document.getElementById('appDivisionBudgets');
  if (divBudgetContainer && budgetSummary && budgetSummary.by_department) {
    const allowedRoles = ['admin', 'hope', 'chief_fad', 'chief_wrsd', 'chief_mwpsd', 'chief_mwptd'];
    
    if (!userHasAnyRole(allowedRoles)) {
      divBudgetContainer.innerHTML = '';
      divBudgetContainer.style.display = 'none';
    } else {
      divBudgetContainer.style.display = '';
      
      // Filter departments: chiefs see only their own, admin/hope see all
      let departments = budgetSummary.by_department;
      if (isChief) {
        departments = departments.filter(d => d.department_code === chiefDiv);
      }
      
      const headerLabel = isChief ? `${chiefDiv} Division Budget` : 'Division Budget Allocation';
      
      const tableRows = departments.map(dept => {
        const code = dept.department_code || 'N/A';
        const total = parseFloat(dept.total || 0);
        const active = parseFloat(dept.active || 0);
        const available = parseFloat(dept.available || 0);
        return `<tr>
          <td style="font-weight:600;">${code}</td>
          <td class="text-right">₱${total.toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
          <td class="text-right">₱${active.toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
          <td class="text-right" style="color:#28a745;font-weight:600;">₱${available.toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
        </tr>`;
      }).join('');

      // Totals row (only for admin/hope viewing all)
      let totalsRow = '';
      if (!isChief && departments.length > 1) {
        const tTotal = departments.reduce((s, d) => s + parseFloat(d.total || 0), 0);
        const tActive = departments.reduce((s, d) => s + parseFloat(d.active || 0), 0);
        const tAvail = departments.reduce((s, d) => s + parseFloat(d.available || 0), 0);
        totalsRow = `<tr style="background:#f0f4f8;font-weight:700;border-top:2px solid #1a365d;">
          <td>TOTAL</td>
          <td class="text-right">₱${tTotal.toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
          <td class="text-right">₱${tActive.toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
          <td class="text-right" style="color:#28a745;">₱${tAvail.toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
        </tr>`;
      }

      divBudgetContainer.innerHTML = `
        <div class="div-budget-panel">
          <div class="div-budget-title"><i class="fas fa-landmark"></i> ${headerLabel}</div>
          <table class="div-budget-table">
            <thead>
              <tr>
                <th>Division</th>
                <th class="text-right">Total Budget</th>
                <th class="text-right">Active Budget</th>
                <th class="text-right">Available Budget</th>
              </tr>
            </thead>
            <tbody>${tableRows}${totalsRow}</tbody>
          </table>
        </div>`;
    }
  }

  // Render dynamic mode stat cards (only modes with count > 0)
  const modeStatsContainer = document.getElementById('appModeStats');
  if (modeStatsContainer) {
    const modeCards = Object.entries(modeCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .map(([mode, count]) => {
        const color = modeColors[mode] || '#555';
        // Shorten label for display
        let shortLabel = mode;
        if (mode === 'Small Value Procurement') shortLabel = 'SVP';
        else if (mode === 'Competitive Bidding') shortLabel = 'Competitive Bidding';
        else if (mode === 'Direct Contracting') shortLabel = 'Direct Contracting';
        else if (mode === 'Direct Acquisition') shortLabel = 'Direct Acquisition';
        else if (mode === 'Limited Source Bidding') shortLabel = 'Limited Source';
        else if (mode === 'Negotiated Procurement') shortLabel = 'Negotiated';
        else if (mode === 'Unsolicited Offer with Bid Matching') shortLabel = 'Unsolicited Offer';
        else if (mode === 'Direct Procurement for STI') shortLabel = 'Direct Proc. (STI)';
        return `<div class="summary-card" style="border-left: 3px solid ${color};">
          <h4>${shortLabel}</h4>
          <p class="summary-value" style="color:${color};">${count}</p>
        </div>`;
      }).join('');
    modeStatsContainer.innerHTML = modeCards;
  }
}

function updateAPPVersionBanner(status) {
  const st = status || { app_type: 'indicative', update_count: 0 };
  const stepIndicative = document.getElementById('stepIndicative');
  const stepFinal = document.getElementById('stepFinal');
  const stepUpdated = document.getElementById('stepUpdated');
  const connectors = document.querySelectorAll('.app-version-banner .version-connector');
  const label = document.getElementById('currentVersionLabel');
  const countBadge = document.getElementById('updateCountBadge');

  // Reset all steps
  [stepIndicative, stepFinal, stepUpdated].forEach(s => {
    if (s) { s.classList.remove('active', 'completed'); }
  });
  if (connectors.length >= 2) {
    connectors[0].classList.remove('completed');
    connectors[1].classList.remove('completed');
  }

  if (st.app_type === 'indicative') {
    if (stepIndicative) {
      stepIndicative.classList.add('active');
      stepIndicative.querySelector('.step-icon').innerHTML = '<i class="fas fa-check"></i>';
    }
    if (label) label.textContent = 'Indicative APP';
    if (countBadge) countBadge.style.display = 'none';
  } else if (st.app_type === 'final') {
    if (stepIndicative) {
      stepIndicative.classList.add('completed');
      stepIndicative.querySelector('.step-icon').innerHTML = '<i class="fas fa-check"></i>';
    }
    if (connectors[0]) connectors[0].classList.add('completed');
    if (stepFinal) {
      stepFinal.classList.add('active');
      stepFinal.querySelector('.step-icon').innerHTML = '<i class="fas fa-check"></i>';
    }
    if (label) label.textContent = 'Final APP';
    if (countBadge) countBadge.style.display = 'none';
  } else if (st.app_type === 'updated') {
    if (stepIndicative) {
      stepIndicative.classList.add('completed');
      stepIndicative.querySelector('.step-icon').innerHTML = '<i class="fas fa-check"></i>';
    }
    if (connectors[0]) connectors[0].classList.add('completed');
    if (stepFinal) {
      stepFinal.classList.add('completed');
      stepFinal.querySelector('.step-icon').innerHTML = '<i class="fas fa-check"></i>';
    }
    if (connectors[1]) connectors[1].classList.add('completed');
    if (stepUpdated) {
      stepUpdated.classList.add('active');
      stepUpdated.querySelector('.step-icon').innerHTML = '<i class="fas fa-check"></i>';
    }
    if (label) label.textContent = 'Updated APP (v' + (st.update_count || 1) + ')';
    if (countBadge) {
      countBadge.textContent = 'v' + (st.update_count || 1);
      countBadge.style.display = 'inline-block';
    }
  }

  // Also sync the dropdown filter
  const filter = document.getElementById('appVersionFilter');
  if (filter) filter.value = st.app_type;
}

function renderPRTable(pr) {
  const tbody = document.getElementById('prTableBody');
  if (!tbody) return;
  if (!pr.length) { tbody.innerHTML = '<tr><td colspan="10" class="text-center">No PRs found</td></tr>'; return; }
  
  tbody.innerHTML = pr.map(p => {
    const statusLabel = p.status === 'approved' ? 'PR APPROVED' : p.status === 'pending_approval' ? 'PR PENDING APPROVAL' : p.status === 'rejected' ? 'PR REJECTED' : p.status === 'cancelled' ? 'PR CANCELLED' : p.status.toUpperCase();
    const statusClass = p.status === 'approved' ? 'completed' : p.status === 'pending_approval' ? 'on_going' : p.status === 'rejected' ? 'rejected' : 'cancelled';
    const itemCount = parseInt(p.item_count || 0);
    const itemDesc = p.first_item_description || p.first_item_name || p.purpose || '';
    let descDisplay = itemCount > 1 ? itemDesc + ` <span style="font-size:10px;color:#666;">(+${itemCount - 1} more)</span>` : itemDesc;
    // If item_specifications exist, show them as bullets below the description
    if (p.item_specifications) {
      const specs = p.item_specifications.split('\n').filter(l => l.trim());
      if (specs.length > 0) {
        descDisplay += '<ul style="margin:2px 0 0;padding-left:16px;">' + specs.slice(0, 3).map(s => `<li style="font-size:11px;">${s.trim()}</li>`).join('') + (specs.length > 3 ? `<li style="font-size:10px;color:#666;">+${specs.length - 3} more...</li>` : '') + '</ul>';
      }
    }
    const qty = p.item_quantity || '-';
    const unit = p.item_unit || '-';
    const unitCost = p.item_unit_price ? '₱' + parseFloat(p.item_unit_price).toLocaleString('en-PH', {minimumFractionDigits: 2}) : '-';
    return `<tr>
      <td>${p.pr_number || ''}</td>
      <td>${p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}</td>
      <td>${p.department_name || 'DMW Caraga'}</td>
      <td>${descDisplay}</td>
      <td>${qty}</td>
      <td>${unit}</td>
      <td>${unitCost}</td>
      <td>₱${parseFloat(p.total_amount || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>${statusBadge(statusLabel, statusClass)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" data-action="view-pr" title="View" onclick="showViewPRModal(${p.id})"><i class="fas fa-eye"></i></button>
          ${p.status === 'pending_approval' ? `<button class="btn-icon" data-action="approve-pr" title="Approve" onclick="showApprovePRModal(${p.id})"><i class="fas fa-check"></i></button>` : ''}
          <button class="btn-icon" title="Edit" onclick="showEditPRModal(${p.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon" title="Print" onclick="printPR(${p.id})"><i class="fas fa-print"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('PR', ${p.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');

}

function renderRFQTable(rfq) {
  const tbody = document.getElementById('rfqTableBody');
  if (!tbody) return;
  if (!rfq.length) { tbody.innerHTML = '<tr><td colspan="10" class="text-center">No RFQs found</td></tr>'; return; }
  
  tbody.innerHTML = rfq.map(r => {
    const statusLabel = r.status === 'completed' ? 'RFQ COMPLETED' : r.status === 'on_going' ? 'RFQ ON-GOING' : r.status === 'cancelled' ? 'CANCELLED' : r.status.toUpperCase();
    const statusClass = r.status === 'completed' ? 'completed' : r.status === 'on_going' ? 'on_going' : 'cancelled';

    // Get quantity and unit — try from server LATERAL JOIN first, then fall back to cachedPR
    let prQty = '-';
    let prUnit = '-';
    if (r.pr_id) {
      if (r.pr_item_quantity) {
        prQty = r.pr_item_quantity;
        prUnit = r.pr_item_unit || '-';
      } else {
        const linkedPR = (cachedPR || []).find(p => p.id == r.pr_id);
        if (linkedPR) {
          prQty = linkedPR.item_quantity || linkedPR.total_quantity || '-';
          prUnit = linkedPR.item_unit || '-';
        }
      }
    }

    // Get item specifications directly from rfqs.item_specifications column
    let itemSpecHtml = '';
    if (r.item_specifications) {
      const specs = r.item_specifications.split('\n').filter(l => l.trim());
      if (specs.length > 0) {
        itemSpecHtml = '<ul style="margin:0;padding-left:18px;text-align:left;">' + specs.map(s => `<li style="font-size:12px;">${s.trim()}</li>`).join('') + '</ul>';
      }
    }

    return `<tr>
      <td>${r.rfq_number || ''}</td>
      <td>${r.date_prepared ? new Date(r.date_prepared).toLocaleDateString() : ''}</td>
      <td>${r.pr_number || ''}</td>
      <td>${prQty}</td>
      <td>${prUnit}</td>
      <td>${itemSpecHtml || '-'}</td>
      <td>₱${parseFloat(r.abc_amount || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>${r.submission_deadline ? new Date(r.submission_deadline).toLocaleDateString() : ''}</td>
      <td>${statusBadge(statusLabel, statusClass)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewRFQModal(${r.id})"><i class="fas fa-eye"></i></button>
          <button class="btn-icon" title="Edit" onclick="showEditRFQModal(${r.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon" title="Print" onclick="printRFQ(${r.id})"><i class="fas fa-print"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('RFQ', ${r.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');

}

function renderAbstractTable(abstract) {
  const tbody = document.getElementById('abstractTableBody');
  if (!tbody) return;
  if (!abstract.length) { tbody.innerHTML = '<tr><td colspan="10" class="text-center">No Abstracts found</td></tr>'; return; }
  
  tbody.innerHTML = abstract.map(a => {
    const statusLabel = a.status === 'completed' ? 'ABSTRACT COMPLETED' : a.status === 'on_going' ? 'ABSTRACT ON-GOING' : a.status === 'cancelled' ? 'CANCELLED' : a.status.toUpperCase();
    const statusClass = a.status === 'completed' ? 'completed' : a.status === 'on_going' ? 'on_going' : 'cancelled';
    // Item specifications display
    let itemSpecHtml = '-';
    if (a.item_specifications) {
      const specs = a.item_specifications.split('\n').filter(l => l.trim());
      if (specs.length > 0) {
        itemSpecHtml = '<ul style="margin:0;padding-left:18px;text-align:left;">' + specs.map(s => `<li style="font-size:12px;">${s.trim()}</li>`).join('') + '</ul>';
      }
    }
    return `<tr>
      <td>${a.abstract_number || ''}</td>
      <td>${a.date_prepared ? new Date(a.date_prepared).toLocaleDateString() : ''}</td>
      <td>${a.rfq_number || ''}</td>
      <td>${a.purpose || ''}</td>
      <td>${itemSpecHtml}</td>
      <td>-</td>
      <td>${a.recommended_supplier_name || ''}</td>
      <td>₱${parseFloat(a.recommended_amount || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>${statusBadge(statusLabel, statusClass)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewAbstractModal(${a.id})"><i class="fas fa-eye"></i></button>
          <button class="btn-icon" title="Edit" onclick="showEditAbstractModal(${a.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon" title="Print" onclick="printAbstract(${a.id})"><i class="fas fa-print"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('Abstract', ${a.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');

}

function renderPostQualTable(postQual) {
  const tbody = document.getElementById('postQualTableBody');
  if (!tbody) return;
  if (!postQual.length) { tbody.innerHTML = '<tr><td colspan="9" class="text-center">No TWG Reports found</td></tr>'; return; }
  
  tbody.innerHTML = postQual.map(p => {
    const statusLabel = p.status === 'completed' ? 'POST-QUALIFICATION COMPLETED' : p.status === 'on_going' ? 'POST-QUALIFICATION ON-GOING' : p.status === 'cancelled' ? 'CANCELLED' : p.status.toUpperCase();
    const statusClass = p.status === 'completed' ? 'completed' : p.status === 'on_going' ? 'on_going' : 'cancelled';
    return `<tr>
      <td>${p.postqual_number || ''}</td>
      <td>${p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}</td>
      <td>${p.abstract_number || ''}</td>
      <td>${p.bidder_name || ''}</td>
      <td>-</td>
      <td><span class="status-badge ${p.documents_verified ? 'completed' : 'on_going'}">${p.documents_verified ? 'All Passed' : 'Pending'}</span></td>
      <td><span class="status-badge ${p.financial_validation ? 'completed' : 'on_going'}">${p.financial_validation ? 'Completed' : 'Pending'}</span></td>
      <td>${statusBadge(statusLabel, statusClass)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewPostQualModal(${p.id})"><i class="fas fa-eye"></i></button>
          <button class="btn-icon" title="Edit" onclick="showEditPostQualModal(${p.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon" title="Print" onclick="printRecord('TWG Report', '${p.postqual_number || p.twg_number}')"><i class="fas fa-print"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('PostQual', ${p.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');

}

function renderBACResolutionTable(bacRes) {
  const tbody = document.getElementById('bacResolutionTableBody');
  if (!tbody) return;
  if (!bacRes.length) { tbody.innerHTML = '<tr><td colspan="9" class="text-center">No BAC Resolutions found</td></tr>'; return; }
  
  tbody.innerHTML = bacRes.map(b => {
    const statusLabel = b.status === 'completed' ? 'BAC RESOLUTION COMPLETED' : b.status === 'on_going' ? 'BAC RESOLUTION ON-GOING' : b.status === 'cancelled' ? 'CANCELLED' : b.status.toUpperCase();
    const statusClass = b.status === 'completed' ? 'completed' : b.status === 'on_going' ? 'on_going' : 'cancelled';
    return `<tr>
      <td>${b.resolution_number || ''}</td>
      <td>${b.resolution_date ? new Date(b.resolution_date).getFullYear() : new Date().getFullYear()}</td>
      <td>${b.resolution_date ? new Date(b.resolution_date).toLocaleDateString() : ''}</td>
      <td>${b.procurement_mode || ''}</td>
      <td>${b.supplier_name || b.recommended_awardee_name || ''}</td>
      <td>₱${parseFloat(b.bid_amount || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>₱${parseFloat(b.abc_amount || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>${statusBadge(statusLabel, statusClass)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewBACResolutionModal(${b.id})"><i class="fas fa-eye"></i></button>
          <button class="btn-icon" title="Edit" onclick="showEditBACResolutionModal(${b.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon" title="Print" onclick="printRecord('BAC Resolution', '${b.resolution_number}')"><i class="fas fa-print"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('BACResolution', ${b.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');

}

function renderNOATable(noa) {
  const tbody = document.getElementById('noaTableBody');
  if (!tbody) return;
  if (!noa.length) { tbody.innerHTML = '<tr><td colspan="9" class="text-center">No NOAs found</td></tr>'; return; }
  
  tbody.innerHTML = noa.map(n => {
    const statusLabel = n.status === 'with_noa' ? 'WITH NOA' : n.status === 'awaiting_noa' ? 'AWAITING NOA' : n.status === 'cancelled' ? 'CANCELLED' : n.status.toUpperCase();
    const statusClass = n.status === 'with_noa' ? 'completed' : n.status === 'awaiting_noa' ? 'on_going' : 'cancelled';
    return `<tr>
      <td>${n.noa_number || ''}</td>
      <td>${n.date_issued ? new Date(n.date_issued).toLocaleDateString() : ''}</td>
      <td>${n.supplier_name || ''}</td>
      <td>-</td>
      <td>${n.resolution_number || ''}</td>
      <td>₱${parseFloat(n.contract_amount || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>${n.bidder_receipt_date ? new Date(n.bidder_receipt_date).toLocaleDateString() : '-'}</td>
      <td>${statusBadge(statusLabel, statusClass)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewNOAModal(${n.id})"><i class="fas fa-eye"></i></button>
          <button class="btn-icon" title="Edit" onclick="showEditNOAModal(${n.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon" title="Print" onclick="printRecord('NOA', '${n.noa_number}')"><i class="fas fa-print"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('NOA', ${n.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');

}

function renderPOTable(po) {
  const tbody = document.getElementById('poTableBody');
  if (!tbody) return;
  if (!po.length) { tbody.innerHTML = '<tr><td colspan="9" class="text-center">No POs found</td></tr>'; return; }
  
  tbody.innerHTML = po.map(p => {
    const statusLabel = p.status === 'signed' ? 'SIGNED' : p.status === 'for_signing' ? 'FOR SIGNING' : p.status === 'cancelled' ? 'CANCELLED' : p.status.toUpperCase();
    const statusClass = p.status === 'signed' ? 'completed' : p.status === 'for_signing' ? 'on_going' : 'cancelled';
    return `<tr>
      <td>${p.po_number || ''}</td>
      <td>${p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}</td>
      <td>${p.mode_of_procurement || 'SVP - Shopping'}</td>
      <td>${p.supplier_name || ''}</td>
      <td>${p.place_of_delivery || 'DMW RO XIII'}</td>
      <td>${p.delivery_date ? new Date(p.delivery_date).toLocaleDateString() : ''}</td>
      <td>₱${parseFloat(p.total_amount || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>${statusBadge(statusLabel, statusClass)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewPOModal(${p.id})"><i class="fas fa-eye"></i></button>
          <button class="btn-icon" title="Edit" onclick="showEditPOModal(${p.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon" title="Print" onclick="printRecord('PO', '${p.po_number}')"><i class="fas fa-print"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('PO', ${p.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');

}

function renderIARTable(iar) {
  const tbody = document.getElementById('iarTableBody');
  if (!tbody) return;
  if (!iar.length) { tbody.innerHTML = '<tr><td colspan="9" class="text-center">No IARs found</td></tr>'; return; }
  
  tbody.innerHTML = iar.map(i => {
    // Inspection column (from inspection_result DB column)
    const inspResult = i.inspection_result || 'to_be_checked';
    const inspLabel = inspResult === 'verified' ? 'VERIFIED' : inspResult === 'on_going' ? 'ON GOING' : 'TO BE CHECKED';
    const inspClass = inspResult === 'verified' ? 'completed' : inspResult === 'on_going' ? 'on_going' : 'pending';
    // Acceptance column (from acceptance DB column)
    const accResult = i.acceptance || 'to_be_checked';
    const accLabel = accResult === 'complete' ? 'COMPLETE' : accResult === 'partial' ? 'PARTIAL' : 'TO BE CHECKED';
    const accClass = accResult === 'complete' ? 'completed' : accResult === 'partial' ? 'on_going' : 'pending';
    return `<tr>
      <td>${i.iar_number || ''}</td>
      <td>${i.inspection_date ? new Date(i.inspection_date).toLocaleDateString() : ''}</td>
      <td>${i.supplier_name || ''}</td>
      <td>${i.po_number || ''}</td>
      <td>${i.invoice_number || ''}</td>
      <td>${i.purpose || 'FAD'}</td>
      <td>${statusBadge(inspLabel, inspClass)}</td>
      <td>${statusBadge(accLabel, accClass)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewIARModal(${i.id})"><i class="fas fa-eye"></i></button>
          <button class="btn-icon" title="Edit" onclick="showEditIARModal(${i.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon" title="Print" onclick="printIAR(${i.id})"><i class="fas fa-print"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('IAR', ${i.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');

}

function renderPOPacketTable(rows) {
  const tbody = document.getElementById('poPacketTableBody');
  if (!tbody) return;
  if (!rows || !rows.length) { 
    tbody.innerHTML = '<tr><td colspan="10" class="text-center">No transactions found for monitoring</td></tr>'; 
    return; 
  }

  // Document column definitions — maps to the 8 document columns in the table
  const docCols = [
    { key: 'pr', entityType: 'purchaserequests', idField: 'pr_id', numField: 'pr_number' },
    { key: 'rfq', entityType: 'rfqs', idField: 'rfq_id', numField: 'rfq_number' },
    { key: 'abstract', entityType: 'abstracts', idField: 'abstract_id', numField: 'abstract_number' },
    { key: 'bac', entityType: 'bac_resolutions', idField: 'bac_res_id', numField: 'resolution_number' },
    { key: 'pq', entityType: 'post_qualifications', idField: 'postqual_id', numField: 'postqual_number' },
    { key: 'noa', entityType: 'notices_of_award', idField: 'noa_id', numField: 'noa_number' },
    { key: 'po', entityType: 'purchaseorders', idField: 'po_id', numField: 'po_number' },
    { key: 'iar', entityType: 'iars', idField: 'iar_id', numField: 'iar_number' }
  ];

  function overallStatus(r) {
    if (r.packet_status === 'submitted_to_coa') return '<span class="status-badge coa-submitted">Submitted to COA</span>';
    if (r.packet_status === 'signed') return '<span class="status-badge approved">Signed</span>';
    if (r.packet_status === 'for_signing') return '<span class="status-badge for-signing">For Signing</span>';
    const has = [r.pr_id, r.rfq_id, r.abstract_id, r.bac_res_id, r.postqual_id, r.noa_id, r.po_id, r.iar_id].filter(Boolean).length;
    if (has >= 8) return '<span class="status-badge approved">Complete</span>';
    return '<span class="status-badge pending">Incomplete (' + has + '/8)</span>';
  }

  tbody.innerHTML = rows.map((r, idx) => {
    const rowId = 'pr' + r.pr_id;
    const officeDisplay = r.division_name || r.division_code || 'DMW Caraga';

    const docCells = docCols.map(col => {
      const entityId = r[col.idField];
      const uniqueKey = col.key + '_' + rowId;
      const hasDoc = !!entityId;
      const attachEntityType = hasDoc ? col.entityType : ('pkt_' + col.key);
      const attachEntityId = hasDoc ? entityId : r.pr_id;
      return `<td class="pkt-doc-cell${hasDoc ? '' : ' pkt-cell-empty'}">
        <div id="pktCell_${uniqueKey}" class="pkt-cell-files"><i class="fas fa-spinner fa-spin" style="color:#ccc;font-size:9px"></i></div>
        <input type="file" id="pktCellFile_${uniqueKey}" style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onchange="pktUploadFile('${attachEntityType}', ${attachEntityId}, '${uniqueKey}', this, '${rowId}')">
        <button class="pkt-btn-attach" id="pktBtn_${uniqueKey}" title="Attach" onclick="document.getElementById('pktCellFile_${uniqueKey}').click()"><i class="fas fa-paperclip"></i> Attach Document Here</button>
      </td>`;
    }).join('');

    const searchableText = ((r.pr_number || '') + ' ' + (r.division_code || '') + ' ' + (r.division_name || '')).toLowerCase();
    return `<tr data-po-number="${searchableText}" data-pkt-row="${rowId}" data-pkt-status="${r.packet_status || ''}">
      <td class="pkt-td-ref"><strong>${r.pr_number || '-'}</strong></td>
      <td class="pkt-td-div">${officeDisplay}</td>
      ${docCells}
      <td class="pkt-td-status" id="pktStatus_${rowId}"><div class="pkt-status-wrapper"><span class="status-badge rejected">0 / 8</span></div></td>
    </tr>`;
  }).join('');

  // After rendering, load attachments for ALL cells (including those without entities)
  rows.forEach(r => {
    const rowId = 'pr' + r.pr_id;
    // Initialize attachment counter for status tracking
    window._pktAttCounts = window._pktAttCounts || {};
    window._pktAttCounts[rowId] = { total: 0, attIds: [] };
    docCols.forEach(col => {
      const entityId = r[col.idField];
      const loadEntityType = entityId ? col.entityType : ('pkt_' + col.key);
      const loadEntityId = entityId ? entityId : r.pr_id;
      pktLoadCellAttachments(loadEntityType, loadEntityId, col.key + '_' + rowId, rowId);
    });
  });
}

// Load attachments into a table cell (compact inline view) — ONE file per cell
window.pktLoadCellAttachments = async function(entityType, entityId, uniqueKey, rowId) {
  const container = document.getElementById('pktCell_' + uniqueKey);
  if (!container) return;
  try {
    const atts = await getAttachments(entityType, entityId);
    const attachBtn = document.getElementById('pktBtn_' + uniqueKey);
    if (!atts || atts.length === 0) {
      container.innerHTML = '';
      if (attachBtn) attachBtn.style.display = '';
      return;
    }
    // Hide attach button, show only the FIRST file (one document per cell)
    if (attachBtn) attachBtn.style.display = 'none';
    const att = atts[0];
    const icon = att.mime_type === 'application/pdf' ? 'fa-file-pdf' 
      : (att.mime_type && att.mime_type.startsWith('image/')) ? 'fa-file-image'
      : (att.mime_type && att.mime_type.includes('word')) ? 'fa-file-word'
      : (att.mime_type && (att.mime_type.includes('excel') || att.mime_type.includes('spreadsheet'))) ? 'fa-file-excel'
      : 'fa-file';
    const safeName = (att.original_name || 'file').replace(/'/g, "\\'");
    const encodedName = encodeURIComponent(att.original_name || 'file');
    container.innerHTML = `<div class="pkt-cell-file">
      <i class="fas ${icon}"></i>
      <span class="pkt-cell-filename pkt-clickable" title="Click to preview: ${att.original_name}" onclick="window.open('${API_URL}/attachments/view/${att.id}/${encodedName}','_blank')">${att.original_name}</span>
      <button class="pkt-cell-dl" title="Preview" onclick="window.open('${API_URL}/attachments/view/${att.id}/${encodedName}','_blank')"><i class="fas fa-eye"></i></button>
      <button class="pkt-cell-del" title="Delete" onclick="pktDeleteCellAttachment(${att.id},'${entityType}',${entityId},'${uniqueKey}','${rowId}')"><i class="fas fa-times"></i></button>
    </div>`;
    // Store attachment ID for download-all merging
    if (rowId) {
      if (!window._pktAttCounts) window._pktAttCounts = {};
      if (!window._pktAttCounts[rowId]) window._pktAttCounts[rowId] = { total: 0, attIds: [] };
      window._pktAttCounts[rowId].total++;
      window._pktAttCounts[rowId].attIds.push(att.id);
      pktUpdateRowStatus(rowId);
    }
  } catch (err) {
    container.innerHTML = '<span class="pkt-cell-nofile" style="color:var(--danger-color);">!</span>';
  }
};

// Update status cell based on how many columns have attachments
function pktUpdateRowStatus(rowId) {
  const statusCell = document.getElementById('pktStatus_' + rowId);
  if (!statusCell) return;
  const count = (window._pktAttCounts[rowId] && window._pktAttCounts[rowId].total) || 0;
  let badgeClass, label;
  if (count >= 8) {
    badgeClass = 'approved';
    label = 'Complete';
  } else if (count >= 4) {
    badgeClass = 'pending';
    label = count + ' / 8';
  } else {
    badgeClass = 'rejected';
    label = count + ' / 8';
  }
  const dlBtn = count > 0 ? `<button class="pkt-dl-all-btn" onclick="pktDownloadAllMerged('${rowId}')" title="Download all as merged PDF"><i class="fas fa-file-download"></i></button>` : '';
  statusCell.innerHTML = `<div class="pkt-status-wrapper"><span class="status-badge ${badgeClass}">${label}</span>${dlBtn}</div>`;
  // Live-update the summary cards
  updatePOPacketSummaryFromCounts();
}

// Delete attachment and refresh the cell
window.pktDeleteCellAttachment = async function(attachmentId, entityType, entityId, uniqueKey, rowId) {
  const deleted = await deleteAttachment(attachmentId);
  if (deleted) {
    // Decrement count before reloading
    if (rowId && window._pktAttCounts && window._pktAttCounts[rowId]) {
      window._pktAttCounts[rowId].total = Math.max(0, window._pktAttCounts[rowId].total - 1);
      if (window._pktAttCounts[rowId].attIds) {
        window._pktAttCounts[rowId].attIds = window._pktAttCounts[rowId].attIds.filter(id => id !== attachmentId);
      }
      pktUpdateRowStatus(rowId);
    }
    pktLoadCellAttachments(entityType, entityId, uniqueKey, rowId);
  }
};

function updatePOPacketSummary(rows) {
  const total = rows.length;
  // Counts based on attachment state — will be updated after attachments load
  // For initial render, use entity ID presence as proxy
  let complete = 0, inProgress = 0, notStarted = 0;
  rows.forEach(r => {
    const docs = [r.pr_id, r.rfq_id, r.abstract_id, r.bac_res_id, r.postqual_id, r.noa_id, r.po_id, r.iar_id].filter(Boolean).length;
    if (docs >= 8) complete++;
    else if (docs >= 1) inProgress++;
    else notStarted++;
  });
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('pktTotalPO', total);
  set('pktComplete', complete);
  set('pktInProgress', inProgress);
  set('pktNotStarted', notStarted);
}

// Live-update summary from actual attachment counts (called after all cells load)
function updatePOPacketSummaryFromCounts() {
  const counts = window._pktAttCounts || {};
  const rowIds = Object.keys(counts);
  const total = rowIds.length;
  let complete = 0, inProgress = 0, notStarted = 0;
  rowIds.forEach(id => {
    const c = counts[id].total || 0;
    if (c >= 8) complete++;
    else if (c >= 1) inProgress++;
    else notStarted++;
  });
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('pktTotalPO', total);
  set('pktComplete', complete);
  set('pktInProgress', inProgress);
  set('pktNotStarted', notStarted);
}

window.filterPOPacketTable = function(search) {
  const rows = document.querySelectorAll('#poPacketTableBody tr[data-po-number]');
  const q = (search || '').toLowerCase();
  rows.forEach(r => {
    r.style.display = !q || r.getAttribute('data-po-number').includes(q) ? '' : 'none';
  });
};

window.filterPOPacketByStatus = function(val) {
  const rows = document.querySelectorAll('#poPacketTableBody tr[data-po-number]');
  rows.forEach(r => {
    if (!val) { r.style.display = ''; return; }
    const rowId = r.getAttribute('data-pkt-row');
    const count = (window._pktAttCounts && window._pktAttCounts[rowId] && window._pktAttCounts[rowId].total) || 0;
    if (val === 'complete') { r.style.display = count >= 8 ? '' : 'none'; return; }
    if (val === 'in_progress') { r.style.display = (count >= 1 && count < 8) ? '' : 'none'; return; }
    if (val === 'not_started') { r.style.display = count === 0 ? '' : 'none'; return; }
    r.style.display = '';
  });
};

// Download all attached files for a row, merged into one PDF
window.pktDownloadAllMerged = async function(rowId) {
  const data = window._pktAttCounts && window._pktAttCounts[rowId];
  if (!data || !data.attIds || data.attIds.length === 0) {
    showNotification('No attachments to download', 'warning');
    return;
  }
  try {
    showNotification('Merging files into PDF... Please wait.', 'info');
    const response = await fetch(API_URL + '/attachments/merge-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + sessionStorage.getItem('token') },
      body: JSON.stringify({ attachmentIds: data.attIds })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Merge failed');
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    // Get PR number from the row for filename
    const row = document.querySelector(`tr[data-pkt-row="${rowId}"]`);
    const prNum = row ? (row.querySelector('.pkt-td-ref strong') || {}).textContent || rowId : rowId;
    a.href = url;
    a.download = `PO_Packet_${prNum}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('All files merged and downloaded successfully!', 'success');
  } catch (err) {
    console.error('Merge download error:', err);
    showNotification('Failed to merge files: ' + err.message, 'error');
  }
};

function renderCOATable(coa) {
  const tbody = document.getElementById('coaTableBody');
  if (!tbody) return;
  if (!coa.length) { tbody.innerHTML = '<tr><td colspan="8" class="text-center">No COA Submissions found</td></tr>'; return; }
  
  tbody.innerHTML = coa.map(c => `
    <tr>
      <td>${c.submission_number || ''}</td>
      <td>${c.po_number || ''}</td>
      <td><span class="status-badge signed"><i class="fas fa-check"></i> Signed</span></td>
      <td>-</td>
      <td>${c.submission_date ? new Date(c.submission_date).toLocaleDateString() : ''}</td>
      <td>${c.coa_receipt_date ? new Date(c.coa_receipt_date).toLocaleDateString() : '-'}</td>
      <td><span class="status-badge ${c.status}">${c.status}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewCOAModal(${c.id})"><i class="fas fa-folder-open"></i></button>
          <button class="btn-icon" title="Print" onclick="printRecord('COA', '${c.submission_number}')"><i class="fas fa-print"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ==================== INVENTORY MODULE RENDERERS ====================

function renderStockCardsTable(cards) {
  const tbody = document.getElementById('stockCardsTableBody');
  if (!tbody) return;
  if (!cards.length) { tbody.innerHTML = '<tr><td colspan="11" class="text-center">No stock card entries found</td></tr>'; return; }

  tbody.innerHTML = cards.map(c => `
    <tr>
      <td>${c.transaction_no || ''}</td>
      <td>${c.date ? new Date(c.date).toLocaleDateString() : ''}</td>
      <td>${c.item_code || ''}</td>
      <td>${c.item_name || ''}</td>
      <td>${c.reference || ''}</td>
      <td>${c.receipt_qty || 0}</td>
      <td>₱${parseFloat(c.receipt_total_cost || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>${c.issue_qty || 0}</td>
      <td>₱${parseFloat(c.issue_total_cost || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td><strong>${c.balance_qty || 0}</strong></td>
      <td>₱${parseFloat(c.balance_total_cost || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
    </tr>
  `).join('');
}

function renderPropertyCardsTable(cards) {
  const tbody = document.getElementById('propertyCardsTableBody');
  if (!tbody) return;
  if (!cards.length) { tbody.innerHTML = '<tr><td colspan="9" class="text-center">No property cards found</td></tr>'; return; }

  const statusBadgeClass = { active: 'approved', disposed: 'rejected', transferred: 'pending', for_repair: 'draft' };
  tbody.innerHTML = cards.map(c => `
    <tr>
      <td>${c.property_number || ''}</td>
      <td>${c.description || ''}</td>
      <td>₱${parseFloat(c.acquisition_cost || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>${c.acquisition_date ? new Date(c.acquisition_date).toLocaleDateString() : '-'}</td>
      <td>${c.custodian_name || c.issued_to || '-'}</td>
      <td>${c.department_name || '-'}</td>
      <td>${c.ics_no || '-'}</td>
      <td><span class="status-badge ${statusBadgeClass[c.status] || 'draft'}">${(c.status || 'active').replace('_', ' ')}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewPropertyLedgerModal(${c.id})"><i class="fas fa-eye"></i></button>
          <button class="btn-icon" title="Issue ICS" onclick="showNewICSFromPropertyModal('${c.property_number}')"><i class="fas fa-exchange-alt"></i></button>
          <button class="btn-icon" data-action="edit-property" title="Edit" onclick="showEditPropertyCardModal(${c.id})"><i class="fas fa-edit"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderICSTable(ics) {
  const tbody = document.getElementById('icsTableBody');
  if (!tbody) return;
  if (!ics.length) { tbody.innerHTML = '<tr><td colspan="8" class="text-center">No ICS records found</td></tr>'; return; }

  tbody.innerHTML = ics.map(i => `
    <tr>
      <td>${i.ics_no || ''}</td>
      <td>${i.date_of_issue ? new Date(i.date_of_issue).toLocaleDateString() : ''}</td>
      <td>${i.property_number || ''}</td>
      <td>${i.description || ''}</td>
      <td>${i.inventory_no || '-'}</td>
      <td>${i.issued_to_name || i.issued_to || '-'}</td>
      <td>${i.received_by_name || '-'}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewICSModal(${i.id})"><i class="fas fa-eye"></i></button>
          <button class="btn-icon" title="Print" onclick="printRecord('ICS', '${i.ics_no}')"><i class="fas fa-print"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderEmployeesTable(employees) {
  const tbody = document.getElementById('employeesTableBody');
  if (!tbody) return;
  if (!employees.length) { tbody.innerHTML = '<tr><td colspan="8" class="text-center">No employees found</td></tr>'; return; }

  const statusClass = { active: 'approved', inactive: 'rejected', retired: 'draft' };
  tbody.innerHTML = employees.map(e => `
    <tr>
      <td>${e.employee_code || '-'}</td>
      <td>${e.full_name || ''}</td>
      <td>${e.designation_name || '-'}</td>
      <td>${e.department_name || '-'}</td>
      <td>${e.email || '-'}</td>
      <td>${e.phone || '-'}</td>
      <td><span class="status-badge ${statusClass[e.status] || 'draft'}">${e.status || 'active'}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewEmployeeModal(${e.id})"><i class="fas fa-eye"></i></button>
          <button class="btn-icon" data-action="edit-employee" title="Edit" onclick="showEditEmployeeModal(${e.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon danger" data-action="delete-employee" title="Delete" onclick="showDeleteConfirmModal('Employee', ${e.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ==================== INVENTORY FILTER FUNCTIONS ====================

function filterItemsTable(searchTerm) {
  const tbody = document.getElementById('itemsTableBody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  const term = searchTerm.toLowerCase();
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(term) ? '' : 'none';
  });
}

function filterItemsByCategory(category) {
  const tbody = document.getElementById('itemsTableBody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  rows.forEach(row => {
    if (!category) { row.style.display = ''; return; }
    const cells = row.querySelectorAll('td');
    if (cells.length > 3) {
      const cat = cells[3].textContent.trim();
      row.style.display = cat === category ? '' : 'none';
    }
  });
}

function filterItemsByStock(status) {
  const tbody = document.getElementById('itemsTableBody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  rows.forEach(row => {
    if (!status) { row.style.display = ''; return; }
    const badge = row.querySelector('.stock-badge');
    if (badge) {
      const hasClass = badge.classList.contains(status);
      row.style.display = hasClass ? '' : 'none';
    }
  });
}

function filterPropertyCards(status) {
  const tbody = document.getElementById('propertyCardsTableBody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  rows.forEach(row => {
    if (!status) { row.style.display = ''; return; }
    const badge = row.querySelector('.status-badge');
    if (badge) {
      const text = badge.textContent.trim().toLowerCase().replace(' ', '_');
      row.style.display = text === status ? '' : 'none';
    }
  });
}

// ==================== NEW RENDER FUNCTIONS ====================

function renderPARTable(pars) {
  const tbody = document.getElementById('parTableBody');
  if (!tbody) return;
  if (!pars.length) { tbody.innerHTML = '<tr><td colspan="10" class="text-center">No PAR entries found</td></tr>'; return; }
  tbody.innerHTML = pars.map(p => `
    <tr>
      <td>${p.par_no || ''}</td>
      <td>${p.date_of_issue ? new Date(p.date_of_issue).toLocaleDateString() : ''}</td>
      <td>${p.ppe_no || ''}</td>
      <td>${p.description || ''}</td>
      <td>1</td>
      <td>-</td>
      <td>-</td>
      <td>${p.received_by_name || ''}</td>
      <td><span class="status-badge approved">Active</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewPARModal(${p.id})"><i class="fas fa-eye"></i></button>
          <button class="btn-icon" title="Edit" onclick="showEditPARModal(${p.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('PAR', ${p.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderPTRTable(ptrs) {
  const tbody = document.getElementById('ptrTableBody');
  if (!tbody) return;
  if (!ptrs.length) { tbody.innerHTML = '<tr><td colspan="9" class="text-center">No PTR entries found</td></tr>'; return; }
  tbody.innerHTML = ptrs.map(p => `
    <tr>
      <td>${p.ptr_no || ''}</td>
      <td>${p.date ? new Date(p.date).toLocaleDateString() : ''}</td>
      <td>${p.property_number || ''}</td>
      <td>${p.description || ''}</td>
      <td>${p.from_officer_name || p.from_accountable_officer_name || ''}</td>
      <td>${p.to_officer_name || p.to_accountable_officer_name || ''}</td>
      <td>-</td>
      <td><span class="status-badge ${(p.status || 'Pending').toLowerCase()}">${p.status || 'Pending'}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewPTRModal(${p.id})"><i class="fas fa-eye"></i></button>
          <button class="btn-icon" title="Edit" onclick="showEditPTRModal(${p.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('PTR', ${p.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderRISTable(ris) {
  const tbody = document.getElementById('risTableBody');
  if (!tbody) return;
  if (!ris.length) { tbody.innerHTML = '<tr><td colspan="10" class="text-center">No RIS entries found</td></tr>'; return; }
  tbody.innerHTML = ris.map(r => `
    <tr>
      <td>${r.ris_no || ''}</td>
      <td>${r.ris_date ? new Date(r.ris_date).toLocaleDateString() : ''}</td>
      <td>${r.division || ''}</td>
      <td>${r.division || ''}</td>
      <td>${r.purpose || ''}</td>
      <td>${r.requested_by_name || ''}</td>
      <td>${r.approved_by_name || ''}</td>
      <td>${r.issued_by_name || ''}</td>
      <td><span class="status-badge ${r.status || 'draft'}">${r.status || 'draft'}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewRISModal(${r.id})"><i class="fas fa-eye"></i></button>
          ${r.status === 'draft' ? `<button class="btn-icon success" title="Post" onclick="postRIS(${r.id})"><i class="fas fa-check-circle"></i></button>` : ''}
          <button class="btn-icon" title="Edit" onclick="showEditRISModal(${r.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('RIS', ${r.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderSuppliesLedgerTable(cards) {
  const tbody = document.getElementById('suppliesLedgerTableBody');
  if (!tbody) return;
  if (!cards.length) { tbody.innerHTML = '<tr><td colspan="10" class="text-center">No supplies ledger entries found</td></tr>'; return; }
  tbody.innerHTML = cards.map(c => `
    <tr>
      <td>${c.item_code || ''}</td>
      <td>${c.item_name || ''}</td>
      <td>${c.unit || ''}</td>
      <td>${c.date ? new Date(c.date).toLocaleDateString() : ''}</td>
      <td>${c.reference || ''}</td>
      <td>${c.receipt_qty || 0}</td>
      <td>${c.issue_qty || 0}</td>
      <td><strong>${c.balance_qty || 0}</strong></td>
      <td>₱${parseFloat(c.balance_unit_cost || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>₱${parseFloat(c.balance_total_cost || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
    </tr>
  `).join('');
}

function renderSemiExpendableTable(items) {
  const tbody = document.getElementById('semiExpendableTableBody');
  if (!tbody) return;
  if (!items.length) { tbody.innerHTML = '<tr><td colspan="10" class="text-center">No semi-expendable items found</td></tr>'; return; }
  tbody.innerHTML = items.map(i => `
    <tr>
      <td>${i.generated_item_id || ''}</td>
      <td>${i.item_description || i.item_name || ''}</td>
      <td>-</td>
      <td>1</td>
      <td>₱${parseFloat(i.unit_price || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>₱${parseFloat(i.unit_price || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>${i.ppe_no || '-'}</td>
      <td>${i.ics_no || '-'}</td>
      <td><span class="status-badge ${(i.status || 'Available').toLowerCase()}">${i.status || 'Available'}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewSemiExpModal(${i.id})"><i class="fas fa-eye"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderCapitalOutlayTable(items) {
  const tbody = document.getElementById('capitalOutlayTableBody');
  if (!tbody) return;
  if (!items.length) { tbody.innerHTML = '<tr><td colspan="10" class="text-center">No capital outlay items found</td></tr>'; return; }
  tbody.innerHTML = items.map(i => `
    <tr>
      <td>${i.generated_item_id || ''}</td>
      <td>${i.item_description || i.item_name || ''}</td>
      <td>-</td>
      <td>1</td>
      <td>₱${parseFloat(i.unit_price || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>₱${parseFloat(i.unit_price || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
      <td>${i.ppe_no || '-'}</td>
      <td>-</td>
      <td><span class="status-badge ${(i.status || 'Available').toLowerCase()}">${i.status || 'Available'}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewCapitalOutlayModal(${i.id})"><i class="fas fa-eye"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderTripTicketsTable(tickets) {
  const tbody = document.getElementById('tripTicketsTableBody');
  if (!tbody) return;
  if (!tickets.length) { tbody.innerHTML = '<tr><td colspan="10" class="text-center">No trip tickets found</td></tr>'; return; }
  tbody.innerHTML = tickets.map(t => `
    <tr>
      <td>${t.trip_ticket_no || ''}</td>
      <td>${t.date_of_travel ? new Date(t.date_of_travel).toLocaleDateString() : ''}</td>
      <td>${t.requested_by_employee || ''}</td>
      <td>${t.destination || ''}</td>
      <td>${t.destination || ''}</td>
      <td>${t.purpose || ''}</td>
      <td>${t.time_of_departure || ''}</td>
      <td>${t.return_date ? new Date(t.return_date).toLocaleDateString() : '-'}</td>
      <td><span class="status-badge ${(t.status || 'Pending').toLowerCase()}">${t.status || 'Pending'}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="View" onclick="showViewTripTicketModal(${t.id})"><i class="fas fa-eye"></i></button>
          <button class="btn-icon" title="Edit" onclick="showEditTripTicketModal(${t.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('TripTicket', ${t.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderOfficesTable(offices) {
  const tbody = document.getElementById('officesTableBody');
  if (!tbody) return;
  if (!offices.length) { tbody.innerHTML = '<tr><td colspan="5" class="text-center">No offices found</td></tr>'; return; }
  tbody.innerHTML = offices.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.name || ''}</td>
      <td>-</td>
      <td>${o.description || ''}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="Edit" onclick="showEditOfficeModal(${o.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('Office', ${o.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderDesignationsTable(designations) {
  const tbody = document.getElementById('designationsTableBody');
  if (!tbody) return;
  if (!designations.length) { tbody.innerHTML = '<tr><td colspan="5" class="text-center">No designations found</td></tr>'; return; }
  tbody.innerHTML = designations.map(d => `
    <tr>
      <td>${d.id}</td>
      <td>${d.name || ''}</td>
      <td>${d.code || '-'}</td>
      <td>${d.description || ''}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="Edit" onclick="showEditDesignationModal(${d.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('Designation', ${d.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderDivisionsTable(divisions) {
  const tbody = document.getElementById('divisionsTableBody');
  if (!tbody) return;
  if (!divisions.length) { tbody.innerHTML = '<tr><td colspan="5" class="text-center">No divisions found</td></tr>'; return; }
  tbody.innerHTML = divisions.map(d => `
    <tr>
      <td>${d.id}</td>
      <td>${d.code || ''}</td>
      <td>${d.name || ''}</td>
      <td>${d.description || ''}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="Edit" onclick="showEditDivisionModal(${d.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('Division', ${d.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderDivisionsGrid(divisions) {
  const grid = document.getElementById('divisionsGrid');
  if (!grid) return;
  if (!divisions || !divisions.length) { grid.innerHTML = '<p style="text-align:center;color:#666;">No divisions found</p>'; return; }
  
  const iconMap = {
    'FAD': { icon: 'fa-calculator', bg: 'bg-primary' },
    'WRSD': { icon: 'fa-hands-helping', bg: 'bg-success' },
    'MWPSD': { icon: 'fa-shield-alt', bg: 'bg-warning' },
    'MWPTD': { icon: 'fa-chalkboard-teacher', bg: 'bg-info' },
    'ORD': { icon: 'fa-user-tie', bg: 'bg-danger' }
  };
  const defaultIcon = { icon: 'fa-building', bg: 'bg-primary' };
  
  grid.innerHTML = divisions.map(d => {
    const code = (d.code || '').toUpperCase();
    const style = iconMap[code] || defaultIcon;
    const head = d.head_name || d.division_head || '';
    const role = d.head_role || ('Chief ' + code);
    return `
      <div class="division-card">
        <div class="division-icon ${style.bg}">
          <i class="fas ${style.icon}"></i>
        </div>
        <h3>${d.name || ''}</h3>
        <p class="division-code">${code}</p>
        ${head ? `<p class="division-head"><strong>Division Head:</strong> ${head}</p>` : ''}
        ${role ? `<p class="division-role">${role}</p>` : ''}
        <div class="division-stats-small">
          <span><i class="fas fa-clipboard-list"></i> ${d.ppmp_count || 0} PPMP Items</span>
          <span><i class="fas fa-file-signature"></i> ${d.pr_count || 0} Active PRs</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderFundClustersTable(fc) {
  const tbody = document.getElementById('fundClustersTableBody');
  if (!tbody) return;
  if (!fc.length) { tbody.innerHTML = '<tr><td colspan="5" class="text-center">No fund clusters found</td></tr>'; return; }
  tbody.innerHTML = fc.map(f => `
    <tr>
      <td>${f.id}</td>
      <td>${f.code || ''}</td>
      <td>${f.name || ''}</td>
      <td>${f.description || ''}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="Edit" onclick="showEditFundClusterModal(${f.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('FundCluster', ${f.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderProcurementModesTable(modes) {
  const tbody = document.getElementById('procurementModesTableBody');
  if (!tbody) return;
  if (!modes.length) { tbody.innerHTML = '<tr><td colspan="6" class="text-center">No procurement modes found</td></tr>'; return; }
  tbody.innerHTML = modes.map(m => `
    <tr>
      <td>${m.id}</td>
      <td>${m.code || ''}</td>
      <td>${m.name || ''}</td>
      <td>${m.description || ''}</td>
      <td>-</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="Edit" onclick="showEditProcurementModeModal(${m.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('ProcurementMode', ${m.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderUACSCodesTable(codes) {
  const tbody = document.getElementById('uacsCodesTableBody');
  if (!tbody) return;
  if (!codes.length) { tbody.innerHTML = '<tr><td colspan="5" class="text-center">No UACS codes found</td></tr>'; return; }
  tbody.innerHTML = codes.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.code || ''}</td>
      <td>${c.description || ''}</td>
      <td>${c.category || ''}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="Edit" onclick="showEditUACSCodeModal(${c.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('UACSCode', ${c.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderUOMsTable(uoms) {
  const tbody = document.getElementById('uomsTableBody');
  if (!tbody) return;
  if (!uoms.length) { tbody.innerHTML = '<tr><td colspan="4" class="text-center">No units of measure found</td></tr>'; return; }
  tbody.innerHTML = uoms.map(u => `
    <tr>
      <td>${u.id}</td>
      <td>${u.abbreviation || u.code || ''}</td>
      <td>${u.name || u.description || ''}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="Edit" onclick="showEditUOMModal(${u.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="showDeleteConfirmModal('UOM', ${u.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderSettingsTable(settings) {
  const tbody = document.getElementById('settingsTableBody');
  if (!tbody) return;
  if (!settings.length) { tbody.innerHTML = '<tr><td colspan="4" class="text-center">No settings found</td></tr>'; return; }

  const descriptions = {
    globalCounters: 'Auto-generated ID counters for ICS, PAR, PPE, and inventory numbering',
    risCounters: 'Auto-increment counters for RIS numbers per fiscal year',
    tripTicketCounter: 'Auto-increment counters for Trip Ticket numbers per month'
  };

  tbody.innerHTML = settings.map(s => {
    const data = typeof s.data === 'object' ? s.data : JSON.parse(s.data || '{}');
    const desc = descriptions[s.id] || 'System configuration';
    const updated = s.updated_at ? new Date(s.updated_at).toLocaleString() : '-';

    // Render the JSON data as an editable key-value list
    let valueHtml = '';
    const entries = Object.entries(data);
    if (entries.length === 0) {
      valueHtml = '<em style="color:#999;">Empty</em>';
    } else {
      valueHtml = '<div class="settings-kv-list" data-id="' + s.id + '">';
      entries.forEach(([key, val]) => {
        const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
        valueHtml += '<div class="settings-kv-row"><span class="settings-key">' + key + '</span><input type="text" class="form-input settings-kv-input" data-key="' + key + '" value=\'' + valStr.replace(/'/g, "&apos;") + '\' style="flex:1;font-size:12px;padding:4px 8px;"></div>';
      });
      valueHtml += '</div>';
    }

    return `
    <tr>
      <td><code style="font-size:12px;background:#f0f4f8;padding:3px 8px;border-radius:3px;">${s.id || ''}</code></td>
      <td>${valueHtml}</td>
      <td><span style="font-size:11px;color:#636e78;">${desc}</span><br><small style="color:#999;">Updated: ${updated}</small></td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon success" title="Save" onclick="saveSetting('${s.id}')"><i class="fas fa-save"></i></button>
        </div>
      </td>
    </tr>
  `}).join('');
}

// Filter functions for new modules
function filterRIS(status) {
  const tbody = document.getElementById('risTableBody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  rows.forEach(row => {
    if (!status) { row.style.display = ''; return; }
    const badge = row.querySelector('.status-badge');
    if (badge) {
      const text = badge.textContent.trim().toLowerCase();
      row.style.display = text === status ? '' : 'none';
    }
  });
}

function filterTripTickets(status) {
  const tbody = document.getElementById('tripTicketsTableBody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  rows.forEach(row => {
    if (!status) { row.style.display = ''; return; }
    const badge = row.querySelector('.status-badge');
    if (badge) {
      const text = badge.textContent.trim().toLowerCase().replace(' ', '_');
      row.style.display = text === status ? '' : 'none';
    }
  });
}

// Load all data when navigating to a page
async function loadPageData(pageId) {
  switch(pageId) {
    case 'dashboard': await loadDashboardStats(); break;
    case 'items': await loadItems(); if (!cachedUOMs.length) await loadUOMs(); break;
    case 'suppliers': await loadSuppliers(); break;
    case 'users': await loadUsers(); break;
    case 'ppmp': initPPMPFilters(); await loadPPMP(); break;
    case 'app': await loadAPP(); break;
    case 'purchase-requests': await loadPR(); break;
    case 'rfq': await loadRFQ(); break;
    case 'abstract': await loadAbstract(); break;
    case 'post-qual': await loadPostQual(); break;
    case 'bac-resolution': await loadBACResolution(); break;
    case 'noa': await loadNOA(); break;
    case 'purchase-orders': await loadPO(); break;
    case 'iar': await loadIAR(); break;
    case 'po-packet': await loadPOPacket(); break;
    case 'coa': await loadCOA(); break;
    case 'stock-cards': await loadStockCards(); break;
    case 'property-cards': await loadPropertyCards(); break;
    case 'ics': await loadICS(); break;
    case 'employees': await loadEmployees(); break;
    case 'ris': await loadRIS(); break;
    case 'supplies-ledger': await loadSuppliesLedger(); break;
    case 'trip-tickets': await loadTripTickets(); break;
    case 'designations': await loadDesignations(); break;
    case 'divisions': await loadDivisions(); break;
    case 'fund-clusters': await loadFundClusters(); break;
    case 'procurement-modes': await loadProcurementModes(); break;
    case 'uacs-codes': await loadUACSCodes(); break;
    case 'uoms': await loadUOMs(); break;
    case 'settings': await loadSettings(); break;
    case 'reports': /* Static page with report generators */ break;
  }
  // Apply action permissions AFTER data has fully loaded into the DOM
  applyActionPermissions();
}

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

  // Current user state (declared globally at top of file)

  // Page titles mapping (As-Is System)
  const pageTitles = {
    dashboard: 'Dashboard',
    ppmp: 'Project Procurement Management Plan',
    app: 'Annual Procurement Plan',
    'purchase-requests': 'Purchase Requests',
    rfq: 'Request for Quotation',
    abstract: 'Abstract of Quotation',
    'post-qual': 'Post-Qualification',
    'bac-resolution': 'BAC Resolution',
    noa: 'Notice of Award',
    'purchase-orders': 'Purchase Orders',
    iar: 'Inspection & Acceptance Report',
    'po-packet': 'PO Packet / Signing',
    coa: 'COA Submission',
    items: 'Items Catalog',
    suppliers: 'Suppliers',
    divisions: 'Divisions',
    users: 'Users',
    employees: 'Employees',
    'stock-cards': 'Stock Cards',
    'property-cards': 'Property Cards',
    ics: 'Inventory Custodian Slips',
    par: 'Property Acknowledgement Receipts',
    ptr: 'Property Transfer Reports',
    ris: 'Requisition & Issue Slips',
    'supplies-ledger': 'Supplies Ledger Cards',
    'semi-expendable': 'Semi-Expendable Items',
    'capital-outlay': 'Capital Outlay Items',
    'trip-tickets': 'Trip Tickets',
    offices: 'Offices',
    designations: 'Designations',
    'fund-clusters': 'Fund Clusters',
    'procurement-modes': 'Procurement Modes',
    'uacs-codes': 'UACS Codes',
    uoms: 'Units of Measure',
    settings: 'System Settings',
    reports: 'Reports'
  };

  // Workflow Status Badges (per spec v1.2)
  const WORKFLOW_STATUS_BADGES = {
    pending: { label: 'Pending', class: 'pending' },
    on_process: { label: 'On Process', class: 'on-process' },
    awaiting_delivery: { label: 'Awaiting Delivery', class: 'awaiting-delivery' },
    for_payment: { label: 'For Payment', class: 'for-payment' },
    paid_ada: { label: 'Paid (ADA)', class: 'paid-ada' },
    for_signing: { label: 'For Signing', class: 'for-signing' },
    signed: { label: 'Signed', class: 'signed' },
    submitted_to_coa: { label: 'COA Submitted', class: 'submitted-to-coa' },
    cancelled: { label: 'Cancelled', class: 'rejected' }
  };

  // Initialize the app
  function init() {
    setCurrentDate();
    setupEventListeners();
    populateSignupDivision(); // Populate signup division dropdown (API is public)
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

    // Collapsible sidebar sections
    document.querySelectorAll('.nav-section[data-section]').forEach(section => {
      section.addEventListener('click', () => {
        const sectionName = section.dataset.section;
        section.classList.toggle('collapsed');
        // Toggle visibility of items in this section
        const items = document.querySelectorAll(`.nav-item[data-section-item="${sectionName}"]`);
        items.forEach(item => {
          if (section.classList.contains('collapsed')) {
            item.style.display = 'none';
          } else {
            // Only show if not hidden by role permissions
            if (!item.dataset.hiddenByRole) {
              item.style.display = '';
            }
          }
        });
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
    try {
      const savedUser = sessionStorage.getItem('dmw_user');
      const savedToken = sessionStorage.getItem('dmw_token');
      if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        authToken = savedToken;
        // Ensure roles array exists (backward compat for older sessions)
        if (!currentUser.roles || !Array.isArray(currentUser.roles)) {
          currentUser.roles = [currentUser.role].filter(Boolean);
        }
        // Clear stale hardcoded division if user has no real dept assigned
        if (currentUser.division === 'FAD' && !currentUser.department_code && !currentUser.department) {
          currentUser.division = '';
        }
        sessionStorage.setItem('dmw_user', JSON.stringify(currentUser));
        console.log('Session restored for:', currentUser.name, 'roles:', currentUser.roles);
        showApp();
        return;
      }
    } catch (e) {
      console.error('Error restoring session:', e);
      sessionStorage.removeItem('dmw_user');
      sessionStorage.removeItem('dmw_token');
    }
    console.log('No saved session - showing login screen');
  }

  // Handle login - redirect form submit to doLogin
  function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    // Call the real API-based login function
    if (typeof window.doLogin === 'function') {
      window.doLogin();
    }
  }

  // Show the main app
  function showApp() {
    console.log('Showing main app');
    if (loginOverlay) {
      loginOverlay.style.display = 'none';
      loginOverlay.classList.add('hidden');
    }

    // Update user info in sidebar
    if (userNameEl) {
      userNameEl.textContent = currentUser.name;
    }
    if (userRoleEl) {
      const div = currentUser.department_code || currentUser.division || '';
      const designation = currentUser.designation || '';
      // Build role display — show designation if available, otherwise format roles
      let roleText;
      if (designation) {
        roleText = designation;
      } else {
        roleText = (currentUser.roles || [currentUser.role]).map(r => formatRole(r)).join(' / ');
      }
      userRoleEl.textContent = roleText + (div ? ' - ' + div : '');
    }
    // Update avatar initials
    const avatarEl = document.getElementById('userAvatarInitials');
    if (avatarEl && currentUser.name) {
      const parts = currentUser.name.trim().split(/\s+/);
      const initials = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();
      avatarEl.textContent = initials;
    }

    // Apply role-based visibility
    applyRoleVisibility();

    // Start real-time notification polling
    startNotificationPolling();

    // Navigate to dashboard
    navigateTo('dashboard');
  }

  // Format role for display (As-Is Roles)
  function formatRole(role) {
    const roleLabels = {
      admin: 'System Administrator',
      manager: 'Division Manager',
      officer: 'Procurement Officer',
      viewer: 'Viewer',
      auditor: 'COA Auditor',
      hope: 'HoPE (Regional Director)',
      bac_chair: 'BAC Chairperson',
      bac_secretariat: 'BAC Secretariat',
      twg_member: 'TWG Member',
      division_head: 'Division Head',
      end_user: 'End User',
      supply_officer: 'Supply/Procurement Officer',
      inspector: 'Inspection/Property Custodian',
      ord_manager: 'ORD Manager',
      chief_fad: 'Chief - FAD',
      chief_wrsd: 'Chief - WRSD',
      chief_mwpsd: 'Chief - MWPSD',
      chief_mwptd: 'Chief - MWPTD'
    };
    return roleLabels[role] || role;
  }

  // Role-based ACTION permissions (what each role can DO)
  const roleActionPermissions = {
    admin: {
      // Admin can do everything
      canCreatePPMP: true, canEditPPMP: true, canApprovePPMP: true, canViewPPMP: true,
      canCreateAPP: true, canApproveAPP: true, canConsolidateAPP: true, canViewAPP: true,
      canCreatePR: true, canEditPR: true, canApprovePR: true, canViewPR: true,
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
      canCreateEmployee: true, canEditEmployee: true, canDeleteEmployee: true, canViewEmployee: true,
      canViewReports: true, canExportReports: true,
      canManageDivisions: true, canManageSettings: true, canManageAll: true
    },
    manager: {
      // Manager/Division Chief: Approves division PPMP, approves PR, views most items
      canCreatePPMP: false, canEditPPMP: true, canApprovePPMP: true, canViewPPMP: true,
      canCreateAPP: false, canApproveAPP: true, canConsolidateAPP: false, canViewAPP: true,
      canCreatePR: false, canEditPR: true, canApprovePR: true, canViewPR: true,
      canCreateRFQ: false, canSendRFQ: false, canViewRFQ: true,
      canCreateAbstract: false, canApproveAbstract: false, canViewAbstract: true,
      canCreatePostQual: false, canApprovePostQual: false, canViewPostQual: true,
      canCreateBACRes: false, canApproveBACRes: false, canViewBACRes: true,
      canCreateNOA: false, canApproveNOA: false, canViewNOA: true,
      canCreatePO: false, canApprovePO: false, canViewPO: true,
      canCreateIAR: false, canApproveIAR: true, canViewIAR: true,
      canCreateCOA: false, canSubmitCOA: false, canViewCOA: true,
      canCreateItem: false, canEditItem: false, canDeleteItem: false, canViewItem: true,
      canCreateSupplier: false, canEditSupplier: false, canDeleteSupplier: false, canViewSupplier: true,
      canCreateUser: false, canEditUser: false, canDeleteUser: false, canViewUser: true,
      canViewReports: true, canExportReports: true,
      canManageDivisions: false
    },
    officer: {
      // Officer: Handles procurement transactions (cannot create PPMP - only chiefs can)
      canCreatePPMP: false, canEditPPMP: true, canApprovePPMP: false, canViewPPMP: true,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: true,
      canCreatePR: true, canEditPR: true, canApprovePR: false, canViewPR: true,
      canCreateRFQ: true, canSendRFQ: true, canViewRFQ: true,
      canCreateAbstract: true, canApproveAbstract: false, canViewAbstract: true,
      canCreatePostQual: true, canApprovePostQual: false, canViewPostQual: true,
      canCreateBACRes: true, canApproveBACRes: false, canViewBACRes: true,
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
    viewer: {
      // Viewer: Read-only access to most modules
      canCreatePPMP: false, canEditPPMP: false, canApprovePPMP: false, canViewPPMP: true,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: true,
      canCreatePR: false, canEditPR: false, canApprovePR: false, canViewPR: true,
      canCreateRFQ: false, canSendRFQ: false, canViewRFQ: true,
      canCreateAbstract: false, canApproveAbstract: false, canViewAbstract: true,
      canCreatePostQual: false, canApprovePostQual: false, canViewPostQual: true,
      canCreateBACRes: false, canApproveBACRes: false, canViewBACRes: true,
      canCreateNOA: false, canApproveNOA: false, canViewNOA: true,
      canCreatePO: false, canApprovePO: false, canViewPO: true,
      canCreateIAR: false, canApproveIAR: false, canViewIAR: true,
      canCreateCOA: false, canSubmitCOA: false, canViewCOA: true,
      canCreateItem: false, canEditItem: false, canDeleteItem: false, canViewItem: true,
      canCreateSupplier: false, canEditSupplier: false, canDeleteSupplier: false, canViewSupplier: true,
      canCreateUser: false, canEditUser: false, canDeleteUser: false, canViewUser: false,
      canViewReports: true, canExportReports: false,
      canManageDivisions: false
    },
    auditor: {
      // Auditor: COA Auditor - read access to all for audit purposes
      canCreatePPMP: false, canEditPPMP: false, canEditPPMP: false, canApprovePPMP: false, canViewPPMP: true,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: true,
      canCreatePR: false, canEditPR: false, canApprovePR: false, canViewPR: true,
      canCreateRFQ: false, canSendRFQ: false, canViewRFQ: true,
      canCreateAbstract: false, canApproveAbstract: false, canViewAbstract: true,
      canCreatePostQual: false, canApprovePostQual: false, canViewPostQual: true,
      canCreateBACRes: false, canApproveBACRes: false, canViewBACRes: true,
      canCreateNOA: false, canApproveNOA: false, canViewNOA: true,
      canCreatePO: false, canApprovePO: false, canViewPO: true,
      canCreateIAR: false, canApproveIAR: false, canViewIAR: true,
      canCreateCOA: false, canSubmitCOA: false, canViewCOA: true,
      canCreateItem: false, canEditItem: false, canDeleteItem: false, canViewItem: true,
      canCreateSupplier: false, canEditSupplier: false, canDeleteSupplier: false, canViewSupplier: true,
      canCreateUser: false, canEditUser: false, canDeleteUser: false, canViewUser: false,
      canViewReports: true, canExportReports: true,
      canManageDivisions: false
    },
    hope: {
      // HoPE: Approvals for NOA, PO, final oversight
      canCreatePPMP: false, canEditPPMP: false, canApprovePPMP: true, canViewPPMP: true,
      canCreateAPP: false, canApproveAPP: true, canConsolidateAPP: false, canViewAPP: true,
      canCreatePR: false, canEditPR: false, canApprovePR: true, canViewPR: true,
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
      canCreatePPMP: false, canEditPPMP: false, canApprovePPMP: false, canViewPPMP: false,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: true,
      canCreatePR: false, canEditPR: false, canApprovePR: false, canViewPR: true,
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
    bac_secretariat: {
      // BAC Secretariat: Creates RFQ, Abstract, BAC Res, NOA, prepares documents
      canCreatePPMP: false, canEditPPMP: false, canApprovePPMP: false, canViewPPMP: true,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: true, canViewAPP: true,
      canCreatePR: false, canEditPR: false, canApprovePR: false, canViewPR: true,
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
    twg_member: {
      // TWG: Technical evaluation, post-qualification
      canCreatePPMP: false, canEditPPMP: false, canApprovePPMP: false, canViewPPMP: false,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: true,
      canCreatePR: false, canEditPR: false, canApprovePR: false, canViewPR: true,
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
    division_head: {
      // Division Head: Approves division PPMP, approves PR, manages division items
      // Cannot create PPMP - only chiefs can submit PPMPs
      canCreatePPMP: false, canApprovePPMP: true, canEditPPMP: true, canViewPPMP: true,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: true,
      canCreatePR: true, canApprovePR: true, canEditPR: true, canViewPR: true,
      canCreateRFQ: false, canSendRFQ: false, canViewRFQ: false,
      canCreateAbstract: false, canApproveAbstract: false, canViewAbstract: false,
      canCreatePostQual: false, canApprovePostQual: false, canViewPostQual: false,
      canCreateBACRes: false, canApproveBACRes: false, canViewBACRes: false,
      canCreateNOA: false, canApproveNOA: false, canViewNOA: false,
      canCreatePO: false, canApprovePO: false, canViewPO: false,
      canCreateIAR: false, canApproveIAR: false, canViewIAR: false,
      canCreateCOA: false, canSubmitCOA: false, canViewCOA: false,
      canCreateItem: true, canEditItem: true, canDeleteItem: false, canViewItem: true,
      canCreateSupplier: false, canEditSupplier: false, canDeleteSupplier: false, canViewSupplier: true,
      canCreateUser: false, canEditUser: false, canDeleteUser: false, canViewUser: false,
      canViewReports: true, canExportReports: true,
      canManageDivisions: true
    },
    end_user: {
      // End User: Can view PPMP and create PR - NO PPMP creation (only chiefs can)
      canCreatePPMP: false, canApprovePPMP: false, canEditPPMP: false, canViewPPMP: true,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: false,
      canCreatePR: true, canApprovePR: false, canEditPR: false, canViewPR: true,
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
    supply_officer: {
      // Supply/Procurement Officer: Manages procurement process, creates PO, RFQ
      canCreatePPMP: false, canEditPPMP: false, canApprovePPMP: false, canViewPPMP: false,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: true,
      canCreatePR: false, canEditPR: false, canApprovePR: false, canViewPR: true,
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
      canCreatePPMP: false, canEditPPMP: false, canApprovePPMP: false, canViewPPMP: false,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: false,
      canCreatePR: false, canEditPR: false, canApprovePR: false, canViewPR: false,
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
    },
    ord_manager: {
      // ORD Manager: Can view ALL divisions PPMP, similar to admin for PPMP viewing
      canCreatePPMP: false, canEditPPMP: true, canApprovePPMP: true, canViewPPMP: true,
      canCreateAPP: false, canApproveAPP: true, canConsolidateAPP: true, canViewAPP: true,
      canCreatePR: false, canEditPR: true, canApprovePR: true, canViewPR: true,
      canCreateRFQ: false, canSendRFQ: false, canViewRFQ: true,
      canCreateAbstract: false, canApproveAbstract: false, canViewAbstract: true,
      canCreatePostQual: false, canApprovePostQual: false, canViewPostQual: true,
      canCreateBACRes: false, canApproveBACRes: false, canViewBACRes: true,
      canCreateNOA: false, canApproveNOA: false, canViewNOA: true,
      canCreatePO: false, canApprovePO: false, canViewPO: true,
      canCreateIAR: false, canApproveIAR: false, canViewIAR: true,
      canCreateCOA: false, canSubmitCOA: false, canViewCOA: true,
      canCreateItem: false, canEditItem: false, canDeleteItem: false, canViewItem: true,
      canCreateSupplier: false, canEditSupplier: false, canDeleteSupplier: false, canViewSupplier: true,
      canCreateUser: false, canEditUser: false, canDeleteUser: false, canViewUser: true,
      canViewReports: true, canExportReports: true,
      canManageDivisions: true
    },
    chief_fad: {
      // Chief FAD: Can create PPMP, only sees FAD division PPMP
      canCreatePPMP: true, canEditPPMP: true, canApprovePPMP: true, canViewPPMP: true,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: true,
      canCreatePR: true, canEditPR: true, canApprovePR: true, canViewPR: true,
      canCreateRFQ: false, canSendRFQ: false, canViewRFQ: true,
      canCreateAbstract: false, canApproveAbstract: false, canViewAbstract: true,
      canCreatePostQual: false, canApprovePostQual: false, canViewPostQual: true,
      canCreateBACRes: false, canApproveBACRes: false, canViewBACRes: true,
      canCreateNOA: false, canApproveNOA: false, canViewNOA: true,
      canCreatePO: false, canApprovePO: false, canViewPO: true,
      canCreateIAR: false, canApproveIAR: false, canViewIAR: true,
      canCreateCOA: false, canSubmitCOA: false, canViewCOA: true,
      canCreateItem: true, canEditItem: true, canDeleteItem: false, canViewItem: true,
      canCreateSupplier: false, canEditSupplier: false, canDeleteSupplier: false, canViewSupplier: true,
      canCreateUser: false, canEditUser: false, canDeleteUser: false, canViewUser: false,
      canViewReports: true, canExportReports: true,
      canManageDivisions: false
    },
    chief_wrsd: {
      // Chief WRSD: Can create PPMP, only sees WRSD division PPMP
      canCreatePPMP: true, canEditPPMP: true, canApprovePPMP: true, canViewPPMP: true,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: true,
      canCreatePR: true, canEditPR: true, canApprovePR: true, canViewPR: true,
      canCreateRFQ: false, canSendRFQ: false, canViewRFQ: true,
      canCreateAbstract: false, canApproveAbstract: false, canViewAbstract: true,
      canCreatePostQual: false, canApprovePostQual: false, canViewPostQual: true,
      canCreateBACRes: false, canApproveBACRes: false, canViewBACRes: true,
      canCreateNOA: false, canApproveNOA: false, canViewNOA: true,
      canCreatePO: false, canApprovePO: false, canViewPO: true,
      canCreateIAR: false, canApproveIAR: false, canViewIAR: true,
      canCreateCOA: false, canSubmitCOA: false, canViewCOA: true,
      canCreateItem: true, canEditItem: true, canDeleteItem: false, canViewItem: true,
      canCreateSupplier: false, canEditSupplier: false, canDeleteSupplier: false, canViewSupplier: true,
      canCreateUser: false, canEditUser: false, canDeleteUser: false, canViewUser: false,
      canViewReports: true, canExportReports: true,
      canManageDivisions: false
    },
    chief_mwpsd: {
      // Chief MWPSD: Can create PPMP, only sees MWPSD division PPMP
      canCreatePPMP: true, canEditPPMP: true, canApprovePPMP: true, canViewPPMP: true,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: true,
      canCreatePR: true, canEditPR: true, canApprovePR: true, canViewPR: true,
      canCreateRFQ: false, canSendRFQ: false, canViewRFQ: true,
      canCreateAbstract: false, canApproveAbstract: false, canViewAbstract: true,
      canCreatePostQual: false, canApprovePostQual: false, canViewPostQual: true,
      canCreateBACRes: false, canApproveBACRes: false, canViewBACRes: true,
      canCreateNOA: false, canApproveNOA: false, canViewNOA: true,
      canCreatePO: false, canApprovePO: false, canViewPO: true,
      canCreateIAR: false, canApproveIAR: false, canViewIAR: true,
      canCreateCOA: false, canSubmitCOA: false, canViewCOA: true,
      canCreateItem: true, canEditItem: true, canDeleteItem: false, canViewItem: true,
      canCreateSupplier: false, canEditSupplier: false, canDeleteSupplier: false, canViewSupplier: true,
      canCreateUser: false, canEditUser: false, canDeleteUser: false, canViewUser: false,
      canViewReports: true, canExportReports: true,
      canManageDivisions: false
    },
    chief_mwptd: {
      // Chief MWPTD: Can create PPMP, only sees MWPTD division PPMP
      canCreatePPMP: true, canEditPPMP: true, canApprovePPMP: true, canViewPPMP: true,
      canCreateAPP: false, canApproveAPP: false, canConsolidateAPP: false, canViewAPP: true,
      canCreatePR: true, canEditPR: true, canApprovePR: true, canViewPR: true,
      canCreateRFQ: false, canSendRFQ: false, canViewRFQ: true,
      canCreateAbstract: false, canApproveAbstract: false, canViewAbstract: true,
      canCreatePostQual: false, canApprovePostQual: false, canViewPostQual: true,
      canCreateBACRes: false, canApproveBACRes: false, canViewBACRes: true,
      canCreateNOA: false, canApproveNOA: false, canViewNOA: true,
      canCreatePO: false, canApprovePO: false, canViewPO: true,
      canCreateIAR: false, canApproveIAR: false, canViewIAR: true,
      canCreateCOA: false, canSubmitCOA: false, canViewCOA: true,
      canCreateItem: true, canEditItem: true, canDeleteItem: false, canViewItem: true,
      canCreateSupplier: false, canEditSupplier: false, canDeleteSupplier: false, canViewSupplier: true,
      canCreateUser: false, canEditUser: false, canDeleteUser: false, canViewUser: false,
      canViewReports: true, canExportReports: true,
      canManageDivisions: false
    }
  };

  // Get current user's permissions
  function getUserPermissions() {
    // Merge permissions from all roles
    const merged = {};
    (currentUser.roles || [currentUser.role]).forEach(r => {
      const perms = roleActionPermissions[r] || {};
      Object.keys(perms).forEach(key => {
        if (perms[key] === true) merged[key] = true;
        else if (!(key in merged)) merged[key] = perms[key];
      });
    });
    return merged;
  }

  // Check if user has a specific permission
  function hasPermission(permissionName) {
    const perms = getUserPermissions();
    return perms[permissionName] === true;
  }

  // Expose permission functions globally for inline event handlers
  window.hasPermission = hasPermission;
  window.getUserPermissions = getUserPermissions;

  // Apply role-based UI visibility (As-Is Permissions)
  function applyRoleVisibility() {
    const role = currentUser.role;
    const perms = getUserPermissions();
    
    // Hide admin-only elements for non-admins
    const adminOnly = document.querySelectorAll('[data-role="admin"]');
    adminOnly.forEach(el => {
      el.style.display = userHasRole('admin') ? '' : 'none';
    });

    // Dashboard stats/pipeline/SLA: visible only to admin, system_admin, ord_manager
    const dashAdminOnly = document.getElementById('dashAdminOnlyStats');
    if (dashAdminOnly) {
      const canSeeStats = userHasAnyRole(['admin', 'system_admin', 'ord_manager']);
      dashAdminOnly.style.display = canSeeStats ? '' : 'none';
    }

    // Show/hide nav items based on role permissions (As-Is)
    const chiefPages = ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'items', 'suppliers', 'stock-cards', 'property-cards', 'ris', 'reports'];
    const rolePermissions = {
      admin: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'suppliers', 'divisions', 'users', 'employees', 'stock-cards', 'property-cards', 'ics', 'par', 'ptr', 'ris', 'supplies-ledger', 'semi-expendable', 'capital-outlay', 'trip-tickets', 'offices', 'designations', 'fund-clusters', 'procurement-modes', 'uacs-codes', 'uoms', 'settings', 'reports'],
      manager: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'suppliers', 'users', 'employees', 'stock-cards', 'property-cards', 'ics', 'par', 'ptr', 'ris', 'supplies-ledger', 'semi-expendable', 'capital-outlay', 'trip-tickets', 'reports'],
      officer: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'suppliers', 'stock-cards', 'property-cards', 'ics', 'par', 'ptr', 'ris', 'supplies-ledger', 'semi-expendable', 'capital-outlay', 'trip-tickets', 'reports'],
      viewer: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'suppliers', 'stock-cards', 'property-cards', 'ics', 'par', 'ptr', 'ris', 'supplies-ledger', 'semi-expendable', 'capital-outlay', 'trip-tickets', 'reports'],
      auditor: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'suppliers', 'stock-cards', 'property-cards', 'ics', 'par', 'ptr', 'ris', 'supplies-ledger', 'semi-expendable', 'capital-outlay', 'trip-tickets', 'reports'],
      hope: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'suppliers', 'divisions', 'stock-cards', 'property-cards', 'ics', 'par', 'ptr', 'reports'],
      bac_chair: ['dashboard', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'po-packet', 'items', 'suppliers', 'stock-cards', 'property-cards', 'reports'],
      bac_secretariat: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'suppliers', 'stock-cards', 'property-cards', 'ics', 'reports'],
      twg_member: ['dashboard', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'items', 'suppliers', 'reports'],
      division_head: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'items', 'stock-cards', 'property-cards', 'ris', 'reports'],
      end_user: ['dashboard', 'ppmp', 'purchase-requests', 'items', 'ris'],
      supply_officer: ['dashboard', 'app', 'purchase-requests', 'rfq', 'abstract', 'noa', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'suppliers', 'employees', 'stock-cards', 'property-cards', 'ics', 'par', 'ptr', 'ris', 'supplies-ledger', 'semi-expendable', 'capital-outlay', 'trip-tickets', 'reports'],
      inspector: ['dashboard', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'stock-cards', 'property-cards', 'ics', 'par', 'ptr', 'reports'],
      ord_manager: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'suppliers', 'divisions', 'users', 'stock-cards', 'property-cards', 'ics', 'par', 'ptr', 'ris', 'supplies-ledger', 'reports'],
      chief_fad: chiefPages,
      chief_wrsd: chiefPages,
      chief_mwpsd: chiefPages,
      chief_mwptd: chiefPages
    };

    const allowedPages = getMergedPermissions(rolePermissions);
    navItems.forEach(item => {
      const page = item.dataset.page;
      if (page && !allowedPages.includes(page)) {
        item.style.display = 'none';
        item.dataset.hiddenByRole = 'true';
      } else {
        item.style.display = '';
        delete item.dataset.hiddenByRole;
      }
    });

    // Hide section headers when all items in the section are hidden
    const sections = document.querySelectorAll('.nav-section[data-section]');
    sections.forEach(section => {
      const sectionName = section.dataset.section;
      const sectionItems = document.querySelectorAll(`[data-section-item="${sectionName}"]`);
      const hasVisibleItems = Array.from(sectionItems).some(item => !item.dataset.hiddenByRole);
      section.style.display = hasVisibleItems ? '' : 'none';
      // Reset collapsed state
      section.classList.remove('collapsed');
    });

    // Apply action-based button visibility
    applyActionPermissions();
  }

  // Apply action-level permissions to buttons and UI elements
  window.applyActionPermissions = function() {
    const perms = getUserPermissions();

    // Map of permission to button selectors
    const permissionButtonMap = {
      // PPMP
      canCreatePPMP: ['[data-action="create-ppmp"]', '.btn-create-ppmp'],
      canEditPPMP: ['[data-action="edit-ppmp"]', '.btn-edit-ppmp'],
      canApprovePPMP: ['[data-action="approve-ppmp"]', '.btn-approve-ppmp'],
      canViewPPMP: ['[data-action="view-ppmp"]'],
      // APP
      canCreateAPP: ['[data-action="create-app"]'],
      canConsolidateAPP: ['[data-action="consolidate-app"]', '.btn-consolidate-app'],
      canApproveAPP: ['[data-action="approve-app"]'],
      // PR
      canCreatePR: ['[data-action="create-pr"]', '.btn-create-pr'],
      canEditPR: ['[data-action="edit-pr"]', '.btn-edit-pr'],
      canApprovePR: ['[data-action="approve-pr"]', '.btn-approve-pr'],
      canViewPR: ['[data-action="view-pr"]'],
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
      canViewSupplier: ['[data-action="view-supplier"]'],
      canCreateSupplier: ['[data-action="create-supplier"]', '.btn-create-supplier'],
      canEditSupplier: ['[data-action="edit-supplier"]', '.btn-edit-supplier'],
      canDeleteSupplier: ['[data-action="delete-supplier"]', '.btn-delete-supplier'],
      // Users
      canCreateUser: ['[data-action="create-user"]', '.btn-create-user'],
      canEditUser: ['[data-action="edit-user"]', '.btn-edit-user'],
      canDeleteUser: ['[data-action="delete-user"]', '.btn-delete-user'],
      // Employees
      canCreateEmployee: ['[data-action="create-employee"]', '.btn-create-employee'],
      canEditEmployee: ['[data-action="edit-employee"]', '.btn-edit-employee'],
      canDeleteEmployee: ['[data-action="delete-employee"]', '.btn-delete-employee'],
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
        // Get data rows (skip empty/no-data rows)
        const dataRows = table.querySelectorAll('tbody tr');
        const actionCells = table.querySelectorAll('td:last-child');
        
        // If table has no data rows yet, always show the action column header
        // (data may still be loading from API)
        if (dataRows.length === 0 || actionCells.length === 0) {
          actionHeader.style.display = '';
          return;
        }

        // Check if there are any visible action buttons
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

  // Navigate to page with RBAC access control
  function navigateTo(pageId) {
    // RBAC: Check if user has access to this page
    const chiefNavPages = ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'items', 'suppliers', 'stock-cards', 'property-cards', 'ris', 'reports'];
    const rolePermissions = {
      admin: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'suppliers', 'divisions', 'users', 'employees', 'stock-cards', 'property-cards', 'ics', 'par', 'ptr', 'ris', 'supplies-ledger', 'semi-expendable', 'capital-outlay', 'trip-tickets', 'offices', 'designations', 'fund-clusters', 'procurement-modes', 'uacs-codes', 'uoms', 'settings', 'reports'],
      manager: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'suppliers', 'users', 'employees', 'stock-cards', 'property-cards', 'ics', 'par', 'ptr', 'ris', 'supplies-ledger', 'semi-expendable', 'capital-outlay', 'trip-tickets', 'reports'],
      officer: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'suppliers', 'stock-cards', 'property-cards', 'ics', 'par', 'ptr', 'ris', 'supplies-ledger', 'semi-expendable', 'capital-outlay', 'trip-tickets', 'reports'],
      viewer: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'suppliers', 'stock-cards', 'property-cards', 'ics', 'par', 'ptr', 'ris', 'supplies-ledger', 'semi-expendable', 'capital-outlay', 'trip-tickets', 'reports'],
      auditor: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'suppliers', 'stock-cards', 'property-cards', 'ics', 'par', 'ptr', 'ris', 'supplies-ledger', 'semi-expendable', 'capital-outlay', 'trip-tickets', 'reports'],
      hope: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'suppliers', 'divisions', 'stock-cards', 'property-cards', 'ics', 'par', 'ptr', 'reports'],
      bac_chair: ['dashboard', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'po-packet', 'items', 'suppliers', 'stock-cards', 'property-cards', 'reports'],
      bac_secretariat: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'suppliers', 'stock-cards', 'property-cards', 'ics', 'reports'],
      twg_member: ['dashboard', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'items', 'suppliers', 'reports'],
      division_head: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'items', 'stock-cards', 'property-cards', 'ris', 'reports'],
      end_user: ['dashboard', 'ppmp', 'purchase-requests', 'items', 'ris'],
      supply_officer: ['dashboard', 'app', 'purchase-requests', 'rfq', 'abstract', 'noa', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'suppliers', 'employees', 'stock-cards', 'property-cards', 'ics', 'par', 'ptr', 'ris', 'supplies-ledger', 'semi-expendable', 'capital-outlay', 'trip-tickets', 'reports'],
      inspector: ['dashboard', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'stock-cards', 'property-cards', 'ics', 'par', 'ptr', 'reports'],
      ord_manager: ['dashboard', 'ppmp', 'app', 'purchase-requests', 'rfq', 'abstract', 'post-qual', 'bac-resolution', 'noa', 'purchase-orders', 'iar', 'po-packet', 'coa', 'items', 'suppliers', 'divisions', 'users', 'stock-cards', 'property-cards', 'ics', 'par', 'ptr', 'ris', 'supplies-ledger', 'reports'],
      chief_fad: chiefNavPages,
      chief_wrsd: chiefNavPages,
      chief_mwpsd: chiefNavPages,
      chief_mwptd: chiefNavPages
    };
    
    const allowedPages = getMergedPermissions(rolePermissions);
    
    // Block access if user doesn't have permission
    if (!allowedPages.includes(pageId)) {
      showAccessDeniedMessage(pageId);
      return;
    }

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

    // Load data from API for this page (applyActionPermissions is called inside after data loads)
    loadPageData(pageId);
  }
  
  // Show access denied message
  function showAccessDeniedMessage(pageId) {
    const pageName = pageTitles[pageId] || pageId;
    const rolesList = (currentUser.roles || [currentUser.role]).map(r => formatRole(r)).join(', ');
    alert(`⛔ Access Denied\n\nYou do not have permission to access "${pageName}".\n\nYour role(s): ${rolesList}\n\nContact your administrator if you need access.`);
  }

  // Change Password Modal
  window.showChangePasswordModal = function() {
    const html = `
      <form id="changePasswordForm" onsubmit="window.submitChangePassword(event)">
        <div class="info-banner" style="margin-bottom: 16px;">
          <i class="fas fa-shield-alt"></i>
          <strong>Change your account password.</strong> Your new password must be at least 6 characters.
        </div>
        <div class="form-group">
          <label>Current Password <span class="text-danger">*</span></label>
          <div style="position:relative;">
            <input type="password" id="cpCurrentPassword" placeholder="Enter your current password" required style="padding-right:36px;">
            <button type="button" onclick="window.togglePasswordVisibility('cpCurrentPassword', this)" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:#94a3b8;cursor:pointer;font-size:13px;padding:4px;" title="Show/Hide">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>New Password <span class="text-danger">*</span></label>
          <div style="position:relative;">
            <input type="password" id="cpNewPassword" placeholder="Enter new password (min 6 characters)" required minlength="6" style="padding-right:36px;">
            <button type="button" onclick="window.togglePasswordVisibility('cpNewPassword', this)" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:#94a3b8;cursor:pointer;font-size:13px;padding:4px;" title="Show/Hide">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>Confirm New Password <span class="text-danger">*</span></label>
          <div style="position:relative;">
            <input type="password" id="cpConfirmPassword" placeholder="Re-enter new password" required minlength="6" style="padding-right:36px;">
            <button type="button" onclick="window.togglePasswordVisibility('cpConfirmPassword', this)" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:#94a3b8;cursor:pointer;font-size:13px;padding:4px;" title="Show/Hide">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
        <div id="cpError" class="auth-alert auth-alert-error" style="display:none;"></div>
        <div id="cpSuccess" class="auth-alert auth-alert-success" style="display:none;"></div>
        <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:18px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" id="cpSubmitBtn"><i class="fas fa-save"></i> Update Password</button>
        </div>
      </form>
    `;
    openModal('Change Password', html);
  };

  // Account Info Modal (Editable)
  window.showAccountInfoModal = async function() {
    // Fetch fresh user data from server to get latest email, dept, etc.
    try {
      const me = await apiRequest('/auth/me');
      if (me) {
        currentUser.username = me.username || currentUser.username;
        currentUser.name = me.full_name || currentUser.name;
        currentUser.email = me.email || '';
        currentUser.dept_id = me.dept_id || null;
        currentUser.department = me.department_name || '';
        currentUser.department_code = me.department_code || '';
        currentUser.division = me.department_code || me.department_name || '';
        currentUser.designation = me.designation_name || currentUser.designation || '';
        currentUser.roles = me.roles || [me.role, me.secondary_role].filter(Boolean);
        sessionStorage.setItem('dmw_user', JSON.stringify(currentUser));
      }
    } catch (e) {
      console.error('Failed to fetch fresh user data:', e);
    }
    const u = currentUser || {};

    // Fetch departments for dropdown
    let deptOptions = '<option value="">-- Select Department --</option>';
    try {
      const depts = await apiRequest('/departments');
      depts.forEach(d => {
        const selected = (u.dept_id && u.dept_id == d.id) ? 'selected' : '';
        deptOptions += `<option value="${d.id}" ${selected}>${d.code} - ${d.name}</option>`;
      });
    } catch (e) {
      console.error('Failed to load departments:', e);
    }

    const html = `
      <form id="accountInfoForm" onsubmit="window.submitProfileUpdate(event)">
        <div class="info-banner" style="margin-bottom: 16px;">
          <i class="fas fa-user-edit"></i>
          <strong>Update your account information below.</strong>
        </div>
        <div class="form-group">
          <label>Username <span class="text-danger">*</span></label>
          <input type="text" id="aiUsername" value="${u.username || ''}" required placeholder="Enter username">
        </div>
        <div class="form-group">
          <label>Full Name <span class="text-danger">*</span></label>
          <input type="text" id="aiFullName" value="${u.name || ''}" required placeholder="Enter full name">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="aiEmail" value="${u.email || ''}" placeholder="Enter email address">
        </div>
        <div class="form-group">
          <label>Department / Division</label>
          <select id="aiDeptId">${deptOptions}</select>
        </div>
        <div class="view-details" style="margin-top: 12px;">
          <div class="detail-row"><label>Role:</label><span>${(u.roles || [u.role]).map(r => formatRole(r)).join(', ')}</span></div>
          <div class="detail-row"><label>User ID:</label><span>${u.id || '-'}</span></div>
        </div>
        <div id="aiError" class="auth-alert auth-alert-error" style="display:none;"></div>
        <div id="aiSuccess" class="auth-alert auth-alert-success" style="display:none;"></div>
        <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:18px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="button" class="btn btn-secondary" onclick="closeModal(); window.showChangePasswordModal();"><i class="fas fa-key"></i> Change Password</button>
          <button type="submit" class="btn btn-primary" id="aiSubmitBtn"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>
    `;
    openModal('Account Information', html);
  };

  // Submit profile update
  window.submitProfileUpdate = async function(e) {
    e.preventDefault();
    const username = document.getElementById('aiUsername').value.trim();
    const fullName = document.getElementById('aiFullName').value.trim();
    const email = document.getElementById('aiEmail').value.trim();
    const deptId = document.getElementById('aiDeptId').value;
    const errorEl = document.getElementById('aiError');
    const successEl = document.getElementById('aiSuccess');
    const submitBtn = document.getElementById('aiSubmitBtn');

    errorEl.style.display = 'none';
    successEl.style.display = 'none';

    if (!username || !fullName) {
      errorEl.textContent = 'Username and full name are required.';
      errorEl.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
      const updated = await apiRequest('/auth/profile', 'PUT', {
        username: username,
        full_name: fullName,
        email: email || null,
        dept_id: deptId ? parseInt(deptId) : null
      });

      // Update currentUser with new data
      currentUser.username = updated.username;
      currentUser.name = updated.full_name;
      currentUser.email = updated.email || '';
      currentUser.dept_id = updated.dept_id || null;
      currentUser.department = updated.department_name || '';
      currentUser.department_code = updated.department_code || '';
      currentUser.division = updated.department_code || updated.department_name || '';

      // Persist to sessionStorage
      sessionStorage.setItem('dmw_user', JSON.stringify(currentUser));

      // Update sidebar display
      if (userNameEl) userNameEl.textContent = currentUser.name;
      if (userRoleEl) {
        const div = currentUser.department_code || currentUser.division || '';
        const designation = currentUser.designation || '';
        let roleText;
        if (designation) {
          roleText = designation;
        } else {
          roleText = (currentUser.roles || [currentUser.role]).map(r => formatRole(r)).join(' / ');
        }
        userRoleEl.textContent = roleText + (div ? ' - ' + div : '');
      }
      const avatarEl = document.getElementById('userAvatarInitials');
      if (avatarEl && currentUser.name) {
        const parts = currentUser.name.trim().split(/\s+/);
        const initials = parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : parts[0].substring(0, 2).toUpperCase();
        avatarEl.textContent = initials;
      }

      successEl.textContent = 'Profile updated successfully!';
      successEl.style.display = 'block';
      submitBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';

      setTimeout(() => { closeModal(); }, 1500);
    } catch (err) {
      errorEl.textContent = err.message || 'Failed to update profile.';
      errorEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
    }
  };

  // Toggle password visibility
  window.togglePasswordVisibility = function(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      input.type = 'password';
      btn.innerHTML = '<i class="fas fa-eye"></i>';
    }
  };

  // Submit change password
  window.submitChangePassword = async function(e) {
    e.preventDefault();
    const currentPw = document.getElementById('cpCurrentPassword').value;
    const newPw = document.getElementById('cpNewPassword').value;
    const confirmPw = document.getElementById('cpConfirmPassword').value;
    const errorEl = document.getElementById('cpError');
    const successEl = document.getElementById('cpSuccess');
    const submitBtn = document.getElementById('cpSubmitBtn');

    // Reset alerts
    errorEl.style.display = 'none';
    successEl.style.display = 'none';

    // Validate
    if (newPw.length < 6) {
      errorEl.textContent = 'New password must be at least 6 characters.';
      errorEl.style.display = 'block';
      return;
    }
    if (newPw !== confirmPw) {
      errorEl.textContent = 'New password and confirmation do not match.';
      errorEl.style.display = 'block';
      return;
    }
    if (currentPw === newPw) {
      errorEl.textContent = 'New password must be different from current password.';
      errorEl.style.display = 'block';
      return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

    try {
      await apiRequest('/auth/change-password', 'PUT', {
        current_password: currentPw,
        new_password: newPw
      });
      successEl.textContent = 'Password changed successfully!';
      successEl.style.display = 'block';
      errorEl.style.display = 'none';
      submitBtn.innerHTML = '<i class="fas fa-check"></i> Updated!';

      // Auto-close after 1.5s
      setTimeout(() => closeModal(), 1500);
    } catch (err) {
      errorEl.textContent = err.message || 'Failed to change password. Please try again.';
      errorEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Password';
    }
  };

  // Handle logout
  function handleLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Show spinner on logout button
    if (logoutBtn) {
      logoutBtn.disabled = true;
      logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Logging out...</span>';
    }

    // Brief delay so user sees the loading state
    setTimeout(() => {
      // Clear session data
      currentUser = { name: '', role: '', division: '' };
      authToken = null;
      sessionStorage.removeItem('dmw_user');
      sessionStorage.removeItem('dmw_token');

      // Stop notification polling
      stopNotificationPolling();

      // Show login overlay
      if (loginOverlay) {
        loginOverlay.style.display = 'flex';
        loginOverlay.classList.remove('hidden');
      }
      // Reset form
      if (loginForm) {
        loginForm.reset();
      }
      // Clear any error messages
      const loginError = document.getElementById('loginError');
      if (loginError) loginError.style.display = 'none';

      // Restore logout button
      if (logoutBtn) {
        logoutBtn.disabled = false;
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i><span>Logout</span>';
      }
    }, 800);
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

  // Alias for report functions that use showModal
  const showModal = openModal;

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

  // =====================================================
  // FILE ATTACHMENT UPLOAD/DOWNLOAD HELPERS
  // =====================================================

  /**
   * Upload files from one or more <input type="file"> elements to the server
   * and link them to a specific entity.
   * @param {string} entityType - e.g. 'PR', 'RFQ', 'PO', 'IAR', 'PPMP', 'Supplier', 'Abstract', 'NOA', 'BAC_Resolution', 'PostQual', 'COA'
   * @param {number|string} entityId - the record ID
   * @param {Array<{inputId: string, description: string}>} fileInputs - array of input IDs + descriptions
   * @returns {Promise<Array>} - array of uploaded attachment objects
   */
  window.uploadAttachments = async function(entityType, entityId, fileInputs) {
    const formData = new FormData();
    formData.append('entity_type', entityType);
    formData.append('entity_id', entityId);

    let hasFiles = false;
    for (const fi of fileInputs) {
      const input = document.getElementById(fi.inputId);
      if (input && input.files && input.files.length > 0) {
        for (let i = 0; i < input.files.length; i++) {
          formData.append('files', input.files[i]);
        }
        formData.append('description', fi.description || '');
        hasFiles = true;
      }
    }

    if (!hasFiles) return []; // No files selected, skip silently

    try {
      const headers = {};
      if (authToken) headers['Authorization'] = 'Bearer ' + authToken;
      const response = await fetch(API_URL + '/attachments/upload', {
        method: 'POST',
        headers,
        body: formData
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Upload failed');
      }
      const result = await response.json();
      return result.attachments || [];
    } catch (err) {
      console.error('File upload error:', err);
      showNotification('File upload error: ' + err.message, 'error');
      return [];
    }
  };

  /**
   * Fetch attachments for an entity and return them
   */
  window.getAttachments = async function(entityType, entityId) {
    try {
      const headers = {};
      if (authToken) headers['Authorization'] = 'Bearer ' + authToken;
      const response = await fetch(API_URL + '/attachments/' + entityType + '/' + entityId, { headers });
      if (!response.ok) return [];
      return await response.json();
    } catch (err) {
      console.error('Get attachments error:', err);
      return [];
    }
  };

  /**
   * Delete an attachment by ID
   */
  window.deleteAttachment = async function(attachmentId) {
    if (!confirm('Are you sure you want to delete this attachment?')) return false;
    try {
      const headers = {};
      if (authToken) headers['Authorization'] = 'Bearer ' + authToken;
      const response = await fetch(API_URL + '/attachments/' + attachmentId, { method: 'DELETE', headers });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Delete failed');
      }
      showNotification('Attachment deleted', 'success');
      return true;
    } catch (err) {
      showNotification('Delete error: ' + err.message, 'error');
      return false;
    }
  };

  // =====================================================
  // ATTACHMENT HELPER UTILITIES
  // =====================================================

  function attGetIcon(mime) {
    if (mime === 'application/pdf') return 'fa-file-pdf';
    if (mime && mime.includes('word')) return 'fa-file-word';
    if (mime && (mime.includes('excel') || mime.includes('spreadsheet'))) return 'fa-file-excel';
    if (mime && mime.startsWith('image/')) return 'fa-file-image';
    return 'fa-file';
  }

  function attGetColor(mime) {
    if (mime === 'application/pdf') return '#e74c3c';
    if (mime && mime.includes('word')) return '#2b5797';
    if (mime && (mime.includes('excel') || mime.includes('spreadsheet'))) return '#217346';
    if (mime && mime.startsWith('image/')) return '#f39c12';
    return '#666';
  }

  function attFormatSize(bytes) {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  /**
   * Preview an attachment in a native viewer window (same as Document Monitoring page).
   * PDFs open in Chromium's built-in PDF viewer with page thumbnails, zoom, print, download.
   * Images open directly in their own window. Word/Excel trigger a download.
   * The window title shows the actual filename (not a number).
   */
  window.previewAttachment = function(attId, originalName, mimeType) {
    // Build URL with filename appended so the window title / tab shows the real name
    const viewUrl = API_URL + '/attachments/view/' + attId + '/' + encodeURIComponent(originalName);
    const downloadUrl = API_URL + '/attachments/download/' + attId;

    if (mimeType === 'application/pdf' || (mimeType && mimeType.startsWith('image/'))) {
      // Open directly in a native BrowserWindow — Chromium renders PDF with built-in viewer
      ipcRenderer.invoke('show-attachment-preview', viewUrl, originalName).catch(err => {
        console.error('Attachment preview error:', err);
        window.open(viewUrl, '_blank');
      });
    } else {
      // Word / Excel / other — direct download
      window.open(downloadUrl, '_blank');
    }
  };

  /**
   * Render an attachments list with download/view/delete buttons
   * @param {Array} attachments - from getAttachments()
   * @param {string} containerId - DOM element ID to inject the list into
   * @param {boolean} allowDelete - show delete button
   */
  window.renderAttachmentsList = function(attachments, containerId, allowDelete = true) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!attachments || attachments.length === 0) {
      container.innerHTML = '<p style="color:#888;font-style:italic;font-size:12px;margin:4px 0;"><i class="fas fa-inbox" style="margin-right:4px;"></i>No files attached yet.</p>';
      return;
    }

    let html = `<div style="margin-bottom:4px;display:flex;align-items:center;gap:6px;">
      <span style="font-size:11px;font-weight:600;color:#2d3748;"><i class="fas fa-paperclip" style="margin-right:3px;"></i>${attachments.length} file${attachments.length > 1 ? 's' : ''} attached</span>
    </div>`;
    html += '<div style="display:flex;flex-direction:column;gap:5px;">';
    for (const att of attachments) {
      const canPreview = att.mime_type === 'application/pdf' || (att.mime_type && att.mime_type.startsWith('image/'));
      html += `
        <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:#f8f9fa;border:1px solid #e2e8f0;border-radius:6px;transition:background 0.15s;" onmouseover="this.style.background='#edf2f7'" onmouseout="this.style.background='#f8f9fa'">
          <i class="fas ${attGetIcon(att.mime_type)}" style="font-size:18px;color:${attGetColor(att.mime_type)};flex-shrink:0;"></i>
          <div style="flex:1;min-width:0;">
            <div style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#2d3748;" title="${att.original_name}">${att.original_name}</div>
            <div style="font-size:10px;color:#718096;">${attFormatSize(att.file_size_bytes)} &bull; ${new Date(att.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
          </div>
          <button class="btn-icon" title="Preview / View" onclick="previewAttachment(${att.id}, '${(att.original_name || '').replace(/'/g, "\\'")}', '${att.mime_type}')" style="padding:4px 6px;color:#3182ce;">
            <i class="fas fa-eye" style="font-size:12px;"></i>
          </button>
          <button class="btn-icon" title="Download" onclick="window.open('${API_URL}/attachments/download/${att.id}', '_blank')" style="padding:4px 6px;color:#38a169;">
            <i class="fas fa-download" style="font-size:12px;"></i>
          </button>
          ${allowDelete ? `<button class="btn-icon" title="Delete" onclick="deleteAttachmentAndRefresh(${att.id}, '${containerId}', '${att.entity_type || ''}', ${att.entity_id || 0})" style="padding:4px 6px;color:#e53e3e;">
            <i class="fas fa-trash" style="font-size:12px;"></i>
          </button>` : ''}
        </div>
      `;
    }
    html += '</div>';
    container.innerHTML = html;
  };

  /**
   * Delete attachment and refresh the list
   */
  window.deleteAttachmentAndRefresh = async function(attachmentId, containerId, entityType, entityId) {
    const deleted = await deleteAttachment(attachmentId);
    if (deleted && entityType && entityId) {
      const attachments = await getAttachments(entityType, entityId);
      renderAttachmentsList(attachments, containerId, true);
    }
  };

  /**
   * Render a read-only attachments list (for view modals — no delete, no upload)
   */
  window.renderViewAttachmentsList = function(attachments, containerId) {
    renderAttachmentsList(attachments, containerId, false);
  };

  /**
   * Generate a view-only attachment section HTML that auto-loads files
   * Used in View modals so chiefs/HoPe/BAC can see attached files
   */
  window.getViewAttachmentSectionHTML = function(entityType, entityId, containerId) {
    if (!containerId) containerId = 'viewAtt_' + entityType + '_' + entityId;
    // Schedule loading attachments after modal renders
    setTimeout(async () => {
      try {
        const attachments = await getAttachments(entityType, entityId);
        renderViewAttachmentsList(attachments, containerId);
      } catch (e) { console.warn('Could not load attachments:', e); }
    }, 150);
    return `
      <div style="margin-top:14px;">
        <h4 style="margin:0 0 8px;font-size:13px;color:#1a365d;border-bottom:2px solid var(--primary-color);padding-bottom:4px;">
          <i class="fas fa-paperclip" style="margin-right:4px;"></i> Attached Files
        </h4>
        <div id="${containerId}" style="min-height:30px;">
          <small style="color:#888;"><i class="fas fa-spinner fa-spin"></i> Loading attachments...</small>
        </div>
      </div>`;
  };

  /**
   * Generate an attachment section HTML for edit modals and auto-load existing attachments
   * Supports uploading additional files (additive, never replaces)
   */
  window.getEditAttachmentSectionHTML = function(entityType, entityId, fileInputId) {
    const containerId = fileInputId + 'List';
    // Schedule loading existing attachments after modal renders
    setTimeout(async () => {
      try {
        const attachments = await getAttachments(entityType, entityId);
        renderAttachmentsList(attachments, containerId, true);
      } catch(e) { console.warn('Could not load attachments:', e); }
    }, 150);
    return `
      <div class="form-section-header"><i class="fas fa-paperclip"></i> Attachments</div>
      <div style="padding:12px 14px;border-bottom:1px solid var(--border-color);">
        <div id="${containerId}" style="margin-bottom:12px;">
          <small style="color:#888;"><i class="fas fa-spinner fa-spin"></i> Loading existing attachments...</small>
        </div>
        <div class="attachment-box" style="background:#f0f4ff;padding:10px;border-radius:6px;border:2px dashed #64b5f6;">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="file" id="${fileInputId}" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" multiple style="display:none;" onchange="updateFileLabel(this, '${fileInputId}Label')">
            <span class="btn btn-sm btn-primary"><i class="fas fa-plus"></i> Add More Files</span>
            <span id="${fileInputId}Label" style="font-size:12px;color:#666;">Select files to attach</span>
          </label>
          <small style="color:#546e7a;">PDF, Word, Excel, or image files. Max 25MB each. New files will be added alongside existing ones.</small>
        </div>
      </div>`;
  };

  /**
   * Upload new files from an edit modal's file input (additive — appends to existing)
   */
  window.uploadEditAttachments = async function(entityType, entityId, fileInputId) {
    const input = document.getElementById(fileInputId);
    if (input && input.files && input.files.length > 0) {
      await uploadAttachments(entityType, entityId, [
        { inputId: fileInputId, description: entityType + ' attachment' }
      ]);
    }
  };

  // ==================== INLINE TABLE ATTACHMENT CELL SYSTEM ====================

  /**
   * Returns HTML for an attachment cell in a data table row.
   * Shows a clickable icon that opens a popover to view/upload/delete attachments.
   * @param {string} entityType - e.g. 'plan', 'purchase_request', 'rfq', etc.
   * @param {number} entityId - the record's primary key
   * @returns {string} <td> inner HTML
   */
  window.renderAttachmentCell = function(entityType, entityId) {
    const uid = entityType + '_' + entityId;
    return `<td class="text-center" style="position:relative;">
      <button class="btn-attachment-cell" id="attBtn_${uid}" onclick="toggleAttachmentPopover('${entityType}', ${entityId}, this)" title="View / Upload Attachments">
        <i class="fas fa-paperclip"></i>
        <span class="att-count-badge" id="attCount_${uid}"></span>
      </button>
    </td>`;
  };

  /**
   * Toggle the inline attachment popover for a table cell
   */
  window.toggleAttachmentPopover = function(entityType, entityId, btnEl) {
    const uid = entityType + '_' + entityId;
    const existingPopover = document.getElementById('attPopover_' + uid);
    
    // Close any other open popovers first
    document.querySelectorAll('.att-popover').forEach(el => el.remove());
    
    if (existingPopover) {
      existingPopover.remove();
      return;
    }

    const popover = document.createElement('div');
    popover.className = 'att-popover';
    popover.id = 'attPopover_' + uid;
    popover.innerHTML = `
      <div class="att-popover-header">
        <span><i class="fas fa-paperclip"></i> Attachments</span>
        <button class="att-popover-close" onclick="document.getElementById('attPopover_${uid}').remove()"><i class="fas fa-times"></i></button>
      </div>
      <div class="att-popover-body" id="attPopList_${uid}">
        <div style="text-align:center;padding:10px;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>
      </div>
      <div class="att-popover-upload">
        <label class="att-upload-label">
          <input type="file" id="attUpload_${uid}" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" multiple style="display:none;"
            onchange="handleTableCellUpload('${entityType}', ${entityId}, '${uid}')">
          <span><i class="fas fa-upload"></i> Upload Files</span>
        </label>
      </div>
    `;

    // Position the popover near the button
    btnEl.closest('td').appendChild(popover);
    
    // Load existing attachments
    loadPopoverAttachments(entityType, entityId, uid);
  };

  /**
   * Load and render attachments inside a popover
   */
  window.loadPopoverAttachments = async function(entityType, entityId, uid) {
    const container = document.getElementById('attPopList_' + uid);
    if (!container) return;
    
    try {
      const attachments = await getAttachments(entityType, entityId);
      updateAttachmentCountBadge(uid, attachments.length);
      
      if (!attachments.length) {
        container.innerHTML = '<div style="text-align:center;padding:10px;color:#888;font-size:12px;">No attachments yet</div>';
        return;
      }

      const getIcon = (mime) => {
        if (mime === 'application/pdf') return 'fa-file-pdf';
        if (mime && mime.includes('word')) return 'fa-file-word';
        if (mime && (mime.includes('excel') || mime.includes('spreadsheet'))) return 'fa-file-excel';
        if (mime && mime.startsWith('image/')) return 'fa-file-image';
        return 'fa-file';
      };
      const getColor = (mime) => {
        if (mime === 'application/pdf') return '#e74c3c';
        if (mime && mime.includes('word')) return '#2b5797';
        if (mime && (mime.includes('excel') || mime.includes('spreadsheet'))) return '#217346';
        if (mime && mime.startsWith('image/')) return '#f39c12';
        return '#666';
      };
      const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
      };

      let html = '';
      for (const att of attachments) {
        html += `<div class="att-popover-item">
          <i class="fas ${getIcon(att.mime_type)}" style="color:${getColor(att.mime_type)};font-size:14px;"></i>
          <div class="att-popover-item-info">
            <div class="att-popover-item-name" title="${att.original_name}">${att.original_name}</div>
            <div class="att-popover-item-meta">${formatSize(att.file_size_bytes)}</div>
          </div>
          <div class="att-popover-item-actions">
            <button title="Download" onclick="window.open('${API_URL}/attachments/download/${att.id}','_blank')"><i class="fas fa-download"></i></button>
            <button title="View" onclick="window.open('${API_URL}/attachments/view/${att.id}','_blank')"><i class="fas fa-eye"></i></button>
            <button title="Delete" class="danger" onclick="deletePopoverAttachment(${att.id},'${entityType}',${entityId},'${uid}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
      }
      container.innerHTML = html;
    } catch(e) {
      container.innerHTML = '<div style="color:red;padding:8px;font-size:12px;">Error loading</div>';
    }
  };

  /**
   * Handle file upload from a table cell popover
   */
  window.handleTableCellUpload = async function(entityType, entityId, uid) {
    const input = document.getElementById('attUpload_' + uid);
    if (!input || !input.files || !input.files.length) return;

    const formData = new FormData();
    formData.append('entity_type', entityType);
    formData.append('entity_id', entityId);
    formData.append('description', entityType + ' supporting document');
    for (let i = 0; i < input.files.length; i++) {
      formData.append('files', input.files[i]);
    }

    try {
      const response = await fetch(API_URL + '/attachments/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Upload failed');
      }
      showNotification('Files uploaded successfully!', 'success');
      input.value = '';
      // Refresh the popover list
      await loadPopoverAttachments(entityType, entityId, uid);
    } catch(err) {
      showNotification('Upload failed: ' + err.message, 'error');
    }
  };

  /**
   * Delete an attachment from a popover and refresh the list
   */
  window.deletePopoverAttachment = async function(attachmentId, entityType, entityId, uid) {
    if (!confirm('Delete this attachment?')) return;
    try {
      const response = await fetch(API_URL + '/attachments/' + attachmentId, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      showNotification('Attachment deleted', 'success');
      await loadPopoverAttachments(entityType, entityId, uid);
    } catch(err) {
      showNotification('Delete error: ' + err.message, 'error');
    }
  };

  /**
   * Update the count badge on an attachment button
   */
  window.updateAttachmentCountBadge = function(uid, count) {
    const badge = document.getElementById('attCount_' + uid);
    if (badge) {
      badge.textContent = count > 0 ? count : '';
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  };

  /**
   * After a table is rendered, load the attachment counts for all visible cells.
   * Call with the entityType and array of IDs.
   */
  window.loadAttachmentCounts = async function(entityType, ids) {
    for (const id of ids) {
      const uid = entityType + '_' + id;
      try {
        const attachments = await getAttachments(entityType, id);
        updateAttachmentCountBadge(uid, attachments.length);
      } catch(e) { /* silent */ }
    }
  };

  // Close popovers when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.att-popover') && !e.target.closest('.btn-attachment-cell')) {
      document.querySelectorAll('.att-popover').forEach(el => el.remove());
    }
  });

  // ==================== END ATTACHMENT CELL SYSTEM ====================

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
  window.showNewPPMPModal = async function() {
    // Only 4 chief accounts + admin can submit PPMPs
    const allowedCreators = ['chief_fad', 'chief_wrsd', 'chief_mwpsd', 'chief_mwptd', 'admin'];
    if (!userHasAnyRole(allowedCreators)) {
      alert('Only Division Chiefs (FAD, WRSD, MWPSD, MWPTD) can submit PPMP entries.');
      return;
    }
    // Ensure divisions, procurement modes, items, and UOMs are loaded
    await Promise.all([ensureDivisionsLoaded(), ensureProcModesLoaded()]);
    let allItems = [];
    try { allItems = await apiRequest('/items'); } catch(e) { console.warn('Could not load items'); }

    // Build category filter from items catalog categories only
    const itemCats = [...new Set(allItems.map(i => i.category).filter(Boolean))].sort();
    const categoryOptions = itemCats.map(c => `<option value="${c}">${c}</option>`).join('');

    const chiefRoles = ['chief_fad', 'chief_wrsd', 'chief_mwpsd', 'chief_mwptd'];
    const isChief = userHasAnyRole(chiefRoles);
    const chiefDivision = currentUser.division || currentUser.department_code || '';
    
    const html = `
      <form id="ppmpForm" onsubmit="saveNewPPMP(event)">
        <div class="info-banner" style="margin-bottom: 16px; background: #ebf5fb; border-left: 4px solid #1a365d; padding: 10px 14px;">
          <i class="fas fa-info-circle" style="color: #1a365d;"></i>
          <strong>PROJECT PROCUREMENT MANAGEMENT PLAN (PPMP)</strong><br>
          <small style="color: #555;">Per NGPA Form — RA 12009 IRR Section 7.7.2</small>
        </div>

        <div class="form-row-3">
          <div class="form-group">
            <label>PPMP No. <small style="color:#999;">(auto)</small></label>
            <input type="text" id="ppmpNumber" value="" readonly style="background:#f0f0f0; color:#555;">
          </div>
          <div class="form-group">
            <label>Fiscal Year <span class="text-danger">*</span></label>
            <select class="form-select" id="ppmpFiscalYear" required onchange="generatePPMPNumber()">
              ${getFiscalYearOptions('CY')}
            </select>
          </div>
          <div class="form-group">
            <label>End-User / Division <span class="text-danger">*</span></label>
            <select class="form-select" id="ppmpDivisionSelect" required ${isChief ? 'disabled' : ''} onchange="generatePPMPNumber()">
              ${buildDivisionOptions(isChief ? chiefDivision : '')}
            </select>
            ${isChief ? '<input type="hidden" name="division" value="' + chiefDivision + '">' : ''}
          </div>
        </div>

        <div class="form-group">
          <label>Plan Type</label>
          <div style="display:flex; gap:24px; align-items:center; padding: 6px 0; margin-left: 16px;">
            <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:13px;">
              <input type="checkbox" id="ppmpIndicative"> INDICATIVE
            </label>
            <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:13px;">
              <input type="checkbox" id="ppmpFinal"> FINAL
            </label>
          </div>
        </div>

        <div class="form-section-header"><i class="fas fa-layer-group"></i> Items from Catalog</div>
        <div class="form-row-3">
          <div class="form-group">
            <label>Section <span class="text-danger">*</span></label>
            <select class="form-select" id="ppmpSection" required>
              <option value="OFFICE OPERATION">OFFICE OPERATION</option>
              <option value="SEMI- FURNITURE & FIXTURES">SEMI- FURNITURE & FIXTURES</option>
              <option value="TRAININGS & ACTIVITIES">TRAININGS & ACTIVITIES</option>
              <option value="CAPITAL OUTLAY">CAPITAL OUTLAY</option>
              <option value="GENERAL PROCUREMENT" selected>GENERAL PROCUREMENT</option>
            </select>
          </div>
          <div class="form-group">
            <label>Filter by Category <small style="color:#999;">(narrows item list)</small></label>
            <select class="form-select" id="ppmpCategoryFilterModal" onchange="filterPPMPItemsByCategory(this.value)">
              <option value="">-- All Categories --</option>
              ${categoryOptions}
            </select>
          </div>
          <div class="form-group">
            <label>Select Item to Add</label>
            <select class="form-select" id="ppmpItemSelect">
              <option value="">-- Select Item --</option>
              ${allItems.map(i => '<option value="' + i.id + '" data-unit="' + (i.unit || '') + '" data-price="' + (i.unit_price || 0) + '" data-desc="' + (i.description || '').replace(/"/g, '&quot;') + '" data-name="' + (i.name || '').replace(/"/g, '&quot;') + '" data-category="' + (i.category || '').replace(/"/g, '&quot;') + '">' + i.code + ' - ' + i.name + ' (' + (i.unit || '') + ')</option>').join('')}
            </select>
          </div>
        </div>
        <div style="margin-bottom:12px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="addPPMPItemToList()" style="padding:6px 16px;">
            <i class="fas fa-plus"></i> Add Item to List
          </button>
          <span id="ppmpItemCount" style="margin-left:12px; font-size:12px; color:#4a5568;"></span>
        </div>
        <div id="ppmpItemsListContainer" style="max-height:250px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:6px; margin-bottom:16px; display:none;">
          <table class="data-table full-width" style="font-size:11.5px; margin:0;">
            <thead><tr style="background:#f7fafc; position:sticky; top:0; z-index:1;">
              <th style="width:30px;">#</th>
              <th>Item Name</th>
              <th>Description</th>
              <th style="width:60px;">Unit</th>
              <th style="width:90px;">Unit Price</th>
              <th style="width:80px;">Qty</th>
              <th style="width:90px;">Budget</th>
              <th style="width:40px;"></th>
            </tr></thead>
            <tbody id="ppmpItemsListBody"></tbody>
          </table>
        </div>
        <input type="hidden" id="ppmpCategory" value="">

        <div class="form-section-header"><i class="fas fa-clipboard-list"></i> Common Procurement Details</div>

        <div class="form-row">
          <div class="form-group">
            <label>Type of Project <span class="text-danger">*</span></label>
            <select class="form-select" id="ppmpProjectType" required>
              <option value="Goods">Goods</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Consulting Services">Consulting Services</option>
            </select>
          </div>
          <div class="form-group">
            <label>Mode of Procurement <span class="text-danger">*</span></label>
            <select class="form-select" id="ppmpProcMode" required>
              ${buildProcModeOptions('Small Value Procurement')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Pre-Procurement Conference</label>
            <select class="form-select" id="ppmpPreProc">
              <option value="NO">NO</option>
              <option value="YES">YES</option>
            </select>
          </div>
          <div class="form-group">
            <label>Source of Funds <span class="text-danger">*</span></label>
            <select class="form-select" id="ppmpFundSource" required>
              <option value="GAA ${getCurrentFiscalYear()} - Current Appropriation" selected>GAA ${getCurrentFiscalYear()} - Current Appropriation</option>
              <option value="GAA ${getCurrentFiscalYear()}">GAA ${getCurrentFiscalYear()}</option>
              <option value="GAA">GAA</option>
              <option value="Special Fund">Special Fund</option>
            </select>
          </div>
        </div>

        <div class="form-section-header section-timeline"><i class="fas fa-calendar-alt"></i> Projected Timeline (MM/YYYY)</div>
        <div class="form-row-3">
          <div class="form-group">
            <label>Start of Procurement <span class="text-danger">*</span></label>
            <input type="month" id="ppmpStartDate" required>
          </div>
          <div class="form-group">
            <label>End of Procurement <span class="text-danger">*</span></label>
            <input type="month" id="ppmpEndDate" required>
          </div>
          <div class="form-group">
            <label>Expected Delivery <span class="text-danger">*</span></label>
            <input type="month" id="ppmpDeliveryPeriod" required>
          </div>
        </div>

        <div class="form-section-header"><i class="fas fa-paperclip"></i> Attachments & Remarks</div>
        <div class="form-group">
          <label>Supporting Documents <small style="color:#999;">(optional)</small></label>
          <div style="display:flex; align-items:center; gap:10px;">
            <label class="btn btn-sm btn-outline" style="cursor:pointer; display:inline-flex; align-items:center; gap:6px; border:1px solid #ccc; padding:6px 12px; border-radius:4px;">
              <i class="fas fa-paperclip"></i> Choose File
              <input type="file" id="ppmpAttachment" accept=".pdf,.doc,.docx,.xls,.xlsx" style="display:none;" onchange="updateFileLabel(this, 'ppmpFileLabel')">
            </label>
            <span id="ppmpFileLabel" style="font-size:12px; color:#888;">No file selected</span>
          </div>
        </div>
        <div class="form-group">
          <label>Remarks</label>
          <textarea rows="2" id="ppmpRemarks" placeholder="Additional remarks (optional)"></textarea>
        </div>

        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <div id="ppmpTotalDisplay" style="display:inline-block; margin-right:20px; font-size:14px; font-weight:700; color:#1a365d;"></div>
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save PPMP Entries</button>
        </div>
      </form>
    `;
    openModal('New PPMP Entry', html);
    // Store items data for dropdown filtering
    window._ppmpItemsCache = allItems;
    // Initialize the items list
    window._ppmpSelectedItems = [];
    // Auto-generate PPMP number if division is pre-selected (chief)
    if (isChief && chiefDivision) generatePPMPNumber();
  };

  window.showNewPRModal = async function() {
    // Fetch APP items for validation
    let appItems = [];
    try { appItems = await apiRequest('/plan-items'); } catch(e) { console.warn('Could not load APP items:', e); }

    const appOptions = appItems.map(item => {
      const desc = (item.description || item.item_description || '').substring(0, 60);
      const dept = item.department_code || '';
      return `<option value="${item.id}" data-desc="${desc}" data-dept="${dept}">${desc} (${dept} - FY${item.fiscal_year || String(getCurrentFiscalYear())})</option>`;
    }).join('');

    const html = `
      <form id="prForm" onsubmit="saveNewPR(event)">
        <div class="info-banner" style="margin-bottom: 0;">
          <i class="fas fa-file-alt"></i>
          <strong>PURCHASE REQUEST</strong> — Per Government PR Form
        </div>

        <!-- APP/PPMP Validation Section -->
        <div class="form-validation-section">
          <label style="font-weight:700;color:#1a365d;display:block;margin-bottom:6px;">
            <i class="fas fa-clipboard-check" style="margin-right:4px;"></i> APP / PPMP Reference <span style="color:#e53e3e;">*</span>
          </label>
          <p style="font-size:11px;color:#4a5568;margin-bottom:8px;">Select the APP item this Purchase Request is based on. Items must exist in the approved APP before a PR can proceed.</p>
          <select id="prAppItemSelect" class="form-select" style="width:100%;padding:8px;font-size:13px;border:1px solid #cbd5e0;border-radius:4px;" onchange="validatePRAppItem(this); generatePRNumber(this);">
            <option value="">-- Select APP Item --</option>
            ${appOptions}
            <option value="not-in-app" style="color:#e53e3e;font-weight:600;">⚠ Item NOT in APP (Requires New PPMP)</option>
          </select>
          <div id="prAppValidation" style="display:none;margin-top:10px;"></div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Office/Section</label>
            <input type="text" id="prOffice" value="DMW Caraga" required>
          </div>
          <div class="form-group">
            <label>PR No.</label>
            <input type="text" id="prNumber" placeholder="Select APP item to generate..." readonly>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="prDate" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>

        <div class="form-section-header section-items"><i class="fas fa-list-ol"></i> Item Details</div>
        <div class="form-items-section">
          <table class="data-table" style="font-size: 12px; margin-bottom: 10px;">
            <thead>
              <tr>
                <th style="width: 60px;">Item No.</th>
                <th style="width: 80px;">Unit</th>
                <th>Item Description</th>
                <th style="width: 80px;">Quantity</th>
                <th style="width: 110px;">Unit Cost</th>
                <th style="width: 110px;">Total Cost</th>
              </tr>
            </thead>
            <tbody id="prItemsBody">
              <tr>
                <td><input type="number" value="1" style="width: 50px;" readonly></td>
                <td>
                  <select class="form-select" style="width: 75px;">
                    <option value="Lot">Lot</option>
                    <option value="Pax">Pax</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Unit">Unit</option>
                    <option value="Sq.ft">Sq.ft</option>
                    <option value="Gal">Gal</option>
                    <option value="Ltrs">Ltrs</option>
                    <option value="Box">Box</option>
                    <option value="Ream">Ream</option>
                    <option value="Set">Set</option>
                  </select>
                </td>
                <td><textarea rows="2" placeholder="Item description, specifications, duration, notes..." style="width: 100%;"></textarea></td>
                <td><input type="number" placeholder="0" style="width: 70px;" min="0" onchange="calculatePRItemTotal(this)"></td>
                <td><input type="number" placeholder="0.00" step="0.01" style="width: 100px;" min="0" onchange="calculatePRItemTotal(this)"></td>
                <td><input type="number" placeholder="0.00" step="0.01" style="width: 100px;" readonly></td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5" style="text-align: right; font-weight: bold;">TOTAL AMOUNT</td>
                <td><strong id="prTotalAmount">₱0.00</strong></td>
              </tr>
            </tfoot>
          </table>
          <button type="button" class="btn btn-sm btn-outline" onclick="addPRItemRow()"><i class="fas fa-plus"></i> Add Item Row</button>
        </div>
        <div class="form-group">
          <label>Purpose</label>
          <textarea rows="2" id="prPurpose" placeholder="Purpose of the purchase request" required></textarea>
        </div>

        <div class="form-section-header"><i class="fas fa-list-ul"></i> Item Specifications</div>
        <div class="form-group">
          <label>Specifications (one per line)</label>
          <textarea rows="4" id="prItemSpecs" placeholder="Enter item specifications, one per line...
Example:\nSecurity Guard 12hrs shift\nWith complete uniform\nLicensed and bonded"></textarea>
        </div>

        <div class="form-section-header"><i class="fas fa-paperclip"></i> Required Attachments</div>
        <div class="form-attachment-section">
          <div class="attachment-box" style="background: #fff3cd; padding: 12px; border-radius: 6px; border: 2px dashed #ffc107;">
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; display: block;"><i class="fas fa-file-alt"></i> Route Slip / Annex 1</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="prRouteSlip" accept=".pdf,.doc,.docx" style="display: none;" onchange="updateFileLabel(this, 'prRouteSlipLabel')">
                <button type="button" class="btn btn-sm btn-warning" onclick="document.getElementById('prRouteSlip').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="prRouteSlipLabel" style="font-size: 12px; color: #666;">Optional</span>
              </div>
            </div>
            <div>
              <label style="font-weight: 500; display: block;"><i class="fas fa-file-alt"></i> Technical Specifications / TOR</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="prTechSpecs" accept=".pdf,.doc,.docx" style="display: none;" onchange="updateFileLabel(this, 'prTechSpecsLabel')">
                <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('prTechSpecs').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="prTechSpecsLabel" style="font-size: 12px; color: #666;">Optional</span>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-warning"><i class="fas fa-save"></i> Save as Draft</button>
          <button type="button" class="btn btn-primary" onclick="submitPRForApproval()"><i class="fas fa-paper-plane"></i> Submit for Approval</button>
        </div>
      </form>
    `;
    openModal('Create Purchase Request (PR)', html);
  };

  window.addPRItemRow = function() {
    const tbody = document.getElementById('prItemsBody');
    const rowCount = tbody.rows.length + 1;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="number" value="${rowCount}" style="width: 50px;" readonly></td>
      <td>
        <select class="form-select" style="width: 75px;">
          <option value="Lot">Lot</option><option value="Pax">Pax</option><option value="Pcs">Pcs</option>
          <option value="Unit">Unit</option><option value="Sq.ft">Sq.ft</option><option value="Gal">Gal</option>
          <option value="Ltrs">Ltrs</option><option value="Box">Box</option><option value="Ream">Ream</option><option value="Set">Set</option>
        </select>
      </td>
      <td><textarea rows="2" placeholder="Item description..." style="width: 100%;"></textarea></td>
      <td><input type="number" placeholder="0" style="width: 70px;" min="0" onchange="calculatePRItemTotal(this)"></td>
      <td><input type="number" placeholder="0.00" step="0.01" style="width: 100px;" min="0" onchange="calculatePRItemTotal(this)"></td>
      <td><input type="number" placeholder="0.00" step="0.01" style="width: 100px;" readonly></td>
    `;
    tbody.appendChild(row);
  };

  // Validate PR against APP items
  // Generate dynamic PR number: PR-{DEPT}-{YEAR}-{SEQ}
  window.generatePRNumber = async function(select) {
    const prInput = document.getElementById('prNumber');
    if (!prInput) return;
    const val = select.value;
    if (!val || val === 'not-in-app') { prInput.value = ''; return; }
    const opt = select.selectedOptions[0];
    const dept = opt?.getAttribute('data-dept') || '';
    if (!dept) { prInput.value = generateDocNumber('PR'); return; }
    const year = getCurrentFiscalYear();
    try {
      const prs = await apiRequest('/purchase-requests');
      const prefix = 'PR-' + dept + '-' + year + '-';
      let maxSeq = 0;
      prs.forEach(p => {
        if (p.pr_number && p.pr_number.startsWith(prefix)) {
          const seq = parseInt(p.pr_number.replace(prefix, '')) || 0;
          if (seq > maxSeq) maxSeq = seq;
        }
      });
      prInput.value = prefix + String(maxSeq + 1).padStart(3, '0');
    } catch(e) {
      prInput.value = 'PR-' + dept + '-' + year + '-001';
    }
  };

  window.validatePRAppItem = function(select) {
    const validation = document.getElementById('prAppValidation');
    if (!validation) return;
    const val = select.value;
    if (val === 'not-in-app') {
      validation.style.display = 'block';
      validation.innerHTML = `
        <div style="background:#fff5f5;border:2px solid #e53e3e;border-radius:8px;padding:14px;">
          <div style="display:flex;align-items:flex-start;gap:10px;">
            <i class="fas fa-exclamation-triangle" style="color:#e53e3e;font-size:22px;margin-top:2px;"></i>
            <div>
              <div style="font-weight:700;color:#c53030;font-size:14px;margin-bottom:4px;">Item Not Found in APP</div>
              <p style="font-size:12px;color:#4a5568;margin-bottom:10px;">
                This item does not exist in the current Annual Procurement Plan (APP). As Division Head, 
                you must first <strong>endorse a new PPMP entry</strong> for this item. Once the PPMP is approved 
                and included in the APP, you can create a Purchase Request.
              </p>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button type="button" class="btn btn-sm" style="background:#c53030;color:#fff;" onclick="closeModal(); navigateTo('ppmp');">
                  <i class="fas fa-file-alt"></i> Go to PPMP & Create Entry
                </button>
                <button type="button" class="btn btn-sm btn-outline" onclick="closeModal(); navigateTo('app');">
                  <i class="fas fa-clipboard-list"></i> View APP
                </button>
              </div>
            </div>
          </div>
        </div>`;
      // Disable submit buttons
      document.querySelectorAll('#prForm .btn-primary, #prForm .btn-warning').forEach(b => { b.disabled = true; b.style.opacity = '0.5'; });
    } else if (val) {
      validation.style.display = 'block';
      validation.innerHTML = `
        <div style="background:#f0fff4;border:1px solid #38a169;border-radius:6px;padding:10px;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-check-circle" style="color:#38a169;font-size:18px;"></i>
          <span style="color:#276749;font-weight:600;font-size:13px;">Item found in APP — PR can proceed to RFQ after approval.</span>
        </div>`;
      // Re-enable submit buttons
      document.querySelectorAll('#prForm .btn-primary, #prForm .btn-warning').forEach(b => { b.disabled = false; b.style.opacity = '1'; });
    } else {
      validation.style.display = 'none';
      document.querySelectorAll('#prForm .btn-primary, #prForm .btn-warning').forEach(b => { b.disabled = false; b.style.opacity = '1'; });
    }
  };

  window.calculatePRItemTotal = function(el) {
    const row = el.closest('tr');
    const inputs = row.querySelectorAll('input[type="number"]');
    const qty = parseFloat(inputs[1].value) || 0;
    const unitCost = parseFloat(inputs[2].value) || 0;
    inputs[3].value = (qty * unitCost).toFixed(2);
    // Update grand total
    let total = 0;
    document.querySelectorAll('#prItemsBody tr').forEach(r => {
      const cells = r.querySelectorAll('input[type="number"]');
      total += parseFloat(cells[3].value) || 0;
    });
    document.getElementById('prTotalAmount').textContent = '₱' + total.toLocaleString('en-PH', {minimumFractionDigits: 2});
  };

  window.submitPRForApproval = function() {
    if(!validateAttachment('prRouteSlip', 'Route Slip / Annex 1')) return;
    if(confirm('Submit this PR for Division Head approval? Timeline: 5 calendar days for approval.')) {
      alert('PR submitted for Division Head approval. Status: PR For Approval');
      closeModal();
    }
  };

  window.showNewRFQModal = async function(preselectedPrNumber) {
    // Ensure PR data is loaded
    if (!cachedPR || cachedPR.length === 0) { try { cachedPR = await apiRequest('/pr'); } catch(e) {} }
    // Build PR options from cachedPR, sorted alphabetically by PR number
    const sortedPRs = [...(cachedPR || [])].sort((a, b) => (a.pr_number || '').localeCompare(b.pr_number || ''));
    const prOptions = sortedPRs.map(p => {
      const sel = (preselectedPrNumber && (p.pr_number === preselectedPrNumber || String(p.id) === String(preselectedPrNumber))) ? ' selected' : '';
      return `<option value="${p.id}"${sel}>${p.pr_number || ''} — ${(p.purpose || p.first_item_name || '').substring(0,60)} (₱${Number(p.total_amount||0).toLocaleString('en-PH',{minimumFractionDigits:2})})</option>`;
    }).join('');
    const html = `
      <form id="rfqForm" onsubmit="saveNewRFQ(event)">
        <div class="info-banner" style="margin-bottom: 0;">
          <i class="fas fa-file-alt"></i>
          <strong>REQUEST FOR QUOTATION</strong> — Per Government RFQ Form
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>RFQ No.</label>
            <input type="text" id="rfqNumber" value="${generateDocNumber('RFQ')}" readonly>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="rfqDate" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Company Name</label>
          <input type="text" id="rfqCompanyName" placeholder="Company Name (to be filled by supplier)">
        </div>
        <div class="form-group">
          <label>Company Address</label>
          <input type="text" id="rfqCompanyAddress" placeholder="Company Address">
        </div>
        <div class="form-group">
          <label>TIN</label>
          <input type="text" placeholder="Tax Identification Number">
        </div>
        <div class="form-group">
          <label>Linked Purchase Request (Approved)</label>
          <select class="form-select" id="rfqLinkedPR" required onchange="onRFQLinkedPRChange(this.value)">
            <option value="">-- Select Approved PR --</option>
            ${prOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Deadline for Quotation Submission</label>
          <input type="date" id="rfqDeadline" required>
        </div>
        <div class="form-section-header section-items"><i class="fas fa-list-ol"></i> Items</div>
        <div class="form-items-section">
        <table class="data-table" style="font-size: 12px; margin-bottom: 10px;">
          <thead>
            <tr>
              <th style="width: 80px;">Quantity</th>
              <th style="width: 80px;">Unit</th>
              <th>Item (with specification)</th>
              <th style="width: 110px;">ABC</th>
              <th style="width: 110px;">Unit Cost<br><small>(Supplier fills)</small></th>
              <th style="width: 110px;">Total Cost<br><small>(Supplier fills)</small></th>
            </tr>
          </thead>
          <tbody id="rfqItemsBody">
            <tr>
              <td><input type="number" placeholder="0" style="width: 70px;" min="0"></td>
              <td>
                <select class="form-select" style="width: 75px;">
                  <option value="Lot">Lot</option><option value="Pax">Pax</option><option value="Pcs">Pcs</option>
                  <option value="Unit">Unit</option><option value="Sq.ft">Sq.ft</option><option value="Gal">Gal</option>
                  <option value="Ltrs">Ltrs</option><option value="Box">Box</option><option value="Ream">Ream</option><option value="Set">Set</option>
                </select>
              </td>
              <td><textarea rows="2" placeholder="Item description and specifications..." style="width: 100%;"></textarea></td>
              <td><input type="number" id="rfqABC" placeholder="0.00" step="0.01" style="width: 100px;" min="0"></td>
              <td><input type="number" placeholder="0.00" step="0.01" style="width: 100px;" disabled></td>
              <td><input type="number" placeholder="0.00" step="0.01" style="width: 100px;" disabled></td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="btn btn-sm btn-outline" onclick="addRFQItemRow()"><i class="fas fa-plus"></i> Add Item Row</button>
        </div>

        <div class="form-section-header"><i class="fas fa-list-ul"></i> Item Specifications</div>
        <div class="form-group">
          <label>Specifications (one per line)</label>
          <textarea rows="4" id="rfqItemSpecs" placeholder="Enter item specifications, one per line..."></textarea>
        </div>

        <div class="form-section-header"><i class="fas fa-paperclip"></i> Required Attachments</div>
        <div class="form-attachment-section">
          <div class="attachment-box box-blue" style="padding: 12px; border-radius: 6px; border: 2px dashed #2196f3; background: #e3f2fd;">
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; display: block;"><i class="fas fa-file-alt"></i> RFQ Document (Signed)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="rfqDocument" accept=".pdf,.doc,.docx" required style="display: none;" onchange="updateFileLabel(this, 'rfqDocumentLabel')">
                <button type="button" class="btn btn-sm btn-primary" onclick="document.getElementById('rfqDocument').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="rfqDocumentLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div>
              <label style="font-weight: 500; display: block;"><i class="fas fa-file-alt"></i> Technical Specifications / TOR</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="rfqTechSpecs" accept=".pdf,.doc,.docx" style="display: none;" onchange="updateFileLabel(this, 'rfqTechSpecsLabel')">
                <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('rfqTechSpecs').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="rfqTechSpecsLabel" style="font-size: 12px; color: #666;">Optional</span>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-warning"><i class="fas fa-save"></i> Save Draft</button>
          <button type="button" class="btn btn-primary" onclick="sendRFQ()"><i class="fas fa-paper-plane"></i> Send RFQ</button>
        </div>
      </form>
    `;
    openModal('Create Request for Quotation (RFQ)', html);
    // If a PR was preselected, auto-fill items
    if (preselectedPrNumber) {
      const sel = document.getElementById('rfqLinkedPR');
      if (sel && sel.value) onRFQLinkedPRChange(sel.value);
    }
  };

  // When user selects a PR in the RFQ form, auto-fill items from that PR
  window.onRFQLinkedPRChange = async function(prId) {
    if (!prId) return;
    try {
      const pr = await apiRequest('/purchase-requests/' + prId);
      if (!pr) return;
      // Set ABC amount
      const abcInput = document.getElementById('rfqABC');
      if (abcInput) abcInput.value = parseFloat(pr.total_amount || 0).toFixed(2);
      // Populate items table
      const tbody = document.getElementById('rfqItemsBody');
      if (tbody && pr.items && pr.items.length > 0) {
        tbody.innerHTML = '';
        pr.items.forEach((item, idx) => {
          const row = document.createElement('tr');
          const abcId = idx === 0 ? ' id="rfqABC"' : '';
          row.innerHTML = `
            <td><input type="number" value="${item.quantity || 0}" style="width: 70px;" min="0"></td>
            <td>
              <select class="form-select" style="width: 75px;">
                ${['Lot','Pax','Pcs','Unit','Sq.ft','Gal','Ltrs','Box','Ream','Set'].map(u => `<option value="${u}" ${(item.unit||'').toLowerCase() === u.toLowerCase() ? 'selected' : ''}>${u}</option>`).join('')}
              </select>
            </td>
            <td><textarea rows="2" style="width: 100%;">${item.item_description || item.item_name || ''}</textarea></td>
            <td><input type="number"${abcId} value="${parseFloat(item.total_price || item.unit_price || 0).toFixed(2)}" step="0.01" style="width: 100px;" min="0"></td>
            <td><input type="number" placeholder="0.00" step="0.01" style="width: 100px;" disabled></td>
            <td><input type="number" placeholder="0.00" step="0.01" style="width: 100px;" disabled></td>
          `;
          tbody.appendChild(row);
        });
      }
      // Fill item specifications
      const specsField = document.getElementById('rfqItemSpecs');
      if (specsField && pr.item_specifications) specsField.value = pr.item_specifications;
    } catch(e) { console.error('Error loading PR items for RFQ:', e); }
  };

  window.addRFQItemRow = function() {
    const tbody = document.getElementById('rfqItemsBody');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="number" placeholder="0" style="width: 70px;" min="0"></td>
      <td><select class="form-select" style="width: 75px;"><option value="Lot">Lot</option><option value="Pax">Pax</option><option value="Pcs">Pcs</option><option value="Unit">Unit</option><option value="Sq.ft">Sq.ft</option><option value="Gal">Gal</option><option value="Ltrs">Ltrs</option><option value="Box">Box</option><option value="Ream">Ream</option><option value="Set">Set</option></select></td>
      <td><textarea rows="2" placeholder="Item description..." style="width: 100%;"></textarea></td>
      <td><input type="number" placeholder="0.00" step="0.01" style="width: 100px;" min="0"></td>
      <td><input type="number" placeholder="0.00" step="0.01" style="width: 100px;" disabled></td>
      <td><input type="number" placeholder="0.00" step="0.01" style="width: 100px;" disabled></td>
    `;
    tbody.appendChild(row);
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
    // Compute ABC: use #rfqABC if it exists, otherwise sum all item ABC cells in the table
    let abc = 0;
    const abcEl = document.getElementById('rfqABC');
    if (abcEl) {
      abc = parseFloat(abcEl.value) || 0;
    } else {
      const rows = document.getElementById('rfqItemsBody')?.querySelectorAll('tr') || [];
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) abc += parseFloat(cells[3].querySelector('input')?.value) || 0;
      });
    }
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

  window.showNewAbstractModal = async function() {
    // Ensure RFQ data is loaded
    if (!cachedRFQ || cachedRFQ.length === 0) { try { cachedRFQ = await apiRequest('/rfq'); } catch(e) {} }
    // Build RFQ options sorted by rfq_number
    const sortedRFQs = [...(cachedRFQ || [])].sort((a, b) => (a.rfq_number || '').localeCompare(b.rfq_number || ''));
    const rfqOptions = sortedRFQs.map(r => {
      return `<option value="${r.id}">${r.rfq_number || ''} — ${(r.purpose || '').substring(0,50) || 'No purpose'} (ABC: ₱${Number(r.abc_amount||0).toLocaleString('en-PH',{minimumFractionDigits:2})})</option>`;
    }).join('');
    const html = `
      <form id="abstractForm" onsubmit="saveNewAbstract(event)">
        <div class="info-banner" style="margin-bottom: 0;">
          <i class="fas fa-table"></i>
          <strong>ABSTRACT OF QUOTATIONS</strong> — Per Government AOQ Form
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>AOQ No.</label>
            <input type="text" id="abstractNumber" value="${generateDocNumber('AOQ')}" readonly>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="abstractDate" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Linked RFQ</label>
          <select class="form-select" id="abstractLinkedRFQ" required onchange="onAbstractLinkedRFQChange(this.value)">
            <option value="">-- Select RFQ with Quotations Received --</option>
            ${rfqOptions}
          </select>
        </div>
        <div class="form-group">
          <label>PURPOSE</label>
          <textarea rows="2" id="abstractPurpose" placeholder="Auto-filled from linked PR when RFQ is selected..." required></textarea>
        </div>
        <div class="form-section-header section-items"><i class="fas fa-table"></i> Particulars & Supplier Quotations</div>
        <div class="form-items-section">
        <div style="overflow-x: auto;">
          <table class="data-table" style="font-size: 11px; margin-bottom: 10px; min-width: 900px;">
            <thead>
              <tr>
                <th rowspan="2" style="width: 50px;">Qty</th>
                <th rowspan="2" style="width: 50px;">Unit</th>
                <th rowspan="2">Items</th>
                <th rowspan="2" style="width: 100px;">ABC</th>
                <th colspan="2" style="text-align: center; background: #e3f2fd;">Supplier 1</th>
                <th colspan="2" style="text-align: center; background: #e8f5e9;">Supplier 2</th>
                <th colspan="2" style="text-align: center; background: #fff8e1;">Supplier 3</th>
              </tr>
              <tr>
                <th style="width: 90px; background: #e3f2fd;">Unit Price</th>
                <th style="width: 90px; background: #e3f2fd;">Total Price</th>
                <th style="width: 90px; background: #e8f5e9;">Unit Price</th>
                <th style="width: 90px; background: #e8f5e9;">Total Price</th>
                <th style="width: 90px; background: #fff8e1;">Unit Price</th>
                <th style="width: 90px; background: #fff8e1;">Total Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="4" style="padding: 4px;">
                  <strong>Supplier Names:</strong>
                </td>
                <td colspan="2" style="background: #e3f2fd;"><input type="text" id="absSupplier1Name" placeholder="Supplier 1 Name" style="width: 100%; font-size: 11px;"></td>
                <td colspan="2" style="background: #e8f5e9;"><input type="text" id="absSupplier2Name" placeholder="Supplier 2 Name" style="width: 100%; font-size: 11px;"></td>
                <td colspan="2" style="background: #fff8e1;"><input type="text" id="absSupplier3Name" placeholder="Supplier 3 Name" style="width: 100%; font-size: 11px;"></td>
              </tr>
            </tbody>
            <tbody id="abstractItemsBody">
              <tr>
                <td><input type="number" placeholder="0" style="width: 45px; font-size: 11px;" min="0"></td>
                <td>
                  <select class="form-select" style="width: 50px; font-size: 11px;">
                    <option>Lot</option><option>Pax</option><option>Pcs</option><option>Unit</option><option>Ltrs</option><option>Gal</option><option>Set</option>
                  </select>
                </td>
                <td><input type="text" placeholder="Item description..." style="width: 100%; font-size: 11px;"></td>
                <td><input type="number" placeholder="0.00" step="0.01" style="width: 90px; font-size: 11px;" min="0"></td>
                <td style="background: #f5f9ff;"><input type="number" placeholder="0.00" step="0.01" style="width: 80px; font-size: 11px;" min="0" onchange="calcAbstractTotal(this)"></td>
                <td style="background: #f5f9ff;"><input type="number" placeholder="0.00" step="0.01" style="width: 80px; font-size: 11px;" readonly></td>
                <td style="background: #f5fff5;"><input type="number" placeholder="0.00" step="0.01" style="width: 80px; font-size: 11px;" min="0" onchange="calcAbstractTotal(this)"></td>
                <td style="background: #f5fff5;"><input type="number" placeholder="0.00" step="0.01" style="width: 80px; font-size: 11px;" readonly></td>
                <td style="background: #fffef5;"><input type="number" placeholder="0.00" step="0.01" style="width: 80px; font-size: 11px;" min="0" onchange="calcAbstractTotal(this)"></td>
                <td style="background: #fffef5;"><input type="number" placeholder="0.00" step="0.01" style="width: 80px; font-size: 11px;" readonly></td>
              </tr>
            </tbody>
          </table>
        </div>
        <button type="button" class="btn btn-sm btn-outline" onclick="addAbstractItemRow()"><i class="fas fa-plus"></i> Add Item Row</button>
        </div>
        <div class="form-section-header"><i class="fas fa-certificate"></i> Certification / Recommendation</div>
        <div class="form-group">
          <label>CERTIFICATION / RECOMMENDATION</label>
          <textarea rows="3" id="abstractCertification" placeholder="We, the undersigned, hereby certify that the above prices are fair and reasonable after canvassing and that the lowest/single calculated and responsive quotation is from [Supplier Name] with a total bid price of [Amount].">${'We, the undersigned, hereby certify that the above prices of the listed articles/items are fair and reasonable after personal canvass and that the lowest/single calculated and responsive quotation is hereby recommended for award.'}</textarea>
        </div>

        <div class="form-section-header"><i class="fas fa-list-ul"></i> Item Specifications</div>
        <div class="form-group">
          <label>Specifications (one per line)</label>
          <textarea rows="4" id="abstractItemSpecs" placeholder="Auto-filled from RFQ specifications when RFQ is selected..."></textarea>
        </div>

        <div class="form-section-header"><i class="fas fa-paperclip"></i> Required Attachments</div>
        <div class="form-attachment-section">
          <div class="attachment-box box-green" style="padding: 12px; border-radius: 6px; border: 2px dashed #4caf50; background: #e8f5e9;">
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; display: block;"><i class="fas fa-file-alt"></i> Abstract of Quotations (Signed by BAC)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="abstractDocument" accept=".pdf,.doc,.docx" required style="display: none;" onchange="updateFileLabel(this, 'abstractDocumentLabel')">
                <button type="button" class="btn btn-sm btn-success" onclick="document.getElementById('abstractDocument').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="abstractDocumentLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div>
              <label style="font-weight: 600; display: block;"><i class="fas fa-file-alt"></i> Supplier Quotations (Scanned)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="supplierQuotations" accept=".pdf,.jpg,.jpeg,.png" required multiple style="display: none;" onchange="updateFileLabel(this, 'supplierQuotationsLabel', true)">
                <button type="button" class="btn btn-sm btn-success" onclick="document.getElementById('supplierQuotations').click()"><i class="fas fa-upload"></i> Upload Multiple</button>
                <span id="supplierQuotationsLabel" style="font-size: 12px; color: #666;">No files selected</span>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-check-double"></i> Submit Abstract</button>
        </div>
      </form>
    `;
    openModal('Create Abstract of Quotations (AOQ)', html);
  };

  // When user selects an RFQ in the Abstract form, auto-fill items, purpose, ABC, specs from that RFQ + linked PR
  window.onAbstractLinkedRFQChange = async function(rfqId) {
    if (!rfqId) return;
    try {
      // Fetch full RFQ details (includes items)
      const rfq = await apiRequest('/rfqs/' + rfqId);
      if (!rfq) return;

      // Fill purpose from linked PR
      if (rfq.pr_id) {
        try {
          const pr = await apiRequest('/purchase-requests/' + rfq.pr_id);
          if (pr && pr.purpose) {
            const purposeField = document.getElementById('abstractPurpose');
            if (purposeField) purposeField.value = pr.purpose;
          }
        } catch(e) {}
      }

      // Fill item specifications
      if (rfq.item_specifications) {
        const specsField = document.getElementById('abstractItemSpecs');
        if (specsField) specsField.value = rfq.item_specifications;
      }

      // Populate items table from RFQ items
      const tbody = document.getElementById('abstractItemsBody');
      if (tbody && rfq.items && rfq.items.length > 0) {
        tbody.innerHTML = '';
        rfq.items.forEach(item => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td><input type="number" value="${item.quantity || 0}" style="width: 45px; font-size: 11px;" min="0"></td>
            <td>
              <select class="form-select" style="width: 50px; font-size: 11px;">
                ${['Lot','Pax','Pcs','Unit','Ltrs','Gal','Set','Box','Ream'].map(u => `<option value="${u}" ${(item.unit||'').toLowerCase() === u.toLowerCase() ? 'selected' : ''}>${u}</option>`).join('')}
              </select>
            </td>
            <td><input type="text" value="${item.item_description || item.item_name || ''}" style="width: 100%; font-size: 11px;"></td>
            <td><input type="number" value="${parseFloat(item.abc_total_cost || item.abc_unit_cost || 0).toFixed(2)}" step="0.01" style="width: 90px; font-size: 11px;" min="0"></td>
            <td style="background: #f5f9ff;"><input type="number" placeholder="0.00" step="0.01" style="width: 80px; font-size: 11px;" min="0" onchange="calcAbstractTotal(this)"></td>
            <td style="background: #f5f9ff;"><input type="number" placeholder="0.00" step="0.01" style="width: 80px; font-size: 11px;" readonly></td>
            <td style="background: #f5fff5;"><input type="number" placeholder="0.00" step="0.01" style="width: 80px; font-size: 11px;" min="0" onchange="calcAbstractTotal(this)"></td>
            <td style="background: #f5fff5;"><input type="number" placeholder="0.00" step="0.01" style="width: 80px; font-size: 11px;" readonly></td>
            <td style="background: #fffef5;"><input type="number" placeholder="0.00" step="0.01" style="width: 80px; font-size: 11px;" min="0" onchange="calcAbstractTotal(this)"></td>
            <td style="background: #fffef5;"><input type="number" placeholder="0.00" step="0.01" style="width: 80px; font-size: 11px;" readonly></td>
          `;
          tbody.appendChild(row);
        });
      }

    } catch(e) { console.error('Error loading RFQ data for Abstract:', e); }
  };

  window.addAbstractItemRow = function() {
    const tbody = document.getElementById('abstractItemsBody');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="number" placeholder="0" style="width: 45px; font-size: 11px;" min="0"></td>
      <td><select class="form-select" style="width: 50px; font-size: 11px;"><option>Lot</option><option>Pax</option><option>Pcs</option><option>Unit</option><option>Ltrs</option><option>Gal</option><option>Set</option></select></td>
      <td><input type="text" placeholder="Item description..." style="width: 100%; font-size: 11px;"></td>
      <td><input type="number" placeholder="0.00" step="0.01" style="width: 90px; font-size: 11px;" min="0"></td>
      <td style="background: #f5f9ff;"><input type="number" placeholder="0.00" step="0.01" style="width: 80px; font-size: 11px;" min="0" onchange="calcAbstractTotal(this)"></td>
      <td style="background: #f5f9ff;"><input type="number" placeholder="0.00" step="0.01" style="width: 80px; font-size: 11px;" readonly></td>
      <td style="background: #f5fff5;"><input type="number" placeholder="0.00" step="0.01" style="width: 80px; font-size: 11px;" min="0" onchange="calcAbstractTotal(this)"></td>
      <td style="background: #f5fff5;"><input type="number" placeholder="0.00" step="0.01" style="width: 80px; font-size: 11px;" readonly></td>
      <td style="background: #fffef5;"><input type="number" placeholder="0.00" step="0.01" style="width: 80px; font-size: 11px;" min="0" onchange="calcAbstractTotal(this)"></td>
      <td style="background: #fffef5;"><input type="number" placeholder="0.00" step="0.01" style="width: 80px; font-size: 11px;" readonly></td>
    `;
    tbody.appendChild(row);
  };

  window.calcAbstractTotal = function(el) {
    const row = el.closest('tr');
    const qty = parseFloat(row.cells[0].querySelector('input').value) || 0;
    const unitPriceInputs = row.querySelectorAll('input[type="number"]');
    // indices: 0=qty, 1=abc, 2=s1_unit, 3=s1_total, 4=s2_unit, 5=s2_total, 6=s3_unit, 7=s3_total
    for (let i = 2; i < unitPriceInputs.length; i += 2) {
      const unitPrice = parseFloat(unitPriceInputs[i].value) || 0;
      unitPriceInputs[i + 1].value = (qty * unitPrice).toFixed(2);
    }
  };

  window.showNewNOAModal = function() {
    const html = `
      <form id="noaForm" onsubmit="saveNewNOA(event)">
        <div class="info-banner" style="margin-bottom: 0;">
          <i class="fas fa-award"></i>
          <strong>NOTICE OF AWARD</strong> — Per Government NOA Letter Format
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>NOA Number</label>
            <input type="text" id="noaNumber" value="${generateDocNumber('NOA')}" readonly>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="noaDate" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        <div class="form-section-header"><i class="fas fa-user-tie"></i> Addressee (Winning Bidder)</div>
        <div class="form-group">
          <label>Company/Supplier Name</label>
          <input type="text" id="noaCompanyName" placeholder="Full company name" required>
        </div>
        <div class="form-group">
          <label>Address</label>
          <textarea rows="2" id="noaAddress" placeholder="Complete business address" required></textarea>
        </div>
        <div class="form-section-header section-items"><i class="fas fa-award"></i> Award Details</div>
        <div class="form-group">
          <label>Linked BAC Resolution (Approved)</label>
          <select class="form-select" id="noaLinkedBAC" required>
            <option value="">-- Select BAC Resolution --</option>
          </select>
        </div>
        <div class="form-group">
          <label>RFQ Reference No.</label>
          <input type="text" id="noaRFQRef" placeholder="e.g., RFQ-${getCurrentFiscalYear()}-001" required>
        </div>
        <div class="form-group">
          <label>Award Letter Text</label>
          <textarea rows="4" required>This is to inform you that your quotation dated _____________ for the above-captioned project per RFQ No. _____________ has been accepted. You are hereby required to submit within three (3) calendar days the following post-qualification documents:

1. Latest Income Tax Return (ITR)
2. Omnibus Sworn Statement
3. Valid Mayor's/Business Permit
4. PhilGEPS Registration Number

Failure to submit the above requirements within the prescribed period shall constitute sufficient ground for cancellation of the award. You are likewise required to post the required Performance Security within ten (10) calendar days from receipt hereof.</textarea>
        </div>
        <div class="form-group">
          <label>Contract Amount</label>
          <input type="number" id="noaContractAmount" placeholder="0.00" step="0.01" min="0" required>
        </div>
        <div class="form-section-header section-signatories"><i class="fas fa-signature"></i> Signatories</div>
        <div class="form-boxed-section">
          <div class="boxed-content box-yellow">
            <div class="form-group" style="margin-bottom: 8px;">
              <label style="font-size: 12px;">Head of the Procuring Entity (HoPE)</label>
              <input type="text" placeholder="Name" required>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 12px;">Designation</label>
              <input type="text" value="Regional Director" placeholder="Designation">
            </div>
          </div>
        </div>
        <div class="form-section-header section-acceptance"><i class="fas fa-handshake"></i> Bidder Receipt</div>
        <div class="form-boxed-section">
          <div class="boxed-content box-blue">
            <div class="form-row">
              <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 12px;">Received by (Bidder/Representative)</label>
                <input type="text" placeholder="Name of Bidder representative">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 12px;">Date Received</label>
                <input type="date">
              </div>
            </div>
          </div>
        </div>
        <div class="form-section-header"><i class="fas fa-paperclip"></i> Required Attachments</div>
        <div class="form-attachment-section">
          <div class="attachment-box box-orange" style="padding: 12px; border-radius: 6px; border: 2px dashed #ff9800; background: #fff8e1;">
            <div>
              <label style="font-weight: 600; display: block;"><i class="fas fa-award"></i> NOA Document (Signed by HoPE)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="noaDocument" accept=".pdf,.doc,.docx" required style="display: none;" onchange="updateFileLabel(this, 'noaDocumentLabel')">
                <button type="button" class="btn btn-sm btn-warning" onclick="document.getElementById('noaDocument').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="noaDocumentLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-award"></i> Issue NOA</button>
        </div>
      </form>
    `;
    openModal('Issue Notice of Award (NOA)', html);
  };

  window.showNewPOModal = async function() {
    await ensureProcModesLoaded();
    const html = `
      <form id="poForm" onsubmit="saveNewPO(event)">
        <div class="info-banner" style="margin-bottom: 0;">
          <i class="fas fa-file-contract"></i>
          <strong>PURCHASE ORDER</strong> — Per Government PO Form
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Supplier</label>
            <input type="text" id="poSupplier" placeholder="Supplier Name" required>
          </div>
          <div class="form-group">
            <label>P.O. No.</label>
            <input type="text" id="poNumber" value="${generateDocNumber('PO')}" readonly>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Address</label>
            <input type="text" id="poAddress" placeholder="Supplier Address" required>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="poDate" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>TIN</label>
            <input type="text" id="poTIN" placeholder="Tax Identification Number">
          </div>
          <div class="form-group">
            <label>Mode of Procurement</label>
            <select class="form-select" id="poProcMode" required>
              ${buildProcModeOptions('Small Value Procurement', true)}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Place of Delivery</label>
            <input type="text" id="poPlaceDelivery" value="DMW Regional Office XIII (Caraga), Butuan City" required>
          </div>
          <div class="form-group">
            <label>Delivery Term</label>
            <input type="text" id="poDeliveryTerm" placeholder="e.g., 15 calendar days from receipt of PO">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Date of Delivery</label>
            <input type="date" id="poDeliveryDate" required>
          </div>
          <div class="form-group">
            <label>Payment Term</label>
            <select class="form-select" id="poPaymentTerm">
              <option value="Government Terms">Government Terms</option>
              <option value="COD">Cash on Delivery</option>
              <option value="30 Days">30 Days from Delivery</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Linked NOA (Issued)</label>
          <select class="form-select" id="poLinkedNOA" required>
            <option value="">-- Select NOA --</option>
          </select>
        </div>
        <div class="form-section-header section-items"><i class="fas fa-list-ol"></i> Items</div>
        <div class="form-items-section">
        <table class="data-table" style="font-size: 12px; margin-bottom: 10px;">
          <thead>
            <tr>
              <th style="width: 60px;">Item No.</th>
              <th style="width: 60px;">Unit</th>
              <th>Item Description</th>
              <th style="width: 70px;">Quantity</th>
              <th style="width: 100px;">Unit Cost</th>
              <th style="width: 100px;">Amount</th>
            </tr>
          </thead>
          <tbody id="poItemsBody">
            <tr>
              <td><input type="text" value="1" style="width: 50px; text-align: center;"></td>
              <td>
                <select class="form-select" style="width: 60px;">
                  <option>Lot</option><option>Pax</option><option>Pcs</option><option>Unit</option><option>Sq.ft</option><option>Gal</option><option>Ltrs</option><option>Box</option><option>Ream</option><option>Set</option>
                </select>
              </td>
              <td><textarea rows="2" placeholder="Item description..." style="width: 100%;"></textarea></td>
              <td><input type="number" placeholder="0" style="width: 60px;" min="0" onchange="calcPOItemTotal(this)"></td>
              <td><input type="number" placeholder="0.00" step="0.01" style="width: 90px;" min="0" onchange="calcPOItemTotal(this)"></td>
              <td><input type="number" placeholder="0.00" step="0.01" style="width: 90px;" readonly></td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="btn btn-sm btn-outline" onclick="addPOItemRow()"><i class="fas fa-plus"></i> Add Item Row</button>
        </div>
        <div class="form-group">
          <label>PURPOSE</label>
          <textarea rows="2" id="poPurpose" placeholder="Purpose of purchase order..." required></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Total Amount (in words)</label>
            <input type="text" id="poAmountWords" placeholder="e.g., One Hundred Fifteen Thousand Pesos Only" required>
          </div>
          <div class="form-group">
            <label>Total Amount</label>
            <input type="number" id="poTotalAmount" placeholder="0.00" step="0.01" readonly style="font-weight: bold; font-size: 16px;">
          </div>
        </div>
        <div class="form-note">
          <i class="fas fa-exclamation-triangle"></i> <strong>Note:</strong> In case of failure to make the full delivery within the time specified above, a penalty of one-tenth (1/10) of one percent for every day of delay shall be imposed.
        </div>

        <div class="form-section-header"><i class="fas fa-list-ul"></i> Item Specifications</div>
        <div class="form-group">
          <label>Specifications (one per line)</label>
          <textarea rows="4" id="poItemSpecs" placeholder="Enter item specifications, one per line..."></textarea>
        </div>

        <div class="form-section-header"><i class="fas fa-paperclip"></i> Required Attachments</div>
        <div class="form-attachment-section">
          <div class="attachment-box box-blue" style="padding: 12px; border-radius: 6px; border: 2px dashed #2196f3; background: #e3f2fd;">
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; display: block;"><i class="fas fa-file-contract"></i> Purchase Order Document (Signed)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="poDocument" accept=".pdf,.doc,.docx" required style="display: none;" onchange="updateFileLabel(this, 'poDocumentLabel')">
                <button type="button" class="btn btn-sm btn-primary" onclick="document.getElementById('poDocument').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="poDocumentLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div>
              <label style="font-weight: 500; display: block;"><i class="fas fa-file-signature"></i> Supplier Conforme / Signed PO</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="poSupplierConforme" accept=".pdf,.jpg,.jpeg,.png" style="display: none;" onchange="updateFileLabel(this, 'poSupplierConformeLabel')">
                <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('poSupplierConforme').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="poSupplierConformeLabel" style="font-size: 12px; color: #666;">Upload after supplier signs</span>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-warning"><i class="fas fa-save"></i> Save Draft</button>
          <button type="button" class="btn btn-primary" onclick="approvePO()"><i class="fas fa-file-contract"></i> Approve PO</button>
        </div>
      </form>
    `;
    openModal('Create Purchase Order (PO)', html);
  };

  window.addPOItemRow = function() {
    const tbody = document.getElementById('poItemsBody');
    const nextNum = tbody.rows.length + 1;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" value="${nextNum}" style="width: 50px; text-align: center;"></td>
      <td><select class="form-select" style="width: 60px;"><option>Lot</option><option>Pax</option><option>Pcs</option><option>Unit</option><option>Sq.ft</option><option>Gal</option><option>Ltrs</option><option>Box</option><option>Ream</option><option>Set</option></select></td>
      <td><textarea rows="2" placeholder="Item description..." style="width: 100%;"></textarea></td>
      <td><input type="number" placeholder="0" style="width: 60px;" min="0" onchange="calcPOItemTotal(this)"></td>
      <td><input type="number" placeholder="0.00" step="0.01" style="width: 90px;" min="0" onchange="calcPOItemTotal(this)"></td>
      <td><input type="number" placeholder="0.00" step="0.01" style="width: 90px;" readonly></td>
    `;
    tbody.appendChild(row);
  };

  window.calcPOItemTotal = function(el) {
    const row = el.closest('tr');
    const inputs = row.querySelectorAll('input[type="number"]');
    const qty = parseFloat(inputs[0].value) || 0;
    const unitCost = parseFloat(inputs[1].value) || 0;
    inputs[2].value = (qty * unitCost).toFixed(2);
    // Recalculate grand total
    let grandTotal = 0;
    document.querySelectorAll('#poItemsBody tr').forEach(r => {
      const amountInput = r.querySelectorAll('input[type="number"]')[2];
      grandTotal += parseFloat(amountInput.value) || 0;
    });
    const totalEl = document.getElementById('poTotalAmount');
    if (totalEl) totalEl.value = grandTotal.toFixed(2);
  };

  window.approvePO = function() {
    if(!validateAttachment('poDocument', 'Purchase Order Document')) return;
    if(confirm('Approve this Purchase Order? This will start the COA submission timeline (5 calendar days).')) {
      alert('PO Approved. Status: PO Approved. Sending to supplier for signature...');
      closeModal();
    }
  };

  // ===== FULL EDIT MODALS FOR ALL TRANSACTION PAGES =====

  // --- EDIT PR ---
  window.showEditPRModal = async function(id) {
    // Fetch fresh data from server (same pattern as other edit modals)
    let pr = {};
    try { pr = await apiRequest('/purchase-requests/' + id); } catch (err) { alert('Could not load Purchase Request'); return; }
    const items = pr.items || [];

    const unitOptions = ['Lot','Pax','Pcs','Unit','Sq.ft','Gal','Ltrs','Box','Ream','Set'];
    const buildUnitSelect = (selected) => {
      return `<select class="form-select" style="width:75px;">${unitOptions.map(u => `<option value="${u}" ${u === selected ? 'selected' : ''}>${u}</option>`).join('')}</select>`;
    };

    const buildItemRow = (item, idx) => {
      return `<tr>
        <td><input type="number" value="${idx + 1}" style="width:50px;" readonly></td>
        <td>${buildUnitSelect(item.unit || 'Lot')}</td>
        <td><textarea rows="2" style="width:100%;">${(item.item_description || item.item_name || '').replace(/</g, '&lt;')}</textarea></td>
        <td><input type="number" placeholder="0" style="width:70px;" min="0" value="${item.quantity || 0}" onchange="calculateEditPRItemTotal(this)"></td>
        <td><input type="number" placeholder="0.00" step="0.01" style="width:100px;" min="0" value="${item.unit_price || 0}" onchange="calculateEditPRItemTotal(this)"></td>
        <td><input type="number" placeholder="0.00" step="0.01" style="width:100px;" readonly value="${((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)}"></td>
        <td style="width:40px;text-align:center;"><button type="button" class="btn-icon" style="color:#e53e3e;" title="Remove" onclick="removeEditPRItemRow(this)"><i class="fas fa-trash"></i></button></td>
      </tr>`;
    };

    const itemRows = items.length > 0
      ? items.map((item, idx) => buildItemRow(item, idx)).join('')
      : buildItemRow({ unit: 'Lot', item_description: '', quantity: 0, unit_price: 0 }, 0);

    // Calculate initial total
    let initTotal = 0;
    items.forEach(item => { initTotal += (item.quantity || 0) * (item.unit_price || 0); });

    const html = `
      <form id="editPRForm" onsubmit="saveEditPR(event, ${id})">
        <div class="info-banner" style="margin-bottom:0;">
          <i class="fas fa-edit"></i>
          <strong>EDIT PURCHASE REQUEST</strong> — ${pr.pr_number || ''}
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Office/Section</label>
            <input type="text" id="editPrOffice" value="${(pr.office || 'DMW Caraga').replace(/"/g, '&quot;')}">
          </div>
          <div class="form-group">
            <label>PR No.</label>
            <input type="text" id="editPrNumber" value="${pr.pr_number || ''}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="editPrDate" value="${pr.pr_date ? pr.pr_date.substring(0,10) : (pr.created_at ? pr.created_at.substring(0,10) : '')}">
          </div>
          <div class="form-group">
            <label>Status</label>
            <select id="editPrStatus" class="form-select">
              <option value="pending_approval" ${pr.status==='pending_approval'?'selected':''}>PENDING APPROVAL</option>
              <option value="approved" ${pr.status==='approved'?'selected':''}>APPROVED</option>
              <option value="rejected" ${pr.status==='rejected'?'selected':''}>REJECTED</option>
              <option value="cancelled" ${pr.status==='cancelled'?'selected':''}>CANCELLED</option>
            </select>
          </div>
        </div>

        <div class="form-section-header section-items"><i class="fas fa-list-ol"></i> Item Details</div>
        <div class="form-items-section">
          <table class="data-table" style="font-size:12px;margin-bottom:10px;">
            <thead>
              <tr>
                <th style="width:60px;">Item No.</th>
                <th style="width:80px;">Unit</th>
                <th>Item Description</th>
                <th style="width:80px;">Quantity</th>
                <th style="width:110px;">Unit Cost</th>
                <th style="width:110px;">Total Cost</th>
                <th style="width:40px;"></th>
              </tr>
            </thead>
            <tbody id="editPrItemsBody">
              ${itemRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5" style="text-align:right;font-weight:bold;">TOTAL AMOUNT</td>
                <td><strong id="editPrTotalAmount">₱${(initTotal || pr.total_amount || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          <button type="button" class="btn btn-sm btn-outline" onclick="addEditPRItemRow()"><i class="fas fa-plus"></i> Add Item Row</button>
        </div>
        <div class="form-group">
          <label>Purpose</label>
          <textarea rows="2" id="editPrPurpose" placeholder="Purpose of the purchase request">${(pr.purpose || '').replace(/</g, '&lt;')}</textarea>
        </div>
        <div class="form-section-header section-items"><i class="fas fa-clipboard-list"></i> Item Specifications</div>
        <div class="form-group">
          <label>Item Specifications <small style="color:#666;">(one per line, will appear as bullet points)</small></label>
          <textarea rows="4" id="editPrItemSpecs" placeholder="Enter specifications, one per line...">${(pr.item_specifications || '').replace(/</g, '&lt;')}</textarea>
        </div>
        ${getEditAttachmentSectionHTML('purchase_request', id, 'editPrAttachment')}
        <div class="form-group" style="text-align:right;margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit Purchase Request', html);
  };

  // Dynamic helpers for Edit PR (same pattern as New PR)
  window.addEditPRItemRow = function() {
    const tbody = document.getElementById('editPrItemsBody');
    if (!tbody) return;
    const rowCount = tbody.rows.length + 1;
    const unitOpts = ['Lot','Pax','Pcs','Unit','Sq.ft','Gal','Ltrs','Box','Ream','Set'];
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="number" value="${rowCount}" style="width:50px;" readonly></td>
      <td>
        <select class="form-select" style="width:75px;">
          ${unitOpts.map(u => `<option value="${u}">${u}</option>`).join('')}
        </select>
      </td>
      <td><textarea rows="2" placeholder="Item description..." style="width:100%;"></textarea></td>
      <td><input type="number" placeholder="0" style="width:70px;" min="0" onchange="calculateEditPRItemTotal(this)"></td>
      <td><input type="number" placeholder="0.00" step="0.01" style="width:100px;" min="0" onchange="calculateEditPRItemTotal(this)"></td>
      <td><input type="number" placeholder="0.00" step="0.01" style="width:100px;" readonly></td>
      <td style="width:40px;text-align:center;"><button type="button" class="btn-icon" style="color:#e53e3e;" title="Remove" onclick="removeEditPRItemRow(this)"><i class="fas fa-trash"></i></button></td>
    `;
    tbody.appendChild(row);
  };

  window.removeEditPRItemRow = function(btn) {
    const tbody = document.getElementById('editPrItemsBody');
    if (!tbody || tbody.rows.length <= 1) { alert('At least one item row is required.'); return; }
    btn.closest('tr').remove();
    // Re-number rows
    Array.from(tbody.rows).forEach((r, i) => {
      const numInput = r.querySelector('input[type="number"]');
      if (numInput) numInput.value = i + 1;
    });
    recalcEditPRTotal();
  };

  window.calculateEditPRItemTotal = function(el) {
    const row = el.closest('tr');
    const inputs = row.querySelectorAll('input[type="number"]');
    const qty = parseFloat(inputs[1].value) || 0;
    const unitCost = parseFloat(inputs[2].value) || 0;
    inputs[3].value = (qty * unitCost).toFixed(2);
    recalcEditPRTotal();
  };

  function recalcEditPRTotal() {
    let total = 0;
    document.querySelectorAll('#editPrItemsBody tr').forEach(r => {
      const cells = r.querySelectorAll('input[type="number"]');
      total += parseFloat(cells[3]?.value) || 0;
    });
    const el = document.getElementById('editPrTotalAmount');
    if (el) el.textContent = '₱' + total.toLocaleString('en-PH', {minimumFractionDigits: 2});
  }

  window.saveEditPR = async function(e, id) {
    e.preventDefault();
    if (!confirm('Are you sure you want to save these changes?')) return;
    // Collect items from the edit table (same pattern as saveNewPR)
    const items = [];
    const rows = document.getElementById('editPrItemsBody')?.querySelectorAll('tr') || [];
    rows.forEach((row, idx) => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 6) {
        const unit = cells[1].querySelector('select')?.value || 'Lot';
        const desc = cells[2].querySelector('textarea')?.value || '';
        const qty = parseFloat(cells[3].querySelector('input')?.value) || 0;
        const unitPrice = parseFloat(cells[4].querySelector('input')?.value) || 0;
        if (desc || qty > 0) {
          items.push({
            item_code: 'PR-ITEM-' + (idx + 1),
            item_name: desc.substring(0, 100),
            item_description: desc,
            unit: unit,
            quantity: qty,
            unit_price: unitPrice,
            category: 'general'
          });
        }
      }
    });
    const totalText = document.getElementById('editPrTotalAmount')?.textContent || '0';
    const totalAmount = parseFloat(totalText.replace(/[^\d.]/g, '')) || 0;
    // Preserve dept_id from cached record so division assignment isn't lost
    const cachedRecord = cachedPR.find(r => r.id === id);
    const data = {
      pr_number: document.getElementById('editPrNumber').value,
      purpose: document.getElementById('editPrPurpose').value,
      total_amount: totalAmount,
      status: document.getElementById('editPrStatus').value,
      dept_id: cachedRecord ? cachedRecord.dept_id : undefined,
      item_specifications: document.getElementById('editPrItemSpecs')?.value.trim() || null,
      items: items
    };
    try {
      await apiRequest('/purchase-requests/' + id, 'PUT', data);
      await uploadEditAttachments('purchase_request', id, 'editPrAttachment');
      showToast('Purchase Request updated successfully!', 'success');
      closeModal(); loadPR();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // --- EDIT RFQ ---
  window.showEditRFQModal = async function(id) {
    const r = cachedRFQ.find(x => x.id === id);
    if (!r) { alert('Record not found'); return; }
    // Build PR options from cached PRs
    const prOptions = (cachedPR || []).map(p => 
      `<option value="${p.id}" ${r.pr_id == p.id ? 'selected' : ''}>${p.pr_number}</option>`
    ).join('');

    // Load saved specs directly from rfqs.item_specifications column
    let savedSpecsText = r.item_specifications || '';

    const html = `
      <form id="editRFQForm" onsubmit="saveEditRFQ(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit RFQ</strong></div>
        <div class="form-row">
          <div class="form-group"><label>RFQ Number</label><input type="text" id="editRfqNumber" value="${r.rfq_number || ''}" required></div>
          <div class="form-group"><label>PR Reference</label>
            <select id="editRfqPrId" class="form-select" onchange="loadPRItemsForRFQ()">
              <option value="">-- No PR Reference --</option>
              ${prOptions}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Date Prepared</label><input type="date" id="editRfqDate" value="${r.date_prepared ? r.date_prepared.substring(0,10) : ''}"></div>
          <div class="form-group"><label>Submission Deadline</label><input type="date" id="editRfqDeadline" value="${r.submission_deadline ? r.submission_deadline.substring(0,10) : ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>ABC Amount</label><input type="number" step="0.01" id="editRfqAbc" value="${r.abc_amount || 0}"></div>
          <div class="form-group">
            <label>Status</label>
            <select id="editRfqStatus" class="form-select">
              <option value="on_going" ${r.status==='on_going'?'selected':''}>ON-GOING</option>
              <option value="completed" ${r.status==='completed'?'selected':''}>COMPLETED</option>
              <option value="cancelled" ${r.status==='cancelled'?'selected':''}>CANCELLED</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>PhilGEPS Required</label>
          <select id="editRfqPhilgeps" class="form-select">
            <option value="false" ${!r.philgeps_required?'selected':''}>No</option>
            <option value="true" ${r.philgeps_required?'selected':''}>Yes</option>
          </select>
        </div>

        <!-- PR Items Reference (Quantity & Unit from PR) -->
        <div class="form-group" style="margin-top:15px;">
          <label><i class="fas fa-list"></i> PR Items (Quantity & Unit)</label>
          <div id="rfqPrItemsContainer" style="border:1px solid #ddd;border-radius:6px;padding:10px;background:#f9f9f9;min-height:40px;">
            <span style="color:#999;font-size:13px;">Select a PR Reference to load items...</span>
          </div>
        </div>

        <!-- Item Specifications (Bullet Form Input) -->
        <div class="form-group" style="margin-top:10px;">
          <label><i class="fas fa-clipboard-list"></i> Item Specifications (one per line = one bullet)</label>
          <textarea id="editRfqItemSpecs" class="form-control" rows="6" placeholder="Enter item specifications, one per line...&#10;Example:&#10;Brand new, original&#10;Compatible with HP LaserJet Pro&#10;Yield: 2,500 pages"
            style="font-size:13px;line-height:1.6;">${savedSpecsText}</textarea>
          <small style="color:#888;">Each line will appear as a bullet point (•) in the RFQ table and print.</small>
        </div>

        <!-- Bullet Preview -->
        <div class="form-group" style="margin-top:5px;">
          <label style="font-size:12px;color:#666;">Preview:</label>
          <div id="rfqSpecPreview" style="border:1px dashed #ccc;border-radius:4px;padding:8px;background:#fff;min-height:30px;font-size:12px;">
            <span style="color:#ccc;">Type specifications above to preview...</span>
          </div>
        </div>

        ${getEditAttachmentSectionHTML('rfq', id, 'editRfqAttachment')}
        <div class="form-group" style="text-align:right;margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit RFQ', html);

    // Attach live preview for specs textarea
    const specsTA = document.getElementById('editRfqItemSpecs');
    if (specsTA) {
      specsTA.addEventListener('input', updateRfqSpecPreview);
      // Trigger initial preview if there are saved specs
      if (savedSpecsText) updateRfqSpecPreview();
    }

    // Auto-load PR items if PR is already selected
    if (r.pr_id) loadPRItemsForRFQ();
  };

  // Load PR items into the RFQ edit modal
  window.loadPRItemsForRFQ = async function() {
    const prId = document.getElementById('editRfqPrId')?.value;
    const container = document.getElementById('rfqPrItemsContainer');
    if (!container) return;
    if (!prId) {
      container.innerHTML = '<span style="color:#999;font-size:13px;">Select a PR Reference to load items...</span>';
      return;
    }
    container.innerHTML = '<span style="color:#888;font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Loading PR items...</span>';
    try {
      const prDetail = await apiRequest('/purchase-requests/' + prId);
      const items = prDetail.items || [];
      if (items.length === 0) {
        container.innerHTML = '<span style="color:#999;font-size:13px;">No items found in this PR.</span>';
        return;
      }
      container.innerHTML = `
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#e9ecef;font-weight:bold;">
              <th style="padding:6px 8px;border:1px solid #ddd;text-align:center;width:15%;">Quantity</th>
              <th style="padding:6px 8px;border:1px solid #ddd;text-align:center;width:15%;">Unit</th>
              <th style="padding:6px 8px;border:1px solid #ddd;text-align:left;">Item Name</th>
              <th style="padding:6px 8px;border:1px solid #ddd;text-align:right;width:20%;">Unit Price</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(it => `
              <tr>
                <td style="padding:5px 8px;border:1px solid #ddd;text-align:center;">${it.quantity || ''}</td>
                <td style="padding:5px 8px;border:1px solid #ddd;text-align:center;">${it.unit || ''}</td>
                <td style="padding:5px 8px;border:1px solid #ddd;">${it.item_name || ''}</td>
                <td style="padding:5px 8px;border:1px solid #ddd;text-align:right;">₱${parseFloat(it.unit_price || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>`;
    } catch (err) {
      container.innerHTML = '<span style="color:red;font-size:13px;">Error loading PR items: ' + err.message + '</span>';
    }
  };

  // Live preview of bullet specs
  window.updateRfqSpecPreview = function() {
    const ta = document.getElementById('editRfqItemSpecs');
    const preview = document.getElementById('rfqSpecPreview');
    if (!ta || !preview) return;
    const lines = ta.value.split('\n').filter(l => l.trim() !== '');
    if (lines.length === 0) {
      preview.innerHTML = '<span style="color:#ccc;">Type specifications above to preview...</span>';
    } else {
      preview.innerHTML = '<ul style="margin:0;padding-left:18px;">' + lines.map(l => `<li>${l.trim()}</li>`).join('') + '</ul>';
    }
  };

  window.saveEditRFQ = async function(e, id) {
    e.preventDefault();
    if (!confirm('Are you sure you want to save these changes?')) return;
    const data = {
      rfq_number: document.getElementById('editRfqNumber').value,
      pr_id: document.getElementById('editRfqPrId').value || null,
      date_prepared: document.getElementById('editRfqDate').value || null,
      submission_deadline: document.getElementById('editRfqDeadline').value || null,
      abc_amount: parseFloat(document.getElementById('editRfqAbc').value) || 0,
      philgeps_required: document.getElementById('editRfqPhilgeps').value === 'true',
      status: document.getElementById('editRfqStatus').value
    };

    // Send item_specifications directly to server
    const specsText = document.getElementById('editRfqItemSpecs')?.value || '';
    data.item_specifications = specsText.trim() || null;

    try {
      await apiRequest('/rfqs/' + id, 'PUT', data);
      await uploadEditAttachments('rfq', id, 'editRfqAttachment');
      showToast('RFQ updated successfully!', 'success');
      closeModal(); loadRFQ();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // --- EDIT ABSTRACT ---
  window.showEditAbstractModal = function(id) {
    const a = cachedAbstract.find(x => x.id === id);
    if (!a) { alert('Record not found'); return; }
    const html = `
      <form id="editAbstractForm" onsubmit="saveEditAbstract(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit Abstract of Quotations</strong></div>
        <div class="form-row">
          <div class="form-group"><label>Abstract Number</label><input type="text" id="editAbsNumber" value="${a.abstract_number || ''}" required></div>
          <div class="form-group"><label>RFQ Reference</label><input type="text" id="editAbsRfqRef" value="${a.rfq_number || ''}" readonly></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Date Prepared</label><input type="date" id="editAbsDate" value="${a.date_prepared ? a.date_prepared.substring(0,10) : ''}"></div>
          <div class="form-group"><label>Recommended Amount</label><input type="number" step="0.01" id="editAbsAmount" value="${a.recommended_amount || 0}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Purpose</label><input type="text" id="editAbsPurpose" value="${(a.purpose || '').replace(/"/g, '&quot;')}"></div>
          <div class="form-group">
            <label>Status</label>
            <select id="editAbsStatus" class="form-select">
              <option value="on_going" ${a.status==='on_going'?'selected':''}>ON-GOING</option>
              <option value="completed" ${a.status==='completed'?'selected':''}>COMPLETED</option>
              <option value="cancelled" ${a.status==='cancelled'?'selected':''}>CANCELLED</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Item Specifications <small style="color:#666;">(one per line, will appear as bullet points)</small></label>
          <textarea rows="4" id="editAbsItemSpecs" placeholder="Enter specifications, one per line...">${(a.item_specifications || '').replace(/</g, '&lt;')}</textarea>
        </div>
        ${getEditAttachmentSectionHTML('abstract', id, 'editAbsAttachment')}
        <div class="form-group" style="text-align:right;margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit Abstract of Quotations', html);
  };
  window.saveEditAbstract = async function(e, id) {
    e.preventDefault();
    if (!confirm('Are you sure you want to save these changes?')) return;
    const a = cachedAbstract.find(x => x.id === id);
    const data = {
      abstract_number: document.getElementById('editAbsNumber').value,
      rfq_id: a ? a.rfq_id : null,
      date_prepared: document.getElementById('editAbsDate').value || null,
      purpose: document.getElementById('editAbsPurpose').value,
      recommended_supplier_id: a ? a.recommended_supplier_id : null,
      recommended_amount: parseFloat(document.getElementById('editAbsAmount').value) || 0,
      status: document.getElementById('editAbsStatus').value,
      item_specifications: document.getElementById('editAbsItemSpecs')?.value.trim() || null
    };
    try {
      await apiRequest('/abstracts/' + id, 'PUT', data);
      await uploadEditAttachments('abstract', id, 'editAbsAttachment');
      showToast('Abstract updated successfully!', 'success');
      closeModal(); loadAbstract();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // --- EDIT POST-QUALIFICATION ---
  window.showEditPostQualModal = function(id) {
    const p = cachedPostQual.find(x => x.id === id);
    if (!p) { alert('Record not found'); return; }
    const html = `
      <form id="editPQForm" onsubmit="saveEditPostQual(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit Post-Qualification</strong></div>
        <div class="form-row">
          <div class="form-group"><label>Post-Qual Number</label><input type="text" id="editPqNumber" value="${p.postqual_number || ''}" required></div>
          <div class="form-group"><label>Abstract Reference</label><input type="text" id="editPqAbsRef" value="${p.abstract_number || ''}" readonly></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Bidder Name</label><input type="text" id="editPqBidder" value="${(p.bidder_name || '').replace(/"/g, '&quot;')}"></div>
          <div class="form-group">
            <label>Status</label>
            <select id="editPqStatus" class="form-select">
              <option value="on_going" ${p.status==='on_going'?'selected':''}>ON-GOING</option>
              <option value="completed" ${p.status==='completed'?'selected':''}>COMPLETED</option>
              <option value="cancelled" ${p.status==='cancelled'?'selected':''}>CANCELLED</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>TWG Result</label><input type="text" id="editPqTwgResult" value="${(p.twg_result || '').replace(/"/g, '&quot;')}"></div>
          <div class="form-group"><label>Findings</label><input type="text" id="editPqFindings" value="${(p.findings || '').replace(/"/g, '&quot;')}"></div>
        </div>
        ${getEditAttachmentSectionHTML('post_qualification', id, 'editPqAttachment')}
        <div class="form-group" style="text-align:right;margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit Post-Qualification', html);
  };
  window.saveEditPostQual = async function(e, id) {
    e.preventDefault();
    if (!confirm('Are you sure you want to save these changes?')) return;
    const p = cachedPostQual.find(x => x.id === id);
    const data = {
      postqual_number: document.getElementById('editPqNumber').value,
      abstract_id: p ? p.abstract_id : null,
      bidder_name: document.getElementById('editPqBidder').value,
      documents_verified: p ? p.documents_verified : '{}',
      technical_compliance: p ? p.technical_compliance : null,
      financial_validation: p ? p.financial_validation : null,
      twg_result: document.getElementById('editPqTwgResult').value,
      findings: document.getElementById('editPqFindings').value,
      status: document.getElementById('editPqStatus').value
    };
    try {
      await apiRequest('/post-qualifications/' + id, 'PUT', data);
      await uploadEditAttachments('post_qualification', id, 'editPqAttachment');
      showToast('Post-Qualification updated successfully!', 'success');
      closeModal(); loadPostQual();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // --- EDIT BAC RESOLUTION ---
  window.showEditBACResolutionModal = async function(id) {
    const b = cachedBACRes.find(x => x.id === id);
    if (!b) { alert('Record not found'); return; }
    await ensureProcModesLoaded();
    const html = `
      <form id="editBACForm" onsubmit="saveEditBACResolution(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit BAC Resolution</strong></div>
        <div class="form-row">
          <div class="form-group"><label>Resolution Number</label><input type="text" id="editBacNumber" value="${b.resolution_number || ''}" required></div>
          <div class="form-group"><label>Resolution Date</label><input type="date" id="editBacDate" value="${b.resolution_date ? b.resolution_date.substring(0,10) : ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Procurement Mode</label>
            <select id="editBacMode" class="form-select">
              ${buildProcModeOptions(b.procurement_mode || '')}
            </select>
          </div>
          <div class="form-group"><label>ABC Amount</label><input type="number" step="0.01" id="editBacAbc" value="${b.abc_amount || 0}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Recommended Awardee</label><input type="text" id="editBacAwardee" value="${(b.recommended_awardee_name || b.supplier_name || '').replace(/"/g, '&quot;')}"></div>
          <div class="form-group"><label>Bid Amount</label><input type="number" step="0.01" id="editBacBidAmount" value="${b.bid_amount || 0}"></div>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="editBacStatus" class="form-select">
            <option value="on_going" ${b.status==='on_going'?'selected':''}>ON-GOING</option>
            <option value="completed" ${b.status==='completed'?'selected':''}>COMPLETED</option>
            <option value="cancelled" ${b.status==='cancelled'?'selected':''}>CANCELLED</option>
          </select>
        </div>
        ${getEditAttachmentSectionHTML('bac_resolution', id, 'editBacAttachment')}
        <div class="form-group" style="text-align:right;margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit BAC Resolution', html);
  };
  window.saveEditBACResolution = async function(e, id) {
    e.preventDefault();
    if (!confirm('Are you sure you want to save these changes?')) return;
    const b = cachedBACRes.find(x => x.id === id);
    const data = {
      resolution_number: document.getElementById('editBacNumber').value,
      abstract_id: b ? b.abstract_id : null,
      resolution_date: document.getElementById('editBacDate').value || null,
      procurement_mode: document.getElementById('editBacMode').value,
      abc_amount: parseFloat(document.getElementById('editBacAbc').value) || 0,
      recommended_supplier_id: b ? b.recommended_supplier_id : null,
      recommended_awardee_name: document.getElementById('editBacAwardee').value,
      bid_amount: parseFloat(document.getElementById('editBacBidAmount').value) || 0,
      status: document.getElementById('editBacStatus').value
    };
    try {
      await apiRequest('/bac-resolutions/' + id, 'PUT', data);
      await uploadEditAttachments('bac_resolution', id, 'editBacAttachment');
      showToast('BAC Resolution updated successfully!', 'success');
      closeModal(); loadBACResolution();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // --- EDIT NOA ---
  window.showEditNOAModal = function(id) {
    const n = cachedNOA.find(x => x.id === id);
    if (!n) { alert('Record not found'); return; }
    const html = `
      <form id="editNOAForm" onsubmit="saveEditNOA(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit Notice of Award</strong></div>
        <div class="form-row">
          <div class="form-group"><label>NOA Number</label><input type="text" id="editNoaNumber" value="${n.noa_number || ''}" required></div>
          <div class="form-group"><label>BAC Resolution Ref</label><input type="text" id="editNoaBacRef" value="${n.resolution_number || ''}" readonly></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Supplier</label><input type="text" id="editNoaSupplier" value="${(n.supplier_name || '').replace(/"/g, '&quot;')}" readonly></div>
          <div class="form-group"><label>Contract Amount</label><input type="number" step="0.01" id="editNoaAmount" value="${n.contract_amount || 0}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Date Issued</label><input type="date" id="editNoaDateIssued" value="${n.date_issued ? n.date_issued.substring(0,10) : ''}"></div>
          <div class="form-group"><label>Bidder Receipt Date</label><input type="date" id="editNoaReceiptDate" value="${n.bidder_receipt_date ? n.bidder_receipt_date.substring(0,10) : ''}"></div>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="editNoaStatus" class="form-select">
            <option value="awaiting_noa" ${n.status==='awaiting_noa'?'selected':''}>AWAITING NOA</option>
            <option value="with_noa" ${n.status==='with_noa'?'selected':''}>WITH NOA</option>
            <option value="cancelled" ${n.status==='cancelled'?'selected':''}>CANCELLED</option>
          </select>
        </div>
        ${getEditAttachmentSectionHTML('notice_of_award', id, 'editNoaAttachment')}
        <div class="form-group" style="text-align:right;margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit Notice of Award', html);
  };
  window.saveEditNOA = async function(e, id) {
    e.preventDefault();
    if (!confirm('Are you sure you want to save these changes?')) return;
    const n = cachedNOA.find(x => x.id === id);
    const data = {
      noa_number: document.getElementById('editNoaNumber').value,
      bac_resolution_id: n ? n.bac_resolution_id : null,
      supplier_id: n ? n.supplier_id : null,
      contract_amount: parseFloat(document.getElementById('editNoaAmount').value) || 0,
      date_issued: document.getElementById('editNoaDateIssued').value || null,
      bidder_receipt_date: document.getElementById('editNoaReceiptDate').value || null,
      status: document.getElementById('editNoaStatus').value
    };
    try {
      await apiRequest('/notices-of-award/' + id, 'PUT', data);
      await uploadEditAttachments('notice_of_award', id, 'editNoaAttachment');
      showToast('NOA updated successfully!', 'success');
      closeModal(); loadNOA();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // --- EDIT PO ---
  window.showEditPOModal = function(id) {
    const p = cachedPO.find(x => x.id === id);
    if (!p) { alert('Record not found'); return; }
    const html = `
      <form id="editPOForm" onsubmit="saveEditPO(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit Purchase Order</strong></div>
        <div class="form-row">
          <div class="form-group"><label>PO Number</label><input type="text" id="editPoNumber" value="${p.po_number || ''}" required></div>
          <div class="form-group"><label>Supplier</label><input type="text" id="editPoSupplier" value="${(p.supplier_name || '').replace(/"/g, '&quot;')}" readonly></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Mode of Procurement</label><input type="text" id="editPoMode" value="${(p.mode_of_procurement || '').replace(/"/g, '&quot;')}"></div>
          <div class="form-group"><label>Total Amount</label><input type="number" step="0.01" id="editPoAmount" value="${p.total_amount || 0}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Place of Delivery</label><input type="text" id="editPoPlace" value="${(p.place_of_delivery || '').replace(/"/g, '&quot;')}"></div>
          <div class="form-group"><label>Delivery Date</label><input type="date" id="editPoDeliveryDate" value="${p.delivery_date ? p.delivery_date.substring(0,10) : ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Purpose</label><input type="text" id="editPoPurpose" value="${(p.purpose || '').replace(/"/g, '&quot;')}"></div>
          <div class="form-group"><label>Payment Terms</label><input type="text" id="editPoPayTerms" value="${(p.payment_terms || '').replace(/"/g, '&quot;')}"></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Status</label>
            <select id="editPoStatus" class="form-select">
              <option value="for_signing" ${p.status==='for_signing'?'selected':''}>FOR SIGNING</option>
              <option value="signed" ${p.status==='signed'?'selected':''}>SIGNED</option>
              <option value="cancelled" ${p.status==='cancelled'?'selected':''}>CANCELLED</option>
            </select>
          </div>
          <div class="form-group">
            <label>Workflow Status</label>
            <select id="editPoWorkflow" class="form-select">
              <option value="pending" ${p.workflow_status==='pending'?'selected':''}>PENDING</option>
              <option value="on_process" ${p.workflow_status==='on_process'?'selected':''}>ON PROCESS</option>
              <option value="awaiting_delivery" ${p.workflow_status==='awaiting_delivery'?'selected':''}>AWAITING DELIVERY</option>
              <option value="for_payment" ${p.workflow_status==='for_payment'?'selected':''}>FOR PAYMENT</option>
              <option value="paid_ada" ${p.workflow_status==='paid_ada'?'selected':''}>PAID (ADA)</option>
              <option value="submitted_to_coa" ${p.workflow_status==='submitted_to_coa'?'selected':''}>SUBMITTED TO COA</option>
              <option value="cancelled" ${p.workflow_status==='cancelled'?'selected':''}>CANCELLED</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Item Specifications <small style="color:#666;">(one per line, will appear as bullet points)</small></label>
          <textarea rows="4" id="editPoItemSpecs" placeholder="Enter specifications, one per line...">${(p.item_specifications || '').replace(/</g, '&lt;')}</textarea>
        </div>
        ${getEditAttachmentSectionHTML('purchase_order', id, 'editPoAttachment')}
        <div class="form-group" style="text-align:right;margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit Purchase Order', html);
  };
  window.saveEditPO = async function(e, id) {
    e.preventDefault();
    if (!confirm('Are you sure you want to save these changes?')) return;
    const p = cachedPO.find(x => x.id === id);
    const data = {
      po_number: document.getElementById('editPoNumber').value,
      pr_id: p ? p.pr_id : null,
      noa_id: p ? p.noa_id : null,
      supplier_id: p ? p.supplier_id : null,
      total_amount: parseFloat(document.getElementById('editPoAmount').value) || 0,
      payment_terms: document.getElementById('editPoPayTerms').value,
      delivery_address: p ? p.delivery_address : null,
      status: document.getElementById('editPoStatus').value,
      workflow_status: document.getElementById('editPoWorkflow').value,
      expected_delivery_date: p ? p.expected_delivery_date : null,
      delivery_date: document.getElementById('editPoDeliveryDate').value || null,
      po_date: p ? p.po_date : null,
      purpose: document.getElementById('editPoPurpose').value,
      mode_of_procurement: document.getElementById('editPoMode').value,
      place_of_delivery: document.getElementById('editPoPlace').value,
      item_specifications: document.getElementById('editPoItemSpecs')?.value.trim() || null
    };
    try {
      await apiRequest('/purchase-orders/' + id, 'PUT', data);
      await uploadEditAttachments('purchase_order', id, 'editPoAttachment');
      showToast('Purchase Order updated successfully!', 'success');
      closeModal(); loadPO();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // --- EDIT IAR ---
  window.showEditIARModal = function(id) {
    const i = cachedIAR.find(x => x.id === id);
    if (!i) { alert('Record not found'); return; }
    const html = `
      <form id="editIARForm" onsubmit="saveEditIAR(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit IAR</strong></div>
        <div class="form-row">
          <div class="form-group"><label>IAR Number</label><input type="text" id="editIarNumber" value="${i.iar_number || ''}" required></div>
          <div class="form-group"><label>PO Reference</label><input type="text" id="editIarPoRef" value="${i.po_number || ''}" readonly></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Supplier</label><input type="text" id="editIarSupplier" value="${(i.supplier_name || '').replace(/"/g, '&quot;')}" readonly></div>
          <div class="form-group"><label>Invoice Number</label><input type="text" id="editIarInvoice" value="${(i.invoice_number || '').replace(/"/g, '&quot;')}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Inspection Date</label><input type="date" id="editIarInspDate" value="${i.inspection_date ? i.inspection_date.substring(0,10) : ''}"></div>
          <div class="form-group"><label>Delivery Date</label><input type="date" id="editIarDelDate" value="${i.delivery_date ? i.delivery_date.substring(0,10) : ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Purpose</label><input type="text" id="editIarPurpose" value="${(i.purpose || '').replace(/"/g, '&quot;')}"></div>
          <div class="form-group"><label>Findings</label><input type="text" id="editIarFindings" value="${(i.findings || '').replace(/"/g, '&quot;')}"></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Inspection Result</label>
            <select id="editIarInspResult" class="form-select" onchange="handleEditIARInspChange()">
              <option value="on_going" ${i.inspection_result==='on_going'?'selected':''}>ON GOING</option>
              <option value="verified" ${i.inspection_result==='verified'?'selected':''}>VERIFIED</option>
              <option value="to_be_checked" ${i.inspection_result==='to_be_checked'?'selected':''}>TO BE CHECKED</option>
            </select>
          </div>
          <div class="form-group">
            <label>Acceptance</label>
            <select id="editIarAcceptance" class="form-select" ${i.inspection_result==='on_going'?'disabled':''}>
              <option value="to_be_checked" ${i.acceptance==='to_be_checked'?'selected':''}>TO BE CHECKED</option>
              <option value="complete" ${i.acceptance==='complete'?'selected':''}>COMPLETE</option>
              <option value="partial" ${i.acceptance==='partial'?'selected':''}>PARTIAL</option>
            </select>
            <small id="editIarAccHint" style="color:#b7791f;display:${i.inspection_result==='on_going'?'block':'none'};">Acceptance locked while inspection is on going.</small>
          </div>
        </div>
        <div class="form-group">
          <label>Item Specifications <small style="color:#666;">(one per line, will appear as bullet points)</small></label>
          <textarea rows="4" id="editIarItemSpecs" placeholder="Enter specifications, one per line...">${(i.item_specifications || '').replace(/</g, '&lt;')}</textarea>
        </div>
        ${getEditAttachmentSectionHTML('iar', id, 'editIarAttachment')}
        <div class="form-group" style="text-align:right;margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit IAR', html);
  };
  window.handleEditIARInspChange = function() {
    const inspVal = document.getElementById('editIarInspResult').value;
    const accSelect = document.getElementById('editIarAcceptance');
    const hint = document.getElementById('editIarAccHint');
    if (inspVal === 'on_going') {
      accSelect.value = 'to_be_checked';
      accSelect.disabled = true;
      if (hint) hint.style.display = 'block';
    } else {
      accSelect.disabled = false;
      if (hint) hint.style.display = 'none';
    }
  };
  window.saveEditIAR = async function(e, id) {
    e.preventDefault();
    if (!confirm('Are you sure you want to save these changes?')) return;
    const i = cachedIAR.find(x => x.id === id);
    const data = {
      iar_number: document.getElementById('editIarNumber').value,
      po_id: i ? i.po_id : null,
      inspection_date: document.getElementById('editIarInspDate').value || null,
      delivery_date: document.getElementById('editIarDelDate').value || null,
      invoice_number: document.getElementById('editIarInvoice').value,
      invoice_date: i ? i.invoice_date : null,
      delivery_receipt_number: i ? i.delivery_receipt_number : null,
      inspection_result: document.getElementById('editIarInspResult').value,
      findings: document.getElementById('editIarFindings').value,
      purpose: document.getElementById('editIarPurpose').value,
      acceptance: document.getElementById('editIarAcceptance').value,
      item_specifications: document.getElementById('editIarItemSpecs')?.value.trim() || null
    };
    try {
      await apiRequest('/iars/' + id, 'PUT', data);
      await uploadEditAttachments('iar', id, 'editIarAttachment');
      showToast('IAR updated successfully!', 'success');
      closeModal(); loadIAR();
    } catch (err) { alert('Error: ' + err.message); }
  };

  window.showSetIARStatusModal = function(iarId, currentInspection, currentAcceptance) {
    const html = `
      <form id="iarStatusForm">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-clipboard-check"></i>
          <strong>SET IAR STATUS</strong>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Inspection Result</label>
            <select id="iarInspSelect" class="form-select" onchange="handleIARInspChange()">
              <option value="on_going" ${currentInspection === 'on_going' ? 'selected' : ''}>ON GOING</option>
              <option value="verified" ${currentInspection === 'verified' ? 'selected' : ''}>VERIFIED</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Acceptance</label>
            <select id="iarAccSelect" class="form-select" ${currentInspection === 'on_going' ? 'disabled' : ''}>
              <option value="to_be_checked" ${currentAcceptance === 'to_be_checked' ? 'selected' : ''}>TO BE CHECKED</option>
              <option value="complete" ${currentAcceptance === 'complete' ? 'selected' : ''}>COMPLETE</option>
              <option value="partial" ${currentAcceptance === 'partial' ? 'selected' : ''}>PARTIAL</option>
            </select>
            <small id="iarAccHint" style="color:#b7791f;display:${currentInspection === 'on_going' ? 'block' : 'none'};">Acceptance is locked to "TO BE CHECKED" while inspection is on going.</small>
          </div>
        </div>
      </form>
    `;
    showModal('Set IAR Status', html, async () => {
      if (!confirm('Are you sure you want to update the IAR status?')) return;
      const inspection_result = document.getElementById('iarInspSelect').value;
      const acceptance = document.getElementById('iarAccSelect').value;
      try {
        await apiRequest('/iars/' + iarId + '/set-status', 'PUT', { inspection_result, acceptance });
        showNotification('IAR status updated successfully', 'success');
        loadIAR();
        closeModal();
      } catch (err) {
        showNotification('Failed to update IAR status: ' + err.message, 'error');
      }
    });
  };

  window.handleIARInspChange = function() {
    const inspVal = document.getElementById('iarInspSelect').value;
    const accSelect = document.getElementById('iarAccSelect');
    const hint = document.getElementById('iarAccHint');
    if (inspVal === 'on_going') {
      accSelect.value = 'to_be_checked';
      accSelect.disabled = true;
      hint.style.display = 'block';
    } else {
      accSelect.disabled = false;
      hint.style.display = 'none';
    }
  };

  window.showNewIARModal = function() {
    const html = `
      <form id="iarForm" onsubmit="saveNewIAR(event)">
        <div class="info-banner" style="margin-bottom: 0;">
          <i class="fas fa-clipboard-check"></i>
          <strong>INSPECTION AND ACCEPTANCE REPORT</strong> — Appendix 62
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Entity Name</label>
            <input type="text" value="Department of Migrant Workers - Regional Office XIII" readonly>
          </div>
          <div class="form-group">
            <label>Fund Cluster</label>
            <input type="text" id="iarFundCluster" placeholder="e.g., 01 101 101" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Supplier</label>
            <input type="text" id="iarSupplier" placeholder="Supplier Name" required>
          </div>
          <div class="form-group">
            <label>IAR No.</label>
            <input type="text" id="iarNumber" value="${generateDocNumber('IAR')}" readonly>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>PO No. / Date</label>
            <div style="display: flex; gap: 8px;">
              <select class="form-select" id="iarLinkedPO" required style="flex: 2;">
                <option value="">-- Select PO --</option>
              </select>
              <input type="date" id="iarPODate" style="flex: 1;">
            </div>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="iarDate" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Requisitioning Office/Dept.</label>
            <input type="text" id="iarReqOffice" placeholder="e.g., FAD, OWWA, etc." required>
          </div>
          <div class="form-group">
            <label>Invoice No.</label>
            <input type="text" id="iarInvoiceNo" placeholder="Supplier's Sales Invoice No." required>
          </div>
        </div>
        <div class="form-group">
          <label>Responsibility Center Code</label>
          <input type="text" placeholder="Responsibility Center Code">
        </div>
        <div class="form-section-header section-items"><i class="fas fa-list-ol"></i> Items</div>
        <div class="form-items-section">
        <table class="data-table" style="font-size: 12px; margin-bottom: 10px;">
          <thead>
            <tr>
              <th style="width: 120px;">Stock/ Property No.</th>
              <th>Description</th>
              <th style="width: 70px;">Unit</th>
              <th style="width: 80px;">Quantity</th>
            </tr>
          </thead>
          <tbody id="iarItemsBody">
            <tr>
              <td><input type="text" placeholder="Stock/Prop No." style="width: 110px;"></td>
              <td><textarea rows="2" placeholder="Item description..." style="width: 100%;"></textarea></td>
              <td>
                <select class="form-select" style="width: 65px;">
                  <option>Lot</option><option>Pax</option><option>Pcs</option><option>Unit</option><option>Gal</option><option>Ltrs</option><option>Box</option><option>Ream</option><option>Set</option>
                </select>
              </td>
              <td><input type="number" placeholder="0" style="width: 70px;" min="0"></td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="btn btn-sm btn-outline" onclick="addIARItemRow()"><i class="fas fa-plus"></i> Add Item Row</button>
        </div>
        <div class="form-section-header section-inspection"><i class="fas fa-search"></i> Inspection</div>
        <div style="background: #e8f5e9; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
          <div class="form-row">
            <div class="form-group" style="margin-bottom: 5px;">
              <label style="font-size: 12px;">Date Inspected</label>
              <input type="date" id="iarInspectionDate" required>
            </div>
            <div class="form-group" style="margin-bottom: 5px;">
              <label style="font-size: 12px;">Inspection Officer / Property Custodian</label>
              <input type="text" id="iarInspector" placeholder="Name of Inspector" required>
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 0; font-size: 12px;">
            <label><input type="checkbox" checked> I hereby certify that I have inspected/verified the articles/items as described above and found the same in order.</label>
          </div>
        </div>
        <div class="form-section-header section-acceptance"><i class="fas fa-check-circle"></i> Acceptance</div>
        <div style="background: #e3f2fd; padding: 12px; border-radius: 6px;">
          <div class="form-row">
            <div class="form-group" style="margin-bottom: 5px;">
              <label style="font-size: 12px;">Date Received</label>
              <input type="date" required>
            </div>
            <div class="form-group" style="margin-bottom: 5px;">
              <label style="font-size: 12px;">Supply and/or Property Custodian</label>
              <input type="text" placeholder="Name of Receiver" required>
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 12px;">Acceptance Type</label>
            <div style="display: flex; gap: 20px; margin-top: 5px;">
              <label><input type="radio" name="acceptanceType" value="complete" checked> Complete</label>
              <label><input type="radio" name="acceptanceType" value="partial"> Partial (Pls. specify quantity in the above table)</label>
            </div>
          </div>
        </div>

        <div class="form-section-header"><i class="fas fa-list-ul"></i> Item Specifications</div>
        <div class="form-group">
          <label>Specifications (one per line)</label>
          <textarea rows="4" id="iarItemSpecs" placeholder="Enter item specifications, one per line..."></textarea>
        </div>

        <div class="form-section-header"><i class="fas fa-paperclip"></i> Required Attachments</div>
        <div class="form-attachment-section">
          <div class="attachment-box box-green" style="padding: 12px; border-radius: 6px; border: 2px dashed #4caf50; background: #e8f5e9;">
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; display: block;"><i class="fas fa-clipboard-check"></i> IAR Document (Signed - Appendix 62)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="iarDocument" accept=".pdf,.doc,.docx" required style="display: none;" onchange="updateFileLabel(this, 'iarDocumentLabel')">
                <button type="button" class="btn btn-sm btn-success" onclick="document.getElementById('iarDocument').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="iarDocumentLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; display: block;"><i class="fas fa-file-invoice"></i> Supplier Invoice (Scanned)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="iarInvoice" accept=".pdf,.jpg,.jpeg,.png" required style="display: none;" onchange="updateFileLabel(this, 'iarInvoiceLabel')">
                <button type="button" class="btn btn-sm btn-success" onclick="document.getElementById('iarInvoice').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="iarInvoiceLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div>
              <label style="font-weight: 600; display: block;"><i class="fas fa-truck"></i> Delivery Receipt (Scanned)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="iarDeliveryReceipt" accept=".pdf,.jpg,.jpeg,.png" required style="display: none;" onchange="updateFileLabel(this, 'iarDeliveryReceiptLabel')">
                <button type="button" class="btn btn-sm btn-success" onclick="document.getElementById('iarDeliveryReceipt').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="iarDeliveryReceiptLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-success"><i class="fas fa-clipboard-check"></i> Complete IAR</button>
        </div>
      </form>
    `;
    openModal('Inspection & Acceptance Report (IAR - Appendix 62)', html);
  };

  window.addIARItemRow = function() {
    const tbody = document.getElementById('iarItemsBody');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" placeholder="Stock/Prop No." style="width: 110px;"></td>
      <td><textarea rows="2" placeholder="Item description..." style="width: 100%;"></textarea></td>
      <td><select class="form-select" style="width: 65px;"><option>Lot</option><option>Pax</option><option>Pcs</option><option>Unit</option><option>Gal</option><option>Ltrs</option><option>Box</option><option>Ream</option><option>Set</option></select></td>
      <td><input type="number" placeholder="0" style="width: 70px;" min="0"></td>
    `;
    tbody.appendChild(row);
  };

  window.showNewItemModal = function() {
    // Ensure UOMs are loaded
    if (!cachedUOMs.length) {
      apiRequest('/uoms').then(uoms => { cachedUOMs = uoms; }).catch(() => {});
    }
    const html = `
      <form id="itemForm" onsubmit="saveNewItem(event)">
        <div class="form-row">
          <div class="form-group">
            <label>Item Code</label>
            <input type="text" id="itemCode" placeholder="e.g., ITM-001" required>
          </div>
          <div class="form-group">
            <label>Stock No.</label>
            <input type="text" id="itemStockNo" placeholder="e.g., STK-0001">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Category</label>
            <select class="form-select" id="itemCategory" required>
              ${buildCategoryOptions('')}
            </select>
          </div>
          <div class="form-group">
            <label>UACS Code</label>
            <input type="text" id="itemUacsCode" placeholder="e.g., 1-07-05-010">
          </div>
        </div>
        <div class="form-group">
          <label>Item Name</label>
          <input type="text" id="itemName" placeholder="Enter item name" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="itemDescription" rows="2" placeholder="Detailed description"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Unit of Measure</label>
            <select class="form-select" id="itemUnit" required>
              ${buildUOMOptions('')}
            </select>
          </div>
          <div class="form-group">
            <label>Unit Price</label>
            <input type="number" id="itemPrice" placeholder="0.00" step="0.01" min="0" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Quantity on Hand</label>
            <input type="number" id="itemQuantity" placeholder="0" min="0" value="0">
          </div>
          <div class="form-group">
            <label>Reorder Point</label>
            <input type="number" id="itemReorderPoint" placeholder="0" min="0" value="0">
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

  // Save new item via API
  window.saveNewItem = async function(e) {
    e.preventDefault();
    const data = {
      code: document.getElementById('itemCode').value,
      name: document.getElementById('itemName').value,
      description: document.getElementById('itemDescription').value,
      category: document.getElementById('itemCategory').value,
      unit: document.getElementById('itemUnit').value,
      unit_price: parseFloat(document.getElementById('itemPrice').value) || 0,
      stock_no: document.getElementById('itemStockNo').value || null,
      uacs_code: document.getElementById('itemUacsCode').value || null,
      quantity: parseInt(document.getElementById('itemQuantity').value) || 0,
      reorder_point: parseInt(document.getElementById('itemReorderPoint').value) || 0
    };
    
    if (!confirm('Are you sure you want to save this item?')) return;
    try {
      await apiRequest('/items', 'POST', data);
      alert('Item saved successfully!');
      closeModal();
      loadItems();
    } catch (err) {
      alert('Error saving item: ' + err.message);
    }
  };

  window.showNewSupplierModal = function() {
    const html = `
      <form id="supplierForm" onsubmit="saveNewSupplier(event)">
        <div class="form-group">
          <label>Company Name</label>
          <input type="text" id="supplierName" placeholder="Enter company name" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>PhilGEPS Registration No.</label>
            <input type="text" id="supplierPhilgepsNo" placeholder="e.g., PG-123456">
          </div>
          <div class="form-group">
            <label>TIN</label>
            <input type="text" id="supplierTin" placeholder="Tax Identification Number">
          </div>
        </div>
        <div class="form-group">
          <label>Contact Person</label>
          <input type="text" id="supplierContact" placeholder="Name of contact person" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" id="supplierPhone" placeholder="Contact number" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="supplierEmail" placeholder="Email address">
          </div>
        </div>
        <div class="form-group">
          <label>Address</label>
          <textarea id="supplierAddress" rows="2" placeholder="Complete address" required></textarea>
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
        <div class="form-section-header"><i class="fas fa-paperclip"></i> Required Attachments</div>
        <div class="form-attachment-section">
          <div class="attachment-box box-green" style="padding: 12px; border-radius: 6px; border: 2px dashed #4caf50; background: #e8f5e9;">
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
        <div class="form-group" style="text-align: right; margin-top: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Supplier</button>
        </div>
      </form>
    `;
    openModal('Add New Supplier', html);
  };

  // Save new supplier via API
  window.saveNewSupplier = async function(e) {
    e.preventDefault();
    const data = {
      name: document.getElementById('supplierName').value,
      contact_person: document.getElementById('supplierContact').value,
      phone: document.getElementById('supplierPhone').value,
      email: document.getElementById('supplierEmail')?.value || '',
      address: document.getElementById('supplierAddress').value,
      tin: document.getElementById('supplierTin')?.value || ''
    };
    
    if (!confirm('Are you sure you want to save this supplier?')) return;
    try {
      const result = await apiRequest('/suppliers', 'POST', data);
      // Upload attachments linked to the new supplier
      const supplierId = result.id || result.supplier_id;
      if (supplierId) {
        await uploadAttachments('supplier', supplierId, [
          { inputId: 'supplierPhilgeps', description: 'PhilGEPS Registration' },
          { inputId: 'supplierBusinessPermit', description: 'Business Permit' },
          { inputId: 'supplierSecDti', description: 'SEC/DTI Registration' }
        ]);
      }
      alert('Supplier saved successfully!');
      closeModal();
      loadSuppliers();
    } catch (err) {
      alert('Error saving supplier: ' + err.message);
    }
  };

  // ============================================================
  // SAVE FUNCTIONS FOR ALL TRANSACTION CREATE FORMS
  // ============================================================

  // Division code to dept_id mapping
  const deptIdMap = { 'FAD': 1, 'MWPTD': 2, 'MWPSD': 3, 'WRSD': 4, 'ORD': 5 };

  /**
   * Auto-generate PPMP number based on division and fiscal year
   */
  window.generatePPMPNumber = async function() {
    const divSelect = document.getElementById('ppmpDivisionSelect');
    const fySelect = document.getElementById('ppmpFiscalYear');
    const ppmpInput = document.getElementById('ppmpNumber');
    if (!divSelect || !fySelect || !ppmpInput) return;
    
    const division = divSelect.value || document.querySelector('input[name="division"]')?.value || '';
    const year = fySelect.value || getCurrentFiscalYear();
    
    if (!division) { ppmpInput.value = ''; return; }
    
    try {
      // Fetch existing PPMP entries to determine next sequence number
      const plans = await apiRequest('/plans');
      const prefix = 'PPMP-' + division + '-' + year + '-';
      let maxSeq = 0;
      plans.forEach(p => {
        if (p.ppmp_no && p.ppmp_no.startsWith(prefix)) {
          const seq = parseInt(p.ppmp_no.replace(prefix, '')) || 0;
          if (seq > maxSeq) maxSeq = seq;
        }
      });
      const nextSeq = String(maxSeq + 1).padStart(3, '0');
      ppmpInput.value = prefix + nextSeq;
    } catch (err) {
      // Fallback if API fails
      ppmpInput.value = 'PPMP-' + division + '-' + year + '-' + String(Math.floor(Math.random() * 900) + 100);
    }
  };

  /**
   * Save New PPMP Entries (batch — one per selected item)
   */
  window.saveNewPPMP = async function(e) {
    e.preventDefault();
    const items = window._ppmpSelectedItems || [];
    if (items.length === 0) {
      alert('Please add at least one item from the catalog.');
      return;
    }

    const fiscalYear = document.getElementById('ppmpFiscalYear')?.value || new Date().getFullYear();
    const division = document.getElementById('ppmpDivisionSelect')?.value || document.querySelector('input[name="division"]')?.value || '';
    const section = document.getElementById('ppmpSection')?.value || 'GENERAL PROCUREMENT';
    const projectType = document.getElementById('ppmpProjectType')?.value || 'Goods';
    const procurementMode = document.getElementById('ppmpProcMode')?.value || 'Small Value Procurement';
    const preProc = document.getElementById('ppmpPreProc')?.value || 'NO';
    const startDate = document.getElementById('ppmpStartDate')?.value || '';
    const endDate = document.getElementById('ppmpEndDate')?.value || '';
    const deliveryPeriod = document.getElementById('ppmpDeliveryPeriod')?.value || '';
    const fundSource = document.getElementById('ppmpFundSource')?.value || 'GAA';
    const remarks = document.getElementById('ppmpRemarks')?.value || '';
    const isIndicative = document.getElementById('ppmpIndicative')?.checked || false;
    const isFinal = document.getElementById('ppmpFinal')?.checked || false;

    if (!division) { alert('Please select a division.'); return; }

    const totalBudget = items.reduce((sum, it) => sum + it.budget, 0);
    const itemSummary = items.map((it, i) => `  ${i+1}. ${it.item_name} (x${it.quantity}) = ₱${it.budget.toLocaleString('en-PH', {minimumFractionDigits:2})}`).join('\n');
    if (!confirm(`Save ${items.length} PPMP entries?\n\n${itemSummary}\n\nTotal: ₱${totalBudget.toLocaleString('en-PH', {minimumFractionDigits:2})}`)) return;

    try {
      // Generate PPMP numbers for the batch
      const year = String(fiscalYear).slice(-2);
      const prefix = 'PPMP-' + division + '-' + year + '-';
      let maxSeq = 0;
      try {
        const existing = await apiRequest('/plans');
        (existing || []).forEach(p => {
          if (p.ppmp_no && p.ppmp_no.startsWith(prefix)) {
            const seq = parseInt(p.ppmp_no.replace(prefix, ''), 10);
            if (seq > maxSeq) maxSeq = seq;
          }
        });
      } catch(e) { /* fallback below */ }

      const entries = items.map((it, idx) => {
        const seqNum = maxSeq + idx + 1;
        const ppmpNo = prefix + String(seqNum).padStart(3, '0');
        return {
          ppmp_no: ppmpNo,
          dept_id: deptIdMap[division] || null,
          fiscal_year: parseInt(fiscalYear),
          section: section,
          category: it.item_category || '',
          item_id: it.item_id,
          description: it.description,
          item_description: it.description,
          project_type: projectType,
          quantity_size: String(it.quantity),
          procurement_mode: procurementMode,
          pre_procurement: preProc,
          start_date: startDate || null,
          end_date: endDate || null,
          delivery_period: deliveryPeriod || null,
          fund_source: fundSource,
          total_amount: it.budget,
          status: 'pending',
          remarks: (remarks + (isIndicative ? ' [INDICATIVE]' : '') + (isFinal ? ' [FINAL]' : '')).trim()
        };
      });

      // Try batch endpoint first, fall back to individual creates
      let savedCount = 0;
      let lastPlanId = null;
      try {
        const result = await apiRequest('/plans/batch', 'POST', { entries });
        savedCount = result.count || entries.length;
        lastPlanId = result.ids ? result.ids[0] : null;
      } catch(batchErr) {
        // Fallback: create one by one
        for (const entry of entries) {
          try {
            const result = await apiRequest('/plans', 'POST', entry);
            savedCount++;
            if (!lastPlanId) lastPlanId = result.id || result.plan_id;
          } catch(e) {
            console.error('Failed to save entry:', entry.ppmp_no, e);
          }
        }
      }

      // Upload attachment to first entry if provided
      if (lastPlanId) {
        await uploadAttachments('plan', lastPlanId, [
          { inputId: 'ppmpAttachment', description: 'PPMP Supporting Document' }
        ]);
      }

      alert(`Successfully saved ${savedCount} of ${entries.length} PPMP entries!`);
      closeModal();
      if (typeof loadPlans === 'function') loadPlans();
      else if (typeof loadPageData === 'function') loadPageData();
    } catch (err) {
      alert('Error saving PPMP entries: ' + err.message);
    }
  };

  /** Filter the items catalog dropdown by selected PPMP category */
  window.filterPPMPItemsByCategory = function(category) {
    const itemSelect = document.getElementById('ppmpItemSelect');
    if (!itemSelect) return;
    const allItems = window._ppmpItemsCache || [];
    // Filter items matching category (exact match on item catalog category)
    const filtered = category ? allItems.filter(i => {
      return (i.category || '').toUpperCase() === category.toUpperCase();
    }) : allItems;
    const items = filtered.length > 0 ? filtered : allItems;
    itemSelect.innerHTML = '<option value="">-- Select Item --</option>' +
      items.map(i => `<option value="${i.id}" data-unit="${i.unit || ''}" data-price="${i.unit_price || 0}" data-desc="${(i.description || '').replace(/"/g, '&quot;')}" data-name="${(i.name || '').replace(/"/g, '&quot;')}" data-category="${(i.category || '').replace(/"/g, '&quot;')}">${i.code} - ${i.name} (${i.unit || ''} @ ₱${parseFloat(i.unit_price || 0).toLocaleString('en-PH', {minimumFractionDigits:2})})</option>`
      ).join('');
  };

  // Category → Section mapping (matches migrate_ppmp_section.js)
  const CATEGORY_TO_SECTION = {
    'EXPENDABLE': 'OFFICE OPERATION',
    'ICT OFFICE SUPPLIES EXPENSES': 'OFFICE OPERATION',
    'OFFICE SUPPLIES EXPENSES': 'OFFICE OPERATION',
    'CLEANING EQUIPMENT AND SUPPLIES': 'OFFICE OPERATION',
    'PAPER MATERIALS AND PRODUCTS': 'OFFICE OPERATION',
    'OFFICE EQUIPMENT AND ACCESSORIES AND SUPPLIES': 'OFFICE OPERATION',
    'INFORMATION AND COMMUNICATION TECHNOLOGY (ICT) EQUIPMENT AND DEVICES AND ACCESSORIES': 'OFFICE OPERATION',
    'PRINTER OR FACSIMILE OR PHOTOCOPIER SUPPLIES (CONSUMABLES)': 'OFFICE OPERATION',
    'OTHER SUPPLIES AND MATERIALS': 'OFFICE OPERATION',
    'OTHER MOOE': 'OFFICE OPERATION',
    'SOFTWARE': 'OFFICE OPERATION',
    'SEMI-ICT EQUIPMENT': 'OFFICE OPERATION',
    'SEMI-OFFICE EQUIPMENT': 'OFFICE OPERATION',
    'SEMI-EXPENDABLE': 'OFFICE OPERATION',
    'ALCOHOL OR ACETONE BASED ANTISEPTICS': 'OFFICE OPERATION',
    'BATTERIES AND CELLS AND ACCESSORIES': 'OFFICE OPERATION',
    'COLOR COMPOUNDS AND DISPERSIONS': 'OFFICE OPERATION',
    'CONSUMER ELECTRONICS': 'OFFICE OPERATION',
    'FILMS': 'OFFICE OPERATION',
    'FLAG OR ACCESSORIES': 'OFFICE OPERATION',
    'LIGHTING AND FIXTURES AND ACCESSORIES': 'OFFICE OPERATION',
    'MANUFACTURING COMPONENTS AND SUPPLIES': 'OFFICE OPERATION',
    'MEASURING AND OBSERVING AND TESTING EQUIPMENT': 'OFFICE OPERATION',
    'PERFUMES OR COLOGNES OR FRAGRANCES': 'OFFICE OPERATION',
    'PESTICIDES OR PEST REPELLENTS': 'OFFICE OPERATION',
    'PRINTED PUBLICATIONS': 'OFFICE OPERATION',
    'ARTS AND CRAFTS EQUIPMENT AND ACCESSORIES AND SUPPLIES': 'OFFICE OPERATION',
    'AUDIO AND VISUAL EQUIPMENT AND SUPPLIES': 'OFFICE OPERATION',
    'HEATING AND VENTILATION AND AIR CIRCULATION': 'OFFICE OPERATION',
    'FIRE FIGHTING EQUIPMENT': 'OFFICE OPERATION',
    'CLOUD COMPUTING SERVICES': 'OFFICE OPERATION',
    'AIRLINE TICKETS': 'OFFICE OPERATION',
    'SEMI-FURNITURE & FIXTURES': 'SEMI- FURNITURE & FIXTURES',
    'FURNITURE AND FURNISHINGS': 'SEMI- FURNITURE & FIXTURES',
    'TRAININGS & ACTIVITIES': 'TRAININGS & ACTIVITIES',
    'CAPITAL OUTLAY': 'CAPITAL OUTLAY',
    'MOTOR VEHICLE': 'CAPITAL OUTLAY',
  };

  /**
   * Build a formatted description from an item catalog entry.
   * Format: HEADER\n   detail1\n   detail2\n   Unit: XYZ
   */
  window.buildItemDescription = function(item) {
    if (!item) return '';
    const name = (item.name || '').trim();
    let header = name;
    let details = [];
    // Split on comma or dash to extract detail parts
    const commaPos = name.indexOf(',');
    const dashPos = name.indexOf(' - ');
    if (commaPos > 0) {
      header = name.substring(0, commaPos).trim();
      const rest = name.substring(commaPos + 1).trim();
      if (rest) details.push(rest);
    } else if (dashPos > 0) {
      header = name.substring(0, dashPos).trim();
      const rest = name.substring(dashPos + 3).trim();
      if (rest) details.push(rest);
    }
    // Add description if different from name
    if (item.description && item.description.trim() !== name && item.description.trim() !== header) {
      const descNorm = item.description.trim();
      if (!details.some(d => d.toUpperCase().includes(descNorm.toUpperCase()) || descNorm.toUpperCase().includes(d.toUpperCase()))) {
        details.push(descNorm);
      }
    }
    // Add unit info
    if (item.unit) details.push('Unit: ' + item.unit);
    let desc = header;
    details.forEach(d => { desc += '\n   ' + d; });
    return desc;
  };

  /**
   * Add a selected item from the catalog dropdown to the PPMP items list.
   */
  window.addPPMPItemToList = function() {
    const itemSelect = document.getElementById('ppmpItemSelect');
    if (!itemSelect || !itemSelect.value) {
      alert('Please select an item from the catalog first.');
      return;
    }
    const itemId = itemSelect.value;
    const allItems = window._ppmpItemsCache || [];
    const item = allItems.find(i => String(i.id) === String(itemId));
    if (!item) { alert('Item not found in cache.'); return; }

    // Prevent duplicates
    if (window._ppmpSelectedItems.some(si => String(si.item_id) === String(itemId))) {
      alert('This item is already in the list.');
      return;
    }

    const description = buildItemDescription(item);
    const unitPrice = parseFloat(item.unit_price || 0);

    // Auto-set section and category from the first item added
    const catField = document.getElementById('ppmpCategory');
    const sectionField = document.getElementById('ppmpSection');
    const catFilterField = document.getElementById('ppmpCategoryFilterModal');
    if (catField && item.category) catField.value = item.category;
    if (sectionField && item.category) {
      const autoSection = CATEGORY_TO_SECTION[item.category] || 'GENERAL PROCUREMENT';
      sectionField.value = autoSection;
    }

    // Add to the selected items array
    const entry = {
      item_id: parseInt(itemId),
      item_name: item.name || '',
      item_code: item.code || '',
      item_unit: item.unit || '',
      item_category: item.category || '',
      item_description: item.description || '',
      description: description,
      unit_price: unitPrice,
      quantity: 1,
      budget: unitPrice
    };
    window._ppmpSelectedItems.push(entry);

    // Render the list
    renderPPMPItemsList();

    // Reset the dropdown selection
    itemSelect.value = '';
  };

  /**
   * Remove an item from the PPMP items list by index.
   */
  window.removePPMPItem = function(index) {
    window._ppmpSelectedItems.splice(index, 1);
    renderPPMPItemsList();
  };

  /**
   * Update quantity for an item in the list and recalculate budget.
   */
  window.updatePPMPItemQty = function(index, qty) {
    const q = Math.max(1, parseInt(qty) || 1);
    window._ppmpSelectedItems[index].quantity = q;
    window._ppmpSelectedItems[index].budget = q * window._ppmpSelectedItems[index].unit_price;
    renderPPMPItemsList();
  };

  /**
   * Allow manual editing of the unit price for an item in the list.
   */
  window.updatePPMPItemPrice = function(index, price) {
    const p = Math.max(0, parseFloat(price) || 0);
    window._ppmpSelectedItems[index].unit_price = p;
    window._ppmpSelectedItems[index].budget = window._ppmpSelectedItems[index].quantity * p;
    renderPPMPItemsList();
  };

  /**
   * Render the selected items list table and update totals.
   */
  window.renderPPMPItemsList = function() {
    const tbody = document.getElementById('ppmpItemsListBody');
    const container = document.getElementById('ppmpItemsListContainer');
    const countEl = document.getElementById('ppmpItemCount');
    const totalEl = document.getElementById('ppmpTotalDisplay');
    if (!tbody) return;

    const items = window._ppmpSelectedItems || [];
    if (items.length === 0) {
      tbody.innerHTML = '';
      if (container) container.style.display = 'none';
      if (countEl) countEl.textContent = '';
      if (totalEl) totalEl.textContent = '';
      return;
    }

    if (container) container.style.display = 'block';

    let totalBudget = 0;
    tbody.innerHTML = items.map((it, idx) => {
      totalBudget += it.budget;
      // Format description for display: show first line bold, rest as sub-details
      const descLines = (it.description || '').split('\n');
      const descDisplay = descLines.map((line, li) => {
        const trimmed = line.trim();
        if (li === 0) return '<strong style="font-size:11px;">' + escapeHtml(trimmed) + '</strong>';
        return '<div style="font-size:10px; color:#4a5568; font-style:italic; padding-left:8px;">' + escapeHtml(trimmed) + '</div>';
      }).join('');
      return `<tr>
        <td style="text-align:center; color:#888;">${idx + 1}</td>
        <td style="font-weight:600; font-size:11px;">${escapeHtml(it.item_code)} - ${escapeHtml(it.item_name)}</td>
        <td style="max-width:180px;">${descDisplay}</td>
        <td style="text-align:center;">${escapeHtml(it.item_unit)}</td>
        <td><input type="number" value="${it.unit_price.toFixed(2)}" min="0" step="0.01" 
              style="width:80px; font-size:11px; text-align:right; padding:2px 4px;"
              onchange="updatePPMPItemPrice(${idx}, this.value)"></td>
        <td><input type="number" value="${it.quantity}" min="1" step="1" 
              style="width:60px; font-size:11px; text-align:center; padding:2px 4px;"
              onchange="updatePPMPItemQty(${idx}, this.value)"></td>
        <td style="text-align:right; font-weight:600; font-size:11px;">₱${it.budget.toLocaleString('en-PH', {minimumFractionDigits:2})}</td>
        <td style="text-align:center;">
          <button type="button" class="btn btn-sm" onclick="removePPMPItem(${idx})" 
            style="color:#e53e3e; background:none; border:none; cursor:pointer; padding:2px 6px;" title="Remove">
            <i class="fas fa-times"></i>
          </button>
        </td>
      </tr>`;
    }).join('');

    if (countEl) countEl.textContent = items.length + ' item' + (items.length > 1 ? 's' : '') + ' added';
    if (totalEl) totalEl.textContent = 'Total: ₱' + totalBudget.toLocaleString('en-PH', {minimumFractionDigits:2});
  };

  /** Auto-fill description, budget, and category from selected item (for edit modal single-item mode). */
  window.autofillFromItem = function(itemId) {
    if (!itemId) return;
    const allItems = window._ppmpItemsCache || [];
    const item = allItems.find(i => String(i.id) === String(itemId));
    if (!item) return;
    const descField = document.getElementById('ppmpDescription');
    const budgetField = document.getElementById('ppmpBudget');
    const catField = document.getElementById('ppmpCategory');
    const sectionField = document.getElementById('ppmpSection');

    // Auto-fill category from item catalog category
    if (catField && item.category) {
      // Handle both <select> and <input type="hidden">
      if (catField.tagName === 'SELECT') {
        let found = false;
        for (let i = 0; i < catField.options.length; i++) {
          if (catField.options[i].value === item.category) { found = true; break; }
        }
        if (!found) {
          const opt = document.createElement('option');
          opt.value = item.category;
          opt.textContent = item.category;
          catField.appendChild(opt);
        }
      }
      catField.value = item.category;
    }
    // Auto-fill section from category→section mapping
    if (sectionField && item.category) {
      const autoSection = CATEGORY_TO_SECTION[item.category] || 'GENERAL PROCUREMENT';
      sectionField.value = autoSection;
    }
    // Build description in Excel PPMP bullet format
    if (descField) {
      descField.value = buildItemDescription(item);
    }
    if (budgetField && (!budgetField.value || budgetField.value === '0' || budgetField.value === '0.00')) {
      budgetField.value = parseFloat(item.unit_price || 0).toFixed(2);
    }
  };

  /**
   * Save New Purchase Request
   */
  window.saveNewPR = async function(e) {
    e.preventDefault();
    const prNumber = document.getElementById('prNumber')?.value || '';
    const prDate = document.getElementById('prDate')?.value || '';
    const purpose = document.getElementById('prPurpose')?.value || '';

    if (!purpose) { alert('Please enter the purpose.'); return; }

    // Parse items from table
    const items = [];
    const rows = document.getElementById('prItemsBody')?.querySelectorAll('tr') || [];
    rows.forEach((row, idx) => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 6) {
        const unit = cells[1].querySelector('select')?.value || 'Lot';
        const desc = cells[2].querySelector('textarea')?.value || '';
        const qty = parseFloat(cells[3].querySelector('input')?.value) || 0;
        const unitPrice = parseFloat(cells[4].querySelector('input')?.value) || 0;
        if (desc || qty > 0) {
          items.push({
            item_code: 'PR-ITEM-' + (idx + 1),
            item_name: desc.substring(0, 100),
            item_description: desc,
            unit: unit,
            quantity: qty,
            unit_price: unitPrice,
            category: 'general'
          });
        }
      }
    });

    const totalText = document.getElementById('prTotalAmount')?.textContent || '0';
    const totalAmount = parseFloat(totalText.replace(/[^\d.]/g, '')) || 0;

    if (!confirm('Are you sure you want to save this Purchase Request?')) return;

    try {
      const data = {
        pr_number: prNumber,
        purpose: purpose,
        total_amount: totalAmount,
        status: 'pending_approval',
        item_specifications: document.getElementById('prItemSpecs')?.value.trim() || null,
        items: items
      };
      const result = await apiRequest('/purchase-requests', 'POST', data);
      const prId = result.id || result.pr_id;
      if (prId) {
        await uploadAttachments('purchase_request', prId, [
          { inputId: 'prRouteSlip', description: 'Route Slip / Annex 1' },
          { inputId: 'prTechSpecs', description: 'Technical Specifications / TOR' }
        ]);
      }
      alert('Purchase Request saved successfully!');
      closeModal();
      if (typeof loadPurchaseRequests === 'function') loadPurchaseRequests();
      else if (typeof loadPageData === 'function') loadPageData();
    } catch (err) {
      alert('Error saving PR: ' + err.message);
    }
  };

  /**
   * Save New RFQ
   */
  window.saveNewRFQ = async function(e) {
    e.preventDefault();
    const rfqNumber = document.getElementById('rfqNumber')?.value || '';
    const rfqDate = document.getElementById('rfqDate')?.value || '';
    const prId = document.getElementById('rfqLinkedPR')?.value || '';
    const deadline = document.getElementById('rfqDeadline')?.value || '';
    const abcAmount = parseFloat(document.getElementById('rfqABC')?.value) || 0;

    // Parse items from table
    const items = [];
    const rows = document.getElementById('rfqItemsBody')?.querySelectorAll('tr') || [];
    rows.forEach((row, idx) => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 4) {
        const qty = parseFloat(cells[0].querySelector('input')?.value) || 0;
        const unit = cells[1].querySelector('select')?.value || 'Lot';
        const desc = cells[2].querySelector('textarea')?.value || '';
        const abc = parseFloat(cells[3].querySelector('input')?.value) || 0;
        if (desc || qty > 0) {
          items.push({
            item_code: 'RFQ-ITEM-' + (idx + 1),
            item_name: desc.substring(0, 100),
            item_description: desc,
            unit: unit,
            quantity: qty,
            abc_unit_cost: abc
          });
        }
      }
    });

    if (!confirm('Are you sure you want to save this RFQ?')) return;

    try {
      const data = {
        rfq_number: rfqNumber,
        pr_id: prId ? parseInt(prId) : null,
        date_prepared: rfqDate || null,
        submission_deadline: deadline || null,
        abc_amount: abcAmount,
        status: 'on_going',
        item_specifications: document.getElementById('rfqItemSpecs')?.value.trim() || null,
        items: items
      };
      const result = await apiRequest('/rfqs', 'POST', data);
      const rfqId = result.id || result.rfq_id;
      if (rfqId) {
        await uploadAttachments('rfq', rfqId, [
          { inputId: 'rfqDocument', description: 'RFQ Document (Signed)' },
          { inputId: 'rfqTechSpecs', description: 'Technical Specifications / TOR' }
        ]);
      }
      alert('RFQ saved successfully!');
      closeModal();
      if (typeof loadRFQs === 'function') loadRFQs();
      else if (typeof loadPageData === 'function') loadPageData();
    } catch (err) {
      alert('Error saving RFQ: ' + err.message);
    }
  };

  /**
   * Save New Abstract of Quotations
   */
  window.saveNewAbstract = async function(e) {
    e.preventDefault();
    const abstractNumber = document.getElementById('abstractNumber')?.value || '';
    const abstractDate = document.getElementById('abstractDate')?.value || '';
    const rfqId = document.getElementById('abstractLinkedRFQ')?.value || '';
    const purpose = document.getElementById('abstractPurpose')?.value || '';

    // Gather supplier names
    const supplier1Name = document.getElementById('absSupplier1Name')?.value?.trim() || '';
    const supplier2Name = document.getElementById('absSupplier2Name')?.value?.trim() || '';
    const supplier3Name = document.getElementById('absSupplier3Name')?.value?.trim() || '';

    // Calculate totals for each supplier from the items table
    let s1Total = 0, s2Total = 0, s3Total = 0;
    const itemRows = document.querySelectorAll('#abstractItemsBody tr');
    itemRows.forEach(row => {
      const inputs = row.querySelectorAll('input[type="number"]');
      if (inputs.length >= 8) {
        s1Total += parseFloat(inputs[4]?.value) || 0; // S1 total price
        s2Total += parseFloat(inputs[6]?.value) || 0; // S2 total price
        s3Total += parseFloat(inputs[8]?.value) || 0; // S3 total price  -- CORRECTED: indexes are 0=qty, 1=abc, 2=s1unit, 3=s1total, 4=s2unit, 5=s2total, 6=s3unit, 7=s3total
      }
    });

    // Re-calculate — supplier totals based on readonly total fields
    s1Total = 0; s2Total = 0; s3Total = 0;
    itemRows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 10) {
        // Total price fields are at index 5 (s1), 7 (s2), 9 (s3) — the readonly ones
        const s1t = parseFloat(cells[5]?.querySelector('input')?.value) || 0;
        const s2t = parseFloat(cells[7]?.querySelector('input')?.value) || 0;
        const s3t = parseFloat(cells[9]?.querySelector('input')?.value) || 0;
        s1Total += s1t;
        s2Total += s2t;
        s3Total += s3t;
      }
    });

    // Determine recommended (lowest) supplier
    const supplierBids = [];
    if (supplier1Name && s1Total > 0) supplierBids.push({ name: supplier1Name, total: s1Total });
    if (supplier2Name && s2Total > 0) supplierBids.push({ name: supplier2Name, total: s2Total });
    if (supplier3Name && s3Total > 0) supplierBids.push({ name: supplier3Name, total: s3Total });
    supplierBids.sort((a, b) => a.total - b.total);
    const recommendedSupplier = supplierBids.length > 0 ? supplierBids[0] : null;

    if (!confirm('Are you sure you want to submit this Abstract of Quotations?')) return;

    try {
      const data = {
        abstract_number: abstractNumber,
        rfq_id: rfqId ? parseInt(rfqId) : null,
        date_prepared: abstractDate || null,
        purpose: purpose,
        status: 'on_going',
        item_specifications: document.getElementById('abstractItemSpecs')?.value.trim() || null,
        recommended_supplier_name: recommendedSupplier ? recommendedSupplier.name : null,
        recommended_amount: recommendedSupplier ? recommendedSupplier.total : null
      };
      const result = await apiRequest('/abstracts', 'POST', data);
      const absId = result.id || result.abstract_id;
      if (absId) {
        await uploadAttachments('abstract', absId, [
          { inputId: 'abstractDocument', description: 'Abstract of Quotations (Signed)' },
          { inputId: 'supplierQuotations', description: 'Supplier Quotations (Scanned)' }
        ]);
      }
      alert('Abstract of Quotations saved successfully!');
      closeModal();
      if (typeof loadAbstracts === 'function') loadAbstracts();
      else if (typeof loadPageData === 'function') loadPageData();
    } catch (err) {
      alert('Error saving Abstract: ' + err.message);
    }
  };

  /**
   * Save New Notice of Award
   */
  window.saveNewNOA = async function(e) {
    e.preventDefault();
    const noaNumber = document.getElementById('noaNumber')?.value || '';
    const noaDate = document.getElementById('noaDate')?.value || '';
    const bacResId = document.getElementById('noaLinkedBAC')?.value || '';
    const contractAmount = parseFloat(document.getElementById('noaContractAmount')?.value) || 0;

    if (!confirm('Are you sure you want to issue this Notice of Award?')) return;

    try {
      const data = {
        noa_number: noaNumber,
        bac_resolution_id: bacResId ? parseInt(bacResId) : null,
        contract_amount: contractAmount,
        date_issued: noaDate || null,
        status: 'issued'
      };
      const result = await apiRequest('/notices-of-award', 'POST', data);
      const noaId = result.id || result.noa_id;
      if (noaId) {
        await uploadAttachments('notice_of_award', noaId, [
          { inputId: 'noaDocument', description: 'NOA Document (Signed by HoPE)' }
        ]);
      }
      alert('Notice of Award issued successfully!');
      closeModal();
      if (typeof loadNOAs === 'function') loadNOAs();
      else if (typeof loadPageData === 'function') loadPageData();
    } catch (err) {
      alert('Error issuing NOA: ' + err.message);
    }
  };

  /**
   * Save New Purchase Order
   */
  window.saveNewPO = async function(e) {
    e.preventDefault();
    const poNumber = document.getElementById('poNumber')?.value || '';
    const poDate = document.getElementById('poDate')?.value || '';
    const supplier = document.getElementById('poSupplier')?.value || '';
    const procMode = document.getElementById('poProcMode')?.value || '';
    const placeDelivery = document.getElementById('poPlaceDelivery')?.value || '';
    const deliveryTerm = document.getElementById('poDeliveryTerm')?.value || '';
    const deliveryDate = document.getElementById('poDeliveryDate')?.value || '';
    const paymentTerm = document.getElementById('poPaymentTerm')?.value || 'Government Terms';
    const noaId = document.getElementById('poLinkedNOA')?.value || '';
    const purpose = document.getElementById('poPurpose')?.value || '';
    const totalAmount = parseFloat(document.getElementById('poTotalAmount')?.value) || 0;

    // Parse items from table
    const items = [];
    const rows = document.getElementById('poItemsBody')?.querySelectorAll('tr') || [];
    rows.forEach((row, idx) => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 6) {
        const unit = cells[1].querySelector('select')?.value || 'Lot';
        const desc = cells[2].querySelector('textarea')?.value || '';
        const qty = parseFloat(cells[3].querySelector('input')?.value) || 0;
        const unitPrice = parseFloat(cells[4].querySelector('input')?.value) || 0;
        if (desc || qty > 0) {
          items.push({
            item_code: 'PO-ITEM-' + (idx + 1),
            item_name: desc.substring(0, 100),
            item_description: desc,
            unit: unit,
            quantity: qty,
            unit_price: unitPrice
          });
        }
      }
    });

    if (!confirm('Are you sure you want to save this Purchase Order?')) return;

    try {
      const data = {
        po_number: poNumber,
        noa_id: noaId ? parseInt(noaId) : null,
        total_amount: totalAmount,
        payment_terms: paymentTerm,
        delivery_address: placeDelivery,
        status: 'for_signing',
        workflow_status: 'pending',
        expected_delivery_date: deliveryDate || null,
        po_date: poDate || null,
        purpose: purpose,
        mode_of_procurement: procMode,
        place_of_delivery: placeDelivery,
        item_specifications: document.getElementById('poItemSpecs')?.value.trim() || null,
        items: items
      };
      const result = await apiRequest('/purchase-orders', 'POST', data);
      const poId = result.id || result.po_id;
      if (poId) {
        await uploadAttachments('purchase_order', poId, [
          { inputId: 'poDocument', description: 'Purchase Order Document (Signed)' },
          { inputId: 'poSupplierConforme', description: 'Supplier Conforme / Signed PO' }
        ]);
      }
      alert('Purchase Order saved successfully!');
      closeModal();
      if (typeof loadPurchaseOrders === 'function') loadPurchaseOrders();
      else if (typeof loadPageData === 'function') loadPageData();
    } catch (err) {
      alert('Error saving PO: ' + err.message);
    }
  };

  /**
   * Save New IAR
   */
  window.saveNewIAR = async function(e) {
    e.preventDefault();
    const iarNumber = document.getElementById('iarNumber')?.value || '';
    const iarDate = document.getElementById('iarDate')?.value || '';
    const poId = document.getElementById('iarLinkedPO')?.value || '';
    const invoiceNo = document.getElementById('iarInvoiceNo')?.value || '';
    const inspectionDate = document.getElementById('iarInspectionDate')?.value || '';
    const acceptance = document.querySelector('input[name="acceptanceType"]:checked')?.value || 'complete';

    // Parse items from table
    const items = [];
    const rows = document.getElementById('iarItemsBody')?.querySelectorAll('tr') || [];
    rows.forEach((row, idx) => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 4) {
        const stockNo = cells[0].querySelector('input')?.value || '';
        const desc = cells[1].querySelector('textarea')?.value || '';
        const unit = cells[2].querySelector('select')?.value || 'Lot';
        const qty = parseFloat(cells[3].querySelector('input')?.value) || 0;
        if (desc || qty > 0) {
          items.push({
            item_code: stockNo || 'IAR-ITEM-' + (idx + 1),
            item_name: desc.substring(0, 100),
            quantity: qty,
            unit_cost: 0,
            category: 'general'
          });
        }
      }
    });

    if (!confirm('Are you sure you want to complete this IAR?')) return;

    try {
      const data = {
        iar_number: iarNumber,
        po_id: poId ? parseInt(poId) : null,
        inspection_date: inspectionDate || null,
        delivery_date: iarDate || null,
        invoice_number: invoiceNo,
        acceptance: acceptance,
        item_specifications: document.getElementById('iarItemSpecs')?.value.trim() || null,
        items: items
      };
      const result = await apiRequest('/iars', 'POST', data);
      const iarId = result.id || result.iar_id;
      if (iarId) {
        await uploadAttachments('iar', iarId, [
          { inputId: 'iarDocument', description: 'IAR Document (Appendix 62)' },
          { inputId: 'iarInvoice', description: 'Supplier Invoice' },
          { inputId: 'iarDeliveryReceipt', description: 'Delivery Receipt' }
        ]);
      }
      alert('IAR completed successfully!');
      closeModal();
      if (typeof loadIARs === 'function') loadIARs();
      else if (typeof loadPageData === 'function') loadPageData();
    } catch (err) {
      alert('Error saving IAR: ' + err.message);
    }
  };

  /**
   * Save New BAC Resolution
   */
  window.saveNewBACResolution = async function(e) {
    e.preventDefault();
    const resNumber = document.getElementById('bacResNumber')?.value || '';
    const series = document.getElementById('bacResSeries')?.value || String(getCurrentFiscalYear());
    const subject = document.getElementById('bacResSubject')?.value || '';
    const abstractId = document.getElementById('bacResLinkedAbstract')?.value || '';
    const abcAmount = parseFloat(document.getElementById('bacResABC')?.value) || 0;
    const contractPrice = parseFloat(document.getElementById('bacResContractPrice')?.value) || 0;

    if (!subject) { alert('Please enter the resolution subject.'); return; }
    if (!confirm('Are you sure you want to submit this BAC Resolution?')) return;

    try {
      const data = {
        resolution_number: resNumber,
        abstract_id: abstractId ? parseInt(abstractId) : null,
        resolution_date: new Date().toISOString().split('T')[0],
        procurement_mode: 'SVP',
        abc_amount: abcAmount,
        bid_amount: contractPrice,
        status: 'on_going'
      };
      const result = await apiRequest('/bac-resolutions', 'POST', data);
      const bacId = result.id || result.bac_resolution_id;
      if (bacId) {
        await uploadAttachments('bac_resolution', bacId, [
          { inputId: 'bacResDocument', description: 'BAC Resolution Document (Signed)' },
          { inputId: 'bacResPostQual', description: 'Post-Qualification Report' }
        ]);
      }
      alert('BAC Resolution submitted successfully!');
      closeModal();
      if (typeof loadBACResolutions === 'function') loadBACResolutions();
      else if (typeof loadPageData === 'function') loadPageData();
    } catch (err) {
      alert('Error saving BAC Resolution: ' + err.message);
    }
  };

  /**
   * Save New Post-Qualification / TWG Report
   */
  window.saveNewPostQual = async function(e) {
    e.preventDefault();
    const postQualNumber = document.getElementById('postQualNumber')?.value || '';
    const postQualDate = document.getElementById('postQualDate')?.value || '';
    const subject = document.getElementById('postQualSubject')?.value || '';
    const abstractId = document.getElementById('postQualLinkedAbstract')?.value || '';

    if (!subject) { alert('Please enter the subject.'); return; }
    if (!confirm('Are you sure you want to submit this TWG Report?')) return;

    try {
      const data = {
        postqual_number: postQualNumber,
        abstract_id: abstractId ? parseInt(abstractId) : null,
        bidder_name: subject,
        status: 'on_going'
      };
      const result = await apiRequest('/post-qualifications', 'POST', data);
      const pqId = result.id || result.postqual_id;
      if (pqId) {
        await uploadAttachments('post_qualification', pqId, [
          { inputId: 'postQualReport', description: 'TWG Report Document' },
          { inputId: 'postQualBidderDocs', description: 'Bidder Documents' }
        ]);
      }
      alert('TWG Report submitted successfully!');
      closeModal();
      if (typeof loadPostQualifications === 'function') loadPostQualifications();
      else if (typeof loadPageData === 'function') loadPageData();
    } catch (err) {
      alert('Error saving TWG Report: ' + err.message);
    }
  };

  // ============================================================
  // WORKFLOW MODAL HANDLERS (Upload Files to Existing Entities)
  // ============================================================

  /**
   * Handle Accept PO — upload conforme attachment
   */
  window.handleAcceptPO = async function(e) {
    e.preventDefault();
    const acceptedAt = document.getElementById('acceptedAt')?.value || '';
    if (!acceptedAt) { alert('Please select the accepted date/time.'); return; }
    if (!confirm('Mark this PO as accepted?')) return;
    try {
      // Upload conforme attachment if provided
      const conformeInput = document.getElementById('conformeAttachment');
      if (conformeInput && conformeInput.files && conformeInput.files.length > 0) {
        await uploadAttachments('purchase_order_conforme', 0, [
          { inputId: 'conformeAttachment', description: 'PO Conforme / Acceptance' }
        ]);
      }
      alert('PO marked as accepted!');
      closeModal();
      if (typeof loadPageData === 'function') loadPageData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  /**
   * Handle Compile Packet — upload merged PDF
   */
  window.handleCompilePacket = async function(e) {
    e.preventDefault();
    if (!confirm('Compile this PO packet?')) return;
    try {
      const mergedInput = document.getElementById('mergedPacket');
      if (mergedInput && mergedInput.files && mergedInput.files.length > 0) {
        await uploadAttachments('purchase_order_packet', 0, [
          { inputId: 'mergedPacket', description: 'Merged PO Packet PDF' }
        ]);
      }
      alert('PO Packet compiled successfully!');
      closeModal();
      if (typeof loadPageData === 'function') loadPageData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  /**
   * Handle Chief Sign — upload signed page
   */
  window.handleChiefSign = async function(e) {
    e.preventDefault();
    if (!confirm('Record Chief signature?')) return;
    try {
      const signedPage = document.getElementById('chiefSignedPage');
      if (signedPage && signedPage.files && signedPage.files.length > 0) {
        await uploadAttachments('purchase_order_chief_sign', 0, [
          { inputId: 'chiefSignedPage', description: 'Chief Signed Page' }
        ]);
      }
      alert('Chief signature recorded!');
      closeModal();
      if (typeof loadPageData === 'function') loadPageData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  /**
   * Handle Director Sign — upload signed page
   */
  window.handleDirectorSign = async function(e) {
    e.preventDefault();
    if (!confirm('Record Director signature?')) return;
    try {
      const signedPage = document.getElementById('directorSignedPage');
      if (signedPage && signedPage.files && signedPage.files.length > 0) {
        await uploadAttachments('purchase_order_director_sign', 0, [
          { inputId: 'directorSignedPage', description: 'Director Signed Page' }
        ]);
      }
      alert('Director signature recorded!');
      closeModal();
      if (typeof loadPageData === 'function') loadPageData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  /**
   * Handle Attach Annex 1 — upload annex files to PR
   */
  window.handleAttachAnnex1 = async function(e) {
    e.preventDefault();
    const annex1Input = document.getElementById('annex1File');
    if (!annex1Input || !annex1Input.files || annex1Input.files.length === 0) {
      alert('Please select the Annex 1 file.'); return;
    }
    if (!confirm('Attach these documents?')) return;
    try {
      await uploadAttachments('purchase_request_annex', 0, [
        { inputId: 'annex1File', description: 'Annex 1 / APP Reference' },
        { inputId: 'techSpecsFile', description: 'Technical Specifications' }
      ]);
      alert('Documents attached successfully!');
      closeModal();
      if (typeof loadPageData === 'function') loadPageData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  /**
   * Handle Add Quotation — upload quotation to RFQ
   */
  window.handleAddQuotation = async function(e) {
    e.preventDefault();
    if (!confirm('Add this quotation?')) return;
    try {
      const quotationInput = document.getElementById('quotationFile');
      if (quotationInput && quotationInput.files && quotationInput.files.length > 0) {
        await uploadAttachments('rfq_quotation', 0, [
          { inputId: 'quotationFile', description: 'Supplier Quotation' }
        ]);
      }
      alert('Quotation added successfully!');
      closeModal();
      if (typeof loadPageData === 'function') loadPageData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  /**
   * Handle Mark NOA Received — upload receipt
   */
  window.handleMarkNOAReceived = async function(e) {
    e.preventDefault();
    if (!confirm('Mark this NOA as received by the bidder?')) return;
    try {
      const receiptInput = document.getElementById('noaReceiptFile');
      if (receiptInput && receiptInput.files && receiptInput.files.length > 0) {
        await uploadAttachments('notice_of_award_receipt', 0, [
          { inputId: 'noaReceiptFile', description: 'NOA Receipt Confirmation' }
        ]);
      }
      alert('NOA marked as received!');
      closeModal();
      if (typeof loadPageData === 'function') loadPageData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  window.showNewUserModal = async function() {
    // Load employees for linking and ensure divisions cached
    let employees = [];
    try { [employees] = await Promise.all([apiRequest('/employees'), ensureDivisionsLoaded()]); } catch(e) {}
    const empOptions = employees.map(e => `<option value="${e.id}">${e.full_name} (${e.employee_code || 'N/A'})</option>`).join('');
    
    const allRoles = [
      { value: 'end_user', label: 'End User' },
      { value: 'division_head', label: 'Division Head' },
      { value: 'bac_secretariat', label: 'BAC Secretariat' },
      { value: 'bac_chair', label: 'BAC Chairperson' },
      { value: 'twg_member', label: 'TWG Member' },
      { value: 'supply_officer', label: 'Supply/Procurement Officer' },
      { value: 'inspector', label: 'Inspection/Property Custodian' },
      { value: 'hope', label: 'HoPE (Regional Director)' },
      { value: 'ord_manager', label: 'ORD Manager' },
      { value: 'chief_fad', label: 'Chief FAD' },
      { value: 'chief_wrsd', label: 'Chief WRSD' },
      { value: 'chief_mwpsd', label: 'Chief MWPSD' },
      { value: 'chief_mwptd', label: 'Chief MWPTD' },
      { value: 'manager', label: 'Manager' },
      { value: 'officer', label: 'Officer' },
      { value: 'viewer', label: 'Viewer' },
      { value: 'auditor', label: 'Auditor' },
      { value: 'admin', label: 'System Administrator' }
    ];
    const roleOpts = allRoles.map(r => `<option value="${r.value}">${r.label}</option>`).join('');
    
    const html = `
      <form id="userForm" onsubmit="saveNewUser(event)">
        <div class="form-section-header purple"><i class="fas fa-user-shield"></i> Account Information</div>
        <div class="form-row">
          <div class="form-group">
            <label>Username <span class="text-danger">*</span></label>
            <input type="text" id="newUsername" placeholder="e.g., john.doe" required>
          </div>
          <div class="form-group">
            <label>Password <span class="text-danger">*</span></label>
            <input type="password" id="newPassword" placeholder="Minimum 6 characters" required minlength="6">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Full Name <span class="text-danger">*</span></label>
            <input type="text" id="newFullName" placeholder="Full name" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="newEmail" placeholder="Email address">
          </div>
        </div>
        <div class="form-section-header blue"><i class="fas fa-building"></i> Role & Division</div>
        <div class="form-row">
          <div class="form-group">
            <label>Role <span class="text-danger">*</span></label>
            <select class="form-select" id="newRole" required>${roleOpts}</select>
          </div>
          <div class="form-group">
            <label>Division</label>
            <select class="form-select" id="newDivision">
              <option value="">None</option>
              ${buildDivisionOptionsById('', false, 'long')}
            </select>
          </div>
        </div>
        <div class="form-section-header green"><i class="fas fa-link"></i> Link to Employee Record (Optional)</div>
        <div class="form-group">
          <label>Employee</label>
          <select class="form-select" id="newEmployeeId">
            <option value="">-- No linked employee --</option>
            ${empOptions}
          </select>
          <small style="color:#666;margin-top:4px;display:block;">Link this user account to an existing employee record for property accountability.</small>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-user-plus"></i> Create User</button>
        </div>
      </form>
    `;
    openModal('Create New User', html);
  };

  // Save new user via API
  window.saveNewUser = async function(e) {
    e.preventDefault();
    const data = {
      username: document.getElementById('newUsername').value.trim(),
      password: document.getElementById('newPassword').value,
      full_name: document.getElementById('newFullName').value.trim(),
      email: document.getElementById('newEmail')?.value || '',
      role: document.getElementById('newRole').value,
      dept_id: parseInt(document.getElementById('newDivision').value) || null,
      employee_id: parseInt(document.getElementById('newEmployeeId')?.value) || null
    };
    
    if (!data.username || !data.password || !data.full_name) {
      alert('Please fill in all required fields.');
      return;
    }
    
    if (!confirm(`Create user "${data.username}" with role: ${formatRole(data.role)}?`)) return;
    try {
      await apiRequest('/users', 'POST', data);
      showToast('User created successfully!', 'success');
      closeModal();
      loadUsers();
    } catch (err) {
      alert('Error creating user: ' + err.message);
    }
  };

  // ==================== INVENTORY MODULE MODALS ====================

  // Stock Card Entry Modal
  window.showNewStockCardModal = function() {
    const html = `
      <form id="stockCardForm" onsubmit="saveNewStockCard(event)">
        <div class="form-row">
          <div class="form-group">
            <label>Transaction No.</label>
            <input type="text" id="scTransNo" placeholder="Auto-generated" readonly>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="scDate" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Item</label>
            <select class="form-select" id="scItemId" required>
              <option value="">-- Select Item --</option>
            </select>
          </div>
          <div class="form-group">
            <label>Reference</label>
            <input type="text" id="scReference" placeholder="e.g., IAR-${getCurrentFiscalYear()}-001">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Receipt Qty</label>
            <input type="number" id="scReceiptQty" placeholder="0" min="0" value="0">
          </div>
          <div class="form-group">
            <label>Receipt Unit Cost</label>
            <input type="number" id="scReceiptUnitCost" placeholder="0.00" step="0.01" min="0" value="0">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Issue Qty</label>
            <input type="number" id="scIssueQty" placeholder="0" min="0" value="0">
          </div>
          <div class="form-group">
            <label>Issue Unit Cost</label>
            <input type="number" id="scIssueUnitCost" placeholder="0.00" step="0.01" min="0" value="0">
          </div>
        </div>
        <div class="form-group">
          <label>Remarks</label>
          <textarea id="scRemarks" rows="2" placeholder="Optional remarks"></textarea>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Stock Card Entry</button>
        </div>
      </form>
    `;
    openModal('New Stock Card Entry', html);
    // Populate items dropdown
    loadItemsDropdown('scItemId');
  };

  window.saveNewStockCard = async function(e) {
    e.preventDefault();
    const data = {
      item_id: parseInt(document.getElementById('scItemId').value),
      date: document.getElementById('scDate').value,
      reference: document.getElementById('scReference').value,
      receipt_qty: parseInt(document.getElementById('scReceiptQty').value) || 0,
      receipt_unit_cost: parseFloat(document.getElementById('scReceiptUnitCost').value) || 0,
      issue_qty: parseInt(document.getElementById('scIssueQty').value) || 0,
      issue_unit_cost: parseFloat(document.getElementById('scIssueUnitCost').value) || 0,
      remarks: document.getElementById('scRemarks').value
    };
    if (!confirm('Are you sure you want to save this stock card entry?')) return;
    try {
      await apiRequest('/stock-cards', 'POST', data);
      alert('Stock card entry saved!');
      closeModal();
      loadStockCards();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Property Card Modal
  window.showNewPropertyCardModal = async function() {
    await ensureDivisionsLoaded();
    const html = `
      <form id="propertyCardForm" onsubmit="saveNewPropertyCard(event)">
        <div class="form-row">
          <div class="form-group">
            <label>Property Number</label>
            <input type="text" id="pcPropertyNo" placeholder="Auto-generated" readonly>
          </div>
          <div class="form-group">
            <label>Acquisition Date</label>
            <input type="date" id="pcAcqDate" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="pcDescription" rows="2" placeholder="Property description" required></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Item (from Catalog)</label>
            <select class="form-select" id="pcItemId">
              <option value="">-- Select Item --</option>
            </select>
          </div>
          <div class="form-group">
            <label>Serial No.</label>
            <input type="text" id="pcSerialNo" placeholder="e.g., SN-12345">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Acquisition Cost</label>
            <input type="number" id="pcAcqCost" placeholder="0.00" step="0.01" min="0" required>
          </div>
          <div class="form-group">
            <label>Estimated Useful Life (yrs)</label>
            <input type="number" id="pcUsefulLife" placeholder="5" min="1" value="5">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Issued To (Employee)</label>
            <select class="form-select" id="pcIssuedTo">
              <option value="">-- Select Employee --</option>
            </select>
          </div>
          <div class="form-group">
            <label>Department</label>
            <select class="form-select" id="pcDepartment">
              <option value="">-- Select --</option>
              <option value="1">FAD</option>
              <option value="2">WRSD</option>
              <option value="3">MWPSD</option>
              <option value="4">MWPTD</option>
              ${buildDivisionOptionsById('', false)}
          <label>Remarks</label>
          <textarea id="pcRemarks" rows="2" placeholder="Optional remarks"></textarea>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Property Card</button>
        </div>
      </form>
    `;
    openModal('Create Property Card', html);
    loadItemsDropdown('pcItemId');
    loadEmployeesDropdown('pcIssuedTo');
  };

  window.saveNewPropertyCard = async function(e) {
    e.preventDefault();
    const data = {
      description: document.getElementById('pcDescription').value,
      item_id: parseInt(document.getElementById('pcItemId').value) || null,
      serial_no: document.getElementById('pcSerialNo').value,
      acquisition_date: document.getElementById('pcAcqDate').value,
      acquisition_cost: parseFloat(document.getElementById('pcAcqCost').value) || 0,
      estimated_useful_life: parseInt(document.getElementById('pcUsefulLife').value) || 5,
      issued_to: parseInt(document.getElementById('pcIssuedTo').value) || null,
      department_id: parseInt(document.getElementById('pcDepartment').value) || null,
      remarks: document.getElementById('pcRemarks').value
    };
    if (!confirm('Are you sure you want to save this property card?')) return;
    try {
      await apiRequest('/property-cards', 'POST', data);
      alert('Property card created!');
      closeModal();
      loadPropertyCards();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // ICS Modal
  window.showNewICSModal = function() {
    const html = `
      <form id="icsForm" onsubmit="saveNewICS(event)">
        <div class="form-row">
          <div class="form-group">
            <label>ICS No.</label>
            <input type="text" id="icsNo" placeholder="Auto-generated" readonly>
          </div>
          <div class="form-group">
            <label>Date of Issue</label>
            <input type="date" id="icsDateOfIssue" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Property Card</label>
            <select class="form-select" id="icsPropertyId" required>
              <option value="">-- Select Property --</option>
            </select>
          </div>
          <div class="form-group">
            <label>Inventory Item No.</label>
            <input type="text" id="icsInventoryNo" placeholder="e.g., INV-${getCurrentFiscalYear()}-001">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Issued To (Employee)</label>
            <select class="form-select" id="icsIssuedTo" required>
              <option value="">-- Select Employee --</option>
            </select>
          </div>
          <div class="form-group">
            <label>Received By</label>
            <select class="form-select" id="icsReceivedBy">
              <option value="">-- Select Employee --</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="icsDescription" rows="2" placeholder="Item description"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Quantity</label>
            <input type="number" id="icsQty" placeholder="1" min="1" value="1" required>
          </div>
          <div class="form-group">
            <label>Unit Cost</label>
            <input type="number" id="icsUnitCost" placeholder="0.00" step="0.01" min="0">
          </div>
        </div>
        <div class="form-group">
          <label>Remarks</label>
          <textarea id="icsRemarks" rows="2" placeholder="Optional remarks"></textarea>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Issue ICS</button>
        </div>
      </form>
    `;
    openModal('Issue Inventory Custodian Slip (ICS)', html);
    loadPropertyCardsDropdown('icsPropertyId');
    loadEmployeesDropdown('icsIssuedTo');
    loadEmployeesDropdown('icsReceivedBy');
  };

  window.saveNewICS = async function(e) {
    e.preventDefault();
    const data = {
      property_card_id: parseInt(document.getElementById('icsPropertyId').value),
      date_of_issue: document.getElementById('icsDateOfIssue').value,
      inventory_no: document.getElementById('icsInventoryNo').value,
      description: document.getElementById('icsDescription').value,
      quantity: parseInt(document.getElementById('icsQty').value) || 1,
      unit_cost: parseFloat(document.getElementById('icsUnitCost').value) || 0,
      issued_to: parseInt(document.getElementById('icsIssuedTo').value),
      received_by: parseInt(document.getElementById('icsReceivedBy').value) || null,
      remarks: document.getElementById('icsRemarks').value
    };
    if (!confirm('Are you sure you want to issue this ICS?')) return;
    try {
      await apiRequest('/ics', 'POST', data);
      alert('ICS issued successfully!');
      closeModal();
      loadICS();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Employee Modal
  window.showNewEmployeeModal = async function() {
    await ensureDivisionsLoaded();
    const html = `
      <form id="employeeForm" onsubmit="saveNewEmployee(event)">
        <div class="form-row">
          <div class="form-group">
            <label>Employee Code</label>
            <input type="text" id="empCode" placeholder="e.g., EMP-001" required>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select class="form-select" id="empStatus">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" id="empFullName" placeholder="Enter full name" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="empEmail" placeholder="Email address">
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="text" id="empPhone" placeholder="Contact number">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Designation</label>
            <select class="form-select" id="empDesignation">
              <option value="">-- Select Designation --</option>
            </select>
          </div>
          <div class="form-group">
            <label>Department</label>
            <select class="form-select" id="empDepartment">
              <option value="">-- Select --</option>
              <option value="1">FAD</option>
              <option value="2">WRSD</option>
              <option value="3">MWPSD</option>
              <option value="4">MWPTD</option>
              <option value="5">ORD</option>
            </select>
          </div>
        </div>${buildDivisionOptionsById('', false)}
      </form>
    `;
    openModal('Add New Employee', html);
    loadDesignationsDropdown('empDesignation');
  };

  window.saveNewEmployee = async function(e) {
    e.preventDefault();
    const data = {
      employee_code: document.getElementById('empCode').value,
      full_name: document.getElementById('empFullName').value,
      email: document.getElementById('empEmail').value,
      phone: document.getElementById('empPhone').value,
      designation_id: parseInt(document.getElementById('empDesignation').value) || null,
      dept_id: parseInt(document.getElementById('empDepartment').value) || null,
      status: document.getElementById('empStatus').value
    };
    if (!confirm('Are you sure you want to save this employee?')) return;
    try {
      await apiRequest('/employees', 'POST', data);
      alert('Employee saved!');
      closeModal();
      loadEmployees();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Dropdown helper functions for inventory modals
  window.loadItemsDropdown = async function(selectId) {
    try {
      const items = await apiRequest('/items');
      const select = document.getElementById(selectId);
      if (!select) return;
      items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = `${item.code} - ${item.name}`;
        select.appendChild(opt);
      });
    } catch (err) { console.error('Error loading items dropdown:', err); }
  };

  window.loadEmployeesDropdown = async function(selectId, selectedId) {
    try {
      const employees = await apiRequest('/employees');
      const select = document.getElementById(selectId);
      if (!select) return;
      employees.forEach(emp => {
        const opt = document.createElement('option');
        opt.value = emp.id;
        opt.textContent = emp.full_name;
        if (selectedId && emp.id == selectedId) opt.selected = true;
        select.appendChild(opt);
      });
    } catch (err) { console.error('Error loading employees dropdown:', err); }
  };

  window.loadPropertyCardsDropdown = async function(selectId) {
    try {
      const cards = await apiRequest('/property-cards');
      const select = document.getElementById(selectId);
      if (!select) return;
      cards.forEach(card => {
        const opt = document.createElement('option');
        opt.value = card.id;
        opt.textContent = `${card.property_number} - ${card.description}`;
        select.appendChild(opt);
      });
    } catch (err) { console.error('Error loading property cards dropdown:', err); }
  };

  window.loadDesignationsDropdown = async function(selectId) {
    try {
      const designations = await apiRequest('/designations');
      const select = document.getElementById(selectId);
      if (!select) return;
      designations.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = d.name;
        select.appendChild(opt);
      });
    } catch (err) { console.error('Error loading designations dropdown:', err); }
  };

  // Placeholder functions for inventory actions
  window.showViewPropertyLedgerModal = async function(id) {
    openModal('Property Card Details', '<div class="view-details"><p>Loading property card...</p></div>');
    try {
      const pc = await apiRequest('/property-cards/' + id);
      const content = `
        <div class="view-details">
          <div class="info-banner"><i class="fas fa-id-card"></i> <strong>Property Card: ${pc.property_number || 'N/A'}</strong></div>
          <div class="detail-grid">
            <div class="detail-item"><span class="label">Property Number</span><span class="value">${pc.property_number || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Description</span><span class="value">${pc.description || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Acquisition Cost</span><span class="value">₱${parseFloat(pc.acquisition_cost || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</span></div>
            <div class="detail-item"><span class="label">Acquisition Date</span><span class="value">${pc.acquisition_date ? new Date(pc.acquisition_date).toLocaleDateString() : 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Custodian</span><span class="value">${pc.custodian_name || pc.issued_to || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Department</span><span class="value">${pc.department_name || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">ICS No.</span><span class="value">${pc.ics_no || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Status</span><span class="value">${(pc.status || 'active').replace('_', ' ')}</span></div>
            <div class="detail-item"><span class="label">Item ID</span><span class="value">${pc.item_id || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Created At</span><span class="value">${pc.created_at ? new Date(pc.created_at).toLocaleDateString() : 'N/A'}</span></div>
          </div>
        </div>`;
      openModal('Property Card Details', content);
    } catch (err) {
      openModal('Error', '<div class="view-details"><p>Error loading property card: ' + err.message + '</p></div>');
    }
  };
  window.showNewICSFromPropertyModal = function(propertyNo) {
    showNewICSModal();
  };
  window.showEditPropertyCardModal = async function(id) {
    let pc = {};
    try { pc = await apiRequest('/property-cards/' + id); } catch (err) { alert('Could not load property card'); return; }
    const html = `
      <form id="editPCForm" onsubmit="saveEditPropertyCard(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit Property Card #${id}</strong></div>
        <div class="form-row">
          <div class="form-group"><label>Property Number</label><input type="text" id="editPCPropNo" value="${pc.property_number || ''}"></div>
          <div class="form-group"><label>Description</label><input type="text" id="editPCDesc" value="${(pc.description || '').replace(/"/g, '&quot;')}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Acquisition Cost</label><input type="number" step="0.01" id="editPCAcqCost" value="${pc.acquisition_cost || 0}"></div>
          <div class="form-group"><label>Acquisition Date</label><input type="date" id="editPCAcqDate" value="${pc.acquisition_date ? pc.acquisition_date.split('T')[0] : ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Issued To</label><select class="form-select" id="editPCIssuedTo"><option value="">-- Select Employee --</option></select></div>
          <div class="form-group"><label>ICS No.</label><input type="text" id="editPCICS" value="${pc.ics_no || ''}"></div>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select class="form-select" id="editPCStatus">
            <option value="active" ${pc.status==='active'?'selected':''}>Active</option>
            <option value="transferred" ${pc.status==='transferred'?'selected':''}>Transferred</option>
            <option value="disposed" ${pc.status==='disposed'?'selected':''}>Disposed</option>
            <option value="lost" ${pc.status==='lost'?'selected':''}>Lost</option>
          </select>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit Property Card', html);
    loadEmployeesDropdown('editPCIssuedTo', pc.issued_to_employee_id);
  };
  window.saveEditPropertyCard = async function(e, id) {
    e.preventDefault();
    if (!confirm('Save changes?')) return;
    const empSel = document.getElementById('editPCIssuedTo');
    const empName = empSel.options[empSel.selectedIndex]?.textContent || '';
    try {
      await apiRequest('/property-cards/' + id, 'PUT', {
        property_number: document.getElementById('editPCPropNo').value,
        description: document.getElementById('editPCDesc').value,
        acquisition_cost: parseFloat(document.getElementById('editPCAcqCost').value) || 0,
        acquisition_date: document.getElementById('editPCAcqDate').value || null,
        issued_to: empName !== '-- Select Employee --' ? empName : null,
        issued_to_employee_id: parseInt(empSel.value) || null,
        ics_no: document.getElementById('editPCICS').value,
        status: document.getElementById('editPCStatus').value
      });
      showToast('Property Card updated!', 'success'); closeModal(); loadPropertyCards();
    } catch (err) { alert('Error: ' + err.message); }
  };
  window.showViewICSModal = async function(id) {
    openModal('ICS Details', '<div class="view-details"><p>Loading ICS...</p></div>');
    try {
      const ics = await apiRequest('/ics/' + id);
      const content = `
        <div class="view-details">
          <div class="info-banner"><i class="fas fa-exchange-alt"></i> <strong>ICS No: ${ics.ics_no || 'N/A'}</strong></div>
          <div class="detail-grid">
            <div class="detail-item"><span class="label">ICS No.</span><span class="value">${ics.ics_no || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Date of Issue</span><span class="value">${ics.date_of_issue ? new Date(ics.date_of_issue).toLocaleDateString() : 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Property Number</span><span class="value">${ics.property_number || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Description</span><span class="value">${ics.description || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Inventory No.</span><span class="value">${ics.inventory_no || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Quantity</span><span class="value">${ics.quantity || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Unit</span><span class="value">${ics.unit || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Unit Cost</span><span class="value">₱${parseFloat(ics.unit_cost || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</span></div>
            <div class="detail-item"><span class="label">Total Cost</span><span class="value">₱${parseFloat(ics.total_cost || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</span></div>
            <div class="detail-item"><span class="label">Issued To</span><span class="value">${ics.issued_to_name || ics.issued_to || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Received By</span><span class="value">${ics.received_by_name || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">IAR Ref</span><span class="value">${ics.iar_reference || 'N/A'}</span></div>
          </div>
        </div>`;
      openModal('ICS Details', content);
    } catch (err) {
      openModal('Error', '<div class="view-details"><p>Error loading ICS: ' + err.message + '</p></div>');
    }
  };
  window.showEditEmployeeModal = async function(id) {
    let emp = {};
    try { emp = await apiRequest('/employees/' + id); } catch (err) { alert('Could not load employee'); return; }
    const html = `
      <form id="editEmpForm" onsubmit="saveEditEmployee(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit Employee #${id}</strong></div>
        <div class="form-row">
          <div class="form-group"><label>Employee Code</label><input type="text" id="editEmpCode" value="${emp.employee_code || ''}"></div>
          <div class="form-group"><label>Full Name</label><input type="text" id="editEmpName" value="${(emp.full_name || '').replace(/"/g, '&quot;')}" required></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Designation</label><select class="form-select" id="editEmpDesig"><option value="">-- Select --</option></select></div>
          <div class="form-group"><label>Division/Dept</label><select class="form-select" id="editEmpDept"><option value="">-- Select --</option></select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Email</label><input type="email" id="editEmpEmail" value="${emp.email || ''}"></div>
          <div class="form-group"><label>Phone</label><input type="text" id="editEmpPhone" value="${emp.phone || ''}"></div>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select class="form-select" id="editEmpStatus">
            <option value="active" ${emp.status==='active'?'selected':''}>Active</option>
            <option value="inactive" ${emp.status==='inactive'?'selected':''}>Inactive</option>
            <option value="resigned" ${emp.status==='resigned'?'selected':''}>Resigned</option>
          </select>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit Employee', html);
    // Load designations dropdown
    try {
      const desigs = await apiRequest('/designations');
      const desigSel = document.getElementById('editEmpDesig');
      desigs.forEach(d => { const o = document.createElement('option'); o.value = d.id; o.textContent = d.name; if (emp.designation_id == d.id) o.selected = true; desigSel.appendChild(o); });
    } catch(e) {}
    // Load departments dropdown
    try {
      const depts = await apiRequest('/departments');
      const deptSel = document.getElementById('editEmpDept');
      depts.forEach(d => { const o = document.createElement('option'); o.value = d.id; o.textContent = d.name; if (emp.dept_id == d.id) o.selected = true; deptSel.appendChild(o); });
    } catch(e) {}
  };
  window.saveEditEmployee = async function(e, id) {
    e.preventDefault();
    if (!confirm('Save changes?')) return;
    try {
      await apiRequest('/employees/' + id, 'PUT', {
        employee_code: document.getElementById('editEmpCode').value,
        full_name: document.getElementById('editEmpName').value,
        designation_id: parseInt(document.getElementById('editEmpDesig').value) || null,
        dept_id: parseInt(document.getElementById('editEmpDept').value) || null,
        email: document.getElementById('editEmpEmail').value,
        phone: document.getElementById('editEmpPhone').value,
        status: document.getElementById('editEmpStatus').value
      });
      showToast('Employee updated!', 'success'); closeModal(); loadEmployees();
    } catch (err) { alert('Error: ' + err.message); }
  };
  window.showViewEmployeeModal = async function(id) {
    let emp = {};
    try { emp = await apiRequest('/employees/' + id); } catch(e) { alert('Could not load employee'); return; }
    const statusClass = { active: 'approved', inactive: 'rejected', retired: 'draft', resigned: 'rejected' };
    const html = `
      <div class="view-details">
        <div class="detail-row"><label>Employee Code:</label><span>${emp.employee_code || '-'}</span></div>
        <div class="detail-row"><label>Full Name:</label><span>${emp.full_name || '-'}</span></div>
        <div class="detail-row"><label>Designation:</label><span>${emp.designation_name || '-'}</span></div>
        <div class="detail-row"><label>Division:</label><span>${emp.department_name || '-'}</span></div>
        <div class="detail-row"><label>Email:</label><span>${emp.email || '-'}</span></div>
        <div class="detail-row"><label>Phone:</label><span>${emp.phone || '-'}</span></div>
        <div class="detail-row"><label>Status:</label><span><span class="status-badge ${statusClass[emp.status] || 'draft'}">${emp.status || 'active'}</span></span></div>
      </div>
      <div class="form-group" style="text-align: right; margin-top: 20px;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        <button type="button" class="btn btn-primary" onclick="closeModal(); showEditEmployeeModal(${id});"><i class="fas fa-edit"></i> Edit</button>
      </div>
    `;
    openModal('View Employee Profile', html);
  };
  window.viewEmployeeProperty = function(id) {
    openModal('Employee Property Accountability', '<div class="view-details"><p>Loading property accountability for employee ID: ' + id + '...</p></div>');
  };
  window.viewItemStockCard = function(itemId) {
    openModal('Stock Card History', '<div class="view-details"><p>Loading stock card for item ID: ' + itemId + '...</p></div>');
  };
  window.viewItemPropertyCard = function(itemId) {
    openModal('Property Card', '<div class="view-details"><p>Loading property card for item ID: ' + itemId + '...</p></div>');
  };

  // ==================== NEW MODULE MODAL FUNCTIONS ====================

  // PAR Modals
  window.showNewPARModal = function() {
    const html = `
      <form id="parForm" onsubmit="saveNewPAR(event)">
        <div class="form-row">
          <div class="form-group">
            <label>Date Issued</label>
            <input type="date" id="parDate" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
          <div class="form-group">
            <label>Fund Cluster</label>
            <input type="text" id="parFundCluster" placeholder="e.g., 01">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Property Number</label>
            <input type="text" id="parPropertyNo" placeholder="Property number" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <input type="text" id="parDescription" placeholder="Item description" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Quantity</label>
            <input type="number" id="parQty" min="1" value="1" required>
          </div>
          <div class="form-group">
            <label>Unit Cost</label>
            <input type="number" id="parUnitCost" step="0.01" placeholder="0.00" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Received By</label>
            <select class="form-select" id="parReceivedBy"><option value="">-- Select Employee --</option></select>
          </div>
          <div class="form-group">
            <label>Issued By</label>
            <select class="form-select" id="parIssuedBy"><option value="">-- Select Employee --</option></select>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save PAR</button>
        </div>
      </form>
    `;
    openModal('New Property Acknowledgement Receipt', html);
    loadEmployeesDropdown('parReceivedBy');
    loadEmployeesDropdown('parIssuedBy');
  };
  window.saveNewPAR = async function(e) {
    e.preventDefault();
    const data = {
      date_issued: document.getElementById('parDate').value,
      fund_cluster: document.getElementById('parFundCluster').value,
      property_number: document.getElementById('parPropertyNo').value,
      description: document.getElementById('parDescription').value,
      quantity: parseInt(document.getElementById('parQty').value),
      unit_cost: parseFloat(document.getElementById('parUnitCost').value),
      total_cost: parseInt(document.getElementById('parQty').value) * parseFloat(document.getElementById('parUnitCost').value),
      received_by: parseInt(document.getElementById('parReceivedBy').value) || null,
      issued_by: parseInt(document.getElementById('parIssuedBy').value) || null
    };
    try { if (!confirm('Are you sure you want to save this PAR?')) return; await apiRequest('/pars', 'POST', data); alert('PAR saved!'); closeModal(); loadPAR(); } catch (err) { alert('Error: ' + err.message); }
  };
  window.showViewPARModal = function(id) { openModal('PAR Details', '<div class="view-details"><p>Loading PAR #' + id + '...</p></div>'); };
  window.showEditPARModal = async function(id) {
    let par = {};
    try { par = await apiRequest('/pars/' + id); } catch (err) { alert('Could not load PAR'); return; }
    const html = `
      <form id="editPARForm" onsubmit="saveEditPAR(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit PAR #${par.par_no || id}</strong></div>
        <div class="form-row">
          <div class="form-group"><label>PAR No.</label><input type="text" id="editPARNo" value="${par.par_no || ''}"></div>
          <div class="form-group"><label>Date Issued</label><input type="date" id="editPARDate" value="${par.date_of_issue ? par.date_of_issue.split('T')[0] : ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>PPE No.</label><input type="text" id="editPARPPE" value="${par.ppe_no || ''}"></div>
          <div class="form-group"><label>Description</label><input type="text" id="editPARDesc" value="${(par.description || '').replace(/"/g, '&quot;')}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Issued To</label><select class="form-select" id="editPARIssuedTo"><option value="">-- Select Employee --</option></select></div>
          <div class="form-group"><label>Received By</label><select class="form-select" id="editPARReceivedBy"><option value="">-- Select Employee --</option></select></div>
        </div>
        <div class="form-group"><label>Other Info</label><textarea id="editPAROther" rows="2">${par.other_info || ''}</textarea></div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit PAR', html);
    loadEmployeesDropdown('editPARIssuedTo', par.issued_to_employee_id);
    loadEmployeesDropdown('editPARReceivedBy', par.received_by_id);
  };
  window.saveEditPAR = async function(e, id) {
    e.preventDefault();
    if (!confirm('Save changes?')) return;
    const issuedSel = document.getElementById('editPARIssuedTo');
    const issuedName = issuedSel.options[issuedSel.selectedIndex]?.textContent || '';
    try {
      await apiRequest('/pars/' + id, 'PUT', {
        par_no: document.getElementById('editPARNo').value,
        date_of_issue: document.getElementById('editPARDate').value || null,
        ppe_no: document.getElementById('editPARPPE').value,
        description: document.getElementById('editPARDesc').value,
        issued_to: issuedName !== '-- Select Employee --' ? issuedName : null,
        issued_to_employee_id: parseInt(issuedSel.value) || null,
        received_by_id: parseInt(document.getElementById('editPARReceivedBy').value) || null,
        other_info: document.getElementById('editPAROther').value
      });
      showToast('PAR updated!', 'success'); closeModal(); loadPAR();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // PTR Modals
  window.showNewPTRModal = function() {
    const html = `
      <form id="ptrForm" onsubmit="saveNewPTR(event)">
        <div class="form-row">
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="ptrDate" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
          <div class="form-group">
            <label>Property Number</label>
            <input type="text" id="ptrPropertyNo" placeholder="Property number" required>
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <input type="text" id="ptrDescription" placeholder="Property description" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Transfer From</label>
            <select class="form-select" id="ptrFrom"><option value="">-- Select Employee --</option></select>
          </div>
          <div class="form-group">
            <label>Transfer To</label>
            <select class="form-select" id="ptrTo"><option value="">-- Select Employee --</option></select>
          </div>
        </div>
        <div class="form-group">
          <label>Reason for Transfer</label>
          <textarea id="ptrReason" rows="3" placeholder="Reason for property transfer"></textarea>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save PTR</button>
        </div>
      </form>
    `;
    openModal('New Property Transfer Report', html);
    loadEmployeesDropdown('ptrFrom');
    loadEmployeesDropdown('ptrTo');
  };
  window.saveNewPTR = async function(e) {
    e.preventDefault();
    const data = {
      date_issued: document.getElementById('ptrDate').value,
      property_number: document.getElementById('ptrPropertyNo').value,
      description: document.getElementById('ptrDescription').value,
      from_officer: parseInt(document.getElementById('ptrFrom').value) || null,
      to_officer: parseInt(document.getElementById('ptrTo').value) || null,
      reason: document.getElementById('ptrReason').value
    };
    try { if (!confirm('Are you sure you want to save this PTR?')) return; await apiRequest('/ptrs', 'POST', data); alert('PTR saved!'); closeModal(); loadPTR(); } catch (err) { alert('Error: ' + err.message); }
  };
  window.showViewPTRModal = function(id) { openModal('PTR Details', '<div class="view-details"><p>Loading PTR #' + id + '...</p></div>'); };
  window.showEditPTRModal = async function(id) {
    let ptr = {};
    try { ptr = await apiRequest('/ptrs/' + id); } catch (err) { alert('Could not load PTR'); return; }
    const html = `
      <form id="editPTRForm" onsubmit="saveEditPTR(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit PTR #${ptr.ptr_no || id}</strong></div>
        <div class="form-row">
          <div class="form-group"><label>PTR No.</label><input type="text" id="editPTRNo" value="${ptr.ptr_no || ''}"></div>
          <div class="form-group"><label>Date</label><input type="date" id="editPTRDate" value="${ptr.date ? ptr.date.split('T')[0] : ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Property Number</label><input type="text" id="editPTRPropNo" value="${ptr.property_number || ''}"></div>
          <div class="form-group"><label>Description</label><input type="text" id="editPTRDesc" value="${(ptr.description || '').replace(/"/g, '&quot;')}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Acquisition Cost</label><input type="number" step="0.01" id="editPTRCost" value="${ptr.acquisition_cost || 0}"></div>
          <div class="form-group">
            <label>Status</label>
            <select class="form-select" id="editPTRStatus">
              <option value="Pending" ${ptr.status==='Pending'?'selected':''}>Pending</option>
              <option value="Completed" ${ptr.status==='Completed'?'selected':''}>Completed</option>
              <option value="Cancelled" ${ptr.status==='Cancelled'?'selected':''}>Cancelled</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Transfer From</label><select class="form-select" id="editPTRFrom"><option value="">-- Select Employee --</option></select></div>
          <div class="form-group"><label>Transfer To</label><select class="form-select" id="editPTRTo"><option value="">-- Select Employee --</option></select></div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit PTR', html);
    loadEmployeesDropdown('editPTRFrom', ptr.from_accountable_officer_id);
    loadEmployeesDropdown('editPTRTo', ptr.to_accountable_officer_id);
  };
  window.saveEditPTR = async function(e, id) {
    e.preventDefault();
    if (!confirm('Save changes?')) return;
    const fromSel = document.getElementById('editPTRFrom');
    const toSel = document.getElementById('editPTRTo');
    const fromName = fromSel.options[fromSel.selectedIndex]?.textContent || '';
    const toName = toSel.options[toSel.selectedIndex]?.textContent || '';
    try {
      await apiRequest('/ptrs/' + id, 'PUT', {
        ptr_no: document.getElementById('editPTRNo').value,
        date: document.getElementById('editPTRDate').value || null,
        property_number: document.getElementById('editPTRPropNo').value,
        description: document.getElementById('editPTRDesc').value,
        acquisition_cost: parseFloat(document.getElementById('editPTRCost').value) || 0,
        status: document.getElementById('editPTRStatus').value,
        from_accountable_officer_id: parseInt(fromSel.value) || null,
        from_accountable_officer_name: fromName !== '-- Select Employee --' ? fromName : null,
        to_accountable_officer_id: parseInt(toSel.value) || null,
        to_accountable_officer_name: toName !== '-- Select Employee --' ? toName : null
      });
      showToast('PTR updated!', 'success'); closeModal(); loadPTR();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // RIS Modals
  window.showNewRISModal = async function() {
    await ensureDivisionsLoaded();
    const html = `
      <form id="risForm" onsubmit="saveNewRIS(event)">
        <div class="form-row">
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="risDate" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
          <div class="form-group">
            <label>Division</label>
            <select class="form-select" id="risDivision">
              <option value="">-- Select --</option>
              ${buildDivisionOptions('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Office</label>
            <input type="text" id="risOffice" placeholder="Office name">
          </div>
          <div class="form-group">
            <label>Purpose</label>
            <input type="text" id="risPurpose" placeholder="Purpose of requisition" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Requested By</label>
            <select class="form-select" id="risRequestedBy"><option value="">-- Select Employee --</option></select>
          </div>
          <div class="form-group">
            <label>Approved By</label>
            <select class="form-select" id="risApprovedBy"><option value="">-- Select Employee --</option></select>
          </div>
        </div>
        <h4 style="margin-top: 15px;">Items</h4>
        <div id="risItemsContainer">
          <div class="form-row ris-item-row">
            <div class="form-group" style="flex:3">
              <label>Item</label>
              <select class="form-select ris-item-select"><option value="">-- Select --</option></select>
            </div>
            <div class="form-group" style="flex:1">
              <label>Qty</label>
              <input type="number" class="ris-item-qty" min="1" value="1">
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-outline" onclick="addRISItemRow()" style="margin-top:5px;"><i class="fas fa-plus"></i> Add Item</button>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save RIS</button>
        </div>
      </form>
    `;
    openModal('New Requisition & Issue Slip', html);
    loadEmployeesDropdown('risRequestedBy');
    loadEmployeesDropdown('risApprovedBy');
    loadItemsDropdown(document.querySelector('.ris-item-select').id || 'risItemSelect0');
    // Load items into the first select
    (async () => {
      try {
        const items = await apiRequest('/items');
        const selects = document.querySelectorAll('.ris-item-select');
        selects.forEach(sel => {
          items.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.id;
            opt.textContent = item.code + ' - ' + item.name;
            sel.appendChild(opt);
          });
        });
      } catch(e) {}
    })();
  };
  window.addRISItemRow = function() {
    const container = document.getElementById('risItemsContainer');
    const row = document.createElement('div');
    row.className = 'form-row ris-item-row';
    row.innerHTML = '<div class="form-group" style="flex:3"><select class="form-select ris-item-select"><option value="">-- Select --</option></select></div><div class="form-group" style="flex:1"><input type="number" class="ris-item-qty" min="1" value="1"></div><div class="form-group" style="flex:0"><button type="button" class="btn btn-danger btn-sm" onclick="this.closest(\'.ris-item-row\').remove()"><i class="fas fa-times"></i></button></div>';
    container.appendChild(row);
    (async () => {
      try {
        const items = await apiRequest('/items');
        const sel = row.querySelector('.ris-item-select');
        items.forEach(item => { const o = document.createElement('option'); o.value = item.id; o.textContent = item.code + ' - ' + item.name; sel.appendChild(o); });
      } catch(e) {}
    })();
  };
  window.saveNewRIS = async function(e) {
    e.preventDefault();
    const itemRows = document.querySelectorAll('.ris-item-row');
    const items = [];
    itemRows.forEach(row => {
      const itemId = row.querySelector('.ris-item-select')?.value;
      const qty = row.querySelector('.ris-item-qty')?.value;
      if (itemId) items.push({ item_id: parseInt(itemId), quantity: parseInt(qty) || 1 });
    });
    const data = {
      date_issued: document.getElementById('risDate').value,
      division: document.getElementById('risDivision').value,
      office: document.getElementById('risOffice').value,
      purpose: document.getElementById('risPurpose').value,
      requested_by: parseInt(document.getElementById('risRequestedBy').value) || null,
      approved_by: parseInt(document.getElementById('risApprovedBy').value) || null,
      items: items
    };
    try { if (!confirm('Are you sure you want to save this RIS?')) return; await apiRequest('/ris', 'POST', data); alert('RIS saved!'); closeModal(); loadRIS(); } catch (err) { alert('Error: ' + err.message); }
  };
  window.showViewRISModal = async function(id) {
    openModal('RIS Details', '<div class="view-details"><p>Loading RIS...</p></div>');
    try {
      const ris = await apiRequest('/ris/' + id);
      const content = `
        <div class="view-details">
          <div class="info-banner"><i class="fas fa-clipboard-list"></i> <strong>RIS No: ${ris.ris_no || 'N/A'}</strong></div>
          <div class="detail-grid">
            <div class="detail-item"><span class="label">RIS No.</span><span class="value">${ris.ris_no || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Date</span><span class="value">${ris.ris_date ? new Date(ris.ris_date).toLocaleDateString() : 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Division</span><span class="value">${ris.division || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Office</span><span class="value">${ris.office || ris.division || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Purpose</span><span class="value">${ris.purpose || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Requested By</span><span class="value">${ris.requested_by_name || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Approved By</span><span class="value">${ris.approved_by_name || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Issued By</span><span class="value">${ris.issued_by_name || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Received By</span><span class="value">${ris.received_by_name || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Status</span><span class="value">${ris.status || 'draft'}</span></div>
          </div>
        </div>`;
      openModal('RIS Details', content);
    } catch (err) {
      openModal('Error', '<div class="view-details"><p>Error loading RIS: ' + err.message + '</p></div>');
    }
  };
  window.showEditRISModal = async function(id) {
    let ris = {};
    try { ris = await apiRequest('/ris/' + id); } catch (err) { alert('Could not load RIS'); return; }
    const html = `
      <form id="editRISForm" onsubmit="saveEditRIS(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit RIS #${ris.ris_no || id}</strong></div>
        <div class="form-row">
    await ensureDivisionsLoaded();
          <div class="form-group"><label>RIS No.</label><input type="text" id="editRISNo" value="${ris.ris_no || ''}"></div>
          <div class="form-group"><label>Date</label><input type="date" id="editRISDate" value="${ris.ris_date ? ris.ris_date.split('T')[0] : ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Division</label>
            <select class="form-select" id="editRISDivision">
              <option value="">-- Select --</option>
              <option value="FAD" ${ris.division==='FAD'?'selected':''}>FAD</option>
              <option value="WRSD" ${ris.division==='WRSD'?'selected':''}>WRSD</option>
              <option value="MWPD" ${ris.division==='MWPD'?'selected':''}>MWPD</option>
              <option value="MWProD" ${ris.division==='MWProD'?'selected':''}>MWProD</option>
              <option value="ORD" ${ris.division==='ORD'?'selected':''}>ORD</option>
            </${buildDivisionOptions(ris.division || '')}ect" id="editRISRequestedBy"><option value="">-- Select Employee --</option></select></div>
          <div class="form-group"><label>Approved By</label><select class="form-select" id="editRISApprovedBy"><option value="">-- Select Employee --</option></select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Issued By</label><select class="form-select" id="editRISIssuedBy"><option value="">-- Select Employee --</option></select></div>
          <div class="form-group"><label>Received By</label><select class="form-select" id="editRISReceivedBy"><option value="">-- Select Employee --</option></select></div>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select class="form-select" id="editRISStatus">
            <option value="DRAFT" ${ris.status==='DRAFT'?'selected':''}>Draft</option>
            <option value="POSTED" ${ris.status==='POSTED'?'selected':''}>Posted</option>
            <option value="CANCELLED" ${ris.status==='CANCELLED'?'selected':''}>Cancelled</option>
          </select>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit RIS', html);
    loadEmployeesDropdown('editRISRequestedBy', ris.requested_by_id);
    loadEmployeesDropdown('editRISApprovedBy', ris.approved_by_id);
    loadEmployeesDropdown('editRISIssuedBy', ris.issued_by_id);
    loadEmployeesDropdown('editRISReceivedBy', ris.received_by_id);
  };
  window.saveEditRIS = async function(e, id) {
    e.preventDefault();
    if (!confirm('Save changes?')) return;
    const reqSel = document.getElementById('editRISRequestedBy');
    const appSel = document.getElementById('editRISApprovedBy');
    const issSel = document.getElementById('editRISIssuedBy');
    const recSel = document.getElementById('editRISReceivedBy');
    const getName = sel => { const t = sel.options[sel.selectedIndex]?.textContent; return t && t !== '-- Select Employee --' ? t : null; };
    try {
      await apiRequest('/ris/' + id, 'PUT', {
        ris_no: document.getElementById('editRISNo').value,
        ris_date: document.getElementById('editRISDate').value || null,
        division: document.getElementById('editRISDivision').value,
        purpose: document.getElementById('editRISPurpose').value,
        status: document.getElementById('editRISStatus').value,
        requested_by_id: parseInt(reqSel.value) || null,
        requested_by_name: getName(reqSel),
        approved_by_id: parseInt(appSel.value) || null,
        approved_by_name: getName(appSel),
        issued_by_id: parseInt(issSel.value) || null,
        issued_by_name: getName(issSel),
        received_by_id: parseInt(recSel.value) || null,
        received_by_name: getName(recSel)
      });
      showToast('RIS updated!', 'success'); closeModal(); loadRIS();
    } catch (err) { alert('Error: ' + err.message); }
  };
  window.postRIS = async function(id) {
    if (!confirm('Post this RIS? Stock balances will be deducted.')) return;
    try { await apiRequest('/ris/' + id + '/post', 'PUT'); alert('RIS posted!'); loadRIS(); } catch (err) { alert('Error: ' + err.message); }
  };

  // Trip Ticket Modals
  window.showNewTripTicketModal = function() {
    const html = `
      <form id="tripForm" onsubmit="saveNewTripTicket(event)">
        <div class="form-row">
          <div class="form-group">
            <label>Date of Trip</label>
            <input type="date" id="tripDate" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
          <div class="form-group">
            <label>Vehicle</label>
            <input type="text" id="tripVehicle" placeholder="Vehicle description" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Plate Number</label>
            <input type="text" id="tripPlate" placeholder="ABC-1234">
          </div>
          <div class="form-group">
            <label>Driver</label>
            <select class="form-select" id="tripDriver"><option value="">-- Select Employee --</option></select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Destination</label>
            <input type="text" id="tripDest" placeholder="Destination" required>
          </div>
          <div class="form-group">
            <label>Purpose</label>
            <input type="text" id="tripPurpose" placeholder="Purpose of trip" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Departure Time</label>
            <input type="time" id="tripDepart">
          </div>
          <div class="form-group">
            <label>Arrival Time</label>
            <input type="time" id="tripArrive">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>KM Before</label>
            <input type="number" id="tripKmBefore" step="0.1">
          </div>
          <div class="form-group">
            <label>KM After</label>
            <input type="number" id="tripKmAfter" step="0.1">
          </div>
        </div>
        <div class="form-group">
          <label>Passengers</label>
          <textarea id="tripPassengers" rows="2" placeholder="List of passengers"></textarea>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Trip Ticket</button>
        </div>
      </form>
    `;
    openModal('New Trip Ticket', html);
    loadEmployeesDropdown('tripDriver');
  };
  window.saveNewTripTicket = async function(e) {
    e.preventDefault();
    const data = {
      date_of_trip: document.getElementById('tripDate').value,
      vehicle_description: document.getElementById('tripVehicle').value,
      plate_number: document.getElementById('tripPlate').value,
      driver_id: parseInt(document.getElementById('tripDriver').value) || null,
      destination: document.getElementById('tripDest').value,
      purpose: document.getElementById('tripPurpose').value,
      departure_time: document.getElementById('tripDepart').value,
      arrival_time: document.getElementById('tripArrive').value,
      km_before: parseFloat(document.getElementById('tripKmBefore').value) || null,
      km_after: parseFloat(document.getElementById('tripKmAfter').value) || null,
      passengers: document.getElementById('tripPassengers').value
    };
    try { if (!confirm('Are you sure you want to save this trip ticket?')) return; await apiRequest('/trip-tickets', 'POST', data); alert('Trip ticket saved!'); closeModal(); loadTripTickets(); } catch (err) { alert('Error: ' + err.message); }
  };
  window.showViewTripTicketModal = async function(id) {
    openModal('Trip Ticket Details', '<div class="view-details"><p>Loading trip ticket #' + id + '...</p></div>');
    try {
      const tt = await apiRequest('/trip-tickets/' + id);
      const content = `
        <div class="view-details">
          <div class="info-banner"><i class="fas fa-car"></i> <strong>Trip Ticket #${tt.trip_ticket_no || id}</strong></div>
          <div class="detail-grid">
            <div class="detail-item"><span class="label">Trip Ticket No.</span><span class="value">${tt.trip_ticket_no || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Requesting Party</span><span class="value">${tt.requesting_party || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Date of Request</span><span class="value">${tt.date_of_request ? new Date(tt.date_of_request).toLocaleDateString() : 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Date of Travel</span><span class="value">${tt.date_of_travel ? new Date(tt.date_of_travel).toLocaleDateString() : 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Return Date</span><span class="value">${tt.return_date ? new Date(tt.return_date).toLocaleDateString() : 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Time of Departure</span><span class="value">${tt.time_of_departure || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Destination</span><span class="value">${tt.destination || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Purpose</span><span class="value">${tt.purpose || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Contact No.</span><span class="value">${tt.contact_no || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Vehicle ID</span><span class="value">${tt.vehicle_id || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Passengers</span><span class="value">${typeof tt.passengers === 'object' ? JSON.stringify(tt.passengers) : (tt.passengers || 'N/A')}</span></div>
            <div class="detail-item"><span class="label">Requested By</span><span class="value">${tt.requested_by_employee || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Approved By</span><span class="value">${tt.approved_by_employee || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Status</span><span class="value">${tt.status || 'N/A'}</span></div>
          </div>
        </div>`;
      openModal('Trip Ticket Details', content);
    } catch (err) {
      openModal('Error', '<div class="view-details"><p>Error loading trip ticket: ' + err.message + '</p></div>');
    }
  };
  window.showEditTripTicketModal = async function(id) {
    let tt = {};
    try { tt = await apiRequest('/trip-tickets/' + id); } catch (err) { alert('Could not load trip ticket'); return; }
    const html = `
      <form id="editTTForm" onsubmit="saveEditTripTicket(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit Trip Ticket #${tt.trip_ticket_no || id}</strong></div>
        <div class="form-row">
          <div class="form-group"><label>Trip Ticket No.</label><input type="text" id="editTTNo" value="${tt.trip_ticket_no || ''}"></div>
          <div class="form-group"><label>Requesting Party</label><input type="text" id="editTTParty" value="${(tt.requesting_party || '').replace(/"/g, '&quot;')}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Date of Request</label><input type="date" id="editTTReqDate" value="${tt.date_of_request ? tt.date_of_request.split('T')[0] : ''}"></div>
          <div class="form-group"><label>Date of Travel</label><input type="date" id="editTTTravelDate" value="${tt.date_of_travel ? tt.date_of_travel.split('T')[0] : ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Return Date</label><input type="date" id="editTTReturnDate" value="${tt.return_date ? tt.return_date.split('T')[0] : ''}"></div>
          <div class="form-group"><label>Contact No.</label><input type="text" id="editTTContact" value="${tt.contact_no || ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Time of Departure</label><input type="time" id="editTTDepart" value="${tt.time_of_departure || ''}"></div>
          <div class="form-group"><label>Destination</label><input type="text" id="editTTDest" value="${(tt.destination || '').replace(/"/g, '&quot;')}"></div>
        </div>
        <div class="form-group"><label>Purpose</label><input type="text" id="editTTPurpose" value="${(tt.purpose || '').replace(/"/g, '&quot;')}"></div>
        <div class="form-group"><label>Passengers</label><textarea id="editTTPassengers" rows="2">${typeof tt.passengers === 'object' ? JSON.stringify(tt.passengers) : (tt.passengers || '')}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label>Requested By</label><input type="text" id="editTTReqBy" value="${(tt.requested_by_employee || '').replace(/"/g, '&quot;')}"></div>
          <div class="form-group"><label>Approved By</label><input type="text" id="editTTAppBy" value="${(tt.approved_by_employee || '').replace(/"/g, '&quot;')}"></div>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select class="form-select" id="editTTStatus">
            <option value="pending" ${tt.status==='pending'?'selected':''}>Pending</option>
            <option value="approved" ${tt.status==='approved'?'selected':''}>Approved</option>
            <option value="completed" ${tt.status==='completed'?'selected':''}>Completed</option>
            <option value="cancelled" ${tt.status==='cancelled'?'selected':''}>Cancelled</option>
          </select>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit Trip Ticket', html);
  };
  window.saveEditTripTicket = async function(e, id) {
    e.preventDefault();
    if (!confirm('Save changes?')) return;
    let passengers = document.getElementById('editTTPassengers').value;
    try { passengers = JSON.parse(passengers); } catch(e) { /* keep as string */ }
    try {
      await apiRequest('/trip-tickets/' + id, 'PUT', {
        trip_ticket_no: document.getElementById('editTTNo').value,
        requesting_party: document.getElementById('editTTParty').value,
        date_of_request: document.getElementById('editTTReqDate').value || null,
        date_of_travel: document.getElementById('editTTTravelDate').value || null,
        return_date: document.getElementById('editTTReturnDate').value || null,
        contact_no: document.getElementById('editTTContact').value,
        time_of_departure: document.getElementById('editTTDepart').value,
        destination: document.getElementById('editTTDest').value,
        purpose: document.getElementById('editTTPurpose').value,
        passengers: passengers,
        requested_by_employee: document.getElementById('editTTReqBy').value,
        approved_by_employee: document.getElementById('editTTAppBy').value,
        status: document.getElementById('editTTStatus').value
      });
      showToast('Trip Ticket updated!', 'success'); closeModal(); loadTripTickets();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // Semi-Expendable & Capital Outlay View Modals
  window.showViewSemiExpModal = function(id) { openModal('Semi-Expendable Item', '<div class="view-details"><p>Loading semi-expendable item #' + id + '...</p></div>'); };
  window.showViewCapitalOutlayModal = function(id) { openModal('Capital Outlay Item', '<div class="view-details"><p>Loading capital outlay item #' + id + '...</p></div>'); };

  // Office Modals
  window.showNewOfficeModal = async function() {
    await ensureDivisionsLoaded();
    const html = `
      <form id="officeForm" onsubmit="saveNewOffice(event)">
        <div class="form-group"><label>Office Name</label><input type="text" id="officeName" placeholder="Office name" required></div>
        <div class="form-group"><label>Division</label>
          <select class="form-select" id="officeDivision">
            <option value="">-- Select Division --</option>
            ${buildDivisionOptionsById('', false)}
          </select>
        </div>
        <div class="form-group"><label>Description</label><textarea id="officeDesc" rows="2" placeholder="Description"></textarea></div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Office</button>
        </div>
      </form>
    `;
    openModal('Add New Office', html);
  };
  window.saveNewOffice = async function(e) {
    e.preventDefault();
    const data = { name: document.getElementById('officeName').value, division_id: parseInt(document.getElementById('officeDivision').value) || null, description: document.getElementById('officeDesc').value };
    try { if (!confirm('Are you sure you want to save this office?')) return; await apiRequest('/offices', 'POST', data); alert('Office saved!'); closeModal(); loadOffices(); } catch (err) { alert('Error: ' + err.message); }
  };
  window.showEditOfficeModal = async function(id) {
    let o = {};
    try { o = await apiRequest('/offices/' + id); } catch (err) { alert('Could not load office'); return; }
    const html = `
      <form id="editOfficeForm" onsubmit="saveEditOffice(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit Office #${id}</strong></div>
        <div class="form-group"><label>Office Name</label><input type="text" id="editOfficeName" value="${(o.name || '').replace(/"/g, '&quot;')}" required></div>
        <div class="form-group"><label>Description</label><textarea id="editOfficeDesc" rows="2">${o.description || ''}</textarea></div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit Office', html);
  };
  window.saveEditOffice = async function(e, id) {
    e.preventDefault();
    if (!confirm('Save changes?')) return;
    try {
      await apiRequest('/offices/' + id, 'PUT', { name: document.getElementById('editOfficeName').value, description: document.getElementById('editOfficeDesc').value });
      showToast('Office updated!', 'success'); closeModal(); loadOffices();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // Designation Modals
  window.showNewDesignationModal = function() {
    const html = `
      <form id="designationForm" onsubmit="saveNewDesignation(event)">
        <div class="form-group"><label>Designation Title</label><input type="text" id="desigTitle" placeholder="e.g., Administrative Officer V" required></div>
        <div class="form-group"><label>Description</label><textarea id="desigDesc" rows="2" placeholder="Description"></textarea></div>
        <div class="form-group"><label>Salary Grade</label><input type="text" id="desigSG" placeholder="e.g., SG-18"></div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Designation</button>
        </div>
      </form>
    `;
    openModal('Add New Designation', html);
  };
  window.saveNewDesignation = async function(e) {
    e.preventDefault();
    const data = { title: document.getElementById('desigTitle').value, description: document.getElementById('desigDesc').value, salary_grade: document.getElementById('desigSG').value };
    try { if (!confirm('Are you sure you want to save this designation?')) return; await apiRequest('/designations', 'POST', data); alert('Designation saved!'); closeModal(); loadDesignations(); } catch (err) { alert('Error: ' + err.message); }
  };
  window.showEditDesignationModal = async function(id) {
    let d = {};
    try { d = await apiRequest('/designations/' + id); } catch (err) { alert('Could not load designation'); return; }
    const html = `
      <form id="editDesigForm" onsubmit="saveEditDesignation(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit Designation #${id}</strong></div>
        <div class="form-group"><label>Code</label><input type="text" id="editDesigCode" value="${d.code || ''}"></div>
        <div class="form-group"><label>Designation Title</label><input type="text" id="editDesigName" value="${(d.name || '').replace(/"/g, '&quot;')}" required></div>
        <div class="form-group"><label>Description</label><textarea id="editDesigDesc" rows="2">${d.description || ''}</textarea></div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit Designation', html);
  };
  window.saveEditDesignation = async function(e, id) {
    e.preventDefault();
    if (!confirm('Save changes?')) return;
    try {
      await apiRequest('/designations/' + id, 'PUT', { code: document.getElementById('editDesigCode').value, name: document.getElementById('editDesigName').value, description: document.getElementById('editDesigDesc').value });
      showToast('Designation updated!', 'success'); closeModal(); loadDesignations();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // Division Modals
  window.showNewDivisionModal = function() {
    const html = `
      <form id="divisionForm" onsubmit="saveNewDivision(event)">
        <div class="form-row">
          <div class="form-group"><label>Division Code</label><input type="text" id="divCode" placeholder="e.g., FAD" required></div>
          <div class="form-group"><label>Division Name</label><input type="text" id="divName" placeholder="Full name" required></div>
        </div>
        <div class="form-group"><label>Description</label><textarea id="divDesc" rows="2"></textarea></div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Division</button>
        </div>
      </form>
    `;
    openModal('Add New Division', html);
  };
  window.saveNewDivision = async function(e) {
    e.preventDefault();
    const data = { code: document.getElementById('divCode').value, name: document.getElementById('divName').value, description: document.getElementById('divDesc').value };
    try { if (!confirm('Are you sure you want to save this division?')) return; await apiRequest('/divisions', 'POST', data); alert('Division saved!'); closeModal(); loadDivisions(); } catch (err) { alert('Error: ' + err.message); }
  };
  window.showEditDivisionModal = async function(id) {
    let d = {};
    try { d = await apiRequest('/divisions/' + id); } catch (err) { alert('Could not load division'); return; }
    const html = `
      <form id="editDivForm" onsubmit="saveEditDivision(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit Division #${id}</strong></div>
        <div class="form-group"><label>Division Name</label><input type="text" id="editDivName" value="${(d.name || '').replace(/"/g, '&quot;')}" required></div>
        <div class="form-group"><label>Description</label><textarea id="editDivDesc" rows="2">${d.description || ''}</textarea></div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit Division', html);
  };
  window.saveEditDivision = async function(e, id) {
    e.preventDefault();
    if (!confirm('Save changes?')) return;
    try {
      await apiRequest('/divisions/' + id, 'PUT', { name: document.getElementById('editDivName').value, description: document.getElementById('editDivDesc').value });
      showToast('Division updated!', 'success'); closeModal(); loadDivisions();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // Fund Cluster Modals
  window.showNewFundClusterModal = function() {
    const html = `
      <form id="fcForm" onsubmit="saveNewFundCluster(event)">
        <div class="form-row">
          <div class="form-group"><label>Code</label><input type="text" id="fcCode" placeholder="e.g., 01" required></div>
          <div class="form-group"><label>Name</label><input type="text" id="fcName" placeholder="e.g., Regular Agency Fund" required></div>
        </div>
        <div class="form-group"><label>Description</label><textarea id="fcDesc" rows="2"></textarea></div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Fund Cluster</button>
        </div>
      </form>
    `;
    openModal('Add Fund Cluster', html);
  };
  window.saveNewFundCluster = async function(e) {
    e.preventDefault();
    const data = { code: document.getElementById('fcCode').value, name: document.getElementById('fcName').value, description: document.getElementById('fcDesc').value };
    try { if (!confirm('Are you sure you want to save this fund cluster?')) return; await apiRequest('/fund-clusters', 'POST', data); alert('Fund cluster saved!'); closeModal(); loadFundClusters(); } catch (err) { alert('Error: ' + err.message); }
  };
  window.showEditFundClusterModal = async function(id) {
    let fc = {};
    try { fc = await apiRequest('/fund-clusters/' + id); } catch (err) { alert('Could not load fund cluster'); return; }
    const html = `
      <form id="editFCForm" onsubmit="saveEditFundCluster(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit Fund Cluster #${id}</strong></div>
        <div class="form-row">
          <div class="form-group"><label>Code</label><input type="text" id="editFCCode" value="${fc.code || ''}" required></div>
          <div class="form-group"><label>Name</label><input type="text" id="editFCName" value="${(fc.name || '').replace(/"/g, '&quot;')}" required></div>
        </div>
        <div class="form-group"><label>Description</label><textarea id="editFCDesc" rows="2">${fc.description || ''}</textarea></div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit Fund Cluster', html);
  };
  window.saveEditFundCluster = async function(e, id) {
    e.preventDefault();
    if (!confirm('Save changes?')) return;
    try {
      await apiRequest('/fund-clusters/' + id, 'PUT', { code: document.getElementById('editFCCode').value, name: document.getElementById('editFCName').value, description: document.getElementById('editFCDesc').value });
      showToast('Fund Cluster updated!', 'success'); closeModal(); loadFundClusters();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // Procurement Mode Modals
  window.showNewProcurementModeModal = function() {
    const html = `
      <form id="pmForm" onsubmit="saveNewProcurementMode(event)">
        <div class="form-row">
          <div class="form-group"><label>Code</label><input type="text" id="pmCode" placeholder="e.g., SVP" required></div>
          <div class="form-group"><label>Mode Name</label><input type="text" id="pmName" placeholder="e.g., Small Value Procurement" required></div>
        </div>
        <div class="form-group"><label>Description</label><textarea id="pmDesc" rows="2"></textarea></div>
        <div class="form-group"><label>Threshold Amount</label><input type="number" id="pmThreshold" step="0.01" placeholder="e.g., 1000000.00"></div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Mode</button>
        </div>
      </form>
    `;
    openModal('Add Procurement Mode', html);
  };
  window.saveNewProcurementMode = async function(e) {
    e.preventDefault();
    const data = { code: document.getElementById('pmCode').value, name: document.getElementById('pmName').value, description: document.getElementById('pmDesc').value, threshold: parseFloat(document.getElementById('pmThreshold').value) || null };
    try { if (!confirm('Are you sure you want to save this procurement mode?')) return; await apiRequest('/procurement-modes', 'POST', data); alert('Procurement mode saved!'); closeModal(); loadProcurementModes(); } catch (err) { alert('Error: ' + err.message); }
  };
  window.showEditProcurementModeModal = async function(id) {
    let pm = {};
    try { pm = await apiRequest('/procurement-modes/' + id); } catch (err) { alert('Could not load procurement mode'); return; }
    const html = `
      <form id="editPMForm" onsubmit="saveEditProcurementMode(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit Procurement Mode #${id}</strong></div>
        <div class="form-row">
          <div class="form-group"><label>Code</label><input type="text" id="editPMCode" value="${pm.code || ''}" required></div>
          <div class="form-group"><label>Mode Name</label><input type="text" id="editPMName" value="${(pm.name || '').replace(/"/g, '&quot;')}" required></div>
        </div>
        <div class="form-group"><label>Description</label><textarea id="editPMDesc" rows="2">${pm.description || ''}</textarea></div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit Procurement Mode', html);
  };
  window.saveEditProcurementMode = async function(e, id) {
    e.preventDefault();
    if (!confirm('Save changes?')) return;
    try {
      await apiRequest('/procurement-modes/' + id, 'PUT', { code: document.getElementById('editPMCode').value, name: document.getElementById('editPMName').value, description: document.getElementById('editPMDesc').value });
      showToast('Procurement Mode updated!', 'success'); closeModal(); loadProcurementModes();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // UACS Code Modals
  window.showNewUACSCodeModal = function() {
    const html = `
      <form id="uacsForm" onsubmit="saveNewUACSCode(event)">
        <div class="form-row">
          <div class="form-group"><label>Code</label><input type="text" id="uacsCode" placeholder="e.g., 5020301000" required></div>
          <div class="form-group"><label>Category</label>
            <select class="form-select" id="uacsCategory">
              <option value="">-- Select --</option>
              <option value="MOOE">MOOE</option>
              <option value="CO">Capital Outlay</option>
              <option value="PS">Personal Services</option>
            </select>
          </div>
        </div>
        <div class="form-group"><label>Description</label><input type="text" id="uacsDesc" placeholder="e.g., Office Supplies Expenses" required></div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save UACS Code</button>
        </div>
      </form>
    `;
    openModal('Add UACS Code', html);
  };
  window.saveNewUACSCode = async function(e) {
    e.preventDefault();
    const data = { code: document.getElementById('uacsCode').value, description: document.getElementById('uacsDesc').value, category: document.getElementById('uacsCategory').value };
    try { if (!confirm('Are you sure you want to save this UACS code?')) return; await apiRequest('/uacs-codes', 'POST', data); alert('UACS code saved!'); closeModal(); loadUACSCodes(); } catch (err) { alert('Error: ' + err.message); }
  };
  window.showEditUACSCodeModal = async function(id) {
    let u = {};
    try { u = await apiRequest('/uacs-codes/' + id); } catch (err) { alert('Could not load UACS code'); return; }
    const html = `
      <form id="editUACSForm" onsubmit="saveEditUACSCode(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit UACS Code #${id}</strong></div>
        <div class="form-row">
          <div class="form-group"><label>Code</label><input type="text" id="editUACSCode" value="${u.code || ''}" required></div>
          <div class="form-group"><label>Category</label>
            <select class="form-select" id="editUACSCategory">
              <option value="">-- Select --</option>
              <option value="MOOE" ${u.category==='MOOE'?'selected':''}>MOOE</option>
              <option value="CO" ${u.category==='CO'?'selected':''}>Capital Outlay</option>
              <option value="PS" ${u.category==='PS'?'selected':''}>Personal Services</option>
            </select>
          </div>
        </div>
        <div class="form-group"><label>Name/Description</label><input type="text" id="editUACSName" value="${(u.name || u.description || '').replace(/"/g, '&quot;')}" required></div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit UACS Code', html);
  };
  window.saveEditUACSCode = async function(e, id) {
    e.preventDefault();
    if (!confirm('Save changes?')) return;
    try {
      await apiRequest('/uacs-codes/' + id, 'PUT', { code: document.getElementById('editUACSCode').value, category: document.getElementById('editUACSCategory').value, name: document.getElementById('editUACSName').value });
      showToast('UACS Code updated!', 'success'); closeModal(); loadUACSCodes();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // UOM Modals
  window.showNewUOMModal = function() {
    const html = `
      <form id="uomForm" onsubmit="saveNewUOM(event)">
        <div class="form-row">
          <div class="form-group"><label>Abbreviation</label><input type="text" id="uomAbbr" placeholder="e.g., pc" required></div>
          <div class="form-group"><label>Full Name</label><input type="text" id="uomName" placeholder="e.g., piece" required></div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save UOM</button>
        </div>
      </form>
    `;
    openModal('Add Unit of Measure', html);
  };
  window.saveNewUOM = async function(e) {
    e.preventDefault();
    const data = { abbreviation: document.getElementById('uomAbbr').value, name: document.getElementById('uomName').value };
    try { if (!confirm('Are you sure you want to save this unit of measure?')) return; await apiRequest('/uoms', 'POST', data); alert('UOM saved!'); closeModal(); loadUOMs(); } catch (err) { alert('Error: ' + err.message); }
  };
  window.showEditUOMModal = async function(id) {
    let u = {};
    try { u = await apiRequest('/uoms/' + id); } catch (err) { alert('Could not load UOM'); return; }
    const html = `
      <form id="editUOMForm" onsubmit="saveEditUOM(event, ${id})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit Unit of Measure #${id}</strong></div>
        <div class="form-row">
          <div class="form-group"><label>Abbreviation</label><input type="text" id="editUOMAbbr" value="${u.abbreviation || ''}" required></div>
          <div class="form-group"><label>Full Name</label><input type="text" id="editUOMName" value="${(u.name || '').replace(/"/g, '&quot;')}" required></div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>`;
    openModal('Edit Unit of Measure', html);
  };
  window.saveEditUOM = async function(e, id) {
    e.preventDefault();
    if (!confirm('Save changes?')) return;
    try {
      await apiRequest('/uoms/' + id, 'PUT', { abbreviation: document.getElementById('editUOMAbbr').value, name: document.getElementById('editUOMName').value });
      showToast('UOM updated!', 'success'); closeModal(); loadUOMs();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // Settings
  window.saveSetting = async function(id) {
    const kvList = document.querySelector(`.settings-kv-list[data-id="${id}"]`);
    if (!kvList) return;
    if (!confirm('Save setting "' + id + '"?')) return;
    const data = {};
    kvList.querySelectorAll('.settings-kv-input').forEach(input => {
      const key = input.dataset.key;
      let val = input.value.trim();
      try { val = JSON.parse(val); } catch(e) { if (!isNaN(val) && val !== '') val = Number(val); }
      data[key] = val;
    });
    try {
      await apiRequest('/settings/' + id, 'PUT', { data });
      showToast('Setting "' + id + '" saved successfully!', 'success');
      loadSettings();
    } catch (err) { alert('Error: ' + err.message); }
  };
  window.saveAllSettings = async function() {
    if (!confirm('Save all settings?')) return;
    const kvLists = document.querySelectorAll('.settings-kv-list');
    let saved = 0;
    for (const kvList of kvLists) {
      const id = kvList.dataset.id;
      const data = {};
      kvList.querySelectorAll('.settings-kv-input').forEach(input => {
        const key = input.dataset.key;
        let val = input.value.trim();
        try { val = JSON.parse(val); } catch(e) { if (!isNaN(val) && val !== '') val = Number(val); }
        data[key] = val;
      });
      try { await apiRequest('/settings/' + id, 'PUT', { data }); saved++; } catch (err) { console.error(err); }
    }
    showToast(saved + ' settings saved!', 'success');
    loadSettings();
  };

  // BAC Resolution Modal
  window.showNewBACResolutionModal = function() {
    const html = `
      <form id="bacResForm" onsubmit="saveNewBACResolution(event)">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-gavel"></i>
          <strong>BAC RESOLUTION</strong> — Declaring Winning Bidder
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Resolution No.</label>
            <input type="text" id="bacResNumber" value="${generateDocNumber('BAC-RES')}" readonly>
          </div>
          <div class="form-group">
            <label>Series of</label>
            <input type="text" id="bacResSeries" value="${getCurrentFiscalYear()}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Subject / Title</label>
          <textarea rows="2" id="bacResSubject" placeholder="e.g., RESOLUTION DECLARING [Supplier Name] AS THE LOWEST CALCULATED AND RESPONSIVE BIDDER FOR THE PROCUREMENT OF [Item Description]" required></textarea>
        </div>
        <div class="form-group">
          <label>Linked Abstract of Quotation</label>
          <select class="form-select" id="bacResLinkedAbstract" required>
            <option value="">-- Select Abstract --</option>
          </select>
        </div>
        <div class="form-section-header"><i class="fas fa-gavel"></i> Whereas Clauses</div>
        <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
          <div class="form-group" style="margin-bottom: 8px;">
            <label style="font-size: 12px; font-weight: 600;">WHEREAS,</label>
            <textarea rows="2" placeholder="the Bids and Awards Committee (BAC) of the Department of Migrant Workers - Regional Office XIII conducted a procurement through Small Value Procurement...">the Bids and Awards Committee (BAC) of the Department of Migrant Workers - Regional Office XIII conducted a procurement through Small Value Procurement (SVP) for the above-mentioned requirement;</textarea>
          </div>
          <div class="form-group" style="margin-bottom: 8px;">
            <label style="font-size: 12px; font-weight: 600;">WHEREAS,</label>
            <textarea rows="2" placeholder="the BAC invited suppliers and received quotations...">the BAC sent Request for Quotations (RFQ) to prospective suppliers and received sealed quotations;</textarea>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 12px; font-weight: 600;">WHEREAS,</label>
            <textarea rows="2" placeholder="after evaluation of the quotations...">after opening and evaluation of the quotations received, the following are the results:</textarea>
          </div>
        </div>
        <div class="form-section-header section-items"><i class="fas fa-chart-bar"></i> Bidders Comparison</div>
        <div class="form-items-section">
        <table class="data-table" style="font-size: 12px; margin-bottom: 10px;">
          <thead>
            <tr>
              <th style="width: 40px;">No.</th>
              <th>Name of Bidder</th>
              <th style="width: 130px;">Total Bid Amount</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody id="bacBiddersBody">
            <tr>
              <td><input type="text" value="1" style="width: 35px; text-align: center;"></td>
              <td><input type="text" placeholder="Bidder Name" style="width: 100%;"></td>
              <td><input type="number" placeholder="0.00" step="0.01" style="width: 120px;"></td>
              <td><input type="text" placeholder="LCRB / Responsive" style="width: 100%;"></td>
            </tr>
            <tr>
              <td><input type="text" value="2" style="width: 35px; text-align: center;"></td>
              <td><input type="text" placeholder="Bidder Name" style="width: 100%;"></td>
              <td><input type="number" placeholder="0.00" step="0.01" style="width: 120px;"></td>
              <td><input type="text" placeholder="Remarks" style="width: 100%;"></td>
            </tr>
            <tr>
              <td><input type="text" value="3" style="width: 35px; text-align: center;"></td>
              <td><input type="text" placeholder="Bidder Name" style="width: 100%;"></td>
              <td><input type="number" placeholder="0.00" step="0.01" style="width: 120px;"></td>
              <td><input type="text" placeholder="Remarks" style="width: 100%;"></td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="btn btn-sm btn-outline" onclick="addBACBidderRow()"><i class="fas fa-plus"></i> Add Bidder</button>
        </div>
        <div class="form-section-header section-items"><i class="fas fa-award"></i> Award Details</div>
        <div class="form-row">
          <div class="form-group">
            <label>ABC (Approved Budget for the Contract)</label>
            <input type="number" id="bacResABC" placeholder="0.00" step="0.01" required>
          </div>
          <div class="form-group">
            <label>Contract Price (LCRB Amount)</label>
            <input type="number" id="bacResContractPrice" placeholder="0.00" step="0.01" required>
          </div>
        </div>
        <div class="form-group">
          <label>Description of Procurement</label>
          <textarea rows="2" placeholder="Brief description of items/services procured" required></textarea>
        </div>
        <div class="form-section-header section-signatories"><i class="fas fa-users"></i> BAC Members (Signatories)</div>
        <div style="background: #fce4ec; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
          <div class="form-row">
            <div class="form-group" style="margin-bottom: 8px;">
              <label style="font-size: 12px;">BAC Chairperson</label>
              <input type="text" placeholder="Name" required>
            </div>
            <div class="form-group" style="margin-bottom: 8px;">
              <label style="font-size: 12px;">Vice-Chairperson</label>
              <input type="text" placeholder="Name">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group" style="margin-bottom: 8px;">
              <label style="font-size: 12px;">Member</label>
              <input type="text" placeholder="Name">
            </div>
            <div class="form-group" style="margin-bottom: 8px;">
              <label style="font-size: 12px;">Member</label>
              <input type="text" placeholder="Name">
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 12px;">Member</label>
            <input type="text" placeholder="Name">
          </div>
        </div>
        <div class="form-section-header"><i class="fas fa-paperclip"></i> Required Attachments</div>
        <div class="form-attachment-section">
          <div class="attachment-box" style="background: #fce4ec; padding: 12px; border-radius: 6px; border: 2px dashed #e91e63;">
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; display: block;"><i class="fas fa-gavel"></i> BAC Resolution Document (Signed by BAC Members)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="bacResDocument" accept=".pdf,.doc,.docx" required style="display: none;" onchange="updateFileLabel(this, 'bacResDocumentLabel')">
                <button type="button" class="btn btn-sm" style="background: #e91e63; color: white;" onclick="document.getElementById('bacResDocument').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="bacResDocumentLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div>
              <label style="font-weight: 500; display: block;"><i class="fas fa-file-alt"></i> Post-Qualification Report (if applicable)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="bacResPostQual" accept=".pdf,.doc,.docx" style="display: none;" onchange="updateFileLabel(this, 'bacResPostQualLabel')">
                <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('bacResPostQual').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="bacResPostQualLabel" style="font-size: 12px; color: #666;">Optional</span>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-gavel"></i> Submit Resolution</button>
        </div>
      </form>
    `;
    openModal('Create BAC Resolution', html);
  };

  window.addBACBidderRow = function() {
    const tbody = document.getElementById('bacBiddersBody');
    const nextNum = tbody.rows.length + 1;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" value="${nextNum}" style="width: 35px; text-align: center;"></td>
      <td><input type="text" placeholder="Bidder Name" style="width: 100%;"></td>
      <td><input type="number" placeholder="0.00" step="0.01" style="width: 120px;"></td>
      <td><input type="text" placeholder="Remarks" style="width: 100%;"></td>
    `;
    tbody.appendChild(row);
  };

  // Post-Qualification / TWG Report Modal
  window.showNewPostQualModal = function() {
    const html = `
      <form id="postQualForm" onsubmit="saveNewPostQual(event)">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-users"></i>
          <strong>TWG REPORT</strong> — Technical Working Group Evaluation Report
        </div>
        <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
          <div class="form-row">
            <div class="form-group" style="margin-bottom: 5px;">
              <label style="font-size: 12px; font-weight: 600;">TO:</label>
              <input type="text" value="BAC Chairperson" placeholder="BAC Chairperson" required>
            </div>
            <div class="form-group" style="margin-bottom: 5px;">
              <label style="font-size: 12px; font-weight: 600;">DATE:</label>
              <input type="date" id="postQualDate" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 12px; font-weight: 600;">SUBJECT:</label>
            <input type="text" id="postQualSubject" placeholder="e.g., Procurement of Security Guard Services" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>TWG Report No.</label>
            <input type="text" id="postQualNumber" value="${generateDocNumber('TWG')}" readonly>
          </div>
          <div class="form-group">
            <label>Linked Abstract</label>
            <select class="form-select" id="postQualLinkedAbstract" required>
              <option value="">-- Select Abstract --</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Reference Text</label>
          <textarea rows="2">In reference to the above-subject procurement, the Technical Working Group (TWG) hereby submits the following evaluation report on the submitted quotations and eligibility documents:</textarea>
        </div>
        <div class="form-section-header section-inspection"><i class="fas fa-tasks"></i> Required Documents Verification</div>
        <p style="font-size: 12px; color: #666; margin-bottom: 10px;">Mark as Pass or N/A for each bidder</p>
        <div style="overflow-x: auto;">
          <table class="data-table" style="font-size: 11px; margin-bottom: 10px; min-width: 700px;">
            <thead>
              <tr>
                <th>Required Documents</th>
                <th style="width: 120px; background: #e3f2fd;">Bidder 1</th>
                <th style="width: 120px; background: #e8f5e9;">Bidder 2</th>
                <th style="width: 120px; background: #fff8e1;">Bidder 3</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="4" style="padding: 4px;"><strong>Bidder Names:</strong></td>
              </tr>
              <tr>
                <td></td>
                <td style="background: #f5f9ff;"><input type="text" placeholder="Bidder 1" style="width: 100%; font-size: 11px;"></td>
                <td style="background: #f5fff5;"><input type="text" placeholder="Bidder 2" style="width: 100%; font-size: 11px;"></td>
                <td style="background: #fffef5;"><input type="text" placeholder="Bidder 3" style="width: 100%; font-size: 11px;"></td>
              </tr>
              <tr>
                <td>Latest Income Tax Return (ITR)</td>
                <td style="background: #f5f9ff;"><select class="form-select" style="font-size: 11px;"><option>Pass</option><option>N/A</option><option>Fail</option></select></td>
                <td style="background: #f5fff5;"><select class="form-select" style="font-size: 11px;"><option>Pass</option><option>N/A</option><option>Fail</option></select></td>
                <td style="background: #fffef5;"><select class="form-select" style="font-size: 11px;"><option>Pass</option><option>N/A</option><option>Fail</option></select></td>
              </tr>
              <tr>
                <td>Omnibus Sworn Statement</td>
                <td style="background: #f5f9ff;"><select class="form-select" style="font-size: 11px;"><option>Pass</option><option>N/A</option><option>Fail</option></select></td>
                <td style="background: #f5fff5;"><select class="form-select" style="font-size: 11px;"><option>Pass</option><option>N/A</option><option>Fail</option></select></td>
                <td style="background: #fffef5;"><select class="form-select" style="font-size: 11px;"><option>Pass</option><option>N/A</option><option>Fail</option></select></td>
              </tr>
              <tr>
                <td>Valid Mayor's/Business Permit</td>
                <td style="background: #f5f9ff;"><select class="form-select" style="font-size: 11px;"><option>Pass</option><option>N/A</option><option>Fail</option></select></td>
                <td style="background: #f5fff5;"><select class="form-select" style="font-size: 11px;"><option>Pass</option><option>N/A</option><option>Fail</option></select></td>
                <td style="background: #fffef5;"><select class="form-select" style="font-size: 11px;"><option>Pass</option><option>N/A</option><option>Fail</option></select></td>
              </tr>
              <tr>
                <td>PhilGEPS Registration</td>
                <td style="background: #f5f9ff;"><select class="form-select" style="font-size: 11px;"><option>Pass</option><option>N/A</option><option>Fail</option></select></td>
                <td style="background: #f5fff5;"><select class="form-select" style="font-size: 11px;"><option>Pass</option><option>N/A</option><option>Fail</option></select></td>
                <td style="background: #fffef5;"><select class="form-select" style="font-size: 11px;"><option>Pass</option><option>N/A</option><option>Fail</option></select></td>
              </tr>
              <tr>
                <td>BIR Certificate of Registration</td>
                <td style="background: #f5f9ff;"><select class="form-select" style="font-size: 11px;"><option>Pass</option><option>N/A</option><option>Fail</option></select></td>
                <td style="background: #f5fff5;"><select class="form-select" style="font-size: 11px;"><option>Pass</option><option>N/A</option><option>Fail</option></select></td>
                <td style="background: #fffef5;"><select class="form-select" style="font-size: 11px;"><option>Pass</option><option>N/A</option><option>Fail</option></select></td>
              </tr>
              <tr>
                <td>SEC/DTI Registration</td>
                <td style="background: #f5f9ff;"><select class="form-select" style="font-size: 11px;"><option>Pass</option><option>N/A</option><option>Fail</option></select></td>
                <td style="background: #f5fff5;"><select class="form-select" style="font-size: 11px;"><option>Pass</option><option>N/A</option><option>Fail</option></select></td>
                <td style="background: #fffef5;"><select class="form-select" style="font-size: 11px;"><option>Pass</option><option>N/A</option><option>Fail</option></select></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="form-section-header section-items"><i class="fas fa-balance-scale"></i> Price Comparison</div>
        <table class="data-table" style="font-size: 11px; margin-bottom: 10px;">
          <thead>
            <tr>
              <th>Particulars</th>
              <th style="width: 100px;">ABC</th>
              <th style="width: 100px; background: #e3f2fd;">Bidder 1</th>
              <th style="width: 100px; background: #e8f5e9;">Bidder 2</th>
              <th style="width: 100px; background: #fff8e1;">Bidder 3</th>
            </tr>
          </thead>
          <tbody id="twgPriceBody">
            <tr>
              <td><input type="text" placeholder="Item/Service" style="width: 100%; font-size: 11px;"></td>
              <td><input type="number" placeholder="0.00" step="0.01" style="width: 90px; font-size: 11px;"></td>
              <td style="background: #f5f9ff;"><input type="number" placeholder="0.00" step="0.01" style="width: 90px; font-size: 11px;"></td>
              <td style="background: #f5fff5;"><input type="number" placeholder="0.00" step="0.01" style="width: 90px; font-size: 11px;"></td>
              <td style="background: #fffef5;"><input type="number" placeholder="0.00" step="0.01" style="width: 90px; font-size: 11px;"></td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="btn btn-sm btn-outline" onclick="addTWGPriceRow()"><i class="fas fa-plus"></i> Add Item Row</button>
        <div class="form-section-header section-signatories"><i class="fas fa-users"></i> TWG Members (Signatories)</div>
        <div style="background: #e8eaf6; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
          <div class="form-row">
            <div class="form-group" style="margin-bottom: 8px;">
              <label style="font-size: 12px;">TWG Head</label>
              <input type="text" placeholder="Name" required>
            </div>
            <div class="form-group" style="margin-bottom: 8px;">
              <label style="font-size: 12px;">Member</label>
              <input type="text" placeholder="Name">
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 12px;">Member</label>
            <input type="text" placeholder="Name">
          </div>
        </div>
        <div class="form-section-header"><i class="fas fa-paperclip"></i> Required Attachments</div>
        <div class="form-attachment-section">
          <div class="attachment-box" style="background: #e8eaf6; padding: 12px; border-radius: 6px; border: 2px dashed #3f51b5;">
            <div style="margin-bottom: 12px;">
              <label style="font-weight: 600; display: block;"><i class="fas fa-user-check"></i> TWG Report (Signed)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="postQualReport" accept=".pdf,.doc,.docx" required style="display: none;" onchange="updateFileLabel(this, 'postQualReportLabel')">
                <button type="button" class="btn btn-sm" style="background: #3f51b5; color: white;" onclick="document.getElementById('postQualReport').click()"><i class="fas fa-upload"></i> Upload</button>
                <span id="postQualReportLabel" style="font-size: 12px; color: #666;">No file selected</span>
              </div>
            </div>
            <div>
              <label style="font-weight: 600; display: block;"><i class="fas fa-folder-open"></i> Bidder Documents (Scanned)</label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="postQualBidderDocs" accept=".pdf,.jpg,.jpeg,.png" required multiple style="display: none;" onchange="updateFileLabel(this, 'postQualBidderDocsLabel', true)">
                <button type="button" class="btn btn-sm" style="background: #3f51b5; color: white;" onclick="document.getElementById('postQualBidderDocs').click()"><i class="fas fa-upload"></i> Upload Multiple</button>
                <span id="postQualBidderDocsLabel" style="font-size: 12px; color: #666;">No files selected</span>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-user-check"></i> Submit TWG Report</button>
        </div>
      </form>
    `;
    openModal('TWG Evaluation Report / Post-Qualification', html);
  };

  window.addTWGPriceRow = function() {
    const tbody = document.getElementById('twgPriceBody');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" placeholder="Item/Service" style="width: 100%; font-size: 11px;"></td>
      <td><input type="number" placeholder="0.00" step="0.01" style="width: 90px; font-size: 11px;"></td>
      <td style="background: #f5f9ff;"><input type="number" placeholder="0.00" step="0.01" style="width: 90px; font-size: 11px;"></td>
      <td style="background: #f5fff5;"><input type="number" placeholder="0.00" step="0.01" style="width: 90px; font-size: 11px;"></td>
      <td style="background: #fffef5;"><input type="number" placeholder="0.00" step="0.01" style="width: 90px; font-size: 11px;"></td>
    `;
    tbody.appendChild(row);
  };

  // COA Submission Modal
  window.showNewCOASubmissionModal = async function() {
    // Load PO and IAR data dynamically
    if (!cachedPO || cachedPO.length === 0) { try { cachedPO = await apiRequest('/po'); } catch(e) {} }
    if (!cachedIAR || cachedIAR.length === 0) { try { cachedIAR = await apiRequest('/iar'); } catch(e) {} }
    const poOpts = (cachedPO || []).map(p => `<option value="${p.id}">${p.po_number || ''} - ${p.purpose || ''}</option>`).join('');
    const iarOpts = (cachedIAR || []).map(i => `<option value="${i.id}">${i.iar_number || ''}</option>`).join('');
    const html = `
      <form id="coaForm">
        <div class="info-banner warning-banner" style="margin-bottom: 15px;">
          <i class="fas fa-clock"></i>
          <strong>Deadline:</strong> Submit within 5 calendar days from PO approval date.
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Submission No.</label>
            <input type="text" value="${generateDocNumber('COA')}" readonly>
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
            ${poOpts}
          </select>
        </div>
        <div class="form-group">
          <label>Linked IAR</label>
          <select class="form-select" required>
            <option value="">-- Select IAR --</option>
            ${iarOpts}
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

  // PO Accept Modal (NEW - per spec v1.2)
  window.showAcceptPOModal = function() {
    const html = `
      <form id="acceptPoForm" onsubmit="handleAcceptPO(event)">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-info-circle"></i>
          Mark PO as accepted by supplier. This will update workflow status to <strong>Awaiting Delivery</strong>.
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Accepted Date/Time <span class="text-danger">*</span></label>
            <input type="datetime-local" id="acceptedAt" required>
          </div>
          <div class="form-group">
            <label>Accepted By</label>
            <input type="text" placeholder="Supplier representative name">
          </div>
        </div>
        <div class="form-group">
          <label>Supplier Conforme Attachment</label>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="file" id="conformeAttachment" accept=".pdf,.jpg,.png" style="display: none;" onchange="updateFileLabel(this, 'conformeLabel')">
            <button type="button" class="btn btn-sm btn-secondary" onclick="document.getElementById('conformeAttachment').click()"><i class="fas fa-upload"></i> Upload</button>
            <span id="conformeLabel" style="font-size: 12px; color: #666;">Optional - signed conforme</span>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-check"></i> Mark Accepted</button>
        </div>
      </form>
    `;
    openModal('Accept Purchase Order', html);
  };

  // Mark Delivered Modal (NEW - per spec v1.2)
  window.showMarkDeliveredModal = function() {
    const html = `
      <form id="deliveredForm">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-truck"></i>
          Mark delivery received. This will update workflow status to <strong>For Payment</strong>.
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Delivered Date <span class="text-danger">*</span></label>
            <input type="date" id="deliveryDate" required>
          </div>
          <div class="form-group">
            <label>Delivered At (Time)</label>
            <input type="time" id="deliveredTime">
          </div>
        </div>
        <div class="form-group">
          <label>Delivery Receipt Number</label>
          <input type="text" placeholder="DR Number">
        </div>
        <div class="form-group">
          <label>Remarks</label>
          <textarea rows="2" placeholder="Optional notes"></textarea>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-success"><i class="fas fa-truck"></i> Mark Delivered</button>
        </div>
      </form>
    `;
    openModal('Mark Delivery Received', html);
  };

  // Mark Paid (ADA) Modal (NEW - per spec v1.2)
  window.showMarkPaidModal = function() {
    const html = `
      <form id="paidForm">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-money-check-alt"></i>
          Record payment completion via ADA (Advice to Debit Account).
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Payment Date <span class="text-danger">*</span></label>
            <input type="date" id="paymentDate" required>
          </div>
          <div class="form-group">
            <label>ADA Reference Number <span class="text-danger">*</span></label>
            <input type="text" id="adaReference" placeholder="ADA-XXXX-XXXX" required>
          </div>
        </div>
        <div class="form-group">
          <label>Amount Paid</label>
          <input type="text" placeholder="₱0.00" readonly>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-success"><i class="fas fa-check-circle"></i> Mark Paid (ADA)</button>
        </div>
      </form>
    `;
    openModal('Mark Payment Complete', html);
  };

  // Compile Packet Modal (NEW - per spec v1.2)
  window.showCompilePacketModal = async function() {
    // Load PO data dynamically
    if (!cachedPO || cachedPO.length === 0) { try { cachedPO = await apiRequest('/po'); } catch(e) {} }
    const poOpts = (cachedPO || []).map(p => `<option value="${p.id}">${p.po_number || ''} - ${p.purpose || ''} (${p.workflow_status || p.status || ''})</option>`).join('');
    const html = `
      <form id="compilePacketForm" onsubmit="handleCompilePacket(event)">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-folder-open"></i>
          Compile supporting documents for Chief + Director signing before COA submission.
        </div>
        <div class="form-group">
          <label>Select Purchase Order <span class="text-danger">*</span></label>
          <select class="form-select" required>
            <option value="">-- Select PO --</option>
            ${poOpts}
          </select>
        </div>
        <div class="form-group">
          <label><strong>Supporting Documents Checklist</strong></label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 12px; background: var(--bg-color); border-radius: 8px; font-size: 12px;">
            <label><input type="checkbox" checked disabled> Purchase Request (PR)</label>
            <label><input type="checkbox" checked disabled> RFQ</label>
            <label><input type="checkbox" checked disabled> Abstract of Quotation</label>
            <label><input type="checkbox" checked disabled> Post-Qualification Report</label>
            <label><input type="checkbox" checked disabled> BAC Resolution</label>
            <label><input type="checkbox" checked disabled> Notice of Award</label>
            <label><input type="checkbox" checked disabled> Purchase Order</label>
            <label><input type="checkbox" checked disabled> Supplier Conforme</label>
            <label><input type="checkbox" checked disabled> IAR (Appendix 62)</label>
            <label><input type="checkbox" checked disabled> Delivery Receipt</label>
            <label><input type="checkbox" checked disabled> Supplier Invoice</label>
            <label><input type="checkbox"> Other Supporting Docs</label>
          </div>
        </div>
        <div class="form-group">
          <label>Upload Merged Packet (Optional)</label>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="file" id="mergedPacket" accept=".pdf" style="display: none;" onchange="updateFileLabel(this, 'mergedPacketLabel')">
            <button type="button" class="btn btn-sm btn-secondary" onclick="document.getElementById('mergedPacket').click()"><i class="fas fa-upload"></i> Upload PDF</button>
            <span id="mergedPacketLabel" style="font-size: 12px; color: #666;">Optional - single merged PDF</span>
          </div>
        </div>
        <div class="form-group">
          <label>Remarks</label>
          <textarea rows="2" placeholder="Optional notes"></textarea>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-folder-plus"></i> Compile Packet</button>
        </div>
      </form>
    `;
    openModal('Compile PO Packet', html);
  };

  // Chief Sign Modal (NEW - per spec v1.2)
  window.showChiefSignModal = function() {
    const html = `
      <form id="chiefSignForm" onsubmit="handleChiefSign(event)">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-signature"></i>
          Record Chief's signature on the PO packet.
        </div>
        <div class="form-group">
          <label>Signed Date/Time <span class="text-danger">*</span></label>
          <input type="datetime-local" id="chiefSignedAt" required>
        </div>
        <div class="form-group">
          <label>Upload Signed Page (Optional)</label>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="file" id="chiefSignedPage" accept=".pdf,.jpg,.png" style="display: none;" onchange="updateFileLabel(this, 'chiefSignedLabel')">
            <button type="button" class="btn btn-sm btn-secondary" onclick="document.getElementById('chiefSignedPage').click()"><i class="fas fa-upload"></i> Upload</button>
            <span id="chiefSignedLabel" style="font-size: 12px; color: #666;">Scanned signed page</span>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-success"><i class="fas fa-check"></i> Record Chief Signature</button>
        </div>
      </form>
    `;
    openModal('Chief Signature', html);
  };

  // Director Sign Modal (NEW - per spec v1.2)
  window.showDirectorSignModal = function() {
    const html = `
      <form id="directorSignForm" onsubmit="handleDirectorSign(event)">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-signature"></i>
          Record Director's (HoPE) signature on the PO packet. Both Chief + Director signatures are required before COA submission.
        </div>
        <div class="form-group">
          <label>Signed Date/Time <span class="text-danger">*</span></label>
          <input type="datetime-local" id="directorSignedAt" required>
        </div>
        <div class="form-group">
          <label>Upload Signed Page (Optional)</label>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="file" id="directorSignedPage" accept=".pdf,.jpg,.png" style="display: none;" onchange="updateFileLabel(this, 'directorSignedLabel')">
            <button type="button" class="btn btn-sm btn-secondary" onclick="document.getElementById('directorSignedPage').click()"><i class="fas fa-upload"></i> Upload</button>
            <span id="directorSignedLabel" style="font-size: 12px; color: #666;">Scanned signed page</span>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-success"><i class="fas fa-check"></i> Record Director Signature</button>
        </div>
      </form>
    `;
    openModal('Director Signature', html);
  };

  // APP Consolidation function
  window.consolidateAPP = async function() {
    if (!confirm('Consolidate all PPMP entries into APP for FY ' + getCurrentFiscalYear() + '?\n\nThis will transform PPMP codes into APP codes and display all entries.')) return;
    
    try {
      // Call server consolidation endpoint
      const result = await apiRequest('/plan-items/consolidate', 'POST', { fiscal_year: getCurrentFiscalYear() });
      
      // Reload APP data to reflect current state
      await loadAPP();
      
      // Show summary using server-provided department breakdown
      let summary = 'APP Consolidation Complete!\n\n';
      summary += 'PPMP entries consolidated into APP with codes transformed (PPMP → APP).\n\n';
      summary += 'Breakdown by Division:\n';
      if (result.by_department) {
        result.by_department.forEach(dept => {
          const name = dept.department_name || 'Unknown';
          summary += '  ' + name + ': ' + dept.count + ' items — ₱' + parseFloat(dept.total).toLocaleString('en-PH', {minimumFractionDigits:2}) + '\n';
        });
      }
      summary += '\nTotal: ' + result.total_items + ' active items | Active ABC: ₱' + result.total_abc.toLocaleString('en-PH', {minimumFractionDigits:2});
      if (result.available_budget > 0) {
        summary += '\nAvailable Budget (from removed items): ₱' + result.available_budget.toLocaleString('en-PH', {minimumFractionDigits:2});
        summary += '\nTotal Approved Budget: ₱' + result.total_approved.toLocaleString('en-PH', {minimumFractionDigits:2});
      }
      alert(summary);
      
      // Navigate to APP page to show results
      if (typeof navigateTo === 'function') navigateTo('app');
    } catch (err) {
      alert('Consolidation failed: ' + err.message);
    }
  };

  // Set APP Status Modal
  window.showSetAPPStatusModal = function() {
    const st = window._appStatus || { app_type: 'indicative', update_count: 0 };
    const currentLabel = st.app_type === 'updated' ? 'Updated (v' + (st.update_count||1) + ')' : st.app_type.charAt(0).toUpperCase() + st.app_type.slice(1);
    const html = `
      <div class="view-details">
        <div class="detail-row"><label>Fiscal Year:</label><span>FY ${getCurrentFiscalYear()}</span></div>
        <div class="detail-row"><label>Current Status:</label><span><span class="version-tag ${st.app_type}" style="font-size:11px;">${currentLabel}</span></span></div>
        ${st.set_by_name ? '<div class="detail-row"><label>Last Set By:</label><span>' + st.set_by_name + '</span></div>' : ''}
        ${st.set_at ? '<div class="detail-row"><label>Last Set On:</label><span>' + new Date(st.set_at).toLocaleDateString('en-PH', {year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}) + '</span></div>' : ''}
      </div>
      <form id="setAPPStatusForm" onsubmit="submitAPPStatus(event)">
        <div class="form-group">
          <label>Set APP Status To <span class="text-danger">*</span></label>
          <select class="form-select" name="app_type" required>
            <option value="indicative" ${st.app_type === 'indicative' ? 'selected' : ''}>Indicative — Initial APP before budget approval</option>
            <option value="final" ${st.app_type === 'final' ? 'selected' : ''}>Final — APP after GAA/budget approval</option>
            <option value="updated" ${st.app_type === 'updated' ? 'selected' : ''}>Updated — Revised APP (currently v${st.update_count || 0})</option>
          </select>
        </div>
        <div class="form-group">
          <label>Remarks</label>
          <textarea name="remarks" rows="2" placeholder="e.g., Updated per BAC Resolution No. ${getCurrentFiscalYear()}-005">${st.remarks || ''}</textarea>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Set Status</button>
        </div>
      </form>
    `;
    openModal('Set APP Status — FY ' + getCurrentFiscalYear(), html);
  };

  // Submit APP Status
  window.submitAPPStatus = async function(e) {
    e.preventDefault();
    if (!confirm('Are you sure you want to update the APP status?')) return;
    const form = e.target;
    const appType = form.app_type.value;
    const remarks = form.remarks.value;
    try {
      const result = await apiRequest(`/app-settings/${getCurrentFiscalYear()}`, 'PUT', { app_type: appType, remarks: remarks });
      alert('APP status set to ' + appType.charAt(0).toUpperCase() + appType.slice(1) + (appType === 'updated' ? ' (v' + result.update_count + ')' : ''));
      closeModal();
      loadAPP();
    } catch (err) {
      alert('Failed to update APP status: ' + err.message);
    }
  };

  // APP Version Filter Change (dropdown sync)
  window.onAPPVersionFilterChange = function(value) {
    // When user selects a version filter, open the set status modal so they can officially change it
    showSetAPPStatusModal();
  };

  // =====================================================
  // VIEW MODALS - Display record details
  // =====================================================

  // View PPMP Details
  window.showViewPPMPModal = async function(planId) {
    try {
      const plan = await apiRequest('/plans/' + planId);
      function getDeptCode(p) {
        if (p.department_code) return p.department_code;
        const name = p.department_name;
        if (!name) return 'DMW';
        const lower = name.toLowerCase();
        if (lower.includes('finance')) return 'FAD';
        if (lower.includes('protection') && lower.includes('trafficking')) return 'MWPTD';
        if (lower.includes('processing') || lower.includes('service')) return 'MWPSD';
        if (lower.includes('welfare') || lower.includes('reintegration')) return 'WRSD';
        if (lower.includes('director')) return 'ORD';
        return name.substring(0,3).toUpperCase();
      }
      const deptCode = getDeptCode(plan);
      const ppmpNo = plan.ppmp_no || ('PPMP-' + deptCode + '-' + plan.fiscal_year + '-' + String(plan.id).padStart(3, '0'));
      const totalAmt = parseFloat(plan.total_amount || 0);
      const statusClass = plan.status === 'approved' ? 'approved' : plan.status === 'submitted' ? 'submitted' : 'draft';
      const items = plan.items || [];
      const itemsHtml = items.length > 0 ? '<div style="margin-top:15px;"><h4 style="margin-bottom:8px;">Plan Items (' + items.length + ')</h4><table class="data-table full-width" style="font-size:12px;"><thead><tr><th>Code</th><th>Item Name</th><th>Unit</th><th>Unit Price</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Total Qty</th><th>Category</th></tr></thead><tbody>' + items.map(it => '<tr><td>' + (it.item_code||'-') + '</td><td>' + (it.item_name||'-') + '</td><td>' + (it.unit||'-') + '</td><td>₱' + parseFloat(it.unit_price||0).toLocaleString('en-PH',{minimumFractionDigits:2}) + '</td><td>' + (it.q1_qty||0) + '</td><td>' + (it.q2_qty||0) + '</td><td>' + (it.q3_qty||0) + '</td><td>' + (it.q4_qty||0) + '</td><td>' + (it.total_qty||0) + '</td><td>' + (it.category||'-') + '</td></tr>').join('') + '</tbody></table></div>' : '';

      const html = `
        <div class="view-details">
          <div class="detail-row"><label>PPMP No.:</label><span>${ppmpNo}</span></div>
          <div class="detail-row"><label>Division:</label><span>${deptCode} - ${plan.department_name || ''}</span></div>
          <div class="detail-row"><label>Fiscal Year:</label><span>${plan.fiscal_year}</span></div>
          <div class="detail-row"><label>Section:</label><span style="font-weight:700; color:#b8860b; text-transform:uppercase;">${plan.section || '-'}</span></div>
          <div class="detail-row"><label>Category:</label><span style="font-weight:600; color:#1565c0;">${plan.item_category || plan.category || '-'}</span></div>
          ${plan.item_name ? `<div class="detail-row"><label>Linked Item:</label><span style="font-weight:600;">${plan.item_name} <span style="color:#4a5568;">(${plan.item_unit || ''} @ ₱${parseFloat(plan.item_unit_price || 0).toLocaleString('en-PH', {minimumFractionDigits:2})})</span></span></div>` : ''}
          ${plan.item_description ? `<div class="detail-row"><label>Item Description:</label><span style="white-space:pre-line;">${plan.item_description}</span></div>` : ''}
          <div class="detail-row"><label>General Description:</label><span>${plan.description || plan.remarks || '-'}</span></div>
          <div class="detail-row"><label>Project Type:</label><span>${plan.project_type || 'Goods'}</span></div>
          <div class="detail-row"><label>Quantity/Size:</label><span>${plan.quantity_size || '-'}</span></div>
          <div class="detail-row"><label>Mode of Procurement:</label><span>${plan.procurement_mode || 'Small Value Procurement'}</span></div>
          <div class="detail-row"><label>Pre-Procurement:</label><span>${plan.pre_procurement || 'NO'}</span></div>
          <div class="detail-row"><label>Start Date:</label><span>${plan.start_date || '-'}</span></div>
          <div class="detail-row"><label>End Date:</label><span>${plan.end_date || '-'}</span></div>
          <div class="detail-row"><label>Delivery Period:</label><span>${plan.delivery_period || '-'}</span></div>
          <div class="detail-row"><label>Source of Funds:</label><span>${plan.fund_source || 'GAA'}</span></div>
          <div class="detail-row"><label>Total ABC:</label><span>₱${totalAmt.toLocaleString('en-PH', {minimumFractionDigits: 2})}</span></div>
          <div class="detail-row"><label>Status:</label><span><span class="status-badge ${statusClass}">${plan.status}</span></span></div>
          <div class="detail-row"><label>Remarks:</label><span>${plan.remarks || '-'}</span></div>
          <div class="detail-row"><label>Date Created:</label><span>${plan.created_at ? new Date(plan.created_at).toLocaleDateString('en-PH', {year:'numeric',month:'short',day:'numeric'}) : '-'}</span></div>
        </div>
        ${itemsHtml}
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
          <button type="button" class="btn btn-primary" onclick="closeModal(); showEditPPMPModal(${planId});"><i class="fas fa-edit"></i> Edit</button>
        </div>
      `;
      openModal('View PPMP Details', html);
    } catch (err) {
      alert('Failed to load PPMP details: ' + err.message);
    }
  };

  // Approve PPMP Modal (dual approval: HOPE + Chief FAD)
  window.showApprovePPMPModal = async function(planId) {
    try {
      const plan = await apiRequest('/plans/' + planId);
      function getDeptCode(p) {
        if (p.department_code) return p.department_code;
        const name = p.department_name;
        if (!name) return 'DMW';
        const lower = name.toLowerCase();
        if (lower.includes('finance')) return 'FAD';
        if (lower.includes('protection') && lower.includes('trafficking')) return 'MWPTD';
        if (lower.includes('processing') || lower.includes('service')) return 'MWPSD';
        if (lower.includes('welfare') || lower.includes('reintegration')) return 'WRSD';
        if (lower.includes('director')) return 'ORD';
        return name.substring(0,3).toUpperCase();
      }
      const deptCode = getDeptCode(plan);
      const ppmpNo = plan.ppmp_no || ('PPMP-' + deptCode + '-' + plan.fiscal_year + '-' + String(plan.id).padStart(3, '0'));
      const totalAmt = parseFloat(plan.total_amount || 0);
      const userRole = window.currentUser?.role || '';
      const userRoles = currentUser.roles || [userRole];
      
      // Determine what this user can approve
      const chiefApproved = !!plan.approved_by_chief;
      const hopeApproved = !!plan.approved_by_hope;
      let canUserApprove = false;
      let approveLabel = '';
      if (userHasRole('chief_fad') && !chiefApproved) { canUserApprove = true; approveLabel = 'Approve as Chief FAD'; }
      if (userHasRole('hope') && !hopeApproved) { canUserApprove = true; approveLabel = 'Approve as HOPE'; }
      if (userHasRole('admin')) { canUserApprove = true; approveLabel = 'Approve (Admin)'; }

      const chiefStatus = chiefApproved 
        ? `<span class="approval-badge chief-done"><i class="fas fa-check-circle"></i> Approved by Chief FAD${plan.chief_approver_name ? ' (' + plan.chief_approver_name + ')' : ''}</span>` 
        : `<span class="approval-badge chief-pending"><i class="fas fa-clock"></i> Awaiting Chief FAD</span>`;
      const hopeStatus = hopeApproved 
        ? `<span class="approval-badge hope-done"><i class="fas fa-check-circle"></i> Approved by HOPE${plan.hope_approver_name ? ' (' + plan.hope_approver_name + ')' : ''}</span>` 
        : `<span class="approval-badge hope-pending"><i class="fas fa-clock"></i> Awaiting HOPE</span>`;

      const html = `
        <div class="view-details">
          <div class="detail-row"><label>PPMP No.:</label><span>${ppmpNo}</span></div>
          <div class="detail-row"><label>Division:</label><span>${deptCode} - ${plan.department_name || ''}</span></div>
          <div class="detail-row"><label>Description:</label><span>${plan.description || plan.remarks || '-'}</span></div>
          <div class="detail-row"><label>Mode of Procurement:</label><span>${plan.procurement_mode || '-'}</span></div>
          <div class="detail-row"><label>Total ABC:</label><span style="font-weight:bold;color:#1a365d;">₱${totalAmt.toLocaleString('en-PH', {minimumFractionDigits: 2})}</span></div>
          <div class="detail-row"><label>Status:</label><span><span class="status-badge pending">${plan.status}</span></span></div>
        </div>
        <div style="margin-top:20px;padding:15px;background:#f0f4f8;border-radius:8px;border:1px solid #e2e8f0;">
          <h4 style="margin:0 0 12px;color:#1a365d;"><i class="fas fa-clipboard-check"></i> Approval Status</h4>
          <div style="display:flex;gap:15px;flex-wrap:wrap;">
            ${chiefStatus}
            ${hopeStatus}
          </div>
          ${chiefApproved && hopeApproved ? '<p style="margin-top:12px;color:#38a169;font-weight:bold;"><i class="fas fa-check-double"></i> Fully approved — will appear in APP</p>' : ''}
        </div>
        <div class="form-group" style="text-align:right;margin-top:20px;display:flex;justify-content:flex-end;gap:10px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
          ${canUserApprove ? `<button type="button" class="btn btn-success" onclick="approvePPMP(${planId})" style="background:#38a169;color:white;"><i class="fas fa-check"></i> ${approveLabel}</button>` : `<p style="color:#636e78;font-size:13px;margin:auto 0;">You cannot approve this PPMP with your current role.</p>`}
        </div>
      `;
      openModal('Approve PPMP', html);
    } catch (err) {
      alert('Failed to load PPMP for approval: ' + err.message);
    }
  };

  // Execute PPMP approval
  window.approvePPMP = async function(planId) {
    if (!confirm('Are you sure you want to approve this PPMP entry?')) return;
    try {
      const result = await apiRequest('/plans/' + planId + '/approve', 'PUT');
      alert(result.message);
      closeModal();
      if (typeof loadPlans === 'function') loadPlans();
      else if (typeof loadPageData === 'function') loadPageData();
    } catch (err) {
      alert('Approval failed: ' + err.message);
    }
  };

  // View APP Project Details
  window.showViewAPPModal = function(itemId) {
    const items = window._appItems || [];
    const item = items.find(i => i.id === itemId);
    if (!item) { alert('APP item not found'); return; }

    function getDeptCode(name) {
      if (!name) return 'DMW';
      const lower = name.toLowerCase();
      if (lower.includes('finance')) return 'FAD';
      if (lower.includes('protection') && lower.includes('trafficking')) return 'MWPTD';
      if (lower.includes('processing') || lower.includes('service')) return 'MWPSD';
      if (lower.includes('welfare') || lower.includes('reintegration')) return 'WRSD';
      if (lower.includes('director')) return 'ORD';
      return name.substring(0,3).toUpperCase();
    }
    function getProcMode(item) {
      const mode = item.procurement_mode || item.remarks || '';
      if (!mode) return { label: 'Small Value Procurement', css: 'svp' };
      const r = mode.toLowerCase();
      if (r.includes('competitive bidding')) return { label: 'Competitive Bidding', css: 'cb' };
      if (r.includes('direct contracting')) return { label: 'Direct Contracting', css: 'dc' };
      if (r.includes('shopping')) return { label: 'Shopping', css: 'shopping' };
      if (r.includes('small value')) return { label: 'Small Value Procurement', css: 'svp' };
      if (r.includes('agency-to-agency') || r.includes('agency to agency')) return { label: 'Agency-To-Agency', css: 'others' };
      if (r.includes('negotiated')) return { label: 'Negotiated Procurement', css: 'others' };
      return { label: mode, css: 'svp' };
    }

    const deptCode = getDeptCode(item.department_name);
    const mode = getProcMode(item);
    const unitPrice = parseFloat(item.unit_price || 0);
    const totalQty = parseInt(item.total_qty || 0);
    const totalPrice = parseFloat(item.total_price || (unitPrice * totalQty));

    const html = `
      <div class="view-details">
        <div class="detail-row"><label>Item Code:</label><span>${item.item_code || '-'}</span></div>
        <div class="detail-row"><label>Item Name:</label><span>${item.item_name || '-'}</span></div>
        <div class="detail-row"><label>Description:</label><span>${item.item_description || '-'}</span></div>
        <div class="detail-row"><label>End-User:</label><span>${deptCode} - ${item.department_name || ''}</span></div>
        <div class="detail-row"><label>Category:</label><span>${item.category || '-'}</span></div>
        <div class="detail-row"><label>Unit:</label><span>${item.unit || '-'}</span></div>
        <div class="detail-row"><label>Unit Price:</label><span>₱${unitPrice.toLocaleString('en-PH', {minimumFractionDigits: 2})}</span></div>
        <div class="detail-row"><label>Quarterly Qty:</label><span>Q1: ${item.q1_qty||0} | Q2: ${item.q2_qty||0} | Q3: ${item.q3_qty||0} | Q4: ${item.q4_qty||0}</span></div>
        <div class="detail-row"><label>Total Quantity:</label><span>${totalQty} ${item.unit || ''}</span></div>
        <div class="detail-row"><label>Total Price:</label><span>₱${totalPrice.toLocaleString('en-PH', {minimumFractionDigits: 2})}</span></div>
        <div class="detail-row"><label>Procurement Mode:</label><span><span class="mode-badge ${mode.css}">${mode.label}</span></span></div>
        <div class="detail-row"><label>Funding Source:</label><span>GAA ${item.fiscal_year || String(getCurrentFiscalYear())}</span></div>
        <div class="detail-row"><label>Remarks:</label><span>${item.remarks || '-'}</span></div>
      </div>
      <div class="form-group" style="text-align: right; margin-top: 20px;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        <button type="button" class="btn btn-primary" onclick="closeModal(); showCreatePRFromAPPModal(${item.id});"><i class="fas fa-file-signature"></i> Create PR</button>
      </div>
    `;
    openModal('View APP Project', html);
  };

  // =====================================================
  // DYNAMIC VIEW MODALS — fetch real data + show attachments
  // =====================================================

  function viewStatusBadge(status) {
    if (!status) return '<span class="status-badge draft">N/A</span>';
    const s = status.toLowerCase().replace(/_/g, ' ');
    const css = status.toLowerCase().replace(/\s+/g, '-');
    return '<span class="status-badge ' + css + '">' + s.charAt(0).toUpperCase() + s.slice(1) + '</span>';
  }
  function viewDate(d) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  function viewCurrency(v) {
    return '₱' + (parseFloat(v) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
  }

  // View PR Details — dynamic
  window.showViewPRModal = function(id) {
    const p = cachedPR.find(r => r.id === id);
    if (!p) { alert('Purchase Request not found'); return; }
    // Build specs display
    let specsHtml = '<span style="color:#999;">None</span>';
    if (p.item_specifications) {
      const specs = p.item_specifications.split('\n').filter(l => l.trim());
      if (specs.length > 0) {
        specsHtml = '<ul style="margin:0;padding-left:18px;">' + specs.map(s => `<li>${s.trim()}</li>`).join('') + '</ul>';
      }
    }
    const html = `
      <div class="view-details">
        <div class="detail-row"><label>PR No.:</label><span><strong>${p.pr_number || '-'}</strong></span></div>
        <div class="detail-row"><label>Date:</label><span>${viewDate(p.pr_date || p.created_at)}</span></div>
        <div class="detail-row"><label>Division:</label><span>${p.department_name || p.department_code || '-'}</span></div>
        <div class="detail-row"><label>Purpose:</label><span>${p.purpose || '-'}</span></div>
        <div class="detail-row"><label>Amount:</label><span>${viewCurrency(p.total_amount)}</span></div>
        <div class="detail-row"><label>Qty / Unit / Unit Cost:</label><span>${p.item_qty || '-'} ${p.item_unit || ''} @ ${p.item_unit_price ? viewCurrency(p.item_unit_price) : '-'}</span></div>
        <div class="detail-row"><label>Status:</label><span>${viewStatusBadge(p.status)}</span></div>
        <div class="detail-row" style="align-items:flex-start;"><label>Item Specifications:</label><span>${specsHtml}</span></div>
      </div>
      ${getViewAttachmentSectionHTML('purchase_request', id)}
      <div class="form-group" style="text-align:right;margin-top:20px;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        <button type="button" class="btn btn-outline" onclick="printPR(${id});"><i class="fas fa-print"></i> Print</button>
      </div>
    `;
    openModal('View Purchase Request', html);
  };

  // View RFQ Details — dynamic
  window.showViewRFQModal = function(id) {
    const r = cachedRFQ.find(x => x.id === id);
    if (!r) { alert('RFQ not found'); return; }

    // Get PR qty/unit from server data or cachedPR
    let prQty = '-', prUnit = '-';
    if (r.pr_id) {
      if (r.pr_item_quantity) {
        prQty = r.pr_item_quantity;
        prUnit = r.pr_item_unit || '-';
      } else {
        const linkedPR = (cachedPR || []).find(p => p.id == r.pr_id);
        if (linkedPR) { prQty = linkedPR.item_quantity || '-'; prUnit = linkedPR.item_unit || '-'; }
      }
    }

    // Get item specifications directly from rfqs.item_specifications column
    let specsHtml = '<span style="color:#999;">None</span>';
    if (r.item_specifications) {
      const specs = r.item_specifications.split('\n').filter(l => l.trim());
      if (specs.length > 0) {
        specsHtml = '<ul style="margin:0;padding-left:18px;">' + specs.map(s => `<li>${s.trim()}</li>`).join('') + '</ul>';
      }
    }

    const html = `
      <div class="view-details">
        <div class="detail-row"><label>RFQ No.:</label><span><strong>${r.rfq_number || '-'}</strong></span></div>
        <div class="detail-row"><label>PR Reference:</label><span>${r.pr_number || '-'}</span></div>
        <div class="detail-row"><label>Date Prepared:</label><span>${viewDate(r.date_prepared)}</span></div>
        <div class="detail-row"><label>Submission Deadline:</label><span>${viewDate(r.submission_deadline)}</span></div>
        <div class="detail-row"><label>ABC Amount:</label><span>${viewCurrency(r.abc_amount)}</span></div>
        <div class="detail-row"><label>Quantity:</label><span>${prQty}</span></div>
        <div class="detail-row"><label>Unit:</label><span>${prUnit}</span></div>
        <div class="detail-row"><label>PhilGEPS Required:</label><span>${r.philgeps_required ? '<i class="fas fa-check text-success"></i> Yes' : 'No'}</span></div>
        <div class="detail-row"><label>Status:</label><span>${viewStatusBadge(r.status)}</span></div>
        <div class="detail-row" style="align-items:flex-start;"><label>Item Specifications:</label><span>${specsHtml}</span></div>
      </div>
      ${getViewAttachmentSectionHTML('rfq', id)}
      <div class="form-group" style="text-align:right;margin-top:20px;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        <button type="button" class="btn btn-outline" onclick="printRFQ(${id});"><i class="fas fa-print"></i> Print</button>
      </div>
    `;
    openModal('View RFQ Details', html);
  };

  // View Abstract Details — dynamic
  window.showViewAbstractModal = function(id) {
    const a = cachedAbstract.find(x => x.id === id);
    if (!a) { alert('Abstract not found'); return; }
    let specsHtml = '<span style="color:#999;">None</span>';
    if (a.item_specifications) {
      const specs = a.item_specifications.split('\n').filter(l => l.trim());
      if (specs.length > 0) {
        specsHtml = '<ul style="margin:0;padding-left:18px;">' + specs.map(s => `<li>${s.trim()}</li>`).join('') + '</ul>';
      }
    }
    const html = `
      <div class="view-details">
        <div class="detail-row"><label>Abstract No.:</label><span><strong>${a.abstract_number || '-'}</strong></span></div>
        <div class="detail-row"><label>RFQ Reference:</label><span>${a.rfq_number || '-'}</span></div>
        <div class="detail-row"><label>Date Prepared:</label><span>${viewDate(a.date_prepared)}</span></div>
        <div class="detail-row"><label>Purpose:</label><span>${a.purpose || '-'}</span></div>
        <div class="detail-row"><label>Recommended Supplier:</label><span>${a.supplier_name || '-'}</span></div>
        <div class="detail-row"><label>Recommended Amount:</label><span>${viewCurrency(a.recommended_amount)}</span></div>
        <div class="detail-row"><label>Status:</label><span>${viewStatusBadge(a.status)}</span></div>
        <div class="detail-row" style="align-items:flex-start;"><label>Item Specifications:</label><span>${specsHtml}</span></div>
      </div>
      ${getViewAttachmentSectionHTML('abstract', id)}
      <div class="form-group" style="text-align:right;margin-top:20px;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
      </div>
    `;
    openModal('View Abstract of Quotations', html);
  };

  // View Post-Qual Details — dynamic
  window.showViewPostQualModal = function(id) {
    const p = cachedPostQual.find(x => x.id === id);
    if (!p) { alert('Post-Qualification not found'); return; }
    const html = `
      <div class="view-details">
        <div class="detail-row"><label>Post-Qual No.:</label><span><strong>${p.postqual_number || '-'}</strong></span></div>
        <div class="detail-row"><label>Abstract Reference:</label><span>${p.abstract_number || '-'}</span></div>
        <div class="detail-row"><label>Date:</label><span>${viewDate(p.date_prepared)}</span></div>
        <div class="detail-row"><label>Bidder:</label><span>${p.supplier_name || '-'}</span></div>
        <div class="detail-row"><label>Evaluation Result:</label><span>${p.evaluation_result || '-'}</span></div>
        <div class="detail-row"><label>Status:</label><span>${viewStatusBadge(p.status)}</span></div>
      </div>
      ${getViewAttachmentSectionHTML('post_qualification', id)}
      <div class="form-group" style="text-align:right;margin-top:20px;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
      </div>
    `;
    openModal('View Post-Qualification', html);
  };

  // View BAC Resolution Details — dynamic
  window.showViewBACResolutionModal = function(id) {
    const b = cachedBACRes.find(x => x.id === id);
    if (!b) { alert('BAC Resolution not found'); return; }
    const html = `
      <div class="view-details">
        <div class="detail-row"><label>Resolution No.:</label><span><strong>${b.resolution_number || '-'}</strong></span></div>
        <div class="detail-row"><label>Abstract Reference:</label><span>${b.abstract_number || '-'}</span></div>
        <div class="detail-row"><label>Date:</label><span>${viewDate(b.resolution_date || b.date_prepared)}</span></div>
        <div class="detail-row"><label>Recommended Supplier:</label><span>${b.supplier_name || '-'}</span></div>
        <div class="detail-row"><label>Amount:</label><span>${viewCurrency(b.contract_amount || b.recommended_amount)}</span></div>
        <div class="detail-row"><label>Status:</label><span>${viewStatusBadge(b.status)}</span></div>
      </div>
      ${getViewAttachmentSectionHTML('bac_resolution', id)}
      <div class="form-group" style="text-align:right;margin-top:20px;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
      </div>
    `;
    openModal('View BAC Resolution', html);
  };

  // View NOA Details — dynamic
  window.showViewNOAModal = function(id) {
    const n = cachedNOA.find(x => x.id === id);
    if (!n) { alert('NOA not found'); return; }
    const html = `
      <div class="view-details">
        <div class="detail-row"><label>NOA No.:</label><span><strong>${n.noa_number || '-'}</strong></span></div>
        <div class="detail-row"><label>BAC Resolution Ref:</label><span>${n.resolution_number || '-'}</span></div>
        <div class="detail-row"><label>Date Issued:</label><span>${viewDate(n.date_issued)}</span></div>
        <div class="detail-row"><label>Supplier:</label><span>${n.supplier_name || '-'}</span></div>
        <div class="detail-row"><label>Contract Amount:</label><span>${viewCurrency(n.contract_amount)}</span></div>
        <div class="detail-row"><label>Bidder Receipt Date:</label><span>${viewDate(n.bidder_receipt_date)}</span></div>
        <div class="detail-row"><label>Status:</label><span>${viewStatusBadge(n.status)}</span></div>
      </div>
      ${getViewAttachmentSectionHTML('notice_of_award', id)}
      <div class="form-group" style="text-align:right;margin-top:20px;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
      </div>
    `;
    openModal('View Notice of Award', html);
  };

  // View PO Details — dynamic
  window.showViewPOModal = function(id) {
    const p = cachedPO.find(x => x.id === id);
    if (!p) { alert('Purchase Order not found'); return; }
    let specsHtml = '<span style="color:#999;">None</span>';
    if (p.item_specifications) {
      const specs = p.item_specifications.split('\n').filter(l => l.trim());
      if (specs.length > 0) {
        specsHtml = '<ul style="margin:0;padding-left:18px;">' + specs.map(s => `<li>${s.trim()}</li>`).join('') + '</ul>';
      }
    }
    const html = `
      <div class="view-details">
        <div class="detail-row"><label>PO No.:</label><span><strong>${p.po_number || '-'}</strong></span></div>
        <div class="detail-row"><label>PO Date:</label><span>${viewDate(p.po_date || p.created_at)}</span></div>
        <div class="detail-row"><label>Supplier:</label><span>${p.supplier_name || '-'}</span></div>
        <div class="detail-row"><label>Total Amount:</label><span>${viewCurrency(p.total_amount)}</span></div>
        <div class="detail-row"><label>Mode of Procurement:</label><span>${p.mode_of_procurement || '-'}</span></div>
        <div class="detail-row"><label>Place of Delivery:</label><span>${p.place_of_delivery || '-'}</span></div>
        <div class="detail-row"><label>Delivery Date:</label><span>${viewDate(p.delivery_date)}</span></div>
        <div class="detail-row"><label>Purpose:</label><span>${p.purpose || '-'}</span></div>
        <div class="detail-row"><label>Payment Terms:</label><span>${p.payment_terms || '-'}</span></div>
        <div class="detail-row"><label>Doc Status:</label><span>${viewStatusBadge(p.status)}</span></div>
        <div class="detail-row"><label>Workflow:</label><span>${viewStatusBadge(p.workflow_status)}</span></div>
        <div class="detail-row" style="align-items:flex-start;"><label>Item Specifications:</label><span>${specsHtml}</span></div>
      </div>
      ${getViewAttachmentSectionHTML('purchase_order', id)}
      <div class="form-group" style="text-align:right;margin-top:20px;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        <button type="button" class="btn btn-outline" onclick="printRecord('PO', '${p.po_number}');"><i class="fas fa-print"></i> Print</button>
      </div>
    `;
    openModal('View Purchase Order', html);
  };

  // View IAR Details — dynamic
  window.showViewIARModal = function(id) {
    const i = cachedIAR.find(x => x.id === id);
    if (!i) { alert('IAR not found'); return; }
    let specsHtml = '<span style="color:#999;">None</span>';
    if (i.item_specifications) {
      const specs = i.item_specifications.split('\n').filter(l => l.trim());
      if (specs.length > 0) {
        specsHtml = '<ul style="margin:0;padding-left:18px;">' + specs.map(s => `<li>${s.trim()}</li>`).join('') + '</ul>';
      }
    }
    const html = `
      <div class="view-details">
        <div class="detail-row"><label>IAR No.:</label><span><strong>${i.iar_number || '-'}</strong></span></div>
        <div class="detail-row"><label>Date:</label><span>${viewDate(i.iar_date || i.created_at)}</span></div>
        <div class="detail-row"><label>PO Reference:</label><span>${i.po_number || '-'}</span></div>
        <div class="detail-row"><label>Supplier:</label><span>${i.supplier_name || '-'}</span></div>
        <div class="detail-row"><label>Invoice No.:</label><span>${i.invoice_number || '-'}</span></div>
        <div class="detail-row"><label>Req. Office:</label><span>${i.requisitioning_office || '-'}</span></div>
        <div class="detail-row"><label>Status:</label><span>${viewStatusBadge(i.status)}</span></div>
        <div class="detail-row" style="align-items:flex-start;"><label>Item Specifications:</label><span>${specsHtml}</span></div>
      </div>
      ${getViewAttachmentSectionHTML('iar', id)}
      <div class="form-group" style="text-align:right;margin-top:20px;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        <button type="button" class="btn btn-outline" onclick="printRecord('IAR', '${i.iar_number}');"><i class="fas fa-print"></i> Print Appendix 62</button>
      </div>
    `;
    openModal('View IAR (Appendix 62)', html);
  };

  // View PO Packet Details with Attachment Table
  window.showViewPacketModal = async function(rowKey) {
    const data = window._poPacketData || [];
    // rowKey is 'prN' or 'poN' string — match accordingly
    const r = data.find(d => {
      const id = d.pr_id ? 'pr' + d.pr_id : 'po' + d.po_id;
      return id === String(rowKey);
    });
    if (!r) { alert('Transaction data not found.'); return; }

    // Define document steps with entity types for attachments
    const docSteps = [
      { key: 'pr', label: 'Purchase Request (PR)', entityType: 'purchaserequests', id: r.pr_id, number: r.pr_number, status: r.pr_status, signer: r.pr_approved_by_name || r.pr_requested_by_name },
      { key: 'rfq', label: 'Request for Quotation (RFQ)', entityType: 'rfqs', id: r.rfq_id, number: r.rfq_number, status: r.rfq_status, signer: r.rfq_created_by_name },
      { key: 'abstract', label: 'Abstract of Quotation', entityType: 'abstracts', id: r.abstract_id, number: r.abstract_number, status: r.abstract_status, signer: r.abstract_created_by_name },
      { key: 'bac', label: 'BAC Resolution', entityType: 'bac_resolutions', id: r.bac_res_id, number: r.resolution_number, status: r.bac_res_status, signer: r.bac_res_approved_by_name },
      { key: 'pq', label: 'Post-Qualification', entityType: 'post_qualifications', id: r.postqual_id, number: r.postqual_number, status: r.postqual_status, signer: r.postqual_created_by_name },
      { key: 'noa', label: 'Notice of Award (NOA)', entityType: 'notices_of_award', id: r.noa_id, number: r.noa_number, status: r.noa_status, signer: r.noa_created_by_name },
      { key: 'po', label: 'Purchase Order (PO)', entityType: 'purchaseorders', id: r.po_id, number: r.po_number, status: r.po_status, signer: r.po_approved_by_name || r.po_created_by_name },
      { key: 'iar', label: 'Inspection & Acceptance (IAR)', entityType: 'iars', id: r.iar_id, number: r.iar_number, status: r.iar_status, signer: r.iar_inspected_by_name || r.iar_received_by_name }
    ];

    function statusIcon(exists, status) {
      if (!exists) return '<i class="fas fa-times-circle" style="color:var(--danger-color)"></i> Not Created';
      const st = (status || '').toLowerCase();
      if (['approved','completed','signed','received','accepted','processed'].includes(st))
        return '<i class="fas fa-check-circle" style="color:var(--success-color)"></i> ' + st.replace(/_/g,' ');
      if (['rejected','cancelled'].includes(st))
        return '<i class="fas fa-ban" style="color:var(--danger-color)"></i> ' + st.replace(/_/g,' ');
      return '<i class="fas fa-clock" style="color:var(--warning-color)"></i> ' + (st || 'pending').replace(/_/g,' ');
    }

    const html = `
      <div class="view-details" style="margin-bottom: 14px;">
        <div class="detail-row"><label>PR Number:</label><span><strong>${r.pr_number || '-'}</strong></span></div>
        <div class="detail-row"><label>Office/Section:</label><span>${r.division_name || r.division_code || 'DMW Caraga'}</span></div>
        <div class="detail-row"><label>PO Number:</label><span>${r.po_number || 'Not yet created'}</span></div>
        <div class="detail-row"><label>Supplier:</label><span>${r.supplier_name || '-'}</span></div>
        <div class="detail-row"><label>Amount:</label><span>₱${parseFloat(r.total_amount || r.pr_amount || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</span></div>
      </div>

      <h4 style="margin: 14px 0 8px; border-bottom: 2px solid var(--primary-color); padding-bottom: 4px;">
        <i class="fas fa-paperclip"></i> Compiled Documents — Attachments
      </h4>
      <table class="data-table full-width pkt-attach-table" style="font-size: 12px;">
        <thead>
          <tr>
            <th style="width:22%;">Document</th>
            <th style="width:13%;">Ref. No.</th>
            <th style="width:12%;">Status</th>
            <th style="width:14%;">Signed By</th>
            <th style="width:24%;">Attached File(s)</th>
            <th style="width:15%;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${docSteps.map(d => `
            <tr>
              <td style="font-weight:600;">${d.label}</td>
              <td>${d.number || '-'}</td>
              <td>${statusIcon(d.id, d.status)}</td>
              <td>${d.signer || '-'}</td>
              <td>
                <div id="pktAtt_${d.key}" style="min-height:28px;">
                  ${d.id ? '<span style="color:#999; font-size:11px;"><i class="fas fa-spinner fa-spin"></i> Loading...</span>' : '<span style="color:#999; font-size:11px;">—</span>'}
                </div>
              </td>
              <td>
                ${d.id ? `
                  <div style="display:flex; gap:4px; align-items:center;">
                    <input type="file" id="pktFile_${d.key}" style="display:none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onchange="pktUploadFile('${d.entityType}', ${d.id}, '${d.key}', this)">
                    <button class="btn-icon" title="Upload File" onclick="document.getElementById('pktFile_${d.key}').click()" style="padding:3px 6px;">
                      <i class="fas fa-upload" style="font-size:11px;"></i>
                    </button>
                  </div>
                ` : '<span style="color:#ccc; font-size:11px;">—</span>'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h4 style="margin: 18px 0 8px; border-bottom: 2px solid var(--primary-color); padding-bottom: 4px;">
        <i class="fas fa-signature"></i> Packet Signing Status
      </h4>
      <div class="view-details">
        <div class="detail-row">
          <label>Chief Signed:</label>
          <span>${r.chief_signed_at 
            ? '<span class="status-badge approved"><i class="fas fa-check"></i> ' + new Date(r.chief_signed_at).toLocaleDateString() + '</span> by ' + (r.chief_signed_by_name || '-')
            : '<span class="status-badge pending">Pending</span>'}</span>
        </div>
        <div class="detail-row">
          <label>Director Signed:</label>
          <span>${r.director_signed_at 
            ? '<span class="status-badge approved"><i class="fas fa-check"></i> ' + new Date(r.director_signed_at).toLocaleDateString() + '</span> by ' + (r.director_signed_by_name || '-')
            : '<span class="status-badge pending">Pending</span>'}</span>
        </div>
        <div class="detail-row">
          <label>Packet Status:</label>
          <span>${r.packet_status 
            ? '<span class="status-badge ' + (r.packet_status === 'signed' ? 'approved' : r.packet_status === 'submitted_to_coa' ? 'coa-submitted' : r.packet_status === 'for_signing' ? 'for-signing' : 'draft') + '">' + r.packet_status.replace(/_/g, ' ') + '</span>'
            : '<span class="status-badge draft">No Packet</span>'}</span>
        </div>
      </div>

      <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:20px;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        <button type="button" class="btn btn-outline" onclick="printRecord('Packet', '${r.pr_number}')"><i class="fas fa-print"></i> Print</button>
        ${r.po_id && !r.packet_id ? '<button type="button" class="btn btn-primary" onclick="closeModal(); compilePacketForPO(' + r.po_id + ');"><i class="fas fa-folder-plus"></i> Compile Packet</button>' : ''}
        ${r.packet_id && !r.chief_signed_at ? '<button type="button" class="btn btn-success" onclick="closeModal(); handleChiefSignAction(' + r.packet_id + ');"><i class="fas fa-signature"></i> Chief Sign</button>' : ''}
        ${r.packet_id && !r.director_signed_at ? '<button type="button" class="btn btn-success" onclick="closeModal(); handleDirectorSignAction(' + r.packet_id + ');"><i class="fas fa-signature"></i> Director Sign</button>' : ''}
      </div>
    `;
    openModal('Document Monitoring — ' + (r.pr_number || r.po_number || 'Transaction'), html);

    // Load attachments for each document step that exists
    for (const d of docSteps) {
      if (d.id) {
        pktLoadAttachments(d.entityType, d.id, d.key);
      }
    }
  };

  // Load & render attachments for a document step inside the packet modal
  window.pktLoadAttachments = async function(entityType, entityId, key) {
    const container = document.getElementById('pktAtt_' + key);
    if (!container) return;
    try {
      const atts = await getAttachments(entityType, entityId);
      if (!atts || atts.length === 0) {
        container.innerHTML = '<span style="color:#999; font-size:11px;">No files attached</span>';
        return;
      }
      container.innerHTML = atts.map(att => {
        const icon = att.mime_type === 'application/pdf' ? 'fa-file-pdf' 
          : (att.mime_type && att.mime_type.startsWith('image/')) ? 'fa-file-image'
          : (att.mime_type && att.mime_type.includes('word')) ? 'fa-file-word'
          : (att.mime_type && (att.mime_type.includes('excel') || att.mime_type.includes('spreadsheet'))) ? 'fa-file-excel'
          : 'fa-file';
        const color = att.mime_type === 'application/pdf' ? '#e74c3c'
          : (att.mime_type && att.mime_type.startsWith('image/')) ? '#f39c12'
          : (att.mime_type && att.mime_type.includes('word')) ? '#2b5797'
          : (att.mime_type && (att.mime_type.includes('excel') || att.mime_type.includes('spreadsheet'))) ? '#217346'
          : '#666';
        const sizeStr = att.file_size_bytes < 1048576 ? (att.file_size_bytes / 1024).toFixed(1) + ' KB' : (att.file_size_bytes / 1048576).toFixed(1) + ' MB';
        return `
          <div class="pkt-att-row">
            <i class="fas ${icon}" style="color:${color}; font-size:13px;"></i>
            <span class="pkt-att-name" title="${att.original_name}">${att.original_name}</span>
            <span class="pkt-att-size">${sizeStr}</span>
            <button class="btn-icon" title="Download" onclick="window.open('${API_URL}/attachments/download/${att.id}','_blank')" style="padding:2px 4px;"><i class="fas fa-download" style="font-size:10px;"></i></button>
            <button class="btn-icon" title="View" onclick="previewAttachment(${att.id}, '${(att.original_name || '').replace(/'/g, "\\'")}', '${att.mime_type}')" style="padding:2px 4px;"><i class="fas fa-eye" style="font-size:10px;"></i></button>
            <button class="btn-icon danger" title="Delete" onclick="pktDeleteAttachment(${att.id},'${entityType}',${entityId},'${key}')" style="padding:2px 4px;"><i class="fas fa-trash" style="font-size:10px;"></i></button>
          </div>`;
      }).join('');
    } catch (err) {
      container.innerHTML = '<span style="color:var(--danger-color); font-size:11px;">Error loading</span>';
    }
  };

  // Upload file for a document step
  window.pktUploadFile = async function(entityType, entityId, key, input, rowId) {
    if (!input.files || input.files.length === 0) return;
    // Show uploading indicator in either modal or table cell container
    const modalContainer = document.getElementById('pktAtt_' + key);
    const cellContainer = document.getElementById('pktCell_' + key);
    if (modalContainer) modalContainer.innerHTML = '<span style="color:#999; font-size:11px;"><i class="fas fa-spinner fa-spin"></i> Uploading...</span>';
    if (cellContainer) cellContainer.innerHTML = '<span class="pkt-cell-loading"><i class="fas fa-spinner fa-spin"></i> Uploading...</span>';

    const formData = new FormData();
    formData.append('entity_type', entityType);
    formData.append('entity_id', entityId);
    // Only upload the FIRST file (one document per cell)
    formData.append('files', input.files[0]);

    try {
      const response = await fetch(API_URL + '/attachments/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Upload failed');
      }
      showToast('File uploaded successfully!', 'success');
      if (modalContainer) pktLoadAttachments(entityType, entityId, key);
      if (cellContainer) pktLoadCellAttachments(entityType, entityId, key, rowId);
    } catch (err) {
      showToast('Upload error: ' + err.message, 'error');
      if (modalContainer) pktLoadAttachments(entityType, entityId, key);
      if (cellContainer) pktLoadCellAttachments(entityType, entityId, key, rowId);
    }
    input.value = ''; // reset file input
  };

  // Delete attachment and refresh the row
  window.pktDeleteAttachment = async function(attachmentId, entityType, entityId, key) {
    const deleted = await deleteAttachment(attachmentId);
    if (deleted) {
      pktLoadAttachments(entityType, entityId, key);
    }
  };

  // Compile packet for a specific PO
  window.compilePacketForPO = async function(poId) {
    if (!confirm('Compile a PO Packet for this Purchase Order? This marks all supporting documents as compiled for signing.')) return;
    try {
      await apiRequest('/po-packets', 'POST', { po_id: poId, status: 'for_signing', remarks: 'Compiled via Document Monitoring' });
      showToast('PO Packet compiled successfully!', 'success');
      loadPOPacket();
    } catch (err) {
      showToast(err.message || 'Failed to compile packet', 'error');
    }
  };

  // Chief Sign action
  window.handleChiefSignAction = async function(packetId) {
    if (!confirm('Record Chief signature on this PO Packet?')) return;
    try {
      await apiRequest('/po-packets/' + packetId + '/chief-sign', 'PUT');
      showToast('Chief signature recorded!', 'success');
      loadPOPacket();
    } catch (err) {
      showToast(err.message || 'Failed to record signature', 'error');
    }
  };

  // Director Sign action
  window.handleDirectorSignAction = async function(packetId) {
    if (!confirm('Record Director signature on this PO Packet?')) return;
    try {
      await apiRequest('/po-packets/' + packetId + '/director-sign', 'PUT');
      showToast('Director signature recorded!', 'success');
      loadPOPacket();
    } catch (err) {
      showToast(err.message || 'Failed to record signature', 'error');
    }
  };

  // View COA Submission Details
  window.showViewCOAModal = async function(coaId) {
    let coa = {};
    try { coa = await apiRequest('/coa/' + coaId); } catch(e) {
      // fallback to cached
      const allCoa = window._cachedCOA || [];
      coa = allCoa.find(c => c.id === coaId || c.submission_number === coaId) || {};
    }
    const html = `
      <div class="view-details">
        <div class="detail-row"><label>Submission No.:</label><span>${coa.submission_number || coaId || ''}</span></div>
        <div class="detail-row"><label>PO Reference:</label><span>${coa.po_number || 'N/A'}</span></div>
        <div class="detail-row"><label>Packet Status:</label><span><span class="status-badge ${coa.packet_status || 'signed'}">${coa.packet_status || 'N/A'}</span></span></div>
        <div class="detail-row"><label>Amount:</label><span>₱${parseFloat(coa.amount || 0).toLocaleString('en-PH', {minimumFractionDigits:2})}</span></div>
        <div class="detail-row"><label>Submitted:</label><span>${coa.submission_date ? new Date(coa.submission_date).toLocaleDateString('en-PH') : 'N/A'}</span></div>
        <div class="detail-row"><label>Received by COA:</label><span>${coa.received_by || 'N/A'}</span></div>
        <div class="detail-row"><label>Status:</label><span><span class="status-badge submitted-to-coa">${coa.status || 'N/A'}</span></span></div>
      </div>
      <div class="form-group" style="text-align: right; margin-top: 20px;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        <button type="button" class="btn btn-outline" onclick="printRecord('COA', '${coa.submission_number || coaId}');"><i class="fas fa-print"></i> Print</button>
      </div>
    `;
    openModal('View COA Submission', html);
  };

  // View Supplier Details
  window.showViewSupplierModal = async function(supplierId) {
    let s = {};
    try { s = await apiRequest('/suppliers/' + supplierId); } catch(e) { alert('Could not load supplier'); return; }
    const html = `
      <div class="view-details">
        <div class="detail-row"><label>Supplier ID:</label><span>${s.supplier_code || supplierId}</span></div>
        <div class="detail-row"><label>Company Name:</label><span>${s.company_name || s.name || 'N/A'}</span></div>
        <div class="detail-row"><label>Address:</label><span>${s.address || 'N/A'}</span></div>
        <div class="detail-row"><label>Contact:</label><span>${s.contact_number || s.phone || 'N/A'}</span></div>
        <div class="detail-row"><label>PhilGEPS Status:</label><span><span class="status-badge">${s.philgeps_registration || 'N/A'}</span></span></div>
        <div class="detail-row"><label>TIN:</label><span>${s.tin || 'N/A'}</span></div>
        <div class="detail-row"><label>Email:</label><span>${s.email || 'N/A'}</span></div>
        <div class="detail-row"><label>Contact Person:</label><span>${s.contact_person || 'N/A'}</span></div>
      </div>
      <h4 style="margin-top: 15px;">Transaction History</h4>
      <table class="data-table" style="font-size: 12px; margin-top: 8px;">
        <thead><tr><th>PO No.</th><th>Project</th><th>Amount</th><th>Date</th></tr></thead>
        <tbody>
          ${(() => { const pos = (cachedPO || []).filter(p => p.supplier_id == supplierId); return pos.length ? pos.map(p => `<tr><td>${p.po_number||''}</td><td>${p.purpose||''}</td><td>₱${parseFloat(p.total_amount||0).toLocaleString('en-PH',{minimumFractionDigits:2})}</td><td>${p.po_date ? new Date(p.po_date).toLocaleDateString('en-PH') : ''}</td></tr>`).join('') : '<tr><td colspan="4" style="text-align:center;color:#999;">No transactions found</td></tr>'; })()}
        </tbody>
      </table>
      <div class="form-group" style="text-align: right; margin-top: 20px;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        <button type="button" class="btn btn-primary" onclick="closeModal(); showEditSupplierModal('${supplierId}');"><i class="fas fa-edit"></i> Edit</button>
      </div>
    `;
    openModal('View Supplier Profile', html);
  };

  // =====================================================
  // EDIT MODALS - Modify existing records
  // =====================================================

  // Edit PPMP Modal
  window.showEditPPMPModal = async function(planId) {
    try {
      const plan = await apiRequest('/plans/' + planId);
      await Promise.all([ensureDivisionsLoaded(), ensureProcModesLoaded()]);
      
      // Load items catalog for item selector
      let allItems = [];
      try { allItems = await apiRequest('/items'); } catch(e) { console.warn('Could not load items'); }
      window._ppmpItemsCache = allItems;

      // Build category filter options from item catalog
      const itemCats = [...new Set(allItems.map(i => i.category).filter(Boolean))].sort();
      const catFilterOptions = itemCats.map(c => `<option value="${c}">${c}</option>`).join('');

      // Build item options (all items, pre-select linked one)
      const itemOptions = allItems.map(i => `<option value="${i.id}" ${String(i.id) === String(plan.item_id) ? 'selected' : ''} data-category="${(i.category || '').replace(/"/g, '&quot;')}">${i.code} - ${i.name} (${i.unit || ''} @ ₱${parseFloat(i.unit_price || 0).toLocaleString('en-PH', {minimumFractionDigits:2})})</option>`).join('');

      // Current section value
      const currentSection = plan.section || 'GENERAL PROCUREMENT';

      function getDeptCode(name) {
        if (!name) return 'DMW';
        const lower = name.toLowerCase();
        if (lower.includes('finance')) return 'FAD';
        if (lower.includes('protection') && lower.includes('trafficking')) return 'MWPTD';
        if (lower.includes('processing') || lower.includes('service')) return 'MWPSD';
        if (lower.includes('welfare') || lower.includes('reintegration')) return 'WRSD';
        if (lower.includes('director')) return 'ORD';
        return name.substring(0,3).toUpperCase();
      }
      const deptCode = plan.department_code || getDeptCode(plan.department_name);
      const ppmpNo = plan.ppmp_no || 'PPMP-' + deptCode + '-' + plan.fiscal_year + '-' + String(plan.id).padStart(3, '0');
      const totalAmt = parseFloat(plan.total_amount || 0);
      const statusVal = plan.status || 'draft';

      // Build item info for display (read-only linked item)
      const linkedItem = allItems.find(i => String(i.id) === String(plan.item_id));
      
      // Item description: use item_description column, fallback to description
      const currentItemDesc = plan.item_description || plan.description || '';

      const html = `
        <form id="editPPMPForm" onsubmit="submitEditPPMP(event, ${planId})">
          <div class="form-row">
            <div class="form-group">
              <label>PPMP No.</label>
              <input type="text" name="ppmp_no" value="${ppmpNo}" readonly style="background: #f5f5f5;">
            </div>
            <div class="form-group">
              <label>Division</label>
              <input type="text" value="${deptCode} - ${plan.department_name || ''}" readonly style="background: #f5f5f5;">
              <input type="hidden" name="dept_id" value="${plan.dept_id || ''}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Fiscal Year <span class="text-danger">*</span></label>
              <input type="number" name="fiscal_year" value="${plan.fiscal_year}" required>
            </div>
            <div class="form-group">
              <label>Status <span class="text-danger">*</span></label>
              <select class="form-select" name="status" required>
                <option value="draft" ${statusVal==='draft'?'selected':''}>Draft</option>
                <option value="pending" ${statusVal==='pending'?'selected':''}>Pending</option>
                <option value="submitted" ${statusVal==='submitted'?'selected':''}>Submitted</option>
                <option value="approved" ${statusVal==='approved'?'selected':''}>Approved</option>
                <option value="rejected" ${statusVal==='rejected'?'selected':''}>Rejected</option>
              </select>
            </div>
          </div>

          <div class="form-section-header"><i class="fas fa-layer-group"></i> Linked Items <small style="font-weight:400; color:#4a5568;">(check items to link, each with its own description)</small></div>
          ${plan.item_id && linkedItem ? `
          <div style="background:#e8f7ed; border:1px solid #c6f6d5; border-radius:6px; padding:10px 14px; margin-bottom:12px;">
            <div style="font-size:12px; font-weight:600; color:#276749; margin-bottom:4px;"><i class="fas fa-link"></i> Currently Linked Item</div>
            <div style="font-size:13px; font-weight:700; color:#1a202c;">${escapeHtml(linkedItem.code || '')} — ${escapeHtml(linkedItem.name || '')}</div>
            <div style="font-size:11px; color:#4a5568;">${linkedItem.unit || ''} @ ₱${parseFloat(linkedItem.unit_price || 0).toLocaleString('en-PH', {minimumFractionDigits:2})} · ${linkedItem.category || ''}</div>
            ${currentItemDesc ? `<div style="margin-top:6px; font-size:12px; color:#2d3748; white-space:pre-line; background:#fff; padding:6px 8px; border-radius:4px; border:1px solid #e2e8f0;"><strong>Item Description:</strong>\n${escapeHtml(currentItemDesc)}</div>` : ''}
          </div>` : (plan.item_description ? `
          <div style="background:#ebf8ff; border:1px solid #bee3f8; border-radius:6px; padding:10px 14px; margin-bottom:12px;">
            <div style="font-size:12px; font-weight:600; color:#2b6cb0; margin-bottom:4px;"><i class="fas fa-info-circle"></i> Current Item Description</div>
            <div style="font-size:12px; color:#2d3748; white-space:pre-line;">${escapeHtml(plan.item_description)}</div>
          </div>` : '')}
          <div class="form-row">
            <div class="form-group">
              <label>Section <span class="text-danger">*</span></label>
              <select class="form-select" id="ppmpSection" name="section" required>
                <option value="OFFICE OPERATION" ${currentSection==='OFFICE OPERATION'?'selected':''}>OFFICE OPERATION</option>
                <option value="SEMI- FURNITURE & FIXTURES" ${currentSection==='SEMI- FURNITURE & FIXTURES'?'selected':''}>SEMI- FURNITURE & FIXTURES</option>
                <option value="TRAININGS & ACTIVITIES" ${currentSection==='TRAININGS & ACTIVITIES'?'selected':''}>TRAININGS & ACTIVITIES</option>
                <option value="CAPITAL OUTLAY" ${currentSection==='CAPITAL OUTLAY'?'selected':''}>CAPITAL OUTLAY</option>
                <option value="GENERAL PROCUREMENT" ${currentSection==='GENERAL PROCUREMENT'?'selected':''}>GENERAL PROCUREMENT</option>
              </select>
            </div>
            <div class="form-group">
              <label>Filter / Search Items</label>
              <input type="text" id="ppmpEditItemSearch" placeholder="Type to filter items..." oninput="filterEditPPMPItems()" style="font-size:12px;">
            </div>
          </div>
          <div class="form-group">
            <label>Filter by Category</label>
            <select class="form-select" id="ppmpEditCatFilter" onchange="filterEditPPMPItems()" style="font-size:12px;">
              <option value="">-- All Categories --</option>
              ${catFilterOptions}
            </select>
          </div>

          <div id="ppmpEditItemsList" class="ppmp-checkbox-list" style="max-height:280px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:6px; margin-bottom:16px; background:#fff;">
            <!-- Items rendered by JS -->
          </div>
          <div id="ppmpEditCheckedSummary" style="font-size:12px; color:#2b6cb0; font-weight:600; margin-bottom:12px;"></div>

          <div class="form-section-header"><i class="fas fa-clipboard-list"></i> Procurement Details</div>
          <div class="form-group">
            <label>General Description & Objective</label>
            <textarea name="description" rows="2" id="ppmpDescription" >${plan.description || ''}</textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Type of Project</label>
              <select class="form-select" name="project_type">
                <option value="Goods" ${plan.project_type==='Goods'?'selected':''}>Goods</option>
                <option value="Infrastructure" ${plan.project_type==='Infrastructure'?'selected':''}>Infrastructure</option>
                <option value="Consulting Services" ${plan.project_type==='Consulting Services'?'selected':''}>Consulting Services</option>
              </select>
            </div>
            <div class="form-group">
              <label>Quantity & Size</label>
              <input type="text" name="quantity_size" value="${plan.quantity_size || ''}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Mode of Procurement</label>
              <select class="form-select" name="procurement_mode">
                ${buildProcModeOptions(plan.procurement_mode || 'Small Value Procurement')}
              </select>
            </div>
            <div class="form-group">
              <label>Pre-Procurement Conference</label>
              <select class="form-select" name="pre_procurement">
                <option value="NO" ${plan.pre_procurement!=='YES'?'selected':''}>NO</option>
                <option value="YES" ${plan.pre_procurement==='YES'?'selected':''}>YES</option>
              </select>
            </div>
          </div>
          <div class="form-row-3">
            <div class="form-group">
              <label>Start of Procurement</label>
              <input type="text" name="start_date" value="${plan.start_date || ''}" placeholder="MM/YYYY or text">
            </div>
            <div class="form-group">
              <label>End of Procurement</label>
              <input type="text" name="end_date" value="${plan.end_date || ''}" placeholder="MM/YYYY or text">
            </div>
            <div class="form-group">
              <label>Expected Delivery</label>
              <input type="text" name="delivery_period" value="${plan.delivery_period || ''}" placeholder="MM/YYYY or text">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Total Amount (ABC) <span class="text-danger">*</span></label>
              <input type="number" name="total_amount" id="ppmpBudget" step="0.01" value="${totalAmt.toFixed(2)}" required>
            </div>
            <div class="form-group">
              <label>Funding Source</label>
              <select class="form-select" name="fund_source">
                <option value="GAA ${plan.fiscal_year} - Current Appropriation" ${(plan.fund_source||'').includes('Current') ? 'selected' : ''}>GAA ${plan.fiscal_year} - Current Appropriation</option>
                <option value="GAA ${plan.fiscal_year}" ${plan.fund_source===('GAA '+plan.fiscal_year) ? 'selected' : ''}>GAA ${plan.fiscal_year}</option>
                <option value="GAA" ${plan.fund_source==='GAA'?'selected':''}>GAA</option>
                <option value="Special Fund" ${plan.fund_source==='Special Fund'?'selected':''}>Special Fund</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Remarks</label>
            <textarea name="remarks" rows="2">${plan.remarks || ''}</textarea>
          </div>
          <div class="form-group" style="text-align: right; margin-top: 20px;">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
          </div>
        </form>
      `;
      openModal('Edit PPMP', html);

      // Store edit context
      window._ppmpEditPlanId = planId;
      window._ppmpEditPlan = plan;
      window._ppmpEditCheckedItems = {};
      
      // Pre-check the currently linked item with its description
      if (plan.item_id && linkedItem) {
        window._ppmpEditCheckedItems[String(plan.item_id)] = {
          item_id: plan.item_id,
          item: linkedItem,
          description: currentItemDesc,
          isOriginal: true
        };
      }

      // Render the checkbox items list
      renderEditPPMPItemsList();
    } catch (err) {
      alert('Failed to load PPMP for editing: ' + err.message);
    }
  };

  /**
   * Filter the edit modal items checkbox list by search text and category.
   */
  window.filterEditPPMPItems = function() {
    renderEditPPMPItemsList();
  };

  /**
   * Render the checkbox items list in the edit modal.
   * Shows all items with checkboxes; checked items show a description textarea.
   */
  window.renderEditPPMPItemsList = function() {
    const container = document.getElementById('ppmpEditItemsList');
    const summaryEl = document.getElementById('ppmpEditCheckedSummary');
    if (!container) return;

    const allItems = window._ppmpItemsCache || [];
    const checked = window._ppmpEditCheckedItems || {};
    const searchText = (document.getElementById('ppmpEditItemSearch')?.value || '').trim().toUpperCase();
    const catFilter = document.getElementById('ppmpEditCatFilter')?.value || '';

    // Always show checked items regardless of filter
    const checkedIds = Object.keys(checked);
    const checkedItems = allItems.filter(i => checkedIds.includes(String(i.id)));

    // Filter UNCHECKED items only
    let filteredUnchecked = allItems.filter(i => !checkedIds.includes(String(i.id)));
    if (catFilter) {
      filteredUnchecked = filteredUnchecked.filter(i => (i.category || '').toUpperCase() === catFilter.toUpperCase());
    }
    if (searchText) {
      filteredUnchecked = filteredUnchecked.filter(i => {
        const searchable = ((i.code || '') + ' ' + (i.name || '') + ' ' + (i.category || '')).toUpperCase();
        return searchable.includes(searchText);
      });
    }

    // Checked items always on top, then filtered unchecked
    const sortedItems = [...checkedItems, ...filteredUnchecked];

    if (sortedItems.length === 0) {
      container.innerHTML = '<div style="padding:20px; text-align:center; color:#999; font-size:12px;">No items match your filter.</div>';
      return;
    }

    container.innerHTML = sortedItems.map(item => {
      const id = String(item.id);
      const isChecked = !!checked[id];
      const desc = isChecked ? (checked[id].description || '') : '';
      const isOrig = isChecked && checked[id].isOriginal;
      const price = parseFloat(item.unit_price || 0);
      return `
        <div class="ppmp-item-checkbox-row ${isChecked ? 'checked' : ''} ${isOrig ? 'original' : ''}" data-item-id="${id}">
          <label class="ppmp-item-check-label">
            <input type="checkbox" ${isChecked ? 'checked' : ''} 
              onchange="toggleEditPPMPItem('${id}', this.checked)">
            <span class="ppmp-item-check-info">
              <strong>${escapeHtml(item.code)}</strong> — ${escapeHtml(item.name)}
              <span class="ppmp-item-check-meta">${item.unit || ''} @ ₱${price.toLocaleString('en-PH', {minimumFractionDigits:2})}${item.category ? ' · ' + item.category : ''}</span>
            </span>
            ${isOrig ? '<span class="ppmp-item-orig-badge">current</span>' : ''}
          </label>
          ${isChecked ? `
          <div class="ppmp-item-desc-input">
            <textarea rows="2" placeholder="Item description (specs, size, color, etc.)"
              oninput="updateEditPPMPItemDesc('${id}', this.value)">${escapeHtml(desc)}</textarea>
          </div>` : ''}
        </div>`;
    }).join('');

    // Update summary
    if (summaryEl) {
      const count = checkedIds.length;
      summaryEl.textContent = count > 0 ? count + ' item' + (count > 1 ? 's' : '') + ' selected' : '';
    }
  };

  /**
   * Toggle an item checkbox in the edit modal.
   */
  window.toggleEditPPMPItem = function(itemId, isChecked) {
    const allItems = window._ppmpItemsCache || [];
    if (isChecked) {
      const item = allItems.find(i => String(i.id) === String(itemId));
      if (!item) return;
      window._ppmpEditCheckedItems[itemId] = {
        item_id: parseInt(itemId),
        item: item,
        description: buildItemDescription(item),
        isOriginal: false
      };
      // Auto-set section from first checked item's category
      const sectionField = document.getElementById('ppmpSection');
      if (sectionField && item.category) {
        const autoSection = CATEGORY_TO_SECTION[item.category] || 'GENERAL PROCUREMENT';
        sectionField.value = autoSection;
      }
    } else {
      delete window._ppmpEditCheckedItems[itemId];
    }
    renderEditPPMPItemsList();
  };

  /**
   * Update the item description for a checked item in the edit modal.
   */
  window.updateEditPPMPItemDesc = function(itemId, value) {
    if (window._ppmpEditCheckedItems[itemId]) {
      window._ppmpEditCheckedItems[itemId].description = value;
    }
  };

  // syncDescToCheckedItem removed — general description and item_description are independent fields

  // Submit Edit PPMP — handles multiple checked items or no items
  window.submitEditPPMP = async function(e, planId) {
    e.preventDefault();
    const checked = window._ppmpEditCheckedItems || {};
    const checkedIds = Object.keys(checked);

    const form = e.target;
    const deptId = form.querySelector('input[name="dept_id"]')?.value || window._ppmpEditPlan?.dept_id || null;
    const commonData = {
      dept_id: deptId ? parseInt(deptId) : null,
      fiscal_year: parseInt(form.fiscal_year.value),
      status: form.status.value,
      section: form.section?.value || 'GENERAL PROCUREMENT',
      description: form.description?.value || null,
      project_type: form.project_type?.value || 'Goods',
      quantity_size: form.quantity_size?.value || null,
      procurement_mode: form.procurement_mode?.value || null,
      pre_procurement: form.pre_procurement?.value || 'NO',
      start_date: form.start_date?.value || null,
      end_date: form.end_date?.value || null,
      delivery_period: form.delivery_period?.value || null,
      total_amount: parseFloat(form.total_amount.value),
      fund_source: form.fund_source?.value || 'GAA',
      remarks: form.remarks.value
    };

    // Separate: the original item (update existing plan) vs new items (batch create)
    const originalEntry = checkedIds.find(id => checked[id].isOriginal);
    const newEntries = checkedIds.filter(id => !checked[id].isOriginal);

    // Build confirmation message
    if (checkedIds.length === 0) {
      if (!confirm('Save PPMP changes? (No items linked)')) return;
    } else {
      const totalItems = checkedIds.length;
      const itemSummary = checkedIds.map((id, i) => {
        const c = checked[id];
        return '  ' + (i+1) + '. ' + (c.item?.name || 'Item #' + id) + (c.isOriginal ? ' (current)' : ' (NEW)');
      }).join('\n');
      if (!confirm('Save changes for ' + totalItems + ' item(s)?\n\n' + itemSummary + '\n\n' + (newEntries.length > 0 ? newEntries.length + ' new PPMP entries will be created.' : 'Updating existing entry.'))) return;
    }

    try {
      let savedCount = 0;

      if (checkedIds.length === 0) {
        // No items checked — update plan fields, preserve existing item linkage
        const data = {
          ...commonData,
          ppmp_no: form.ppmp_no?.value || undefined,
          item_id: window._ppmpEditPlan?.item_id || null,
          category: window._ppmpEditPlan?.category || null,
          item_description: window._ppmpEditPlan?.item_description || null
        };
        await apiRequest('/plans/' + planId, 'PUT', data);
        savedCount = 1;
      } else {
      // 1. Update the original PPMP entry
      if (originalEntry) {
        const origDesc = checked[originalEntry].description || null;
        const origData = {
          ...commonData,
          ppmp_no: form.ppmp_no?.value || undefined,
          item_id: parseInt(originalEntry),
          category: checked[originalEntry].item?.category || null,
          item_description: origDesc
        };
        await apiRequest('/plans/' + planId, 'PUT', origData);
        savedCount++;
      } else if (checkedIds.length > 0) {
        // No original item — update with the first checked item
        const firstId = checkedIds[0];
        const firstDesc = checked[firstId].description || null;
        const firstData = {
          ...commonData,
          ppmp_no: form.ppmp_no?.value || undefined,
          item_id: parseInt(firstId),
          category: checked[firstId].item?.category || null,
          item_description: firstDesc
        };
        await apiRequest('/plans/' + planId, 'PUT', firstData);
        savedCount++;
        // Remove from newEntries since it was used for the update
        const idx = newEntries.indexOf(firstId);
        if (idx > -1) newEntries.splice(idx, 1);
      }

      // 2. Batch create new PPMP entries for additional checked items
      if (newEntries.length > 0) {
        const entries = newEntries.map(id => {
          const c = checked[id];
          return {
            ...commonData,
            item_id: parseInt(id),
            category: c.item?.category || null,
            item_description: c.description || null,
            description: c.description || commonData.description
          };
        });

        try {
          const result = await apiRequest('/plans/batch', 'POST', { entries });
          savedCount += result.count || entries.length;
        } catch(batchErr) {
          // Fallback: create one by one
          for (const entry of entries) {
            try {
              await apiRequest('/plans', 'POST', entry);
              savedCount++;
            } catch(e) { console.error('Failed to save new entry:', e); }
          }
        }
      }
      } // end else (items checked)

      alert('Successfully saved ' + savedCount + ' PPMP entr' + (savedCount > 1 ? 'ies' : 'y') + '!');
      closeModal();
      loadPPMP();
    } catch (err) {
      alert('Failed to update PPMP: ' + err.message);
    }
  };

  // Edit Supplier Modal
  window.showEditSupplierModal = async function(supplierId) {
    let s = {};
    try { s = await apiRequest('/suppliers/' + supplierId); } catch (err) { alert('Could not load supplier'); return; }
    const html = `
      <form id="editSupplierForm" onsubmit="saveEditSupplier(event, ${supplierId})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit Supplier #${supplierId}</strong></div>
        <div class="form-group">
          <label>Company Name <span class="text-danger">*</span></label>
          <input type="text" id="editSupName" value="${(s.name || '').replace(/"/g, '&quot;')}" required>
        </div>
        <div class="form-group">
          <label>Address</label>
          <input type="text" id="editSupAddress" value="${(s.address || '').replace(/"/g, '&quot;')}">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Contact Number</label>
            <input type="text" id="editSupPhone" value="${s.phone || ''}">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="editSupEmail" value="${s.email || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>TIN</label>
            <input type="text" id="editSupTIN" value="${s.tin || ''}">
          </div>
          <div class="form-group">
            <label>Contact Person</label>
            <input type="text" id="editSupContact" value="${(s.contact_person || '').replace(/"/g, '&quot;')}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Organization Type</label>
            <select class="form-select" id="editSupOrgType">
              <option value="">-- Select --</option>
              <option value="sole_proprietorship" ${s.org_type==='sole_proprietorship'?'selected':''}>Sole Proprietorship</option>
              <option value="partnership" ${s.org_type==='partnership'?'selected':''}>Partnership</option>
              <option value="corporation" ${s.org_type==='corporation'?'selected':''}>Corporation</option>
              <option value="cooperative" ${s.org_type==='cooperative'?'selected':''}>Cooperative</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select class="form-select" id="editSupActive">
              <option value="true" ${s.is_active !== false?'selected':''}>Active</option>
              <option value="false" ${s.is_active === false?'selected':''}>Inactive</option>
            </select>
          </div>
        </div>
        ${getEditAttachmentSectionHTML('supplier', supplierId, 'editSupAttachment')}
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>
    `;
    openModal('Edit Supplier', html);
  };
  window.saveEditSupplier = async function(e, id) {
    e.preventDefault();
    if (!confirm('Save changes to this supplier?')) return;
    const data = {
      name: document.getElementById('editSupName').value,
      address: document.getElementById('editSupAddress').value,
      phone: document.getElementById('editSupPhone').value,
      email: document.getElementById('editSupEmail').value,
      tin: document.getElementById('editSupTIN').value,
      contact_person: document.getElementById('editSupContact').value,
      org_type: document.getElementById('editSupOrgType').value,
      is_active: document.getElementById('editSupActive').value === 'true'
    };
    try {
      await apiRequest('/suppliers/' + id, 'PUT', data);
      await uploadEditAttachments('supplier', id, 'editSupAttachment');
      showToast('Supplier updated successfully!', 'success');
      closeModal(); loadSuppliers();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // View Item Modal
  window.showViewItemModal = async function(itemId) {
    openModal('Item Details', '<div class="view-details"><p>Loading item...</p></div>');
    try {
      const item = await apiRequest('/items/' + itemId);
      const qty = parseInt(item.quantity) || 0;
      const reorder = parseInt(item.reorder_point) || 0;
      const isService = (item.category || '').toLowerCase() === 'services';
      let stockStatus = 'N/A';
      if (!isService) {
        if (qty === 0) stockStatus = 'Out of Stock';
        else if (qty <= reorder) stockStatus = 'Low Stock';
        else stockStatus = 'In Stock';
      }
      const content = `
        <div class="view-details">
          <div class="info-banner"><i class="fas fa-box"></i> <strong>Item: ${item.name || 'N/A'}</strong></div>
          <div class="detail-grid">
            <div class="detail-item"><span class="label">Item Code</span><span class="value">${item.code || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Stock No.</span><span class="value">${item.stock_no || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Item Name</span><span class="value">${item.name || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Description</span><span class="value">${item.description || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Category</span><span class="value">${item.category || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Unit</span><span class="value">${item.unit || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Unit Price</span><span class="value">₱${parseFloat(item.unit_price || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</span></div>
            <div class="detail-item"><span class="label">Quantity</span><span class="value">${isService ? 'N/A' : qty}</span></div>
            <div class="detail-item"><span class="label">Reorder Point</span><span class="value">${isService ? 'N/A' : reorder}</span></div>
            <div class="detail-item"><span class="label">Stock Status</span><span class="value">${stockStatus}</span></div>
            <div class="detail-item"><span class="label">UACS Code</span><span class="value">${item.uacs_code || 'N/A'}</span></div>
            <div class="detail-item"><span class="label">Supplier</span><span class="value">${item.supplier_name || 'N/A'}</span></div>
          </div>
        </div>`;
      openModal('Item Details', content);
    } catch (err) {
      openModal('Error', '<div class="view-details"><p>Error loading item: ' + err.message + '</p></div>');
    }
  };

  // Edit Item Modal
  window.showEditItemModal = async function(itemId) {
    let item = {};
    try { item = await apiRequest('/items/' + itemId); } catch (err) { alert('Could not load item'); return; }
    // Ensure UOMs are loaded
    if (!cachedUOMs.length) {
      try { cachedUOMs = await apiRequest('/uoms'); } catch(e) {}
    }
    const html = `
      <form id="editItemForm" onsubmit="saveEditItem(event, ${itemId})">
        <div class="info-banner" style="margin-bottom:15px;"><i class="fas fa-edit"></i> <strong>Edit Item #${itemId}</strong></div>
        <div class="form-row">
          <div class="form-group">
            <label>Item Code</label>
            <input type="text" id="editItemCode" value="${item.code || ''}" required>
          </div>
          <div class="form-group">
            <label>Stock No.</label>
            <input type="text" id="editItemStockNo" value="${item.stock_no || ''}">
          </div>
        </div>
        <div class="form-group">
          <label>Item Name <span class="text-danger">*</span></label>
          <input type="text" id="editItemName" value="${(item.name || '').replace(/"/g, '&quot;')}" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <input type="text" id="editItemDesc" value="${(item.description || '').replace(/"/g, '&quot;')}">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Unit of Measure</label>
            <select class="form-select" id="editItemUnit" required>
              ${buildUOMOptions(item.unit)}
            </select>
          </div>
          <div class="form-group">
            <label>Unit Price</label>
            <input type="number" step="0.01" id="editItemPrice" value="${item.unit_price || 0}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Category</label>
            <select class="form-select" id="editItemCategory">
              ${buildCategoryOptions(item.category)}
            </select>
          </div>
          <div class="form-group">
            <label>UACS Code</label>
            <input type="text" id="editItemUACS" value="${item.uacs_code || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Quantity</label>
            <input type="number" id="editItemQty" value="${item.quantity || 0}">
          </div>
          <div class="form-group">
            <label>Reorder Point</label>
            <input type="number" id="editItemReorder" value="${item.reorder_point || 0}">
          </div>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select class="form-select" id="editItemActive">
            <option value="true" ${item.is_active !== false?'selected':''}>Active</option>
            <option value="false" ${item.is_active === false?'selected':''}>Inactive</option>
          </select>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>
    `;
    openModal('Edit Item', html);
  };
  window.saveEditItem = async function(e, id) {
    e.preventDefault();
    if (!confirm('Save changes to this item?')) return;
    const data = {
      code: document.getElementById('editItemCode').value,
      stock_no: document.getElementById('editItemStockNo').value,
      name: document.getElementById('editItemName').value,
      description: document.getElementById('editItemDesc').value,
      unit: document.getElementById('editItemUnit').value,
      unit_price: parseFloat(document.getElementById('editItemPrice').value) || 0,
      category: document.getElementById('editItemCategory').value,
      uacs_code: document.getElementById('editItemUACS').value,
      quantity: parseInt(document.getElementById('editItemQty').value) || 0,
      reorder_point: parseInt(document.getElementById('editItemReorder').value) || 0,
      is_active: document.getElementById('editItemActive').value === 'true'
    };
    try {
      await apiRequest('/items/' + id, 'PUT', data);
      showToast('Item updated successfully!', 'success');
      closeModal(); loadItems();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // Edit User Modal
  window.showEditUserModal = async function(userId) {
    // Fetch user data and employees in parallel
    let user = {}, employees = [];
    try {
      [user, employees] = await Promise.all([
        apiRequest(`/users/${userId}`),
        apiRequest('/employees').catch(() => [])
      ]);
    } catch (err) {
      console.warn('Could not fetch user, using defaults:', err);
      user = { id: userId, username: '', full_name: '', email: '', role: 'end_user', dept_id: 1, is_active: true, employee_id: null };
    }

    const allRoles = [
      { value: 'end_user', label: 'End User' },
      { value: 'division_head', label: 'Division Head' },
      { value: 'bac_secretariat', label: 'BAC Secretariat' },
      { value: 'bac_chair', label: 'BAC Chairperson' },
      { value: 'twg_member', label: 'TWG Member' },
      { value: 'supply_officer', label: 'Supply/Procurement Officer' },
      { value: 'inspector', label: 'Inspection/Property Custodian' },
      { value: 'hope', label: 'HoPE (Regional Director)' },
      { value: 'ord_manager', label: 'ORD Manager' },
      { value: 'chief_fad', label: 'Chief FAD' },
      { value: 'chief_wrsd', label: 'Chief WRSD' },
      { value: 'chief_mwpsd', label: 'Chief MWPSD' },
      { value: 'chief_mwptd', label: 'Chief MWPTD' },
      { value: 'manager', label: 'Manager' },
      { value: 'officer', label: 'Officer' },
      { value: 'viewer', label: 'Viewer' },
      { value: 'auditor', label: 'Auditor' },
      { value: 'admin', label: 'System Administrator' }
    ];
    const roleOptions = allRoles.map(r => `<option value="${r.value}" ${user.role === r.value ? 'selected' : ''}>${r.label}</option>`).join('');
    const empOptions = employees.map(e => `<option value="${e.id}" ${user.employee_id == e.id ? 'selected' : ''}>${e.full_name} (${e.employee_code || 'N/A'})</option>`).join('');

    const html = `
      <form id="editUserForm" onsubmit="saveEditUser(event, ${userId})">
        <div class="form-section-header purple"><i class="fas fa-user-shield"></i> Account Information</div>
        <div class="form-row">
          <div class="form-group">
            <label>User ID</label>
            <input type="text" value="USR-${String(userId).padStart(3, '0')}" readonly style="background: #f5f5f5;">
          </div>
          <div class="form-group">
            <label>Username <span class="text-danger">*</span></label>
            <input type="text" id="editUsername" value="${user.username || ''}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Full Name <span class="text-danger">*</span></label>
            <input type="text" id="editFullName" value="${(user.full_name || '').replace(/"/g, '&quot;')}" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="editEmail" value="${user.email || ''}">
          </div>
        </div>
        <div class="form-section-header blue"><i class="fas fa-building"></i> Role & Division</div>
        <div class="form-row">
          <div class="form-group">
            <label>Role <span class="text-danger">*</span></label>
            <select class="form-select" id="editRole" required>
              ${roleOptions}
            </select>
          </div>
          <div class="form-group">
            <label>Division</label>
            <select class="form-select" id="editDivision">
              <option value="" ${!user.dept_id ? 'selected' : ''}>None</option>
              <option value="1" ${user.dept_id == 1 ? 'selected' : ''}>FAD - Finance & Administrative</option>
              <option value="2" ${user.dept_id == 2 ? 'selected' : ''}>WRSD - Welfare Reintegration Services</option>
              <option value="3" ${user.dept_id == 3 ? 'selected' : ''}>MWPSD - Migrant Workers Protection Services</option>
              <option value="4" ${user.dept_id == 4 ? 'selected' : ''}>MWPTD - Migrant Workers Protection Training</option>
              <option value="5" ${user.dept_id == 5 ? 'selected' : ''}>ORD - Office of Regional Director</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Status</label>
            <select class="form-select" id="editIsActive">
              ${buildDivisionOptionsById(user.dept_id || '', false, 'long')}
            <label>Linked Employee</label>
            <select class="form-select" id="editEmployeeId">
              <option value="">-- No linked employee --</option>
              ${empOptions}
            </select>
          </div>
        </div>
        <div class="form-section-header orange"><i class="fas fa-key"></i> Reset Password</div>
        <div class="form-group">
          <label>New Password</label>
          <input type="password" id="editNewPassword" placeholder="Leave blank to keep current password" minlength="6">
          <small style="color:#666;margin-top:4px;display:block;">Only fill this if you want to change the user's password.</small>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>
    `;
    openModal('Edit User — ' + (user.full_name || user.username), html);
  };

  // Save edited user via API
  window.saveEditUser = async function(e, userId) {
    e.preventDefault();
    if (!confirm('Are you sure you want to save these user changes?')) return;
    const data = {
      username: document.getElementById('editUsername').value.trim(),
      full_name: document.getElementById('editFullName').value.trim(),
      email: document.getElementById('editEmail')?.value || '',
      role: document.getElementById('editRole').value,
      dept_id: parseInt(document.getElementById('editDivision').value) || null,
      is_active: document.getElementById('editIsActive').value === 'true',
      employee_id: parseInt(document.getElementById('editEmployeeId')?.value) || null
    };

    // Include password only if provided
    const newPassword = document.getElementById('editNewPassword')?.value;
    if (newPassword) {
      if (newPassword.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
      }
      data.password = newPassword;
    }

    try {
      await apiRequest(`/users/${userId}`, 'PUT', data);
      showToast('User updated successfully!', 'success');
      closeModal();
      loadUsers();
    } catch (err) {
      alert('Error updating user: ' + err.message);
    }
  };

  // =====================================================
  // USER MANAGEMENT - Admin Actions
  // =====================================================

  // Promote/Change Role Modal
  window.showPromoteUserModal = function(userId, username, currentRole, fullName) {
    const allRoles = [
      { value: 'end_user', label: 'End User', icon: 'fa-user', color: '#6b7280' },
      { value: 'division_head', label: 'Division Head', icon: 'fa-user-tie', color: '#d97706' },
      { value: 'bac_secretariat', label: 'BAC Secretariat', icon: 'fa-file-alt', color: '#0891b2' },
      { value: 'bac_chair', label: 'BAC Chairperson', icon: 'fa-gavel', color: '#0891b2' },
      { value: 'twg_member', label: 'TWG Member', icon: 'fa-users', color: '#059669' },
      { value: 'supply_officer', label: 'Supply/Procurement Officer', icon: 'fa-boxes', color: '#2563eb' },
      { value: 'inspector', label: 'Inspection/Property Custodian', icon: 'fa-search', color: '#be185d' },
      { value: 'hope', label: 'HoPE (Regional Director)', icon: 'fa-star', color: '#7c3aed' },
      { value: 'ord_manager', label: 'ORD Manager', icon: 'fa-user-cog', color: '#dc2626' },
      { value: 'chief_fad', label: 'Chief FAD', icon: 'fa-building', color: '#d97706' },
      { value: 'chief_wrsd', label: 'Chief WRSD', icon: 'fa-building', color: '#d97706' },
      { value: 'chief_mwpsd', label: 'Chief MWPSD', icon: 'fa-building', color: '#d97706' },
      { value: 'chief_mwptd', label: 'Chief MWPTD', icon: 'fa-building', color: '#d97706' },
      { value: 'manager', label: 'Manager', icon: 'fa-briefcase', color: '#7c3aed' },
      { value: 'officer', label: 'Officer', icon: 'fa-id-badge', color: '#2563eb' },
      { value: 'viewer', label: 'Viewer', icon: 'fa-eye', color: '#6b7280' },
      { value: 'auditor', label: 'Auditor', icon: 'fa-clipboard-check', color: '#059669' },
      { value: 'admin', label: 'System Administrator', icon: 'fa-crown', color: '#dc2626' }
    ];

    const roleCards = allRoles.map(r => `
      <div class="role-card ${r.value === currentRole ? 'active-role' : ''}" 
           onclick="selectPromoteRole(this, '${r.value}')" 
           style="display:flex;align-items:center;padding:10px 14px;margin:4px 0;border-radius:8px;cursor:pointer;border:2px solid ${r.value === currentRole ? r.color : '#e5e7eb'};background:${r.value === currentRole ? r.color + '10' : '#fff'};transition:all 0.2s;">
        <i class="fas ${r.icon}" style="color:${r.color};width:24px;font-size:14px;"></i>
        <span style="flex:1;font-size:13px;font-weight:${r.value === currentRole ? '700' : '500'};">${r.label}</span>
        ${r.value === currentRole ? '<span style="font-size:10px;color:' + r.color + ';font-weight:700;">CURRENT</span>' : ''}
      </div>
    `).join('');

    const html = `
      <div style="margin-bottom:15px;">
        <div style="background:#f8fafc;border-radius:10px;padding:15px;margin-bottom:15px;border:1px solid #e2e8f0;">
          <div style="font-size:16px;font-weight:700;color:#1a365d;">${fullName || username}</div>
          <div style="font-size:12px;color:#64748b;margin-top:4px;">Username: ${username} &bull; Current Role: ${formatRole(currentRole)}</div>
        </div>
        <label style="font-weight:600;font-size:13px;color:#374151;margin-bottom:8px;display:block;">Select New Role:</label>
        <div id="roleCardsList" style="max-height:340px;overflow-y:auto;padding-right:5px;">
          ${roleCards}
        </div>
        <input type="hidden" id="selectedPromoteRole" value="${currentRole}">
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:15px;">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="confirmPromoteUser(${userId}, '${username}')"><i class="fas fa-user-shield"></i> Change Role</button>
      </div>
    `;
    openModal('Change User Role', html);
  };

  window.selectPromoteRole = function(el, role) {
    document.querySelectorAll('#roleCardsList .role-card').forEach(c => {
      c.style.borderColor = '#e5e7eb';
      c.style.background = '#fff';
    });
    el.style.borderColor = '#2563eb';
    el.style.background = '#eff6ff';
    document.getElementById('selectedPromoteRole').value = role;
  };

  window.confirmPromoteUser = async function(userId, username) {
    const newRole = document.getElementById('selectedPromoteRole').value;
    if (!confirm(`Change role of "${username}" to ${formatRole(newRole)}?`)) return;
    try {
      await apiRequest(`/users/${userId}/role`, 'PATCH', { role: newRole });
      showToast(`Role changed to ${formatRole(newRole)}!`, 'success');
      closeModal();
      loadUsers();
    } catch (err) {
      alert('Error changing role: ' + err.message);
    }
  };

  // Deactivate User
  window.deactivateUser = async function(userId, username) {
    if (!confirm(`Deactivate user "${username}"?\n\nThe user will no longer be able to log in but their data will be preserved.`)) return;
    try {
      await apiRequest(`/users/${userId}`, 'DELETE');
      showToast(`User "${username}" deactivated.`, 'success');
      loadUsers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Activate User
  window.activateUser = async function(userId, username) {
    if (!confirm(`Reactivate user "${username}"?\n\nThe user will be able to log in again.`)) return;
    try {
      await apiRequest(`/users/${userId}/activate`, 'PATCH');
      showToast(`User "${username}" reactivated.`, 'success');
      loadUsers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Permanent Delete User
  window.permanentDeleteUser = async function(userId, username) {
    if (username === 'admin') {
      alert('Cannot delete the primary admin account.');
      return;
    }
    if (!confirm(`⚠️ PERMANENTLY DELETE user "${username}"?\n\nThis action CANNOT be undone. All user data will be lost.\n\nUse "Deactivate" instead if you want to preserve data.`)) return;
    if (!confirm(`FINAL CONFIRMATION: Type the username to confirm.\n\nAre you absolutely sure you want to permanently delete "${username}"?`)) return;
    try {
      await apiRequest(`/users/${userId}?permanent=true`, 'DELETE');
      showToast(`User "${username}" permanently deleted.`, 'success');
      loadUsers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Filter Users Table
  window.filterUsersTable = function() {
    const search = (document.getElementById('userSearchInput')?.value || '').toLowerCase();
    const roleFilter = document.getElementById('userRoleFilter')?.value || '';
    const statusFilter = document.getElementById('userStatusFilter')?.value || '';
    
    const allUsers = window._allUsers || [];
    const filtered = allUsers.filter(u => {
      const matchSearch = !search || 
        (u.username || '').toLowerCase().includes(search) ||
        (u.full_name || '').toLowerCase().includes(search) ||
        (u.email || '').toLowerCase().includes(search) ||
        (u.department_code || '').toLowerCase().includes(search);
      const matchRole = !roleFilter || u.role === roleFilter;
      const matchStatus = !statusFilter || 
        (statusFilter === 'active' && u.is_active !== false) ||
        (statusFilter === 'inactive' && u.is_active === false);
      return matchSearch && matchRole && matchStatus;
    });
    renderUsersTable(filtered);
    // Restore the full list for next filter
    window._allUsers = allUsers;
  };

  // =====================================================
  // ACTION MODALS - Workflow actions
  // =====================================================

  // Submit PPMP to APP Modal
  window.showSubmitToAPPModal = function(ppmpNo) {
    // Dynamically look up PPMP data
    const ppmpList = window._ppmpData || [];
    const ppmp = ppmpList.find(p => p.ppmp_number === ppmpNo || p.code === ppmpNo || String(p.id) === String(ppmpNo));
    const pNo = ppmp ? (ppmp.ppmp_number || ppmp.code || ppmpNo) : (ppmpNo || '-');
    const pDesc = ppmp ? (ppmp.description || ppmp.item_description || '-') : '-';
    const pABC = ppmp ? '₱' + Number(ppmp.estimated_budget || ppmp.total_amount || 0).toLocaleString('en-PH', {minimumFractionDigits:2}) : '-';
    const html = `
      <form id="submitToAPPForm">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-paper-plane"></i>
          Submit this PPMP item to be included in the APP.
        </div>
        <div class="view-details">
          <div class="detail-row"><label>PPMP No.:</label><span>${pNo}</span></div>
          <div class="detail-row"><label>Project:</label><span>${pDesc}</span></div>
          <div class="detail-row"><label>ABC:</label><span>${pABC}</span></div>
        </div>
        <div class="form-group" style="margin-top: 15px;">
          <label>Remarks (Optional)</label>
          <textarea rows="2" placeholder="Any notes for BAC Secretariat"></textarea>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-success"><i class="fas fa-paper-plane"></i> Submit to APP</button>
        </div>
      </form>
    `;
    openModal('Submit to APP', html);
  };

  // Create PR from APP Modal
  window.showCreatePRFromAPPModal = function(itemId) {
    const items = window._appItems || [];
    const item = items.find(i => i.id === itemId);
    if (!item) { alert('APP item not found'); return; }

    const unitPrice = parseFloat(item.unit_price || 0);
    const totalQty = parseInt(item.total_qty || 0);
    const totalPrice = parseFloat(item.total_price || (unitPrice * totalQty));

    const html = `
      <form id="createPRFromAPPForm">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-file-signature"></i>
          Create a new Purchase Request based on this APP item.
        </div>
        <div class="view-details">
          <div class="detail-row"><label>Item Code:</label><span>${item.item_code || '-'}</span></div>
          <div class="detail-row"><label>Item Name:</label><span>${item.item_name || '-'}</span></div>
          <div class="detail-row"><label>Unit Price:</label><span>₱${unitPrice.toLocaleString('en-PH', {minimumFractionDigits: 2})}</span></div>
          <div class="detail-row"><label>Total Qty:</label><span>${totalQty} ${item.unit || ''}</span></div>
          <div class="detail-row"><label>Total ABC:</label><span>₱${totalPrice.toLocaleString('en-PH', {minimumFractionDigits: 2})}</span></div>
        </div>
        <div class="form-group" style="margin-top: 15px;">
          <label>PR Amount <span class="text-danger">*</span></label>
          <input type="number" step="0.01" value="${unitPrice.toFixed(2)}" required placeholder="Amount for this PR">
        </div>
        <div class="form-group">
          <label>Specific Purpose <span class="text-danger">*</span></label>
          <input type="text" value="${item.item_name || ''}" required placeholder="e.g., Security Services - Q1">
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-plus"></i> Create PR</button>
        </div>
      </form>
    `;
    openModal('Create PR from APP', html);
  };

  // Approve PR Modal
  window.showApprovePRModal = async function(prIdOrNo) {
    // Fetch actual PR data dynamically
    let pr = null;
    if (typeof prIdOrNo === 'number') {
      pr = (cachedPR || []).find(p => p.id === prIdOrNo);
      if (!pr) { try { pr = await apiRequest('/purchase-requests/' + prIdOrNo); } catch(e) {} }
    } else {
      pr = (cachedPR || []).find(p => p.pr_number === prIdOrNo);
    }
    if (!pr) { alert('PR not found'); return; }
    const html = `
      <form id="approvePRForm">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-check-circle"></i>
          Approve this Purchase Request as HoPE (Head of Procuring Entity).
        </div>
        <div class="view-details">
          <div class="detail-row"><label>PR No.:</label><span>${pr.pr_number || ''}</span></div>
          <div class="detail-row"><label>Project:</label><span>${pr.purpose || pr.first_item_name || 'N/A'}</span></div>
          <div class="detail-row"><label>Amount:</label><span>₱${parseFloat(pr.total_amount || 0).toLocaleString('en-PH', {minimumFractionDigits:2})}</span></div>
          <div class="detail-row"><label>Requested By:</label><span>${pr.requested_by_name || ''} (${pr.department_name || pr.department_code || ''})</span></div>
        </div>
        <div class="form-group" style="margin-top: 15px;">
          <label>Approval Remarks (Optional)</label>
          <textarea rows="2" placeholder="Any notes for record"></textarea>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-success"><i class="fas fa-check"></i> Approve PR</button>
        </div>
      </form>
    `;
    openModal('Approve Purchase Request', html);
  };

  // Return PR Modal
  window.showReturnPRModal = async function(prIdOrNo) {
    let pr = null;
    if (typeof prIdOrNo === 'number') {
      pr = (cachedPR || []).find(p => p.id === prIdOrNo);
      if (!pr) { try { pr = await apiRequest('/purchase-requests/' + prIdOrNo); } catch(e) {} }
    } else {
      pr = (cachedPR || []).find(p => p.pr_number === prIdOrNo);
    }
    if (!pr) { alert('PR not found'); return; }
    const html = `
      <form id="returnPRForm">
        <div class="info-banner warning-banner" style="margin-bottom: 15px;">
          <i class="fas fa-undo"></i>
          Return this PR to the requesting division for revision.
        </div>
        <div class="view-details">
          <div class="detail-row"><label>PR No.:</label><span>${pr.pr_number || ''}</span></div>
          <div class="detail-row"><label>Project:</label><span>${pr.purpose || pr.first_item_name || 'N/A'}</span></div>
          <div class="detail-row"><label>Requested By:</label><span>${pr.requested_by_name || ''} (${pr.department_name || pr.department_code || ''})</span></div>
        </div>
        <div class="form-group" style="margin-top: 15px;">
          <label>Reason for Return <span class="text-danger">*</span></label>
          <textarea rows="3" required placeholder="Specify the reason for returning this PR (e.g., incomplete attachments, wrong amount, etc.)"></textarea>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-warning"><i class="fas fa-undo"></i> Return PR</button>
        </div>
      </form>
    `;
    openModal('Return Purchase Request', html);
  };

  // Attach Annex 1 Modal
  window.showAttachAnnex1Modal = function(prNo) {
    const pr = (cachedPR || []).find(p => p.pr_number === prNo || p.id === prNo) || {};
    const html = `
      <form id="attachAnnex1Form" onsubmit="handleAttachAnnex1(event)">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-paperclip"></i>
          Attach Route Slip (Annex 1) and other required documents.
        </div>
        <div class="view-details">
          <div class="detail-row"><label>PR No.:</label><span>${pr.pr_number || prNo || ''}</span></div>
          <div class="detail-row"><label>Project:</label><span>${pr.purpose || pr.first_item_name || 'N/A'}</span></div>
        </div>
        <div class="form-group" style="margin-top: 15px;">
          <label>Route Slip (Annex 1) <span class="text-danger">*</span></label>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="file" id="annex1File" accept=".pdf" style="display: none;" onchange="updateFileLabel(this, 'annex1Label')" required>
            <button type="button" class="btn btn-sm btn-secondary" onclick="document.getElementById('annex1File').click()"><i class="fas fa-upload"></i> Upload</button>
            <span id="annex1Label" style="font-size: 12px; color: #666;">No file selected</span>
          </div>
        </div>
        <div class="form-group">
          <label>Technical Specs/SOW/TOR</label>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="file" id="techSpecsFile" accept=".pdf,.doc,.docx" style="display: none;" onchange="updateFileLabel(this, 'techSpecsLabel')">
            <button type="button" class="btn btn-sm btn-secondary" onclick="document.getElementById('techSpecsFile').click()"><i class="fas fa-upload"></i> Upload</button>
            <span id="techSpecsLabel" style="font-size: 12px; color: #666;">Optional</span>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-paperclip"></i> Attach Documents</button>
        </div>
      </form>
    `;
    openModal('Attach Annex 1 & Documents', html);
  };

  // Submit PR for Approval Modal
  window.showSubmitPRForApprovalModal = function(prNo) {
    const pr = (cachedPR || []).find(p => p.pr_number === prNo || p.id === prNo) || {};
    const html = `
      <form id="submitPRForApprovalForm">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-paper-plane"></i>
          Submit this PR for HoPE approval.
        </div>
        <div class="view-details">
          <div class="detail-row"><label>PR No.:</label><span>${pr.pr_number || prNo || ''}</span></div>
          <div class="detail-row"><label>Project:</label><span>${pr.purpose || pr.first_item_name || 'N/A'}</span></div>
          <div class="detail-row"><label>Amount:</label><span>₱${parseFloat(pr.total_amount || 0).toLocaleString('en-PH', {minimumFractionDigits:2})}</span></div>
          <div class="detail-row"><label>Annex 1:</label><span><i class="fas fa-check-circle text-success"></i> Attached</span></div>
        </div>
        <div class="form-group" style="margin-top: 15px;">
          <label>Submission Notes (Optional)</label>
          <textarea rows="2" placeholder="Any notes for approver"></textarea>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-success"><i class="fas fa-paper-plane"></i> Submit for Approval</button>
        </div>
      </form>
    `;
    openModal('Submit PR for Approval', html);
  };

  // Create RFQ from PR Modal
  window.showCreateRFQFromPRModal = async function(prNo) {
    // Fetch actual PR data
    let pr = (cachedPR || []).find(p => p.pr_number === prNo || p.id === prNo);
    if (!pr && typeof prNo === 'number') { try { pr = await apiRequest('/purchase-requests/' + prNo); } catch(e) {} }
    if (!pr) { alert('PR not found'); return; }
    const amt = parseFloat(pr.total_amount || 0);
    const philgepsNote = amt >= 200000 
      ? '<span style="color:#d32f2f;"><i class="fas fa-exclamation-triangle"></i> ABC ≥ ₱200,000 - PhilGEPS posting REQUIRED (3 calendar days)</span>'
      : '<i class="fas fa-info-circle"></i> ABC < ₱200,000 - PhilGEPS posting not required';
    const html = `
      <form id="createRFQFromPRForm">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-paper-plane"></i>
          Issue Request for Quotation based on this PR.
        </div>
        <div class="view-details">
          <div class="detail-row"><label>PR No.:</label><span>${pr.pr_number || ''}</span></div>
          <div class="detail-row"><label>Project:</label><span>${pr.purpose || pr.first_item_name || 'N/A'}</span></div>
          <div class="detail-row"><label>Amount:</label><span>₱${amt.toLocaleString('en-PH', {minimumFractionDigits:2})}</span></div>
          <div class="detail-row"><label>Division:</label><span>${pr.department_name || pr.department_code || 'N/A'}</span></div>
        </div>
        <div class="form-row" style="margin-top: 15px;">
          <div class="form-group">
            <label>RFQ Deadline <span class="text-danger">*</span></label>
            <input type="date" required>
          </div>
          <div class="form-group">
            <label>No. of Suppliers to Invite</label>
            <input type="number" value="3" min="3">
          </div>
        </div>
        <div class="form-group">
          <label>PhilGEPS Posting</label>
          <div style="font-size: 13px; color: #666;">
            ${philgepsNote}
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Issue RFQ</button>
        </div>
      </form>
    `;
    openModal('Create RFQ from PR', html);
  };

  // Add Quotation Modal
  window.showAddQuotationModal = async function(rfqNo) {
    // Load suppliers from DB
    let suppliers = [];
    try { suppliers = await apiRequest('/suppliers'); } catch(e) {}
    const supplierOpts = suppliers.map(s => `<option value="${s.id}">${s.company_name || s.name}</option>`).join('');
    const html = `
      <form id="addQuotationForm" onsubmit="handleAddQuotation(event)">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-plus"></i>
          Add a quotation received for this RFQ.
        </div>
        <div class="view-details">
          <div class="detail-row"><label>RFQ No.:</label><span>${rfqNo || ''}</span></div>
        </div>
        <div class="form-group" style="margin-top: 15px;">
          <label>Supplier <span class="text-danger">*</span></label>
          <select class="form-select" required>
            <option value="">Select Supplier</option>
            ${supplierOpts}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Quoted Amount <span class="text-danger">*</span></label>
            <input type="text" placeholder="₱0.00" required>
          </div>
          <div class="form-group">
            <label>Date Received <span class="text-danger">*</span></label>
            <input type="date" required>
          </div>
        </div>
        <div class="form-group">
          <label>Upload Quotation</label>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="file" id="quotationFile" accept=".pdf" style="display: none;" onchange="updateFileLabel(this, 'quotationLabel')">
            <button type="button" class="btn btn-sm btn-secondary" onclick="document.getElementById('quotationFile').click()"><i class="fas fa-upload"></i> Upload</button>
            <span id="quotationLabel" style="font-size: 12px; color: #666;">PDF file</span>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-plus"></i> Add Quotation</button>
        </div>
      </form>
    `;
    openModal('Add Quotation', html);
  };

  // Create Abstract from RFQ Modal
  window.showCreateAbstractFromRFQModal = async function(rfqNo) {
    // Load actual RFQ data with its quotations
    let rfq = {}, quotations = [];
    try { 
      rfq = await apiRequest('/rfq/' + rfqNo).catch(() => ({}));
      quotations = rfq.quotations || [];
    } catch(e) {}
    const quotationRows = quotations.length
      ? quotations.map(q => `<tr><td>${q.supplier_name || 'Unknown'}</td><td>₱${(q.amount || 0).toLocaleString('en-PH', {minimumFractionDigits:2})}</td><td><input type="checkbox" ${q.compliant !== false ? 'checked' : ''}></td></tr>`).join('')
      : '<tr><td colspan="3" style="text-align:center;color:#999;">No quotations found for this RFQ</td></tr>';
    const html = `
      <form id="createAbstractFromRFQForm">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-table"></i>
          Create Abstract of Quotations from this RFQ.
        </div>
        <div class="view-details">
          <div class="detail-row"><label>RFQ No.:</label><span>${rfqNo || ''}</span></div>
          <div class="detail-row"><label>Project:</label><span>${rfq.project_name || rfq.description || 'N/A'}</span></div>
          <div class="detail-row"><label>Quotations:</label><span>${quotations.length}</span></div>
        </div>
        <h4 style="margin-top: 15px;">Quotations Summary</h4>
        <table class="data-table" style="font-size: 12px; margin-top: 8px;">
          <thead><tr><th>Supplier</th><th>Amount</th><th>Compliant</th></tr></thead>
          <tbody>${quotationRows}</tbody>
        </table>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-table"></i> Create Abstract</button>
        </div>
      </form>
    `;
    openModal('Create Abstract from RFQ', html);
  };

  // Mark NOA Received Modal
  window.showMarkNOAReceivedModal = async function(noaNo) {
    let noa = {};
    try { noa = await apiRequest('/noa/' + noaNo).catch(() => ({})); } catch(e) {}
    const html = `
      <form id="markNOAReceivedForm" onsubmit="handleMarkNOAReceived(event)">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-check"></i>
          Record receipt of NOA by the winning bidder.
        </div>
        <div class="view-details">
          <div class="detail-row"><label>NOA No.:</label><span>${noaNo || ''}</span></div>
          <div class="detail-row"><label>Winning Bidder:</label><span>${noa.supplier_name || noa.winning_bidder || 'N/A'}</span></div>
        </div>
        <div class="form-group" style="margin-top: 15px;">
          <label>Date Received by Bidder <span class="text-danger">*</span></label>
          <input type="date" required>
        </div>
        <div class="form-group">
          <label>Upload Signed Receipt (Optional)</label>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="file" id="noaReceiptFile" accept=".pdf,.jpg,.png" style="display: none;" onchange="updateFileLabel(this, 'noaReceiptLabel')">
            <button type="button" class="btn btn-sm btn-secondary" onclick="document.getElementById('noaReceiptFile').click()"><i class="fas fa-upload"></i> Upload</button>
            <span id="noaReceiptLabel" style="font-size: 12px; color: #666;">Scanned signed receipt</span>
          </div>
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-success"><i class="fas fa-check"></i> Mark Received</button>
        </div>
      </form>
    `;
    openModal('Mark NOA Received', html);
  };

  // Submit to COA Modal
  window.showSubmitToCOAModal = async function(packetId) {
    // Fetch actual packet data
    let packet = {};
    try { 
      const packets = window._poPacketData || [];
      packet = packets.find(p => p.id === packetId || p.packet_number === packetId) || {};
    } catch(e) {}
    const html = `
      <form id="submitToCOAForm">
        <div class="info-banner" style="margin-bottom: 15px;">
          <i class="fas fa-file-export"></i>
          Submit this PO Packet to COA.
        </div>
        <div class="view-details">
          <div class="detail-row"><label>Packet ID:</label><span>${packet.packet_number || packetId || ''}</span></div>
          <div class="detail-row"><label>PO Reference:</label><span>${packet.po_number || 'N/A'}</span></div>
          <div class="detail-row"><label>Amount:</label><span>₱${parseFloat(packet.total_amount || 0).toLocaleString('en-PH', {minimumFractionDigits:2})}</span></div>
          <div class="detail-row"><label>Chief Signed:</label><span>${packet.chief_signed ? '<i class="fas fa-check text-success"></i> Yes' : '<i class="fas fa-times text-danger"></i> No'}</span></div>
          <div class="detail-row"><label>Director Signed:</label><span>${packet.director_signed ? '<i class="fas fa-check text-success"></i> Yes' : '<i class="fas fa-times text-danger"></i> No'}</span></div>
        </div>
        <div class="form-group" style="margin-top: 15px;">
          <label>Submission Date <span class="text-danger">*</span></label>
          <input type="date" required>
        </div>
        <div class="form-group">
          <label>Received By (COA Personnel)</label>
          <input type="text" placeholder="Name of COA receiving officer">
        </div>
        <div class="form-group" style="text-align: right; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-success"><i class="fas fa-file-export"></i> Submit to COA</button>
        </div>
      </form>
    `;
    openModal('Submit to COA', html);
  };

  // Delete Confirmation Modal
  window.showDeleteConfirmModal = function(recordType, recordId) {
    const isPPMP = (recordType === 'PPMP');
    const html = `
      <div class="info-banner warning-banner" style="margin-bottom: 15px;">
        <i class="fas fa-exclamation-triangle"></i>
        Are you sure you want to ${isPPMP ? 'remove' : 'delete'} this ${recordType}?
      </div>
      <div class="view-details">
        <div class="detail-row"><label>${recordType} ID:</label><span>${recordId}</span></div>
      </div>
      ${isPPMP ? `
      <div class="info-banner" style="margin-top:12px; background:#e8f5e9; border-left:4px solid #28a745; padding:10px 14px;">
        <i class="fas fa-info-circle" style="color: #28a745;"></i>
        <strong>Budget will be preserved.</strong> The allocated budget for this item will become <strong>Available Budget</strong> in the APP — it can be reallocated to other projects.
      </div>
      <div class="form-group" style="margin-top: 12px;">
        <label>Reason for Removal <small style="color:#999;">(optional)</small></label>
        <input type="text" id="deleteReasonInput" placeholder="E.g., Project cancelled, scope changed, consolidated with another item">
      </div>
      ` : `<p style="margin-top: 15px; font-size: 13px; color: #666;">This action cannot be undone.</p>`}
      <div class="form-group" style="text-align: right; margin-top: 20px;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-danger" onclick="${isPPMP ? `deletePPMPWithReason('${recordId}')` : `deleteRecord('${recordType}', '${recordId}')`}; closeModal();"><i class="fas fa-trash"></i> ${isPPMP ? 'Remove' : 'Delete'}</button>
      </div>
    `;
    openModal(isPPMP ? 'Remove PPMP Entry' : 'Confirm Delete', html);
  };

  // Export to Excel Modal
  window.showExportToExcelModal = function(docType) {
    const html = `
      <div class="info-banner" style="margin-bottom: 15px;">
        <i class="fas fa-file-excel"></i>
        Export ${docType} with government header and logos.
      </div>
      <div class="form-group">
        <label>Select Format</label>
        <select class="form-select" id="exportFormatSelect">
          <option value="xlsx">Excel (.xls) — with Header &amp; Logos</option>
          <option value="csv">CSV (.csv) — data only</option>
        </select>
      </div>
      <div class="form-group">
        <label>Include</label>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="font-weight: normal;"><input type="checkbox" checked disabled> All visible columns</label>
          <label style="font-weight: normal;"><input type="checkbox" checked disabled> All visible records</label>
        </div>
      </div>
      <div class="form-group" style="text-align: right; margin-top: 20px;">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-success" onclick="exportToExcel('${docType}'); closeModal();"><i class="fas fa-download"></i> Export</button>
      </div>
    `;
    openModal('Export to Excel', html);
  };

  // Get Print Content
  function getPrintContent(docType, recordId, record) {
    const today = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    const r = record || {};
    
    const templates = {
      'PR': `
        <div class="doc-title">PURCHASE REQUEST</div>
        <table class="info-table">
          <tr><td width="30%"><strong>PR Number:</strong></td><td>${r.pr_number || recordId}</td><td width="30%"><strong>Date:</strong></td><td>${r.pr_date ? new Date(r.pr_date).toLocaleDateString('en-PH') : today}</td></tr>
          <tr><td><strong>Division:</strong></td><td>${r.department_code || r.division || 'N/A'}</td><td><strong>Fund Cluster:</strong></td><td>${r.fund_cluster || 'N/A'}</td></tr>
          <tr><td><strong>Purpose:</strong></td><td colspan="3">${r.purpose || 'Procurement of supplies/services for agency operations'}</td></tr>
        </table>
        <table class="items-table">
          <thead><tr><th>Item No.</th><th>Unit</th><th>Item Description</th><th>Quantity</th><th>Unit Cost</th><th>Total Cost</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>lot</td><td>As per attached specifications</td><td>1</td><td>See attached</td><td>See attached</td></tr>
          </tbody>
        </table>
        <div class="signature-box">
          <div class="sig-line"><span>Requested by:</span><div class="sig-space"></div><p>Division Head</p></div>
          <div class="sig-line"><span>Approved by:</span><div class="sig-space"></div><p>Head of Procuring Entity</p></div>
        </div>`,
      'PO': `
        <div class="doc-title">PURCHASE ORDER</div>
        <table class="info-table">
          <tr><td width="30%"><strong>PO Number:</strong></td><td>${r.po_number || recordId}</td><td width="30%"><strong>Date:</strong></td><td>${r.po_date ? new Date(r.po_date).toLocaleDateString('en-PH') : today}</td></tr>
          <tr><td><strong>Supplier:</strong></td><td colspan="3">${r.supplier_name || 'N/A'}</td></tr>
          <tr><td><strong>Address:</strong></td><td colspan="3">${r.supplier_address || r.address || 'N/A'}</td></tr>
          <tr><td><strong>TIN:</strong></td><td>${r.tin || 'N/A'}</td><td><strong>Mode:</strong></td><td>${r.mode_of_procurement || r.procurement_mode || 'N/A'}</td></tr>
        </table>
        <table class="items-table">
          <thead><tr><th>Stock No.</th><th>Unit</th><th>Description</th><th>Quantity</th><th>Unit Cost</th><th>Amount</th></tr></thead>
          <tbody><tr><td colspan="6" style="text-align:center;">See attached specifications</td></tr></tbody>
        </table>
        <p style="margin-top:20px;"><strong>Total Amount:</strong> (In words and figures)</p>
        <p><strong>Delivery Period:</strong> Within 15 calendar days upon receipt of PO</p>
        <div class="signature-box">
          <div class="sig-line"><span>Conforme:</span><div class="sig-space"></div><p>Supplier Representative</p></div>
          <div class="sig-line"><span>Approved:</span><div class="sig-space"></div><p>Head of Procuring Entity</p></div>
        </div>`,
      'Abstract': `
        <div class="doc-title">ABSTRACT OF QUOTATIONS</div>
        <table class="info-table">
          <tr><td width="30%"><strong>Abstract No:</strong></td><td>${recordId}</td><td width="30%"><strong>Date:</strong></td><td>${today}</td></tr>
          <tr><td><strong>PR Reference:</strong></td><td colspan="3">See attached</td></tr>
          <tr><td><strong>Mode of Procurement:</strong></td><td colspan="3">Small Value Procurement (SVP)</td></tr>
        </table>
        <table class="items-table">
          <thead><tr><th>Supplier</th><th>Unit Price</th><th>Total</th><th>Remarks</th></tr></thead>
          <tbody>
            <tr><td colspan="4" style="text-align:center;">See attached quotation details</td></tr>
          </tbody>
        </table>
          </tbody>
        </table>
        <p style="margin-top:20px;"><strong>Award Recommendation:</strong> Award to lowest calculated responsive quotation</p>
        <div class="signature-box">
          <div class="sig-line"><span>Prepared by:</span><div class="sig-space"></div><p>BAC Secretariat</p></div>
          <div class="sig-line"><span>Certified Correct:</span><div class="sig-space"></div><p>BAC Chairman</p></div>
        </div>`,
      'NOA': `
        <div class="doc-title">NOTICE OF AWARD</div>
        <table class="info-table">
          <tr><td width="30%"><strong>NOA Number:</strong></td><td>${recordId}</td><td width="30%"><strong>Date:</strong></td><td>${today}</td></tr>
        </table>
        <p style="margin:20px 0;">This is to inform you that your quotation dated _________ for the procurement of _________ in the amount of ₱_________ has been accepted.</p>
        <p>You are hereby required to submit the following within five (5) calendar days:</p>
        <ul style="margin-left:20px;">
          <li>Valid Mayor's/Business Permit</li>
          <li>PhilGEPS Registration Number</li>
          <li>Income/Business Tax Return</li>
          <li>Omnibus Sworn Statement</li>
        </ul>
        <div class="signature-box">
          <div class="sig-line"><span>Very truly yours,</span><div class="sig-space"></div><p>Head of Procuring Entity</p></div>
          <div class="sig-line"><span>Conforme:</span><div class="sig-space"></div><p>Supplier Representative</p></div>
        </div>`,
      'IAR': `
        <div class="doc-title">INSPECTION AND ACCEPTANCE REPORT</div>
        <div class="doc-subtitle">(Appendix 62 - GAM for NGAs)</div>
        <p style="text-align:center; font-size:9px; color:#888;">Use Print button from IAR table for full data.</p>`,
      'BAC Resolution': `
        <div class="doc-title">BAC RESOLUTION</div>
        <table class="info-table">
          <tr><td width="30%"><strong>Resolution No:</strong></td><td>${recordId}</td><td width="30%"><strong>Date:</strong></td><td>${today}</td></tr>
        </table>
        <p style="margin:20px 0;"><strong>RESOLUTION</strong> recommending the award of contract to the Lowest Calculated Responsive Quotation for the procurement of _________ in the total amount of ₱_________.</p>
        <p><strong>WHEREAS,</strong> the Bids and Awards Committee conducted the procurement process in accordance with RA 9184;</p>
        <p><strong>WHEREAS,</strong> after evaluation, the BAC found the quotation to be compliant;</p>
        <p><strong>NOW THEREFORE,</strong> the BAC recommends the award to the winning supplier.</p>
        <div class="signature-box">
          <div class="sig-line"><span></span><div class="sig-space"></div><p>BAC Chairman</p></div>
          <div class="sig-line"><span></span><div class="sig-space"></div><p>BAC Vice-Chairman</p></div>
        </div>`
    };
    
    return templates[recordType] || `
      <div class="doc-title">${recordType.toUpperCase()}</div>
      <table class="info-table">
        <tr><td width="30%"><strong>Document No:</strong></td><td>${recordId}</td></tr>
        <tr><td><strong>Date:</strong></td><td>${today}</td></tr>
        <tr><td><strong>Status:</strong></td><td>For Print</td></tr>
      </table>`;
  }

  // Print Record Function
  // ==================== NATIVE PRINT PREVIEW SYSTEM ====================
  const { ipcRenderer } = require('electron');

  /**
   * Open a print preview window via Electron IPC
   */
  function openPrintPreview(htmlContent, options = {}) {
    ipcRenderer.invoke('show-print-preview', htmlContent, options).catch(err => {
      console.error('Print preview error:', err);
      showNotification('Failed to open print preview: ' + err.message, 'error');
    });
  }

  /**
   * Sanitize a string for use as a filename
   */
  function toFilename(str) {
    return (str || 'Report').replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_').substring(0, 120);
  }

  /**
   * Read the selected text of a <select> element (not its value).
   * Returns empty string if not found or "All" selected.
   */
  function getFilterText(id) {
    const el = document.getElementById(id);
    if (!el) return '';
    const opt = el.options[el.selectedIndex];
    if (!opt) return '';
    const txt = opt.textContent.trim();
    // treat generic "all" options as empty → will become "All" in filename
    if (/^all\b/i.test(txt) || opt.value === '' || opt.value === 'all') return '';
    return txt;
  }

  /**
   * Build a descriptive filename based on the active page and its filter selections.
   * Example outputs:
   *   PPMP_FAD_Small_Value_Procurement_FY_${getCurrentFiscalYear()}
   *   Purchase_Requests_WRSD_Approved
   *   RFQ_All_Status
   *   Annual_Procurement_Plan_FY_${getCurrentFiscalYear()}
   */
  function getDescriptiveFilename() {
    const page = document.querySelector('.page.active');
    if (!page) return 'Report';
    const pageId = page.id;

    // Map each page id → { label, filters[] }
    // Each filter: { id, allLabel } – allLabel is the fallback when "all" is selected
    const pageMap = {
      'ppmp': {
        label: 'PPMP',
        filters: [
          { id: 'ppmpDivisionFilter', allLabel: 'All_Divisions' },
          { id: 'ppmpModeFilter',     allLabel: '' },
          { id: 'ppmpYearFilter',     allLabel: '' }
        ]
      },
      'app': {
        label: 'Annual_Procurement_Plan',
        filters: [] // APP year select has no id; we grab .form-subtitle text instead
      },
      'purchase-requests': {
        label: 'Purchase_Requests',
        filters: [
          { id: 'prDivisionFilter', allLabel: 'All_Divisions' },
          { id: 'prStatusFilter',   allLabel: '' }
        ]
      },
      'rfq': {
        label: 'Request_for_Quotation',
        filters: [
          { id: 'rfqStatusFilter', allLabel: '' }
        ]
      },
      'abstract': {
        label: 'Abstract_of_Quotation',
        filters: [
          { id: 'abstractStatusFilter', allLabel: '' }
        ]
      },
      'bac-resolution': {
        label: 'BAC_Resolution',
        filters: [
          { id: 'bacResStatusFilter', allLabel: '' }
        ]
      },
      'post-qual': {
        label: 'Post_Qualification',
        filters: [
          { id: 'postQualStatusFilter', allLabel: '' }
        ]
      },
      'noa': {
        label: 'Notice_of_Award',
        filters: [
          { id: 'noaStatusFilter', allLabel: '' }
        ]
      },
      'purchase-orders': {
        label: 'Purchase_Orders',
        filters: [
          { id: 'poStatusFilter', allLabel: '' }
        ]
      },
      'iar': {
        label: 'Inspection_and_Acceptance_Report',
        filters: [
          { id: 'iarStatusFilter', allLabel: '' }
        ]
      },
      'po-packet': {
        label: 'PO_Packet',
        filters: []
      },
      'coa': {
        label: 'Certificate_of_Acceptance',
        filters: []
      },
      'items': {
        label: 'Items_Master_List',
        filters: [
          { id: 'itemCategoryFilter', allLabel: '' },
          { id: 'itemStockFilter',    allLabel: '' }
        ]
      },
      'suppliers': {
        label: 'Suppliers_Master_List',
        filters: []
      },
      'employees': {
        label: 'Employees_List',
        filters: [
          { id: 'employeeStatusFilter', allLabel: '' }
        ]
      },
      'divisions': {
        label: 'Divisions',
        filters: []
      },
      'users': {
        label: 'Users',
        filters: []
      },
      'stock-cards': {
        label: 'Stock_Cards',
        filters: [
          { id: 'stockCardItemFilter', allLabel: '' }
        ]
      },
      'property-cards': {
        label: 'Property_Cards',
        filters: [
          { id: 'propertyStatusFilter', allLabel: '' }
        ]
      },
      'ics': {
        label: 'Inventory_Custodian_Slip',
        filters: []
      },
      'par': {
        label: 'Property_Acknowledgement_Receipt',
        filters: []
      },
      'ptr': {
        label: 'Property_Transfer_Report',
        filters: []
      },
      'ris': {
        label: 'Requisition_and_Issue_Slip',
        filters: [
          { id: 'risStatusFilter', allLabel: '' }
        ]
      },
      'supplies-ledger': {
        label: 'Supplies_Ledger',
        filters: []
      },
      'semi-expendable': {
        label: 'Semi_Expendable',
        filters: []
      },
      'capital-outlay': {
        label: 'Capital_Outlay',
        filters: []
      },
      'trip-tickets': {
        label: 'Trip_Tickets',
        filters: [
          { id: 'tripStatusFilter', allLabel: '' }
        ]
      }
    };

    const cfg = pageMap[pageId];
    if (!cfg) {
      // Fallback: use the page title text
      const title = page.querySelector('.form-title')?.textContent
        || page.querySelector('h2, .page-title')?.textContent
        || 'Report';
      return toFilename(title);
    }

    const parts = [cfg.label];

    // Collect filter texts
    for (const f of cfg.filters) {
      const txt = getFilterText(f.id);
      if (txt) {
        parts.push(txt);
      } else if (f.allLabel) {
        parts.push(f.allLabel);
      }
    }

    // For APP page, try to grab year from the page's own select (has no id)
    if (pageId === 'app') {
      const yearSel = page.querySelector('.filter-group .form-select');
      if (yearSel) {
        const yTxt = yearSel.options[yearSel.selectedIndex]?.textContent.trim();
        if (yTxt) parts.push(yTxt);
      }
    }

    return toFilename(parts.join(' '));
  }

  /**
   * Build a complete print-ready HTML document
   */
  function buildPrintHTML(title, bodyContent) {
    return `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            ${getPrintHeaderCSS()}
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 0; font-size: 10px; line-height: 1.4; color: #222; background: #fff; }
            h3 { margin: 12px 0 8px; font-size: 12px; text-align: center; text-transform: uppercase; border-bottom: 1.5px solid #333; padding-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin: 8px 0; page-break-inside: auto; table-layout: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            th, td { border: 1px solid #333; padding: 3px 4px; text-align: left; font-size: 8px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; vertical-align: top; }
            th { background: #e8e8e8; font-weight: bold; font-size: 7.5px; text-transform: uppercase; text-align: center; }
            td { font-size: 8px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .footer { margin-top: 20px; text-align: center; font-size: 8px; color: #888; border-top: 1px solid #ddd; padding-top: 6px; }
            .doc-title { font-size: 14px; font-weight: bold; margin: 12px 0; text-align: center; text-transform: uppercase; border-bottom: 2px solid #333; padding-bottom: 8px; }
            .doc-subtitle { text-align: center; font-style: italic; margin-bottom: 12px; font-size: 10px; }
            .info-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .info-table td { padding: 4px 8px; border: 1px solid #ddd; font-size: 10px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 12px 0; }
            .items-table th, .items-table td { border: 1px solid #333; padding: 5px; text-align: left; font-size: 9px; }
            .items-table th { background: #f0f0f0; font-weight: bold; }
            .signature-box { margin-top: 30px; display: flex; justify-content: space-between; flex-wrap: wrap; }
            .sig-line { width: 45%; margin-bottom: 25px; }
            .sig-space { border-bottom: 1px solid #333; height: 35px; margin: 15px 0 5px; }
            .sig-line p { text-align: center; font-size: 10px; }
            ul { margin: 8px 0 8px 25px; font-size: 10px; }
            .report-title { font-size: 12px; font-weight: bold; margin: 12px 0 6px; text-align: center; }
            .report-date { text-align: center; margin-bottom: 10px; color: #666; font-size: 9px; }
            .mode-badge, .status-badge { font-size: 7px; padding: 1px 4px; border-radius: 2px; display: inline-block; }
            @page { margin: 8mm; }

            /* === Repeating header on every printed page === */
            .page-wrapper { display: table; width: 100%; }
            .page-header-group { display: table-header-group; }
            .page-header-group > tr > td { border: none; padding: 0 15px; }
            .page-body-group { display: table-row-group; }
            .page-body-group > tr > td { border: none; padding: 0 15px; }
            .page-footer-group { display: table-footer-group; }
            .page-footer-group > tr > td { border: none; padding: 0 15px; }

            /* Reset inner tables so they keep their borders */
            .page-body-group table th,
            .page-body-group table td { border: 1px solid #333; }
          </style>
        </head>
        <body>
          <table class="page-wrapper">
            <thead class="page-header-group">
              <tr><td>${getPrintHeaderHTML()}</td></tr>
            </thead>
            <tfoot class="page-footer-group">
              <tr><td>
                <div class="footer">
                  <p>Generated by DMW Caraga Procurement System | ${new Date().toLocaleString('en-PH')}</p>
                </div>
              </td></tr>
            </tfoot>
            <tbody class="page-body-group">
              <tr><td>${bodyContent}</td></tr>
            </tbody>
          </table>
      </html>`;
  }

  // ==================== PRINT FUNCTIONS ====================

  window.printRecord = function(recordType, recordId) {
    const printContent = getPrintContent(recordType, recordId);
    const title = recordType + ' - ' + recordId;
    const html = buildPrintHTML(title, printContent);
    openPrintPreview(html, { title: toFilename(title), editable: true });
  };

  // Print IAR with full data fetched from API
  window.printIAR = async function(iarId) {
    try {
      showNotification('Loading IAR data for print...', 'info');
      const iar = await apiRequest('/iars/' + iarId);
      if (!iar) { showNotification('IAR not found', 'error'); return; }

      const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '_______________';

      const inspResult = iar.inspection_result || 'to_be_checked';
      const inspLabel = inspResult === 'verified' ? 'Verified OK' : inspResult === 'on_going' ? 'On Going' : 'To Be Checked';
      const accResult = iar.acceptance || 'to_be_checked';
      const accLabel = accResult === 'complete' ? 'Complete' : accResult === 'partial' ? 'Partial' : 'To Be Checked';

      let itemsRows = '';
      if (iar.items && iar.items.length > 0) {
        // Inject item_specifications from iars table into the first item if available
        if (iar.item_specifications && iar.items.length > 0) {
          iar.items[0].item_name = (iar.items[0].item_name || '') + '\n' + iar.item_specifications;
        }
        itemsRows = iar.items.map((item, idx) => `
          <tr>
            <td style="text-align:center;">${item.stock_no || item.item_code || (idx + 1)}</td>
            <td>${(item.item_name || '').replace(/\n/g, '<br>')}</td>
            <td style="text-align:center;">${item.quantity || ''}</td>
            <td style="text-align:right;">${item.unit_cost ? '₱' + parseFloat(item.unit_cost).toLocaleString('en-PH', {minimumFractionDigits:2}) : ''}</td>
            <td style="text-align:right;">${item.unit_cost && item.quantity ? '₱' + (parseFloat(item.unit_cost) * parseFloat(item.quantity)).toLocaleString('en-PH', {minimumFractionDigits:2}) : ''}</td>
          </tr>`).join('');
      } else if (iar.item_specifications) {
        // No items but specs exist - show specs as a row
        itemsRows = `<tr><td style="text-align:center;">1</td><td>${iar.item_specifications.replace(/\n/g, '<br>')}</td><td></td><td></td><td></td></tr>`;
      } else {
        itemsRows = '<tr><td colspan="5" style="text-align:center;">No items recorded</td></tr>';
      }

      const totalAmount = (iar.items || []).reduce((sum, item) => sum + (parseFloat(item.unit_cost || 0) * parseFloat(item.quantity || 0)), 0);

      const bodyContent = `
        <div class="doc-title">INSPECTION AND ACCEPTANCE REPORT</div>
        <div class="doc-subtitle">(Appendix 62 - GAM for NGAs)</div>
        <table class="info-table">
          <tr><td width="25%"><strong>Entity Name:</strong></td><td>DMW Regional Office XIII (Caraga)</td><td width="25%"><strong>Fund Cluster:</strong></td><td>_______________</td></tr>
        </table>
        <table class="info-table" style="margin-top:0;">
          <tr><td width="25%"><strong>IAR No.:</strong></td><td>${iar.iar_number || ''}</td><td width="25%"><strong>Date:</strong></td><td>${fmtDate(iar.inspection_date)}</td></tr>
          <tr><td><strong>Supplier:</strong></td><td>${iar.supplier_name || ''}</td><td><strong>PO No. / Date:</strong></td><td>${iar.po_number || ''} ${iar.po_date ? '/ ' + fmtDate(iar.po_date) : ''}</td></tr>
          <tr><td><strong>Invoice No.:</strong></td><td>${iar.invoice_number || ''}</td><td><strong>Invoice Date:</strong></td><td>${fmtDate(iar.invoice_date)}</td></tr>
          <tr><td><strong>Requisitioning Office/Dept.:</strong></td><td>${iar.purpose || ''}</td><td><strong>Delivery Date:</strong></td><td>${fmtDate(iar.delivery_date)}</td></tr>
          <tr><td><strong>DR No.:</strong></td><td colspan="3">${iar.delivery_receipt_number || ''}</td></tr>
        </table>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width:12%;">Stock / Property No.</th>
              <th>Description</th>
              <th style="width:10%;">Quantity</th>
              <th style="width:14%;">Unit Cost</th>
              <th style="width:14%;">Total Cost</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
            <tr style="font-weight:bold;">
              <td colspan="4" style="text-align:right;"><strong>TOTAL:</strong></td>
              <td style="text-align:right;"><strong>₱${totalAmount.toLocaleString('en-PH', {minimumFractionDigits:2})}</strong></td>
            </tr>
          </tbody>
        </table>

        <div style="display:flex; justify-content:space-between; margin-top:25px; gap:20px;">
          <div style="width:48%; border:1px solid #333; padding:10px;">
            <p style="font-weight:bold; font-size:10px; text-align:center; margin-bottom:8px;">INSPECTION</p>
            <p style="font-size:9px;"><strong>Date Inspected:</strong> ${fmtDate(iar.date_inspected || iar.inspection_date)}</p>
            <p style="font-size:9px;"><strong>Inspection Result:</strong> ${inspLabel}</p>
            ${iar.findings ? `<p style="font-size:9px;"><strong>Findings:</strong> ${iar.findings}</p>` : ''}
            <div style="border-bottom:1px solid #333; height:30px; margin:15px 0 5px;"></div>
            <p style="text-align:center; font-size:9px;"><strong>${iar.inspected_by_name || ''}</strong></p>
            <p style="text-align:center; font-size:8px;">Inspection Officer / Inspection Committee</p>
          </div>
          <div style="width:48%; border:1px solid #333; padding:10px;">
            <p style="font-weight:bold; font-size:10px; text-align:center; margin-bottom:8px;">ACCEPTANCE</p>
            <p style="font-size:9px;"><strong>Date Received:</strong> ${fmtDate(iar.date_received)}</p>
            <p style="font-size:9px;"><strong>Status:</strong> ${accLabel}</p>
            <div style="border-bottom:1px solid #333; height:30px; margin:15px 0 5px;"></div>
            <p style="text-align:center; font-size:9px;"><strong>${iar.received_by_name || ''}</strong></p>
            <p style="text-align:center; font-size:8px;">Supply and/or Property Custodian</p>
          </div>
        </div>
      `;

      const html = buildPrintHTML('IAR - ' + iar.iar_number, bodyContent);
      openPrintPreview(html, { title: toFilename('IAR_' + iar.iar_number), editable: true });
    } catch (err) {
      console.error('Print IAR error:', err);
      showNotification('Failed to print IAR: ' + err.message, 'error');
    }
  };

  // ==================== PRINT PR (PURCHASE REQUEST) ====================
  // Fetches full PR + items from API and renders official DMW Purchase Request form
  window.printPR = async function(prId) {
    try {
      showNotification('Loading Purchase Request data for print...', 'info');
      // Find PR from cache to get the id if prId is a pr_number
      let id = prId;
      if (typeof prId === 'string' && isNaN(prId)) {
        const cached = cachedPR.find(p => p.pr_number === prId);
        if (cached) id = cached.id;
      }
      const pr = await apiRequest('/purchase-requests/' + id);
      if (!pr) { showNotification('Purchase Request not found', 'error'); return; }

      // Fetch chief and HOPE names + designations from users & employees
      let chiefName = '', chiefDesignation = '', hopeName = '', hopeDesignation = 'Regional Director';
      try {
        const [allUsers, allEmployees] = await Promise.all([
          apiRequest('/users'),
          apiRequest('/employees')
        ]);
        // Find division chief for this PR's department
        const chiefUser = allUsers.find(u => u.role && u.role.startsWith('chief_') && u.department_code === pr.department_code);
        if (chiefUser) {
          chiefName = chiefUser.full_name || '';
          // Match employee by full_name (case-insensitive trim)
          const chiefEmp = allEmployees.find(e => e.full_name && chiefUser.full_name && e.full_name.trim().toLowerCase() === chiefUser.full_name.trim().toLowerCase());
          if (chiefEmp) chiefDesignation = chiefEmp.designation_name || '';
        }
        // Find HOPE / Regional Director
        const hopeUser = allUsers.find(u => u.role === 'hope');
        if (hopeUser) {
          hopeName = hopeUser.full_name || '';
          const hopeEmp = allEmployees.find(e => e.full_name && hopeUser.full_name && e.full_name.trim().toLowerCase() === hopeUser.full_name.trim().toLowerCase());
          if (hopeEmp && hopeEmp.designation_name) hopeDesignation = hopeEmp.designation_name;
        }
      } catch (e) { console.warn('Could not fetch chief/HOPE data:', e); }

      const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
      const fmtCurrency = (v) => {
        const num = parseFloat(v || 0);
        return num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      };

      // Build item rows
      const items = pr.items || [];
      let itemsHTML = '';
      let grandTotal = 0;

      // Inject item_specifications from purchaserequests table into the first item's description for print
      if (pr.item_specifications && items.length > 0 && !items[0].item_description) {
        items[0].item_description = pr.item_specifications;
      } else if (pr.item_specifications && items.length === 0) {
        items.push({ quantity: 1, unit: 'LOT', item_name: '', item_description: pr.item_specifications, unit_price: pr.total_amount || 0 });
      }

      if (items.length > 0) {
        items.forEach((item, idx) => {
          const qty = parseFloat(item.quantity || 0);
          const unitCost = parseFloat(item.unit_price || 0);
          const totalCost = qty * unitCost;
          grandTotal += totalCost;

          // Main item row
          itemsHTML += `
            <tr>
              <td class="pr-cell-center">${idx + 1}</td>
              <td class="pr-cell-center">${item.unit || ''}</td>
              <td class="pr-cell-desc"><strong>${item.item_name || ''}</strong></td>
              <td class="pr-cell-center">${qty}</td>
              <td class="pr-cell-right" style="padding-right:10px;">${fmtCurrency(unitCost)}</td>
              <td class="pr-cell-right" style="padding-right:10px;">${fmtCurrency(totalCost)}</td>
            </tr>`;

          // Description/specs row (only if different from item name)
          if (item.item_description && item.item_description.trim().toLowerCase() !== (item.item_name || '').trim().toLowerCase()) {
            itemsHTML += `
            <tr>
              <td class="pr-cell-center"></td>
              <td class="pr-cell-center"></td>
              <td class="pr-cell-desc pr-item-specs">${item.item_description}</td>
              <td class="pr-cell-center"></td>
              <td class="pr-cell-center"></td>
              <td class="pr-cell-center"></td>
            </tr>`;
          }
        });
      } else {
        itemsHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No items</td></tr>';
      }

      // Use total_amount from PR if available, otherwise calculated
      const totalAmount = parseFloat(pr.total_amount || 0) > 0 ? parseFloat(pr.total_amount) : grandTotal;

      // Add empty rows to fill space (minimum ~15 visible rows for form look)
      const minRows = 15;
      const currentRows = items.length + items.filter(i => i.item_description && i.item_description.trim().toLowerCase() !== (i.item_name || '').trim().toLowerCase()).length;
      for (let i = currentRows; i < minRows; i++) {
        itemsHTML += `
            <tr>
              <td class="pr-cell-center">&nbsp;</td>
              <td class="pr-cell-center"></td>
              <td class="pr-cell-desc"></td>
              <td class="pr-cell-center"></td>
              <td class="pr-cell-right"></td>
              <td class="pr-cell-right"></td>
            </tr>`;
      }

      const bodyContent = `
        <style>
          /* PR-specific print styles matching official DMW form */
          .pr-form-title {
            text-align: center;
            font-size: 16pt;
            font-weight: bold;
            font-family: Arial, sans-serif;
            margin: 4px 0 2px 0;
            letter-spacing: 1px;
            padding: 6px 0;
          }
          .pr-appendix {
            text-align: center;
            font-size: 8pt;
            font-style: italic;
            font-family: Arial, sans-serif;
            margin-bottom: 10px;
            color: #444;
          }
          .pr-info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
            font-family: Arial, sans-serif;
          }
          .pr-info-table td {
            border: 1px solid #333;
            padding: 4px 8px;
            font-size: 10pt;
            vertical-align: middle;
          }
          .pr-info-label {
            font-weight: normal;
            color: #333;
            white-space: nowrap;
            width: 22%;
          }
          .pr-info-value {
            font-weight: bold;
          }
          .pr-items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
            font-family: Arial, sans-serif;
          }
          .pr-items-table thead th {
            border: 1px solid #333;
            padding: 6px 4px;
            font-size: 9pt;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
          }
          .pr-items-table tbody td {
            border: 1px solid #333;
            padding: 4px 6px;
            font-size: 10pt;
            vertical-align: middle;
          }
          .pr-cell-center { text-align: center; }
          .pr-cell-right { text-align: right; }
          .pr-cell-desc { text-align: left; }
          .pr-item-specs {
            font-weight: normal;
            font-size: 9pt;
            color: #555;
            padding-left: 24px !important;
            vertical-align: top;
            white-space: pre-line;
          }
          .pr-total-row td {
            border: 1px solid #333;
            padding: 5px 6px;
            font-size: 10pt;
            font-weight: bold;
          }
          .pr-sig-table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
            font-family: Arial, sans-serif;
          }
          .pr-sig-table td {
            border: 1px solid #333;
            padding: 4px 8px;
            font-size: 9pt;
            vertical-align: top;
          }
          .pr-sig-name {
            text-align: center;
            font-weight: bold;
            font-size: 10pt;
            text-transform: uppercase;
            padding-top: 60px !important;
          }
          .pr-sig-designation {
            text-align: center;
            font-size: 8pt;
            color: #444;
            padding-bottom: 8px !important;
          }
        </style>

        <div class="pr-form-title">PURCHASE REQUEST</div>

        <table class="pr-info-table">
          <tr>
            <td class="pr-info-label">Office/Section:</td>
            <td class="pr-info-value" style="width:28%;">${pr.department_name || pr.department_code || 'DMW Caraga'}</td>
            <td class="pr-info-label" style="width:15%;">PR No.:</td>
            <td class="pr-info-value" style="width:20%;">${pr.pr_number || ''}</td>
          </tr>
          <tr>
            <td class="pr-info-label">Responsibility Center Code:</td>
            <td class="pr-info-value" colspan="1">${pr.department_code || ''}</td>
            <td class="pr-info-label">Date:</td>
            <td class="pr-info-value">${fmtDate(pr.pr_date || pr.created_at)}</td>
          </tr>
        </table>

        <table class="pr-items-table">
          <thead>
            <tr>
              <th style="width:8%;">ITEM NO.</th>
              <th style="width:8%;">UNIT</th>
              <th>ITEM DESCRIPTION</th>
              <th style="width:12%;">QUANTITY</th>
              <th style="width:14%;">UNIT COST</th>
              <th style="width:14%;">TOTAL COST</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
            <tr class="pr-total-row">
              <td colspan="3"></td>
              <td colspan="2" style="text-align:center; font-weight:bold;">TOTAL AMOUNT</td>
              <td style="text-align:center;">₱${fmtCurrency(totalAmount)}</td>
            </tr>
            <tr>
              <td colspan="6" style="padding:6px 8px; font-size:10pt;"><span style="font-weight:bold; color:red;">Purpose: </span><span style="color:red; font-weight:bold;">${pr.purpose || ''}</span></td>
            </tr>
          </tbody>
        </table>

        <table class="pr-sig-table">
          <tr>
            <td style="width:18%;"></td>
            <td style="width:41%; text-align:center; padding-top:5px;">Requested by:</td>
            <td style="width:41%; text-align:center; padding-top:5px;">Approved by:</td>
          </tr>
          <tr>
            <td style="font-size:8pt; font-weight:bold; vertical-align:bottom;">Printed Name</td>
            <td class="pr-sig-name">${chiefName}</td>
            <td class="pr-sig-name">${hopeName}</td>
          </tr>
          <tr>
            <td style="font-size:8pt; font-weight:bold; vertical-align:top;">Designation</td>
            <td class="pr-sig-designation">${chiefDesignation}</td>
            <td class="pr-sig-designation">${hopeDesignation}</td>
          </tr>
        </table>
      `;

      const html = buildPrintHTML('PR - ' + pr.pr_number, bodyContent);
      openPrintPreview(html, { title: toFilename('PR_' + pr.pr_number), pageSize: 'A4', landscape: false, editable: true });
    } catch (err) {
      console.error('Print PR error:', err);
      showNotification('Failed to print Purchase Request: ' + err.message, 'error');
    }
  };

  // ==================== PRINT RFQ (REQUEST FOR QUOTATION) ====================
  // Fetches full RFQ + items from API and renders official DMW RFQ form
  window.printRFQ = async function(rfqId) {
    try {
      showNotification('Loading RFQ data for print...', 'info');
      let id = rfqId;
      if (typeof rfqId === 'string' && isNaN(rfqId)) {
        const cached = cachedRFQ.find(r => r.rfq_number === rfqId);
        if (cached) id = cached.id;
      }
      const rfq = await apiRequest('/rfqs/' + id);
      if (!rfq) { showNotification('RFQ not found', 'error'); return; }

      // Fetch BAC Secretariat, BAC Chair, Mark Marasigan names + designations
      let bacSecName = 'GIOVANNI S. PAREDES', bacSecDesignation = '';
      let bacChairName = '', bacChairDesignation = '';
      let markName = 'MARK E. MARASIGAN', markDesignation = '';
      let prPurpose = '';
      try {
        const [allUsers, allEmployees] = await Promise.all([
          apiRequest('/users'),
          apiRequest('/employees')
        ]);
        // BAC Secretariat
        const bacSecUser = allUsers.find(u => u.role === 'bac_secretariat');
        if (bacSecUser) {
          bacSecName = bacSecUser.full_name || bacSecName;
          const bacSecEmp = allEmployees.find(e => e.full_name && bacSecUser.full_name && e.full_name.trim().toLowerCase() === bacSecUser.full_name.trim().toLowerCase());
          if (bacSecEmp) bacSecDesignation = bacSecEmp.designation_name || '';
        }
        // BAC Chairperson (primary or secondary role)
        const bacChairUser = allUsers.find(u => u.role === 'bac_chair' || u.secondary_role === 'bac_chair');
        if (bacChairUser) {
          bacChairName = bacChairUser.full_name || '';
          const bacChairEmp = allEmployees.find(e => e.full_name && bacChairUser.full_name && e.full_name.trim().toLowerCase() === bacChairUser.full_name.trim().toLowerCase());
          if (bacChairEmp) bacChairDesignation = bacChairEmp.designation_name || '';
        }
        // Mark E. Marasigan
        const markEmp = allEmployees.find(e => e.full_name && e.full_name.trim().toLowerCase().includes('marasigan'));
        if (markEmp) {
          markName = markEmp.full_name || markName;
          markDesignation = markEmp.designation_name || '';
        }
      } catch (e) { console.warn('Could not fetch BAC/employee data:', e); }

      // Fetch Purpose from linked PR
      if (rfq.pr_id) {
        try {
          const pr = await apiRequest('/purchase-requests/' + rfq.pr_id);
          if (pr && pr.purpose) prPurpose = pr.purpose;
        } catch (e) { console.warn('Could not fetch PR purpose:', e); }
      }

      const fmtDate = (d) => {
        if (!d) return '';
        const dt = new Date(d);
        const months = ['Jan.','Feb.','Mar.','Apr.','May','Jun.','Jul.','Aug.','Sep.','Oct.','Nov.','Dec.'];
        return months[dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear();
      };
      const fmtCurrency = (v) => {
        const num = parseFloat(v || 0);
        return num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      };

      // Build item rows
      const items = rfq.items || [];
      let itemsHTML = '';
      let abcTotal = 0;

      // Inject item_specifications from rfqs table into the first item's description for print
      if (rfq.item_specifications && items.length > 0) {
        items[0].item_description = rfq.item_specifications;
      } else if (rfq.item_specifications && items.length === 0) {
        // If no rfq_items exist but specs are set, create a virtual item for print
        items.push({ quantity: 1, unit: 'LOT', item_name: '', item_description: rfq.item_specifications, abc_unit_cost: rfq.abc_amount || 0 });
      }

      if (items.length > 0) {
        items.forEach((item) => {
          const qty = parseFloat(item.quantity || 0);
          const abcUnitCost = parseFloat(item.abc_unit_cost || 0);
          const abcItemTotal = qty * abcUnitCost;
          abcTotal += abcItemTotal;

          // Main item row
          itemsHTML += `
            <tr>
              <td class="rfq-cell-center">${qty}</td>
              <td class="rfq-cell-center">${item.unit || ''}</td>
              <td class="rfq-cell-desc"><strong>${item.item_name || ''}</strong></td>
              <td class="rfq-cell-right">${fmtCurrency(abcItemTotal)}</td>
              <td class="rfq-cell-right"></td>
              <td class="rfq-cell-right"></td>
            </tr>`;

          // Description/specs rows
          if (item.item_description) {
            const specLines = item.item_description.split(/\\n|\n/).filter(l => l.trim());
            specLines.forEach(line => {
              itemsHTML += `
            <tr class="rfq-spec-row">
              <td class="rfq-cell-center"></td>
              <td class="rfq-cell-center"></td>
              <td class="rfq-cell-specs">${line.trim()}</td>
              <td class="rfq-cell-right"></td>
              <td class="rfq-cell-right"></td>
              <td class="rfq-cell-right"></td>
            </tr>`;
            });
          }
        });
      } else {
        itemsHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No items</td></tr>';
      }

      // Fill empty rows for form look
      const minRows = 12;
      const currentRows = items.length + items.filter(i => i.item_description).reduce((c, i) => c + (i.item_description.split(/\\n|\n/).filter(l => l.trim()).length), 0);
      for (let i = currentRows; i < minRows; i++) {
        itemsHTML += `
            <tr>
              <td class="rfq-cell-center">&nbsp;</td>
              <td class="rfq-cell-center"></td>
              <td class="rfq-cell-desc"></td>
              <td class="rfq-cell-right"></td>
              <td class="rfq-cell-right"></td>
              <td class="rfq-cell-right"></td>
            </tr>`;
      }

      const totalABC = parseFloat(rfq.abc_amount || 0) > 0 ? parseFloat(rfq.abc_amount) : abcTotal;

      const bodyContent = `
        <style>
          .rfq-title {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            font-family: Arial, sans-serif;
            margin: 8px 0 12px 0;
            letter-spacing: 1px;
          }
          .rfq-info-row {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            margin: 3px 0;
            line-height: 1.5;
          }
          .rfq-info-row .rfq-label {
            font-weight: bold;
            display: inline-block;
            min-width: 140px;
          }
          .rfq-info-right {
            float: right;
            text-align: right;
          }
          .rfq-body-text {
            font-family: Arial, sans-serif;
            font-size: 9.5pt;
            line-height: 1.5;
            margin: 6px 0;
            text-align: center;
          }
          .rfq-body-text.indent {
            text-indent: 0;
          }
          .rfq-items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0 0 0;
            font-family: Arial, sans-serif;
          }
          .rfq-items-table thead th {
            border: 1px solid #333;
            padding: 5px 4px;
            font-size: 9pt;
            font-weight: bold;
            text-align: center;
          }
          .rfq-items-table tbody td {
            border: 1px solid #333;
            padding: 2px 5px;
            font-size: 9.5pt;
            vertical-align: top;
          }
          .rfq-cell-center { text-align: center; }
          .rfq-cell-right { text-align: right; }
          .rfq-cell-desc { text-align: left; }
          .rfq-cell-specs {
            text-align: left;
            font-size: 9pt;
            padding-left: 15px !important;
            color: #333;
          }
          .rfq-spec-row td {
            border-top: 1px dashed #999 !important;
            border-bottom: 1px dashed #999 !important;
            border-left: 1px solid #333;
            border-right: 1px solid #333;
          }
          .rfq-total-row td {
            border: 1px solid #333;
            padding: 4px 5px;
            font-size: 9.5pt;
            font-weight: bold;
          }
          .rfq-sig-section {
            font-family: Arial, sans-serif;
            font-size: 9.5pt;
            margin-top: 12px;
          }
          .rfq-sig-line {
            border-bottom: 1px solid #333;
            height: 30px;
            margin: 10px 0 3px 0;
            width: 250px;
          }
          .rfq-sig-label {
            font-size: 9pt;
            color: #444;
            text-align: center;
            width: 250px;
          }
          .rfq-terms {
            font-family: Arial, sans-serif;
            font-size: 9pt;
            line-height: 1.5;
          }
          .rfq-terms-row {
            display: flex;
            margin: 1px 0;
          }
          .rfq-terms-num {
            min-width: 20px;
            text-align: right;
            padding-right: 6px;
          }
          .rfq-conforme {
            margin-top: 15px;
            font-family: Arial, sans-serif;
            font-size: 9.5pt;
          }
          .rfq-two-col {
            display: flex;
            justify-content: space-between;
          }
          .rfq-col-left { width: 48%; }
          .rfq-col-right { width: 48%; text-align: center; }
          .rfq-checkbox {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 1.5px solid #333;
            margin-right: 4px;
            vertical-align: middle;
            position: relative;
            top: -1px;
          }
        </style>

        <div class="rfq-title">REQUEST FOR QUOTATION</div>

        <div class="rfq-two-col">
          <div class="rfq-col-left"></div>
          <div class="rfq-col-right" style="text-align:right;">
            <div class="rfq-info-row"><span class="rfq-label">RFQ No.:</span> ${rfq.rfq_number || ''}</div>
            <div class="rfq-info-row"><span class="rfq-label">Date:</span> ${fmtDate(rfq.date_prepared)}</div>
          </div>
        </div>

        <div class="rfq-info-row"><span class="rfq-label">Company Name:</span> ___________________________________</div>
        <div class="rfq-info-row"><span class="rfq-label">Company Address:</span> ___________________________________</div>
        <div class="rfq-info-row"><span class="rfq-label">TIN:</span> ___________________________________</div>

        <div style="margin-top:10px;">
          <div class="rfq-body-text" style="text-align:left;">Sir/Madam:</div>
          <div class="rfq-body-text indent">May we invite your company to quote for the lowest price/s, VAT included, on the item/s listed and described hereunder.</div>
          <div class="rfq-body-text">Please submit your QUOTATION to the Bids and Awards Committee (BAC), through BAC Secretary <strong><u>${bacSecName.toUpperCase()}</u></strong>, located at DMW-Caraga Esquina Dos Bldg, 3rd Floor, J.C. Aquino Ave., Corner Doongan, Butuan City, Telephone No.(085) 815-1708 in duplicate copies or via email dmw13.bac@gmail.com which shall be stamped thereon the date and time received by the BAC Secretariat.</div>
          <div class="rfq-body-text indent">The quotation must be received by the BAC Secretariat not later than three (3) days from receipt hereof and not beyond 8:00 o'clock in the morning of the last day to submit the quoted price. All bids which are higher than the ABC shall be automatically disqualified.</div>
          <div class="rfq-body-text indent">The BAC reserves the rights to reject any and all bid/s submitted which is/are not in accordance with the specification and those submitted after the deadline.</div>
        </div>

        <div class="rfq-sig-section" style="margin-top:20px;">
          <div class="rfq-two-col" style="margin-top:5px;">
            <div class="rfq-col-left">
              <div>Served by:</div>
              <div class="rfq-sig-line"></div>
              <div class="rfq-sig-label"><strong>${bacSecName.toUpperCase()}</strong></div>
              <div class="rfq-sig-label">BAC Secretariat</div>
              <div style="margin-top:10px;">Date:________________________</div>
            </div>
            <div class="rfq-col-right">
              <div style="text-align:center;">Very truly yours,</div>
              <div class="rfq-sig-line" style="margin:10px auto 3px auto;"></div>
              <div style="font-weight:bold; font-size:9.5pt; text-transform:uppercase;">${bacChairName}</div>
              <div style="font-size:9pt; color:#444;">${bacChairDesignation}</div>
              <div style="font-size:9pt; color:#444;">BAC Chairperson</div>
            </div>
          </div>
        </div>

        <div style="margin-top:5px; border-top:1px dashed #999; padding-top:5px;"></div>

        <table class="rfq-items-table">
          <thead>
            <tr>
              <th style="width:8%;">Quantity</th>
              <th style="width:10%;">Unit</th>
              <th>Item (with specification)</th>
              <th style="width:12%;">ABC</th>
              <th style="width:13%;">Unit Cost</th>
              <th style="width:13%;">Total Cost</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
            ${prPurpose ? `<tr><td style="border:1px solid #333;"></td><td style="border:1px solid #333;"></td><td style="padding:4px 5px; font-size:9.5pt; color:red; font-weight:bold; border:1px solid #333;"><span style="color:red; font-weight:bold;">PURPOSE: ${prPurpose}</span></td><td style="border:1px solid #333;"></td><td style="border:1px solid #333;"></td><td style="border:1px solid #333;"></td></tr>` : ''}
            <tr class="rfq-total-row">
              <td colspan="3" style="text-align:center;">VAT INCLUSIVE</td>
              <td style="text-align:right;">₱${fmtCurrency(totalABC)}</td>
              <td style="text-align:right;"></td>
              <td style="text-align:right;"></td>
            </tr>
          </tbody>
        </table>

        <div class="rfq-two-col" style="margin-top:10px;">
          <div class="rfq-col-left rfq-sig-section">
            <div>Received by:</div>
            <div class="rfq-sig-line"></div>
            <div class="rfq-sig-label">(Name &amp; Signature of Proprietor/<br>Authorized Representative)</div>
            <div style="margin-top:6px;">Telephone/Fax No. ___________________</div>
            <div style="margin-top:3px;">Email ___________________________________</div>
          </div>
          <div class="rfq-col-right"></div>
        </div>

        <div style="margin-top:12px;">
          <div class="rfq-info-row"><span class="rfq-label">PR No.:</span> <strong>${rfq.pr_number || ''}</strong></div>
        </div>

        <div class="rfq-terms" style="margin-top:8px;">
          <div style="font-weight:bold; margin-bottom:4px;">Terms &amp; Conditions:</div>
          <div class="rfq-terms-row"><span class="rfq-terms-num">1.</span><span>Award shall be made on &emsp; <span class="rfq-checkbox"></span> Per Item Basis &emsp; <span class="rfq-checkbox"></span> Lot/Package &emsp; <span class="rfq-checkbox"></span> Total Quoted</span></div>
          <div class="rfq-terms-row"><span class="rfq-terms-num">2.</span><span>Quotation validity shall not be less than <strong><u>30</u></strong> calendar days</span></div>
          <div class="rfq-terms-row"><span class="rfq-terms-num">3.</span><span>Must be registered with PhilGEPS.</span></div>
          <div class="rfq-terms-row"><span class="rfq-terms-num">4.</span><span>Goods shall be delivered within: <strong><u>one to three working days after the award has made</u></strong></span></div>
          <div class="rfq-terms-row"><span class="rfq-terms-num">5.</span><span>Place of delivery: <strong><u>3rd Floor Esquina Dos Bldg., Cor. Doongan, Butuan City</u></strong></span></div>
          <div class="rfq-terms-row"><span class="rfq-terms-num">6.</span><span>Term of Payment is <strong><u>Check</u></strong> / ADA</span></div>
          <div class="rfq-terms-row"><span class="rfq-terms-num">7.</span><span>Liquidated Damages/Penalty: <strong><u>(1/10) of one percent for every days of delay shall be imposed</u></strong></span></div>
          <div class="rfq-terms-row"><span class="rfq-terms-num">8.</span><span>In case of discrepancy between unit and total cost, until cost shall prevail</span></div>
        </div>

        <div class="rfq-two-col" style="margin-top:30px;">
          <div class="rfq-col-left rfq-sig-section" style="text-align:center;">
            <div class="rfq-sig-line" style="margin:25px auto 3px auto;"></div>
            <div style="font-weight:bold; font-size:9.5pt; text-transform:uppercase;">${markName}</div>
            <div style="font-size:9pt; color:#444;">AO I / SUPPLY OFFICER I</div>
          </div>
          <div class="rfq-col-right rfq-conforme" style="margin-top:0;">
            <div>Conforme:</div>
            <div class="rfq-sig-line" style="margin:25px auto 3px auto;"></div>
            <div class="rfq-sig-label" style="margin:0 auto;">Name &amp; Signature of Proprietor/<br>Authorized Representative</div>
          </div>
        </div>
      `;

      const html = buildPrintHTML('RFQ - ' + rfq.rfq_number, bodyContent);
      openPrintPreview(html, { title: toFilename('RFQ_' + rfq.rfq_number), pageSize: 'A4', landscape: false, editable: true });
    } catch (err) {
      console.error('Print RFQ error:', err);
      showNotification('Failed to print RFQ: ' + err.message, 'error');
    }
  };

  // Print Abstract of Quotation — matching government AOQ form (ABS JAN 2026.xlsx template)
  window.printAbstract = async function(abstractId) {
    try {
      showNotification('Loading Abstract data for print...', 'info');
      const abs = await apiRequest('/abstracts/' + abstractId);
      if (!abs) { showNotification('Abstract not found', 'error'); return; }

      // Fetch RFQ details for ABC amount and items
      let rfqData = null;
      let prPurpose = abs.purpose || '';
      if (abs.rfq_id) {
        try {
          rfqData = await apiRequest('/rfqs/' + abs.rfq_id);
          if (rfqData && rfqData.pr_id) {
            try {
              const pr = await apiRequest('/purchase-requests/' + rfqData.pr_id);
              if (pr && pr.purpose) prPurpose = pr.purpose;
            } catch(e) {}
          }
        } catch(e) { console.warn('Could not fetch RFQ data:', e); }
      }

      // BAC members (from Excel template)
      let bacChairName = 'REGIENALD S. ESPALDON', bacChairDesignation = 'BAC Chairperson';
      let bacViceChairName = 'EVAL B. MAKINANO', bacViceChairDesignation = 'BAC Vice-Chairperson';
      let bacMembers = [
        { name: 'REYNON E. ARLAN', title: 'BAC Member' },
        { name: 'MARISSA A. GARAY', title: 'BAC Member' },
        { name: 'GARY P. SALADORES', title: 'BAC Member' }
      ];
      let bacSecName = 'GIOVANNI S. PAREDES', bacSecTitle = 'Chairperson, BAC Secretariat';
      let rdName = 'RITCHEL M. BUTAO', rdTitle = 'Regional Director';
      try {
        const [allUsers, allEmployees] = await Promise.all([apiRequest('/users'), apiRequest('/employees')]);
        const bacChairUser = allUsers.find(u => u.role === 'bac_chair' || u.secondary_role === 'bac_chair');
        if (bacChairUser) bacChairName = (bacChairUser.full_name || bacChairName).toUpperCase();
        const bacSecUser = allUsers.find(u => u.role === 'bac_secretariat');
        if (bacSecUser) bacSecName = (bacSecUser.full_name || bacSecName).toUpperCase();
      } catch(e) {}

      const fmtDate = (d) => {
        if (!d) return '';
        const dt = new Date(d);
        const months = ['Jan.','Feb.','Mar.','Apr.','May','Jun.','Jul.','Aug.','Sep.','Oct.','Nov.','Dec.'];
        return months[dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear();
      };
      const fmtCurrency = (v) => {
        const num = parseFloat(v || 0);
        return num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      };

      // Quotations — pad to 3 suppliers
      const quotations = abs.quotations || [];
      while (quotations.length < 3) quotations.push({ supplier_name: '', items: [], bid_amount: 0 });

      // Items from RFQ or first quotation
      let abstractItems = [];
      if (rfqData && rfqData.items && rfqData.items.length > 0) {
        abstractItems = rfqData.items.map(it => ({
          qty: parseFloat(it.quantity || 0),
          unit: it.unit || '',
          description: it.item_name || it.item_description || '',
          abc: parseFloat(it.abc_total_cost || it.abc_unit_cost || 0)
        }));
      } else if (quotations[0] && quotations[0].items && quotations[0].items.length > 0) {
        abstractItems = quotations[0].items.map(it => ({
          qty: parseFloat(it.quantity || 0),
          unit: it.unit || '',
          description: it.item_description || '',
          abc: 0
        }));
      }

      // Supplier header row — no colors
      let supplierHeaders = '';
      let supplierSubHeaders = '';
      for (let si = 0; si < 3; si++) {
        const sName = (quotations[si] && quotations[si].supplier_name) ? quotations[si].supplier_name.toUpperCase() : '';
        supplierHeaders += `<th colspan="2" class="abs-th">${sName}</th>`;
        supplierSubHeaders += `<th class="abs-th" style="width:9%;">Unit Price</th><th class="abs-th" style="width:9%;">Total Price</th>`;
      }

      // Item rows
      let itemsHTML = '';
      abstractItems.forEach((item) => {
        let supplierCells = '';
        for (let si = 0; si < 3; si++) {
          const q = quotations[si];
          let unitPrice = '', totalPrice = '';
          if (q && q.items && q.items.length > 0) {
            const matchItem = q.items.find(qi => qi.item_description && item.description && qi.item_description.toLowerCase().includes(item.description.toLowerCase().substring(0, 15))) || q.items[0];
            if (matchItem) {
              unitPrice = fmtCurrency(matchItem.unit_price || 0);
              totalPrice = fmtCurrency(matchItem.total_price || 0);
            }
          }
          supplierCells += `<td class="abs-td abs-r">${unitPrice}</td><td class="abs-td abs-r">${totalPrice}</td>`;
        }
        itemsHTML += `<tr>
          <td class="abs-td abs-c">${item.qty}</td>
          <td class="abs-td abs-c">${item.unit}</td>
          <td class="abs-td">${item.description}</td>
          <td class="abs-td abs-r">${fmtCurrency(item.abc)}</td>
          ${supplierCells}
        </tr>`;
      });

      // Notes / specs rows
      if (abs.item_specifications) {
        const specs = abs.item_specifications.split(/\n|\r\n/).filter(l => l.trim());
        itemsHTML += `<tr><td class="abs-td"></td><td class="abs-td"></td><td class="abs-td" colspan="8" style="font-weight:bold;">Note:</td></tr>`;
        specs.forEach((spec, i) => {
          itemsHTML += `<tr><td class="abs-td"></td><td class="abs-td"></td><td class="abs-td" colspan="8">${(i + 1)}. ${spec.trim()}</td></tr>`;
        });
      }

      // Empty filler rows
      const totalContentRows = abstractItems.length + (abs.item_specifications ? abs.item_specifications.split(/\n/).filter(l => l.trim()).length + 1 : 0);
      for (let i = totalContentRows; i < 6; i++) {
        itemsHTML += `<tr><td class="abs-td">&nbsp;</td><td class="abs-td"></td><td class="abs-td"></td><td class="abs-td"></td><td class="abs-td"></td><td class="abs-td"></td><td class="abs-td"></td><td class="abs-td"></td><td class="abs-td"></td><td class="abs-td"></td></tr>`;
      }

      // PURPOSE row with supplier totals
      let purposeTotalCells = '';
      for (let si = 0; si < 3; si++) {
        const q = quotations[si];
        const total = q ? parseFloat(q.bid_amount || 0) : 0;
        purposeTotalCells += `<td class="abs-td"></td><td class="abs-td abs-r" style="font-weight:bold;">${total > 0 ? fmtCurrency(total) : ''}</td>`;
      }

      const recommendedName = abs.recommended_supplier_name || (quotations[0] ? quotations[0].supplier_name : '');
      const recommendedAmount = fmtCurrency(abs.recommended_amount || 0);

      const bodyContent = `
        <style>
          @page { size: A4 landscape; margin: 8mm 10mm; }
          .abs-wrap { font-family: Arial, Helvetica, sans-serif; font-size: 8pt; line-height: 1.3; }
          .abs-title { text-align: center; font-size: 12pt; font-weight: bold; margin: 2px 0 6px 0; letter-spacing: 0.5px; }
          .abs-info { font-size: 9pt; margin: 2px 0; }
          .abs-info b { min-width: 70px; display: inline-block; }
          .abs-tbl { width: 100%; border-collapse: collapse; margin: 4px 0 0 0; }
          .abs-th { border: 1px solid #000; padding: 2px 3px; font-size: 7.5pt; font-weight: bold; text-align: center; vertical-align: middle; }
          .abs-td { border: 1px solid #000; padding: 1px 3px; font-size: 8pt; vertical-align: top; }
          .abs-c { text-align: center; }
          .abs-r { text-align: right; }
          .abs-cert { font-size: 8pt; line-height: 1.4; margin-top: 4px; }
          .abs-cert p { margin: 2px 0; }
          .abs-sigs { margin-top: 6px; font-size: 8pt; }
          .abs-sig-row { display: flex; justify-content: space-between; flex-wrap: wrap; }
          .abs-sb { display: inline-block; width: 30%; text-align: center; vertical-align: top; margin-bottom: 2px; }
          .abs-sl { border-bottom: 1px solid #000; height: 18px; margin: 8px auto 1px auto; width: 80%; }
          .abs-sn { font-weight: bold; font-size: 7.5pt; text-transform: uppercase; }
          .abs-st { font-size: 7pt; color: #333; }
          .abs-lbl { font-size: 7.5pt; font-style: italic; margin-bottom: 1px; text-align: left; }
        </style>

        <div class="abs-wrap">
          <div class="abs-title">ABSTRACT OF QUOTATION</div>

          <div style="display:flex; justify-content:space-between;">
            <div>
              <div class="abs-info"><b>AOQ No.:</b> ${abs.abstract_number || ''}</div>
            </div>
            <div>
              <div class="abs-info"><b>DATE:</b> ${fmtDate(abs.date_prepared)}</div>
            </div>
          </div>

          <table class="abs-tbl">
            <thead>
              <tr>
                <th colspan="3" class="abs-th">PARTICULARS</th>
                <th rowspan="2" class="abs-th" style="width:10%;">ABC</th>
                ${supplierHeaders}
              </tr>
              <tr>
                <th class="abs-th" style="width:5%;">Qty.</th>
                <th class="abs-th" style="width:4%;">Unit</th>
                <th class="abs-th" style="width:18%;">Items</th>
                ${supplierSubHeaders}
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
              <tr>
                <td class="abs-td"></td>
                <td class="abs-td"></td>
                <td class="abs-td" style="font-weight:bold;">PURPOSE: ${prPurpose}</td>
                <td class="abs-td"></td>
                ${purposeTotalCells}
              </tr>
            </tbody>
          </table>

          <div class="abs-cert">
            <p>We <b>CERTIFY</b> that we opened and recorded herein quotations received in respond to the RFQ.</p>
            <p>We therefore <b>RECOMMEND</b> to award to <b><u>${recommendedName}</u></b> with a total bid price of <b><u>₱${recommendedAmount}</u></b> having submitted the most responsive quotation.</p>
            <p>We also certify that the lowest and responsive quotation recommended for this award is within the ABC.</p>
          </div>

          <div class="abs-sigs">
            <div class="abs-lbl">Recommended By:</div>
            <div class="abs-sig-row">
              <div class="abs-sb"><div class="abs-sl"></div><div class="abs-sn">${bacViceChairName}</div><div class="abs-st">${bacViceChairDesignation}</div></div>
              <div class="abs-sb"><div class="abs-sl"></div><div class="abs-sn">${bacMembers[0].name}</div><div class="abs-st">${bacMembers[0].title}</div></div>
              <div class="abs-sb"><div class="abs-sl"></div><div class="abs-sn">${bacMembers[1].name}</div><div class="abs-st">${bacMembers[1].title}</div></div>
            </div>
            <div class="abs-sig-row">
              <div class="abs-sb"><div class="abs-sl"></div><div class="abs-sn">${bacMembers[2].name}</div><div class="abs-st">${bacMembers[2].title}</div></div>
              <div class="abs-sb"><div class="abs-sl"></div><div class="abs-sn">${bacSecName}</div><div class="abs-st">${bacSecTitle}</div></div>
              <div class="abs-sb"><div class="abs-sl"></div><div class="abs-sn">${bacChairName}</div><div class="abs-st">${bacChairDesignation}</div></div>
            </div>

            <div style="display:flex; justify-content:space-between; margin-top:4px;">
              <div style="width:48%;">
                <div class="abs-lbl">Approved By:</div>
                <div style="text-align:center;"><div class="abs-sl" style="width:60%; margin:8px auto 1px auto;"></div><div class="abs-sn">${rdName}</div><div class="abs-st">${rdTitle}</div></div>
              </div>
              <div style="width:48%;">
                <div class="abs-lbl">Prepared By:</div>
                <div style="text-align:center;"><div class="abs-sl" style="width:60%; margin:8px auto 1px auto;"></div><div class="abs-sn">${bacSecName}</div><div class="abs-st">${bacSecTitle}</div></div>
              </div>
            </div>
          </div>
        </div>
      `;

      const html = buildPrintHTML('Abstract of Quotation - ' + abs.abstract_number, bodyContent);
      openPrintPreview(html, { title: toFilename('AOQ_' + abs.abstract_number), pageSize: 'A4', landscape: true, editable: true });
    } catch (err) {
      console.error('Print Abstract error:', err);
      showNotification('Failed to print Abstract: ' + err.message, 'error');
    }
  };

  // Print current page/table
  window.printCurrentPage = function() {
    const currentPage = document.querySelector('.page.active');
    if (!currentPage) {
      alert('No active page to print');
      return;
    }
    
    const pageTitle = currentPage.querySelector('.form-title')?.textContent 
      || currentPage.querySelector('h2, .page-title')?.textContent 
      || 'Report';

    // --- APP page detection ---
    const isAPPPage = currentPage.id === 'app' || pageTitle.toLowerCase().includes('annual procurement');

    // For APP page, target the data-table specifically (skip division budget table)
    const table = isAPPPage
      ? (currentPage.querySelector('table.data-table') || currentPage.querySelector('table'))
      : currentPage.querySelector('table');
    if (!table) {
      alert('No table data to print');
      return;
    }
    const tableClone = table.cloneNode(true);
    const chiefDivMap = { 'chief_fad': 'FAD', 'chief_wrsd': 'WRSD', 'chief_mwpsd': 'MWPSD', 'chief_mwptd': 'MWPTD' };
    const userRole = (currentUser && currentUser.role) ? currentUser.role : '';
    const printChiefRole = getUserChiefRole();
    const isChief = !!printChiefRole;
    if (isAPPPage && isChief) {
      const chiefDiv = chiefDivMap[printChiefRole];
      // The 3rd column (index 2) is the "End-User / Implementing Unit" dept code
      // Skip total/summary rows (they use colspan)
      tableClone.querySelectorAll('tbody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        // Preserve total row — has colspan attribute on first cell
        if (cells.length > 0 && cells[0].hasAttribute('colspan')) return;
        if (cells.length > 2) {
          const deptText = (cells[2].textContent || '').trim().toUpperCase();
          if (deptText !== chiefDiv) {
            row.remove();
          }
        }
      });
    }
    
    // Remove action column (last column)
    tableClone.querySelectorAll('th:last-child').forEach(el => el.remove());
    tableClone.querySelectorAll('td:last-child').forEach(el => el.remove());

    // Remove Docs / Attached Supporting Documents column
    const allHeaders = tableClone.querySelectorAll('thead th');
    let docsColIndex = -1;
    allHeaders.forEach((th, idx) => {
      const text = th.textContent.trim().toLowerCase();
      if (text === 'docs' || text === 'attached supporting documents') {
        docsColIndex = idx;
        th.remove();
      }
    });
    if (docsColIndex >= 0) {
      tableClone.querySelectorAll('tbody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells[docsColIndex]) cells[docsColIndex].remove();
      });
    }

    // Remove any remaining attachment buttons/popovers in cells
    tableClone.querySelectorAll('button, .btn-attachment-cell, .att-popover').forEach(el => el.remove());
    
    const html = buildPrintHTML(pageTitle, `<h3>${pageTitle}</h3>${tableClone.outerHTML}`);
    const colCount = tableClone.querySelectorAll('thead th').length;
    const descriptiveFile = getDescriptiveFilename();
    openPrintPreview(html, { landscape: colCount > 7, title: descriptiveFile });
  };

  // Delete Record Function with API
  window.deleteRecord = async function(recordType, recordId) {
    const endpointMap = {
      'Item': '/items',
      'Supplier': '/suppliers',
      'User': '/users',
      'Employee': '/employees',
      'PPMP': '/plans',
      'PR': '/purchase-requests',
      'RFQ': '/rfqs',
      'Abstract': '/abstracts',
      'PostQual': '/post-qualifications',
      'BACResolution': '/bac-resolutions',
      'NOA': '/notices-of-award',
      'PO': '/purchase-orders',
      'IAR': '/iars',
      'POPacket': '/po-packets',
      'COA': '/coa-submissions',
      'PAR': '/pars',
      'PTR': '/ptrs',
      'RIS': '/ris',
      'TripTicket': '/trip-tickets',
      'StockCard': '/stock-cards',
      'PropertyCard': '/property-cards',
      'ICS': '/ics',
      'Office': '/offices',
      'Designation': '/designations',
      'Division': '/divisions',
      'FundCluster': '/fund-clusters',
      'ProcurementMode': '/procurement-modes',
      'UACSCode': '/uacs-codes',
      'UOM': '/uoms'
    };
    
    const endpoint = endpointMap[recordType];
    if (!endpoint) {
      alert(`Unknown record type: ${recordType}`);
      return;
    }
    
    try {
      await apiRequest(`${endpoint}/${recordId}`, 'DELETE');
      alert(`${recordType} deleted successfully.`);
      
      // Reload the current page data
      const refreshMap = {
        'Item': loadItems,
        'Supplier': loadSuppliers,
        'User': loadUsers,
        'Employee': loadEmployees,
        'PPMP': loadPPMP,
        'PR': loadPR,
        'RFQ': loadRFQ,
        'Abstract': loadAbstract,
        'PostQual': loadPostQual,
        'BACResolution': loadBACResolution,
        'NOA': loadNOA,
        'PO': loadPO,
        'IAR': loadIAR,
        'POPacket': loadPOPacket,
        'COA': loadCOA,
        'PAR': loadPAR,
        'PTR': loadPTR,
        'RIS': loadRIS,
        'TripTicket': loadTripTickets,
        'StockCard': loadStockCards,
        'PropertyCard': loadPropertyCards,
        'ICS': loadICS,
        'Office': loadOffices,
        'Designation': loadDesignations,
        'Division': loadDivisions,
        'FundCluster': loadFundClusters,
        'ProcurementMode': loadProcurementModes,
        'UACSCode': loadUACSCodes,
        'UOM': loadUOMs
      };
      if (refreshMap[recordType]) refreshMap[recordType]();
    } catch (err) {
      alert(`Error deleting ${recordType}: ${err.message}`);
    }
  };

  // Delete PPMP with reason (soft-delete — budget becomes available)
  window.deletePPMPWithReason = async function(planId) {
    const reason = document.getElementById('deleteReasonInput')?.value || 'Removed by user';
    try {
      const result = await apiRequest('/plans/' + planId, 'DELETE', { reason });
      alert(result.message || 'PPMP removed — budget is now available for reallocation.');
      loadPPMP();
      loadAPP(); // Refresh APP to update budget summary
    } catch (err) {
      alert('Error removing PPMP: ' + err.message);
    }
  };

  // Show removed/deleted PPMP items modal (Available Budget breakdown)
  window.showRemovedItemsModal = async function() {
    try {
      const removed = await apiRequest('/plan-items/removed');
      const fy = getCurrentFiscalYear();
      const budgetSummary = await apiRequest('/app-budget-summary?fiscal_year=' + fy);
      const totalAvailable = parseFloat(budgetSummary.available_budget || 0);

      let tableRows = '';
      if (removed.length === 0) {
        tableRows = '<tr><td colspan="6" class="text-center">No removed items. All PPMP entries are active.</td></tr>';
      } else {
        tableRows = removed.map(item => {
          const amt = parseFloat(item.total_amount || 0);
          const deletedDate = item.deleted_at ? new Date(item.deleted_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';
          return `<tr>
            <td>${item.item_code || item.ppmp_no || '-'}</td>
            <td>${item.item_name || '-'}</td>
            <td>${item.department_code || '-'}</td>
            <td style="text-align:right; font-weight:600;">₱${amt.toLocaleString('en-PH', {minimumFractionDigits:2})}</td>
            <td>${item.deleted_reason || '-'}</td>
            <td style="text-align:center;">
              <span style="font-size:11px; color:#888;">${deletedDate}</span><br>
              <button class="btn btn-sm btn-success" onclick="restorePPMP(${item.id})" title="Restore this item back to active"><i class="fas fa-undo"></i> Restore</button>
            </td>
          </tr>`;
        }).join('');
      }

      const html = `
        <div class="info-banner" style="margin-bottom:16px; background:#e8f5e9; border-left:4px solid #28a745; padding:12px 14px;">
          <i class="fas fa-coins" style="color:#28a745;"></i>
          <strong>Available Budget: ₱${totalAvailable.toLocaleString('en-PH', {minimumFractionDigits:2})}</strong><br>
          <small style="color:#555;">This is the total budget freed from ${removed.length} removed item(s). These funds can be reallocated to new or existing projects.</small>
        </div>
        <table class="data-table full-width" style="font-size:12px;">
          <thead>
            <tr>
              <th>APP/PPMP Code</th>
              <th>Description</th>
              <th>Division</th>
              <th>Freed Budget</th>
              <th>Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
        <div style="margin-top:16px; padding:10px; background:#f8f9fa; border-radius:4px; font-size:12px; color:#666;">
          <i class="fas fa-info-circle"></i> Restoring an item will move its budget back from "Available" to "Active" and reappear in the APP table.
        </div>
      `;
      openModal('Removed Items — Available Budget', html);
    } catch (err) {
      alert('Error loading removed items: ' + err.message);
    }
  };

  // Restore a soft-deleted PPMP back to active
  window.restorePPMP = async function(planId) {
    try {
      const result = await apiRequest('/plans/' + planId + '/restore', 'PUT');
      alert(result.message || 'PPMP restored successfully.');
      closeModal();
      loadPPMP();
      loadAPP();
    } catch (err) {
      alert('Error restoring item: ' + err.message);
    }
  };

  // =====================================================
  // EXPORT TO EXCEL/CSV FUNCTIONS
  // =====================================================

  // Convert data to CSV format
  function convertToCSV(data, headers) {
    const headerRow = headers.join(',');
    const rows = data.map(row => 
      headers.map(header => {
        let value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      }).join(',')
    );
    return [headerRow, ...rows].join('\n');
  }

  // Download CSV file
  function downloadCSV(csvContent, filename) {
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Document title mapping for Excel header
  function getExcelDocTitle(docType) {
    const titles = {
      'PPMP': 'PROJECT PROCUREMENT MANAGEMENT PLAN (PPMP)',
      'APP': 'ANNUAL PROCUREMENT PLAN (APP)',
      'PR': 'PURCHASE REQUESTS',
      'RFQ': 'REQUEST FOR QUOTATION',
      'Abstract': 'ABSTRACT OF QUOTATIONS',
      'PostQual': 'POST-QUALIFICATION',
      'BACRes': 'BAC RESOLUTION',
      'NOA': 'NOTICE OF AWARD',
      'PO': 'PURCHASE ORDERS',
      'IAR': 'INSPECTION AND ACCEPTANCE REPORT',
      'POPacket': 'PO PACKET',
      'COA': 'CERTIFICATE OF ACCEPTANCE',
      'Items': 'ITEMS MASTER LIST',
      'Suppliers': 'SUPPLIERS MASTER LIST',
      'Users': 'USER ACCOUNTS',
      'ICS': 'INVENTORY CUSTODIAN SLIP',
      'StockCards': 'STOCK CARDS',
      'PropertyCards': 'PROPERTY CARDS',
      'Employees': 'EMPLOYEES LIST',
      'PAR': 'PROPERTY ACKNOWLEDGEMENT RECEIPT',
      'PTR': 'PROPERTY TRANSFER REPORT',
      'RIS': 'REQUISITION AND ISSUE SLIP',
      'SuppliesLedger': 'SUPPLIES LEDGER',
      'SemiExpendable': 'SEMI-EXPENDABLE PROPERTY',
      'CapitalOutlay': 'CAPITAL OUTLAY',
      'TripTickets': 'TRIP TICKETS',
      'Divisions': 'DIVISIONS',
      'Offices': 'OFFICES',
      'Designations': 'DESIGNATIONS',
      'FundClusters': 'FUND CLUSTERS',
      'ProcurementModes': 'PROCUREMENT MODES',
      'UACSCodes': 'UACS CODES',
      'UOMs': 'UNITS OF MEASURE'
    };
    return titles[docType] || docType.toUpperCase();
  }

  // Build Excel-compatible HTML with government header & logos (matches print layout)
  function buildExcelHTML(docTitle, headers, data) {
    const colCount = headers.length;

    let tableRows = '';
    data.forEach(row => {
      tableRows += '<tr>';
      headers.forEach(h => {
        let val = row[h] || '';
        // Escape HTML entities
        val = String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        tableRows += `<td style="border:1px solid #333; padding:4px 6px; font-size:10pt; vertical-align:top; white-space:normal;">${val}</td>`;
      });
      tableRows += '</tr>';
    });

    let headerCols = '';
    headers.forEach(h => {
      headerCols += `<th style="border:1px solid #333; padding:5px 6px; font-size:9pt; font-weight:bold; text-align:center; background:#e8e8e8; text-transform:uppercase; white-space:normal;">${h}</th>`;
    });

    // Middle columns span
    const midSpan = Math.max(1, colCount - 2);

    // Use file:// URIs for local images (Excel supports these, not data: URIs)
    const dmwImgTag = dmwLogoFilePath ? `<img src="file:///${dmwLogoFilePath.replace(/\\/g, '/')}" width="90" height="90">` : '';
    const bpImgTag = bpLogoFilePath ? `<img src="file:///${bpLogoFilePath.replace(/\\/g, '/')}" width="70" height="70">` : '';

    return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>${docTitle.substring(0, 31)}</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
            <x:FitToPage/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    td, th { mso-number-format:"\\@"; }
  </style>
</head>
<body>
  <table style="border-collapse:collapse; width:100%;">
    <!-- Government Header -->
    <tr>
      <td style="text-align:center; vertical-align:middle; padding:2px 0;">${dmwImgTag}</td>
      <td colspan="${midSpan}" style="text-align:center; vertical-align:middle; padding:2px 0;">
        <div style="font-size:12pt; font-family:'Times New Roman',serif; line-height:1.1;"><em>Republic of the Philippines</em></div>
        <div style="font-size:18pt; font-family:'Old English Text MT',serif; line-height:1.1; margin:1px 0;">Department of Migrant Workers</div>
        <div style="font-size:12pt; font-weight:bold; font-family:Arial,sans-serif; line-height:1.1;">Regional Office &ndash; XIII (Caraga)</div>
        <div style="font-size:8pt; font-family:'Times New Roman',serif; color:#333; line-height:1.2; margin-top:1px;">3rd Floor Esquina Dos Building, J.C. Aquino Avenue corner Doongan Road, Butuan City, Agusan del Norte, 8600</div>
      </td>
      <td style="text-align:center; vertical-align:middle; padding:2px 0;">${bpImgTag}</td>
    </tr>
    <!-- Separator line -->
    <tr><td colspan="${colCount}" style="border-bottom:3px solid #333; height:2px; padding:0;"></td></tr>
    <!-- Document Title -->
    <tr>
      <td colspan="${colCount}" style="text-align:center; font-size:14pt; font-weight:bold; padding:4px 0; text-transform:uppercase; border-bottom:2px solid #333;">${docTitle}</td>
    </tr>
    <!-- Spacer -->
    <tr><td colspan="${colCount}" style="height:4px;"></td></tr>
    <!-- Table Header -->
    <tr>${headerCols}</tr>
    <!-- Table Data -->
    ${tableRows}
    <!-- Footer -->
    <tr><td colspan="${colCount}" style="height:15px;"></td></tr>
    <tr>
      <td colspan="${colCount}" style="text-align:center; font-size:8pt; color:#888; border-top:1px solid #ddd; padding-top:6px;">
        Generated by DMW Caraga Procurement &amp; Inventory System | ${new Date().toLocaleString('en-PH')}
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  // Download as Excel (.xls) file — writes via Node.js fs for reliable file:// image paths
  function downloadExcel(htmlContent, filename) {
    try {
      const fs = require('fs');
      const nodePath = require('path');
      const { shell } = require('electron');
      // Save to user's Downloads folder
      const downloadsDir = nodePath.join(require('os').homedir(), 'Downloads');
      const filePath = nodePath.join(downloadsDir, filename);
      fs.writeFileSync(filePath, '\ufeff' + htmlContent, 'utf-8');
      showNotification('Exported to Downloads/' + filename, 'success');
      // Open the containing folder and select the file
      shell.showItemInFolder(filePath);
    } catch (err) {
      // Fallback: blob download
      console.warn('fs write failed, using blob download:', err.message);
      const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Exported to ' + filename, 'success');
    }
  }

  // Get table data from DOM – accepts a table element OR a string ID
  function getTableData(tableOrId) {
    const table = (typeof tableOrId === 'string') ? document.getElementById(tableOrId) : tableOrId;
    if (!table) return { headers: [], data: [] };
    
    // Find the actual <table> if we were given a tbody or other child
    const tbl = table.tagName === 'TABLE' ? table : table.closest('table');
    if (!tbl) return { headers: [], data: [] };

    const headers = [];
    const skipIndices = new Set();
    const headerCells = tbl.querySelectorAll('thead th');
    headerCells.forEach((th, idx) => {
      const text = th.textContent.trim();
      const lower = text.toLowerCase();
      if (!text || lower === 'actions' || lower === 'docs' || lower === 'attached supporting documents' || lower === 'action') {
        skipIndices.add(idx);
      } else {
        headers.push(text);
      }
    });
    
    const data = [];
    // Only export visible rows (respect search/filter)
    const rows = tbl.querySelectorAll('tbody tr');
    rows.forEach(row => {
      // Skip hidden/filtered rows and "no data" placeholder rows
      if (row.style.display === 'none') return;
      if (row.querySelector('td[colspan]') && rows.length === 1) return;
      const rowData = {};
      const cells = row.querySelectorAll('td');
      let headerIdx = 0;
      cells.forEach((cell, cellIdx) => {
        if (skipIndices.has(cellIdx)) return;
        if (headerIdx < headers.length) {
          // Get clean text – strip extra whitespace, icons, button text
          let cellText = cell.textContent.trim().replace(/\s+/g, ' ');
          rowData[headers[headerIdx]] = cellText;
          headerIdx++;
        }
      });
      if (Object.keys(rowData).length > 0) data.push(rowData);
    });
    
    return { headers, data };
  }

  // Export to Excel/CSV Function
  window.exportToExcel = function(docType) {
    const timestamp = new Date().toISOString().slice(0, 10);
    const descriptiveName = getDescriptiveFilename();
    
    const tableMap = {
      'PPMP': 'ppmpTableBody',
      'APP': 'appTableBody',
      'PR': 'prTableBody',
      'RFQ': 'rfqTableBody',
      'Abstract': 'abstractTableBody',
      'PostQual': 'postQualTableBody',
      'BACRes': 'bacResolutionTableBody',
      'NOA': 'noaTableBody',
      'PO': 'poTableBody',
      'IAR': 'iarTableBody',
      'POPacket': 'poPacketTableBody',
      'COA': 'coaTableBody',
      'Items': 'itemsTableBody',
      'Suppliers': 'suppliersTableBody',
      'Users': 'usersTableBody',
      'ICS': 'icsTableBody',
      'StockCards': 'stockCardsTableBody',
      'PropertyCards': 'propertyCardsTableBody',
      'Employees': 'employeesTableBody',
      'PAR': 'parTableBody',
      'PTR': 'ptrTableBody',
      'RIS': 'risTableBody',
      'SuppliesLedger': 'suppliesLedgerTableBody',
      'SemiExpendable': 'semiExpendableTableBody',
      'CapitalOutlay': 'capitalOutlayTableBody',
      'TripTickets': 'tripTicketsTableBody',
      'Divisions': 'divisionsTableBody',
      'Offices': 'officesTableBody',
      'Designations': 'designationsTableBody',
      'FundClusters': 'fundClustersTableBody',
      'ProcurementModes': 'procurementModesTableBody',
      'UACSCodes': 'uacsCodesTableBody',
      'UOMs': 'uomsTableBody'
    };
    
    let headers = [];
    let data = [];

    // Get data directly from the visible table
    const tableBodyId = tableMap[docType];
    if (tableBodyId) {
      const tbody = document.getElementById(tableBodyId);
      if (tbody) {
        const table = tbody.closest('table');
        if (table) {
          const result = getTableData(table);
          headers = result.headers;
          data = result.data;
        }
      }
    }
    
    // If still no data, try finding the table on the active page directly
    if (data.length === 0) {
      const activePage = document.querySelector('.page.active');
      if (activePage) {
        const table = activePage.querySelector('table');
        if (table) {
          const result = getTableData(table);
          headers = result.headers;
          data = result.data;
        }
      }
    }

    if (data.length === 0) {
      alert('No data to export. The table is empty.');
      return;
    }

    // Check the selected format from the export modal
    const formatSelect = document.querySelector('#exportFormatSelect');
    const format = formatSelect ? formatSelect.value : 'xlsx';

    if (format === 'csv') {
      const csvContent = convertToCSV(data, headers);
      downloadCSV(csvContent, `${descriptiveName}_${timestamp}.csv`);
    } else {
      // Excel with government header and logos
      const docTitle = getExcelDocTitle(docType);
      const excelHtml = buildExcelHTML(docTitle, headers, data);
      downloadExcel(excelHtml, `${descriptiveName}_${timestamp}.xls`);
    }
  };

  // Export current page data 
  window.exportCurrentPage = function() {
    const currentPage = document.querySelector('.page.active');
    if (!currentPage) {
      alert('No active page to export');
      return;
    }
    
    const pageId = currentPage.id;
    const docTypeMap = {
      'ppmp': 'PPMP',
      'app': 'APP',
      'purchase-requests': 'PR',
      'rfq': 'RFQ',
      'abstract': 'Abstract',
      'post-qual': 'PostQual',
      'bac-resolution': 'BACRes',
      'noa': 'NOA',
      'purchase-orders': 'PO',
      'iar': 'IAR',
      'po-packet': 'POPacket',
      'coa': 'COA',
      'items': 'Items',
      'suppliers': 'Suppliers',
      'users': 'Users',
      'ics': 'ICS',
      'stock-cards': 'StockCards',
      'property-cards': 'PropertyCards',
      'employees': 'Employees',
      'par': 'PAR',
      'ptr': 'PTR',
      'ris': 'RIS',
      'supplies-ledger': 'SuppliesLedger',
      'semi-expendable': 'SemiExpendable',
      'capital-outlay': 'CapitalOutlay',
      'trip-tickets': 'TripTickets',
      'divisions': 'Divisions',
      'offices': 'Offices',
      'designations': 'Designations',
      'fund-clusters': 'FundClusters',
      'procurement-modes': 'ProcurementModes',
      'uacs-codes': 'UACSCodes',
      'uoms': 'UOMs'
    };
    
    const docType = docTypeMap[pageId] || pageId;
    exportToExcel(docType);
  };

  // Expose closeModal to window for inline onclick handlers
  window.closeModal = closeModal;
  window.navigateTo = navigateTo;
  
  // Direct login function with API authentication
  window.doLogin = async function() {
    const username = document.getElementById('username')?.value?.trim();
    const password = document.getElementById('password')?.value;
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');
    
    // Validate inputs
    if (!username || !password) {
      if (loginError) {
        loginError.textContent = 'Please enter username and password';
        loginError.style.display = 'block';
      }
      return;
    }
    
    // Disable button and show loading
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    }
    if (loginError) loginError.style.display = 'none';

    try {
      // Attempt API login
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      authToken = data.token;
      currentUser = {
        id: data.user.id,
        username: data.user.username || username,
        name: data.user.full_name || username,
        email: data.user.email || '',
        role: data.user.role,
        roles: data.user.roles || [data.user.role],
        division: data.user.department_code || data.user.department || '',
        department: data.user.department || '',
        department_code: data.user.department_code || '',
        dept_id: data.user.dept_id || null,
        designation: data.user.designation || ''
      };
      
      // Persist session to sessionStorage
      sessionStorage.setItem('dmw_user', JSON.stringify(currentUser));
      sessionStorage.setItem('dmw_token', authToken);
      
      console.log('Login successful:', currentUser);
      
      // Use showApp() which handles overlay, user info, RBAC, and navigation
      showApp();
      
    } catch (err) {
      console.error('Login error:', err);
      if (loginError) {
        loginError.textContent = err.message || 'Unable to connect to server';
        loginError.style.display = 'block';
      }
    } finally {
      // Re-enable button
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
      }
    }
  };

  // Toggle between login and signup forms (slider animation)
  window.toggleAuthForm = function(form) {
    const slider = document.getElementById('authFormsSlider');
    const tabs = document.querySelector('.auth-tabs');
    const tabSignIn = document.getElementById('tabSignIn');
    const tabSignUp = document.getElementById('tabSignUp');
    const welcomeTitle = document.getElementById('authWelcomeTitle');
    const welcomeSub = document.getElementById('authWelcomeSub');
    const loginError = document.getElementById('loginError');
    const signupError = document.getElementById('signupError');
    const signupSuccess = document.getElementById('signupSuccess');

    // Clear any errors/messages
    if (loginError) loginError.style.display = 'none';
    if (signupError) signupError.style.display = 'none';
    if (signupSuccess) signupSuccess.style.display = 'none';

    if (form === 'signup') {
      if (slider) slider.classList.add('slide-signup');
      if (tabs) tabs.classList.add('signup');
      if (tabSignIn) tabSignIn.classList.remove('active');
      if (tabSignUp) tabSignUp.classList.add('active');
      if (welcomeTitle) welcomeTitle.textContent = 'Create Account';
      if (welcomeSub) welcomeSub.textContent = 'Register a new account to get started';
    } else {
      if (slider) slider.classList.remove('slide-signup');
      if (tabs) tabs.classList.remove('signup');
      if (tabSignIn) tabSignIn.classList.add('active');
      if (tabSignUp) tabSignUp.classList.remove('active');
      if (welcomeTitle) welcomeTitle.textContent = 'Welcome Back';
      if (welcomeSub) welcomeSub.textContent = 'Sign in to access the procurement system';
    }
  };

  // Signup function
  // Real-time password strength checker for signup form
  window.checkPasswordStrength = function(pwd) {
    const container = document.getElementById('pwdStrengthContainer');
    const fill = document.getElementById('pwdStrengthFill');
    const label = document.getElementById('pwdStrengthLabel');
    if (!container || !fill || !label) return;

    // Show/hide
    container.style.display = pwd.length > 0 ? 'flex' : 'none';

    // Requirements
    const checks = {
      length:  pwd.length >= 8,
      upper:   /[A-Z]/.test(pwd),
      lower:   /[a-z]/.test(pwd),
      number:  /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd)
    };

    // Update requirement indicators
    const reqMap = { length: 'pwdReqLength', upper: 'pwdReqUpper', lower: 'pwdReqLower', number: 'pwdReqNumber', special: 'pwdReqSpecial' };
    Object.keys(reqMap).forEach(key => {
      const el = document.getElementById(reqMap[key]);
      if (el) el.classList.toggle('met', checks[key]);
    });

    // Score
    const passed = Object.values(checks).filter(Boolean).length;
    const levels = [
      { min: 0, label: 'Too Weak', color: '#e53e3e', width: '10%' },
      { min: 1, label: 'Weak',     color: '#e53e3e', width: '25%' },
      { min: 2, label: 'Fair',     color: '#dd6b20', width: '45%' },
      { min: 3, label: 'Good',     color: '#d69e2e', width: '65%' },
      { min: 4, label: 'Strong',   color: '#38a169', width: '85%' },
      { min: 5, label: 'Excellent',color: '#276749', width: '100%' }
    ];
    const level = levels[passed];
    fill.style.width = level.width;
    fill.style.background = level.color;
    label.textContent = level.label;
    label.style.color = level.color;
  };

  window.doSignup = async function() {
    const fullName = document.getElementById('signupFullName')?.value?.trim();
    const username = document.getElementById('signupUsername')?.value?.trim();
    const email = document.getElementById('signupEmail')?.value?.trim();
    const password = document.getElementById('signupPassword')?.value;
    const division = document.getElementById('signupDivision')?.value || '';
    const signupBtn = document.getElementById('signupBtn');
    const signupError = document.getElementById('signupError');
    const signupSuccess = document.getElementById('signupSuccess');
    
    // Validate inputs
    if (!fullName || !username || !password) {
      if (signupError) {
        signupError.textContent = 'Please fill in all required fields';
        signupError.style.display = 'block';
      }
      return;
    }
    
    // Enforce strong password
    const pwdChecks = {
      length:  password.length >= 8,
      upper:   /[A-Z]/.test(password),
      lower:   /[a-z]/.test(password),
      number:  /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
    const pwdPassed = Object.values(pwdChecks).filter(Boolean).length;
    if (pwdPassed < 4) {
      const missing = [];
      if (!pwdChecks.length)  missing.push('at least 8 characters');
      if (!pwdChecks.upper)   missing.push('an uppercase letter');
      if (!pwdChecks.lower)   missing.push('a lowercase letter');
      if (!pwdChecks.number)  missing.push('a number');
      if (!pwdChecks.special) missing.push('a special character');
      if (signupError) {
        signupError.textContent = 'Password needs: ' + missing.join(', ');
        signupError.style.display = 'block';
      }
      return;
    }
    
    // Disable button and show loading
    if (signupBtn) {
      signupBtn.disabled = true;
      signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    }
    if (signupError) signupError.style.display = 'none';
    if (signupSuccess) signupSuccess.style.display = 'none';

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, full_name: fullName, email, division })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }
      
      // Show success message
      if (signupSuccess) {
        signupSuccess.textContent = 'Account created successfully! Redirecting...';
        signupSuccess.style.display = 'block';
      }
      
      // Auto-login with the new account
      authToken = data.token;
      currentUser = {
        id: data.user.id,
        username: data.user.username || username,
        name: data.user.full_name || username,
        email: data.user.email || '',
        role: data.user.role,
        roles: data.user.roles || [data.user.role],
        division: data.user.department_code || data.user.department || '',
        department: data.user.department || '',
        department_code: data.user.department_code || '',
        dept_id: data.user.dept_id || null,
        designation: data.user.designation || ''
      };
      
      // Wait a moment then proceed to app
      setTimeout(() => {
        showApp();
      }, 1500);
      
    } catch (err) {
      console.error('Signup error:', err);
      if (signupError) {
        signupError.textContent = err.message || 'Unable to create account';
        signupError.style.display = 'block';
      }
    } finally {
      // Re-enable button
      if (signupBtn) {
        signupBtn.disabled = false;
        signupBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
      }
    }
  };

  // ========================================
  // REPORT GENERATION FUNCTIONS
  // ========================================

  // Notification Panel
  // ========================================
  // Real-time Notification Engine
  // ========================================

  let notificationPollTimer = null;
  let notificationsCache = [];
  let notificationPanelOpen = false;

  // Toggle notification dropdown
  window.toggleNotificationPanel = function() {
    const panel = document.getElementById('notificationPanel');
    if (!panel) return;
    notificationPanelOpen = !notificationPanelOpen;
    if (notificationPanelOpen) {
      panel.classList.add('open');
      loadNotifications();
    } else {
      panel.classList.remove('open');
    }
  };

  // Close panel when clicking outside
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('notificationPanel');
    const bell = document.getElementById('notificationBell');
    if (panel && notificationPanelOpen && !panel.contains(e.target) && !bell.contains(e.target)) {
      notificationPanelOpen = false;
      panel.classList.remove('open');
    }
  });

  // Fetch notifications from API
  async function loadNotifications() {
    const listEl = document.getElementById('notificationList');
    if (!listEl) return;
    
    // Show loading on first load
    if (notificationsCache.length === 0) {
      listEl.innerHTML = '<div class="notif-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    }

    try {
      const data = await apiRequest('/notifications?limit=50');
      notificationsCache = data;
      renderNotifications(data);
      updateNotificationBadge(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      if (notificationsCache.length === 0) {
        listEl.innerHTML = '<div class="notification-empty"><i class="fas fa-exclamation-triangle"></i><p>Could not load notifications</p></div>';
      }
    }
  }

  // Fetch unread count only (lightweight poll)
  async function pollNotificationCount() {
    try {
      const data = await apiRequest('/notifications/count');
      const badge = document.getElementById('notificationCount');
      if (badge) {
        if (data.count > 0) {
          badge.textContent = data.count > 99 ? '99+' : data.count;
          badge.style.display = 'block';
        } else {
          badge.style.display = 'none';
        }
      }
      // If panel is open, refresh the full list
      if (notificationPanelOpen) {
        loadNotifications();
      }
    } catch (err) {
      // Silently fail on poll — don't spam errors
    }
  }

  // Render notification items
  function renderNotifications(notifications) {
    const listEl = document.getElementById('notificationList');
    const footerText = document.getElementById('notifFooterText');
    if (!listEl) return;

    if (!notifications || notifications.length === 0) {
      listEl.innerHTML = '<div class="notification-empty"><i class="fas fa-bell-slash"></i><p>No notifications</p></div>';
      if (footerText) footerText.textContent = 'No new notifications';
      return;
    }

    const unreadCount = notifications.filter(n => !n.is_read).length;
    if (footerText) {
      footerText.textContent = unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up';
    }

    listEl.innerHTML = notifications.map(n => {
      const typeClass = n.type || 'info';
      const iconClass = n.icon || 'fas fa-bell';
      const isUnread = !n.is_read ? ' unread' : '';
      const timeAgo = formatTimeAgo(n.created_at);
      return `
        <div class="notif-item${isUnread}" data-id="${n.id}" onclick="window.handleNotificationClick(${n.id}, '${n.reference_type || ''}', '${n.reference_code || ''}')">
          <div class="notif-item-icon ${typeClass}">
            <i class="${iconClass}"></i>
          </div>
          <div class="notif-item-content">
            <div class="notif-item-title">${escapeHtml(n.title)}</div>
            <div class="notif-item-message">${escapeHtml(n.message || '')}</div>
            <div class="notif-item-time">${timeAgo}</div>
          </div>
          <button class="notif-item-dismiss" onclick="event.stopPropagation(); window.dismissNotification(${n.id})" title="Dismiss">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
    }).join('');
  }

  // Format time ago
  function formatTimeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay} days ago`;
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Escape HTML to prevent XSS
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Handle notification click — mark read + navigate
  window.handleNotificationClick = async function(id, refType, refCode) {
    try {
      await apiRequest(`/notifications/${id}/read`, 'PUT');
    } catch (e) { /* ignore */ }

    // Navigate to the relevant page based on reference type
    const pageMap = {
      'purchase_request': 'purchase-requests',
      'purchase_order': 'purchase-orders',
      'iar': 'iar',
      'rfq': 'rfq',
      'abstract': 'abstract',
      'noa': 'noa',
      'bac_resolution': 'bac-resolution',
      'ppmp': 'ppmp',
      'app': 'app',
      'coa': 'coa',
      'trip_ticket': 'trip-tickets'
    };

    if (refType && pageMap[refType]) {
      notificationPanelOpen = false;
      document.getElementById('notificationPanel')?.classList.remove('open');
      navigateTo(pageMap[refType]);
    }

    // Refresh badge
    pollNotificationCount();
  };

  // Mark all as read
  window.markAllNotificationsRead = async function() {
    try {
      await apiRequest('/notifications/read-all', 'PUT');
      // Update local cache
      notificationsCache.forEach(n => n.is_read = true);
      renderNotifications(notificationsCache);
      updateNotificationBadge(notificationsCache);
      showNotification('All notifications marked as read', 'success');
    } catch (err) {
      showNotification('Failed to mark notifications as read', 'error');
    }
  };

  // Clear all notifications
  window.clearAllNotifications = async function() {
    try {
      await apiRequest('/notifications', 'DELETE');
      notificationsCache = [];
      renderNotifications([]);
      updateNotificationBadge([]);
      showNotification('All notifications cleared', 'success');
    } catch (err) {
      showNotification('Failed to clear notifications', 'error');
    }
  };

  // Dismiss single notification
  window.dismissNotification = async function(id) {
    try {
      await apiRequest(`/notifications/${id}`, 'DELETE');
      notificationsCache = notificationsCache.filter(n => n.id !== id);
      renderNotifications(notificationsCache);
      updateNotificationBadge(notificationsCache);
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  // Update the badge counter
  function updateNotificationBadge(notifications) {
    const badge = document.getElementById('notificationCount');
    if (!badge) return;
    const unread = notifications.filter(n => !n.is_read).length;
    if (unread > 0) {
      badge.textContent = unread > 99 ? '99+' : unread;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }

  // Start real-time polling (every 30 seconds)
  function startNotificationPolling() {
    if (notificationPollTimer) clearInterval(notificationPollTimer);
    // Initial load
    pollNotificationCount();
    // Poll every 30 seconds
    notificationPollTimer = setInterval(pollNotificationCount, 30000);
  }

  // Stop polling (on logout)
  function stopNotificationPolling() {
    if (notificationPollTimer) {
      clearInterval(notificationPollTimer);
      notificationPollTimer = null;
    }
    notificationsCache = [];
    const badge = document.getElementById('notificationCount');
    if (badge) badge.style.display = 'none';
  }

  // =====================================================
  // REPORT GENERATION FUNCTIONS
  // =====================================================
  
  // Generate and download report 
  window.downloadReport = function(reportType, format) {
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${reportType}_Report_${timestamp}`;
    
    // Get report data based on type
    const reportData = getReportData(reportType);
    
    if (format === 'excel' || format === 'csv') {
      const csvContent = convertToCSV(reportData.data, reportData.headers);
      downloadCSV(csvContent, filename + '.csv');
    } else if (format === 'pdf') {
      // For PDF, open print dialog
      printReport(reportType, reportData);
    }
    
    closeModal();
  };
  
  // Get report data based on report type — fully dynamic from cached DB data
  function getReportData(reportType) {
    const fmt = v => v != null ? '₱' + Number(v).toLocaleString('en-PH', {minimumFractionDigits:2, maximumFractionDigits:2}) : '₱0.00';
    const fmtDate = d => d ? new Date(d).toLocaleDateString('en-PH') : '-';
    const daysBetween = (a,b) => { if(!a||!b) return '-'; const ms = new Date(b)-new Date(a); return Math.max(0,Math.round(ms/86400000)); };

    const reports = {
      'PPMP': {
        title: 'PPMP Summary Report',
        headers: ['PPMP No', 'Description', 'Division', 'Category', 'Qty', 'Mode', 'Schedule', 'Est. Budget', 'Status'],
        data: (window._ppmpData || []).map(p => ({
          'PPMP No': p.ppmp_number || p.code || '-',
          'Description': p.description || p.item_description || '-',
          'Division': p.department_name || p.division || '-',
          'Category': p.category_name || p.category || '-',
          'Qty': (p.quantity || p.total_quantity || '-') + (p.unit ? ' ' + p.unit : ''),
          'Mode': p.procurement_mode_name || p.mode_of_procurement || '-',
          'Schedule': p.schedule || p.milestone || '-',
          'Est. Budget': fmt(p.estimated_budget || p.total_amount),
          'Status': p.status || '-'
        }))
      },
      'APP': {
        title: 'Annual Procurement Plan Report',
        headers: ['APP Code', 'Project', 'Mode', 'ABC', 'Schedule', 'Status'],
        data: (window._ppmpData || []).filter(p => (p.status||'').toLowerCase().includes('app') || (p.status||'').toLowerCase() === 'approved').map(p => ({
          'APP Code': p.ppmp_number || p.code || '-',
          'Project': p.description || p.item_description || '-',
          'Mode': p.procurement_mode_name || p.mode_of_procurement || '-',
          'ABC': fmt(p.estimated_budget || p.total_amount),
          'Schedule': p.schedule || p.milestone || '-',
          'Status': p.status || 'Active'
        }))
      },
      'PR': {
        title: 'PR Status Report',
        headers: ['PR No', 'Date', 'Description', 'Division', 'Amount', 'Status'],
        data: (cachedPR || []).map(p => ({
          'PR No': p.pr_number || '-',
          'Date': fmtDate(p.pr_date || p.created_at),
          'Description': p.purpose || p.first_item_name || '-',
          'Division': p.department_name || p.division || '-',
          'Amount': fmt(p.total_amount),
          'Status': p.workflow_status || p.status || '-'
        }))
      },
      'SVPLifecycle': {
        title: 'SVP Lifecycle Report',
        headers: ['PR No', 'PR Date', 'RFQ Date', 'Abstract Date', 'PO Date', 'IAR Date', 'Total Days'],
        data: (cachedPR || []).map(pr => {
          const rfq = (cachedRFQ || []).find(r => r.pr_id === pr.id);
          const abs = (cachedAbstract || []).find(a => a.rfq_id === (rfq||{}).id);
          const po = (cachedPO || []).find(o => o.pr_id === pr.id || o.abstract_id === (abs||{}).id);
          const iar = (cachedIAR || []).find(i => i.po_id === (po||{}).id);
          const startDate = pr.pr_date || pr.created_at;
          const endDate = iar ? (iar.iar_date || iar.created_at) : (po ? (po.po_date || po.created_at) : null);
          return {
            'PR No': pr.pr_number || '-',
            'PR Date': fmtDate(pr.pr_date || pr.created_at),
            'RFQ Date': rfq ? fmtDate(rfq.rfq_date || rfq.created_at) : '-',
            'Abstract Date': abs ? fmtDate(abs.abstract_date || abs.created_at) : '-',
            'PO Date': po ? fmtDate(po.po_date || po.created_at) : '-',
            'IAR Date': iar ? fmtDate(iar.iar_date || iar.created_at) : '-',
            'Total Days': daysBetween(startDate, endDate) + (endDate ? '' : ' (ongoing)')
          };
        })
      },
      'TimelineKPI': {
        title: 'Timeline KPI Report',
        headers: ['KPI Metric', 'Value'],
        data: (() => {
          const totalPR = (cachedPR||[]).length;
          const totalRFQ = (cachedRFQ||[]).length;
          const totalPO = (cachedPO||[]).length;
          const totalIAR = (cachedIAR||[]).length;
          const completedIAR = (cachedIAR||[]).filter(i => (i.status||'').toLowerCase()==='completed' || (i.workflow_status||'').toLowerCase()==='completed').length;
          return [
            { 'KPI Metric': 'Total Purchase Requests', 'Value': String(totalPR) },
            { 'KPI Metric': 'Total RFQs Created', 'Value': String(totalRFQ) },
            { 'KPI Metric': 'Total Purchase Orders', 'Value': String(totalPO) },
            { 'KPI Metric': 'Total IARs', 'Value': String(totalIAR) },
            { 'KPI Metric': 'Completed IARs', 'Value': totalIAR > 0 ? completedIAR + ' (' + Math.round(completedIAR/totalIAR*100) + '%)' : '0' }
          ];
        })()
      },
      'PhilGEPS': {
        title: 'PhilGEPS Compliance Report',
        headers: ['RFQ No', 'ABC', 'PhilGEPS Required', 'Status'],
        data: (cachedRFQ || []).map(r => ({
          'RFQ No': r.rfq_number || '-',
          'ABC': fmt(r.abc_amount || r.total_amount),
          'PhilGEPS Required': r.philgeps_required ? 'Yes' : 'No',
          'Status': r.workflow_status || r.status || '-'
        }))
      },
      'COA': {
        title: 'COA Submission Report',
        headers: ['PO No', 'Supplier', 'Amount', 'PO Date', 'Status'],
        data: (cachedPO || []).map(p => ({
          'PO No': p.po_number || '-',
          'Supplier': p.supplier_name || '-',
          'Amount': fmt(p.total_amount || p.grand_total),
          'PO Date': fmtDate(p.po_date || p.created_at),
          'Status': p.workflow_status || p.status || '-'
        }))
      },
      'AuditTrail': {
        title: 'Audit Trail Report',
        headers: ['Date/Time', 'User', 'Action', 'Module', 'Details'],
        data: [] // Audit trail requires a dedicated API endpoint — no mock data
      }
    };

    return reports[reportType] || { title: reportType, headers: ['Data'], data: [] };
  }
  
  // Print formatted report
  function printReport(reportType, reportData) {
    const today = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    
    let tableRows = '';
    reportData.data.forEach(row => {
      tableRows += '<tr>';
      reportData.headers.forEach(header => {
        tableRows += `<td>${row[header] || ''}</td>`;
      });
      tableRows += '</tr>';
    });
    
    const bodyContent = `
      <div class="report-title">${reportData.title}</div>
      <div class="report-date">As of ${today}</div>
      <table>
        <thead><tr>${reportData.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;
    
    const html = buildPrintHTML(reportData.title, bodyContent);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  }
  
  window.generatePPMPReport = async function() {
    await ensureDivisionsLoaded();
    showModal('PPMP Summary Report', `
      <div class="view-details">
        <div class="form-grid">
          <div class="form-group">
            <label>Fiscal Year</label>
            <select class="form-select" id="ppmpReportYear">
              ${getFiscalYearOptions('')}
            </select>
          </div>
          <div class="form-group">
            <label>Division</label>
            <select class="form-select">
              <option value="all">All Divisions</option>
              ${buildDivisionOptions('', false)}
            </select>
          </div>
          <div class="form-group">
            <label>Format</label>
            <select class="form-select" id="ppmpReportFormat">
              <option value="pdf">PDF</option>
              <option value="excel">Excel (NGPA Form)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Include</label>
            <div>
              <label class="checkbox-label"><input type="checkbox" checked> Approved Items</label>
              <label class="checkbox-label"><input type="checkbox" checked> Pending Items</label>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="downloadReport('PPMP', document.getElementById('ppmpReportFormat').value);">
            <i class="fas fa-file-download"></i> Generate Report
          </button>
        </div>
      </div>
    `);
  };

  window.generateAPPReport = async function() {
    await ensureProcModesLoaded();
    showModal('APP Report', `
      <div class="view-details">
        <div class="form-grid">
          <div class="form-group">
            <label>Fiscal Year</label>
            <select class="form-select">
              ${getFiscalYearOptions('')}
            </select>
          </div>
          <div class="form-group">
            <label>APP Type</label>
            <select class="form-select">
              <option value="indicative">Indicative APP</option>
              <option value="final">Final APP</option>
              <option value="updated">Updated APP</option>
            </select>
          </div>
          <div class="form-group">
            <label>Procurement Mode</label>
            <select class="form-select">
              <option value="all">All Modes</option>
              ${buildProcModeOptions('')}
            </select>
          </div>
          <div class="form-group">
            <label>Format</label>
            <select class="form-select" id="appReportFormat">
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="downloadReport('APP', document.getElementById('appReportFormat').value);">
            <i class="fas fa-file-download"></i> Generate Report
          </button>
        </div>
      </div>
    `);
  };

  window.generatePRStatusReport = async function() {
    await ensureDivisionsLoaded();
    showModal('PR Status Report', `
      <div class="view-details">
        <div class="form-grid">
          <div class="form-group">
            <label>Date Range</label>
            <div style="display:flex;gap:10px;">
              <input type="date" class="form-input" value="${getCurrentFiscalYear()}-01-01">
              <span>to</span>
              <input type="date" class="form-input" value="${getCurrentFiscalYear()}-12-31">
            </div>
          </div>
          <div class="form-group">
            <label>Status Filter</label>
            <select class="form-select">
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div class="form-group">
            <label>Division</label>
            <select class="form-select">
              <option value="all">All Divisions</option>
              ${buildDivisionOptions('', false)}
            </select>
          </div>
          <div class="form-group">
            <label>Include Timeline Compliance</label>
            <select class="form-select">
              <option value="yes">Yes - Show 15-day compliance</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="downloadReport('PR', 'excel');">
            <i class="fas fa-file-download"></i> Generate Report
          </button>
        </div>
      </div>
    `);
  };

  window.generateSVPLifecycleReport = function() {
    showModal('SVP Lifecycle Report', `
            <div style="display:flex;gap:10px;">
              <input type="date" class="form-input" value="${getCurrentFiscalYear()}-01-01">
              <span>to</span>
              <input type="date" class="form-input" value="${getCurrentFiscalYear()}-12-31">
            </div>
          </div>
          <div class="form-group">
            <label>Current Stage</label>
            <select class="form-select">
              <option value="all">All Stages</option>
              <option value="pr">At PR Stage</option>
              <option value="rfq">At RFQ Stage</option>
              <option value="abstract">At Abstract Stage</option>
              <option value="postqual">At Post-Qual</option>
              <option value="noa">At NOA Stage</option>
              <option value="po">At PO Stage</option>
              <option value="iar">At IAR Stage</option>
              <option value="coa">Submitted to COA</option>
            </select>
          </div>
          <div class="form-group">
            <label>Show Aging</label>
            <select class="form-select">
              <option value="yes">Yes - Days at each stage</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="downloadReport('SVPLifecycle', 'excel');">
            <i class="fas fa-file-download"></i> Generate Report
          </button>
        </div>
      </div>
    `);
  };

  window.generateTimelineKPIReport = function() {
    showModal('Timeline KPI Report', `
      <div class="view-details">
        <div class="info-banner" style="margin-bottom:15px;">
          <i class="fas fa-info-circle"></i>
          KPIs based on Memo dated 14 November 2025 timelines
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Reporting Period</label>
            <select class="form-select">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <div class="form-group">
            <label>Year</label>
            <select class="form-select">
              ${getFiscalYearOptions('')}
            </select>
          </div>
          <div class="form-group">
            <label>KPI Metrics</label>
            <div>
              <label class="checkbox-label"><input type="checkbox" checked> % PRs ≥15 days prior</label>
              <label class="checkbox-label"><input type="checkbox" checked> Avg days PR-to-NOA</label>
              <label class="checkbox-label"><input type="checkbox" checked> % Complete IARs</label>
              <label class="checkbox-label"><input type="checkbox" checked> % COA ≤5 days post-PO</label>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="downloadReport('TimelineKPI', 'excel');">
            <i class="fas fa-file-download"></i> Generate Report
          </button>
        </div>
      </div>
    `);
  };

  window.generatePhilGEPSReport = function() {
    showModal('PhilGEPS Compliance Report', `
      <div class="view-details">
        <div class="form-grid">
          <div class="form-group">
            <label>Date Range</label>
            <div style="display:flex;gap:10px;">
              <input type="date" class="form-input" value="${getCurrentFiscalYear()}-01-01">
              <span>to</span>
              <input type="date" class="form-input" value="${getCurrentFiscalYear()}-12-31">
            </div>
          </div>
          <div class="form-group">
            <label>ABC Threshold</label>
            <select class="form-select">
              <option value="200000">≥ ₱200,000 (Required)</option>
              <option value="all">All Amounts</option>
            </select>
          </div>
          <div class="form-group">
            <label>Posting Status</label>
            <select class="form-select">
              <option value="all">All</option>
              <option value="posted">Posted Only</option>
              <option value="pending">Pending Posting</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="downloadReport('PhilGEPS', 'excel');">
            <i class="fas fa-file-download"></i> Generate Report
          </button>
        </div>
      </div>
    `);
  };

  window.generateCOASubmissionReport = function() {
    showModal('COA Submission Report', `
      <div class="view-details">
        <div class="form-grid">
          <div class="form-group">
            <label>Date Range</label>
            <div style="display:flex;gap:10px;">
              <input type="date" class="form-input" value="${getCurrentFiscalYear()}-01-01">
              <span>to</span>
              <input type="date" class="form-input" value="${getCurrentFiscalYear()}-12-31">
            </div>
          </div>
          <div class="form-group">
            <label>Submission Status</label>
            <select class="form-select">
              <option value="all">All</option>
              <option value="submitted">Submitted to COA</option>
              <option value="pending">Pending Submission</option>
              <option value="compliant">≤5 Days (Compliant)</option>
              <option value="noncompliant">>5 Days (Non-Compliant)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Packet Completeness</label>
            <select class="form-select">
              <option value="all">All</option>
              <option value="complete">Complete Packets</option>
              <option value="incomplete">Incomplete Packets</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="downloadReport('COA', 'excel');">
            <i class="fas fa-file-download"></i> Generate Report
          </button>
        </div>
      </div>
    `);
  };

  window.generateAuditTrailReport = function() {
    showModal('Audit Trail Report', `
      <div class="view-details">
        <div class="form-grid">
          <div class="form-group">
            <label>Date Range</label>
            <div style="display:flex;gap:10px;">
              <input type="date" class="form-input" value="${getCurrentFiscalYear()}-01-01">
              <span>to</span>
              <input type="date" class="form-input" value="${getCurrentFiscalYear()}-12-31">
            </div>
          </div>
          <div class="form-group">
            <label>User Filter</label>
            <select class="form-select">
              <option value="all">All Users</option>
              <option value="admin">Admin Only</option>
              <option value="bac">BAC Members</option>
              <option value="supply">Supply Officers</option>
            </select>
          </div>
          <div class="form-group">
            <label>Action Type</label>
            <select class="form-select">
              <option value="all">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="approve">Approve/Sign</option>
              <option value="print">Print</option>
            </select>
          </div>
          <div class="form-group">
            <label>Document Type</label>
            <select class="form-select">
              <option value="all">All Documents</option>
              <option value="ppmp">PPMP</option>
              <option value="pr">Purchase Requests</option>
              <option value="po">Purchase Orders</option>
              <option value="iar">IARs</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="downloadReport('AuditTrail', 'excel');">
            <i class="fas fa-file-download"></i> Generate Report
          </button>
        </div>
      </div>
    `);
  };

  // ==================== INVENTORY REPORT FUNCTIONS ====================

  window.generateStockLevelReport = async function() {
    openModal('Current Stock Levels Report', `
      <div class="view-details">
        <div id="stockLevelReportContent"><p><i class="fas fa-spinner fa-spin"></i> Loading stock data...</p></div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeModal()">Close</button>
          <button class="btn btn-primary" onclick="downloadReport('StockLevels', 'excel')"><i class="fas fa-file-download"></i> Export</button>
        </div>
      </div>
    `);
    try {
      const items = await apiRequest('/items');
      const stockItems = items.filter(i => (i.category || '').toLowerCase() !== 'services');
      const reportEl = document.getElementById('stockLevelReportContent');
      reportEl.innerHTML = `
        <table class="data-table"><thead><tr><th>Stock No</th><th>Item</th><th>Category</th><th>Qty</th><th>Reorder Pt</th><th>Status</th></tr></thead>
        <tbody>${stockItems.map(i => {
          const qty = parseInt(i.quantity) || 0;
          const rp = parseInt(i.reorder_point) || 0;
          let status = 'In Stock', cls = 'in-stock';
          if (qty === 0) { status = 'Out'; cls = 'out-of-stock'; }
          else if (qty <= rp) { status = 'Low'; cls = 'low-stock'; }
          return `<tr><td>${i.stock_no || '-'}</td><td>${i.name}</td><td>${i.category}</td><td>${qty}</td><td>${rp}</td><td><span class="stock-badge ${cls}">${status}</span></td></tr>`;
        }).join('')}</tbody></table>
      `;
    } catch(err) { document.getElementById('stockLevelReportContent').innerHTML = '<p>Error loading data.</p>'; }
  };

  window.generatePropertyAccountabilityReport = async function() {
    openModal('Property Accountability Report', `
      <div class="view-details">
        <div id="propAcctReportContent"><p><i class="fas fa-spinner fa-spin"></i> Loading property data...</p></div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeModal()">Close</button>
          <button class="btn btn-primary" onclick="downloadReport('PropertyAccountability', 'excel')"><i class="fas fa-file-download"></i> Export</button>
        </div>
      </div>
    `);
    try {
      const cards = await apiRequest('/property-cards');
      const reportEl = document.getElementById('propAcctReportContent');
      reportEl.innerHTML = `
        <table class="data-table"><thead><tr><th>Property No</th><th>Description</th><th>Cost</th><th>Custodian</th><th>Dept</th><th>Status</th></tr></thead>
        <tbody>${cards.map(c => `<tr><td>${c.property_number}</td><td>${c.description}</td><td>₱${parseFloat(c.acquisition_cost||0).toLocaleString()}</td><td>${c.custodian_name||'-'}</td><td>${c.department_name||'-'}</td><td>${c.status}</td></tr>`).join('')}</tbody></table>
      `;
    } catch(err) { document.getElementById('propAcctReportContent').innerHTML = '<p>Error loading data.</p>'; }
  };

  window.generateICSSummaryReport = async function() {
    openModal('ICS Summary Report', `
      <div class="view-details">
        <div id="icsReportContent"><p><i class="fas fa-spinner fa-spin"></i> Loading ICS data...</p></div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeModal()">Close</button>
          <button class="btn btn-primary" onclick="downloadReport('ICSSummary', 'excel')"><i class="fas fa-file-download"></i> Export</button>
        </div>
      </div>
    `);
    try {
      const ics = await apiRequest('/ics');
      const reportEl = document.getElementById('icsReportContent');
      reportEl.innerHTML = `
        <table class="data-table"><thead><tr><th>ICS No</th><th>Date</th><th>Property No</th><th>Description</th><th>Issued To</th></tr></thead>
        <tbody>${ics.map(i => `<tr><td>${i.ics_no}</td><td>${i.date_of_issue ? new Date(i.date_of_issue).toLocaleDateString() : ''}</td><td>${i.property_number||'-'}</td><td>${i.description||i.property_description||''}</td><td>${i.issued_to_name||'-'}</td></tr>`).join('')}</tbody></table>
      `;
    } catch(err) { document.getElementById('icsReportContent').innerHTML = '<p>Error loading data.</p>'; }
  };

  window.generateLowStockReport = async function() {
    openModal('Low Stock / Reorder Alert Report', `
      <div class="view-details">
        <div id="lowStockReportContent"><p><i class="fas fa-spinner fa-spin"></i> Loading low stock data...</p></div>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeModal()">Close</button>
          <button class="btn btn-primary" onclick="downloadReport('LowStock', 'excel')"><i class="fas fa-file-download"></i> Export</button>
        </div>
      </div>
    `);
    try {
      const items = await apiRequest('/items');
      const lowStock = items.filter(i => {
        const qty = parseInt(i.quantity) || 0;
        const rp = parseInt(i.reorder_point) || 0;
        return qty > 0 && qty <= rp;
      });
      const outOfStock = items.filter(i => parseInt(i.quantity) === 0 && (i.category || '').toLowerCase() !== 'services');
      const reportEl = document.getElementById('lowStockReportContent');
      reportEl.innerHTML = `
        <h4 style="margin-bottom:10px;"><i class="fas fa-exclamation-triangle" style="color:#d69e2e;"></i> Low Stock (${lowStock.length} items)</h4>
        <table class="data-table"><thead><tr><th>Code</th><th>Item</th><th>Qty</th><th>Reorder Point</th></tr></thead>
        <tbody>${lowStock.map(i => `<tr><td>${i.code}</td><td>${i.name}</td><td style="color:#d69e2e;font-weight:600;">${i.quantity}</td><td>${i.reorder_point}</td></tr>`).join('')}</tbody></table>
        <h4 style="margin:15px 0 10px;"><i class="fas fa-times-circle" style="color:#e53e3e;"></i> Out of Stock (${outOfStock.length} items)</h4>
        <table class="data-table"><thead><tr><th>Code</th><th>Item</th><th>Category</th></tr></thead>
        <tbody>${outOfStock.map(i => `<tr><td>${i.code}</td><td>${i.name}</td><td>${i.category}</td></tr>`).join('')}</tbody></table>
      `;
    } catch(err) { document.getElementById('lowStockReportContent').innerHTML = '<p>Error loading data.</p>'; }
  };

  // Initialize the application
  init();
});
