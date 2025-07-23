const createProgram = require("./utils/createProgram"); //Should be managed by package.json

/**
 * Initializes and runs the CLI program with the provided arguments.
 *
 * @param {string[]} args - The command-line arguments to parse.
 */
function run(args) {
  if (!Array.isArray(args) || !args.every((arg) => typeof arg === "string")) {
    console.error(
      "Error: Invalid arguments provided.  Args must be an array of strings."
    );
    return; //Or throw a custom error
  }

  try {
    const program = createProgram();
    program.parse(args);
  } catch (error) {
    console.error("An error occurred:", error); //More sophisticated logging is recommended in production
    //Consider process.exit(1) to indicate failure
  }
}

module.exports = { run };
