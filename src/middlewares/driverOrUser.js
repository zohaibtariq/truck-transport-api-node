const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');

const userVerifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    // console.log('USER AUTH ERROR 1');
    // console.log(err);
    // console.log(info);
    // console.log(user);
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate user'));
  }
  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      // console.log('USER AUTH ERROR 2 RIGHTS');
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }
  req.user = user;
  // console.log('USER TOKEN');
  // console.log(req.user);
  resolve();
};

const driverVerifyCallback = (req, resolve, reject) => async (err, driver, info) => {
  if (err || info || !driver) {
    // console.log('DRIVER AUTH ERROR');
    // console.log(err);
    // console.log(info);
    // console.log(driver);
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate driver'));
  }
  req.driver = driver;
  // console.log('DRIVER TOKEN');
  // console.log(req.driver);
  resolve();
};

/*
const promise1 = Promise.reject(0);
const promise2 = new Promise((resolve) => setTimeout(resolve, 100, 'quick'));
const promise3 = new Promise((resolve) => setTimeout(resolve, 500, 'slow'));
const promises = [promise1, promise2, promise3];
Promise.any(promises).then((value) => console.log(value));
*/

const driverOrUser = (...requiredRights) => async (req, res, next) => {
  const userPromise = new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, userVerifyCallback(req, resolve, reject, requiredRights))(req, res, next);
  })
    // .then(() => next())
    // .catch((err) => next(err));
  const driverPromise = new Promise((resolve, reject) => {
    passport.authenticate('jwtDriver', { session: false }, driverVerifyCallback(req, resolve, reject))(req, res, next);
  })
    // .then(() => next())
    // .catch((err) => next(err));
  const promises = [userPromise, driverPromise];
  return Promise.any(promises)
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = driverOrUser;
