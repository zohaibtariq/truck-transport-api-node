const loadStatusTypes = {
  PENDING: 'pending',
  TENDER: 'tender',
  INVITED: 'invited',
  ASSIGNED: 'assigned',
  ACTIVE: 'active',
  ENROUTE: 'enroute',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};
const loadStatuses = [
  loadStatusTypes.PENDING,
  loadStatusTypes.TENDER,
  loadStatusTypes.ASSIGNED,
  loadStatusTypes.INVITED,
  loadStatusTypes.ACTIVE,
  loadStatusTypes.ENROUTE,
  loadStatusTypes.COMPLETED,
  loadStatusTypes.CANCELLED,
];

module.exports = {
  loadStatuses,
  loadStatusTypes,
};
