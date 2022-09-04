const httpStatus = require('http-status');
const { Profile } = require('../models');
const ApiError = require('../utils/ApiError');
const {
  onlyCountryNameProjectionString,
  onlyStateNameProjectionString,
  onlyCityNameProjectionString,
} = require('../config/countryStateCityProjections');

/**
 * Create a profile
 * @param {Object} profileBody
 * @returns {Promise<Profile>}
 */
const createProfile = async (profileBody) => {
  if (await Profile.isEmailTaken(profileBody.email)) {
    // console.log('throw new error')
    throw new ApiError(httpStatus.BAD_REQUEST, 'Provided profile email already taken');
  }
  return Profile.create(profileBody);
};

/**
 * Query for profiles
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryProfiles = async (filter, options) => {
  // return await Profile.find()
  const profiles = await Profile.paginate(filter, options);
  return profiles;
};

/**
 * Get profile by id
 * @param {ObjectId} id
 * @returns {Promise<Profile>}
 */
const getProfileById = async (id) => {
  // return Profile.findById(id).populate({ path: 'locationCountry', model: 'Country' });
  // return Profile.findById(id).populate('locationCountry');
  return Profile.findById(id).populate([
    { path: 'location.country', select: onlyCountryNameProjectionString },
    { path: 'location.state', select: onlyStateNameProjectionString },
    { path: 'location.city', select: onlyCityNameProjectionString },
  ]);
};

/**
 * Get profile by email
 * @param {string} email
 * @returns {Promise<Profile>}
 */
const getProfileByEmail = async (email) => {
  console.log('inside getProfileByEmail');
  return Profile.findOne({ email });
};

/**
 * Update profile by id
 * @param {ObjectId} profileId
 * @param {Object} updateBody
 * @returns {Promise<Profile>}
 */
const updateProfileById = async (profileId, updateBody) => {
  const profile = await getProfileById(profileId);
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
  }
  if (updateBody.email && (await Profile.isEmailTaken(updateBody.email, profileId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Customer email already taken');
  }
  Object.assign(profile, updateBody);
  await profile.save();
  return profile;
};

/**
 * Delete profile by id
 * @param {ObjectId} profileId
 * @returns {Promise<Profile>}
 */
const deleteProfileById = async (profileId) => {
  const profile = await getProfileById(profileId);
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
  }
  await profile.remove();
  return profile;
};

const queryAllProfiles = async (filter) => {
  return Profile.find(filter).lean();
};

/**
 * Update profile password by id
 * @param {ObjectId} profileId
 * @param {Object} updateBody
 * @returns {Promise<Profile>}
 */
const updateProfilePasswordById = async (profileId, updateBody) => {
  const profile = await getProfileById(profileId);
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
  } else if (!(await profile.isPasswordMatch(updateBody.old_password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Profile old password is wrong');
  } else if (updateBody.old_password === updateBody.password) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Profile old password must not be same as new password.');
  }
  // console.log(updateBody.old_password)
  // console.log(typeof updateBody.old_password)
  // console.log(updateBody.password)
  // console.log(typeof updateBody.password)
  // return false;
  Object.assign(profile, { password: updateBody.password });
  await profile.save();
  return profile;
};

module.exports = {
  createProfile,
  queryProfiles,
  getProfileById,
  getProfileByEmail,
  updateProfileById,
  deleteProfileById,
  queryAllProfiles,
  updateProfilePasswordById,
};
