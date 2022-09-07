const httpStatus = require('http-status');
const path = require('path');
const multer = require('multer');
const _ = require('lodash');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { faqService, codeService, authService, tokenService, emailService } = require('../services');
const logger = require('../config/logger');
const { Faq } = require('../models');

const createFaq = catchAsync(async (req, res) => {
  const faq = await faqService.createFaq(req.body);
  res.status(httpStatus.CREATED).send(faq);
});

const getFaqs = catchAsync(async (req, res) => {
  let filter = pick(req.query, ['search']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (filter.search) {
    const searchMe = { $regex: new RegExp(filter.search.toString()), $options: 'i' };
    Object.assign(filter, {
      $or: [{ question: searchMe }, { answer: searchMe }],
    });
    filter = _.omit(filter, ['search']);
  }
  const result = await faqService.queryFaqs(filter, options);
  res.send(result);
});

const getFaq = catchAsync(async (req, res) => {
  const faq = await faqService.getFaqById(req.params.faqId);
  if (!faq) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Faq not found');
  }
  res.send(faq);
});

const getOneFaq = catchAsync(async (req, res) => {
  const faq = await faqService.getFaqById(req.faq._id);
  if (!faq) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Faq not found');
  }
  res.send(faq);
});

const updateFaq = catchAsync(async (req, res) => {
  const faq = await faqService.updateFaqById(req.params.faqId, req.body);
  res.send(faq);
});

const deleteFaq = catchAsync(async (req, res) => {
  await faqService.deleteFaqById(req.params.faqId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createFaq,
  getFaqs,
  getFaq,
  updateFaq,
  deleteFaq,
  getOneFaq,
};
