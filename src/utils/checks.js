const chalk = require("chalk");

const checkArray = arr => {
  if (!Array.isArray(arr)) {
    console.log(
      chalk.red(
        "Something is wrong with config file. Structure should be YAML array!"
      )
    );
    return true;
  }
  return false;
};

module.exports = {
  checkArray
};
