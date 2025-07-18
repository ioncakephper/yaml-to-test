const createProgram = require('./utils/createProgram');

function run(args) {
    
    const program = createProgram();
    program.parse(args);
}

module.exports = { run }