const httpStatus = require('http-status');
const { Driver, User} = require('../models');
const ApiError = require('../utils/ApiError');
const fs = require('fs')
const path = require('path');

/**
 * Create a driver
 * @param {Object} driverBody
 * @returns {Promise<Driver>}
 */
const createDriver = async (driverBody) => {
  // console.log('createDriver')
  // console.log(driverBody)
  if (await Driver.isEmailTaken(driverBody.email)) {
    // console.log('throw new error')
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  // console.log('driver created call')
  return Driver.create(driverBody);
};

/**
 * Query for drivers
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryDrivers = async (filter, options) => {
  // return await Driver.find()
  const drivers = await Driver.paginate(filter, options);
  return drivers;
};

/**
 * Get driver by id
 * @param {ObjectId} id
 * @returns {Promise<Driver>}
 */
const getDriverById = async (id) => {
  return Driver.findById(id).populate(['country', 'state', 'city', 'certifications.country', 'certifications.state', 'certifications.city']);
};

/**
 * Get driver by email
 * @param {string} email
 * @returns {Promise<Driver>}
 */
const getDriverByEmail = async (email) => {
  return Driver.findOne({ email });
};

/**
 * Update driver by id
 * @param {ObjectId} driverId
 * @param {Object} updateBody
 * @returns {Promise<Driver>}
 */
const updateDriverById = async (driverId, updateBody) => {
  const driver = await getDriverById(driverId);
  if (!driver) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
  }
  if (updateBody.email && (await Driver.isEmailTaken(updateBody.email, driverId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(driver, updateBody);
  await driver.save();
  return driver;
};

/**
 * Update driver password by id
 * @param {ObjectId} driverId
 * @param {Object} updateBody
 * @returns {Promise<Driver>}
 */
const updateDriverPasswordById = async (driverId, updateBody) => {
  const driver = await getDriverById(driverId);
  if (!driver) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
  }else if(!(await driver.isPasswordMatch(updateBody.old_password))){
    throw new ApiError(httpStatus.BAD_REQUEST, 'Driver old password is wrong');
  }else if(updateBody.old_password === updateBody.password){
    throw new ApiError(httpStatus.BAD_REQUEST, 'Driver old password must not be same as new password.');
  }
  // console.log(updateBody.old_password)
  // console.log(typeof updateBody.old_password)
  // console.log(updateBody.password)
  // console.log(typeof updateBody.password)
  // return false;
  Object.assign(driver, {password: updateBody.password});
  await driver.save();
  return driver;
};

/**
 * Update driver image by id
 * @param {ObjectId} driverId
 * @param {Object} updateBody
 * @returns {Promise<Driver>}
 */
const updateDriverImageById = async (driverId, updateBody) => {
  const driver = await getDriverById(driverId);
  if (!driver) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
  }
  if(updateBody?.image && updateBody.image !== null && updateBody.image !== undefined && updateBody.image !== '' && updateBody.image != driver.image) {
    const fileFullPath = path.join(__dirname, '../../uploads/'+driver.image);
    fs.unlink(fileFullPath, (err) => {
      if (err) {
        console.error(err)
        return
      }
    })
  }
  // console.log(updateBody)
  Object.assign(driver, updateBody);
  // console.log('D ASSIGN')
  // console.log(driver)
  await driver.save();
  // console.log('D SAVED')
  // console.log(driver)
  return driver;
};

/**
 * Delete driver by id
 * @param {ObjectId} driverId
 * @returns {Promise<Driver>}
 */
const deleteDriverById = async (driverId) => {
  const driver = await getDriverById(driverId);
  if (!driver) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
  }
  const fileFullPath = path.join(__dirname, '../../uploads/'+driver.image);
  fs.unlink(fileFullPath, (err) => {
    if (err) {
      console.error(err)
      return
    }
  })
  await driver.remove();
  return driver;
};

const queryAllDrivers = async (filter) => {
  return Driver.find(filter).lean();
};

module.exports = {
  createDriver,
  queryDrivers,
  getDriverById,
  getDriverByEmail,
  updateDriverById,
  deleteDriverById,
  updateDriverImageById,
  queryAllDrivers,
  updateDriverPasswordById
};
