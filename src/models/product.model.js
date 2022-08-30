const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const uniqueValidator = require("mongoose-unique-validator");
const Joi = require("joi");
const LocationSchema = mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    default: '',
  },
  extendedNotes: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    default: '',
  },
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    default: '',
  },
  address1: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    default: '',
  },
  address2: {
    type: String,
    required: false,
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
  country: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Country',
    required: true
  },
  state: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'State',
    required: true
  },
  city: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'City',
    required: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    default: '',
  },
  fax: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    default: '',
  },
  contact: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    default: '',
  },
  cell: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    default: '',
  },
  appt: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    default: '',
  },
  externalId: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    default: '',
  },
});

const ContactPersonSchema = mongoose.Schema({
  type: String,
  name: String,
  phone: String,
  fax: String,
  email: String,
});

const productSchema = mongoose.Schema(
  {
    contactPersons: [
      ContactPersonSchema
    ],
    location: LocationSchema,
    code: {
      type: String,
      default: '',
      required: true,
      trim: true,
      unique: true,
      index: true,
      uniqueCaseInsensitive: true,
    },
    isCustomer: {
      type: Boolean,
      default: false,
    },
    isBillTo: {
      type: Boolean,
      default: false,
    },
    isShipper: {
      type: Boolean,
      default: false,
    },
    isConsignee: {
      type: Boolean,
      default: false,
    },
    isBroker: {
      type: Boolean,
      default: false,
    },
    isForwarder: {
      type: Boolean,
      default: false,
    },
    isTerminal: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
    },
    mcId: {
      type: String,
      default: '',
      required: false,
      trim: true,
      lowercase: true,
    },
    ediId: {
      type: String,
      default: '',
      required: false,
      trim: true,
      lowercase: true,
    },
    notes: {
      type: String,
      default: '',
      required: false,
      trim: true,
    },
    email: {
      type: String,
      default: '',
      required: false,
      trim: true,
      lowercase: true,
    },
    officeHours: {
      type: String,
      default: '',
      required: false,
      trim: true,
    },
    userId:{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

// productSchema.virtual('countryObj', {
//   ref: 'Country',
//   localField: 'location.country',
//   foreignField: 'isoCode'
// });

// productSchema.pre('find', function () {
//   this.populate('countryObj');
// });

// add plugin that converts mongoose to json
productSchema.plugin(toJSON);
productSchema.plugin(paginate);
productSchema.plugin(uniqueValidator);
productSchema.pre('save', async function (next) {
  next();
});

productSchema.set('toObject', { virtuals: true })
productSchema.set('toJSON', { virtuals: true })

/**
 * @typedef Product
 */
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
