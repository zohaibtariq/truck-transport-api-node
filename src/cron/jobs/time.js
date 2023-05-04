const cron = require('node-cron');

cron.schedule('0 * * * *', function () {
  console.log('EVERY HOUR', new Date());
});

cron.schedule('* * * * *', function () {
  console.log('EVERY MINUTE', new Date());
});

cron.schedule('* * * * * *', function () {
  console.log('EVERY SECOND', new Date());
});
