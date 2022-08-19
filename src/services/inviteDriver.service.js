const { InvitedDriver } = require('../models');

/**
 * Delete load by id
 * @param {ObjectId} loadId
 * @param {ObjectId} driverId
 * @param {ObjectId} adminId
 * @returns {Promise<InvitedDriver>}
 */
const createDriverInvite = async (loadId, driverId, adminId) => {
  return InvitedDriver.create({
    invitedOnLoadId: loadId,
    inviteSentToDriverId: driverId,
    inviteSentByAdminId: adminId,
    inviteSentDateTime: new Date(),
    driverAction: 'dormant',
    driverActionDateTime: null,
  });
};

module.exports = {
  createDriverInvite,
};
