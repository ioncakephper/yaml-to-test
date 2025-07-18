const { Command } = require("commander");
const fs = require("fs");
const path = require("path");

/**
 * @typedef {Object} PackageData
 * @property {string} [name] - The name of the package.
 * @property {string} [version] - The version of the package.
 * @property {string} [description] - The description of the package.
 */

/**
 * This function attempts to read the package.json file and returns its contents.
 * Loads package.json data to provide metadata for the CLI program.
 * @returns {PackageData} - Object with package.json data
 * @throws {Error} - Throws an error if package.json cannot be loaded.
 */
function loadPackage() {
  const packagePath = path.resolve(__dirname, "../../package.json");
  const data = fs.readFileSync(packagePath, "utf8");
  return JSON.parse(data);
}

/**
 * Creates and configures a CLI program using the internal Command module.
 * Loads package metadata for name, version, and description.
 * Adds common options such as verbose, debug, and quiet modes.
 * Configures help output to sort and display global options.
 *
 * @returns {Command} Configured CLI program instance.
 */
function createProgram() {
  const program = new Command();
  const packageData = loadPackage();
  const { name, version, description } = packageData;
  program.name(typeof name === "string" && name.trim() ? name : "cli-tool");
  program.description(typeof description === "string" && description.trim() ? description : "A CLI tool for various tasks");
  program.version(typeof version === "string" && version.trim() ? version : "1.0.0");

  program.option("-v, --verbose", "Enable verbose output");
  program.option("--debug", "Enable debug mode");
  program.option("--quiet", "Suppress all output except for errors");

  program.configureHelp({
    sortOptions: true,
    showGlobalOptions: true,
  });

  return program;
}
module.exports = createProgram;