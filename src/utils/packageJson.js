const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

module.exports = {
  checkPackageJson: workingDir => {
    try {
      if (fs.existsSync(path.join(workingDir, "package.json"))) return true;
    } catch (error) {
      return false;
    }
  },
  generatePackage: (workingDir, pckg = {}) => {
    try {
      fs.writeFileSync(
        path.join(workingDir, "package.json"),
        JSON.stringify(pckg, null, 4)
      );
    } catch (error) {
      console.log(chalk.magenta(`Error generating package.json file`));
    }
  }
};
