const yaml = require("js-yaml");
const fs = require("fs");

const getConfig = (pahToFile, debug) => {
  const doc = yaml.safeLoad(fs.readFileSync(pahToFile, "utf8"));
  if(debug)console.log(doc);
  return doc;
};

module.exports = getConfig;
