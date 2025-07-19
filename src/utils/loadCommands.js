// create a function updates the program argument using the function defined in each JavaScript file in the commands directory file in the second argument and all its descendats recursively
const fs = require('fs');
const path = require('path');
const { program } = require('commander');

/**
 * Recursively loads command modules from a specified directory and registers them with the provided program.
 * @param {Object} program - The commander program instance to register commands with.
 * @param {string} commandsDir - The directory containing command modules.
 */
function loadCommands(program, commandsDir) {
  const files = fs.readdirSync(commandsDir);

  files.forEach((file) => {
    const filePath = path.join(commandsDir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively load commands from subdirectories
      loadCommands(program, filePath);
    } else if (file.endsWith(".js")) {
      // Import the command module and execute its function
      const commandModule = require(filePath);
      if (typeof commandModule === "function") {
        commandModule(program);
      } else {
        console.warn(`Skipping ${filePath}: not a valid command module.`);
      }
    }
  });
}

module.exports = { loadCommands };