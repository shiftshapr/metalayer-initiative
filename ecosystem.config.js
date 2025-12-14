module.exports = {
  apps: [
    {
      name: 'metalayer-api',
      script: 'app.js',
      cwd: '/home/ubuntu/canopi',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Enable clustering mode
      env: {
        PORT: 3002,
        NODE_ENV: 'production'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: '/tmp/pm2-metalayer-api-error.log',
      out_file: '/tmp/pm2-metalayer-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      // Health check for load balancer
      health_check: {
        enabled: true,
        max_restarts: 5,
        min_uptime: '10s'
      }
    }
  ]
};

