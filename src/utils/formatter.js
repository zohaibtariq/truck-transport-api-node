const Parser = require('./parser');

module.exports = class Formatter {
  static convertJsonToSoapRequest(jsonArguments) {
    const soapBody = Parser.parseJSONBodyToXML(jsonArguments);

    // return `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://tempuri.org/">
    //     <soap:Header/>
    //     <soap:Body>
    //         ${soapBody}
    //     </soap:Body>
    //     </soap:Envelope> `;
    return `<soapenv:Envelope xmlns:cow="http://cows0103.comdata.com" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
       <soapenv:Header>
          <wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
             <wsse:UsernameToken wsu:Id="UsernameToken-F61AC553FBC8A36DE7167569793261813">
                <wsse:Username>extbn444uat</wsse:Username>
                <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">Tn38Hw67</wsse:Password>
                <wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">KJFQ6RkObp+SCBMYwydT8Q==</wsse:Nonce>
                <wsu:Created>2023-02-06T15:38:52.618Z</wsu:Created>
             </wsse:UsernameToken>
          </wsse:Security>
       </soapenv:Header>
       <soapenv:Body>
        ${soapBody}
       </soapenv:Body>
    </soapenv:Envelope>`;
  }
};
