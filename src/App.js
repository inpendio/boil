const path = require("path");
const chalk = require("chalk");

class App {
  constructor() {
    this.repos = [];
    this.autoindex = false;
  }

  setDir(dir) {
    this.__dirname = dir;
  }
  setCallerDir(dir) {
    this.__caller = dir;
  }
  getCallerDir() {
    return this.__caller;
  }
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
  setAutoindex(is) {
    this.autoindex = is;
  }
  isAutoindex() {
    return this.autoindex;
  }

  clean() {}
}

module.exports = new App();
