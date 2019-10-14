function getOperationCommand(packageManager) {
  switch (packageManager) {
    case "npm":
      return "install";
    case "yarn":
      return "add";
  }
}

module.exports = {
  dependencies: (packageManager, list) => {
    return `${packageManager} ${getOperationCommand(
      packageManager
    )} ${list.join(" ")}`;
  },
  devDependencies: (packageManager, list) => {
    return `${packageManager} ${getOperationCommand(
      packageManager
    )} ${list.join(" ")} -D`;
  },
  peerDependencies: (packageManager, list) => {
    return `${packageManager} ${getOperationCommand(
      packageManager
    )} ${list.join(" ")} -P`;
  },
  optionalDependencies: (packageManager, list) => {
    return `${packageManager} ${getOperationCommand(
      packageManager
    )} ${list.join(" ")} -O`;
  }
};
