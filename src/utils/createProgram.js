const { Command } = require('commander');
const { loadConfig, mergeConfigWithOptions } = require('./configLoader');
const { normalizeFlags } = require('./normalizeFlags');
const { loadCommands } = require('./loadCommands');

function createProgram() {
  const program = new Command();
  program
    .name('mycli')
    .description('A CLI tool powered by commander')
    .version('1.0.0')
    .option('--verbose', 'Enable verbose output')
    .option('--debug', 'Enable debug mode')
    .option('--silent', 'Suppress output')
    .option('-c, --config <file>', 'Path to configuration file (e.g., mycli.json)');

  // Attach a hook to load and merge config before any command action
  program.hook('preAction', (thisCommand) => {
    const globals = thisCommand.opts();
    const config = loadConfig(globals.config);
    // Merge global options with config, global options take precedence
    thisCommand.config = mergeConfigWithOptions(config, globals);
  });

  // Dynamically load all commands from /src/commands (recursively)
  const path = require('path');
  loadCommands(program, path.resolve(__dirname, '../commands'));

  program.configureHelp({sortOptions: true, sortSubcommands: true});
  return program;
}

module.exports = { createProgram };
