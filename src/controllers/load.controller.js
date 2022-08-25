const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { loadService, inviteDriverService} = require('../services');
const logger = require('../config/logger');
var _ = require('lodash');
const downloadResource = require('../utils/download');
const { Load } = require("../models");
const { loadStatusTypes } = require('../config/loads');
const { inviteActions, inviteActionTypes} = require('../config/inviteActions');
const {
  onlyCountryNameProjectionString,
  onlyStateNameProjectionString,
  onlyCityNameProjectionString,
  onlyProfileAddressLocationProjectionString,
  onlyGoodsProjectionString,
} = require('../config/countryStateCityProjections');
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const generateUniqueId = require("../utils/uniqueId");
const moment = require('moment');

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
  // console.log('getLoad moment unix')
  // console.log(moment().unix())
  // console.log(moment.unix('1660777204').format("MM/DD/YYYY"))
  const load = await loadService.getLoadById(req.params.loadId, true);
  if (!load) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Load not found');
  }
  res.send(load);
});

const getLoadByDriver = catchAsync(async (req, res) => {
  const load = await loadService.getLoadById(req.params.loadId, true);
  // console.log(load)
  // console.log(typeof load.inviteAcceptedByDriver)
  // console.log(req.driver._id)
  // console.log(typeof req.driver._id)
  // if (!load || req.driver._id.toString() !== load?.inviteAcceptedByDriver?.toString()) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'Load not found');
  // }
  // else if() {
  // }
  // TODO:: apply validation that driver can only see invited loads or accepted loads plus we need to hide customer object on certain load statuses
  res.send(load);
});

const updateLoad = catchAsync(async (req, res) => {
  const load = await loadService.updateLoadById(req.params.loadId, req);
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
    let driverId = req.driver._id
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
    const inviteDriverDoc = await inviteDriverService.isDriverInviteValid(req.params.loadId, driverId);
    await inviteDriverService.acceptDriverInvite(inviteDriverDoc);
    statusCode = httpStatus.OK
  }
  res.status(statusCode).send(bodyToUpdate);
});

const loadInviteRejectedByDriver = catchAsync(async (req, res) => {
  let statusCode = httpStatus.NO_CONTENT
  let response = {}
  if(req.driver !== undefined) {
    const loadId = req.params.loadId
    const driverId = req.driver._id
    const inviteDriverDoc = await inviteDriverService.isDriverInviteValid(loadId, driverId);
    const loadDoc = await loadService.isUpdateLoadForDriverRejectInviteAllowed(loadId, driverId);
    const rejectedInviteDriverDoc = await inviteDriverService.rejectDriverInvite(inviteDriverDoc);
    const updatedLoadDoc = await loadService.updateLoadForDriverRejectInvite(loadDoc);
    statusCode = httpStatus.OK
    response = {
      message: 'Invite has been rejected against provided load.'
    }
  }
  res.status(statusCode).send(response);
});

const loadStoreDriverInterests = catchAsync(async (req, res) => {
  let statusCode = httpStatus.NO_CONTENT
  let bodyToUpdate = {};
  let responseBody = {};
  if(req.driver !== undefined) {
    let driverId = req.driver._id
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
  const filter = {};
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
    // goods: 0, // bcz goods will be visible on load detail page
    charges: 0, // TODO:: payment details are required but i need to do calculation on backend and store new keys and share that keys in response
    driverInterests: 0, // TODO:: need to make it same as invited driver but after awais approval
    createdAtDateTime: 0,
    updatedAtDateTime: 0,
    lastInvitedDriver: 0,
  };
  filter.status = '' // driver can see only his loads
  if(req.params.status){
    switch (req.params.status) {
      case loadStatusTypes.PENDING: // show invite received by admin loads to driver
        // filter.invitationSentToDriver = true;
        // filter.isInviteAcceptedByDriver = false;
        // filter.onTheWayToDelivery = false;
        // filter.deliveredToCustomer = false;
        filter.status = {
          '$in': [ // admin might invite from pending load status or tender load status // TODO:: we need to restrict from other load states to not able sent invite even if an admin
            loadStatusTypes.PENDING,
            loadStatusTypes.TENDER,
          ]
        }
        // Object.assign(filter, {
        //   '$or': [ // admin might invite from pending load status or tender load status // TODO:: we need to restrict from other load states to not able sent invite even if an admin
        //     {'status': loadStatusTypes.PENDING},
        //     {'status': loadStatusTypes.TENDER},
        //   ]
        // })
        filter.lastInvitedDriver = req.driver._id;
        break
      case loadStatusTypes.TENDER:
        filter.status = loadStatusTypes.TENDER;
        options.populate.push({
          path: 'goods.good',
          select: onlyGoodsProjectionString,
        })
        break
      case loadStatusTypes.ACTIVE: // show assigned loads to driver
        // filter.invitationSentToDriver = true;
        // filter.isInviteAcceptedByDriver = true;
        // filter.onTheWayToDelivery = false;
        // filter.deliveredToCustomer = false;
        filter.status = loadStatusTypes.ASSIGNED;
        filter.inviteAcceptedByDriver = req.driver._id;
        delete project['customer'] // on assigned/active load we need to show customer detail // TODO:: show limited details of customer here
        break
      case loadStatusTypes.ENROUTE:
        filter.onTheWayToDelivery = true;
        filter.status = loadStatusTypes.ENROUTE;
        filter.inviteAcceptedByDriver = req.driver._id;
        options.populate.push({
          path: 'customer',
          select: onlyProfileAddressLocationProjectionString,
          populate: [
            { path: 'location.country', select: onlyCountryNameProjectionString },
            { path: 'location.state', select: onlyStateNameProjectionString },
            { path: 'location.city', select: onlyCityNameProjectionString },
          ]
        })
        options.populate.push({
          path: 'goods.good',
          select: onlyGoodsProjectionString,
        })
        delete project['customer'] // on assigned/active load we need to show customer detail // TODO:: show limited details of customer here
        delete project['charges'] // TODO:: payment details are required but i need to do calculation on backend and store new keys and share that keys in response
        break
      case loadStatusTypes.COMPLETED: // load delivered to customer and assigned to driver as well
        filter.deliveredToCustomer = true;
        filter.status = loadStatusTypes.COMPLETED;
        filter.inviteAcceptedByDriver = req.driver._id;
        break
      case loadStatusTypes.CANCELLED: // cancelled loads // TODO:: need to ask this what we will display here
        // TODO:: i think we need to look for rejected loads of driver from invited drivers and show all loads here
        // TODO:: yes do as mentioned on above line pass these load ids in filter and show them in app screen it is already disabled
        break
    }
  }
  // console.log('OPTIONS')
  // console.log(options)
  // console.log('PROJECT')
  // console.log(project)
  // console.log('FILTER')
  // console.log(filter)
  const loads = await loadService.queryLoads(filter, options, project);
  res.send(loads);
});

const getLoadCounts = catchAsync(async (req, res) => {
  const driverId = req.driver._id;
  // const filter = {inviteAcceptedByDriver: driverId}
  const filter = {}
  Object.assign(filter, {
    '$or': [ // admin might invite from pending load status or tender load status // TODO:: we need to restrict from other load states to not able sent invite even if an admin
      {'status': loadStatusTypes.PENDING, lastInvitedDriver: driverId},
      {'status': loadStatusTypes.TENDER, lastInvitedDriver: driverId},
      {inviteAcceptedByDriver: driverId},
    ]
  })
  // console.log('filter')
  // console.log(filter)
  const countsArray = [];
  const loadAcceptedByDriverCount = await loadService.queryLoadCount(filter);
  const cancelledLoadCountOfDriver = await inviteDriverService.cancelledLoadCount({
    inviteSentToDriverId: req.driver._id,
    driverAction: inviteActionTypes.REJECTED,
  });
  if(cancelledLoadCountOfDriver.length > 0)
    cancelledLoadCountOfDriver[0]['_id'] = loadStatusTypes.CANCELLED
  const allCounts = [...loadAcceptedByDriverCount, ...cancelledLoadCountOfDriver];
  // console.log('COUNTS');
  // console.log(loadAcceptedByDriverCount);
  // console.log(cancelledLoadCountOfDriver);
  // console.log(allCounts);
  // TODO:: CANCEL count is need to be done
  [
    loadStatusTypes.PENDING,
    loadStatusTypes.TENDER,
    loadStatusTypes.ASSIGNED,
    loadStatusTypes.COMPLETED,
    loadStatusTypes.CANCELLED
  ].forEach((status) => {
    let modifiedStatus = status;
    if(status === loadStatusTypes.ASSIGNED)
      modifiedStatus = loadStatusTypes.ACTIVE
    let eachCountStatus = {
      status: modifiedStatus,
      count: 0
    };
    // console.log('allCounts');
    // console.log(allCounts);
    let matchedResult = _.find(allCounts, function(dbCount) { return dbCount._id === status; });
    // console.log("matchedResult");
    // console.log(matchedResult);
    if(matchedResult !== undefined)
      eachCountStatus.count = matchedResult.count
    if(loadStatusTypes.TENDER === modifiedStatus){ // this conditional is to add tender count in pending
      countsArray[0]['count'] = countsArray[0]['count'] + eachCountStatus.count
    }
    countsArray.push(eachCountStatus)
  });
  // countsArray.push(pendingLoadCount);
  // console.log("cancelledLoadCountOfDriver");
  // console.log(req.driver._id);
  // console.log(req.driver._id);
  // console.log(cancelledLoadCountOfDriver);
  res.status(httpStatus.OK).send(countsArray);
});

const uploadLoadDeliveredImages = catchAsync(async (req, res) => {
  let load = await loadService.getLoadById(req.params.loadId);
  if (!load) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Load not found.');
  }
  if(load.inviteAcceptedByDriver === undefined){
    throw new ApiError(httpStatus.FORBIDDEN, 'Load is not assigned to that driver.');
  }
  let maxAllowedDeliveredFilesToUpload = 4;
  let countOfUploadedDeliveredFiles = load.deliveredImages.length;
  let remainingUploadedDeliveredFilesLeft = maxAllowedDeliveredFilesToUpload - countOfUploadedDeliveredFiles;
  if(remainingUploadedDeliveredFilesLeft === 0){
    throw new ApiError(httpStatus.FORBIDDEN, maxAllowedDeliveredFilesToUpload +  ' Max allowed files already uploaded against this load, please delete any then retry.');
  }
  // console.log("remainingUploadedDeliveredFilesLeft")
  // console.log(remainingUploadedDeliveredFilesLeft)
  const today = new Date();
  const month = today.getMonth()+1;
  const year = today.getFullYear();
  const dir = './uploads/loads/' + year + '/' + month; // http://localhost:3000/uploads/loads/2022/8/1660496788307.jpeg
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
  let storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, dir);
    },
    filename(req, file, callback) {
      callback(null, (new Date().getTime() / 1000).toString().replaceAll('.', '') + generateUniqueId(8) + path.extname(file.originalname)); // Appending extension
    },
  });
  let upload = multer({ storage : storage }).array('images', remainingUploadedDeliveredFilesLeft);
  // try{
  upload(req,res, async (err) => {
    if(err) {
      console.log(err)
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(httpStatus.FORBIDDEN).send({message: "Too many files to upload max " + remainingUploadedDeliveredFilesLeft + " allowed."});
      }
      return res.status(httpStatus.FORBIDDEN).send({message:"Error uploading file."});
    }
    if (req.files.length <= 0) {
      return res.status(httpStatus.FORBIDDEN).send({message:`You must select at least 1 file.`});
    }
    // console.log('Files')
    // console.log(req.files)
    let uploadedFiles = req.files.map((file) => {
      return {image: file.filename, year, month}
    });
    let loadUpdateObj = {
      deliveredImages: [...load.deliveredImages,...uploadedFiles]
    }
    // console.log('Load Obj To Update')
    // console.log(loadUpdateObj)
    load = await loadService.updateDriverLoadById(req, loadUpdateObj)
    return res.status(httpStatus.OK).send({message: req.files.length + " Files are uploaded", load: load});
  });

});

const uploadLoadDeletedImages = catchAsync(async (req, res) => {
  const load = await loadService.getLoadById(req.params.loadId);
  if (!load) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Load not found.');
  }
  let imgFound = _.find(load?.deliveredImages, function(eachImage) { return eachImage._id.toString() === req.params.imgId.toString(); });
  let imgFoundIndex = _.findIndex(load?.deliveredImages, function(eachImage) { return eachImage._id.toString() === req.params.imgId.toString(); });
  load?.deliveredImages.splice(imgFoundIndex, 1);
  // console.log(_.findIndex(load?.deliveredImages, { _id: req.params.imgId}))
  // console.log("imgFoundIndex");
  // console.log(imgFoundIndex);
  // console.log(load?.deliveredImages);
  if(imgFoundIndex !== -1){
    let loadUpdateObj = {
      deliveredImages: load?.deliveredImages
    }
    await loadService.updateDriverLoadById(req, loadUpdateObj);
    if(imgFound){
      const fileFullPath = path.join(__dirname, '../../uploads/loads/'+imgFound.year+'/'+imgFound.month+'/'+imgFound.image);
      fs.unlink(fileFullPath, (err) => {
        if (err) {
          console.error('LOAD DELETE IMG FAILS')
          console.error(err)
        }
      })
    }
  }
  return res.status(httpStatus.OK).send({message: 'Image deleted successfully'});
  // req.params.imgId
  // let maxAllowedDeliveredFilesToUpload = 4;
  // let countOfUploadedDeliveredFiles = load.deliveredImages.length;
  // let remainingUploadedDeliveredFilesLeft = maxAllowedDeliveredFilesToUpload - countOfUploadedDeliveredFiles;
  // if(remainingUploadedDeliveredFilesLeft === 0){
  //   throw new ApiError(httpStatus.FORBIDDEN, maxAllowedDeliveredFilesToUpload +  ' Max allowed files already uploaded against this load, please delete any then retry.');
  // }
  // const today = new Date();
  // const month = today.getMonth()+1;
  // const year = today.getFullYear();
  // const dir = './uploads/loads/' + year + '/' + month; // http://localhost:3000/uploads/loads/2022/8/1660496788307.jpeg
  // if (!fs.existsSync(dir)){
  //   fs.mkdirSync(dir, { recursive: true });
  // }
  // let storage = multer.diskStorage({
  //   destination: function (req, file, callback) {
  //     callback(null, dir);
  //   },
  //   filename(req, file, callback) {
  //     callback(null, Date.now() + path.extname(file.originalname)); // Appending extension
  //   },
  // });
  // let upload = multer({ storage : storage }).array('images',4);
  // try{
  //   upload(req,res, async (err) => {
  //     if(err) {
  //       console.log(err)
  //       if (err.code === "LIMIT_UNEXPECTED_FILE") {
  //         return res.send("Too many files to upload max 4 allowed.");
  //       }
  //       return res.end("Error uploading file.");
  //     }
  //     if (req.files.length <= 0) {
  //       return res.send(`You must select at least 1 file.`);
  //     }
  //     console.log('Files')
  //     console.log(req.files)
  //     let uploadedFiles = req.files.map((file) => {
  //       return {image: file.filename, year, month}
  //     });
  //     let loadUpdateObj = {
  //       deliveredImages: uploadedFiles
  //     }
  //     console.log('Load Obj To Update')
  //     console.log(loadUpdateObj)
  //     const load = await loadService.updateDriverLoadById(req, loadUpdateObj);
  //     return res.send({message: req.files.length + " File is uploaded", load: load});
  //   });
  // } catch (error) {
  //   console.log(error);
  //   if (error.code === "LIMIT_UNEXPECTED_FILE") {
  //     return res.send("Too many files to upload.");
  //   }
  //   return res.send(`Error when trying upload many files: ${error}`);
  // }
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
  loadStoreDriverInterests,
  getTenderedLoads,
  updateLoadByDriver,
  getLoadCounts,
  getLoadsByStatusForDriver,
  getLoadByDriver,
  uploadLoadDeliveredImages,
  uploadLoadDeletedImages,
  loadInviteRejectedByDriver
};
