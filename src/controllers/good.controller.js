const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { goodService } = require('../services');
const _ = require("lodash");

const createGood = catchAsync(async (req, res) => {
  const good = await goodService.createGood(req.body);
  res.status(httpStatus.CREATED).send(good);
});

const getGoods = catchAsync(async (req, res) => {
  // console.log(':::getGoods:::');
  let filter = pick(req.query, ['name', 'active']);
  // console.log('UNTOUCHED FILTERS');
  // console.log({ ...filter });
  if(filter['name']){
    var searchMe = { $regex: new RegExp(filter['name']), $options: 'i'};
    // console.log(searchMe)
    Object.assign(filter, {
      '$or': [
        {'name': searchMe},
      ]})
    filter = _.omit(filter, ['name']);
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await goodService.queryGoods(filter, options);
  res.send(result);
});

const getGood = catchAsync(async (req, res) => {
  const good = await goodService.getGoodById(req.params.goodId);
  if (!good) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Good not found');
  }
  res.send(good);
});

const updateGood = catchAsync(async (req, res) => {
  const good = await goodService.updateGoodById(req.params.goodId, req.body);
  res.send(good);
});

const deleteGood = catchAsync(async (req, res) => {
  await goodService.deleteGoodById(req.params.goodId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createGood,
  getGoods,
  getGood,
  updateGood,
  deleteGood,
};
