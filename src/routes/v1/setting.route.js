const express = require('express');
const auth = require('../../middlewares/auth');
const { settingController } = require('../../controllers');

const router = express.Router();

router.post('/', auth('updateSettings'), settingController.updateSettings);
router.get('/', auth('getSettings'), settingController.getSettings);

module.exports = router;
