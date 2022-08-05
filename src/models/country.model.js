const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const opts = {
  timestamps: {
    createdAt: 'createdAtDateTime',
    updatedAt: 'updatedAtDateTime'
  }
};
const timezone = Schema({
  id: {
    type: mongoose.SchemaTypes.ObjectId,
  },
  zoneName: String,
  gmtOffset: Number,
  gmtOffsetName: String,
  abbreviation: String,
  tzName: String,
});
const countrySchema = Schema(
  {
    timezones: [
      timezone
    ],
    isoCode: {
      type: String,
      default: '',
      required: true,
      trim: true,
      unique: true,
      index: true,
      uniqueCaseInsensitive: true,
    },
    name: {
      type: String,
    },
    phonecode: {
      type: String,
    },
    flag: {
      type: String,
    },
    currency: {
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

countrySchema.pre('save', async function (next) {
  next();
});

/**
 * @typedef Country
 */
const Country = mongoose.model('Country', countrySchema);

module.exports = Country;
