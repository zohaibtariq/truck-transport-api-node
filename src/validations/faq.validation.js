const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { password, objectId } = require('./custom.validation');

const createFaq = {
  body: Joi.object().keys({
    question: Joi.string().required(),
    answer: Joi.string().required(),
  }),
};

const updateFaq = {
  body: Joi.object().keys({
    question: Joi.string().optional(),
    answer: Joi.string().optional(),
  }),
};

const faqQueryParam = {
  params: Joi.object().keys({
    faqId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createFaq,
  faqQueryParam,
  updateFaq,
};
