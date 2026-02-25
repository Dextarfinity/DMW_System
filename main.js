const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'Procurement Plan System',
    icon: path.join(__dirname, 'renderer/assets/dmw-logo.png'),
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
