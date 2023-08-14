const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'Truck Transport API documentation',
    version,
    license: {
      name: 'MIT',
      url: 'https://github.com/zohaibtariq/truck-transport-api-node',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
    },
  ],
};

module.exports = swaggerDef;
