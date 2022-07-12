const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)

const createLoad = {
  body: Joi.object().keys({
    invitationSentToDrivers: Joi.array().items(Joi.object().keys({
      id: Joi.string().required()
    })),
    bolHash: Joi.string().required(),
    shipperRef: Joi.string().required(),
    poHash: Joi.string().required(),
    status: Joi.optional().valid('pending', 'assigned', 'active', 'enroute', 'completed', 'cancelled'),
    proCode: Joi.string().required(),
    customer: Joi.objectId().required(),
    origin: Joi.objectId().required(),
    destination: Joi.optional(),
    notes: Joi.string().optional(),
    invitationSentToDriver: Joi.boolean().optional(),
    inviteAcceptedByDriver: Joi.boolean().optional(),
    onTheWayToDelivery: Joi.boolean().optional(),
    deliveredToCustomer: Joi.boolean().optional(),
    driver: Joi.optional(),
  }),
};

const updateLoad = {
  body: Joi.object().keys({
    invitationSentToDrivers: Joi.array().items(Joi.object().keys({
      id: Joi.string().required()
    })),
    goods: Joi.array().items(Joi.object().keys({
      make: Joi.string().required(),
      model: Joi.string().required(),
      year: Joi.number().required(),
      value: Joi.number().required(),
      quantity: Joi.number().integer().required(),
      pieces: Joi.number().integer().required(),
      userQuantity: Joi.number().integer().required(),
      weight: Joi.number().integer().required(),
      tonnage: Joi.number().integer().required(),
      grWeight: Joi.number().integer().required(),
      palletes: Joi.number().required(),
      frClass: Joi.number().required(),
      notes: Joi.string().required(),
      good: Joi.objectId().required(),
    })),
    charges: Joi.array().items(Joi.object().keys({
      type: Joi.string().required(),
      rate: Joi.number().required(),
      quantity: Joi.number().integer().required(),
      payableToDriver: Joi.boolean().optional(),
      billableToCustomer: Joi.boolean().optional(),
      notes: Joi.string().required()
    })),
    distanceMiles: Joi.number().optional(),
    ratePerMile: Joi.number().optional(),
    paidAmount: Joi.number().optional(),
    balanceAmount: Joi.number().optional(),
    bolHash: Joi.string().optional(),
    shipperRef: Joi.string().optional(),
    poHash: Joi.string().optional(),
    status: Joi.optional().valid('pending', 'tender', 'assigned', 'active', 'enroute', 'completed', 'cancelled'),
    proCode: Joi.string().optional(),
    customer: Joi.string().optional(),
    origin: Joi.string().optional(),
    destination: Joi.optional(),
    notes: Joi.string().optional(),
    invitationSentToDriver: Joi.boolean().optional(),
    inviteAcceptedByDriver: Joi.boolean().optional(),
    onTheWayToDelivery: Joi.boolean().optional(),
    deliveredToCustomer: Joi.boolean().optional(),
    driver: Joi.optional(),
  }),
};

module.exports = {
  createLoad,
  updateLoad
};
