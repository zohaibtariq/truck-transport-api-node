const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createCharge = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    rate: Joi.number().allow(null, '', 0).optional(),
    // active: Joi.boolean().required(),
  }),
};

const getCharges = {
  query: Joi.object().keys({
    // name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const updateCharge = {
  params: Joi.object().keys({
    chargeId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().optional(),
      rate: Joi.number().allow(null, '', 0).optional(),
      active: Joi.boolean().optional(),
    })
    .min(1),
};

const chargeQueryParam = {
  params: Joi.object().keys({
    chargeId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createCharge,
  getCharges,
  chargeQueryParam,
  updateCharge,
};
