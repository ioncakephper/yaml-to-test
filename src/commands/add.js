const { getMergedOptions } = require("../utils/getMergedOptions");

module.exports = function (program) {
  program
    .command("add")
    .configureHelp({ sortOptions: true, showGlobalOptions: true })
    .description("Build the project")
    .option("-s --sidebars <file>", "Path to the sidebars file", "sidebars.js")
    .option("-d,--docs <path>", "Path to the docs directory", "docs")
    .option("--clear", "Clear the console")
    .action((options, command) => {
      const merged = getMergedOptions(command, options);
      console.log("Building project");
      console.log("Merged config:", merged);
    });
};
