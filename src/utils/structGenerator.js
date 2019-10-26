const { checkArray } = require("./checks");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const extra = require("fs-extra");

const IS_FILE_REGEX = /^.*?\..+$/gim;
const IS_FILE_INDEX_REGEX = /^index\..+?$/gim;

const generateFile = (name, _path, content = "") => {
  const finalPath = path.join(_path, name);
  if (fs.existsSync(finalPath)) return;
  console.log(chalk.magentaBright(`Generating file - ${finalPath}`));
  fs.writeFileSync(finalPath, content);
};

const generateFolder = (name, { workingDir, autoindex }) => {
  const finalPath = path.join(workingDir, name);
  if (fs.existsSync(finalPath)) return;
  console.log(chalk.magenta(`Generating folder - ${finalPath}`));
  fs.mkdirSync(finalPath);
  // if (autoindex) generateFile("index.js", finalPath);
};

const cloneFromSource = (
  { path: _pathInSource, source, exclude, dir },
  { workingDir: to, getRepoPath }
) => {
  console.log(chalk.red("cloneFromSource ___________________________"));
  console.log(_pathInSource, source, exclude, dir);
  console.log("to:::", to);
  console.log(
    chalk.red("_____________________________________________________")
  );
  const finalPath = path.join(getRepoPath(source), _pathInSource);
  console.log(finalPath);
  if (!fs.existsSync(finalPath)) return;
  if (fs.statSync(finalPath).isDirectory()) extra.copySync(finalPath, to);
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

const parseObject = (data, opt) => {
  console.log(chalk.greenBright("parsingObject"));
  console.log(data);
  console.log(opt);
  console.log(chalk.greenBright("......"));
  if (data.source) cloneFromSource(data, opt);
  else {
    Object.keys(data).forEach(key => {
      console.log(chalk.gray("key", key, data[key]));
      console.log(chalk.gray("typeof===", typeof data[key]));
      console.log(key.match(IS_FILE_REGEX));
      if (typeof data[key] === "string") {
        generateFile(key, opt.workingDir, data[key]);
      } else if (key.match(IS_FILE_REGEX)) {
        console.log("REGEX IS MATCHED ------------------");
        generateFile(key, opt.workingDir, data[key]);
      } else if (Array.isArray(data[key])) {
        generateFolder(key, opt);
        traverseFolder(data[key], {
          ...opt,
          workingDir: path.join(opt.workingDir, key)
        });
      }
    });
  }
};

const traverseFolder = (folderArr, opt) => {
  const { workingDir } = opt;
  folderArr.forEach(leaf => {
    console.log(chalk.yellow(leaf, "*******", typeof leaf === "string"));
    // if leaf is just a name, check regex and create either folder or file based on name
    if (typeof leaf === "string") {
      !!leaf.match(IS_FILE_REGEX)
        ? generateFile(leaf, workingDir)
        : generateFolder(leaf, opt);
      // everything is object
    } else if (typeof leaf === "object") parseObject(leaf, opt);
    /* else if (leaf.source) {
      console.log("has source", leaf);
      // cloneFromSource(el, workingDir);
    } else if (leaf.content) {
      generateFile(leaf, workingDir, leaf.content);
    } else if (typeof leaf === "object") {
      console.log("is object", leaf);
      Object.keys(leaf).forEach(leafKey => {
        if (leaf[leafKey] === "folder") {
          generateFolder(leafKey, workingDir);
        } else if (Array.isArray(leaf[leafKey])) {
          generateFolder(leafKey, workingDir);
          console.log(chalk.magentaBright(workingDir, leafKey));
          traverseFolder(leaf[leafKey], {
            workingDir: path.join(workingDir, leafKey)
          });
        }
      });
    } */
  });
};

function indexFolder({ workingDir }) {
  const content = fs.readdirSync(workingDir, { withFileTypes: true });
  let needsIndex = true;
  content.forEach(dirent => {
    if (dirent.isFile()) {
      if (dirent.name.match(IS_FILE_INDEX_REGEX)) needsIndex = false;
    } else if (dirent.isDirectory()) {
      indexFolder({ workingDir: path.join(workingDir, dirent.name) });
    }
  });
  if (needsIndex) generateFile("index.js", workingDir);
}

module.exports = function(struct, opt) {
  if (checkArray(struct)) return;
  console.log(chalk.blue("Starting structuring..."));
  console.log(opt);
  console.log(struct);
  console.log(chalk.blue("............"));
  traverseFolder(struct, opt);
  if (opt.autoindex) indexFolder(opt);
};
