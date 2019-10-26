const path = require("path");
const chalk = require("chalk");
const { clean } = require("./utils/cleaners");
const execCommand = require("./utils/execCommands");
const getGitRepo = require("./utils/getGitRepo");
const getInstallString = require("./utils/getInstallString");
const { DEPENDECY_MAP } = require("./constants");
const packageJson = require("./utils/packageJson");
const structGenerator = require("./utils/structGenerator");

class App {
  constructor() {
    this.repos = [];
    this.autoindex = false; // should newly created folders be indexed with index.js file
    this.conf = null;
    this.__dirname = null; // working directory of this package
    this.__caller = null; // calling directory
    this.__workingDir = null; // final directory we should use
    this.packageManager = "npm"; // package manager to use for installing dependencies
    this.before = null; // script to be executed before anything else
    this.reposConf = {};
    this._deps = []; // dependency install strings
    this.struct = null; // folder and file structure for new repo

    this.getRepoPath = this.getRepoPath.bind(this);
  }

  setConf(conf) {
    // other configurations
    if (conf.autoindex) this.autoindex = true;
    if (conf.use) this.packageManager = conf.use;

    // set paths, __workingDir should be our final path where we do all the work
    // this.__caller = process.env.INIT_CWD;
    if (conf.workingDir) {
      this.__workingDir = path.join(this.__caller, conf.workingDir);
    } else this.__workingDir = this.__caller;

    // clean tmp folder used for storing git repos
    clean(this.__dirname);

    // before scripts
    if (conf.before && execCommand.checkCommands(conf.before)) {
      this.before = conf.before;
    }

    // repos check
    if (conf.repositories && typeof conf.repositories === "object") {
      this.reposConf = conf.repositories;
    }

    // dependencies
    DEPENDECY_MAP.forEach(type => {
      if (conf[type])
        this._deps.push(
          getInstallString[type](this.packageManager, conf[type])
        );
    });

    // structure
    if (conf.struct || conf.structure)
      this.struct = conf.struct || conf.structure;

    // save config file
    this.conf = conf;
  }

  setDir(dir) {
    this.__dirname = dir;
  }
  setCallerDir(dir) {
    this.__caller = dir;
  }
  // setWorkingDir(dirName) {
  //   if (!this.__caller)
  //     console.log(
  //       chalk.red("Working dir should be setup after caller dir is.")
  //     );
  //   this.__workingDir = path.join(this.__caller, dirName);
  // }
  // getCallerDir() {
  //   return this.__caller;
  // }
  addRepo(repo) {
    this.repos.push(repo);
  }
  getRepoPath(name) {
    let innerName = "";
    this.repos.forEach(r => {
      if (name === r.key) innerName = r.innerName;
    });
    return path.join(this.__dirname, "/tmp/", innerName);
  }
  // setAutoindex(is) {
  //   this.autoindex = is;
  // }
  isAutoindex() {
    return this.autoindex;
  }

  clean() {}

  doBefore() {
    // if exist, exec comands before anything else
    if (this.before) {
      this.before.forEach(command => execCommand(command));
    }
  }

  // get and map repos
  async doMapAndRepos() {
    const keys = Object.keys(this.reposConf);
    for (let i = 0; i < keys.length; i++) {
      const clonedRepo = await getGitRepo(
        this.reposConf[keys[i]],
        keys[i],
        this.__dirname
      );
      if (clonedRepo) this.addRepo(clonedRepo);
    }
  }

  // create folder structure
  doStruct() {
    if (this.struct) {
      structGenerator(this.struct, {
        autoindex: this.autoindex,
        workingDir: this.__workingDir,
        getRepoPath: this.getRepoPath,
        appPath: this.__dirname
      });
    }
  }

  // install dependencies
  async doInstall() {
    if (!packageJson.checkPackageJson()) {
      // if package json, doesnt exist in current working dir, generate one empty one
      packageJson.generatePackage(this.__workingDir);
    }
    for (let i = 0; i < this._deps.length; i++) {
      await execCommand(this._deps[i], { cwd: `${this.__workingDir}/` });
    }
  }

  async start() {
    console.log(this);
    // console.log(this.conf.struct[0].src[0].components[0].Button);
    this.doBefore();
    await this.doMapAndRepos();
    this.doStruct();
    // this.doInstall();
  }
}

module.exports = new App();
