const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const goodRoute = require('./good.route');
const chargeRoute = require('./charge.route');
const profileRoute = require('./profile.route');
const driverRoute = require('./driver.route');
const loadRoute = require('./load.route');
const countryRoute = require('./country.route');
const faqRoute = require('./faq.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users-management',
    route: userRoute,
  },
  {
    path: '/goods',
    route: goodRoute,
  },
  {
    path: '/charges',
    route: chargeRoute,
  },
  {
    path: '/profiles',
    route: profileRoute,
  },
  {
    path: '/drivers',
    route: driverRoute,
  },
  {
    path: '/loads',
    route: loadRoute,
  },
  {
    path: '/countries',
    route: countryRoute,
  },
  {
    path: '/faq',
    route: faqRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
