// Main entry point for the package
const { createProgram } = require('./utils/createProgram');

function run(args) {
  const program = createProgram();
  program.parse(args);
}

module.exports = { run };
