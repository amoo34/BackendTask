// importing required packages and modules
const mongoose = require(`mongoose`);
const {
  // cleanPhoneNo,
  hashPassword,
} = require(`../../dependencies/helpers/mongoose.helpers`);



// defining user schema
const userSchema = new mongoose.Schema({

  name: {
    type: String,
    uppercase: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    index: true
  },
  address: {
    type: String,
    trim: true,
    uppercase: true
  },
  phoneNo: {
    type: String,
    sparse: true
  },
  role: {
    type: String,
    uppercase: true,
    trim: true
  },
  password: {
    type: String,
    set: hashPassword
  }

}, {

  _id: true,
  timestamps: true

});



// exporting model as module
module.exports = mongoose.model(`User`, userSchema);
