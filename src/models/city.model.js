const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const opts = {
  timestamps: {
    createdAt: 'createdAtDateTime',
    updatedAt: 'updatedAtDateTime'
  }
};
const citySchema = Schema(
  {
    name: {
      type: String,
    },
    countryCode: {
      type: String,
    },
    stateCode: {
      type: String,
    },
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    }
  },
  opts
);

citySchema.pre('save', async function (next) {
  next();
});

/**
 * @typedef City
 */
const City = mongoose.model('City', citySchema);

module.exports = City;
