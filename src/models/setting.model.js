const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const { Schema } = mongoose;
const opts = {
  timestamps: {
    createdAt: 'createdAtDateTime',
    updatedAt: 'updatedAtDateTime',
  },
};
const settingSchema = Schema(
  {
    key: {
      type: String,
      default: 'key',
      required: true,
      trim: true,
      unique: true,
      index: true,
      uniqueCaseInsensitive: true,
    },
    value: {
      type: String,
      default: '',
      required: true,
      uniqueCaseInsensitive: true,
    },
  },
  opts
);

// add plugin that converts mongoose to json
settingSchema.plugin(toJSON);

settingSchema.pre('save', async function (next) {
  next();
});

/**
 * @typedef Setting
 */
const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
