const driverService = require('./driver.service');

const sendInviteDriverNotificationToDriver = async (driverId = null) => {
  //   console.log('sendInviteDriverNotificationToDriver', driverId);
  const driver = await driverService.getDriverById(driverId);
  let fcmToken = driver.fcmToken;
  let title = 'Test notification title';
  let body = 'Test notification body';
  return await sendPushNotification(fcmToken, title, body);
};

sendPushNotification = async (fcmToken, title, body) => {
  let admin = require('firebase-admin');
  let fcm = require('fcm-notification');
  let serviceAccount = require('../../alliance-web-6a313-firebase-adminsdk-zkgrm-b26e506518.json');
  const certPath = admin.credential.cert(serviceAccount);
  let FCM = new fcm(certPath);
  try {
    let message = {
      android: {
        notification: {
          title: title,
          body: body,
        },
      },
      token: fcmToken,
    };
    console.log('sendPushNotification');
    console.log(message);
    // await FCM.send(message, function (err, resp) {
    //   if (err) {
    //     console.error('sendPushNotification send err');
    //     console.error(err);
    //     throw err;
    //   } else {
    //     console.log('Successfully sent notification');
    //     console.log(resp);
    //   }
    // });
  } catch (err) {
    console.error('sendPushNotification catch err');
    console.error(err);
    throw err;
  }
};

module.exports = {
  sendInviteDriverNotificationToDriver,
};
