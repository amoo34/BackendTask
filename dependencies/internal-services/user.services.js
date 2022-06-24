// importing required packages and modules
const mongoose = require(`mongoose`);

const User = require(`../../api/models/user.model`);
const bcrypt = require(`bcryptjs`)
const JWT = require(`jsonwebtoken`)

// this data service is used to save user Data in Database
const saveUser = async (userData) => {

  try {

    // creating object to store new user 
    const newUser = new User({
      ...userData
    });

    // saving user in the database
    const result = await newUser.save();

    // returning saved response to it's caller 
    return {

      status: 201,
      data: result

    };

  } catch (error) {
    // this code runs in case of an error @ runtime

    // logging error messages to the console
    console.log(`ERROR @ saveUser -> user.services.js`, error);

    // checking if the error stems from duplicate value in database
    const isDuplicateError = error && error.code === 11000;

    // fetching fields which caused duplication error
    const duplicateErrorFields = (Object.keys(error.keyValue)).join(`, `);

    // setting value of status and description
    const [status, err] = [isDuplicateError ? 409 : 500, isDuplicateError ? `user creation failed due to duplicate ${duplicateErrorFields}.` : `Unhanlded exception occurred on the server.`];

    // returning response to indicate failure to its caller
    return {

      status,
      error: err

    };

  }

}

// this data service takes in the userId, and return specific user
const findUserById = async (userId) => {

  try {

    const result = await User.findById(userId)

    if (!result) {
      // this code runs in case query didn't return anything from database

      // returning response to its caller with error message
      return {

        status: 404,
        error: `Requested data not found in database.`

      };

    }

    // returning response to it's caller 
    return {

      status: 200,
      data: result

    };

  } catch (error) {
    // this code runs in case of an error @ runtime

    // logging error messages to the console
    console.log(`ERROR @ findUserById -> user.services.js`, error);

    // returning response to indicate failure to its caller
    return {

      status: 500,
      error: `Unhandled exception occurred on the server.`

    };

  }

}

// this data service fetch all the users from the database and returns them
const findUsers = async (queryMetadata) => {

  try {

    // fetching required data from query meta data
    let { page = 1} = queryMetadata;

    const [ startRecord] = [parseInt(page) <= 1 ? 0 : parseInt((parseInt(page) - 1) * parseInt(10))];

    const dataLimit = 30;

    let pipeline = [
       {
        '$facet': {
          'totalPages': [
            {
              '$count': 'total'
            },
            {
              '$project': {
                'totalPages': {
                  '$ceil': {
                    '$divide': ['$total', 10]
                  }
                }
              }
            }
          ],
          'totalRecords': [
            {
              '$count': 'total'
            }
          ],
          'users': [
            {
              '$skip': startRecord
            },
            {
              '$limit': dataLimit
            }
          ]
        }
      },
      {
        '$project': {
          'totalPages': {
            '$arrayElemAt': ['$totalPages', 0]
          },
          'totalRecords': {
            '$arrayElemAt': ['$totalRecords', 0]
          },
          'users': 1
        }
      },
      {
        '$project': {
          'totalPages': '$totalPages.totalPages',
          'totalRecords': '$totalRecords.total',
          'users': 1
        }
      }

    ];

    // querying database for all users
    const { totalPages = 0, totalRecords = 0, users } = (await User.aggregate(pipeline).exec())[0];

    return {

      status: 200,
      data: {

        totalPages,
        currentPage: parseInt(page),
        totalRecords,
        currentPageRecords: users.length,
        users

      }

    };

  } catch (error) {
    // this code runs in case of an error @ runtime

    // loggine error messages to the console
    console.log(`ERROR @ findUsers -> user.services.js`, error);

    // returning response to indicate failure to its caller
    return {

      status: 500,
      error: `Unhandled exception occurred on the server.`

    };

  }

}

// this service is used to Login a User
const userLoginService = async (bodyData, id) => {
  try {

    const user = await User.findOne({ email: bodyData.email });

    if (!user) {
      return {
        status: 404,
        error: "User Not Found",
      };
    }

    // comparing password
    const isMatch = await bcrypt.compare(bodyData.password, user.password);

    if (isMatch) {
      let payload = {
        _id: user._id,
        email: bodyData.email,
        password: bodyData.password,
        role:user.role
      };

      const signToken = await JWT.sign(payload, "test");
      
      return {
        status: 200,
        data: signToken,
      };
    } else {
      return {
        status: 401,
        error: "Auth Failed",
      };
    }

  } catch (error) {
    console.log("Error",error)
    return {
      status: 500,
      error: "User Login Failed",
    };
  }
};

// this data service takes in the user data obj, find the user via userId and
// updates it and returns the response
const findUserByIdAndUpdate = async (updateData, userId) => {

  try {

    // creating an obj to store query config params
    const configParams = {
      new: true,
      runValidators: true
    };

    // querying database for the requested user
    const result = await User.findOneAndUpdate({ _id: userId}, {...updateData}, configParams).lean().exec();

    // checking the result of the query
    if (!result) {
      // this code runs in case query didn't return anything from database

      return {

        status: 404,
        error: `Requested data not found in database.`

      };

    }

    // returning fetched data to its caller
    return {

      status: 200,
      data: result

    };

  } catch (error) {
    // this code runs in case of an error @ runtime

    // loggine error messages to the console
    console.log(`ERROR @ findUserByIdAndUpdate -> user.services.js`, error);

    // checking if the error stems from duplicate value in database
    const isDuplicateError = error && error.code === 11000;

    // fetching fields which caused duplication error
    const duplicateErrorFields = (Object.keys(error.keyValue)).join(`, `);

    // setting value of status and description
    const [status, err] = [isDuplicateError ? 409  : 500, isDuplicateError ? `User update failed due to duplicate ${duplicateErrorFields}.` : `Unhandled exception occurred on the server.`];

    // returning response to indicate failure to its caller
    return {

      status,
      error: err

    };

  }

}

// this service is used to delete User on the basis of Userid
const findUserByIdAndDelete = async (userId) => {

  try {

    const userData = await User.findById(userId).lean();

    if (!userData) {
      return {

        status: 404,
        error: `Requested data not found in database.`

      };
    }

    const deletedUser = await User.findByIdAndDelete(userId).lean();

    // returning fetched data to its caller
    return {

      status: 200,
      data: deletedUser

    };

  } catch (error) {
    // this code runs in case of an error @ runtime

    // loggine error messages to the console
    console.log(`ERROR @ findUserByIdAndUpdate -> user.services.js`, error);

    // checking if the error stems from duplicate value in database
    const isDuplicateError = error && error.code === 11000;

    // fetching fields which caused duplication error
    const duplicateErrorFields = (Object.keys(error.keyValue)).join(`, `);

    // setting value of status and description
    const [status, err] = [isDuplicateError ? 409  : 500, isDuplicateError ? `User update failed due to duplicate ${duplicateErrorFields}.` : `Unhandled exception occurred on the server.`];

    // returning response to indicate failure to its caller
    return {

      status,
      error: err

    };

  }

}

// exporting services as modules
module.exports = {

  saveUser,
  findUserById,
  findUsers,
  userLoginService,
  findUserByIdAndUpdate,
  findUserByIdAndDelete
};