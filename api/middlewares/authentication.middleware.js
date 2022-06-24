// importing required packages and modules
const jwt = require("jsonwebtoken")
const User = require("../models/user.model")



// this middleware authenticates incoming request and
// allows/rejects access to the protected resources
const authenticateRequest = async (req, res, next) => {
  try {

    // Check token exist in the Headers
    if (!req.headers.authorization) {
      return res.status(400).json({
        message: `Authentication failed. Please use correct credentials.`,
        hasError: true
      });
    } else {

      /* FETCH FIRST PART OF THE TOKEN SENT IN HEADERS */
      const token = req.headers.authorization;

      // Verify JWT TOKEN
      const decoded = jwt.verify(token, "test");

      req.userData = decoded;

      const userFound = await User.findById(decoded._id);
      
      // If user is in the database then we move towards next middleware
      if (userFound) {
        next();
      } else {
        return res.status(404).json({
          hasError: true,
          message: `User doesnot Exist.`
        });
      }
    }
  } catch (error) {

    return res.status(401).json({
      hasError: true,
      message: `Auth Failed.`,
      error: {

        error

      }
    });
  }
};


// exporting middleware as a module
module.exports = {

  authenticateRequest

};