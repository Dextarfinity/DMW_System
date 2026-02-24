const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, 'assets/icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('renderer/index.html');
  
  // Open DevTools in development
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

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
    icon: path.join(__dirname, 'assets/icon.ico'),
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

  const previewWin = new BrowserWindow({
    width: landscape ? 1100 : 900,
    height: 780,
    title: 'Print Preview',
    parent: mainWindow,
    icon: path.join(__dirname, 'assets/icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  previewWin.setMenuBarVisibility(false);

  // Build a toolbar matching the app's .top-header government minimalist style
  const toolbarHTML = `
    <div id="pp-toolbar">
      <div class="pp-left">
        <span class="pp-title">PRINT PREVIEW</span>
        <span class="pp-sep"></span>
        <span class="pp-subtitle">${reportTitle}</span>
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
          <button class="pp-btn" onclick="doPrint()" title="Print"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a365d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></button>
          <button class="pp-btn" onclick="doSavePDF()" title="Save PDF"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a365d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></button>
        </div>
      </div>
    </div>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
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
      body { padding-top:44px !important; background:#fff !important; }
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
      ppIpc.on('pdf-saved', (e, fp) => { alert('PDF saved to:\\n' + fp); });
      ppIpc.on('pdf-error', (e, msg) => { alert('PDF error: ' + msg); });
    </script>
  `;

  // Inject toolbar right after <body>
  const modifiedHTML = htmlContent.replace(/<body[^>]*>/, '$&' + toolbarHTML);
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
