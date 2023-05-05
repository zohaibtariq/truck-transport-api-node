const driverService = require('./driver.service');

// const { initializeApp } = require('firebase');
// const { getMessaging, getToken } = require('firebase/messaging');
// const { admin } = require('../firebase-config');

var admin = require('firebase-admin');
var serviceAccount = require('./../alliance-a8557-firebase-adminsdk-xq2uk-531a1546a7.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendInviteDriverNotificationToDriver = async (driverId = null, load = null) => {
  const messaging = admin.messaging();
  // console.log('sendInviteDriverNotificationToDriver', driverId);
  const driver = await driverService.getDriverById(driverId);
  let fcmToken = driver.fcmToken;
  let title = 'Hi ' + driver?.first_name + ', invited for load (' + load?.code + ')';
  let body = 'you have just been invited for load (' + load?.code + ')';
  var payload = {
    token: fcmToken,
    notification: {
      title: title,
      body: body,
    },
  };
  messaging
    .send(payload)
    .then((result) => {
      // console.log('FCM RESULT');
      // console.log(result);
    })
    .catch(function (error) {
      console.error('FCM ERROR');
      console.error(error);
    });
  // var options = {
  //   priority: 'high',
  //   timeToLive: 60 * 60 * 24,
  // };
  // // Import the functions you need from the SDKs you need
  // import { initializeApp } from "firebase/app";
  // import { getAnalytics } from "firebase/analytics";
  // // TODO: Add SDKs for Firebase products that you want to use
  // // https://firebase.google.com/docs/web/setup#available-libraries
  // // Your web app's Firebase configuration
  // // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  // const firebaseConfig = {
  //   apiKey: "AIzaSyCAb94lb128XfhSDpQoak7C3gvzVnHbsGI",
  //   authDomain: "alliance-a8557.firebaseapp.com",
  //   projectId: "alliance-a8557",
  //   storageBucket: "alliance-a8557.appspot.com",
  //   messagingSenderId: "190503020447",
  //   appId: "1:190503020447:web:cb6268bc4662c72539ffaa",
  //   measurementId: "G-SSL2FKRB8T"
  // };
  // // Initialize Firebase
  // const app = initializeApp(firebaseConfig);
  // const analytics = getAnalytics(app);
  // const { initializeApp } = require('firebase-admin/app');
  // const app = initializeApp();
  // const myRefreshToken = '...'; // Get refresh token from OAuth2 flow
  // initializeApp({
  //   credential: refreshToken(myRefreshToken),
  //   databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
  // });
  // const VAPID_KEY = 'BBPToN5MSvChMcdzQjl3zb3tOtIG8ALqfg4IAxQfR95mIQp1mkduZSSVmuF--5Ecx8UuqYp0QtRwwdc6XOeicbw';
  // Replace these values with your project's ones
  // (you can find such code in the Console)
  // const firebaseConfig = {
  //   apiKey: 'AIzaSyCAb94lb128XfhSDpQoak7C3gvzVnHbsGI',
  //   authDomain: 'alliance-a8557.firebaseapp.com',
  //   projectId: 'alliance-a8557',
  //   storageBucket: 'alliance-a8557.appspot.com',
  //   messagingSenderId: '190503020447',
  //   appId: '1:190503020447:web:cb6268bc4662c72539ffaa',
  //   measurementId: 'G-SSL2FKRB8T',
  // };
  // const app = initializeApp(firebaseConfig);
  // const messaging = getMessaging();
  // async function getFCMToken() {
  // try {
  //   // Don't forget to paste your VAPID key here
  //   // (you can find it in the Console too)
  //   const token = await getToken(messaging, { vapidKey: VAPID_KEY });
  //   console.log('token is : ' + token);
  //   return token;
  // } catch (e) {
  //   console.log('getFCMToken error', e);
  //   return undefined;
  // }
  // }
  // admin.messaging().send(payload);
  // admin
  //   .messaging()
  //   .sendToDevice(fcmToken, payload, options)
  //   .then(function (response) {
  //     console.log('Successfully sent message:', response);
  //   })
  //   .catch(function (error) {
  //     console.log('Error sending message:', error);
  //   });
  // return await sendPushNotification(fcmToken, title, body, options);
};

// sendPushNotification = async (fcmToken, title, body, options) => {
// try it
// https://www.youtube.com/watch?v=AtvuaoPYgEo
// https://www.npmjs.com/package/fcm-node
// const options = {
//   priority: 'high',
//   timeToLive: 60 * 60 * 24,
// };
// admin
//   .messaging()
//   .sendToDevice(fcmToken, message, options)
//   .then((response) => {
//     console.log('RESPONSE 1');
//     console.log(response);
//     // res.status(200).send('Notification sent successfully');
//   })
//   .catch((error) => {
//     console.log('error 1 ');
//     console.log(error);
//   });
// let admin = require('firebase-admin');
// let fcm = require('fcm-notification');
// let serviceAccount = require('../../alliance-a8557-firebase-adminsdk-xq2uk-531a1546a7.json'); // android
// const certPath = admin.credential.cert(serviceAccount);
// let FCM = new fcm(certPath);
// try {
//   let message = {
//     // android: {
//     notification: {
//       title: title,
//       body: body,
//     },
//     // },
//     token: fcmToken,
//   };
//   console.log('sendPushNotification');
//   console.log(message);
//   await FCM.send(message, function (err, resp) {
//     if (err) {
//       console.error('sendPushNotification send err');
//       console.error(err);
//       throw err;
//     } else {
//       console.log('Successfully sent notification');
//       console.log(resp);
//     }
//   });
// } catch (err) {
//   console.error('sendPushNotification catch err');
//   console.error(err);
//   throw err;
// }
// };

module.exports = {
  sendInviteDriverNotificationToDriver,
};
