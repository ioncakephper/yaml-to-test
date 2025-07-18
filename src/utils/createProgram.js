const { Command } = require("commander");

function loadPackage() {
  try {
    const packageData = require("../../package.json");
    return packageData;
  } catch (error) {
    console.error("Error loading package.json:", error);
    return {};
  }
}

function createProgram() {
  const program = new Command();
  const packageData = loadPackage();
  const { name, version, description } = packageData;
  program.name(name || "cli-tool");
  program.description(description || "A CLI tool for various tasks");
  program.version(version || "1.0.0");

  program.option("-v, --verbose", "Enable verbose output");
  // program.option('-c, --config <path>', 'Path to configuration file', 'default.json');
  program.option("--debug", "Enable debug mode");
  program.option("--quiet", "Suppress all output except for errors");

  program.configureHelp({
    sortOptions: true,
    showGlobalOptions: true,
  });

  return program;
}
module.exports = createProgram;
