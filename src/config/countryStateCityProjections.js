const onlyCountryNameProjectionString = '-_id -isoCode -phonecode -flag -currency -latitude -longitude -timezones -__v -createdAtDateTime -updatedAtDateTime'
const onlyStateNameProjectionString = '-_id -countryCode -isoCode -phonecode -flag -currency -latitude -longitude -timezones -__v -createdAtDateTime -updatedAtDateTime'
const onlyCityNameProjectionString = '-_id -countryCode -stateCode -isoCode -phonecode -flag -currency -latitude -longitude -timezones -__v -createdAtDateTime -updatedAtDateTime'
const onlyProfileAddressLocationProjectionString = '-_id -code -isCustomer -isBillTo -isShipper -isConsignee -isBroker -isForwarder -isTerminal -mcId -ediId -notes -email -officeHours -_id -active -userId -contactPersons -createdAt -updatedAt -__v -id -location.id -location.extendedNotes  -location.name  -location.appt  -location.externalId -location._id'

module.exports = {
  onlyCountryNameProjectionString,
  onlyStateNameProjectionString,
  onlyCityNameProjectionString,
  onlyProfileAddressLocationProjectionString,
};
