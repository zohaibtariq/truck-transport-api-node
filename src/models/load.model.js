const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const {loadStatuses, chargesTypes} = require("../config/loads");
var uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;
const opts = {
  timestamps: {
    createdAt: 'createdAtDateTime',
    updatedAt: 'updatedAtDateTime'
  }
};
const invitationSentToDrivers = Schema({
  id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Driver",
  }
});
const goods = Schema({
  id: {
    type: mongoose.SchemaTypes.ObjectId,
  },
  make: String,
  model: String,
  year: Number,
  value: Number,
  quantity: Number,
  pieces: Number,
  userQuantity: Number,
  weight: Number,
  tonnage: Number,
  grWeight: Number,
  palletes: Number,
  frClass: Number,
  notes: String,
  good: { // this will map to goods
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Good",
  },
});
const charges = Schema({
  id: {
    type: mongoose.SchemaTypes.ObjectId,
  },
  type: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Charge",
  },
  rate: Number,
  quantity: Number,
  payableToDriver: {
    type: Boolean,
    default: false,
  },
  billableToCustomer: {
    type: Boolean,
    default: false,
  },
  notes: String
});
const loadSchema = Schema(
  {
    goods: [
      goods
    ],
    charges: [
      charges
    ],
    invitationSentToDrivers: [
      invitationSentToDrivers
    ],
    code: {
      type: String,
      default: '',
      required: true,
      trim: true,
      unique: true,
      index: true,
      uniqueCaseInsensitive: true,
    },
    distanceMiles: {
      type: Number,
      default: 0,
      required: true,
      trim: true,
    },
    ratePerMile: {
      type: Number,
      default: 0,
      required: true,
      trim: true,
    },
    bolHash: {
      type: String,
      default: '',
      required: true,
      trim: true,
    },
    shipperRef: {
      type: String,
      default: '',
      required: true,
      trim: true,
    },
    poHash: {
      type: String,
      default: '',
      required: true,
      trim: true,
    },
    proCode: {
      type: String,
      default: '',
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: loadStatuses,
      default: 'pending',
      required: true,
      trim: true,
      index: true
    },
    notes: {
      type: String,
      default: '',
      required: false,
      trim: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
      required: true,
    },
    balanceAmount: {
      type: Number,
      default: 0,
      required: true,
    },
    invitationSentToDriver: {
      type: Boolean,
      default: false,
    },
    inviteAcceptedByDriver: {
      type: Boolean,
      default: false,
    },
    onTheWayToDelivery: {
      type: Boolean,
      default: false,
    },
    deliveredToCustomer: {
      type: Boolean,
      default: false,
    },
    driver: { // this will map to drivers
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Driver",
    },
    customer: { // this will map to isCustomer key of (profile, type, product)
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Product",
    },
    destination: { // this will map to isCustomer key of (profile, type, product)
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Product",
    },
    origin: { // this will map to isShipper key of (profile, type, product)
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Product",
    },
  },
  opts
);

// add plugin that converts mongoose to json
loadSchema.plugin(toJSON);
loadSchema.plugin(paginate);
loadSchema.plugin(uniqueValidator);

loadSchema.pre('save', async function (next) {
  next();
});

/**
 * @typedef Load
 */
const Load = mongoose.model('Load', loadSchema);

module.exports = Load;
