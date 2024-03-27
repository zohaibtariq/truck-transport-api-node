const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const Schema = mongoose.Schema;
const opts = {
  timestamps: {
    createdAt: 'createdAtDateTime',
    updatedAt: 'updatedAtDateTime',
  },
};
const loadSchema = Schema(
  {
    name: {
      type: String,
      default: '',
      required: true,
      trim: true,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      required: true,
      trim: true,
    },
    rate: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  opts
);

// add plugin that converts mongoose to json
loadSchema.plugin(toJSON);
loadSchema.plugin(paginate);

loadSchema.pre('save', async function (next) {
  next();
});

/**
 * @typedef Load
 */
const Charge = mongoose.model('Charge', loadSchema);

module.exports = Charge;
