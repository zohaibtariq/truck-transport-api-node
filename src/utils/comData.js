const moment = require('moment');
const Formatter = require('./formatter');
const ApiClient = require('./api-client'); // Any API Client implementation. Can be axios
const Parser = require('./parser');
const config = require('../config/config');
const { loadStatusTypes } = require('../config/loads');
const url = `https://w8cert.iconnectdata.com:443/cows/services/RealTimeOnline0103`;

module.exports = class ComData {
  static async loadMoney(paymentRequestBody, loadData, driverData) {
    const validationErrorCode = '422';
    const validationErrorMsg = ', to load more amount, create more charge by turning switch on of payable to driver over charge tab of load (active, enroute, completed) detail screen.';
    let check = [loadStatusTypes.ACTIVE, loadStatusTypes.ASSIGNED, loadStatusTypes.ENROUTE].indexOf(loadData.status) >= 0;
    if(!check){
      return {
        "responseCode": validationErrorCode,
        "responseMessage": `this action is allowed only on load with following status (${loadStatusTypes.ACTIVE}, ${loadStatusTypes.ASSIGNED}, ${loadStatusTypes.ENROUTE})`,
      };
    }
    const driverId = loadData.inviteAcceptedByDriver;
    const loadId = loadData.id;
    const distanceMiles = loadData.distanceMiles;
    const driverRatePerMile = loadData.driverRatePerMile;
    let driverAdditionalCharges = 0;
    if(loadData && Object.keys(loadData).length > 0 && loadData?.charges.length > 0){
      loadData?.charges.forEach((charge, index) => {
        if(charge.payableToDriver === true)
          driverAdditionalCharges = parseFloat(parseFloat(driverAdditionalCharges) + (parseFloat(charge.rate) * parseFloat(charge.quantity))).toFixed(2)
      });
    }
    const totalPayableToDriver = parseFloat(parseFloat(driverAdditionalCharges)+(parseFloat(distanceMiles) * parseFloat(driverRatePerMile))).toFixed(2)
    const paidAmount = loadData.paidAmount;
    // const balanceAmount = loadData.balanceAmount;
    let pendingToBePaid = totalPayableToDriver - paidAmount;
    const loadAmount = paymentRequestBody.loadAmount;
    if(pendingToBePaid === 0){
      return {
        "responseCode": validationErrorCode,
        "responseMessage": `Payable amount to driver has been already completely paid ${validationErrorMsg}`,
      };
    }
    else if(parseFloat(loadAmount) > parseFloat(pendingToBePaid)){
      return {
        "responseCode": validationErrorCode,
        "responseMessage": `Max amount which can be loaded is ${pendingToBePaid} ${validationErrorMsg}`,
      };
    }else{
      try {
        const payload = {
          'cow:loadMoney': {
            loadRequest: {
              // get these from END these are fixed values
              customerId: `${config.comDataCustomerId}`,
              password: `${config.comDataPassword}`,
              securityInfo: `${config.comDataSecurityInfo}`,
              signOnName: `${config.comDataSignOnName}`,
              accountCode: `${config.comDataAccountCode}`,
              // customerId: '12666',
              // password: 'BN444',
              // securityInfo: '5600171620474587',
              // signOnName: 'BN444',
              // accountCode: 'BN444',
              // get these from END these are fixed values
              availableDateTime: moment().subtract(2, 'days').format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS),
              cardNumber: driverData.cardNumber, // '1619566120', // TODO: Need to be made dynamic
              plusLessFlag: '1',
              loadAmount: loadAmount,
              // paymentRequestBody can be used here...
              // availableDateTime: `${currentDate}00:00:00`,
              // availableDateTime: '2023-02-11T00:00:00',
              // cardNumber: '16195661209999999999999999',
              // discretionaryData: '?',
              // miscellaneousData: '?',
              // tripNumber: '?',
              // addSubtractFlag: '?',
              // trackingNumber: '4',
              // trackingNumber: '4',
              // directDeposit: '0',
            },
          },
        };
        console.log('payload');
        console.log(payload);
        // return payload;
        const headers = {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            SOAPAction: '"loadMoney"',
          },
        };
        const args = Formatter.convertJsonToSoapRequest(payload);
        // console.log('args');
        // console.log(args);
        return await ApiClient.post(url, args, headers)
          .then(async (remoteResponse) => {
            remoteResponse = remoteResponse.data;
            // console.log('remoteResponse before');
            // console.log(remoteResponse);
            remoteResponse = await Parser.convertXMLToJSON(remoteResponse);
            // console.log('remoteResponse after');
            // console.log(JSON.stringify(remoteResponse));
            const soapResponse = remoteResponse['soapenv:Body']['p910:loadMoneyResponse'].loadMoneyReturn;
            console.log('soapResponse after');
            console.log(soapResponse);
            // console.log('FINAL payment response');
            // console.log(loadPayment);
            // console.log('currentDate');
            // console.log(currentDate);
            return {
              // cardBalanceAfterDepositPosted: soapResponse.cardBalanceAfterDepositPosted,
              // discretionaryData: soapResponse.discretionaryData,
              addSubtractFlag: typeof soapResponse.addSubtractFlag === 'string' ? soapResponse.addSubtractFlag : '', // check if string then get value otherwise consider it as nil value
              cardBalance: soapResponse.cardBalance,
              charges: soapResponse.charges,
              loadAmount: soapResponse.loadAmount,
              plusLessFlag: typeof soapResponse.plusLessFlag === 'string' ? soapResponse.plusLessFlag : '', // check if string then get value otherwise consider it as nil value
              referenceNumber: soapResponse.referenceNumber,
              responseCode: soapResponse.responseCode,
              responseMessage: typeof soapResponse.responseMessage === 'string' ? soapResponse.responseMessage : '', // check if string then get value otherwise consider it as nil value
              trackingNumber: soapResponse.trackingNumber,
              paymentProcessedActualDateTime: new Date(), // ;moment().format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS),
              paidAmount: paidAmount,
              // balanceAmount: balanceAmount,
              pendingToBePaid: pendingToBePaid,
            };
          })
          .catch((err) => {
            console.log('axios catch error');
            console.log(err);
            return err;
          });
      } catch (err) {
        console.log('remote catch error');
        // throw new Error(`Oops something went wrong. Please try again later ${JSON.stringify(err)}`);
        throw new Error(JSON.stringify(err));
      }
    }
    // return loadData;
    // .format('YYYY-MM-DDT'); // DATETIME_LOCAL_SECONDS
  }
};
