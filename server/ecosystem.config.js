module.exports = {
  apps: [{
    name: 'dmw-server',
    script: 'server.js',
    cwd: __dirname,
    exec_mode: 'fork',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    node_args: '--disable-warning=DEP0169',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0'
    },
    // Restart after 5 seconds on crash
    restart_delay: 5000,
    // Don't restart more than 15 times in 15 minutes
    max_restarts: 15,
    min_uptime: '10s',
    // Logging
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    merge_logs: true,
    // Graceful shutdown
    kill_timeout: 5000
  }]
};
