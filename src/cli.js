#!/usr/bin/env node

/**
 * @file src/cli.js
 * @description Main entry point for the YAML to Test CLI.
 * Orchestrates configuration loading, logging, and dynamic command loading.
 * Global options are now limited to logging verbosity.
 * @author Your Name/AI Assistant
 * @license MIT
 */

// Import Node.js built-in modules
const fs = require("fs");
const path = require("path");

// Import third-party libraries
const { Command } = require("commander");

// Import modularized components
const { LOG_LEVELS, setLogLevel, log } = require("./utils/logger");
const { loadCommands } = require("./utils/commandLoader");

/**
 * Main function to set up and run the CLI.
 * This function initializes the Commander.js program, loads package metadata,
 * defines global logging options, dynamically loads all commands from the 'src/commands' directory,
 * and handles the default behavior if no specific command is provided.
 */
function main() {
  const program = new Command();

  // --- Load package.json details for program name, description, and version ---
  let pkg = {};
  try {
    // package.json is in the project root, so we need to go up one level from src/cli.js
    const pkgPath = path.join(__dirname, "../package.json");
    if (fs.existsSync(pkgPath)) {
      pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    }
  } catch (error) {
    // Log a warning if package.json can't be read, but don't exit.
    // Fallback values will be used.
    log(
      `⚠️ Warning: Could not read or parse package.json: ${error.message}`,
      LOG_LEVELS.WARN
    );
  }

  // Set program details from package.json or use fallbacks
  program
    .name(pkg.name || "yaml-to-test")
    .description(
      pkg.description ||
        "CLI tool to generate Jest-compatible .test.js files from YAML test definitions."
    )
    .version(pkg.version || "1.0.0");
  // --- End package.json loading ---

  // Explicitly add the help command, as the top-level .action() might suppress its automatic inclusion.
  //   program.addHelpCommand("help [command]", "display help for command");

  // Define GLOBAL options (now only logging-related)
  program
    .option(
      "-v, --verbose",
      "Enable verbose output for more detailed information."
    )
    .option(
      "-d, --debug",
      "Enable debug output for highly detailed debugging information (most verbose)."
    )
    .option(
      "-s, --silent",
      "Suppress all output except critical errors (least verbose)."
    );

  // Dynamically load commands from the src/commands directory
  const commandsDirPath = path.join(__dirname, "commands");
  loadCommands(program, commandsDirPath);

  // Set a default action if no command is specified.
  // This will display help if `yaml-to-test` is run without arguments or a command.
  //   program.action(() => {
  //     // If no explicit command was matched by Commander, and no arguments were given,
  //     // or if an unknown command was given, display help.
  //     if (
  //       program.args.length === 0 ||
  //       !program.commands.some((cmd) => cmd.name() === program.args[0])
  //     ) {
  //       program.help();
  //     }
  //   });

  // Configure help output to sort options alphabetically
  program.configureHelp({
    sortOptions: true,
    sortSubcommands: true, // Ensure subcommands are also sorted
  });

  // Parse arguments. This will trigger the action of the matched command.
  program.parse(process.argv);
}

// Execute the main function when the script is run
main();
