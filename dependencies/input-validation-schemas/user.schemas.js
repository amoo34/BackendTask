// importing required packages and modules
const Joi = require(`joi`);

// importing required custom data validators
const { objectIdValidation } = require(`../helpers/joi.helpers`);



// defining valdiation schema to add a user
const newUserSchema = Joi.object({

  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  address: Joi.string().required(),
  phoneNo: Joi.string().required(),
  role: Joi.string().required()

});

// defining valdiation schema to add a user
const loginUserSchema = Joi.object({

  email: Joi.string().required(),
  password: Joi.string().required()

});

// defining valdiation schema for specific User
const specificUserSchema = Joi.object({

  userId: Joi.string().custom(objectIdValidation, `User ID Validation`).required(),

});

// defining valdiation schema to update a user
const updateUserSchema = Joi.object({

  _id: Joi.string().custom(objectIdValidation, `User ID Validation`).required(),
  name: Joi.string(),
  email: Joi.string(),
  password: Joi.string(),
  address: Joi.string(),
  phoneNo: Joi.string(),
  role: Joi.string(),
  createdAt:Joi.string(),
  updatedAt:Joi.string(),

});

// defining valdiation schema for paginated, searched, sorted users
const allUsersSchema = Joi.object({

  // search: Joi.string().custom(jsonObjValidation, `Search validation`),
  // sort: Joi.string(),
  // offset: Joi.number().min(1),
  page: Joi.number().min(1)

});



// exporting schemas as modules
module.exports = {

  newUserSchema,
  loginUserSchema,
  specificUserSchema,
  updateUserSchema,
  allUsersSchema

};