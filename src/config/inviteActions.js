const inviteActionTypes = {
  DORMANT: 'dormant',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};
const inviteActions = [inviteActionTypes.DORMANT, inviteActionTypes.ACCEPTED, inviteActionTypes.REJECTED];
module.exports = {
  inviteActions,
  inviteActionTypes,
};
