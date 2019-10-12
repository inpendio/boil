const rimraf = require("rimraf");
const path = require("path");

module.exports = {
  clean: dir => {
    rimraf.sync(path.join(dir, "./tmp/*"));
  }
};
