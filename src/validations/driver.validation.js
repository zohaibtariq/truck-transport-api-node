const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)
const { password, objectId } = require('./custom.validation');

const createDriver = {
  body: Joi.object().keys({
    equipmentExperienceEndorsements: Joi.object().keys({
      flatbed: Joi.boolean(),
      van: Joi.boolean(),
      refrigerated: Joi.boolean(),
      dropDeck: Joi.boolean(),
      towawayVehicles: Joi.boolean(),
      passengerVehicles: Joi.boolean(),
      dblTriple: Joi.boolean(),
      tanker: Joi.boolean(),
      hazMat: Joi.boolean(),
      hazMatTanker: Joi.boolean(),
      airBrake: Joi.boolean(),
      endorsementsRadio: Joi.string(),
    }),
    expirationLogSettings:Joi.object().keys({
      lastDrugTest: Joi.object(),
      nextDrugTest: Joi.object(),
      lastAlcohalTest: Joi.object(),
      nextAlcohalTest: Joi.object(),
      physExamExp: Joi.object(),
      oORegExp: Joi.object(),
      oOTractorExp: Joi.object(),
      oOTrailerExp: Joi.object(),
      oOInusrExp: Joi.object(),
      otherInusrExp: Joi.object(),
      mvaExp: Joi.object(),
      arcPrcExp: Joi.object(),
      hazMatTraining: Joi.object(),
      annualReview: Joi.object(),
      milesDriven: Joi.string(),
      yrsExp: Joi.string(),
    }),
    certifications: Joi.array().items(Joi.object().keys({
      drivingSchool: Joi.string(),
      country: Joi.string().custom(objectId).optional(),
      state: Joi.string().custom(objectId).optional(),
      city: Joi.string().custom(objectId).optional(),
      contact: Joi.string(),
      phone: Joi.string(),
      startDate: Joi.string(),
      graduationDate: Joi.string(),
      rank: Joi.string(),
      recruiter: Joi.string(),
      referredBy: Joi.string(),
      comments: Joi.string(),
    })),
    active: Joi.boolean().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    gender: Joi.string().required(),
    ssn: String,
    tax_id: String,
    image: String,
    address: Joi.string().required(),
    zip: Joi.string().required(),
    country: Joi.string().custom(objectId).required(),
    state: Joi.string().custom(objectId).required(),
    city: Joi.string().custom(objectId).required(),
    phone: Joi.string().required(),
    mobile: Joi.string().required(),
    external_id: String,
    dispatcher: String,
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    ratePerMile: Joi.number().required(),
  }),
};

const updateDriver = {
  body: Joi.object().keys({
    equipmentExperienceEndorsements: Joi.object().keys({
      flatbed: Joi.boolean(),
      van: Joi.boolean(),
      refrigerated: Joi.boolean(),
      dropDeck: Joi.boolean(),
      towawayVehicles: Joi.boolean(),
      passengerVehicles: Joi.boolean(),
      dblTriple: Joi.boolean(),
      tanker: Joi.boolean(),
      hazMat: Joi.boolean(),
      hazMatTanker: Joi.boolean(),
      airBrake: Joi.boolean(),
      endorsementsRadio: Joi.string(),
    }),
    expirationLogSettings:Joi.object().keys({
      lastDrugTest: Joi.object(),
      nextDrugTest: Joi.object(),
      lastAlcohalTest: Joi.object(),
      nextAlcohalTest: Joi.object(),
      physExamExp: Joi.object(),
      oORegExp: Joi.object(),
      oOTractorExp: Joi.object(),
      oOTrailerExp: Joi.object(),
      oOInusrExp: Joi.object(),
      otherInusrExp: Joi.object(),
      mvaExp: Joi.object(),
      arcPrcExp: Joi.object(),
      hazMatTraining: Joi.object(),
      annualReview: Joi.object(),
      milesDriven: Joi.string(),
      yrsExp: Joi.string(),
    }),
    certifications: Joi.array().items(Joi.object().keys({
      drivingSchool: Joi.string(),
      country: Joi.string().custom(objectId).optional(),
      state: Joi.string().custom(objectId).optional(),
      city: Joi.string().custom(objectId).optional(),
      contact: Joi.string(),
      phone: Joi.string(),
      startDate: Joi.object(),
      graduationDate: Joi.object(),
      rank: Joi.string(),
      recruiter: Joi.string(),
      referredBy: Joi.string(),
      comments: Joi.string(),
    })),
    active: Joi.boolean().optional(),
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    gender: Joi.string().optional(),
    ssn: Joi.string().optional(),
    tax_id: Joi.string().optional(),
    image: String,
    address: Joi.string().optional(),
    zip: Joi.string().optional(),
    country: Joi.string().custom(objectId).optional(),
    state: Joi.string().custom(objectId).optional(),
    city: Joi.string().custom(objectId).optional(),
    phone: Joi.string().optional(),
    mobile: Joi.string().optional(),
    external_id: Joi.string().optional(),
    dispatcher: Joi.string().optional(),
    email: Joi.string().optional().email(),
    password: Joi.string().optional().custom(password),
    ratePerMile: Joi.number().optional(),
  }),
};

const driverQueryParam = {
  params: Joi.object().keys({
    driverId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createDriver,
  driverQueryParam,
  updateDriver
};