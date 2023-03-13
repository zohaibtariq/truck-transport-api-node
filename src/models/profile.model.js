const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');

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
    required: true,
  },
  state: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'State',
    required: true,
  },
  city: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'City',
    required: true,
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

const profileSchema = mongoose.Schema(
  {
    contactPersons: [ContactPersonSchema],
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
    officeHours: {
      type: String,
      default: '',
      required: false,
      trim: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: false,
    },
    email: {
      type: String,
      required: false,
      // unique: true,
      trim: true,
      lowercase: true,
      default: '',
      validate(value) {
        // console.log('value email');
        // console.log(value);
        if (value !== '' && value !== null && !validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: false,
      trim: true,
      default: '',
      minlength: 0,
      validate(value) {
        // console.log('value password');
        // console.log(value);
        if (value !== '' && value !== null && (!value.match(/\d/) || !value.match(/[a-zA-Z]/))) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
  },
  {
    timestamps: true,
  }
);

// profileSchema.virtual('countryObj', {
//   ref: 'Country',
//   localField: 'location.country',
//   foreignField: 'isoCode'
// });

// profileSchema.pre('find', function () {
//   this.populate('countryObj');
// });

// add plugin that converts mongoose to json
profileSchema.plugin(toJSON);
profileSchema.plugin(paginate);
profileSchema.plugin(uniqueValidator);

/**
 * Check if email is taken
 * @param {string} email - The profile's email
 * @param {ObjectId} [excludeProfileId] - The id of the profile to be excluded
 * @returns {Promise<boolean>}
 */
profileSchema.statics.isEmailTaken = async function (email, excludeProfileId) {
  // console.log('isEmailTaken');
  // console.log(email);
  if (email !== '' && email !== null) {
    const driver = await this.findOne({ email, _id: { $ne: excludeProfileId } });
    return !!driver;
  }
  return false;
};

/**
 * Check if password matches the profile's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
profileSchema.methods.isPasswordMatch = async function (password) {
  // console.log('isPasswordMatch');
  const profile = this;
  // console.log(profile.password);
  return bcrypt.compare(password, profile.password);
};

profileSchema.pre('save', async function (next) {
  const profile = this;
  if (profile.password !== '' && profile.password !== null && profile.isModified('password')) {
    // console.log('isModified password');
    // console.log(profile.password);
    profile.password = await bcrypt.hash(profile.password, 8);
  }
  next();
});

profileSchema.set('toObject', { virtuals: true });
profileSchema.set('toJSON', { virtuals: true });

/**
 * @typedef Profile
 */
const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
