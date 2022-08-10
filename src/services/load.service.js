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
  const loadCount = await Load.countDocuments();
  loadBody.code = 40000 + parseInt(loadCount);
  // console.log('LOAD CODE');
  // console.log(loadCount, loadBody.code);
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
const queryLoads = async (filter, options, project = {}) => {
  const loads = await Load.paginate(filter, options, project);
  // console.log('::: LOADS ::: ')
  // console.log({...loads})
  return loads;
};

/**
 * Query for load count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Promise<QueryResult>}
 */
const queryLoadCount = async (match) => {
  const loads = await Load.aggregate([
    {
      "$match": match
    },
    { "$group": { _id: "$status", count: { $sum: 1 } } }
  ]);
  return loads;
};

/**
 * Get load by id
 * @param {ObjectId} id
 * @returns {Promise<Load>}
 */
const getLoadById = async (id) => {
  return Load.findById(id).populate([
    'goods.good',
    'charges.type',
    { path: 'customer', select: 'location.name' },
    {
      path: 'origin',
      select: 'location.address1 location.country location.state location.city location.zip location.phone location.fax email',
      populate: [
        { path: 'location.country', select: 'name' },
        { path: 'location.state', select: 'name' },
        { path: 'location.city', select: 'name' },
      ]
    },
    {
      path: 'destination',
      select: 'location.address1 location.country location.state location.city location.zip location.phone location.fax email',
      populate: [
        { path: 'location.country', select: 'name' },
        { path: 'location.state', select: 'name' },
        { path: 'location.city', select: 'name' },
      ]
    },
    { path: 'lastInvitedDriver', select: 'image first_name last_name mobile phone active' },
    { path: 'driverInterests.id', select: 'first_name last_name ratePerMile active' } // must not select id in select it will auto populate
  ]);
};

/**
 * Update load by id
 * @param {ObjectId} loadId
 * @param {Object} updateBody
 * @returns {Promise<Load>}
 */
const updateLoadById = async (loadId, updateBody, checkTenderedStatus = false) => {
  const load = await getLoadById(loadId);
  if (!load) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Load not found');
  }
  if(checkTenderedStatus === true){ // if call through driver invite api this load must be in tendered state...
    if(load.status !== 'tender') {
      throw new ApiError(httpStatus.NOT_FOUND, 'Load is not tendered load');
    }
  }
  if(updateBody.invitationSentToDrivers && updateBody.invitationSentToDrivers.length > 0) {
    if(!load.invitationSentToDrivers.some(each => each.id.toString() === updateBody.invitationSentToDrivers[0].id)){
      updateBody.invitationSentToDrivers = load.invitationSentToDrivers.concat(updateBody.invitationSentToDrivers);
    }else{
      updateBody.invitationSentToDrivers = load.invitationSentToDrivers
    }
  }
  if(updateBody.driverInterests && updateBody.driverInterests.length > 0) {
    if(!load.driverInterests.some(each => each.id.toString() === updateBody.driverInterests[0].id)){
      updateBody.driverInterests = load.driverInterests.concat(updateBody.driverInterests);
    }else{
      updateBody.driverInterests = load.driverInterests
    }
  }
  Object.assign(load, updateBody);
  await load.save();
  return load;
};

/**
 * Update tendered load by id
 * @param {ObjectId} loadId
 * @param {Object} updateBody
 * @returns {Promise<Load>}
 */
const updateTenderedLoadById = async (loadId, updateBody) => {
  return await updateLoadById(loadId, updateBody, true);
};

/**
 * Update driver's load by id
 * @param {ObjectId} loadId
 * @param {Object} updateBody
 * @returns {Promise<Load>}
 */
const updateDriverLoadById = async (req, updateBody) => {
  const loadId = req.params.loadId
  const load = await getLoadById(loadId);
  if (!load) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Load not found');
  }
  // console.log('GET LOAD BY ID');
  // console.log(load);
  // console.log('REQ DRIVER');
  // console.log(req.driver);
  // console.log(load?.inviteAcceptedByDriver.toString())
  // console.log(typeof load?.inviteAcceptedByDriver.toString())
  // console.log(req.driver._id.toString())
  // console.log(typeof req.driver._id.toString())
  // need to check is this load assigned to that same driver or not
  if(load?.inviteAcceptedByDriver.toString() !== req.driver._id.toString()){
    throw new ApiError(httpStatus.NOT_FOUND, 'Load is not assigned to that driver.');
  }
  // console.log('Body to update')
  // console.log(updateBody)
  // return false;
  Object.assign(load, updateBody);
  await load.save();
  return load;
};

/**
 * Accept driver invite
 * @param {ObjectId} loadId
 * @param {Object} updateBody
 * @returns {Promise<Load>}
 */
const updateLoadForDriverInvite = async (loadId, updateBody) => {
  const load = await getLoadById(loadId)
  if (!load) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Load not found')
  }
  // console.log('last invited driver')
  // console.log(loadId)
  // console.log(updateBody)
  // console.log(load?.isInviteAcceptedByDriver)
  // console.log(load?.lastInvitedDriver?.id)
  // console.log(updateBody.inviteAcceptedByDriver)
  if(load?.isInviteAcceptedByDriver === true || updateBody.inviteAcceptedByDriver !== load?.lastInvitedDriver?.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This invite is expired')
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
  queryAllLoads,
  updateLoadForDriverInvite,
  updateTenderedLoadById,
  updateDriverLoadById,
  queryLoadCount
};
