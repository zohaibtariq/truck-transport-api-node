const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
// const { roleRights } = require('../config/roles');

const verifyCallback = (req, resolve, reject) => async (err, profile, info) => {
  if (err || info || !profile) {
    // console.log('CUSTOMER AUTH ERROR');
    // console.log(err);
    // console.log(info);
    // console.log(customer);
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate customer'));
  }
  req.profile = profile;
  resolve();
};

const profileAuth = () => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwtProfile', { session: false }, verifyCallback(req, resolve, reject))(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = profileAuth;
