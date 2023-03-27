const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const loadValidation = require('../../validations/load.validation');
const loadController = require('../../controllers/load.controller');
const driverAuth = require('../../middlewares/driverAuth');
// const driverOrUser = require('../../middlewares/driverOrUser');

const router = express.Router();

/*
 APP API'S START
*/
router.get('/counts', driverAuth(), loadController.getLoadCounts);
router.get('/tendered', driverAuth(), loadController.getTenderedLoads);
router.get('/drivers/:status', driverAuth(), loadController.getLoadsByStatusForDriver);
// router.post(
//   '/drivers/:loadId',
//   driverAuth(),
//   validate(loadValidation.updateLoadByDriver),
//   loadController.updateLoadByDriver // 98
// );
router.get('/drivers/:loadId/load', driverAuth(), validate(loadValidation.loadQueryParam), loadController.getLoadByDriver);
router.get(
  '/drivers/:loadId/payments',
  driverAuth(),
  validate(loadValidation.loadQueryParam),
  loadController.paymentTransactionsByLoadAndDriver
);
router.post(
  '/:loadId/accept-invite-by-driver',
  driverAuth(),
  validate(loadValidation.loadQueryParam),
  loadController.loadInviteAcceptedByDriver
);
router.post(
  '/:loadId/reject-invite-by-driver',
  driverAuth(),
  validate(loadValidation.loadQueryParam),
  loadController.loadInviteRejectedByDriver
);
router.post(
  '/:loadId/interest',
  driverAuth(),
  validate(loadValidation.loadQueryParam),
  loadController.loadStoreDriverInterests
);

router.post('/upload/enroute/:loadId', driverAuth(), loadController.uploadLoadEnroutedImages);
router.post('/delete/:loadId/enroute/:imgId', driverAuth(), loadController.deleteEnroutedLoadImages);

router.post('/upload/completed/:loadId', driverAuth(), loadController.uploadLoadDeliveredImages);
router.post('/delete/:loadId/completed/:imgId', driverAuth(), loadController.deleteCompletedLoadImages);

/*
 APP API'S END
*/

router.post('/import/loads', auth('importLoads'), loadController.importLoads);
router.post('/export/loads', auth('exportLoads'), loadController.exportLoads);
router.post('/export/load/:loadId', auth('exportLoad'), validate(loadValidation.loadQueryParam), loadController.exportLoad);
router.get('/', auth('getLoads'), loadController.getLoads);
router.post('/create', auth('createLoad'), validate(loadValidation.createLoad), loadController.createLoad);
router.post('/:loadId', auth('updateLoad'), validate(loadValidation.updateLoad), loadController.updateLoad);
router.post('/:loadId/payment', auth('payment'), validate(loadValidation.payment), loadController.payment);
router.get(
  '/:loadId/payment/transactions',
  auth('paymentTransactions'),
  validate(loadValidation.paymentTransactions),
  loadController.paymentTransactions
);
router.get('/:loadId', auth('getLoad'), validate(loadValidation.loadQueryParam), loadController.getLoad);
router.delete('/:loadId', auth('deleteLoad'), validate(loadValidation.loadQueryParam), loadController.deleteLoad);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Loads
 *   description: Load management and retrieval
 */

/**
 * @swagger
 * /loads:
 *   post:
 *     summary: Create a load
 *     description: Only admins can create load.
 *     tags: [Loads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               role:
 *                  type: string
 *                  enum: [user, admin]
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *               role: user
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all users
 *     description: Only admins can retrieve all users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: User name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: User role
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of users
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user
 *     description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a user
 *     description: Logged in users can only update their own information. Only admins can update other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a user
 *     description: Logged in users can delete only themselves. Only admins can delete other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
