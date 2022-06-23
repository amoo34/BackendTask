// importing required modules
const express = require(`express`);

// importing required middlewares
// const { authenticateRequest } = require(`../middlewares/authentication.middleware`);
const { superAdmin } = require(`../middlewares/authorization.middleware`);
const { validateInput } = require(`../middlewares/input-validation.middleware`);

// importing required permissions
// const { USERS_CREATE, USERS_READ, USERS_UPDATE, USERS_DELETE } = require(`../../dependencies/system-permissions`);

// importing required schemas
const { newUserSchema, loginUserSchema, specificUserSchema, updateUserSchema, allUsersSchema } = require(`../../dependencies/input-validation-schemas/user.schemas`);

// importing required controllers
const { addUser, loginUser, fetchSpecificUser, getAllUsers, updateUserById, deleteUserById } = require(`../controllers/user.controller`);



// initting user router
const userRouter = express.Router();



// 1-> route to login a user
// 2-> route to add a new user in the database
userRouter.post(`/login`,  validateInput(loginUserSchema, `BODY`), loginUser);
userRouter.post(`/addUser`,   validateInput(newUserSchema, `BODY`), addUser);

// 1-> route to fetch a specific user from database via _id
// 2-> route to fetch all users as an array from database
// userRouter.get(`/:userId`, grantAccessTo(USERS_READ), validateInput(specificUserSchema, `PARAMS`), fetchSpecificUser);
userRouter.get(`/`,superAdmin, validateInput(allUsersSchema, `QUERY`), getAllUsers);

// 1-> route to update a specific user in the database via _id
userRouter.patch(`/:userId`, superAdmin,  validateInput(specificUserSchema, `PARAMS`), validateInput(updateUserSchema, `BODY`), updateUserById);

// 1-> route to delete a specific user from database via _id
userRouter.delete(`/:userId`, validateInput(specificUserSchema, `PARAMS`), deleteUserById);



// exporting router as module
module.exports = {

  userRouter

};