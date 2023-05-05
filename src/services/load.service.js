const httpStatus = require('http-status');
const { Load, InvitedDriver, DriverInterest, PaymentLoad } = require('../models');
const ApiError = require('../utils/ApiError');
const _ = require('lodash');
const {
  onlyCountryNameProjectionString,
  onlyStateNameProjectionString,
  onlyCityNameProjectionString,
  onlyProfileAddressLocationProjectionString,
  onlyGoodsProjectionString,
  onlyChargesProjectionString,
} = require('../config/countryStateCityProjections');
// const inviteDriverService = require('../../src/services/inviteDriver.service');
const inviteDriverService = require('./inviteDriver.service');
const fcmService = require('./fcm.service');
const { loadStatusTypes } = require('../config/loads');
const { inviteActionTypes } = require('../config/inviteActions');
const mongoose = require('mongoose');

/**
 * Create a load
 * @param {Object} loadBody
 * @returns {Promise<Load>}
 */
const createLoad = async (loadBody) => {
  let kickStartNum = 49999;
  let loadCount = kickStartNum;
  const loadMaxCodeRow = await Load.find({}).sort({ code: -1 }).limit(1);
  if (loadMaxCodeRow.length > 0) {
    const maxCodeObj = loadMaxCodeRow[0];
    if (maxCodeObj && maxCodeObj?.code) loadCount = parseInt(maxCodeObj?.code);
  }
  loadBody.code = parseInt(loadCount) + 1;
  let bolHashCount = kickStartNum;
  const bolHashMaxCodeRow = await Load.find({}).sort({ bolHash: -1 }).limit(1);
  if (bolHashMaxCodeRow.length > 0) {
    const bolHashObj = bolHashMaxCodeRow[0];
    if (bolHashObj && bolHashObj?.bolHash) bolHashCount = parseInt(bolHashObj?.bolHash);
  }
  loadBody.bolHash = parseInt(bolHashCount) + 1;
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
      $match: match,
    },
    { $group: { _id: '$status', count: { $sum: 1 } } },
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
    {
      path: 'origin',
      select:
        'location.address1 location.name location.country location.state location.city location.zip location.phone location.fax email',
      populate: [
        { path: 'location.country', select: onlyCountryNameProjectionString },
        { path: 'location.state', select: onlyStateNameProjectionString },
        { path: 'location.city', select: onlyCityNameProjectionString },
      ],
    },
    {
      path: 'destination',
      select:
        'location.address1 location.name location.country location.state location.city location.zip location.phone location.fax email',
      populate: [
        { path: 'location.country', select: onlyCountryNameProjectionString },
        { path: 'location.state', select: onlyStateNameProjectionString },
        { path: 'location.city', select: onlyCityNameProjectionString },
      ],
    },
    { path: 'lastInvitedDriver', select: 'image first_name last_name mobile phone active' },
    { path: 'driverInterests.id', select: 'first_name last_name ratePerMile active' }, // must not select id in select it will auto populate
    {
      path: 'customer',
      select: onlyProfileAddressLocationProjectionString,
      populate: [
        { path: 'location.country', select: onlyCountryNameProjectionString },
        { path: 'location.state', select: onlyStateNameProjectionString },
        { path: 'location.city', select: onlyCityNameProjectionString },
      ],
    },
    {
      path: 'goods.good',
      select: onlyGoodsProjectionString,
    },
    {
      path: 'charges.type',
      select: onlyChargesProjectionString,
    },
  ];
  return Load.findById(id).populate($populate);
};

const getOnlyLoadById = async (id) => {
  return Load.findById(id);
};

/**
 * Update load by id
 * @param {ObjectId} loadId
 * @param {Object} updateBody
 * @returns {Promise<Load>}
 */
const updateLoadById = async (loadId, updateBody, checkTenderedStatus = false, userId = null) => {
  const load = await getLoadById(loadId);
  if (!load) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Load not found');
  }
  if (checkTenderedStatus === true) {
    // if call through driver invite api this load must be in tendered state...
    if (load.status !== 'tender') {
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
  if (updateBody?.invitationSentToDriverId && updateBody?.invitationSentToDriverId.length > 0) {
    if (
      load.status !== loadStatusTypes.TENDER &&
      load.status !== loadStatusTypes.PENDING &&
      load.status !== loadStatusTypes.ASSIGNED
    )
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Driver invite can only be sent on loads with status (' +
          loadStatusTypes.PENDING +
          ', ' +
          loadStatusTypes.TENDER +
          ')'
      );
    updateBody.lastInvitedDriver = updateBody?.invitationSentToDriverId;
    updateBody.status = loadStatusTypes.ASSIGNED; // TODO:: set load to invited, ASK FROM AWAIS
    await fcmService.sendInviteDriverNotificationToDriver(updateBody?.invitationSentToDriverId, load);
    await inviteDriverService.createDriverInvite(loadId, updateBody?.invitationSentToDriverId, userId);
    delete updateBody.invitationSentToDriverId; // bcz we don't want to create this key in db model
  }
  if (updateBody?.driverInterests && updateBody?.driverInterests.length > 0) {
    const driverInterestFound = load?.driverInterests.some(
      (eachInterest) => eachInterest.id._id.toString() === updateBody?.driverInterests[0].id.toString()
    );
    if (driverInterestFound) {
      updateBody.driverInterests = load?.driverInterests;
    } else {
      updateBody.driverInterests = load?.driverInterests.concat(updateBody?.driverInterests);
    }
  }
  // console.log('FETCHED LOAD BEFORE UPDATE');
  // console.log(load);
  // console.log('UPDATED BODY WITH LOAD BEFORE UPDATE');
  // console.log(updateBody);
  Object.assign(load, { ...updateBody, updatedByUser: userId, updatedByUserDateTime: new Date() });
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
 * Update tendered load by id
 * @param {ObjectId} loadId
 * @param {ObjectId} driverId
 * @returns {Promise<DriverInterest>}
 */
const storeDriverInterestsOnLoad = async (loadId, driverId) => {
  return DriverInterest.findOneAndUpdate(
    {
      interestsOnLoadId: loadId,
      interestsByDriverId: driverId,
    },
    {
      interestsOnLoadId: loadId,
      interestsByDriverId: driverId,
    },
    {
      new: true,
      upsert: true,
      useFindAndModify: false,
    }
  );
};

/**
 * Update driver's load by id
 * @param {ObjectId} loadId
 * @param {Object} updateBody
 * @returns {Promise<Load>}
 */
const updateDriverLoadById = async (req, updateBody) => {
  const loadId = req.params.loadId;
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
  if (
    load?.inviteAcceptedByDriver === undefined ||
    load?.inviteAcceptedByDriver?.toString() !== req?.driver?._id?.toString()
  ) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Load is not assigned to that driver.');
  }
  // console.log('Body to update')
  // console.log(updateBody)
  // return false;
  if (req?.driver?._id) {
    // means getting called from driver app
    if (updateBody?.onTheWayToDelivery && updateBody?.deliveredToCustomer) {
      throw new ApiError(httpStatus.FORBIDDEN, 'please pass one key in the body at a time');
    }
    if (updateBody?.onTheWayToDelivery && updateBody?.onTheWayToDelivery === true) {
      updateBody.loadEnroutedDateTime = new Date();
    } else if (updateBody?.deliveredToCustomer && updateBody?.deliveredToCustomer === true) {
      updateBody.loadDeliveredDateTime = new Date();
    }
  }
  Object.assign(load, { ...updateBody, updatedByDriver: req?.driver?._id, updatedByDriverDateTime: new Date() });
  Object.assign(load, setLoadStatus(load));
  await load.save();
  return load;
};

const setLoadStatus = async (load) => {
  if (
    load.invitationSentToDriver === true &&
    load.isInviteAcceptedByDriver === true &&
    load.onTheWayToDelivery === true &&
    load.deliveredToCustomer === false
  ) {
    load.status = 'enroute';
  } else if (
    load.invitationSentToDriver === true &&
    load.isInviteAcceptedByDriver === true &&
    load.onTheWayToDelivery === true &&
    load.deliveredToCustomer === true
  ) {
    load.status = 'completed';
  }
  return load;
};

/**
 * Accept driver invite
 * @param {ObjectId} loadId
 * @param {Object} updateBody
 * @returns {Promise<Load>}
 */
const updateLoadForDriverInvite = async (loadId, updateBody) => {
  const load = await getLoadById(loadId);
  if (!load) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Load not found');
  }
  // console.log('last invited driver')
  // console.log(loadId)
  // console.log(updateBody)
  // console.log(load?.isInviteAcceptedByDriver)
  // console.log(load?.lastInvitedDriver?.id)
  // console.log(updateBody.inviteAcceptedByDriver)
  if (
    load?.isInviteAcceptedByDriver === true ||
    updateBody.inviteAcceptedByDriver?.toString() !== load?.lastInvitedDriver?.id?.toString()
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This invite is expired');
  }
  Object.assign(load, updateBody);
  await load.save();
  return load;
};

/**
 * Reject driver invite
 * @param req
 * @returns {Promise<Load>}
 */
const isUpdateLoadForDriverRejectInviteAllowed = async (loadId, driverId) => {
  const load = await getLoadById(loadId);
  if (!load) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Load not found');
  }
  if (driverId?.toString() !== load?.lastInvitedDriver?.id?.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Driver is not invited against provided load.');
  }
  return load;
};

/**
 * Reject driver invite
 * @param req
 * @returns {Promise<Load>}
 */
const updateLoadForDriverRejectInvite = async (load) => {
  Object.assign(load, {
    inviteAcceptedByDriverTime: null,
    isInviteAcceptedByDriver: false,
    invitationSentToDriver: false,
    driverRatePerMile: 0,
    status: loadStatusTypes.TENDER,
  });
  load.inviteAcceptedByDriver = undefined;
  delete load.inviteAcceptedByDriver;
  load.lastInvitedDriver = undefined;
  delete load.lastInvitedDriver;
  // console.log('FINAL LOAD BEFORE SAVE IS 4')
  // console.log(load)
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
      $match: match,
    },
    { $group: { _id: '$invitedOnLoadId' /*count: { $sum: 1 }*/ } },
  ]);
  return loads;
};

/**
 * Update Load In Response Of Com Data Payment
 * @param loadId
 * @param updateBody
 * @returns {Promise<Query<T extends Document ? T : (T & Document<any, any, T> & TMethods), T extends Document ? T : (T & Document<any, any, T> & TMethods), TQueryHelpers, T> & TQueryHelpers>}
 */
const updateLoadInResponseOfComDataPayment = async (loadId, updateBody) => {
  return Load.findOneAndUpdate(
    {
      _id: loadId,
    },
    updateBody,
    {
      new: false,
      upsert: false,
      useFindAndModify: false,
    }
  );
  // const load = await getLoadById(loadId)
  // Object.assign(load, {
  //   "inviteAcceptedByDriverTime": null,
  //   "isInviteAcceptedByDriver": false,
  //   "invitationSentToDriver": false,
  //   "driverRatePerMile": 0,
  //   "status": loadStatusTypes.TENDER,
  // });
  // load.inviteAcceptedByDriver = undefined
  // delete load.inviteAcceptedByDriver
  // load.lastInvitedDriver = undefined
  // delete load.lastInvitedDriver
  // console.log('FINAL LOAD BEFORE SAVE IS 4')
  // console.log(load)
  // await load.save();
  // return load;
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

const createLoadPaymentLog = async (loadPaymentLogBody) => {
  return PaymentLoad.create(loadPaymentLogBody);
};

const getPaymentTransactions = async (loadId = '', driverId = '') => {
  const match = {};
  if (loadId !== '') match.loadId = mongoose.Types.ObjectId(loadId);
  if (driverId !== '') match.driverId = mongoose.Types.ObjectId(driverId);
  // console.log('match');
  // console.log(match);
  if (Object.keys(match).length > 0) {
    return PaymentLoad.aggregate([{ $match: match }]);
  }
  return [];
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
  queryLoadCount,
  queryPendingLoadCount,
  updateLoadForDriverRejectInvite,
  isUpdateLoadForDriverRejectInviteAllowed,
  storeDriverInterestsOnLoad,
  updateLoadInResponseOfComDataPayment,
  createLoadPaymentLog,
  getPaymentTransactions,
};
