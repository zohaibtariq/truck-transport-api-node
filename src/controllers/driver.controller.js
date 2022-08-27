const httpStatus = require('http-status');
const path = require('path');
const multer = require('multer');
const _ = require('lodash');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { driverService, codeService, authService, tokenService, emailService } = require('../services');
const logger = require('../config/logger');
const downloadResource = require('../utils/download');
const { Driver } = require('../models');
const generateUniqueId = require('../utils/uniqueId');

const createDriver = catchAsync(async (req, res) => {
  // const driver = await driverService.createDriver(req.body);
  // res.status(httpStatus.CREATED).send(driver);
  const newUniqueGeneratedCode = await codeService.createCode('drivers');
  req.body.code = newUniqueGeneratedCode;
  // await driverService.createDriver(req.body).then(success => {
  //   res.status(httpStatus.CREATED).send(success);
  // }).catch(error => {
  // console.log("error");
  // console.log(error);
  //   if(error?.errors?.code?.properties?.value && error?.errors?.code?.properties?.path)
  //     res.status(httpStatus.UNPROCESSABLE_ENTITY).send({message: `value ${error.errors.code.properties.value} of ${error.errors.code.properties.path} must be unique`});
  //   else
  //     res.status(httpStatus.UNPROCESSABLE_ENTITY).send({...error});
  //     // res.status(httpStatus.UNPROCESSABLE_ENTITY).send({message: `error in creating driver.`});
  // })
  const driver = await driverService.createDriver(req.body);
  res.status(httpStatus.CREATED).send(driver);
});

const getDrivers = catchAsync(async (req, res) => {
  // console.log('QUERY FILTER');
  // console.log(req.query);
  let filter = pick(req.query, ['active', 'state', 'country', 'search']);
  // console.log('DRIVER REQ FILTER');
  // console.log({ ...filter });
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  logger.debug({ ...filter });
  logger.debug({ ...options });
  if (filter.search) {
    const searchMe = { $regex: new RegExp(filter.search), $options: 'i' };
    // console.log("Search Me")
    // console.log(searchMe)
    Object.assign(filter, {
      $or: [
        { code: searchMe },
        { first_name: searchMe },
        { last_name: searchMe },
        { address: searchMe },
        { zip: searchMe },
        { city: searchMe },
        { phone: searchMe },
        { mobile: searchMe },
        { ssn: searchMe },
        { tax_id: searchMe },
        { external_id: searchMe },
        { email: searchMe },
      ],
    });
    filter = _.omit(filter, ['search']);
  }
  // console.log('DRIVER REQ FILTER FINAL');
  // console.log({ ...filter });
  options.populate = 'country,state,city';
  const result = await driverService.queryDrivers(filter, options);
  res.send(result);
});

const getDriver = catchAsync(async (req, res) => {
  const driver = await driverService.getDriverById(req.params.driverId);
  if (!driver) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
  }
  res.send(driver);
});

const getOneDriver = catchAsync(async (req, res) => {
  const driver = await driverService.getDriverById(req.driver._id);
  if (!driver) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
  }
  res.send(driver);
});

const updateDriver = catchAsync(async (req, res) => {
  const driver = await driverService.updateDriverById(req.params.driverId, req.body);
  res.send(driver);
});

const updateDriverFromApp = catchAsync(async (req, res) => {
  const driverRequestBody = pick(req.body, ['first_name', 'last_name', 'phone', 'gender']); // in case of driver update add allowed keys for update here.
  // console.log(req.driver._id);
  const driver = await driverService.updateDriverById(req.driver._id, driverRequestBody);
  res.send(driver);
});

const changeDriverPassword = catchAsync(async (req, res) => {
  const driverRequestBody = pick(req.body, ['old_password', 'password']);
  const driver = await driverService.updateDriverPasswordById(req.driver._id, driverRequestBody);
  res.send(driver);
});

const deleteDriver = catchAsync(async (req, res) => {
  // console.log('deleteDriver');
  // console.log(req.params.driverId);
  await driverService.deleteDriverById(req.params.driverId);
  res.status(httpStatus.NO_CONTENT).send();
});

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads');
  },
  filename(req, file, cb) {
    cb(
      null,
      (new Date().getTime() / 1000).toString().replaceAll('.', '') + generateUniqueId(8) + path.extname(file.originalname)
    ); // Appending extension
  },
});

const uploadDriverImage = catchAsync(async (req, res) => {
  const upload = multer({ storage }).single('file');
  // console.log('IN uploadDriver');
  upload(req, res, async (err) => {
    // console.log('UPLOADING SINGLE FILE');
    if (err) {
      // console.log('UPLOAD ERROR');
      // console.log(err);
    }
    // console.log('AFTER UPLOAD');
    // console.log(req.file);
    // console.log(req.file.filename);
    // console.log(req.driver._id);
    let driverId;
    if (req.params.driverId) driverId = req.params.driverId;
    else if (req.driver._id) driverId = req.driver._id;
    const driver = await driverService.updateDriverImageById(driverId, {
      image: req.file.filename,
    });
    // console.log('D RETURN');
    // console.log(driver);
    res.send(driver);
    // res.json({
    //   path:req.file
    // })
  });
});

const importDrivers = catchAsync(async (req, res) => {
  const drivers = req.body;
  // console.log('DRIVERS');
  // console.log(drivers);
  const data = await Driver.insertMany(drivers);
  res.status(httpStatus.OK).send({ count: data.length, results: data });
});

const exportDrivers = catchAsync(async (req, res) => {
  const fields = [
    {
      label: 'Email',
      value: 'email',
    },
    {
      label: 'Code',
      value: 'code',
    },
    {
      label: 'Active',
      value: 'active',
    },
    {
      label: 'First Name',
      value: 'first_name',
    },
    {
      label: 'Last Name',
      value: 'last_name',
    },
    {
      label: 'Gender',
      value: 'gender',
    },
    {
      label: 'Address',
      value: 'address',
    },
    {
      label: 'Zip',
      value: 'zip',
    },
    {
      label: 'State',
      value: 'state',
    },
    {
      label: 'City',
      value: 'city',
    },
    {
      label: 'Country',
      value: 'country',
    },
    {
      label: 'Phone',
      value: 'phone',
    },
    {
      label: 'Mobile',
      value: 'mobile',
    },
    {
      label: 'SSN',
      value: 'ssn',
    },
    {
      label: 'Tax Id',
      value: 'tax_id',
    },
    {
      label: 'External Id',
      value: 'external_id',
    },
    {
      label: 'Updated At',
      value: 'updatedAt',
    },
    {
      label: 'Created At',
      value: 'createdAt',
    },
  ];
  const data = await driverService.queryAllDrivers({});
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
  const fileName = `drivers-${new Date().toTimeString()}.csv`;
  return downloadResource(res, fileName, fields, data);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const driver = await authService.loginDriverWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateDriverAuthTokens(driver);
  res.send({ driver, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logoutDriver(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const forgotPassword = catchAsync(async (req, res) => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const resetPasswordToken = await tokenService.generateDriverResetPasswordToken(req.body.email, otp);
  await emailService.sendDriverResetPasswordEmail(req.body.email, resetPasswordToken, otp);
  res.status(httpStatus.OK).send({ token: resetPasswordToken });
});

const verifyOtp = catchAsync(async (req, res) => {
  await authService.verifyDriverOtp(req.query.token, req.body.otp);
  res.status(httpStatus.NO_CONTENT).send({ token: req.query.token });
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetDriverPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateDriverVerifyEmailToken(req.driver);
  await emailService.sendDriverVerificationEmail(req.driver.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyDriverEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createDriver,
  getDrivers,
  getDriver,
  updateDriver,
  deleteDriver,
  uploadDriverImage,
  importDrivers,
  exportDrivers,
  login,
  logout,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  updateDriverFromApp,
  changeDriverPassword,
  getOneDriver,
  verifyOtp,
};
