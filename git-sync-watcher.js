const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// ─── Configuration ───────────────────────────────────────────
const WATCH_DIR = __dirname;
const DEBOUNCE_MS = 10000;       // Wait 10s after last change before pushing
const PULL_INTERVAL_MS = 30000;  // Pull every 30 seconds
const BRANCH = 'main';

// Patterns to ignore (matches .gitignore + extras)
const IGNORE_PATTERNS = [
  'node_modules', '.git', 'dist', 'out', 'build',
  '.env', '.DS_Store', 'Thumbs.db', '.vscode', '.idea',
  'git-sync-watcher.js', // don't trigger on self
  'database_backup', 'logs', '*.log'
];

// ─── State ───────────────────────────────────────────────────
let debounceTimer = null;
let isPushing = false;
let isPulling = false;
let changedFiles = new Set();

// ─── Helpers ─────────────────────────────────────────────────
function log(msg) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] ${msg}`);
}

function shouldIgnore(filePath) {
  const rel = path.relative(WATCH_DIR, filePath);
  return IGNORE_PATTERNS.some(pattern => {
    if (pattern.startsWith('*.')) {
      return rel.endsWith(pattern.slice(1));
    }
    return rel.split(path.sep).some(part => part === pattern) || rel.startsWith(pattern);
  });
}

function runGit(cmd) {
  return new Promise((resolve, reject) => {
    exec(`git ${cmd}`, { cwd: WATCH_DIR, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(`git ${cmd} failed: ${stderr || err.message}`));
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

// ─── Pull (runs on interval) ────────────────────────────────
async function pullChanges() {
  if (isPulling || isPushing) return;
  isPulling = true;
  try {
    const result = await runGit(`pull origin ${BRANCH} --rebase --autostash`);
    if (result && !result.includes('Already up to date')) {
      log(`PULLED: ${result.split('\n')[0]}`);
    }
  } catch (err) {
    log(`PULL ERROR: ${err.message}`);
  } finally {
    isPulling = false;
  }
}

// ─── Push (runs after debounce) ─────────────────────────────
async function pushChanges() {
  if (isPushing) return;
  isPushing = true;

  const files = [...changedFiles];
  changedFiles.clear();

  try {
    // Stage all changes
    await runGit('add -A');

    // Check if there's anything to commit
    const status = await runGit('status --porcelain');
    if (!status) {
      log('No changes to commit.');
      isPushing = false;
      return;
    }

    // Build commit message
    const fileCount = status.split('\n').length;
    const timestamp = new Date().toLocaleString();
    const message = `auto-sync: ${fileCount} file(s) updated at ${timestamp}`;

    await runGit(`commit -m "${message}"`);
    log(`COMMITTED: ${message}`);

    // Pull first to avoid conflicts
    try {
      await runGit(`pull origin ${BRANCH} --rebase --autostash`);
    } catch (pullErr) {
      log(`PULL before push warning: ${pullErr.message}`);
    }

    // Push
    await runGit(`push origin ${BRANCH}`);
    log(`PUSHED to origin/${BRANCH}`);

  } catch (err) {
    log(`PUSH ERROR: ${err.message}`);
    // If push fails due to conflicts, notify user
    if (err.message.includes('conflict') || err.message.includes('CONFLICT')) {
      log('CONFLICT DETECTED - manual resolution required!');
    }
  } finally {
    isPushing = false;
  }
}

// ─── File Watcher ────────────────────────────────────────────
function watchDirectory(dir) {
  try {
    fs.watch(dir, { recursive: true }, (eventType, filename) => {
      if (!filename) return;

      const fullPath = path.join(dir, filename);

      if (shouldIgnore(fullPath)) return;

      changedFiles.add(filename);
      log(`CHANGE: ${filename} (${eventType})`);

      // Debounce: reset timer on each change
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        log(`Syncing ${changedFiles.size} changed file(s)...`);
        pushChanges();
      }, DEBOUNCE_MS);
    });
  } catch (err) {
    log(`WATCH ERROR: ${err.message}`);
  }
}

// ─── Startup ─────────────────────────────────────────────────
function start() {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║       GIT AUTO-SYNC WATCHER              ║');
  console.log('║  Watching for file changes...             ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  Branch:    ${BRANCH.padEnd(28)}║`);
  console.log(`║  Debounce:  ${(DEBOUNCE_MS / 1000 + 's').padEnd(28)}║`);
  console.log(`║  Pull interval: ${(PULL_INTERVAL_MS / 1000 + 's').padEnd(23)}║`);
  console.log('║  Press Ctrl+C to stop                    ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  // Initial pull
  pullChanges();

  // Watch for local changes
  watchDirectory(WATCH_DIR);
  log('File watcher started.');

  // Periodic pull
  setInterval(pullChanges, PULL_INTERVAL_MS);
  log(`Pulling every ${PULL_INTERVAL_MS / 1000}s.`);
}

// ─── Graceful shutdown ──────────────────────────────────────
process.on('SIGINT', () => {
  log('Shutting down watcher...');
  if (debounceTimer) clearTimeout(debounceTimer);
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Shutting down watcher...');
  if (debounceTimer) clearTimeout(debounceTimer);
  process.exit(0);
});

start();
