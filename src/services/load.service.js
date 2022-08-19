const httpStatus = require('http-status');
const { Load, InvitedDriver} = require('../models');
const ApiError = require('../utils/ApiError');
const _ = require('lodash');
const {
  onlyCountryNameProjectionString,
  onlyStateNameProjectionString,
  onlyCityNameProjectionString,
} = require('../config/countryStateCityProjections');
const inviteDriverService = require('../../src/services/inviteDriver.service');
const { loadStatusTypes } = require('../config/loads');

/**
 * Create a load
 * @param {Object} loadBody
 * @returns {Promise<Load>}
 */
const createLoad = async (loadBody) => {
  const loadCount = await Load.countDocuments();
  // console.log('LOAD COUNT');
  // console.log(loadCount);
  loadBody.code = 40000 + ((parseInt(loadCount) > 0) ? parseInt(loadCount) + 1 : parseInt(loadCount));
  // console.log('LOAD CODE');
  // console.log(loadBody.code);
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
 * @param id
 * @param isPopulate
 */
const getLoadById = async (id, isPopulate = false) => {
  $populate = [
    'goods.good',
    'charges.type',
    {
      path: 'origin',
      select: 'location.address1 location.country location.state location.city location.zip location.phone location.fax email',
      populate: [
        { path: 'location.country', select: onlyCountryNameProjectionString },
        { path: 'location.state', select: onlyStateNameProjectionString },
        { path: 'location.city', select: onlyCityNameProjectionString },
      ]
    },
    {
      path: 'destination',
      select: 'location.address1 location.country location.state location.city location.zip location.phone location.fax email',
      populate: [
        { path: 'location.country', select: onlyCountryNameProjectionString },
        { path: 'location.state', select: onlyStateNameProjectionString },
        { path: 'location.city', select: onlyCityNameProjectionString },
      ]
    },
    { path: 'lastInvitedDriver', select: 'image first_name last_name mobile phone active' },
    { path: 'driverInterests.id', select: 'first_name last_name ratePerMile active' } // must not select id in select it will auto populate
  ];
  return Load.findById(id).populate($populate);
};

const getOnlyLoadById = async (id) => {
  return Load.findById(id)
}

/**
 * Update load by id
 * @param {ObjectId} loadId
 * @param {Object} updateBody
 * @returns {Promise<Load>}
 */
const updateLoadById = async (loadId, req, checkTenderedStatus = false) => {
  const updateBody = req.body;
  const load = await getLoadById(loadId);
  if (!load) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Load not found');
  }
  if(checkTenderedStatus === true){ // if call through driver invite api this load must be in tendered state...
    if(load.status !== 'tender') {
      throw new ApiError(httpStatus.NOT_FOUND, 'Load is not tendered load');
    }
  }
  // if(updateBody.invitationSentToDrivers && updateBody.invitationSentToDrivers.length > 0) {
  //   if(!load.invitationSentToDrivers.some(each => each.id.toString() === updateBody.invitationSentToDrivers[0].id)){
  //     updateBody.invitationSentToDrivers = load.invitationSentToDrivers.concat(updateBody.invitationSentToDrivers);
  //   }else{
  //     updateBody.invitationSentToDrivers = load.invitationSentToDrivers
  //   }
  // }
  if(updateBody.invitationSentToDriverId && updateBody.invitationSentToDriverId.length > 0) {
    if(load.status !== loadStatusTypes.TENDER && load.status !== loadStatusTypes.PENDING)
      throw new ApiError(httpStatus.NOT_FOUND, 'Driver invite can only be sent on loads with status ('+loadStatusTypes.PENDING+', '+loadStatusTypes.TENDER+')');
    updateBody.lastInvitedDriver = updateBody.invitationSentToDriverId
    await inviteDriverService.createDriverInvite(loadId, updateBody.invitationSentToDriverId, req.user.id)
    delete updateBody.invitationSentToDriverId // bcz we dont want to create this key in db modle
  }
  if(updateBody.driverInterests && updateBody.driverInterests.length > 0) {
    if(!load.driverInterests.some(each => each.id.toString() === updateBody.driverInterests[0].id)){
      updateBody.driverInterests = load.driverInterests.concat(updateBody.driverInterests);
    }else{
      updateBody.driverInterests = load.driverInterests
    }
  }
  // console.log('FETCHED LOAD BEFORE UPDATE');
  // console.log(load);
  // console.log('UPDATED BODY WITH LOAD BEFORE UPDATE');
  // console.log(updateBody);
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
  // console.log("inviteAcceptedByDriver");
  // console.log(load?.inviteAcceptedByDriver);
  if(load?.inviteAcceptedByDriver === undefined || (load?.inviteAcceptedByDriver?.toString() !== req?.driver?._id?.toString())){
    throw new ApiError(httpStatus.NOT_FOUND, 'Load is not assigned to that driver.');
  }
  // console.log('Body to update')
  // console.log(updateBody)
  // return false;
  Object.assign(load, updateBody);
  Object.assign(load, setLoadStatus(load));
  await load.save();
  return load;
};

const setLoadStatus = async (load) => {
  if(load.invitationSentToDriver === true && load.isInviteAcceptedByDriver === true && load.onTheWayToDelivery === true && load.deliveredToCustomer === false){
    load.status = 'enroute'
  }else if(load.invitationSentToDriver === true && load.isInviteAcceptedByDriver === true && load.onTheWayToDelivery === true && load.deliveredToCustomer === true){
    load.status = 'completed'
  }
  return load;
}

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

const queryPendingLoadCount = async (match) => {
  const loads = await InvitedDriver.aggregate([
    {
      "$match": match
    },
    { "$group": { _id: "$invitedOnLoadId", /*count: { $sum: 1 }*/ } }
  ])
  return loads;
};

/*const queryPendingLoadCount = async (match) => {
  console.log('queryPendingLoadCount')
  console.log(match)
  const loadPromise = await InvitedDriver.aggregate([
    {
      "$match": match
    },
    // { "$group": { _id: "$invitedOnLoadId", count: { $sum: 1 } } }
  ])
    // .exec()
  // .exec().lean()
  //   .exec((docs) => {
  //   console.log("docs");
  //   console.log(docs);
  // }, () => {
  //
  // });
  // return loads;
  loadPromise.then((data) => {
    console.log("data");
    return data;
  }).catch((err) => {
    console.log("err");
    return err;
  });
};*/

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
  queryLoadCount,
  queryPendingLoadCount
};
