const yaml = require("js-yaml");
const fs = require("fs");

const getConfig = pahToFile => {
  const doc = yaml.safeLoad(fs.readFileSync(pahToFile, "utf8"));
  console.log(doc);
  return doc;
};

module.exports = getConfig;
