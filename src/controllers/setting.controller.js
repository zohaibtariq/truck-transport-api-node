const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { settingService } = require('../services');

const updateSettings = catchAsync(async (req, res) => {
  res.send(await settingService.updateSettings(req.body));
});

const getSettings = catchAsync(async (req, res) => {
  res.status(httpStatus.OK).send(await settingService.getSettings());
});

module.exports = {
  getSettings,
  updateSettings,
};
