const fs = require('fs');
const path = require('path');

function loadCommands(program, commandsDir) {
  function load(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        load(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        const commandModule = require(fullPath);
        if (typeof commandModule === 'function') {
          commandModule(program);
        } else if (commandModule && typeof commandModule.default === 'function') {
          commandModule.default(program);
        }
      }
    });
  }
  load(commandsDir);
}

module.exports = { loadCommands };
