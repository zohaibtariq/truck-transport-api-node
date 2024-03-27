const cron = require('node-cron');
const { MongoClient } = require('mongodb');
const config = require('../../config/config');
const { split } = require('lodash');

// Connection URL
const url = config.mongoose.url;
const client = new MongoClient(url);
const splitted = split(url, '/');
// Database Name
const dbName = splitted[splitted.length - 1];

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  const db = client.db(dbName);
  const settings = await db
    .collection('settings')
    .findOne({ key: 'selectedHourOfDailyEmailSendToDriversWithTenderedLoads' }, { key: 1 });
  //   console.log(settings?.value);
  //   console.log(new Date().getHours());
  if (settings?.value && parseInt(settings.value) === parseInt(new Date().getHours())) {
    const activeDrivers = (await db.collection('drivers').find({ active: true }, { email: 1 }).toArray()).map(function (
      driver
    ) {
      return { email: driver.email };
    });
    const tenderedLoads = (await db.collection('loads').find({ status: 'tender' }).toArray()).map(function (load) {
      return { code: load.code };
    });
    return {
      drivers: activeDrivers,
      loads: tenderedLoads,
    };
  }
  return {};
}

// cron.schedule('* * * * * *', function () {
//   console.log('EVERY SECOND', new Date());
cron.schedule('0 * * * *', function () {
  console.log('EVERY HOUR', new Date());
  main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());
});
