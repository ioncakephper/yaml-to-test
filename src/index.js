// Main entry point for the package
const { createProgram } = require('./utils/createProgram');

function run(args) {
  const program = createProgram();
  try {
    // --------------------
    // Uncomment the following when no default command created (program.command('mycommand', {isDefault: true}))
    // // If no command is provided, check for a default command
    // if (args.length <= 2) {
    //   // No default command, show help
    //   program.outputHelp();
    //   return;
    // }
    program.parse(args);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exitCode = 1;
  }
}

module.exports = { run };
