const express = require('express');
const auth = require('../../middlewares/auth');
const driverOrUser = require('../../middlewares/driverOrUser');
const validate = require('../../middlewares/validate');
const faqValidation = require('../../validations/faq.validation');
const faqController = require('../../controllers/faq.controller');
const authValidation = require('../../validations/auth.validation');

const router = express.Router();

router.get('/', driverOrUser('getFaqs'), faqController.getFaqs);
router.get('/:faqId', driverOrUser('getFaq'), faqController.getFaq);
router.post('/create', auth('createFaq'), validate(faqValidation.createFaq), faqController.createFaq);
router.delete('/:faqId', auth('deleteFaq'), validate(faqValidation.faqQueryParam), faqController.deleteFaq);
router.post('/:faqId', auth('updateFaq'), validate(faqValidation.updateFaq), faqController.updateFaq);

module.exports = router;
