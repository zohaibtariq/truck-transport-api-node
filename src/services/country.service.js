const httpStatus = require('http-status');
const { Country, State, City } = require('../models');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

const queryAllUsers = async (filter) => {
  return User.find(filter).lean();
};

const insert = async (docs, options, callback) => {
  return User.collection.insert(docs, options, callback);
};

const uniqueEmails = async (filter) => {
  return User.find(filter);
};

const createCountriesStatesAndCities = async () => {
  let countriesCountFromDb = await Country.estimatedDocumentCount();
  let statesCountFromDb = await State.estimatedDocumentCount();
  let citiesCountFromDb = await City.estimatedDocumentCount();
  let countriesCountInsertions = 0;
  let statesCountInsertions = 0;
  let citiesCountInsertions = 0;

  /**
   *
   * COUNTRIES
   *
   */
  let CountryPlugin = require('country-state-city').Country;
  const allCountries = CountryPlugin.getAllCountries();
  if (allCountries.length > 0 && countriesCountFromDb === 0) {
    // console.log('countries insertion started');
    await Country.deleteMany();
    await Country.insertMany(allCountries)
      .then(function (mongooseDocuments) {
        // console.log('countries insertion ended');
        countriesCountInsertions = mongooseDocuments.length;
      })
      .catch(function (err) {
        res.status(httpStatus.UNPROCESSABLE_ENTITY).send(err);
      });
  }

  /**
   *
   * STATES
   *
   */
  let StatePlugin = require('country-state-city').State;
  const allStates = StatePlugin.getAllStates();
  if (allStates.length > 0 && statesCountFromDb === 0) {
    // console.log('states insertion started');
    await State.deleteMany();
    await State.insertMany(allStates)
      .then(function (mongooseDocuments) {
        // console.log('states insertion ended');
        statesCountInsertions = mongooseDocuments.length;
      })
      .catch(function (err) {
        res.status(httpStatus.UNPROCESSABLE_ENTITY).send(err);
      });
  }

  /**
   *
   * CITIES
   *
   */
  let CityPlugin = require('country-state-city').City;
  const allCities = CityPlugin.getAllCities();
  if (allCities.length > 0 && citiesCountFromDb === 0) {
    // console.log('cities insertion started');
    await City.deleteMany();
    await City.insertMany(allCities)
      .then(function (mongooseDocuments) {
        // console.log('cities insertion ended');
        citiesCountInsertions = mongooseDocuments.length;
      })
      .catch(function (err) {
        res.status(httpStatus.UNPROCESSABLE_ENTITY).send(err);
      });
  }

  return {
    insertedCountriesCount: countriesCountInsertions,
    insertedStatesCount: statesCountInsertions,
    insertedCitiesCount: citiesCountInsertions,
  };
};

const getAllCountries = async () => {
  return Country.find({ isoCode: { $in: ['US', 'MX', 'CA'] } });
};

const getAllStatesOfCountry = async (countryIsoCode) => {
  return State.find({ countryCode: countryIsoCode });
};

const getAllCitiesOfStateAndCountry = async (countryIsoCode, stateIsoCode) => {
  return City.find({ countryCode: countryIsoCode, stateCode: stateIsoCode });
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  queryAllUsers,
  insert,
  uniqueEmails,
  createCountriesStatesAndCities,
  getAllCountries,
  getAllStatesOfCountry,
  getAllCitiesOfStateAndCountry,
};
