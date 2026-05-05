// Hot Reload Manager — Detects server code changes and auto-updates client
// Monitors frontend hash via /api/app-version-hash endpoint
// When hash changes, hot-reloads the UI while preserving Socket.IO connection

class HotReloadManager {
  constructor(socketIO, config) {
    this.socket = socketIO;
    this.config = config || {
      VERSION_CHECK_INTERVAL: 45000,   // Check every 45 seconds
      HOT_RELOAD_TIMEOUT: 5000,        // 5 second timeout for reload
      HOT_RELOAD_DELAY: 500            // Delay before reloading page
    };
    this.currentHash = null;
    this.isReloading = false;
    this.checkInterval = null;
    this.lastCheckTime = null;
  }

  // Start periodic version checking
  start() {
    console.log('[HotReload] Manager initialized with check interval:', this.config.VERSION_CHECK_INTERVAL + 'ms');

    // Check version immediately
    this.checkForUpdates();

    // Then check periodically
    this.checkInterval = setInterval(() => {
      this.checkForUpdates();
    }, this.config.VERSION_CHECK_INTERVAL);

    // Also check when Socket.IO reconnects (in case server was restarted)
    if (this.socket) {
      this.socket.on('connect', () => {
        console.log('[HotReload] Socket.IO connected, checking for updates...');
        setTimeout(() => this.checkForUpdates(), 1000);
      });
    }
  }

  // Stop periodic checking
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('[HotReload] Manager stopped');
  }

  // Check if server version has changed
  async checkForUpdates() {
    if (this.isReloading) {
      console.log('[HotReload] Reload in progress, skipping check');
      return;
    }

    this.lastCheckTime = new Date().toISOString();

    try {
      const response = await fetch(API_URL + '/app-version-hash', {
        timeout: this.config.HOT_RELOAD_TIMEOUT
      });

      if (!response.ok) {
        console.warn('[HotReload] Version check failed with status:', response.status);
        return;
      }

      const data = await response.json();

      // First check - store the current hash as baseline
      if (!this.currentHash) {
        this.currentHash = data.frontend_hash;
        console.log('[HotReload] Baseline hash set:', this.currentHash.substring(0, 8) + '...');
        return;
      }

      // Subsequent checks - compare with stored hash
      if (data.frontend_hash !== this.currentHash) {
        console.warn('[HotReload] 🔄 UPDATE AVAILABLE!', {
          current_hash: this.currentHash.substring(0, 8) + '...',
          new_hash: data.frontend_hash.substring(0, 8) + '...',
          version: data.version,
          timestamp: data.server_timestamp
        });
        this.performHotReload(data.version);
      } else {
        console.log('[HotReload] App is up to date');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('[HotReload] Version check timeout after', this.config.HOT_RELOAD_TIMEOUT + 'ms');
      } else {
        console.warn('[HotReload] Version check failed:', error.message);
      }
    }
  }

  // Perform the hot reload
  performHotReload(newVersion) {
    this.isReloading = true;
    console.log('[HotReload] Starting hot reload for version:', newVersion);

    // Notify user if notification system exists
    if (typeof showNotification === 'function') {
      showNotification(
        '🔄 Updating',
        'App is refreshing with the latest changes...',
        'info'
      );
    }

    // Reload the page after a brief delay
    setTimeout(() => {
      console.log('[HotReload] Reloading page...');
      location.reload();
    }, this.config.HOT_RELOAD_DELAY);
  }

  // Manual trigger for hot reload (for debugging)
  forceReload() {
    console.log('[HotReload] Manual reload triggered');
    this.performHotReload('manual');
  }

  // Get current status
  getStatus() {
    return {
      initialized: this.currentHash !== null,
      currentHash: this.currentHash ? this.currentHash.substring(0, 8) + '...' : 'not set',
      isReloading: this.isReloading,
      lastCheckTime: this.lastCheckTime,
      checkInterval: this.config.VERSION_CHECK_INTERVAL
    };
  }
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HotReloadManager;
}
