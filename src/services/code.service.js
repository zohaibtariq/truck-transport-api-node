const { Load, Driver, Product} = require('../models');
const generateUniqueId = require("../utils/uniqueId");
const _ = require('lodash');

const createCode = async (collection = '') => {
  // console.log('createCode');
  let index = -1;
  let newUniqueCode = '';
  do {
    let loadsCodes
    if(collection === 'loads')
      loadsCodes = await Load.find({}, 'code').exec();
    else if(collection === 'drivers')
      loadsCodes = await Driver.find({}, 'code').exec();
    else if(collection === 'profiles')
      loadsCodes = await Product.find({}, 'code').exec();
    // console.log("loadsCodes");
    // console.log(loadsCodes);
    newUniqueCode = generateUniqueId(8);
    // console.log("newUniqueCode");
    // console.log(newUniqueCode);
    const onlyCodes = _.map(loadsCodes, 'code');
    // console.log("onlyCodes")
    // console.log(onlyCodes)
    index = onlyCodes.indexOf(newUniqueCode);
    // console.log("index")
    // console.log(index)
  }
  while (index !== -1);
  return newUniqueCode;
};

module.exports = {
  createCode
};
