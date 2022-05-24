const Joi = require('joi');

const createDriver = {
  body: Joi.object().keys({
    code: Joi.string().required(),
    active: Joi.boolean().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    gender: Joi.string().required(),
    ssn: String,
    tax_id: String,
    address: Joi.string().required(),
    zip: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    phone: Joi.string().required(),
    mobile: Joi.string().required(),
    external_id: String,
    userId: String,
    email: String,
  }),
};

module.exports = {
  createDriver,
};
