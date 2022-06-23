
// importing required packages and modules
const mongoose = require(`mongoose`);

// const { logWarning, console.log } = require(`dependencies/helpers/console.helpers`);


// importing response status codes
const { HTTP_STATUS_CODES: { SUCCESS, CREATED, NOT_FOUND, BAD_REQUEST, CONFLICT, SERVER_ERROR } } = require(`../../dependencies/config`);

// importing required data services
const { saveUser, findUserById, findUsers, findUserByIdAndUpdate } = require(`../../dependencies/internal-services/user.services`);

// importing required models
const User = require(`../models/user.model`);



// this controller takes data via incoming request body and creates a new user
// in the database
const addUser = async (req, res, next) => {

  try {

    // getting email from incoming req.body
    const { email } = req.body;

    // Check if User already Exists
    const userAlreadyExists = await User.findOne({ email });

    // handle duplicate user with same email
    if (userAlreadyExists) {

      // returning the response with an error message
      return res.status(BAD_REQUEST).json({

        hasError: true,
        message: `ERROR: User already exists with same email.`

      });

    }

    // calling data service to save new user in the database
    const { status, data, error } = await saveUser(req.body);

    // checking the result of the operation
    if (status === SERVER_ERROR) {
      // this code runs in case data service failed due to unknown database
      // error

      // logging error message to the console
      console.log(`Requested operation failed. Unknown database error.`);

      // returning the response with an error message
      return res.status(SERVER_ERROR).json({

        hasError: true,
        message: `ERROR: Requested operation failed.`,
        error: {

          error

        }

      });

    } else if (status === CONFLICT) {
      // this code runs in case data service failed due to duplication value

      // logging error message to the console
      console.log(`Requested operation failed. User with duplicate field(s) exists.`);

      // returning the response with an error message
      return res.status(CONFLICT).json({

        hasError: true,
        message: `ERROR: Requested operation failed.`,
        error: {

          error

        }

      });

    }

    // returning the response with success message
    return res.status(CREATED).json({

      hasError: false,
      message: `SUCCESS: Requested operation successful.`,
      data: {

        user: data

      }

    });

  } catch (error) {
    // this code runs in case of an error @ runtime

    // logging error messages to the console
    console.log(`ERROR @ addUser -> user.controllers.js`, error);

    // returning response with an error message
    return res.status(SERVER_ERROR).json({

      hasError: true,
      message: `ERROR: Requested operation failed.`,
      error: {

        error: `An unhandled exception occured on the server.`

      }

    });

  }

}

// this controller takes data via incoming request body and creates a new user
// in the database
const loginUser = async (req, res, next) => {

  try {

    // Check if User already Exists
    const userAlreadyExists = await User.findOne({ email: email });

    if (userAlreadyExists) {

      // returning the response with an error message
      return res.status(BAD_REQUEST).json({

        hasError: true,
        message: `ERROR: User already exists with same email.`,
        error: {

          error

        }

      });

    }

    // calling data service to save new user in the database
    const { status, data, error } = await saveUser(req.body);

    // checking the result of the operation
    if (status === SERVER_ERROR) {
      // this code runs in case data service failed due to unknown database
      // error

      // logging error message to the console
      console.log(`Requested operation failed. Unknown database error.`);

      // returning the response with an error message
      return res.status(SERVER_ERROR).json({

        hasError: true,
        message: `ERROR: Requested operation failed.`,
        error: {

          error

        }

      });

    } else if (status === CONFLICT) {
      // this code runs in case data service failed due to duplication value

      // logging error message to the console
      console.log(`Requested operation failed. User with duplicate field(s) exists.`);

      // returning the response with an error message
      return res.status(CONFLICT).json({

        hasError: true,
        message: `ERROR: Requested operation failed.`,
        error: {

          error

        }

      });

    }

    // returning the response with success message
    return res.status(CREATED).json({

      hasError: false,
      message: `SUCCESS: Requested operation successful.`,
      data: {

        user: data

      }

    });

  } catch (error) {
    // this code runs in case of an error @ runtime

    // logging error messages to the console
    console.log(`ERROR @ loginUser -> user.controllers.js`, error);

    // returning response with an error message
    return res.status(SERVER_ERROR).json({

      hasError: true,
      message: `ERROR: Requested operation failed.`,
      error: {

        error: `An unhandled exception occured on the server.`

      }

    });

  }

}

// this controller takes the data userId via incoming request and fetch the user
//  using userId from the database and returns response
const fetchSpecificUser = async (req, res, next) => {

  try {

    // fetching required data via path params of url
    const { userId } = req.params;

    const { bearerPermissions } = req.tokenData


    // calling data service to fetching requested User from database
    const { status, data, error } = await findUserById(userId, bearerPermissions);

    // checking the result of the operation
    if (status === SERVER_ERROR) {
      // this code runs in case data service failed due to unknown database
      // error

      // logging error message to the console
      console.log(`Requested operation failed. Unknown database error.`);

      // returning the response with an error message
      return res.status(SERVER_ERROR).json({

        hasError: true,
        message: `ERROR: Requested operation failed.`,
        error: {

          error

        }

      });

    } else if (status === NOT_FOUND) {
      // this code runs in case data service could not find the requested
      // resource

      // logging error message to the console
      console.log(`Requested operation failed. User with not found.`);

      // returning the response with an error message
      return res.status(NOT_FOUND).json({

        hasError: true,
        message: `ERROR: Requested operation failed.`,
        error: {

          error

        }

      });

    }

    // returning the response with success message
    return res.status(SUCCESS).json({

      hasError: false,
      message: `SUCCESS: Requested operation successful.`,
      data: {

        user: data

      }

    });

  } catch (error) {
    // this code runs in case of an error @ runtime

    // logging error messages to the console
    console.log(`ERROR @ fetchSpecificUser -> user.controllers.js`, error);

    // returning the response with an error message
    return res.status(SERVER_ERROR).json({

      hasError: true,
      message: `ERROR: Requested operation failed.`,
      error: {

        error: `An unexpected error occurred on the server.`

      }

    });

  }

}

// this controller get all the user from the database ad returns the response
const getAllUsers = async (req, res, next) => {

  try {

    // calling data service to fetch all user from database
    const { status, data, error } = await findUsers(req.query);

    // checking the result of the operation
    if (status === SERVER_ERROR) {
      // this code runs in case data service failed due to unknown database
      // error

      // logging error message to the console
      console.log(`Requested operation failed. Unknown database error.`);

      // returning the response with an error message
      return res.status(SERVER_ERROR).json({

        hasError: true,
        message: `ERROR: Requested operation failed.`,
        error: {

          error

        }

      });

    }

    // returning the response with success message
    return res.status(SUCCESS).json({

      hasError: false,
      message: `SUCCESS: Requested operation successful.`,
      data: {

        ...data

      }

    });

  } catch (error) {
    // this code runs in case of an error @ runtime

    // logging error messages to the console
    console.log(`ERROR @ getAllUsers -> user.controllers.js`, error);

    // returning the response with an error message
    return res.status(SERVER_ERROR).json({

      hasError: true,
      message: `ERROR: Requested operation failed.`,
      error: {

        error: `An unexpected error occurred on the server.`

      }

    });

  }

}

// this controller takes the data userId and data obj via incoming request, find
// the user using userId and update it according to the data obj in the database
const updateUserById = async (req, res, next) => {

  try {

    // fetching required data via path params of url
    const { userId } = req.params;

    //  getting and assigning _updater from token data
    const _updater = req.tokenData._id;

    // calling data service to update the requested user from database
    const { status, data, error } = await findUserByIdAndUpdate(req.body, userId, _updater);

    // checking the result of the operation
    if (status === SERVER_ERROR) {
      // this code runs in case data service failed due to unknown database
      // error

      // logging error message to the console
      console.log(`Requested operation failed. Unknown database error.`);

      // returning the response with an error message
      return res.status(SERVER_ERROR).json({

        hasError: true,
        message: `ERROR: Requested operation failed.`,
        error: {

          error

        }

      });

    } else if (status === NOT_FOUND) {
      // this code runs in case data service could not find the requested
      // resource

      // logging error message to the console
      console.log(`Requested operation failed. User not found.`);

      // returning the response with an error message
      return res.status(NOT_FOUND).json({

        hasError: true,
        message: `ERROR: Requested operation failed.`,
        error: {

          error

        }

      });

    }

    // returning the response with success message
    return res.status(SUCCESS).json({

      hasError: false,
      message: `SUCCESS: Requested operation successful.`,
      data: {

        user: data

      }

    });

  } catch (error) {
    // this code runs in case of an error @ runtime

    // logging error messages to the console
    console.log(`ERROR @ updateUserById -> user.controllers.js`, error);

    // returning the response with an error message
    return res.status(SERVER_ERROR).json({

      hasError: true,
      message: `ERROR: Requested operation failed.`,
      error: {

        error: `An unexpected error occurred on the server.`

      }

    });

  }

}

// this controller takes the data userId via incoming request, find the user using
// userId and delete it from the database
const deleteUserById = async (req, res, next) => {

  try {

    // fetching required data via path params of url
    const { userId } = req.params;

    //  creating Creator id for temporar use
    const _updator = new mongoose.Types.ObjectId

    let updateData = { isDeleted: true };

    // calling data service to update the requested user from database
    const { status, data, error } = await findUserByIdAndUpdate(updateData, userId, _updator);

    // checking the result of the operation
    if (status === SERVER_ERROR) {
      // this code runs in case data service failed due to unknown database
      // error

      // logging error message to the console
      console.log(`Requested operation failed. Unknown database error.`);

      // returning the response with an error message
      return res.status(SERVER_ERROR).json({

        hasError: true,
        message: `ERROR: Requested operation failed.`,
        error: {

          error

        }

      });

    } else if (status === NOT_FOUND) {
      // this code runs in case data service could not find the requested
      // resource

      // logging error message to the console
      console.log(`Requested operation failed. User not found.`);

      // returning the response with an error message
      return res.status(NOT_FOUND).json({

        hasError: true,
        message: `ERROR: Requested operation failed.`,
        error: {

          error

        }

      });

    }

    // returning the response with success message
    return res.status(SUCCESS).json({

      hasError: false,
      message: `SUCCESS: Requested operation successful.`,
      data: {}

    });

  } catch (error) {
    // this code runs in case of an error @ runtime

    // logging error messages to the console
    console.log(`ERROR @ deleteUserById -> user.controllers.js`, error);

    // returning the response with an error message
    return res.status(SERVER_ERROR).json({

      hasError: true,
      message: `ERROR: Requested operation failed.`,
      error: {

        error: `An unexpected error occurred on the server.`

      }

    });

  }

}






// exporting user controllers as modules
module.exports = {

  addUser,
  loginUser,
  fetchSpecificUser,
  getAllUsers,
  updateUserById,
  deleteUserById

}