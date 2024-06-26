const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const driverService = require('./driver.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { DriverToken, ProfileToken } = require('../models');
// const { profileService, driverService } = require('.');
const profileService = require('./profile.service');

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return user;
};

/**
 * Logout Admin
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Logout Driver
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logoutDriver = async (refreshToken) => {
  const refreshTokenDoc = await DriverToken.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Logout Profile
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logoutProfile = async (refreshToken) => {
  const refreshTokenDoc = await ProfileToken.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify Driver OTP
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const verifyDriverOtp = async (resetPasswordToken, otp = '') => {
  try {
    await tokenService.verifyDriverToken(resetPasswordToken, tokenTypes.OTP, { otp });
    // Object.assign(verifyOtpDoc, { isOtpVerified: true });
    // console.log('verifyDriverOtp')
    // console.log(verifyOtpDoc)
    // await verifyOtpDoc.save();
    // return verifyOtpDoc
    // console.log('resetDriverPassword')
    // console.log(resetPasswordTokenDoc)
    // return false;
    // const driver = await driverService.getDriverById(resetPasswordTokenDoc.driver);
    // if (!driver) {
    // throw new Error();
    // }
    // await driverService.updateDriverById(driver.id, { password: newPassword });
    // await DriverToken.deleteMany({ driver: driver.id, type: tokenTypes.OTP });
  } catch (error) {
    // console.log(error)
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Driver OTP verification failed');
  }
};

/**
 * Verify Profile OTP
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const verifyProfileOtp = async (resetPasswordToken, otp = '') => {
  try {
    await tokenService.verifyProfileToken(resetPasswordToken, tokenTypes.OTP, { otp });
    // Object.assign(verifyOtpDoc, { isOtpVerified: true });
    // console.log('verifyDriverOtp')
    // console.log(verifyOtpDoc)
    // await verifyOtpDoc.save();
    // return verifyOtpDoc
    // console.log('resetDriverPassword')
    // console.log(resetPasswordTokenDoc)
    // return false;
    // const driver = await driverService.getDriverById(resetPasswordTokenDoc.driver);
    // if (!driver) {
    // throw new Error();
    // }
    // await driverService.updateDriverById(driver.id, { password: newPassword });
    // await DriverToken.deleteMany({ driver: driver.id, type: tokenTypes.OTP });
  } catch (error) {
    // console.log(error)
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Profile OTP verification failed');
  }
};

/**
 * Reset driver password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetDriverPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyDriverToken(resetPasswordToken, tokenTypes.OTP);
    // console.log('resetDriverPassword')
    // console.log(resetPasswordTokenDoc)
    // return false;
    const driver = await driverService.getDriverById(resetPasswordTokenDoc.driver);
    if (!driver) {
      throw new Error();
    }
    await driverService.updateDriverById(driver.id, { password: newPassword });
    await DriverToken.deleteMany({ driver: driver.id, type: tokenTypes.OTP });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Driver Password reset failed');
  }
};

// /**
//  * Reset profile password
//  * @param {string} resetPasswordToken
//  * @param {string} newPassword
//  * @returns {Promise}
//  */
// const resetProfilePassword = async (resetPasswordToken, newPassword) => {
//   try {
//     const resetPasswordTokenDoc = await tokenService.verifyProfileToken(resetPasswordToken, tokenTypes.OTP);
//     // console.log('resetProfilePassword')
//     // console.log(resetPasswordTokenDoc)
//     // return false;
//     const profile = await profileService.getProfileById(resetPasswordTokenDoc.driver);
//     if (!profile) {
//       throw new Error();
//     }
//     await profileService.updateProfileById(profile.id, { password: newPassword });
//     await ProfileToken.deleteMany({ profile: profile.id, type: tokenTypes.OTP });
//   } catch (error) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Profile Password reset failed');
//   }
// };
/**
 * Reset profile password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetProfilePassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyProfileToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const profile = await profileService.getProfileById(resetPasswordTokenDoc.profile);
    if (!profile) {
      throw new Error();
    }
    await profileService.updateProfileById(profile.id, { password: newPassword });
    await ProfileToken.deleteMany({ profile: profile.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Profile Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

/**
 * Verify driver email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyDriverEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyDriverToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const driver = await driverService.getDriverById(verifyEmailTokenDoc.driver);
    if (!driver) {
      throw new Error();
    }
    await DriverToken.deleteMany({ driver: driver.id, type: tokenTypes.VERIFY_EMAIL });
    await driverService.updateDriverById(driver.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

/**
 * Verify profile email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyProfileEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyProfileToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const profile = await profileService.getProfileById(verifyEmailTokenDoc.profile);
    if (!profile) {
      throw new Error();
    }
    await ProfileToken.deleteMany({ profile: profile.id, type: tokenTypes.VERIFY_EMAIL });
    await profileService.updateProfileById(profile.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Customer Email verification failed');
  }
};

/**
 * Login driver with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginDriverWithEmailAndPassword = async (email, password) => {
  const driver = await driverService.getDriverByEmail(email);
  if (!driver || !(await driver.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Driver: Incorrect email or password');
  }
  return driver;
};
/**
 * Login Profile with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginProfileWithEmailAndPassword = async (email, password) => {
  console.log('inside loginProfileWithEmailAndPassword');
  const profile = await profileService.getProfileByEmail(email);
  if (!profile || !(await profile.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Profile: Incorrect email or password');
  }
  return profile;
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  loginDriverWithEmailAndPassword,
  logoutDriver,
  resetDriverPassword,
  verifyDriverEmail,
  verifyDriverOtp,
  loginProfileWithEmailAndPassword,
  logoutProfile,
  verifyProfileOtp,
  resetProfilePassword,
  verifyProfileEmail,
};
