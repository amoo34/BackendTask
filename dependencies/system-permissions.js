// exporting permissions as module
module.exports = {

  // ADMIN PERMISSIONS
  ADMIN_MASTER_FRANCHISE: [`admin:master-franchise`],
  ADMIN_FRANCHISE: [`admin:franchise`],
  // ADMIN_LOCATION: [`admin:location`],

  // USERS PERMISSIONS
  USERS_CREATE: [`users:*`, `users:create`],
  USERS_READ: [`users:*`, `users:read`, `users:create`, `users:update`, `users:delete`],
  USERS_UPDATE: [`users:*`, `users:update`],
  USERS_DELETE: [`users:*`, `users:delete`],

}