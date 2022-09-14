const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const profileValidation = require('../../validations/profile.validation');
const profileController = require('../../controllers/profile.controller');
const authValidation = require('../../validations/auth.validation');
const profileAuth = require('../../middlewares/profileAuth');
const loadController = require('../../controllers/load.controller');
const loadValidation = require('../../validations/load.validation');

const router = express.Router();

/*
 CUSTOMER PORTAL API'S
*/
router.post('/login', validate(authValidation.login), profileController.login);
router.post('/logout', validate(authValidation.logout), profileController.logout);
router.post('/forgot-password', validate(authValidation.forgotPassword), profileController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), profileController.resetPassword);

/* TODO:: we are not going to move these APIS but we need to be caefull when we update these methods logics */
router.get('/loads/', profileAuth('getLoads'), profileController.getLoads);
router.get('/loads/:loadId', profileAuth('getLoad'), validate(loadValidation.loadQueryParam), profileController.getLoad);

/* These commented apis below has not been tested or integrated so whenever uncommented plz exec complete test flow */
// router.post('/verify-otp', validate(authValidation.verifyOtp), profileController.verifyOtp);
// router.post('/send-verification-email', profileAuth(), profileController.sendVerificationEmail);
// router.post('/verify-email', validate(authValidation.verifyEmail), profileController.verifyEmail);
// router.get('/profile', profileAuth(), profileController.getOneProfile);
// router.post(
//   '/update',
//   profileAuth(),
//   validate(profileValidation.updateProfile),
//   profileController.updateProfileFromCustomerPortal
// );
// router.post(
//   '/change-password',
//   profileAuth(),
//   validate(profileValidation.changeProfilePassword),
//   profileController.changeProfilePassword
// );
/* These commented apis above has not been tested or integrated so whenever uncommented plz exec complete test flow */

/*
 ADMIN PORTAL API'S
*/
router.post('/import/profiles', auth('importProfiles'), profileController.importProfiles);
router.post('/export/profiles', auth('exportProfiles'), profileController.exportProfiles);
router.post(
  '/export/profile/:profileId',
  auth('exportProfile'),
  validate(profileValidation.validateProfileIdQueryParam),
  profileController.exportProfile
);
router.get('/', auth('getProfiles'), profileController.getProfiles);
router.post(
  '/create',
  auth('createProfile'),
  /* validate(profileValidation.createProfile), */ profileController.createProfile
);
router.get('/:profileId', auth('getProfile'), validate(profileValidation.profileQueryParam), profileController.getProfile);
router.post(
  '/:profileId',
  auth('updateProfile'),
  validate(profileValidation.updateProfile),
  profileController.updateProfile
);
router.delete(
  '/:profileId',
  auth('deleteProfile'),
  validate(profileValidation.profileQueryParam),
  profileController.deleteProfile
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: Profile management and retrieval
 */

/**
 * @swagger
 * /profiles:
 *   post:
 *     summary: Create a profile
 *     description: Only admins can create profile.
 *     tags: [Profiles]
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
