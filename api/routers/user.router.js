// importing required modules
const express = require(`express`);

// importing Required Middlewares
const { authenticateRequest } = require(`../middlewares/authentication.middleware`);
const { adminAuth } = require(`../middlewares/authorization.middleware`);
const { validateInput } = require(`../middlewares/input-validation.middleware`);

// importing required schemas
const { newUserSchema, loginUserSchema, specificUserSchema, updateUserSchema, allUsersSchema } = require(`../../dependencies/input-validation-schemas/user.schemas`);

// importing required controllers
const { addUser, loginUser, fetchSpecificUser, getAllUsers, updateUserById, deleteUserById } = require(`../controllers/user.controller`);



// iniatialize user Router
const userRouter = express.Router();



// -----------------------------------ROUTES--------------------------------------------------

// Route to Login User
userRouter.post(`/login`,  validateInput(loginUserSchema, `BODY`), loginUser);

// Route to Add User
userRouter.post(`/addUser`,  validateInput(newUserSchema, `BODY`), addUser);

// Route to get a Specific User
userRouter.get(`/getUser/:userId`, authenticateRequest, adminAuth, validateInput(specificUserSchema, `PARAMS`), fetchSpecificUser);

// Route to get All Users
userRouter.get(`/getUsers`, authenticateRequest, adminAuth, validateInput(allUsersSchema, `QUERY`), getAllUsers);

// Route to update a Specific User
userRouter.patch(`/updateUser/:userId`, authenticateRequest, adminAuth, validateInput(specificUserSchema, `PARAMS`), validateInput(updateUserSchema, `BODY`), updateUserById);

// Route to Delete a Specific User
userRouter.delete(`/deleteUser/:userId`, authenticateRequest, adminAuth, validateInput(specificUserSchema, `PARAMS`), deleteUserById);



// exporting router as module
module.exports = {

  userRouter

};