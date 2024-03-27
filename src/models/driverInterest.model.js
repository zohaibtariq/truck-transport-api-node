const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const opts = {
  timestamps: {
    createdAt: 'createdAtDateTime',
    updatedAt: 'updatedAtDateTime',
  },
};
const driverInterestSchema = mongoose.Schema(
  {
    interestsOnLoadId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Load',
      required: true,
    },
    interestsByDriverId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Driver',
      required: true,
    },
  },
  opts
);
driverInterestSchema.plugin(toJSON);
/**
 * @typedef DriverInterest
 */
const DriverInterest = mongoose.model('DriverInterest', driverInterestSchema);
module.exports = DriverInterest;
