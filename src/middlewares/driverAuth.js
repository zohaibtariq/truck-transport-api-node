const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
// const { roleRights } = require('../config/roles');

const verifyCallback = (req, resolve, reject) => async (err, driver, info) => {
  if (err || info || !driver) {
    // console.log('DRIVER AUTH ERROR');
    // console.log(err);
    // console.log(info);
    // console.log(driver);
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate driver'));
  }
  req.driver = driver;
  resolve();
};

const driverAuth = () => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwtDriver', { session: false }, verifyCallback(req, resolve, reject))(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = driverAuth;
