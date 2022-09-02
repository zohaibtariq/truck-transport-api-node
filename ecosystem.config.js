module.exports = {
  apps: [
    {
      name: 'alliance_api',
      script: 'src/index.js',
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
    },
  ],
};
