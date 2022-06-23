// importing required packages and modules
// const { DateTime } = require(`luxon`)
const mongoose = require(`mongoose`);
// const { logWarning, console.log } = require(`dependencies/helpers/console.helpers`);

// importing required config params
const { HTTP_STATUS_CODES: { SUCCESS, CREATED, NOT_FOUND, CONFLICT, SERVER_ERROR } } = require(`../config`);

// importing required models
const User = require(`../../api/models/user.model`);



// this data service takes in data obj and _creater, saves user in database and
// returns response to it's caller 
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

      status: CREATED,
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
    const [status, err] = [isDuplicateError ? CONFLICT : SERVER_ERROR, isDuplicateError ? `user creation failed due to duplicate ${duplicateErrorFields}.` : `Unhanlded exception occurred on the server.`];

    // returning response to indicate failure to its caller
    return {

      status,
      error: err

    };

  }

}

// this data service takes in the userId, fetch the user notes via userId and
// returns the response to it's caller
const findUserById = async (userId) => {

  try {

    // creating aggregation pipeline to query data
    let pipeline = [
      {
        '$match': {
          '_id': mongoose.Types.ObjectId(userId),
          'isDeleted': false
        }
      }, {
        '$lookup': {
          'from': 'franchises',
          'let': {
            'franchiseId': '$_franchise'
          },
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$eq': [
                    '$_id', '$$franchiseId'
                  ]
                }
              }
            }, {
              '$unwind': {
                'path': '$locations'
              }
            }, {
              '$project': {
                'name': 1,
                'location': '$locations'
              }
            }
          ],
          'as': 'franchise'
        }
      }, {
        '$lookup': {
          'from': 'franchises',
          'let': {
            'franchiseId': '$_franchise'
          },
          'pipeline': [{
            '$match': {
              '$expr': {
                '$eq': ['$_id', '$$franchiseId']
              }
            }
          }],
          'as': '_franchise'
        }
      }, {
        '$addFields': {
          '_locations': {
            '$filter': {
              'input': '$franchise',
              'as': 'loc',
              'cond': {
                '$in': [
                  '$$loc.location._id', '$_locations'
                ]
              }
            }
          }
        }
      }, {
        '$project': {
          'franchiseName': {
            '$arrayElemAt': [
              '$_locations.name', 0
            ]
          },
          'franchiseId': {
            '$arrayElemAt': [
              '$_locations._id', 0
            ]
          },
          'franchisePhone': {
            '$arrayElemAt': ['$_franchise.phone', 0]
          },
          'locationNames': {
            '$map': {
              'input': '$_locations',
              'as': 'location',
              'in': {
                'label': '$$location.location.name',
                'value': '$$location.location._id'
              }
            }
          },
          'firstName': 1,
          'middleName': 1,
          'lastName': 1,
          'img': 1,
          'designation': 1,
          'contactInfo': 1,
          'commission': 1,
          '_id': 1,
          'address': 1,
          'notes': 1,
          'password': 1,
          'gender': 1,
          'systemRoles': 1,
          'updateLogs': 1
        }
      }, {
        '$unwind': {
          'path': '$systemRoles',
          'preserveNullAndEmptyArrays': true

        }
      }, {
        '$lookup': {
          'from': 'system-roles',
          'let': {
            'systemRoles': '$systemRoles'
          },
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$eq': [
                    '$_id', '$$systemRoles'
                  ]
                }
              }
            }, {
              '$project': {
                '_id': 0,
                'value': '$_id',
                'label': '$name'
              }
            }
          ],
          'as': 'systemRoles'
        }
      }, {
        '$addFields': {
          'systemRoles': {
            '$arrayElemAt': [
              '$systemRoles', 0
            ]
          }
        }
      }, {
        '$group': {
          '_id': '$_id',
          'franchiseName': {
            '$first': '$franchiseName'
          },
          'franchiseId': {
            '$first': '$franchiseId'
          },
          'franchisePhone': {
            '$first': '$franchisePhone'
          },
          'locationNames': {
            '$first': '$locationNames'
          },
          'firstName': {
            '$first': '$firstName'
          },
          'middleName': {
            '$first': '$middleName'
          },
          'lastName': {
            '$first': '$lastName'
          },
          'img': {
            '$first': '$img'
          },
          'contactInfo': {
            '$first': '$contactInfo'
          },
          'designation': {
            '$first': '$designation'
          },
          'commission': {
            '$first': '$commission'
          },
          'address': {
            '$first': '$address'
          },
          'notes': {
            '$first': '$notes'
          },
          'gender': {
            '$first': '$gender'
          },
          'systemRoles': {
            '$push': '$systemRoles'
          },
          'password': {
            '$first': '$password'
          },
          'updateLogs': {
            '$first': '$updateLogs'
          }
        }
      }, {
        '$unwind': {
          'path': '$updateLogs',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'users',
          'let': {
            'updater': '$updateLogs._updater'
          },
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$eq': [
                    '$_id', '$$updater'
                  ]
                }
              }
            }, {
              '$project': {
                '_id': 0,
                'value': '$_id',
                'label': { '$concat': ['$lastName', ', ', '$firstName'] }
              }
            }
          ],
          'as': 'updateLogs._updater'
        }
      }, {
        '$addFields': {
          'updateLogs._updater': {
            '$arrayElemAt': [
              '$updateLogs._updater', 0
            ]
          }
        }
      }, {
        '$group': {
          '_id': '$_id',
          'franchiseName': {
            '$first': '$franchiseName'
          },
          'franchiseId': {
            '$first': '$franchiseId'
          },
          'franchisePhone': {
            '$first': '$franchisePhone'
          },
          'locationNames': {
            '$first': '$locationNames'
          },
          'firstName': {
            '$first': '$firstName'
          },
          'middleName': {
            '$first': '$middleName'
          },
          'lastName': {
            '$first': '$lastName'
          },
          'img': {
            '$first': '$img'
          },
          'contactInfo': {
            '$first': '$contactInfo'
          },
          'designation': {
            '$first': '$designation'
          },
          'commission': {
            '$first': '$commission'
          },
          'address': {
            '$first': '$address'
          },
          'notes': {
            '$first': '$notes'
          },
          'gender': {
            '$first': '$gender'
          },
          'systemRoles': {
            '$first': '$systemRoles'
          },
          'password': {
            '$first': '$password'
          },
          'updateLogs': {
            '$push': '$updateLogs'
          }
        }
      }

    ];

    // creating object to store new user 
    const result = (await User.aggregate(pipeline).exec())[0];

    // checking the result of the query
    if (!result) {
      // this code runs in case query didn't return anything from database

      // returning response to its caller with error message
      return {

        status: NOT_FOUND,
        error: `Requested data not found in database.`

      };

    }

    // returning saved response to it's caller 
    return {

      status: SUCCESS,
      data: result

    };

  } catch (error) {
    // this code runs in case of an error @ runtime

    // logging error messages to the console
    console.log(`ERROR @ findUserById -> user.services.js`, error);

    // returning response to indicate failure to its caller
    return {

      status: SERVER_ERROR,
      error: `Unhandled exception occurred on the server.`

    };

  }

}

// this data service fetch all the users from the database and returns them
const findUsers = async (queryMetadata) => {

  try {

    // fetching required data from query meta data
    let { search, sort, page = 0, offset = 0 } = queryMetadata;

    sort = JSON.parse(sort)

    // 1-> setting sorting field and direction
    // 2-> calculating query start record
    // 3-> calculating the number of records in the current drawing of data
    const [sortAndOrder, startRecord, noOfRecords] = [{ [sort ? sort.replace(`-`, ``) : `createdAt`]: sort && !sort.startsWith(`-`) ? 1 : -1 }, parseInt(page) <= 1 ? 0 : parseInt((parseInt(page) - 1) * parseInt(offset)), !offset ? 50 : parseInt(offset) <= 0 ? 1 : parseInt(offset)];

    // parsing and fetching data from incoming stringified JSON
    const { query } = JSON.parse(search);

    // creating search query according to the incoming search params
    const searchQuery = {

      $or: [
        { firstName: new RegExp(query, `i`) },
        { lastName: new RegExp(query, `i`) },
        // { [`commission.rate`]: Number(query) },
        { [`contactInfo.phone`]: new RegExp(query, `i`) },
        { [`contactInfo.email`]: new RegExp(query, `i`) },
        // { systemRoles: new RegExp(query, `i`) },
        // { lobs: new RegExp(query, `i`) },
        { [`_franchise.name`]: new RegExp(query, `i`) },
        { [`_franchise.locations`]: new RegExp(query, `i`) }
      ]

    };

    // console.log("search query ", searchQuery)

    let pipeline = [
      {
        '$match': {
          isDeleted: false
        }
      }, {
        '$lookup': {
          'from': 'franchises',
          'let': {
            'franchiseId': '$_franchise',
            'locations': '$_locations'
          },
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$eq': [
                    '$_id', '$$franchiseId'
                  ]
                }
              }
            }, {
              '$addFields': {
                'locations': {
                  '$filter': {
                    'input': '$locations',
                    'as': 'loc',
                    'cond': {
                      '$in': [
                        '$$loc._id', '$$locations'
                      ]
                    }
                  }
                }
              }
            }, {
              '$project': {
                'franchiseId': 1,
                'name': '$name',
                'locations': '$locations.name'
              }
            }
          ],
          'as': '_franchise'
        }
      }, {
        '$project': {
          '_franchise': {
            '$arrayElemAt': [
              '$_franchise', 0
            ]
          },
          'firstName': 1,
          'middleName': 1,
          'lastName': 1,
          'img': 1,
          'designation': 1,
          'contactInfo': 1,
          'commission': 1,
          '_id': 1,
          'systemRoles': 1,
          'accountStatus': 1,
          createdAt: 1
        }
      }, {
        '$unwind': {
          'path': '$systemRoles',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'system-roles',
          'let': {
            'systemRoles': '$systemRoles'
          },
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$eq': [
                    '$_id', '$$systemRoles'
                  ]
                }
              }
            }, {
              '$project': {
                '_id': 0,
                'value': '$_id',
                'label': '$name'
              }
            }
          ],
          'as': 'systemRoles'
        }
      }, {
        '$addFields': {
          'systemRoles': {
            '$arrayElemAt': [
              '$systemRoles', 0
            ]
          }
        }
      }, {
        '$group': {
          '_id': '$_id',
          '_franchise': {
            '$first': '$_franchise'
          },
          'firstName': {
            '$first': '$firstName'
          },
          'middleName': {
            '$first': '$middleName'
          },
          'lastName': {
            '$first': '$lastName'
          },
          'img': {
            '$first': '$img'
          },
          'contactInfo': {
            '$first': '$contactInfo'
          },
          'commission': {
            '$first': '$commission'
          },
          'systemRoles': {
            '$push': '$systemRoles'
          },
          'createdAt': {
            '$first': '$createdAt'
          }
        }
      }, {
        $match: {
          ...searchQuery
        }
      }, {
        '$facet': {
          'totalPages': [
            {
              '$count': 'total'
            },
            {
              '$project': {
                'totalPages': {
                  '$ceil': {
                    '$divide': ['$total', noOfRecords]
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
              '$sort': sortAndOrder
            },
            {
              '$skip': startRecord
            },
            {
              '$limit': noOfRecords
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

    // returning saved users to its caller
    return {

      status: SUCCESS,
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

      status: SERVER_ERROR,
      error: `Unhandled exception occurred on the server.`

    };

  }

}


const userLoginService = async (bodyData, id) => {
  try {
    const user = await User.findOne({ email: bodyData.email });

    if (!user) {
      return {
        status: 401,
        error: "Auth Failed",
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
      console.log(payload);
      const signToken = await JWT.sign(payload, "test");
      console.log(signToken);
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
    return {
      status: 500,
      error: "User Login Failed",
    };
  }
};

// this data service takes in the user data obj, find the user via userId and
// updates it and returns the response
const findUserByIdAndUpdate = async (updateData, userId, _updater) => {

  try {

    // creating an obj to store query config params
    const configParams = {

      new: true,
      runValidators: true

    };

    // declare two variables to store updated data and query object
    let updateQueryObj = {};
    let setQueryObj = {};

    for (const attr in updateData) {

      // check the type of value of update object fields
      if ((typeof updateData[attr] == `object`) && (!Array.isArray(updateData[attr]))) {

        // this code runs in case, type of value is Object (not an array)
        for (const subAttr in updateData[attr]) {

          if (typeof updateData[attr][subAttr] == `object`) {

            for (const innerSubAttr in updateData[attr][subAttr]) {

              // add field to setQueryObj
              setQueryObj[`${attr}.${subAttr}.${innerSubAttr}`] = updateData[attr][subAttr][innerSubAttr];

            }

          } else {

            // add field to setQueryObj
            setQueryObj[`${attr}.${subAttr}`] = updateData[attr][subAttr];

          }

        }

      } else {

        // this code runs in case, type of value is not an object (but It can
        // be an array)

        // add field to setQueryObj
        setQueryObj[`${attr}`] = updateData[attr];

      }

    }

    // add _updater field to setQueryObj
    setQueryObj[`_updater`] = _updater;

    // assign setQueryObject fields to updateQueryObj
    updateQueryObj[`$set`] = setQueryObj;

    // querying database for the requested user
    const result = await User.findOneAndUpdate({ _id: userId, isDeleted: false }, updateQueryObj, configParams).lean().exec();

    // checking the result of the query
    if (!result) {
      // this code runs in case query didn't return anything from database

      return {

        status: NOT_FOUND,
        error: `Requested data not found in database.`

      };

    }

    // returning fetched data to its caller
    return {

      status: SUCCESS,
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
    const [status, err] = [isDuplicateError ? CONFLICT : SERVER_ERROR, isDuplicateError ? `User update failed due to duplicate ${duplicateErrorFields}.` : `Unhandled exception occurred on the server.`];

    // returning response to indicate failure to its caller
    return {

      status,
      error: err

    };

  }

}

// this data service takes in note obj and userId, add note to that specific
// user via userId and returns the response 
const saveUserNote = async (note, userId, _creator) => {

  try {

    // config paramters 
    const configParams = {

      new: true,
      runValidators: true

    };

    let updateData = {}

    // getting current date and time
    // const currentDateTime = DateTime.now().toString();

    updateData[`$push`] = {

      notes: {

        note,
        _creator,
        // createdAt: currentDateTime

      },
      // updateLogs: {

      //   update: {
      //     operation: `created`,
      //     field: `notes`,
      //     value: note

      //   },
      //   _updater: _creator,
      //   updatedAt: currentDateTime

      // }

    };

    // adding note to a franchise via franchiseId
    const result = await User.findOneAndUpdate({ _id: userId, isDeleted: false }, updateData, configParams).select(`notes`).lean().exec();

    // checking the result of the query
    if (!result) {
      // this code runs in case query didn't return anything from database

      return {

        status: NOT_FOUND,
        error: `Requested data not found in database.`

      };

    }

    // returning saved response to it's caller 
    return {

      status: CREATED,
      data: result.notes

    };

  } catch (error) {

    // this code runs in case of an error @ runtime

    // logging error messages to the console
    console.log(`ERROR @ saveUserNote -> user.services.js`, error);

    // returning response to indicate failure to its caller
    return {

      status: SERVER_ERROR,
      error: `Unhandled exception occurred on the server.`

    };

  }

}

// this data service takes in the userId, fetch the user notes via userId and
// returns the response to it's caller
const findUserNotesById = async (userId) => {

  try {

    let pipeline = [
      {
        '$match': {
          '_id': mongoose.Types.ObjectId(userId)
        }
      }, {
        '$unwind': {
          'path': '$notes',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'users',
          'let': {
            'creator': '$notes._creator'
          },
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$eq': [
                    '$_id', '$$creator'
                  ]
                }
              }
            }, {
              '$project': {
                '_id': 0,
                'value': '$_id',
                'label': {
                  '$concat': [
                    '$lastName', ', ', '$firstName'
                  ]
                }
              }
            }
          ],
          'as': 'notes._creator'
        }
      }, {
        '$addFields': {
          'notes._creator': {
            '$arrayElemAt': [
              '$notes._creator', 0
            ]
          }
        }
      }, {
        '$group': {
          '_id': '$_id',
          'notes': {
            '$push': '$notes'
          }
        }
      }, {
        '$project': {
          'notes': 1,
          '_id': 0
        }
      }
    ];

    // creating object to get user;s notes  
    let result = (await User.aggregate(pipeline).exec())[0]

    if (Object.keys(result.notes[0]).length === 0)
      result = { notes: [] }

    // checking the result of the query
    if (!result) {
      // this code runs in case query didn't return anything from database

      return {

        status: NOT_FOUND,
        error: `Requested data not found in database.`

      };


    }


    // returning saved response to it's caller 
    return {

      status: SUCCESS,
      data: result.notes

    };

  } catch (error) {

    // this code runs in case of an error @ runtime

    // logging error messages to the console
    console.log(`ERROR @ findUserNotesById -> user.services.js`, error);

    // returning response to indicate failure to its caller
    return {

      status: SERVER_ERROR,
      error: `Unhandled exception occurred on the server.`

    };

  }

}

// this data service takes in the the franchiseID , nodeId and description of
// note, find the franchise and note ia franchiseId and noteId. update the note
// description and returns the response to it's caller
const findUserAndUpdateNoteById = async (note, userId, _updater, noteId) => {

  try {

    // config paramters 
    const configParams = {

      new: true,
      runValidators: true

    };

    let updateData = {};

    // getting current date and time
    // const currentDateTime = DateTime.now().toString();

    updateData[`$set`] = {

      [`notes.$.note`]: note,
      _updater

    };

    // updateData[`$push`] = {

    //   updateLogs: {

    //     update: {

    //       operation: `create`,
    //       field: `notes`,
    //       value: note

    //     },
    //     _updater: _updator,
    //     updatedAt: currentDateTime

    //   }

    // };

    // updating note of a user
    const result = await User.findOneAndUpdate({ _id: userId, [`notes._id`]: noteId, isDeleted: false }, updateData, configParams).select(`notes`).lean().exec();

    // checking the result of the query
    if (!result) {
      // this code runs in case query didn't return anything from database

      return {

        status: NOT_FOUND,
        error: `Requested data not found in database.`

      };

    }

    // returning updated response to it's caller 
    return {

      status: SUCCESS,
      data: result.notes

    };

  } catch (error) {

    // this code runs in case of an error @ runtime

    // logging error messages to the console
    console.log(`ERROR @ findUserAndUpdateNoteById -> user.services.js`, error);

    // returning response to indicate failure to its caller
    return {

      status: SERVER_ERROR,
      error: `Unhandled exception occurred on the server.`

    };

  }

}

// this data service takes the userId and noteId, find the note of the user via
// userId and noteId and delete it and returns the response ti it's caller
const findUserAndDeleteNoteById = async (userId, _updater, noteId) => {

  try {

    // config paramters 
    const configParams = {

      new: true,
      runValidators: true

    };

    let updateData = {};

    // getting current date and time
    // const currentDateTime = DateTime.now().toString();

    updateData[`$pull`] = {

      notes: { _id: noteId },
      _updater

    };

    // updateData[`$push`] = {

    //   updateLogs: {

    //     update: {

    //       operation: `Delete`,
    //       field: `notes`,
    //       value: noteId

    //     },
    //     _updater: _updator,
    //     updatedAt: currentDateTime

    //   }

    // };

    // deleting note of a user via userId and noteId
    const result = await User.findOneAndUpdate({ _id: userId, [`notes._id`]: noteId, isDeleted: false }, updateData, configParams).select(`notes`).lean().exec();

    // checking the result of the query
    if (!result) {
      // this code runs in case query didn't return anything from database

      return {

        status: NOT_FOUND,
        error: `Requested data not found in database.`

      };

    }

    // returning updated response to it's caller 
    return {

      status: SUCCESS,
      data: result

    };

  } catch (error) {

    // this code runs in case of an error @ runtime

    // logging error messages to the console
    console.log(`ERROR @ findUserAndDeleteNoteById -> user.services.js`, error);

    // returning response to indicate failure to its caller
    return {

      status: SERVER_ERROR,
      error: `Unhandled exception occurred on the server.`

    };

  }

}

// this data service fetches frnashise's agents as a list from the database and
// return it to its caller
const getAgentNames = async (query) => {

  try {

    let { search, offset, page } = query;

    let filters = {

      isDeleted: false

    };

    if (search && search !== `null`) {

      filters[`name`] = new RegExp(search.trim(), `i`);

    }

    const [startRecord, noOfRecords] = [parseInt(page) <= 1 ? 0 : parseInt((parseInt(page) - 1) * parseInt(offset)), parseInt(offset) <= 0 ? 1 : parseInt(offset)];

    // crteating projection object 
    let pipeline = [

      {

        '$match': filters

      }, {

        $facet: {
          totalPages: [
            {
              $count: `total`
            },
            {
              $project: {
                totalPages: {
                  $ceil: {
                    $divide: [`$total`, noOfRecords]
                  }
                }
              }
            }
          ],
          agents: [

            {

              '$skip': startRecord

            }, {

              '$limit': noOfRecords

            }, {

              '$project': {

                'value': '$_id',
                'label': { '$concat': ['$lastName', ' ', '$firstName'] },
                '_id': 0

              }

            }
          ]
        }
      }, {
        $project: {
          totalPages: {
            $arrayElemAt: [`$totalPages`, 0]
          },
          agents: 1
        }
      }, {
        $project: {
          totalPages: `$totalPages.totalPages`,
          agents: 1
        }
      }

    ];

    // querying database for all users
    let { totalPages, agents } = (await User.aggregate(pipeline).exec())[0];

    if (!totalPages) {

      totalPages = 0

    }

    // returning saved franchises to its caller
    return {

      status: SUCCESS,
      data: { totalPages, agents }

    };

  } catch (error) {
    // this code runs in case of an error @ runtime

    // loggine error messages to the console
    console.log(`ERROR @ getAgentNames -> user.services.js`, error);

    // returning response to indicate failure to its caller
    return {

      status: SERVER_ERROR,
      error: `Unhandled exception occurred on the server.`

    };

  }

}

// this data service takes in the email and query scope, fetches the matching
// user and returns it
const findUserByEmail = async (email, queryScope) => {

  try {

    // querying database for the requested resource
    const result = await User.findOne({ [`contactInfo.email`]: email }).select(queryScope).lean().exec();

    // checking the result of the query
    if (!result) {
      // this code runs in case query didn't return anything from database

      return {

        status: NOT_FOUND,
        error: `Requested data not found in database.`

      };

    }

    // returning saved response to it's caller 
    return {

      status: SUCCESS,
      data: result

    };

  } catch (error) {
    // this code runs in case of an error @ runtime

    // logging error messages to the console
    console.log(`ERROR @ findUserByEmail -> user.services.js`, error);

    // returning response to indicate failure to its caller
    return {

      status,
      error: `Unhandled exception occurred on the server.`

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
  saveUserNote,
  findUserAndUpdateNoteById,
  findUserAndDeleteNoteById,
  findUserNotesById,
  getAgentNames,
  findUserByEmail

};