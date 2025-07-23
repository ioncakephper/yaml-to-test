const { createProgram } = require("./utils/createProgram");

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
    process.exit(1);
  }

  try {
    const program = createProgram();
    program.parse(args);
  } catch (error) {
    console.error("An unexpected error occurred:", error.message);
    process.exit(1);
  }
}

module.exports = { run };
