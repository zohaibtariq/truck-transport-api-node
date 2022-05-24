const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const _ = require("lodash");
const downloadResource = require("../utils/download");
const moment = require('moment');
const bcrypt = require('bcryptjs');
const User = require("../../src/models/user.model");
const password = 'aA!45678';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  // console.log(':::getUsers:::');
  let filter = pick(req.query, ['name', 'role', 'email', /*'gender',*/ 'active']);
  // console.log('UNTOUCHED FILTERS');
  // console.log({ ...filter });
  if(filter['name'] || filter['email']){
    var searchMe = { $regex: new RegExp(filter['name']), $options: 'i'};
    // console.log(searchMe)
    Object.assign(filter, {
      '$or': [
        {'name': searchMe},
        {'email': searchMe},
      ]})
    filter = _.omit(filter, ['name', 'email']);
  }
  // console.log('REQ FILTER');
  // console.log({ ...filter });
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  // options['sortBy'] = 'createdAt:desc';
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const importUsers = catchAsync(async (req, res) => {
  let users = req.body;
  let data = await User.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
  res.status(httpStatus.OK).send({count: data.length, results: data});
});

const isEmailsUnique = catchAsync(async (req, res) => {
  console.log('isEmailsUnique')
  console.log(req.body, typeof req.body)
  let users = await userService.uniqueEmails({ email: { $in: req.body } });
  res.status(httpStatus.OK).send({count: users.length, results: users});
});

const exportUsers = catchAsync(async (req, res) => {
  const fields = [
    {
      label: 'Role',
      value: 'role'
    },
    {
      label: 'Active',
      value: 'active'
    },
    // {
    //   label: 'Gender',
    //   value: 'gender'
    // },
    {
      label: 'Name',
      value: 'name'
    },
    {
      label: 'Email',
      value: 'email'
    },
    {
      label: 'Created At',
      value: 'createdAt'
    },
    {
      label: 'Updated At',
      value: 'updatedAt'
    }
  ];
  let data = await userService.queryAllUsers({});
  let fileName = 'users-'+(new Date().toTimeString())+'.csv';
  return downloadResource(res, fileName, fields, data);
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  importUsers,
  exportUsers,
  isEmailsUnique
};
