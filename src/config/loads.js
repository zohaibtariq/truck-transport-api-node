const loadStatusTypes = {
  PENDING: 'pending',
  TENDER: 'tender',
  // INVITED: 'invited',
  ASSIGNED: 'assigned', // this is treated as invited by admin
  ACTIVE: 'active', // this is treated as invite accepted by driver
  ENROUTE: 'enroute',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};
const loadStatuses = [
  loadStatusTypes.PENDING,
  loadStatusTypes.TENDER,
  loadStatusTypes.ASSIGNED,
  // loadStatusTypes.INVITED,
  loadStatusTypes.ACTIVE,
  loadStatusTypes.ENROUTE,
  loadStatusTypes.COMPLETED,
  loadStatusTypes.CANCELLED,
];

module.exports = {
  loadStatuses,
  loadStatusTypes,
};
