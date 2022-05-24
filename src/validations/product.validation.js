const Joi = require('joi');

const createProduct = {
  body: Joi.object().keys({
    contactPersons: Joi.array().items(Joi.object().keys({
      type: Joi.string().required(),
      name: Joi.string().required(),
      phone: Joi.string().required(),
      fax: Joi.string().required(),
      email: Joi.string().required()
    })),
    location: Joi.object().required().keys({
      id: Joi.string().required(),
      // extendedNotes: Joi.string(),
      name: Joi.string().required(),
      address1: Joi.string().required(),
      address2: String,
      zip: Joi.string().required(),
      state: Joi.string().required(),
      city: Joi.string().required(),
      country: Joi.string().required(),
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
    email: String,
    officeHours: String,
    userId: String,
  }),
};

module.exports = {
  createProduct,
};
