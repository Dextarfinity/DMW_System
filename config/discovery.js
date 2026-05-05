// Centralized server discovery configuration
// Shared across Electron main process, server, and client

module.exports = {
  // UDP Broadcast Discovery
  DISCOVERY_PORT: 5555,
  DISCOVERY_INTERVAL: 5000,          // Broadcast every 5 seconds
  DISCOVERY_TIMEOUT: 3000,            // Wait 3 seconds for response
  DISCOVERY_ATTEMPTS: 10,             // Retry up to 10 times
  DISCOVERY_BACKOFF_MULTIPLIER: 1.5,  // Exponential backoff factor
  UDP_BROADCAST: '255.255.255.255',

  // HTTP API Endpoints
  API_HEALTH_ENDPOINT: '/api/health',
  API_VERSION_ENDPOINT: '/api/app-version-hash',
  API_SERVER_IPS_ENDPOINT: '/api/server-ips',

  // Socket.IO Configuration
  SOCKET_RECONNECT_DELAY: 2000,
  SOCKET_PING_INTERVAL: 10000,
  SOCKET_PING_TIMEOUT: 30000,

  // Version Checking & Hot Reload
  VERSION_CHECK_INTERVAL: 45000,   // Check every 45 seconds
  HOT_RELOAD_TIMEOUT: 5000,        // 5 second timeout for reload
  HOT_RELOAD_DELAY: 500,           // Delay before reloading page

  // Network Discovery
  LOCAL_HOST: '127.0.0.1',
  DEFAULT_PORT: 3000,
  REDISCOVERY_INTERVAL: 30000,     // Check every 30 seconds if server is reachable
  HEALTH_CHECK_TIMEOUT: 2000       // Individual health check timeout
};
