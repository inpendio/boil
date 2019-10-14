const GitUrlParse = require("git-url-parse");
const Git = require("nodegit");
const path = require("path");
const chalk = require("chalk");

const waitingDot = () => {
  process.stdout.write("(.)");
};

module.exports = async (pathToRepo, key, dirname) => {
  console.log(chalk.yellow(`Fetching repo - ${key}`));
  const i = setInterval(waitingDot, 500);
  try {
    const gitInfo = GitUrlParse(pathToRepo);

    if (gitInfo) {
      console.log(chalk.green(`Downloading repo - ${gitInfo.name}`));
      await Git.Clone(gitInfo.href, path.join(dirname, "tmp", gitInfo.name));
    }
    clearInterval(i);
    return Promise.resolve({ innerName: gitInfo.name, key });
  } catch (error) {
    clearInterval(i);
    console.log(chalk.red(`Repository error - ${key}`));
    console.log(error);
    return Promise.resolve(null);
  }
};
