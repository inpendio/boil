const { execSync } = require("child_process");
const chalk = require("chalk");

function execCommand(command, options = {}) {
  console.log(chalk.cyan("Executing command:", command));
  console.log("with options:", options);
  const res = execSync(command, options);
  if (!res.error) return res.toJSON();
  else {
    console.log(chalk.red("ERROR executing command:", command));
    console.log(res.error);
  }
}

execCommand.checkCommands = function(commands) {
  if (
    commands &&
    Array.isArray(commands) &&
    commands.reduce((a, v) => {
      if (typeof v !== "string") {
        a = false;
      }
      return a;
    }, true)
  )
    return true;
  return false;
};

module.exports = execCommand;
