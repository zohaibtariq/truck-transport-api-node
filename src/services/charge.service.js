const httpStatus = require('http-status');
const { Charge } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a charge
 * @param {Object} chargeBody
 * @returns {Promise<Charge>}
 */
const createCharge = async (chargeBody) => {
  return Charge.create(chargeBody);
};

/**
 * Query for charges
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryCharges = async (filter, options) => {
  const charges = await Charge.paginate(filter, options);
  return charges;
};

/**
 * Get charge by id
 * @param {ObjectId} id
 * @returns {Promise<Charge>}
 */
const getChargeById = async (id) => {
  return Charge.findById(id);
};

/**
 * Update charge by id
 * @param {ObjectId} chargeId
 * @param {Object} updateBody
 * @returns {Promise<Charge>}
 */
const updateChargeById = async (chargeId, updateBody) => {
  const charge = await getChargeById(chargeId);
  if (!charge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Charge not found');
  }
  if (updateBody.email && (await Charge.isEmailTaken(updateBody.email, chargeId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(charge, updateBody);
  await charge.save();
  return charge;
};

/**
 * Delete charge by id
 * @param {ObjectId} chargeId
 * @returns {Promise<Charge>}
 */
const deleteChargeById = async (chargeId) => {
  const charge = await getChargeById(chargeId);
  if (!charge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Charge not found');
  }
  await charge.remove();
  return charge;
};

const queryAllCharges = async (filter) => {
  return Charge.find(filter).lean();
};

const insert = async (docs, options, callback) => {
  return Charge.collection.insert(docs, options, callback);
};

module.exports = {
  createCharge,
  queryCharges,
  getChargeById,
  updateChargeById,
  deleteChargeById,
  queryAllCharges,
  insert,
};
