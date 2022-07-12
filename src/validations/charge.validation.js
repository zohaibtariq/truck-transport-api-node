const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createCharge = {
  body: Joi.object().keys({
    name: Joi.string().required(),
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

const getCharge = {
  params: Joi.object().keys({
    chargeId: Joi.string().custom(objectId),
  }),
};

const updateCharge = {
  params: Joi.object().keys({
    chargeId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().optional(),
      active: Joi.boolean().optional(),
    })
    .min(1),
};

const deleteCharge = {
  params: Joi.object().keys({
    chargeId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createCharge,
  getCharges,
  getCharge,
  updateCharge,
  deleteCharge,
};
