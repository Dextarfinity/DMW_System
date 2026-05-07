const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const http = require('http');
const dgram = require('dgram');
const fs = require('fs');
const os = require('os');

let mainWindow;

// =====================================================
// DYNAMIC SERVER DISCOVERY (No Hardcoded IPs)
// Server advertises its actual network IPs via:
// 1. UDP Broadcast (automatic, fastest)
// 2. /api/server-ips endpoint (fallback)
// =====================================================
const SERVER_PORT = 3000;
const DISCOVERY_PORT = 5555; // UDP broadcast port
const DISCOVERY_TIMEOUT = 3000;
const HEALTH_CHECK_TIMEOUT = 2000;

// Will be populated from auto-discovery only
let SERVER_IPS = [];

// Resolved at startup — set by discoverServer()
let RESOLVED_SERVER_URL = null;

function getAppIconPath() {
  if (process.platform === 'win32') {
    return path.join(__dirname, 'build', 'icon.ico');
  }
  return path.join(__dirname, 'renderer', 'assets', 'dmw-logo.png');
}

/**
 * Listen for UDP broadcast from server
 * Server broadcasts: "DMW-SERVER|192.168.x.x|3000|192.168.x.x,..."
 * This is the FASTEST way to discover the server automatically
 */
function listenForBroadcast(timeout = 3000) {
  return new Promise((resolve) => {
    const discoverySocket = dgram.createSocket('udp4');

    // Set a timeout for broadcast listening
    const timeoutHandle = setTimeout(() => {
      console.log('[BROADCAST] No broadcast received (timeout)');
      discoverySocket.close();
      resolve(null);
    }, timeout);

    discoverySocket.on('message', (msg, info) => {
      try {
        const message = msg.toString();
        if (message.startsWith('DMW-SERVER')) {
          const parts = message.split('|');
          if (parts.length >= 3) {
            const primaryIP = parts[1];
            const port = parts[2];
            const allIPs = parts[3] ? parts[3].split(',') : [primaryIP];

            console.log(`[BROADCAST] [OK] Received broadcast from ${info.address}`);
            console.log(`[BROADCAST] Primary IP: ${primaryIP}:${port}`);
            console.log(`[BROADCAST] All IPs: ${allIPs.join(', ')}`);

            clearTimeout(timeoutHandle);
            discoverySocket.close();

            resolve(allIPs);
          }
        }
      } catch (err) {
        console.log(`[BROADCAST] Error parsing message: ${err.message}`);
      }
    });

    discoverySocket.on('error', (err) => {
      console.log(`[BROADCAST] Socket error: ${err.message}`);
      clearTimeout(timeoutHandle);
      discoverySocket.close();
      resolve(null);
    });

    try {
      discoverySocket.bind(DISCOVERY_PORT, () => {
        discoverySocket.setBroadcast(true);
        console.log(`[BROADCAST] Listening for server broadcasts on port ${DISCOVERY_PORT}...`);
      });
    } catch (err) {
      console.log(`[BROADCAST] Could not bind to port ${DISCOVERY_PORT}: ${err.message}`);
      clearTimeout(timeoutHandle);
      discoverySocket.close();
      resolve(null);
    }
  });
}

/**
 * Try to reach a specific server IP with configurable timeout.
 * Returns a promise that resolves to the URL if reachable, or null if not.
 */
function checkServerIP(ip, timeout = HEALTH_CHECK_TIMEOUT) {
  return new Promise((resolve) => {
    const url = `http://${ip}:${SERVER_PORT}`;
    const req = http.get(`${url}/api/health`, { timeout }, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log(`[DISCOVERY] [OK] Server responding at ${ip}:${SERVER_PORT}`);
        resolve(url);
      } else {
        console.log(`[DISCOVERY] [FAIL] Server at ${ip} returned status ${res.statusCode}`);
        resolve(null);
      }
      res.resume();
    });
    req.on('error', (err) => {
      console.log(`[DISCOVERY] [FAIL] Cannot reach ${ip}: ${err.message}`);
      resolve(null);
    });
    req.on('timeout', () => {
      console.log(`[DISCOVERY] [TIMEOUT] Timeout connecting to ${ip}`);
      req.destroy();
      resolve(null);
    });
  });
}

/**
 * Discover server IPs dynamically from /api/server-ips endpoint.
 * Queries the server to get all available IPs (WiFi, Ethernet, etc.)
 */
async function fetchServerIPsFromServer() {
  const candidates = ['localhost', '127.0.0.1'];

  for (const ip of candidates) {
    try {
      const url = `http://${ip}:${SERVER_PORT}/api/server-ips`;
      return await new Promise((resolve) => {
        const req = http.get(url, { timeout: DISCOVERY_TIMEOUT }, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (parsed.all_ips && Array.isArray(parsed.all_ips)) {
                // Filter out localhost and duplicates
                const ips = Array.from(new Set(
                  parsed.all_ips.filter(ip => ip && ip !== 'localhost' && ip !== '127.0.0.1')
                ));

                console.log(`[DISCOVERY] Server at ${ip} advertises IPs:`, ips);
                console.log(`[DISCOVERY] Network interfaces from server:`, parsed.network_interfaces);

                resolve(ips.length > 0 ? ips : [ip]);
              } else {
                console.log(`[DISCOVERY] Invalid response format from ${ip}/api/server-ips`);
                resolve([]);
              }
            } catch (err) {
              console.log(`[DISCOVERY] Failed to parse response from ${ip}:`, err.message);
              resolve([]);
            }
          });
          res.resume();
        });
        req.on('error', (err) => {
          console.log(`[DISCOVERY] Cannot reach ${ip}/api/server-ips: ${err.message}`);
          resolve([]);
        });
        req.on('timeout', () => {
          console.log(`[DISCOVERY] Timeout reaching ${ip}/api/server-ips`);
          req.destroy();
          resolve([]);
        });
      });
    } catch (err) {
      console.log(`[DISCOVERY] Exception fetching from ${ip}:`, err.message);
    }
  }
  return [];
}

/**
 * Get local network IP candidates from all network interfaces.
 * Returns IPv4 addresses from Ethernet, WiFi, and other non-loopback interfaces.
 */
function getLocalNetworkCandidates() {
  const candidates = new Set();
  let primaryIP = null;

  try {
    const interfaces = os.networkInterfaces();

    Object.keys(interfaces).forEach(iface => {
      interfaces[iface].forEach(addr => {
        // Only consider IPv4 addresses
        if (addr.family === 'IPv4' && !addr.internal) {
          candidates.add(addr.address);
          if (!primaryIP) primaryIP = addr.address;
        }
      });
    });

    // If only found own IP, scan the entire subnet for other servers
    if (candidates.size === 1 && primaryIP) {
      console.log(`[DISCOVERY] Only found local IP ${primaryIP}, scanning full subnet...`);
      const parts = primaryIP.split('.');
      const subnet = parts.slice(0, 3).join('.');

      // Add all IPs on subnet (.1 to .254, skip own IP)
      for (let i = 1; i <= 254; i++) {
        const ip = `${subnet}.${i}`;
        if (ip !== primaryIP) {
          candidates.add(ip);
        }
      }
      console.log(`[DISCOVERY] Expanded to scan ${candidates.size} IPs on ${subnet}.x`);
    }
  } catch (err) {
    console.log(`[DISCOVERY] Error scanning network interfaces: ${err.message}`);
  }

  return Array.from(candidates);
}

/**
 * Discover which server IP is reachable with exponential backoff retry.
 * 1. Tries localhost first (local development)
 * 2. Listens for UDP broadcast from server (AUTOMATIC, FASTEST)
 * 3. Fetches dynamically advertised IPs from HTTP endpoint (FALLBACK)
 * 4. Races all candidates on /api/health
 * 5. Falls back to localhost if nothing responds
 */
async function discoverServer(attempt = 1, maxAttempts = 10) {
  if (RESOLVED_SERVER_URL && attempt === 1) return RESOLVED_SERVER_URL;

  console.log(`[DISCOVERY] Attempt ${attempt}/${maxAttempts}: Starting server discovery...`);

  // Step 1: Try localhost first (best for development and LAN)
  console.log('[DISCOVERY] Step 1: Trying localhost (local development)...');
  let localResult = await checkServerIP('localhost', HEALTH_CHECK_TIMEOUT);
  if (localResult) {
    RESOLVED_SERVER_URL = localResult;
    console.log('[DISCOVERY] [OK] Using localhost (local development)');
    return RESOLVED_SERVER_URL;
  }

  // Step 1.5: Scan local network IPs (WiFi and Ethernet)
  console.log('[DISCOVERY] Step 1.5: Scanning local network interfaces...');
  let networkCandidates = getLocalNetworkCandidates();
  if (networkCandidates.length > 0) {
    console.log(`[DISCOVERY] Found ${networkCandidates.length} network candidate(s): ${networkCandidates.join(', ')}`);
    const networkResults = await Promise.all(networkCandidates.map(ip => checkServerIP(ip, HEALTH_CHECK_TIMEOUT)));
    for (let i = 0; i < networkResults.length; i++) {
      if (networkResults[i]) {
        RESOLVED_SERVER_URL = networkResults[i];
        console.log(`[DISCOVERY] [OK] SERVER FOUND on local network at ${networkCandidates[i]}:${SERVER_PORT}`);
        return RESOLVED_SERVER_URL;
      }
    }
  }

  // Step 2: Listen for UDP broadcast (FASTEST)
  console.log('[DISCOVERY] Step 2: Listening for UDP server broadcast...');
  let broadcastIPs = await listenForBroadcast(3000);
  if (broadcastIPs && broadcastIPs.length > 0) {
    console.log('[DISCOVERY] [OK] Got IPs from broadcast, testing...');
    const results = await Promise.all(broadcastIPs.map(ip => checkServerIP(ip, HEALTH_CHECK_TIMEOUT)));
    for (let i = 0; i < results.length; i++) {
      if (results[i]) {
        RESOLVED_SERVER_URL = results[i];
        console.log(`[DISCOVERY] [OK] SERVER FOUND via BROADCAST at ${broadcastIPs[i]}:${SERVER_PORT}`);
        return RESOLVED_SERVER_URL;
      }
    }
  }

  // Step 3: Fallback to HTTP endpoint (if broadcast failed)
  console.log('[DISCOVERY] Step 3: Fetching server-advertised IPs via HTTP...');
  let serverAdvertisedIPs = await fetchServerIPsFromServer();

  if (serverAdvertisedIPs.length === 0) {
    console.log('[DISCOVERY] No server-advertised IPs found.');
    console.log('[DISCOVERY] Falling back to localhost...');
  }

  // Step 4: Test advertised IPs
  let allCandidates = serverAdvertisedIPs;

  console.log(`[DISCOVERY] Step 4: Testing ${allCandidates.length} candidate IP(s)...`);
  console.log('[DISCOVERY] Candidates:', allCandidates);

  // Race health checks against all discovered IPs
  const results = await Promise.all(
    allCandidates.map(ip => checkServerIP(ip, HEALTH_CHECK_TIMEOUT))
  );

  for (let i = 0; i < results.length; i++) {
    if (results[i]) {
      RESOLVED_SERVER_URL = results[i];
      console.log(`[DISCOVERY] [OK] SERVER FOUND via HTTP at ${allCandidates[i]}:${SERVER_PORT}`);
      return RESOLVED_SERVER_URL;
    }
  }

  // Step 5: Fallback to localhost if nothing responded
  RESOLVED_SERVER_URL = `http://localhost:${SERVER_PORT}`;

  // Retry with exponential backoff if this is not the last attempt
  if (attempt < maxAttempts) {
    const backoffDelay = Math.min(1000 * Math.pow(1.5, attempt - 1), 10000);
    console.warn(`[DISCOVERY] [RETRY] No server found, retrying in ${backoffDelay}ms (attempt ${attempt + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, backoffDelay));
    return discoverServer(attempt + 1, maxAttempts);
  }

  console.warn('[DISCOVERY] [WARNING] All discovery attempts exhausted');
  console.warn('[DISCOVERY] Falling back to localhost (offline mode)');
  return RESOLVED_SERVER_URL;
}

/**
 * Quick server reachability check using the discovered URL.
 */
function isServerReachable() {
  return new Promise((resolve) => {
    if (!RESOLVED_SERVER_URL) {
      console.log('[SERVER-CHECK] No resolved server URL');
      resolve(false);
      return;
    }
    console.log(`[SERVER-CHECK] Checking if server is reachable at ${RESOLVED_SERVER_URL}`);
    const req = http.get(`${RESOLVED_SERVER_URL}/api/health`, { timeout: HEALTH_CHECK_TIMEOUT }, (res) => {
      const isReachable = res.statusCode >= 200 && res.statusCode < 400;
      console.log(`[SERVER-CHECK] Server health check: ${res.statusCode} - ${isReachable ? '[OK] REACHABLE' : '[FAIL] NOT REACHABLE'}`);
      resolve(isReachable);
      res.resume();
    });
    req.on('error', (err) => {
      console.log(`[SERVER-CHECK] [FAIL] Server check failed: ${err.message}`);
      resolve(false);
    });
    req.on('timeout', () => {
      console.log('[SERVER-CHECK] [TIMEOUT] Server check timed out');
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Start periodic re-discovery check.
 * Detects when server IP changes (e.g., WiFi reconnection) and updates RESOLVED_SERVER_URL.
 * Notifies renderer if IP changes via IPC.
 */
function startPeriodicRediscovery() {
  const REDISCOVERY_INTERVAL = 30000; // Check every 30 seconds

  setInterval(async () => {
    if (!mainWindow) return;

    const isReachable = await isServerReachable();
    if (!isReachable) {
      console.log('[PERIODIC-DISCOVERY] Server unreachable, attempting re-discovery...');
      try {
        const newUrl = await discoverServer(1, 3); // Retry up to 3 times
        if (newUrl && newUrl !== RESOLVED_SERVER_URL) {
          console.log('[PERIODIC-DISCOVERY] 🔄 Server IP changed!', {
            old: RESOLVED_SERVER_URL,
            new: newUrl
          });
          RESOLVED_SERVER_URL = newUrl;
          // Notify renderer of server URL change
          mainWindow.webContents.send('server-changed', { url: newUrl });
        }
      } catch (err) {
        console.error('[PERIODIC-DISCOVERY] Re-discovery failed:', err.message);
      }
    }
  }, REDISCOVERY_INTERVAL);

  console.log('[PERIODIC-DISCOVERY] Started periodic re-discovery check (every 30 seconds)');
}

async function createWindow() {
  const appIcon = getAppIconPath();
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    fullscreen: false,
    show: false,
    backgroundColor: '#0c1929',
    title: 'Procurement Plan System',
    icon: appIcon,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Hide the menu bar visually but keep keyboard shortcuts (Ctrl+Shift+I for DevTools)
  mainWindow.setMenuBarVisibility(false);

  // --- Dynamic Server Discovery ---
  console.log('\n[STARTUP] Starting server discovery...\n');

  // Discover which server IP is reachable on the current network
  await discoverServer();

  console.log('\n[STARTUP] Server resolved to:', RESOLVED_SERVER_URL);
  console.log('[STARTUP] Checking server reachability...\n');

  // --- Dynamic UI loading ---
  // Try loading the frontend from the server so that any HTML/JS/CSS changes
  // made on the server are immediately reflected on every client PC.
  // Falls back to the bundled local files if the server is unreachable.
  const serverUp = await isServerReachable();
  if (serverUp && RESOLVED_SERVER_URL) {
    console.log('[UI] [OK] Server is UP - Loading frontend from:', RESOLVED_SERVER_URL);
    mainWindow.loadURL(RESOLVED_SERVER_URL);
  } else {
    console.log('[UI] [WARNING] Server is DOWN or unreachable - Loading bundled local files');
    console.log('[UI] Frontend will be served from:', path.join(__dirname, 'renderer', 'index.html'));
    mainWindow.loadFile('renderer/index.html');
  }

  console.log('[UI] Window created and content loading...\n');

  // --- Inject local logo files into the renderer ---
  // When loading from the server, the renderer's __dirname won't resolve to
  // local assets. Read logos here (main process) and push them into the renderer.
  // Show window once the page content is ready (prevents white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize();
    console.log('[UI] [OK] Window displayed and maximized');
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[UI] [OK] Page content loaded successfully');
    // Send the resolved server URL to the renderer immediately after page load
    if (RESOLVED_SERVER_URL) {
      mainWindow.webContents.send('server-discovered', { url: RESOLVED_SERVER_URL });
      console.log('[IPC] Sent resolved server URL to renderer:', RESOLVED_SERVER_URL);
    }

    try {
      const fs = require('fs');
      const assetsDir = path.join(__dirname, 'renderer', 'assets');
      const dmwFile = path.join(assetsDir, 'image.png');
      const bpFile = path.join(assetsDir, 'bagong-pilipinas.png');
      let dmwB64 = '', bpB64 = '';
      if (fs.existsSync(dmwFile)) dmwB64 = 'data:image/png;base64,' + fs.readFileSync(dmwFile).toString('base64');
      if (fs.existsSync(bpFile)) bpB64 = 'data:image/png;base64,' + fs.readFileSync(bpFile).toString('base64');

      if (dmwB64 || bpB64) {
        const dmwFileSafe = dmwFile.replace(/\\/g, '/');
        const bpFileSafe = bpFile.replace(/\\/g, '/');
        mainWindow.webContents.executeJavaScript(`
          (function() {
            try {
              // Try to set let variables directly (works in Chromium global scope)
              if (typeof dmwLogoBase64 !== 'undefined' && !dmwLogoBase64) dmwLogoBase64 = ${JSON.stringify(dmwB64)};
              if (typeof bagongPilipinasBase64 !== 'undefined' && !bagongPilipinasBase64) bagongPilipinasBase64 = ${JSON.stringify(bpB64)};
              if (typeof dmwLogoFilePath !== 'undefined' && !dmwLogoFilePath) dmwLogoFilePath = ${JSON.stringify(dmwFileSafe)};
              if (typeof bpLogoFilePath !== 'undefined' && !bpLogoFilePath) bpLogoFilePath = ${JSON.stringify(bpFileSafe)};
            } catch(e) {
              // Fallback: store on window for patched functions
              window.__dmwLogo = ${JSON.stringify(dmwB64)};
              window.__bpLogo = ${JSON.stringify(bpB64)};
            }
            // Also store on window as reliable backup
            window.__dmwLogo = window.__dmwLogo || ${JSON.stringify(dmwB64)};
            window.__bpLogo = window.__bpLogo || ${JSON.stringify(bpB64)};
            window.__dmwLogoPath = ${JSON.stringify(dmwFileSafe)};
            window.__bpLogoPath = ${JSON.stringify(bpFileSafe)};

            // Override getPrintHeaderHTML to guarantee logos appear
            // (server's app.js may not have the window.__dmwLogo fallback)
            if (typeof getPrintHeaderHTML === 'function') {
              var _dmw = ${JSON.stringify(dmwB64)};
              var _bp = ${JSON.stringify(bpB64)};
              window.getPrintHeaderHTML = function() {
                var d = (typeof dmwLogoBase64 !== 'undefined' && dmwLogoBase64) || window.__dmwLogo || _dmw || '';
                var b = (typeof bagongPilipinasBase64 !== 'undefined' && bagongPilipinasBase64) || window.__bpLogo || _bp || '';
                return '<div class="print-header">' +
                  '<div class="header-left">' + (d ? '<img src="' + d + '" alt="DMW Logo">' : '') + '</div>' +
                  '<div class="header-center">' +
                    '<div class="republic"><em>Republic of the Philippines</em></div>' +
                    '<div class="dept-name">Department of Migrant Workers</div>' +
                    '<div class="regional">Regional Office \\u2013 XIII (Caraga)</div>' +
                    '<div class="address">3<sup>rd</sup> Floor Esquina Dos Building, J.C. Aquino Avenue corner Doongan Road, Butuan City,<br>Agusan del Norte, 8600</div>' +
                  '</div>' +
                  '<div class="header-right">' + (b ? '<img src="' + b + '" alt="Bagong Pilipinas">' : '') + '</div>' +
                '</div>';
              };
              getPrintHeaderHTML = window.getPrintHeaderHTML;
            }
          })();
        `).catch(() => {});
        console.log('[UI] [OK] Logo assets injected');
      }
    } catch (e) {
      console.warn('[Logos] Could not inject logos:', e.message);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Start periodic re-discovery to handle server IP changes
  startPeriodicRediscovery();
}

app.whenReady().then(() => {
  createWindow();
});

if (process.platform === 'win32') {
  app.setAppUserModelId('com.dmwfad.procurement');
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for future backend integration
ipcMain.handle('get-procurement-plans', async () => {
  // TODO: Connect to API
  return [];
});

ipcMain.handle('get-purchase-requests', async () => {
  // TODO: Connect to API
  return [];
});

ipcMain.handle('get-purchase-orders', async () => {
  // TODO: Connect to API
  return [];
});

// ==================== ATTACHMENT PREVIEW SYSTEM ====================
// Opens attachment (PDF/image) directly in a BrowserWindow using Chromium's native viewer
ipcMain.handle('show-attachment-preview', async (event, url, fileName) => {
  const previewWin = new BrowserWindow({
    width: 1000,
    height: 800,
    title: fileName || 'Attachment Preview',
    parent: mainWindow,
    icon: path.join(__dirname, 'renderer/assets/dmw-logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  previewWin.setMenuBarVisibility(false);
  previewWin.loadURL(url);
  return { success: true };
});

// ==================== PRINT PREVIEW SYSTEM ====================
// Opens a visible preview window with toolbar: Paper Size, Orientation, Print, Save PDF, Close
ipcMain.handle('show-print-preview', async (event, htmlContent, options = {}) => {
  const pageSize = options.pageSize || 'A4';
  const landscape = options.landscape || false;
  const reportTitle = options.title || 'Report';
  const editable = options.editable || false;

  const previewWin = new BrowserWindow({
    width: landscape ? 1100 : 900,
    height: 780,
    title: editable ? 'Document Preview (Editable)' : 'Print Preview',
    parent: mainWindow,
    icon: path.join(__dirname, 'renderer/assets/dmw-logo.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  previewWin.setMenuBarVisibility(false);

  // Save as Doc button (only shown when editable)
  const saveDocBtn = editable ? `<button class="pp-btn" onclick="doSaveDoc()" title="Save as Word Doc"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a365d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></button>` : '';

  // Build a toolbar matching the app's .top-header government minimalist style
  const toolbarHTML = `
    <div id="pp-toolbar">
      <div class="pp-left">
        <span class="pp-title">${editable ? 'DOCUMENT PREVIEW' : 'PRINT PREVIEW'}</span>
        <span class="pp-sep"></span>
        <span class="pp-subtitle">${reportTitle}${editable ? ' (Editable - click to edit)' : ''}</span>
      </div>
      <div class="pp-controls">
        <div class="pp-field">
          <label for="pp-pageSize">Paper Size</label>
          <select id="pp-pageSize">
            <option value="A4" ${pageSize==='A4'?'selected':''}>A4 (210 x 297 mm)</option>
            <option value="Legal" ${pageSize==='Legal'?'selected':''}>Legal (8.5 x 14 in)</option>
            <option value="Letter" ${pageSize==='Letter'?'selected':''}>Letter (8.5 x 11 in)</option>
            <option value="A3" ${pageSize==='A3'?'selected':''}>A3 (297 x 420 mm)</option>
          </select>
        </div>
        <div class="pp-field">
          <label for="pp-orientation">Orientation</label>
          <select id="pp-orientation">
            <option value="portrait" ${!landscape?'selected':''}>Portrait</option>
            <option value="landscape" ${landscape?'selected':''}>Landscape</option>
          </select>
        </div>
        <div class="pp-actions">
          ${saveDocBtn}
          <button class="pp-btn" onclick="doPrint()" title="Print"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a365d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></button>
          <button class="pp-btn" onclick="doSavePDF()" title="Save PDF"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a365d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></button>
        </div>
      </div>
    </div>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; background: white !important; }
      html, body { background: white !important; background-color: white !important; }
      #pp-toolbar {
        position:fixed; top:0; left:0; right:0; z-index:99999;
        background:#fff; height:44px; padding:0 16px;
        display:flex; align-items:center; justify-content:space-between;
        border-bottom:2px solid #1a365d;
        font-family:'Segoe UI',Arial,Helvetica,sans-serif; font-size:13px;
      }
      .pp-left { display:flex; align-items:center; gap:10px; min-width:0; }
      .pp-title {
        font-size:13px; font-weight:700; color:#1a365d;
        text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap;
      }
      .pp-sep { width:1px; height:18px; background:#bbb; }
      .pp-subtitle {
        font-size:11px; color:#555; font-weight:400;
        white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:280px;
      }
      .pp-controls { display:flex; align-items:center; gap:10px; flex-shrink:0; }
      .pp-field { display:flex; align-items:center; gap:4px; }
      .pp-field label {
        font-size:10px; color:#555; font-weight:600;
        text-transform:uppercase; letter-spacing:0.3px; white-space:nowrap;
      }
      .pp-field select {
        padding:3px 6px; border:1px solid #bbb; border-radius:2px;
        font-size:11px; color:#111; background:#fff; cursor:pointer;
        font-family:'Segoe UI',Arial,sans-serif;
      }
      .pp-field select:focus { border-color:#1a365d; outline:none; }
      .pp-actions { display:flex; gap:5px; margin-left:4px; }
      .pp-btn {
        width:30px; height:30px; border:1px solid #ccc; border-radius:3px;
        background:transparent; cursor:pointer;
        display:inline-flex; align-items:center; justify-content:center;
        padding:0; transition:background 0.15s;
      }
      .pp-btn:hover { background:#f0f0f0; }
      @media print { #pp-toolbar { display:none !important; } body { padding-top:10px !important; } }
      body { padding-top:44px !important; background: white !important; }
      [contenteditable] { background: white !important; outline: none !important; }
      [contenteditable]:hover { background: white !important; outline: none !important; }
      [contenteditable]:focus { background: white !important; outline: none !important; }
      tbody[contenteditable] { background: white !important; }
      tbody[contenteditable] tr { background: white !important; }
      tbody[contenteditable] td { background: white !important; }
    </style>
    <script>
      const { ipcRenderer: ppIpc } = require('electron');
      function doPrint() {
        const ps = document.getElementById('pp-pageSize').value;
        const land = document.getElementById('pp-orientation').value === 'landscape';
        ppIpc.send('preview-do-print', { pageSize: ps, landscape: land });
      }
      function doSavePDF() {
        const ps = document.getElementById('pp-pageSize').value;
        const land = document.getElementById('pp-orientation').value === 'landscape';
        ppIpc.send('preview-do-pdf', { pageSize: ps, landscape: land, title: '${reportTitle.replace(/'/g, "\\'") }' });
      }
      function doSaveDoc() {
        // Get the edited body content (excluding toolbar)
        const toolbar = document.getElementById('pp-toolbar');
        const clone = document.body.cloneNode(true);
        const tb = clone.querySelector('#pp-toolbar');
        if (tb) tb.remove();
        // Remove scripts and toolbar styles
        clone.querySelectorAll('script').forEach(s => s.remove());
        const editableContent = clone.innerHTML;
        ppIpc.send('preview-do-save-doc', { title: '${reportTitle.replace(/'/g, "\\'") }', html: editableContent });
      }
      ppIpc.on('pdf-saved', (e, fp) => { alert('PDF saved to:\\n' + fp); });
      ppIpc.on('pdf-error', (e, msg) => { alert('PDF error: ' + msg); });
      ppIpc.on('doc-saved', (e, fp) => { alert('Word document saved to:\\n' + fp); });
      ppIpc.on('doc-error', (e, msg) => { alert('Save Doc error: ' + msg); });
    </script>
  `;

  // If editable, make the body content area editable
  let finalHTML = htmlContent;
  if (editable) {
    // Add contenteditable to the page-body-group td or body content
    finalHTML = finalHTML.replace(/<tbody class="page-body-group">/, '<tbody class="page-body-group" contenteditable="true">');
    // Also add editable styling
    finalHTML = finalHTML.replace('</style>', `
      [contenteditable="true"] { outline: none; }
      [contenteditable="true"]:focus { background: transparent; }
      [contenteditable="true"] td:hover { cursor: text; }
      </style>`);
  }

  // Inject toolbar right after <body>
  const modifiedHTML = finalHTML.replace(/<body[^>]*>/, '$&' + toolbarHTML);
  previewWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(modifiedHTML));

  return { success: true };
});

// Print button from preview window
ipcMain.on('preview-do-print', (event, opts) => {
  event.sender.print({
    silent: false,
    printBackground: true,
    margins: { marginType: 'custom', top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 },
    landscape: opts.landscape || false,
    pageSize: opts.pageSize || 'A4'
  }, (success, reason) => {
    // Preview window stays open so user can re-print
  });
});

// Save PDF button from preview window
ipcMain.on('preview-do-pdf', async (event, opts) => {
  try {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save as PDF',
      defaultPath: (opts.title || 'Report') + '.pdf',
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });
    if (canceled || !filePath) return;

    const pdfData = await event.sender.printToPDF({
      printBackground: true,
      landscape: opts.landscape || false,
      pageSize: opts.pageSize || 'A4',
      margins: { marginType: 'custom', top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 }
    });

    require('fs').writeFileSync(filePath, pdfData);
    event.sender.send('pdf-saved', filePath);
  } catch (err) {
    console.error('PDF save error:', err);
    event.sender.send('pdf-error', err.message);
  }
});

// Save as Doc button from preview window
ipcMain.on('preview-do-save-doc', async (event, opts) => {
  try {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save as Word Document',
      defaultPath: (opts.title || 'Document') + '.doc',
      filters: [
        { name: 'Word Document', extensions: ['doc'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    if (canceled || !filePath) return;

    // Wrap in Word-compatible HTML format
    const wordHTML = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
  @page { size: A4 portrait; margin: 1cm 1.5cm 1cm 1.5cm; }
  body { font-family: Arial, sans-serif; font-size: 11pt; }
  table { border-collapse: collapse; }
</style>
</head>
<body>
${opts.html}
</body>
</html>`;

    require('fs').writeFileSync(filePath, wordHTML, 'utf-8');
    event.sender.send('doc-saved', filePath);
  } catch (err) {
    console.error('Save DOC error:', err);
    event.sender.send('doc-error', err.message);
  }
});

// ==================== SAVE AS EDITABLE WORD DOC (direct) ====================
// Saves HTML content as a .doc file that Microsoft Word can open and edit
ipcMain.handle('save-as-doc', async (event, htmlContent, defaultFilename) => {
  try {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save as Word Document',
      defaultPath: (defaultFilename || 'Document') + '.doc',
      filters: [
        { name: 'Word Document', extensions: ['doc'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    if (canceled || !filePath) return { success: false, canceled: true };

    // Wrap HTML in Word-compatible MHTML format
    const wordHTML = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
  @page {
    size: A4 portrait;
    margin: 1cm 1.5cm 1cm 1.5cm;
  }
  body {
    font-family: Arial, sans-serif;
    font-size: 11pt;
  }
  table {
    border-collapse: collapse;
  }
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;

    require('fs').writeFileSync(filePath, wordHTML, 'utf-8');
    return { success: true, filePath: filePath };
  } catch (err) {
    console.error('Save DOC error:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.on('open-external', (event, url) => {
  shell.openExternal(url);
});