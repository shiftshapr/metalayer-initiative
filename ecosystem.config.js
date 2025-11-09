module.exports = {
  apps: [
    {
      name: 'metalayer-api',
      script: 'app.js',
      cwd: '/home/ubuntu/metalayer-initiative',
      env: {
        PORT: 3002,
        NODE_ENV: 'production'
      },
      error_file: '/tmp/pm2-metalayer-api-error.log',
      out_file: '/tmp/pm2-metalayer-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M'
    }
    // canopi2-server.js is no longer needed - all routes moved to app.js
  ]
};

