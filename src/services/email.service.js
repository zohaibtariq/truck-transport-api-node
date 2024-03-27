const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  const msg = { from: config.email.from, to, subject, html: text };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `${config.adminUrl}auth/reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link: <a href="${resetPasswordUrl}">RESET PASSWORD</a>
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send driver reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendDriverResetPasswordEmail = async (to, token, otp = '') => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  // const resetPasswordUrl = `${config.adminUrl}auth/reset-password?token=${token}`;
  // const text = `Dear driver,
  // To reset your password, click on this link: <a href="${resetPasswordUrl}">RESET PASSWORD</a>
  // If you did not request any password resets, then ignore this email.`;
  const text = `Dear driver,
  OTP is: ${otp}
  If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

// /**
//  * Send profile reset password email
//  * @param {string} to
//  * @param {string} token
//  * @returns {Promise}
//  */
// const sendProfileResetPasswordEmail = async (to, token, otp = '') => {
//   const subject = 'Reset password';
//   // replace this url with the link to the reset password page of your front-end app
//   // const resetPasswordUrl = `${config.adminUrl}auth/reset-password?token=${token}`;
//   // const text = `Dear driver,
//   // To reset your password, click on this link: <a href="${resetPasswordUrl}">RESET PASSWORD</a>
//   // If you did not request any password resets, then ignore this email.`;
//   const text = `Dear customer,
//   OTP is: ${otp}
//   If you did not request any password resets, then ignore this email.`;
//   await sendEmail(to, subject, text);
// };
/**
 * Send profile reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendProfileResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `${config.customerUrl}auth/reset-password?token=${token}`;
  const text = `Dear customer,
To reset your password, click on this link: <a href="${resetPasswordUrl}">RESET PASSWORD</a>
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `${config.adminUrl}auth/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: <a href="${verificationEmailUrl}">VERIFY EMAIL</a>
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send driver verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendDriverVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `${config.adminUrl}auth/verify-email?token=${token}`;
  const text = `Dear driver,
To verify your email, click on this link: <a href="${verificationEmailUrl}">VERIFY EMAIL</a>
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

// /**
//  * Send profile verification email
//  * @param {string} to
//  * @param {string} token
//  * @returns {Promise}
//  */
// const sendProfileVerificationEmail = async (to, token) => {
//   const subject = 'Email Verification';
//   // replace this url with the link to the email verification page of your front-end app
//   const verificationEmailUrl = `${config.adminUrl}auth/verify-email?token=${token}`;
//   const text = `Dear customer,
// To verify your email, click on this link: <a href="${verificationEmailUrl}">VERIFY EMAIL</a>
// If you did not create an account, then ignore this email.`;
//   await sendEmail(to, subject, text);
// };
/**
 * Send profile verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendProfileVerificationEmail = async (to, token) => {
  // console.log('sendProfileVerificationEmail');
  // console.log(config.customerUrl);
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `${config.customerUrl}auth/verify-email?token=${token}`;
  const text = `Dear customer,
To verify your email, click on this link: <a href="${verificationEmailUrl}">VERIFY EMAIL</a>
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendDriverResetPasswordEmail,
  sendDriverVerificationEmail,
  sendProfileResetPasswordEmail,
  sendProfileVerificationEmail,
};
