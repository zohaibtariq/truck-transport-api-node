const permissions = require("./permissions");
const allRoles = {
  user: permissions,
  admin: permissions,
  superadmin: [...permissions, 'country'],
};
const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));
module.exports = {
  roles,
  roleRights,
};
