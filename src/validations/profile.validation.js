const Joi = require('joi');
const { objectId, password } = require('./custom.validation');

const createProfile = {
  body: Joi.object().keys({
    contactPersons: Joi.array().items(
      Joi.object().keys({
        type: Joi.string().required(),
        name: Joi.string().required(),
        phone: Joi.string().required(),
        fax: Joi.string().required(),
        email: Joi.string().required(),
      })
    ),
    location: Joi.object()
      .required()
      .keys({
        id: Joi.string().required(),
        // extendedNotes: Joi.string(),
        name: Joi.string().required(),
        address1: Joi.string().required(),
        address2: String,
        zip: Joi.string().required(),
        country: Joi.string().custom(objectId).required(),
        state: Joi.string().custom(objectId).required(),
        city: Joi.string().custom(objectId).required(),
        // country: Joi.object().required().keys({
        //   countryId: Joi.string().required(),
        //   currency: Joi.string().required(),
        //   flag: Joi.string().required(),
        //   isoCode: Joi.string().required(),
        //   latitude: Joi.string().required(),
        //   longitude: Joi.string().required(),
        //   name: Joi.string().required(),
        //   phonecode: Joi.string().required(),
        // }),
        // state: Joi.object().required().keys({
        //   countryCode: Joi.string().required(),
        //   isoCode: Joi.string().required(),
        //   latitude: Joi.string().required(),
        //   longitude: Joi.string().required(),
        //   name: Joi.string().required(),
        //   stateId: Joi.string().required(),
        // }),
        // city: Joi.object().required().keys({
        //   cityId: Joi.string().required(),
        //   countryCode: Joi.string().required(),
        //   latitude: Joi.string().required(),
        //   longitude: Joi.string().required(),
        //   name: Joi.string().required(),
        //   stateCode: Joi.string().required(),
        // }),
        phone: Joi.string().required(),
        fax: String,
        // contact: Joi.string(),
        cell: String,
        officeHrs: String,
        appt: String,
        externalId: Joi.string().required(),
        mcId: String,
      }),
    isCustomer: Joi.boolean(),
    isBillTo: Joi.boolean(),
    isShipper: Joi.boolean(),
    isConsignee: Joi.boolean(),
    isBroker: Joi.boolean(),
    isForwarder: Joi.boolean(),
    isTerminal: Joi.boolean(),
    active: Joi.boolean().required(),
    mcId: String,
    ediId: String,
    notes: String,
    email: Joi.string().optional().email(),
    password: Joi.string().optional().custom(password),
    officeHours: String,
    userId: String,
  }),
};

const updateProfile = {
  body: Joi.object().keys({
    contactPersons: Joi.array().items(
      Joi.object().keys({
        type: Joi.string().required(),
        name: Joi.string().required(),
        phone: Joi.string().required(),
        fax: Joi.string().required(),
        email: Joi.string().required(),
      })
    ),
    location: Joi.object()
      .required()
      .keys({
        id: Joi.string().required(),
        // extendedNotes: Joi.string(),
        name: Joi.string().required(),
        address1: Joi.string().required(),
        address2: String,
        zip: Joi.string().required(),
        country: Joi.string().custom(objectId).required(),
        state: Joi.string().custom(objectId).required(),
        city: Joi.string().custom(objectId).required(),
        // country: Joi.object().required().keys({
        //   countryId: Joi.string().required(),
        //   currency: Joi.string().required(),
        //   flag: Joi.string().required(),
        //   isoCode: Joi.string().required(),
        //   latitude: Joi.string().required(),
        //   longitude: Joi.string().required(),
        //   name: Joi.string().required(),
        //   phonecode: Joi.string().required(),
        // }),
        // state: Joi.object().required().keys({
        //   countryCode: Joi.string().required(),
        //   isoCode: Joi.string().required(),
        //   latitude: Joi.string().required(),
        //   longitude: Joi.string().required(),
        //   name: Joi.string().required(),
        //   stateId: Joi.string().required(),
        // }),
        // city: Joi.object().required().keys({
        //   cityId: Joi.string().required(),
        //   countryCode: Joi.string().required(),
        //   latitude: Joi.string().required(),
        //   longitude: Joi.string().required(),
        //   name: Joi.string().required(),
        //   stateCode: Joi.string().required(),
        // }),
        phone: Joi.string().required(),
        fax: String,
        // contact: Joi.string(),
        cell: String,
        officeHrs: String,
        appt: String,
        externalId: Joi.string().required(),
        mcId: String,
      }),
    isCustomer: Joi.boolean(),
    isBillTo: Joi.boolean(),
    isShipper: Joi.boolean(),
    isConsignee: Joi.boolean(),
    isBroker: Joi.boolean(),
    isForwarder: Joi.boolean(),
    isTerminal: Joi.boolean(),
    active: Joi.boolean().required(),
    mcId: String,
    ediId: String,
    notes: String,
    email: Joi.string().optional().email(),
    password: Joi.string().optional().custom(password),
    officeHours: String,
    userId: String,
  }),
};

const profileQueryParam = {
  params: Joi.object().keys({
    profileId: Joi.string().custom(objectId),
  }),
};

const validateProfileIdQueryParam = {
  params: Joi.object().keys({
    profileId: Joi.string().custom(objectId),
  }),
};

const changeProfilePassword = {
  body: Joi.object().keys({
    old_password: Joi.string().required().custom(password),
    password: Joi.string().required().custom(password),
  }),
};

module.exports = {
  createProfile,
  updateProfile,
  profileQueryParam,
  validateProfileIdQueryParam,
  changeProfilePassword,
};
