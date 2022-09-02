module.exports = {
  apps: [
    {
      name: 'AllianceApiProduction',
      cwd: '/var/www/alliance/production/api',
      script: 'src/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'AllianceApiStaging',
      cwd: '/var/www/alliance/staging/api',
      script: 'src/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    // {
    //   name: 'AllianceApiLocal',
    //   cwd: './',
    //   script: 'src/index.js',
    //   instances: 1,
    //   autorestart: true,
    //   watch: true,
    //   max_memory_restart: '256M',
    //   env: {
    //     NODE_ENV: 'development',
    //     PORT: 3003,
    //   },
    // },
  ],
};
