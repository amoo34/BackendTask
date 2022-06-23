// importing required modules
const bcrypt = require(`bcryptjs`);

// importing required log modules
const { logInfo, logSuccess, logWarning, logError } = require(`./console.helpers`);



// this helper hashes password string and returns it
const hashPassword = (v) => {

  try {

    // generating and returning hashed password
    return v ? bcrypt.hashSync(v) : null;

  } catch (error) {
    // this code runs in case of an ERROR @ runtime

    // logging error messages to the console
    logError(`ERROR @ hashPassword -> mongoose.helpers.js`, error);

  }

}



// exporting helpers as modules
module.exports = {

  hashPassword

};