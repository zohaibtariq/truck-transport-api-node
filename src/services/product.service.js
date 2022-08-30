const httpStatus = require('http-status');
const { Product } = require('../models');
const ApiError = require('../utils/ApiError');
const {
  onlyCountryNameProjectionString,
  onlyStateNameProjectionString,
  onlyCityNameProjectionString,
} = require('../config/countryStateCityProjections');

/**
 * Create a product
 * @param {Object} productBody
 * @returns {Promise<Product>}
 */
const createProduct = async (productBody) => {
  return Product.create(productBody);
};

/**
 * Query for products
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryProducts = async (filter, options) => {
  // return await Product.find()
  const products = await Product.paginate(filter, options);
  return products;
};

/**
 * Get product by id
 * @param {ObjectId} id
 * @returns {Promise<Product>}
 */
const getProductById = async (id) => {
  // return Product.findById(id).populate({ path: 'locationCountry', model: 'Country' });
  // return Product.findById(id).populate('locationCountry');
  return Product.findById(id).populate([
    { path: 'location.country', select: onlyCountryNameProjectionString },
    { path: 'location.state', select: onlyStateNameProjectionString },
    { path: 'location.city', select: onlyCityNameProjectionString },
  ]);
};
//
// /**
//  * Get product by email
//  * @param {string} email
//  * @returns {Promise<Product>}
//  */
// const getProductByEmail = async (email) => {
//   return Product.findOne({ email });
// };

/**
 * Update product by id
 * @param {ObjectId} productId
 * @param {Object} updateBody
 * @returns {Promise<Product>}
 */
const updateProductById = async (productId, updateBody) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  // if (updateBody.email && (await Product.isEmailTaken(updateBody.email, productId))) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  // }
  Object.assign(product, updateBody);
  await product.save();
  return product;
};

/**
 * Delete product by id
 * @param {ObjectId} productId
 * @returns {Promise<Product>}
 */
const deleteProductById = async (productId) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  await product.remove();
  return product;
};

const queryAllProducts = async (filter) => {
  return Product.find(filter).lean();
};

module.exports = {
  createProduct,
  queryProducts,
  getProductById,
  // getProductByEmail,
  updateProductById,
  deleteProductById,
  queryAllProducts,
};
