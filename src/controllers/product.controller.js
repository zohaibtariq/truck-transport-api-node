const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { productService, codeService, driverService} = require('../services');
const logger = require('../config/logger');
var _ = require('lodash');
const downloadResource = require('../utils/download');
const User = require("../../src/models/user.model");
const {Product} = require("../models");

const createProduct = catchAsync(async (req, res) => {
  // const product = await productService.createProduct(req.body);
  // res.status(httpStatus.CREATED).send(product);
  let newUniqueGeneratedCode = await codeService.createCode('profiles');
  req.body.code = newUniqueGeneratedCode;
  await productService.createProduct(req.body).then(success => {
    res.status(httpStatus.CREATED).send(success);
  }).catch(error => {
    if(error?.errors?.code?.properties?.value && error?.errors?.code?.properties?.path)
      res.status(httpStatus.UNPROCESSABLE_ENTITY).send({message: `value ${error.errors.code.properties.value} of ${error.errors.code.properties.path} must be unique`});
    else
      res.status(httpStatus.UNPROCESSABLE_ENTITY).send({message: `error in creating profile.`});
  })
});

const getProducts = catchAsync(async (req, res) => {
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

  logger.debug({ ...filter });
  logger.debug({ ...options });
  options.populate = "location.country,location.state,location.city"
  const result = await productService.queryProducts(filter, options);
  res.send(result);
});

const getProduct = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.send(product);
});

const updateProduct = catchAsync(async (req, res) => {
  const product = await productService.updateProductById(req.params.productId, req.body);
  res.send(product);
});

const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProductById(req.params.productId);
  res.status(httpStatus.NO_CONTENT).send();
});

const importProfiles = catchAsync(async (req, res) => {
  let profiles = req.body;
  // console.log('PROFILES');
  // console.log(profiles);
  // let data = await Product.insertMany(profiles.map((profile) => (profiles)));
  let data = await Product.insertMany(profiles);
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
  let data = await productService.queryAllProducts(filter);
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
  const profile = await productService.getProductById(req.params.profileId);
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

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  importProfiles,
  exportProfiles,
  exportProfile
};
