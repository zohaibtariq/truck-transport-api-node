var admin = require('firebase-admin');

var serviceAccount = require('./trucktransport-a8557-firebase-adminsdk-xq2uk-531a1546a7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //   databaseURL: "https://sample-project-e1a84.firebaseio.com"
});

module.exports.admin = admin;
