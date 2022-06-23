// importing required packages and modules
const { logInfo, logError } = require(`../../dependencies/helpers/console.helpers`);

// importing required config params
const { HTTP_STATUS_CODES: { UNAUTHORIZED, FORBIDDEN, SERVER_ERROR } } = require(`../../dependencies/config`);


const superAdmin = async (req, res, next) => {
  try {
    const user = req.tokenData;
    console.log('Super Admin');
    if (user.role === "ADMIN") {
      next();
    } else {
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
        err: 'Sorry, you are not to authorized for this action',
      });
    }
  } catch (error) {
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      err: 'Internal server error',
    });
  }
};



// exporting as a module
module.exports = {

  superAdmin
};