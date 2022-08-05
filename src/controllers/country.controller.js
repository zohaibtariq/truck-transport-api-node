const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { countryService } = require('../services');
const pick = require('../utils/pick');

const createCountries = catchAsync(async (req, res) => {
  res.status(httpStatus.CREATED).send(await countryService.createCountriesStatesAndCities());
});

const getAllCountries = catchAsync(async (req, res) => {
  res.status(httpStatus.OK).send(await countryService.getAllCountries());
});

const getRelatedStates = catchAsync(async (req, res) => {
  let countryIsoCode = req.params.countryIsoCode;
  res.status(httpStatus.OK).send(await countryService.getAllStatesOfCountry(countryIsoCode));
});

const getRelatedCities = catchAsync(async (req, res) => {
  let countryIsoCode = req.params.countryIsoCode;
  let stateIsoCode = req.params.stateIsoCode;
  res.status(httpStatus.OK).send(await countryService.getAllCitiesOfStateAndCountry(countryIsoCode, stateIsoCode));
});

module.exports = {
  createCountries,
  getAllCountries,
  getRelatedStates,
  getRelatedCities
};
