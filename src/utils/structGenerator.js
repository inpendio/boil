const { checkArray } = require("./checks");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");

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

const traverseFolder = (folderArr, workingDir, _dirname) => {
  folderArr.forEach(el => {
    console.log(el);
    if (typeof el === "string") generateFile(el, workingDir);
    else if (el.source) {
      console.log(el);
      cloneFromSource(el, workingDir);
    } else if (typeof el === "object") {
      Object.keys(el).forEach(k => {
        if (el[k] === "folder") {
          generateFolder(k, workingDir);
        } else if (Array.isArray(el[k])) {
          generateFolder(k, workingDir);
          traverseFolder(el[k], path.join(workingDir, k));
        }
      });
    }
  });
};

module.exports = function(struct, opt) {
  if (checkArray(struct)) return;
  traverseFolder(struct, opt);
};
