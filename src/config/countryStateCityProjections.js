const onlyCountryNameProjectionString =
  '-isoCode -phonecode -currency -latitude -longitude -timezones -__v -createdAtDateTime -updatedAtDateTime';
const onlyStateNameProjectionString =
  '-countryCode -isoCode -latitude -longitude -__v -createdAtDateTime -updatedAtDateTime';
const onlyCityNameProjectionString =
  '-countryCode -stateCode -latitude -longitude -timezones -__v -createdAtDateTime -updatedAtDateTime';
const onlyProfileAddressLocationProjectionString =
  '-_id -code -isCustomer -isBillTo -isShipper -isConsignee -isBroker -isForwarder -isTerminal -mcId -ediId -notes -email -officeHours -_id -active -userId -contactPersons -createdAt -updatedAt -__v -id -location.id -location.extendedNotes -location.appt -location.externalId -location._id';
const onlyGoodsProjectionString = '-createdAtDateTime -updatedAtDateTime';
const onlyChargesProjectionString = '-createdAtDateTime -updatedAtDateTime';
module.exports = {
  onlyCountryNameProjectionString,
  onlyStateNameProjectionString,
  onlyCityNameProjectionString,
  onlyProfileAddressLocationProjectionString,
  onlyGoodsProjectionString,
  onlyChargesProjectionString,
};
