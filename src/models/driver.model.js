const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const uniqueValidator = require("mongoose-unique-validator");
const Joi = require("joi");
// const Schema = mongoose.Schema;
const CertificationSchema = mongoose.Schema({
  drivingSchool: String,
  city: String,
  state: String,
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
    certifications: [
      CertificationSchema
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
    // inviteAcceptedByDriver: {
    //   type: Boolean,
    //   default: false,
    //   required: true,
    // },
    dispatcher:{ // previously userId
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
driverSchema.plugin(uniqueValidator);

driverSchema.pre('save', async function (next) {
  next();
});

/**
 * @typedef Driver
 */
const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
