#!/usr/bin/env node

/**
 * @file src/cli.js
 * @description Main entry point for the TestWeaver CLI.
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
      `⚠️ warning: could not read or parse package.json: ${error.message}`,
      LOG_LEVELS.WARN
    );
  }

  // Determine the description text, remove trailing punctuation, and ensure first word is lowercase
  let descriptionText =
    pkg.description ||
    "a cli tool that weaves jest-compatible .test.js files from simple yaml definitions";
  descriptionText = descriptionText.replace(/(\.+\s*)$/, ""); // Remove trailing punctuation first

  // Ensure the first word is lowercase and handle multiple spaces
  const words = descriptionText.split(/\s+/).filter(Boolean); // Split on one or more spaces, filter out empty strings
  if (words.length > 0) {
    words[0] = words[0].toLowerCase();
  }
  descriptionText = words.join(" "); // Reconstruct with single spaces

  // Set program details from package.json or use fallbacks
  program
    .name(pkg.name || "testweaver")
    .description(descriptionText) // Refactored to ensure lowercase first word and no trailing punctuation
    .version(pkg.version || "1.0.0");
  // --- End package.json loading ---

  // Define GLOBAL options (now only logging-related)
  program
    .option(
      "-v, --verbose",
      "enable verbose output for more detailed information"
    )
    .option(
      "-d, --debug",
      "enable debug output for highly detailed debugging information (most verbose)"
    )
    .option(
      "-s, --silent",
      "suppress all output except critical errors (least verbose)"
    );

  // Dynamically load commands from the src/commands directory
  const commandsDirPath = path.join(__dirname, "commands");
  loadCommands(program, commandsDirPath);

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
