const fs = require("fs");
const chalk = require("chalk");
const GitUrlParse = require("git-url-parse");
const Git = require("nodegit");
const path = require("path");
const extra = require("fs-extra");
const { exec, execSync } = require("child_process");

const { getConfig, checkArray, waitingDot, clean, App } = require("./src");

const getSource = name => {
  let innerName = "";
  app.repos.forEach(r => {
    if (name === r.key) innerName = r.innerName;
  });
  return path.join(__dirname, "/tmp/", innerName);
};

const getGitRepo = async (pathToRepo, key) => {
  const gitInfo = GitUrlParse(pathToRepo);
  console.log(chalk.green(`Getting repo - ${gitInfo.name}`));
  const i = setInterval(waitingDot, 500);
  await Git.Clone(gitInfo.href, path.join(__dirname, "tmp", gitInfo.name));
  clearInterval(i);
  //app.repos.push({ innerName: gitInfo.name, key });
  App.addRepo({ innerName: gitInfo.name, key });
  return Promise.resolve({ innerName: gitInfo.name, key });
};

const generateFile = (name, _path) => {
  const finalPath = path.join(_path, name);
  if (fs.existsSync(finalPath)) return;
  console.log(chalk.magentaBright(`Generating file - ${finalPath}`));
  fs.writeFileSync(finalPath, "");
};
const generateFolder = (name, _path) => {
  const finalPath = path.join(_path, name);
  if (fs.existsSync(finalPath)) return;
  console.log(chalk.magenta(`Generating folder - ${finalPath}`));
  fs.mkdirSync(finalPath);
  if (App.isAutoindex()) generateFile("index.js", finalPath);
};

const cloneFromSource = ({ path: _pathInSource, source, exclude, dir }, to) => {
  const finalPath = path.join(App.getRepoPath(source), _pathInSource);
  if (!fs.existsSync(finalPath)) return;
  if (dir) extra.copySync(finalPath, path.join(to, _pathInSource));
  else if (fs.statSync(finalPath).isDirectory()) {
    const ls = fs.readdirSync(finalPath);
    ls.forEach(el => {
      if (exclude.indexOf(el) === -1 && !fs.existsSync(path.join(to, el)))
        extra.copySync(path.join(finalPath, el), path.join(to, el));
    });
  } else {
    extra.copySync(finalPath, path.join(to, _pathInSource));
  }
};

const traverseFolder = (folderArr, _path) => {
  folderArr.forEach(el => {
    console.log(el);
    if (typeof el === "string") generateFile(el, _path);
    else if (el.source) {
      console.log(el);
      cloneFromSource(el, _path);
    } else if (typeof el === "object") {
      Object.keys(el).forEach(k => {
        if (el[k] === "folder") {
          generateFolder(k, _path);
        } else if (Array.isArray(el[k])) {
          generateFolder(k, _path);
          traverseFolder(el[k], path.join(_path, k));
        }
      });
    }
  });
};

const structurize = struct => {
  if (checkArray(struct)) return;
  const callerPath = process.env.INIT_CWD;
  traverseFolder(struct, callerPath);
};

const mapRepositories = async repos => {
  if (typeof repos !== "object") return;
  const keys = Object.keys(repos);
  for (let i = 0; i < keys.length; i++) {
    await getGitRepo(repos[keys[i]], keys[i]);
  }
};

const getInstallComand = (arr, postfix) => {
  const out = arr.join(" ");
  return `yarn add ${out}${postfix ? ` ${postfix}` : ""}`;
};

const execComands = command => {
  console.log(command);
  const c = execSync(
    command /* (err, stdout, stderr) => {
    if (err) {
      console.log(chalk.red("ERROR executing command"));
      console.log(err);
      return;
    }

    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  } */
  );
  console.log(c.toJSON());
};

const start = async () => {
  App.setDir(__dirname);
  // clean(__dirname);
  const [, , ...args] = process.argv;
  const callerPath = process.env.INIT_CWD;
  App.setCallerDir(callerPath);
  const file = args[0];
  const conf = getConfig(path.join(callerPath, file));
  if (conf) {
    App.setConf(conf);
    App.start();
  }
  // if (conf.autoindex) App.setAutoindex(true);
  // if (conf.workingDir) App.setWorkingDir(conf.workingDir);
  // console.log(App, conf.before);
  // conf.before.forEach(c => execComands(c));
  // console.log(process.env);
  // await mapRepositories(conf.repositories);
  // structurize(conf.struct);
  // execComands(getInstallComand(conf.dependencies));
};

module.exports = start;
