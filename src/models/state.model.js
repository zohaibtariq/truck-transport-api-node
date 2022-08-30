const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const opts = {
  timestamps: {
    createdAt: 'createdAtDateTime',
    updatedAt: 'updatedAtDateTime'
  }
};
const stateSchema = Schema(
  {
    name: {
      type: String,
    },
    isoCode: {
      type: String,
    },
    countryCode: {
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

stateSchema.pre('save', async function (next) {
  next();
});

/**
 * @typedef State
 */
const State = mongoose.model('State', stateSchema);

module.exports = State;
