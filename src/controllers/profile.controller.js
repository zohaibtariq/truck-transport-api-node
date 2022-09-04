const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { profileService, codeService, authService, tokenService, emailService, loadService} = require('../services');
// const logger = require('../config/logger');
var _ = require('lodash');
const downloadResource = require('../utils/download');
// const User = require("../../src/models/user.model");
const {Profile} = require("../models");
const {object} = require("joi");

const createProfile = catchAsync(async (req, res) => {
  // const profile = await profileService.createProfile(req.body);
  // res.status(httpStatus.CREATED).send(profile);
  let newUniqueGeneratedCode = await codeService.createCode('profiles');
  req.body.code = newUniqueGeneratedCode;
  await profileService.createProfile(req.body).then(success => {
    res.status(httpStatus.CREATED).send(success);
  }).catch(error => {
    if(error?.errors?.code?.properties?.value && error?.errors?.code?.properties?.path)
      res.status(httpStatus.UNPROCESSABLE_ENTITY).send({message: `value ${error.errors.code.properties.value} of ${error.errors.code.properties.path} must be unique`});
    else
      res.status(httpStatus.UNPROCESSABLE_ENTITY).send({message: `error in creating profile.`});
  })
});

const getProfiles = catchAsync(async (req, res) => {
  // console.log('QUERY FILTER');
  // console.log(req.query);
  // const filter = pick(req.query, ['name', 'role']);
  let filter = pick(req.query, [
      'isCustomer','isBillTo','isShipper','isConsignee','isBroker','isForwarder','isTerminal', 'active',
    'location_id', 'location_name', 'location_address1', 'location_phone', 'location_fax', 'location_zip', 'location_state', 'location_country',
  ]);

  // console.log('UNTOUCHED FILTERS');
  // console.log({ ...filter });

  // if(filter['location_id'])
  //   delete Object.assign(filter, {['location.id']: filter['location_id'] })['location_id'];
  //
  // if(filter['location_name'])
  //   delete Object.assign(filter, {['location.name']: filter['location_name'] })['location_name'];
  //
  // if(filter['location_address1'])
  //   delete Object.assign(filter, {['location.address1']: filter['location_address1'] })['location_address1'];
  //
  // if(filter['location_phone'])
  //   delete Object.assign(filter, {['location.phone']: filter['location_phone'] })['location_phone'];
  //
  // if(filter['location_fax'])
  //   delete Object.assign(filter, {['location.fax']: filter['location_fax'] })['location_fax'];
  //
  // if(filter['location_zip'])
  //   delete Object.assign(filter, {['location.zip']: filter['location_zip'] })['location_zip'];

  if(filter['location_state'])
    delete Object.assign(filter, {['location.state']: filter['location_state'] })['location_state'];

  if(filter['location_country'])
    delete Object.assign(filter, {['location.country']: filter['location_country'] })['location_country'];

  if(filter['location_id'] || filter['location_name'] || filter['location_address1'] || filter['location_phone'] || filter['location_fax'] || filter['location_zip'] || filter['email']){
    var searchMe = { $regex: new RegExp(filter['location_phone']), $options: 'i'};
    // console.log(searchMe)
    Object.assign(filter, {
      '$or': [
        {'email': searchMe},
        {'location.id': searchMe},
        {'location.name': searchMe},
        {'location.address1': searchMe},
        {'location.phone': searchMe},
        {'location.fax': searchMe},
        {'location.zip': searchMe},
      ]})
    filter = _.omit(filter, ['location_id', 'location_name','location_address1','location_phone', 'location_fax','location_zip']);
  }

  // console.log('REQ FILTER');
  // console.log({ ...filter });
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  // logger.debug({ ...filter });
  // logger.debug({ ...options });
  options.populate = "location.country,location.state,location.city"
  const result = await profileService.queryProfiles(filter, options);
  res.send(result);
});

const getProfile = catchAsync(async (req, res) => {
  const profile = await profileService.getProfileById(req.params.profileId);
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
  }
  res.send(profile);
});

const updateProfile = catchAsync(async (req, res) => {
  const profile = await profileService.updateProfileById(req.params.profileId, req.body);
  res.send(profile);
});

const deleteProfile = catchAsync(async (req, res) => {
  await profileService.deleteProfileById(req.params.profileId);
  res.status(httpStatus.NO_CONTENT).send();
});

const importProfiles = catchAsync(async (req, res) => {
  let profiles = req.body;
  // console.log('PROFILES');
  // console.log(profiles);
  // let data = await Profile.insertMany(profiles.map((profile) => (profiles)));
  let data = await Profile.insertMany(profiles);
  res.status(httpStatus.OK).send({count: data.length, results: data});
});

const exportProfiles = catchAsync(async (req, res) => {
  let filter = pick(req.query, [
    'isCustomer','isBillTo','isShipper','isConsignee','isBroker','isForwarder','isTerminal'
  ]);
  const fields = [
    {
      label: 'isCustomer',
      value: 'isCustomer'
    },
    {
      label: 'isBillTo',
      value: 'isBillTo'
    },
    {
      label: 'isShipper',
      value: 'isShipper'
    },
    {
      label: 'isConsignee',
      value: 'isConsignee'
    },
    {
      label: 'isBroker',
      value: 'isBroker'
    },
    {
      label: 'isForwarder',
      value: 'isForwarder'
    },
    {
      label: 'isTerminal',
      value: 'isTerminal'
    },
    {
      label: 'mcId',
      value: 'mcId'
    },
    {
      label: 'ediId',
      value: 'ediId'
    },
    {
      label: 'notes',
      value: 'notes'
    },
    {
      label: 'email',
      value: 'email'
    },
    {
      label: 'officeHours',
      value: 'officeHours'
    },
    {
      label: 'active',
      value: 'active'
    },
    {
      label: 'createdAt',
      value: 'createdAt'
    },
    {
      label: 'updatedAt',
      value: 'updatedAt'
    },
    {
      label: 'code',
      value: 'location_id'
    },
    {
      label: 'extendedNotes',
      value: 'location_extendedNotes'
    },
    {
      label: 'address1',
      value: 'location_address1'
    },
    {
      label: 'zip',
      value: 'location_zip'
    },
    {
      label: 'state',
      value: 'location_state'
    },
    {
      label: 'city',
      value: 'location_city'
    },
    {
      label: 'country',
      value: 'location_country'
    },
    {
      label: 'phone',
      value: 'location_phone'
    },
    {
      label: 'fax',
      value: 'location_fax'
    },
    {
      label: 'contact',
      value: 'location_contact'
    },
    {
      label: 'cell',
      value: 'location_cell'
    },
    {
      label: 'appt',
      value: 'location_appt'
    },
    {
      label: 'externalId',
      value: 'location_externalId'
    },
    {
      label: 'name',
      value: 'location_name'
    },
  ];
  let data = await profileService.queryAllProfiles(filter);
  data = data.map((d) => {
    let newData = {...d}
    newData['location_id'] = newData['location']['id'];
    newData['location_extendedNotes'] = newData['location']['extendedNotes'];
    newData['location_address1'] = newData['location']['address1'];
    newData['location_zip'] = newData['location']['zip'];
    newData['location_state'] = newData['location']['state'];
    newData['location_city'] = newData['location']['city'];
    newData['location_country'] = newData['location']['country'];
    newData['location_phone'] = newData['location']['phone'];
    newData['location_fax'] = newData['location']['fax'];
    newData['location_contact'] = newData['location']['contact'];
    newData['location_cell'] = newData['location']['cell'];
    newData['location_officeHrs'] = newData['location']['officeHrs'];
    newData['location_appt'] = newData['location']['appt'];
    newData['location_externalId'] = newData['location']['externalId'];
    newData['location_name'] = newData['location']['name'];
    newData = _.omit(newData, ['location', 'contactPersons']);
    return newData;
  })
  // console.log('F Data')
  // console.log(data)
  let fileName = 'profile-'+(new Date().toTimeString())+'.csv';
  return downloadResource(res, fileName, fields, data);
});

const exportProfile = catchAsync(async (req, res) => {
  let filter = pick(req.query, [
    'isCustomer','isBillTo','isShipper','isConsignee','isBroker','isForwarder','isTerminal'
  ]);
  const fields = [
    {
      label: 'Name',
      value: 'name'
    },
    {
      label: 'Type',
      value: 'type'
    },
    {
      label: 'Phone',
      value: 'phone'
    },
    {
      label: 'Fax',
      value: 'fax'
    },
    {
      label: 'Email',
      value: 'email'
    },
  ];
  const profile = await profileService.getProfileById(req.params.profileId);
  let data = profile.contactPersons;
  // data = data.map((d) => {
  //   let newData = {...d}
  //   newData['location_id'] = newData['location']['id'];
  //   newData['location_extendedNotes'] = newData['location']['extendedNotes'];
  //   newData['location_address1'] = newData['location']['address1'];
  //   newData['location_zip'] = newData['location']['zip'];
  //   newData['location_state'] = newData['location']['state'];
  //   newData['location_city'] = newData['location']['city'];
  //   newData['location_country'] = newData['location']['country'];
  //   newData['location_phone'] = newData['location']['phone'];
  //   newData['location_fax'] = newData['location']['fax'];
  //   newData['location_contact'] = newData['location']['contact'];
  //   newData['location_cell'] = newData['location']['cell'];
  //   newData['location_officeHrs'] = newData['location']['officeHrs'];
  //   newData['location_appt'] = newData['location']['appt'];
  //   newData['location_externalId'] = newData['location']['externalId'];
  //   newData = _.omit(newData, ['location', 'contactPersons']);
  //   return newData;
  // })
  // console.log('F Data')
  // console.log(data)
  let fileName = 'profile-'+(new Date().toTimeString())+'.csv';
  return downloadResource(res, fileName, fields, data);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const profile = await authService.loginProfileWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateProfileAuthTokens(profile);
  res.send({ profile, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logoutProfile(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const forgotPassword = catchAsync(async (req, res) => {
  // const otp = Math.floor(1000 + Math.random() * 9000).toString();
  // const resetPasswordToken = await tokenService.generateProfileResetPasswordToken(req.body.email, otp);
  // await emailService.sendProfileResetPasswordEmail(req.body.email, resetPasswordToken, otp);
  const resetPasswordToken = await tokenService.generateProfileResetPasswordToken(req.body.email);
  await emailService.sendProfileResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.OK).send({ token: resetPasswordToken });
});

const verifyOtp = catchAsync(async (req, res) => {
  await authService.verifyProfileOtp(req.query.token, req.body.otp);
  res.status(httpStatus.NO_CONTENT).send({ token: req.query.token });
});

const resetPassword = catchAsync(async (req, res) => {
  // console.log('PROFILE resetPassword');
  await authService.resetProfilePassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateProfileVerifyEmailToken(req.profile);
  await emailService.sendProfileVerificationEmail(req.profile.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyProfileEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const getOneProfile = catchAsync(async (req, res) => {
  const profile = await profileService.getProfileById(req.profile._id);
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }
  res.send(profile);
});

// TODO:: need to test below func
const updateProfileFromCustomerPortal = catchAsync(async (req, res) => {
  const profileRequestBody = pick(req.body, ['first_name', 'last_name', 'phone', 'gender']); // in case of driver update add allowed keys for update here.
  // console.log(req.profile._id);
  const profile = await profileService.updateProfileById(req.profile._id, profileRequestBody);
  res.send(profile);
});

const changeProfilePassword = catchAsync(async (req, res) => {
  const driverRequestBody = pick(req.body, ['old_password', 'password']);
  const driver = await profileService.updateProfilePasswordById(req.profile._id, driverRequestBody);
  res.send(driver);
});

const getLoads = catchAsync(async (req, res) => {
  // TODO ::: IMPORTANT whenever you do any change in this function please also think to update load.controller.getLoads
  let filter = pick(req.query, [
    'status',
    'search',
  ]);
  if(filter['search']){
    var searchMe = { $regex: new RegExp(filter['search']), $options: 'i'};
    Object.assign(filter, {
      '$or': [
        {'proCode': searchMe},
        {'poHash': searchMe},
        {'shipperRef': searchMe},
        {'bolHash': searchMe},
        {'code': searchMe},
      ]})
    filter = _.omit(filter, ['search']);
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  Object.assign(filter, {customer: req.profile._id.toString()})
  options.populate = 'customer,origin,destination';
  const result = await loadService.queryLoads(filter, options);
  res.send(result);
});

const getLoad = catchAsync(async (req, res) => {
  // TODO ::: IMPORTANT whenever you do any change in this function please also think to update load.controller.getLoad
  const load = await loadService.getLoadById(req.params.loadId, true);
  if (!load) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile load not found');
  }
  if(!(load.customer._id.toString() === req.profile._id.toString())){
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile load not found');
  }
  res.send(load);
});

module.exports = {
  createProfile,
  getProfiles,
  getProfile,
  updateProfile,
  deleteProfile,
  importProfiles,
  exportProfiles,
  exportProfile,
  login,
  logout,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  updateProfileFromCustomerPortal,
  changeProfilePassword,
  getOneProfile,
  verifyOtp,
  getLoads,
  getLoad
};
