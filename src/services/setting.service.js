const { Setting } = require('../models');

const updateSettings = async (settings) => {
  const results = [];
  for (const settingKey in settings) {
    console.log(settingKey);
    if (Object.hasOwn(settings, settingKey)) {
      console.log({
        key: settingKey,
        value: settings[settingKey],
      });
      results.push(
        await Setting.findOneAndUpdate(
          {
            key: settingKey,
          },
          {
            key: settingKey,
            value: settings[settingKey],
          },
          {
            new: true,
            upsert: true,
            useFindAndModify: false,
          }
        )
      );
    }
  }
  return await Promise.all(results);
};

const getSettings = async () => {
  return Setting.find({});
};

module.exports = {
  getSettings,
  updateSettings,
};
