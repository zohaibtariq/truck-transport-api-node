const httpStatus = require('http-status');
const _ = require('lodash');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { chargeService } = require('../services');

const createCharge = catchAsync(async (req, res) => {
  const charge = await chargeService.createCharge(req.body);
  res.status(httpStatus.CREATED).send(charge);
});

const getCharges = catchAsync(async (req, res) => {
  // console.log(':::getCharges:::');
  let filter = pick(req.query, ['name', 'active']);
  // console.log('UNTOUCHED FILTERS');
  // console.log({ ...filter });
  if (filter.name) {
    const searchMe = { $regex: new RegExp(filter.name), $options: 'i' };
    // console.log(searchMe)
    Object.assign(filter, {
      $or: [{ name: searchMe }],
    });
    filter = _.omit(filter, ['name']);
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await chargeService.queryCharges(filter, options);
  res.send(result);
});

const getCharge = catchAsync(async (req, res) => {
  const charge = await chargeService.getChargeById(req.params.chargeId);
  if (!charge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Charge not found');
  }
  res.send(charge);
});

const updateCharge = catchAsync(async (req, res) => {
  const charge = await chargeService.updateChargeById(req.params.chargeId, req.body);
  res.send(charge);
});

const deleteCharge = catchAsync(async (req, res) => {
  await chargeService.deleteChargeById(req.params.chargeId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createCharge,
  getCharges,
  getCharge,
  updateCharge,
  deleteCharge,
};
