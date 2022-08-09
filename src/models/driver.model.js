const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');

const CertificationSchema = mongoose.Schema({
  drivingSchool: String,
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
  contact: String,
  phone: String,
  startDate: Object,
  graduationDate: Object,
  rank: String,
  recruiter: String,
  referredBy: String,
  comments: String,
});

const driverSchema = mongoose.Schema(
  {
    // _id: Schema.Types.ObjectId,
    equipmentExperienceEndorsements: {
      flatbed: Boolean,
      van: Boolean,
      refrigerated: Boolean,
      dropDeck: Boolean,
      towawayVehicles: Boolean,
      passengerVehicles: Boolean,
      dblTriple: Boolean,
      tanker: Boolean,
      hazMat: Boolean,
      hazMatTanker: Boolean,
      airBrake: Boolean,
      endorsementsRadio: String,
    },
    expirationLogSettings: {
      lastDrugTest: Object,
      nextDrugTest: Object,
      lastAlcohalTest: Object,
      nextAlcohalTest: Object,
      physExamExp: Object,
      oORegExp: Object,
      oOTractorExp: Object,
      oOTrailerExp: Object,
      oOInusrExp: Object,
      otherInusrExp: Object,
      mvaExp: Object,
      arcPrcExp: Object,
      hazMatTraining: Object,
      annualReview: Object,
      milesDriven: String,
      yrsExp: String,
    },
    certifications: [CertificationSchema],
    code: {
      type: String,
      default: '',
      required: true,
      trim: true,
      unique: true,
      index: true,
      uniqueCaseInsensitive: true,
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
    ratePerMile: {
      type: Number,
      required: true,
      default: 0,
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
    // inviteAcceptedByDriver: {
    //   type: Boolean,
    //   default: false,
    //   required: true,
    // },
    dispatcher: {
      // previously userId
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      default: '',
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      default: '',
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
driverSchema.plugin(toJSON);
driverSchema.plugin(paginate);
driverSchema.plugin(uniqueValidator);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
driverSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const driver = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!driver;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
driverSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

driverSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef Driver
 */
const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
