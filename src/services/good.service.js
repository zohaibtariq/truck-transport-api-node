const httpStatus = require('http-status');
const { Good } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a good
 * @param {Object} goodBody
 * @returns {Promise<Good>}
 */
const createGood = async (goodBody) => {
  return Good.create(goodBody);
};

/**
 * Query for goods
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryGoods = async (filter, options) => {
  const goods = await Good.paginate(filter, options);
  return goods;
};

/**
 * Get good by id
 * @param {ObjectId} id
 * @returns {Promise<Good>}
 */
const getGoodById = async (id) => {
  return Good.findById(id);
};

/**
 * Update good by id
 * @param {ObjectId} goodId
 * @param {Object} updateBody
 * @returns {Promise<Good>}
 */
const updateGoodById = async (goodId, updateBody) => {
  const good = await getGoodById(goodId);
  if (!good) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Good not found');
  }
  if (updateBody.email && (await Good.isEmailTaken(updateBody.email, goodId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(good, updateBody);
  await good.save();
  return good;
};

/**
 * Delete good by id
 * @param {ObjectId} goodId
 * @returns {Promise<Good>}
 */
const deleteGoodById = async (goodId) => {
  const good = await getGoodById(goodId);
  if (!good) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Good not found');
  }
  await good.remove();
  return good;
};

const queryAllGoods = async (filter) => {
  return Good.find(filter).lean();
};

const insert = async (docs, options, callback) => {
  return Good.collection.insert(docs, options, callback);
};

module.exports = {
  createGood,
  queryGoods,
  getGoodById,
  updateGoodById,
  deleteGoodById,
  queryAllGoods,
  insert
};
