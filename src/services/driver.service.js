const httpStatus = require('http-status');
const { Driver, Product} = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a driver
 * @param {Object} driverBody
 * @returns {Promise<Driver>}
 */
const createDriver = async (driverBody) => {
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
  return Driver.findById(id);
};
//
// /**
//  * Get driver by email
//  * @param {string} email
//  * @returns {Promise<Driver>}
//  */
// const getDriverByEmail = async (email) => {
//   return Driver.findOne({ email });
// };

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
  // if (updateBody.email && (await Driver.isEmailTaken(updateBody.email, driverId))) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  // }
  Object.assign(driver, updateBody);
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
  // console.log('updateDriverImageById')
  const driver = await getDriverById(driverId);
  if (!driver) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
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
  // console.log(driver);
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
  // getDriverByEmail,
  updateDriverById,
  deleteDriverById,
  updateDriverImageById,
  queryAllDrivers
};
