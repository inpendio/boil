const getConfig = require("./yaml");

module.exports = {
  getConfig,
  waitingDot: () => {
    process.stdout.write("(.)");
  },
  ...require("./checks"),
  ...require("./cleaners")
};
