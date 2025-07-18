const createProgram = require('./utils/createProgram');

/**
 * Initializes and runs the CLI program with the provided arguments.
 *
 * @param {string[]} args - The command-line arguments to parse.
 */
function run(args) {
    
    const program = createProgram();
    program.parse(args);
}

module.exports = { run }