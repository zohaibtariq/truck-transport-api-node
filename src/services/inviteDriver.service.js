const httpStatus = require('http-status');
const { InvitedDriver } = require('../models');
const ApiError = require('../utils/ApiError');
const { inviteActionTypes } = require('../config/inviteActions');

/**
 * Create driver invite log
 * @param {ObjectId} loadId
 * @param {ObjectId} driverId
 * @param {ObjectId} adminId
 * @returns {Promise<InvitedDriver>}
 */
const createDriverInvite = async (loadId, driverId, adminId) => {
  return InvitedDriver.findOneAndUpdate(
    {
      invitedOnLoadId: loadId,
      inviteSentToDriverId: driverId,
      driverAction: inviteActionTypes.DORMANT,
      driverActionDateTime: null,
    },
    {
      invitedOnLoadId: loadId,
      inviteSentToDriverId: driverId,
      inviteSentByAdminId: adminId,
      inviteSentDateTime: new Date(),
      driverAction: inviteActionTypes.DORMANT,
      driverActionDateTime: null,
    },
    {
      new: true,
      upsert: true,
      useFindAndModify: false,
    }
  );
};

/**
 * Validate Reject driver invite log
 * @param {ObjectId} loadId
 * @param {ObjectId} driverId
 * @returns {Promise<InvitedDriver>}
 */
const isDriverInviteValid = async (loadId, driverId) => {
  const invitedDriverDoc = await InvitedDriver.findOne({
    invitedOnLoadId: loadId,
    inviteSentToDriverId: driverId,
    driverAction: inviteActionTypes.DORMANT,
    driverActionDateTime: null,
  });
  if (!invitedDriverDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invited driver not found against this load');
  }
  return invitedDriverDoc;
};

/**
 * Reject driver invite log
 * @param {ObjectId} loadId
 * @param {ObjectId} driverId
 * @returns {Promise<InvitedDriver>}
 */
const rejectDriverInvite = async (invitedDriverDoc) => {
  Object.assign(invitedDriverDoc, {
    driverAction: inviteActionTypes.REJECTED,
    driverActionDateTime: new Date(),
  });
  return invitedDriverDoc.save();
};

/**
 * Accept driver invite log
 * @param {ObjectId} loadId
 * @param {ObjectId} driverId
 * @returns {Promise<InvitedDriver>}
 */
const acceptDriverInvite = async (invitedDriverDoc) => {
  Object.assign(invitedDriverDoc, {
    driverAction: inviteActionTypes.ACCEPTED,
    driverActionDateTime: new Date(),
  });
  return invitedDriverDoc.save();
};

/**
 * cancelled load count of a driver
 * @param {Object} filter - Mongo filter
 * @returns {Promise<QueryResult>}
 */
const cancelledLoadCount = async (match) => {
  // console.log('cancelledLoadCount');
  // console.log(match);
  const cancelledLoads = await InvitedDriver.aggregate([
    {
      $match: match,
    },
    { $group: { _id: '$invitedOnLoadId', count: { $sum: 1 } } },
  ]);
  return cancelledLoads;
};

/**
 * get filtered driver invites
 * @param {Object} filter - Mongo filter
 * @returns {Promise<QueryResult>}
 */
const getFilteredDriverInvites = async (match) => {
  const cancelledLoads = await InvitedDriver.aggregate([
    {
      $match: match,
    },
  ]);
  return cancelledLoads;
};

module.exports = {
  createDriverInvite,
  rejectDriverInvite,
  isDriverInviteValid,
  cancelledLoadCount,
  acceptDriverInvite,
  getFilteredDriverInvites,
};
