/**
 * @file src/utils/commandLoader.js
 * @description Utility to dynamically load Commander.js commands from a specified directory.
 * Recursively scans subdirectories for JavaScript files and registers them as commands.
 * @author Your Name/AI Assistant
 * @license MIT
 */

const fs = require("fs");
const path = require("path");
const { log, LOG_LEVELS } = require("./logger");

/**
 * Dynamically loads Commander.js commands from a given directory and its subdirectories.
 * Each JavaScript file found is expected to export a function that registers a command
 * with the provided Commander.js program instance.
 *
 * @param {Command} program - The Commander.js program instance to which commands will be added.
 * @param {string} commandsDirPath - The absolute path to the directory containing command files.
 * @param {string} [currentSubdir=''] - Internal parameter for recursive calls, tracks current subdirectory path.
 */
function loadCommands(program, commandsDirPath, currentSubdir = "") {
  const fullPath = path.join(commandsDirPath, currentSubdir);

  if (!fs.existsSync(fullPath)) {
    log(`Warning: Commands directory not found: ${fullPath}`, LOG_LEVELS.WARN);
    return;
  }

  const files = fs.readdirSync(fullPath);

  for (const file of files) {
    const filePath = path.join(fullPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively load commands from subdirectories
      loadCommands(program, commandsDirPath, path.join(currentSubdir, file));
    } else if (stat.isFile() && file.endsWith(".js")) {
      // Load the command module
      try {
        const commandModule = require(filePath);
        if (typeof commandModule === "function") {
          // Execute the module's exported function to register the command
          commandModule(program);
          log(
            `Loaded command: ${path.join(currentSubdir, file)}`,
            LOG_LEVELS.DEBUG
          );
        } else {
          log(
            `Warning: Command file '${filePath}' does not export a function. Skipping.`,
            LOG_LEVELS.WARN
          );
        }
      } catch (error) {
        log(
          `❌ Error loading command file '${filePath}': ${error.message}`,
          LOG_LEVELS.ERROR
        );
      }
    }
  }
}

module.exports = {
  loadCommands,
};
