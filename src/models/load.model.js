const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const { toJSON, paginate } = require('./plugins');
const { loadStatuses } = require('../config/loads');

const { Schema } = mongoose;
const opts = {
  timestamps: {
    createdAt: 'createdAtDateTime',
    updatedAt: 'updatedAtDateTime',
  },
};
const driverInterests = Schema({
  id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Driver',
  },
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
  vin: String,
  good: {
    // this will map to goods
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Good',
  },
});
const charges = Schema({
  id: {
    type: mongoose.SchemaTypes.ObjectId,
  },
  type: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Charge',
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
  notes: String,
});
const deliveredImages = Schema({
  id: {
    type: mongoose.SchemaTypes.ObjectId,
  },
  image: {
    type: String,
    default: null,
  },
  year: Number,
  month: Number,
});
const enroutedImages = Schema({
  id: {
    type: mongoose.SchemaTypes.ObjectId,
  },
  image: {
    type: String,
    default: null,
  },
  year: Number,
  month: Number,
});
const loadSchema = Schema(
  {
    goods: [goods],
    charges: [charges],
    deliveredImages: [deliveredImages],
    enroutedImages: [enroutedImages],
    driverInterests: [driverInterests],
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
    driverRatePerMile: {
      type: Number,
      default: 0,
      required: true,
      trim: true,
    },
    bolHash: {
      type: Number,
      default: '',
      required: false,
      trim: true,
    },
    shipperRef: {
      type: String,
      default: '',
      required: false,
      trim: true,
    },
    poHash: {
      type: String,
      default: '',
      required: false,
      trim: true,
    },
    proCode: {
      type: String,
      default: '',
      required: false,
      trim: true,
    },
    status: {
      type: String,
      enum: loadStatuses,
      default: 'pending',
      required: true,
      trim: true,
      index: true,
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
    onTheWayToDelivery: {
      type: Boolean,
      default: false,
    },
    deliveredToCustomer: {
      type: Boolean,
      default: false,
    },
    inviteAcceptedByDriverTime: {
      type: Date,
      default: null,
      required: false,
    },
    isInviteAcceptedByDriver: {
      type: Boolean,
      default: false,
    },
    signatureImage: {
      image: {
        type: String,
        default: null,
      },
      year: Number,
      month: Number,
    },
    loadEnroutedDateTime: {
      type: Date,
      default: null,
    },
    loadDeliveredDateTime: {
      type: Date,
      default: null,
    },
    inviteAcceptedByDriver: {
      // this will map to drivers
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Driver',
    },
    updatedByDriver: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Driver',
    },
    updatedByDriverDateTime: {
      type: Date,
      default: null,
    },
    updatedByUser: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    updatedByUserDateTime: {
      type: Date,
      default: null,
    },
    createdByUser: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    lastInvitedDriver: {
      // this will map to drivers
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Driver',
    },
    customer: {
      // this will map to isCustomer key of (profile, type, profile)
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Profile',
    },
    destination: {
      // this will map to isCustomer key of (profile, type, profile)
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Profile',
    },
    origin: {
      // this will map to isShipper key of (profile, type, profile)
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Profile',
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
