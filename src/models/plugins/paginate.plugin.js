/* eslint-disable no-param-reassign */

const paginate = (schema) => {
  /**
   * @typedef {Object} QueryResult
   * @property {Document[]} results - Results found
   * @property {number} page - Current page
   * @property {number} limit - Maximum number of results per page
   * @property {number} totalPages - Total number of pages
   * @property {number} totalResults - Total number of documents
   */
  /**
   * Query for documents with pagination
   * @param {Object} [filter] - Mongo filter
   * @param {Object} [options] - Query options
   * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas (,)
   * @param {string} [options.populate] - Populate data fields. Hierarchy of fields should be separated by (.). Multiple populating criteria should be separated by commas (,)
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @returns {Promise<QueryResult>}
   */
  schema.statics.paginate = async function (filter, options, project = {}) {
    // console.log('inside paginate');
    // console.log(options);
    let sort = '';
    if (options.sortBy) {
      // console.log('OPTONS SORTBY');
      // console.log(options.sortBy);
      const sortingCriteria = [];
      options.sortBy.split(',').forEach((sortOption) => {
        // console.log('each sortOption');
        // console.log(sortOption);
        const [key, order] = sortOption.split(':');
        // console.log('each key');
        // console.log(key);
        // console.log('each order');
        // console.log(order);
        sortingCriteria.push((order === 'desc' ? '-' : '') + key);
        // console.log('each sortingCriteria');
        // console.log(sortingCriteria);
      });
      sort = sortingCriteria.join(' ');
    } else {
      sort = '-createdAt';
    }
    // console.log('sort');
    // console.log(sort);
    const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
    const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
    const skip = (page - 1) * limit;

    const countPromise = this.countDocuments(filter).exec();
    // console.log('CUSTOM FLITER LOG')
    // console.log({ ...filter })
    let docsPromise = this.find(filter, project).sort(sort).skip(skip).limit(limit);
    // if(project !== null)
    //   docsPromise = docsPromise.project(project)
    if (options.populate) {
      // console.log('OPTIONS populate');
      // console.log(typeof options.populate);
      // console.log(options.populate);
      if (typeof options.populate === 'object') {
        docsPromise = docsPromise.populate(options.populate);
      } else {
        options.populate.split(',').forEach((populateOption) => {
          // console.log('OPTIONS populate each');
          // console.log(populateOption);
          // console.log(populateOption
          //   .split(':')
          //   .reverse()
          //   .reduce((a, b) => ({ path: b, populate: a })))
          docsPromise = docsPromise.populate(
            populateOption
              .split(':')
              .reverse()
              .reduce((a, b) => ({ path: b, populate: a }))
          );
        });
      }
    }

    docsPromise = docsPromise.exec();

    return Promise.all([countPromise, docsPromise]).then((values) => {
      // console.log('::: VALUES :::')
      // console.log(values)
      const [totalResults, results] = values;
      const totalPages = Math.ceil(totalResults / limit);
      const result = {
        results,
        page,
        limit,
        totalPages,
        totalResults,
      };
      // console.log('::: RESULT :::')
      // console.log({...result})
      return Promise.resolve(result);
    });
  };
};

module.exports = paginate;
