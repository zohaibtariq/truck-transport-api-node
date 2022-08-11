const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { loadService, codeService } = require('../services');
const logger = require('../config/logger');
var _ = require('lodash');
const downloadResource = require('../utils/download');
const {Load} = require("../models");
const { loadStatuses } = require('../config/loads');
const {
  onlyCountryNameProjectionString,
  onlyStateNameProjectionString,
  onlyCityNameProjectionString,
  onlyProfileAddressLocationProjectionString
} = require('../config/countryStateCityProjections');
const createLoad = catchAsync(async (req, res) => {
  await loadService.createLoad(req.body).then(success => {
    res.status(httpStatus.CREATED).send(success);
  }).catch(error => {
    if(error?.errors?.code?.properties?.value && error?.errors?.code?.properties?.path)
      res.status(httpStatus.UNPROCESSABLE_ENTITY).send({message: `value ${error.errors.code.properties.value} of ${error.errors.code.properties.path} must be unique`});
    else
      res.status(httpStatus.UNPROCESSABLE_ENTITY).send({message: `error in creating load.`});
  })
});

const getLoads = catchAsync(async (req, res) => {
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
  logger.debug({ ...filter });
  logger.debug({ ...options });
  // options.populate = 'customer,origin,destination,driver,goods.good';
  options.populate = 'customer,origin,destination';
  const result = await loadService.queryLoads(filter, options);
  // console.log('::: result ::: ')
  // console.log({...result})
  res.send(result);
});

const getLoad = catchAsync(async (req, res) => {
  const load = await loadService.getLoadById(req.params.loadId);
  if (!load) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Load not found');
  }
  res.send(load);
});

const updateLoad = catchAsync(async (req, res) => {
  const load = await loadService.updateLoadById(req.params.loadId, req.body);
  res.send(load);
});

const updateLoadByDriver = catchAsync(async (req, res) => {
  const loadBodyForUpdateByDriver = pick(req.body, ['onTheWayToDelivery', 'deliveredToCustomer']); // in case of driver update add allowed keys for update here.
  const load = await loadService.updateDriverLoadById(req, loadBodyForUpdateByDriver);
  res.send(load);
});

const deleteLoad = catchAsync(async (req, res) => {
  await loadService.deleteLoadById(req.params.loadId);
  res.status(httpStatus.NO_CONTENT).send();
});

const importLoads = catchAsync(async (req, res) => {
  let loads = req.body;
  // console.log('PROFILES');
  // console.log(loads);
  // let data = await Load.insertMany(loads.map((load) => (loads)));
  let data = await Load.insertMany(loads);
  res.status(httpStatus.OK).send({count: data.length, results: data});
});

const exportLoads = catchAsync(async (req, res) => {
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
  let data = await loadService.queryAllLoads(filter);
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
  let fileName = 'load-'+(new Date().toTimeString())+'.csv';
  return downloadResource(res, fileName, fields, data);
});

const exportLoad = catchAsync(async (req, res) => {
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
  const load = await loadService.getLoadById(req.params.loadId);
  let data = load.contactPersons;
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
  let fileName = 'load-'+(new Date().toTimeString())+'.csv';
  return downloadResource(res, fileName, fields, data);
});

const loadInviteAcceptedByDriver = catchAsync(async (req, res) => {
  let statusCode = httpStatus.NO_CONTENT
  let bodyToUpdate = {};
  if(req.driver !== undefined) {
    let driverId = req.driver.id
    // console.log('driverId');
    // console.log(driverId);
    // console.log('loadId');
    // console.log(req.params.loadId);
    bodyToUpdate = {
      "inviteAcceptedByDriverTime": new Date(),
      // "inviteAcceptedByDriverTime": +new Date,
      // "inviteAcceptedByDriverTime": new ISODate(),
      "inviteAcceptedByDriver": driverId,
      "isInviteAcceptedByDriver": true,
      "status": "assigned",
      // "driverInterests": [
      //   {"id": driverId}
      // ]
    };
    // console.log('loadInviteAcceptedByDriver');
    // console.log(bodyToUpdate);
    const load = await loadService.updateLoadForDriverInvite(req.params.loadId, bodyToUpdate);
    statusCode = httpStatus.OK
  }
  res.status(statusCode).send(bodyToUpdate);
});

const loadDriverInterests = catchAsync(async (req, res) => {
  let statusCode = httpStatus.NO_CONTENT
  let bodyToUpdate = {};
  let responseBody = {};
  if(req.driver !== undefined) {
    let driverId = req.driver.id
    // console.log('driverId');
    // console.log(driverId);
    // console.log('loadId');
    // console.log(req.params.loadId);
    bodyToUpdate = {
      "driverInterests": [
        {"id": driverId}
      ]
    };
    responseBody = {...bodyToUpdate}
    // console.log('driverInterests');
    // console.log(bodyToUpdate);
    const load = await loadService.updateTenderedLoadById(req.params.loadId, bodyToUpdate);
    statusCode = httpStatus.OK
  }
  res.status(statusCode).send(responseBody);
});

const getTenderedLoads = catchAsync(async (req, res) => {
  let filter = {};
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  // driver is not allowed to see customer details and many other fields as well
  options.populate = [
  {
    path: 'origin',
    select: onlyProfileAddressLocationProjectionString,
    populate: [
      { path: 'location.country', select: onlyCountryNameProjectionString },
      { path: 'location.state', select: onlyStateNameProjectionString },
      { path: 'location.city', select: onlyCityNameProjectionString },
    ]
  },
  {
    path: 'destination',
    select: onlyProfileAddressLocationProjectionString,
    populate: [
      { path: 'location.country', select: onlyCountryNameProjectionString },
      { path: 'location.state', select: onlyStateNameProjectionString },
      { path: 'location.city', select: onlyCityNameProjectionString },
    ]
  },
  ];
  filter.status = 'tender' // driver can see only tendered loads
  let project = {
  paidAmount: 0,
  balanceAmount: 0,
  ratePerMile: 0,
  status: 0,
  invitationSentToDriver: 0,
  onTheWayToDelivery: 0,
  deliveredToCustomer: 0,
  isInviteAcceptedByDriver: 0,
  customer: 0,
  goods: 0,
  charges: 0,
  invitationSentToDrivers: 0,
  driverInterests: 0,
  createdAtDateTime: 0,
  updatedAtDateTime: 0,
  lastInvitedDriver: 0,
  };
  const tenderedLoads = await loadService.queryLoads(filter, options, project);
  res.send(tenderedLoads);
});

const getLoadsByStatusForDriver = catchAsync(async (req, res) => {
  let filter = {};
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  // driver is not allowed to see customer details and many other fields as well
  options.populate = [
  {
    path: 'origin',
    select: onlyProfileAddressLocationProjectionString,
    populate: [
      { path: 'location.country', select: onlyCountryNameProjectionString },
      { path: 'location.state', select: onlyStateNameProjectionString },
      { path: 'location.city', select: onlyCityNameProjectionString },
    ]
  },
  {
    path: 'destination',
    select: onlyProfileAddressLocationProjectionString,
    populate: [
      { path: 'location.country', select: onlyCountryNameProjectionString },
      { path: 'location.state', select: onlyStateNameProjectionString },
      { path: 'location.city', select: onlyCityNameProjectionString },
    ]
  },
  ];
  filter.status = '' // driver can see only his loads
  if(req.params.status)
    filter.status = req.params.status;
  filter.inviteAcceptedByDriver = req.driver._id;
  // console.log('FILTER')
  // console.log(filter)
  let project = {
    paidAmount: 0,
    balanceAmount: 0,
    ratePerMile: 0,
    status: 0,
    invitationSentToDriver: 0,
    onTheWayToDelivery: 0,
    deliveredToCustomer: 0,
    isInviteAcceptedByDriver: 0,
    customer: 0,
    goods: 0,
    charges: 0,
    invitationSentToDrivers: 0,
    driverInterests: 0,
    createdAtDateTime: 0,
    updatedAtDateTime: 0,
    lastInvitedDriver: 0,
  };
  const loads = await loadService.queryLoads(filter, options, project);
  res.send(loads);
});

const getLoadCounts = catchAsync(async (req, res) => {
  const driverId = req.driver._id;
  const filter = {inviteAcceptedByDriver: driverId}
  const countsArray = [];
  const loadCountsFromDb = await loadService.queryLoadCount(filter);
  loadStatuses.forEach((status) => {
    let eachCountStatus = {
      status, count:0
    };
    let matchedResult = _.find(loadCountsFromDb, function(dbCount) { return dbCount._id === status; });
    console.log("matchedResult");
    console.log(matchedResult);
    if(matchedResult !== undefined)
      eachCountStatus.count = matchedResult.count
    countsArray.push(eachCountStatus)
  });
  res.status(httpStatus.OK).send(countsArray);
});

module.exports = {
  createLoad,
  getLoads,
  getLoad,
  updateLoad,
  deleteLoad,
  importLoads,
  exportLoads,
  exportLoad,
  loadInviteAcceptedByDriver,
  loadDriverInterests,
  getTenderedLoads,
  updateLoadByDriver,
  getLoadCounts,
  getLoadsByStatusForDriver
};
