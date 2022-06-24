
// This Middleware is used for Admin authorization
const adminAuth = async (req, res, next) => {
  try {
    const user = req.userData;
    console.log('Super Admin');
    if (user.role === "ADMIN") {
      next();
    } else {
      return res.status(401).json({
        err: 'Sorry, you are not to authorized for this action',
      });
    }
  } catch (error) {
    return res.status(500).json({
      err: 'Internal server error',
    });
  }
};



// exporting as a module
module.exports = {

  adminAuth
};