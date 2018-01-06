const chalk = require("chalk");

module.exports.warn = function warn() {
  console.log(chalk.bgYellow.black("    WARN "), ...arguments);
};

module.exports.error = function error() {
  console.log(chalk.bgRed.black("   ERROR "), ...arguments);
};

module.exports.info = function info() {
  console.log(chalk.bgCyan.black("    INFO "), ...arguments);
};

module.exports.success = function success() {
  console.log(chalk.bgGreen.black(" SUCCESS "), ...arguments);
};
