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
    }
  );
};

/**
 * Validate Reject driver invite log
 * @param {ObjectId} loadId
 * @param {ObjectId} driverId
 * @returns {Promise<InvitedDriver>}
 */
const isRejectDriverInviteAllowed = async (loadId, driverId) => {
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

module.exports = {
  createDriverInvite,
  rejectDriverInvite,
  isRejectDriverInviteAllowed,
};
