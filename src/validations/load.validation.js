const Joi = require('joi');
const { objectId } = require('./custom.validation');
Joi.objectId = require('joi-objectid')(Joi);

const createLoad = {
  body: Joi.object().keys({
    // invitationSentToDrivers: Joi.array().items(
    //   Joi.object().keys({
    //     id: Joi.string().custom(objectId).required(),
    //   })
    // ),
    bolHash: Joi.string().required(),
    shipperRef: Joi.string().required(),
    poHash: Joi.string().required(),
    status: Joi.optional().valid('pending', 'assigned', 'active', 'enroute', 'completed', 'cancelled'),
    proCode: Joi.string().required(),
    customer: Joi.objectId().required(),
    origin: Joi.objectId().required(),
    destination: Joi.optional(),
    notes: Joi.string().allow(null, '').optional(),
    invitationSentToDriver: Joi.boolean().optional(),
    onTheWayToDelivery: Joi.boolean().optional(),
    deliveredToCustomer: Joi.boolean().optional(),
    inviteAcceptedByDriver: Joi.string().custom(objectId).optional(),
    invitationSentToDriverId: Joi.string().custom(objectId).optional(),
    lastInvitedDriver: Joi.string().custom(objectId).optional(),
    isInviteAcceptedByDriver: Joi.boolean().optional(),
  }),
};

const updateLoad = {
  body: Joi.object().keys({
    // invitationSentToDrivers: Joi.array().items(
    //   Joi.object().keys({
    //     id: Joi.string().custom(objectId).required(),
    //   })
    // ),
    goods: Joi.array().items(
      Joi.object().keys({
        make: Joi.string().required(),
        model: Joi.string().required(),
        year: Joi.number().required(),
        value: Joi.number().required(),
        quantity: Joi.number().required(),
        pieces: Joi.number().required(),
        userQuantity: Joi.number().required(),
        weight: Joi.number().required(),
        tonnage: Joi.number().required(),
        grWeight: Joi.number().required(),
        palletes: Joi.number().required(),
        frClass: Joi.number().required(),
        notes: Joi.string().allow(null, '').required(),
        good: Joi.objectId().required(),
      })
    ),
    charges: Joi.array().items(
      Joi.object().keys({
        type: Joi.string().required(),
        rate: Joi.number().required(),
        quantity: Joi.number().required(),
        payableToDriver: Joi.boolean().optional(),
        billableToCustomer: Joi.boolean().optional(),
        notes: Joi.string().allow(null, '').required(),
      })
    ),
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
    notes: Joi.string().allow(null, '').optional(),
    invitationSentToDriver: Joi.boolean().optional(),
    onTheWayToDelivery: Joi.boolean().optional(),
    deliveredToCustomer: Joi.boolean().optional(),
    lastInvitedDriver: Joi.optional(),
    driverRatePerMile: Joi.number().optional(),
    isInviteAcceptedByDriver: Joi.boolean().optional(),
    inviteAcceptedByDriver: Joi.string().custom(objectId).optional(),
    invitationSentToDriverId: Joi.string().custom(objectId).optional(),
    driverInterests: Joi.array().items(
      Joi.object().keys({
        id: Joi.string().custom(objectId).required(),
      })
    ),
  }),
};

const loadQueryParam = {
  params: Joi.object().keys({
    loadId: Joi.string().custom(objectId),
  }),
};

const updateLoadByDriver = {
  body: Joi.object().keys({
    onTheWayToDelivery: Joi.boolean().optional(),
    deliveredToCustomer: Joi.boolean().optional(),
  }),
};

module.exports = {
  createLoad,
  updateLoad,
  loadQueryParam,
  updateLoadByDriver,
};
