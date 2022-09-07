const httpStatus = require('http-status');
const { Faq } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a faq
 * @param {Object} faqBody
 * @returns {Promise<Faq>}
 */
const createFaq = async (faqBody) => {
  return Faq.create(faqBody);
};

/**
 * Query for faqs
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryFaqs = async (filter, options) => {
  const faqs = await Faq.paginate(filter, options);
  return faqs;
};

/**
 * Get faq by id
 * @param {ObjectId} id
 * @returns {Promise<Faq>}
 */
const getFaqById = async (id) => {
  return Faq.findById(id);
};

/**
 * Update faq by id
 * @param {ObjectId} faqId
 * @param {Object} updateBody
 * @returns {Promise<Faq>}
 */
const updateFaqById = async (faqId, updateBody) => {
  const faq = await getFaqById(faqId);
  if (!faq) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Faq not found');
  }
  Object.assign(faq, updateBody);
  await faq.save();
  return faq;
};

/**
 * Delete faq by id
 * @param {ObjectId} faqId
 * @returns {Promise<Faq>}
 */
const deleteFaqById = async (faqId) => {
  const faq = await getFaqById(faqId);
  if (!faq) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Faq not found');
  }
  await faq.remove();
  return faq;
};

const queryAllFaqs = async (filter) => {
  return Faq.find(filter).lean();
};

module.exports = {
  createFaq,
  queryFaqs,
  getFaqById,
  updateFaqById,
  deleteFaqById,
  queryAllFaqs,
};
