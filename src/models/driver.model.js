const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const driverSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      // unique: true,
      trim: true,
      lowercase: true,
      default: '',
    },
    active: {
      type: Boolean,
      required: true,
      default: false,
    },
    first_name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: '',
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: '',
    },
    gender: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: '',
    },
    address: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: '',
    },
    zip: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: '',
    },
    state: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: '',
    },
    city: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: '',
    },
    country: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: '',
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: '',
    },
    ssn: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    tax_id: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    external_id: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    userId:{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: false,
    },
    email:{
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
driverSchema.plugin(toJSON);
driverSchema.plugin(paginate);

driverSchema.pre('save', async function (next) {
  next();
});

/**
 * @typedef Driver
 */
const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
