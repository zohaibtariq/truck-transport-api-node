const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const config = require('../config/config');
const userService = require('./user.service');
const driverService = require('./driver.service');
const profileService = require('./profile.service');
const { Token, DriverToken, ProfileToken } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Save a driver token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveDriverToken = async (token, driverId, expires, type, blacklisted = false, otp = '', isOtpVerified = false) => {
  const create = {
    token,
    driver: driverId,
    expires: expires.toDate(),
    type,
    blacklisted,
    otp,
    isOtpVerified,
  };
  // console.log('CREATE DRIVER TOKEN');
  // console.log(create);
  const tokenDoc = await DriverToken.create(create);
  return tokenDoc;
};

/**
 * Save a profile token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveProfileToken = async (token, profileId, expires, type, blacklisted = false, otp = '', isOtpVerified = false) => {
  const create = {
    token,
    profile: profileId,
    expires: expires.toDate(),
    type,
    blacklisted,
    otp,
    isOtpVerified,
  };
  // console.log('CREATE PROFILE TOKEN');
  // console.log(create);
  const tokenDoc = await ProfileToken.create(create);
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyDriverToken = async (token, type, otpOptions = {}) => {
  const payload = jwt.verify(token, config.jwt.secret);
  // console.log('verifyDriverToken');
  // console.log(payload);
  // console.log(token);
  // console.log(type);
  // console.log(otpOptions);
  const findDriverTokenObj = { token, type, driver: payload.sub, blacklisted: false };
  if (otpOptions.hasOwnProperty('otp')) findDriverTokenObj.otp = otpOptions.otp;
  if (otpOptions.hasOwnProperty('isOtpVerified')) findDriverTokenObj.otp = otpOptions.isOtpVerified;
  // console.log('FIND DRIVER TOKEN OBJECT');
  // console.log(findDriverTokenObj);
  const tokenDoc = await DriverToken.findOne(findDriverTokenObj);
  if (!tokenDoc) {
    throw new Error('Driver Token not found');
  }
  Object.assign(tokenDoc, { isOtpVerified: true });
  // console.log('tokenDoc')
  // console.log(tokenDoc)
  await tokenDoc.save();
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
// const verifyProfileToken = async (token, type, otpOptions = {}) => {
//   const payload = jwt.verify(token, config.jwt.secret);
//   const findProfileTokenObj = { token, type, profile: payload.sub, blacklisted: false };
//   if (otpOptions.hasOwnProperty('otp')) findProfileTokenObj.otp = otpOptions.otp;
//   if (otpOptions.hasOwnProperty('isOtpVerified')) findProfileTokenObj.otp = otpOptions.isOtpVerified;
//   const tokenDoc = await ProfileToken.findOne(findProfileTokenObj);
//   if (!tokenDoc) {
//     throw new Error('Profile Token not found');
//   }
//   Object.assign(tokenDoc, { isOtpVerified: true });
//   await tokenDoc.save();
//   return tokenDoc;
// };
/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyProfileToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await ProfileToken.findOne({ token, type, profile: payload.sub, blacklisted: false });
  if (!tokenDoc) {
    throw new Error('Profile Token not found');
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate driver auth tokens
 * @param {Driver} driver
 * @returns {Promise<Object>}
 */
const generateDriverAuthTokens = async (driver) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(driver.id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(driver.id, refreshTokenExpires, tokenTypes.REFRESH);
  await saveDriverToken(refreshToken, driver.id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate profile auth tokens
 * @param {Profile} profile
 * @returns {Promise<Object>}
 */
const generateProfileAuthTokens = async (profile) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(profile.id, accessTokenExpires, tokenTypes.ACCESS);
  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(profile.id, refreshTokenExpires, tokenTypes.REFRESH);
  await saveProfileToken(refreshToken, profile.id, refreshTokenExpires, tokenTypes.REFRESH);
  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateDriverResetPasswordToken = async (email, otp = '') => {
  const driver = await driverService.getDriverByEmail(email);
  if (!driver) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No driver found with this email');
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  // const resetPasswordToken = generateToken(driver.id, expires, tokenTypes.RESET_PASSWORD);
  // await saveDriverToken(resetPasswordToken, driver.id, expires, tokenTypes.RESET_PASSWORD);
  const resetPasswordToken = generateToken(driver.id, expires, tokenTypes.OTP);
  await saveDriverToken(resetPasswordToken, driver.id, expires, tokenTypes.OTP, false, otp);
  return resetPasswordToken;
};

// /**
//  * Generate reset password token
//  * @param {string} email
//  * @returns {Promise<string>}
//  */
// const generateProfileResetPasswordToken = async (email, otp = '') => {
//   const profile = await profileService.getProfileByEmail(email);
//   if (!profile) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'No profile found with this email');
//   }
//   const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
//   const resetPasswordToken = generateToken(profile.id, expires, tokenTypes.OTP);
//   await saveProfileToken(resetPasswordToken, profile.id, expires, tokenTypes.OTP, false, otp);
//   return resetPasswordToken;
// };
/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateProfileResetPasswordToken = async (email) => {
  const profile = await profileService.getProfileByEmail(email);
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No profile found with this email');
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(profile.id, expires, tokenTypes.RESET_PASSWORD);
  await saveProfileToken(resetPasswordToken, profile.id, expires, tokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};

/**
 * Generate driver verify email token
 * @param {Driver} driver
 * @returns {Promise<string>}
 */
const generateDriverVerifyEmailToken = async (driver) => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(driver.id, expires, tokenTypes.VERIFY_EMAIL);
  await saveDriverToken(verifyEmailToken, driver.id, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};

/**
 * Generate profile verify email token
 * @param {Profile} profile
 * @returns {Promise<string>}
 */
const generateProfileVerifyEmailToken = async (profile) => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(profile.id, expires, tokenTypes.VERIFY_EMAIL);
  await saveProfileToken(verifyEmailToken, profile.id, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  generateDriverAuthTokens,
  verifyDriverToken,
  generateDriverResetPasswordToken,
  generateDriverVerifyEmailToken,
  generateProfileAuthTokens,
  saveProfileToken,
  generateProfileResetPasswordToken,
  verifyProfileToken,
  generateProfileVerifyEmailToken,
};
