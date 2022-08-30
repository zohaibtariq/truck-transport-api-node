const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createGood = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    // active: Joi.boolean().required(),
  }),
};

const getGoods = {
  query: Joi.object().keys({
    // name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const updateGood = {
  params: Joi.object().keys({
    goodId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().optional(),
      active: Joi.boolean().optional(),
    })
    .min(1),
};

const goodQueryParam = {
  params: Joi.object().keys({
    goodId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createGood,
  getGoods,
  updateGood,
  goodQueryParam,
};
