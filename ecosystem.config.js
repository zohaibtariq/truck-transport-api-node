const SUFFIX = process.argv.indexOf('--env') === -1 ? '' : `${process.argv[process.argv.indexOf('--env') + 1]}`;
let NODE_ENV = '';
let APP_NAME = '';
let PORT = 0;
let CWD = '';
let MAX_MEMORY = '2048M';
let INSTANCES = 1;
const SCRIPT = 'src/index.js';
let AUTO_RESTART = true;
let WATCH = false;
if (SUFFIX === 'development') {
  NODE_ENV = 'development';
  APP_NAME = 'TruckTransportApiLocal';
  PORT = 3000;
  CWD = '/usr/src/node-app';
  MAX_MEMORY = '2048M';
  INSTANCES = 1;
  WATCH = true;
} else if (SUFFIX === 'staging') {
  NODE_ENV = 'production';
  APP_NAME = 'TruckTransportApiStaging';
  PORT = 3001;
  CWD = '/var/www/staging/api';
  MAX_MEMORY = '2048M';
  INSTANCES = 1;
} else if (SUFFIX === 'production') {
  NODE_ENV = 'production';
  APP_NAME = 'TruckTransportApiProduction';
  PORT = 3000;
  CWD = '/var/www/production/api';
  MAX_MEMORY = '8192M';
  INSTANCES = 3;
  AUTO_RESTART = true;
}
console.log(`SUFFIX : ${SUFFIX}`);
console.log(`APP NAME : ${APP_NAME}`);
console.log(`PORT : ${PORT}`);
console.log(`CWD : ${CWD}`);
console.log(`NODE_ENV : ${NODE_ENV}`);
console.log(`MAX_MEMORY : ${MAX_MEMORY}`);
console.log(`INSTANCES : ${INSTANCES}`);
console.log(`SCRIPT : ${SCRIPT}`);
console.log(`AUTO_RESTART : ${AUTO_RESTART}`);
console.log(`WATCH : ${WATCH}`);
module.exports = {
  apps: [
    {
      name: APP_NAME,
      cwd: CWD,
      script: SCRIPT,
      instances: INSTANCES,
      autorestart: AUTO_RESTART,
      watch: WATCH,
      max_memory_restart: MAX_MEMORY,
      env: {
        NODE_ENV,
        PORT,
      },
    },
    /* {
      name: 'TruckTransportApiProduction',
      cwd: '/var/www/trucktransport/production/api',
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
      name: 'TruckTransportApiStaging',
      cwd: '/var/www/trucktransport/staging/api',
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
    {
      name: 'TruckTransportApiLocal',
      cwd: './',
      script: 'src/index.js',
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
    }, */
  ],
};
