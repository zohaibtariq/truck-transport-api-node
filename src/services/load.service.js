const httpStatus = require('http-status');
const { Load } = require('../models');
const ApiError = require('../utils/ApiError');
const generateUniqueId = require("../utils/uniqueId");
const _ = require('lodash');

/**
 * Create a load
 * @param {Object} loadBody
 * @returns {Promise<Load>}
 */
const createLoad = async (loadBody) => {
   return Load.create(loadBody);
};

/**
 * Query for loads
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryLoads = async (filter, options) => {
  const loads = await Load.paginate(filter, options);
  // console.log('::: LOADS ::: ')
  // console.log({...loads})
  return loads;
};

/**
 * Get load by id
 * @param {ObjectId} id
 * @returns {Promise<Load>}
 */
const getLoadById = async (id) => {
  return Load.findById(id).populate(['customer', 'origin', 'destination', 'driver', 'goods.good', 'charges.type'/*, 'invitationSentToDrivers.id'*/]);
};

/**
 * Update load by id
 * @param {ObjectId} loadId
 * @param {Object} updateBody
 * @returns {Promise<Load>}
 */
const updateLoadById = async (loadId, updateBody) => {
  const load = await getLoadById(loadId);
  if (!load) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Load not found');
  }
  if(updateBody.invitationSentToDrivers && updateBody.invitationSentToDrivers.length > 0){
    updateBody.invitationSentToDrivers = load.invitationSentToDrivers.concat(updateBody.invitationSentToDrivers);
  }
  Object.assign(load, updateBody);
  await load.save();
  return load;
};

/**
 * Delete load by id
 * @param {ObjectId} loadId
 * @returns {Promise<Load>}
 */
const deleteLoadById = async (loadId) => {
  const load = await getLoadById(loadId);
  if (!load) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Load not found');
  }
  await load.remove();
  return load;
};

const queryAllLoads = async (filter) => {
  return Load.find(filter).lean();
};

module.exports = {
  createLoad,
  queryLoads,
  getLoadById,
  updateLoadById,
  deleteLoadById,
  queryAllLoads
};
