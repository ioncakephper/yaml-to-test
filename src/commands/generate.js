/**
 * @file src/commands/generate.js
 * @description Defines the 'generate' command for the CLI, handling file processing,
 * watching, and related options.
 * @author Your Name/AI Assistant
 * @license MIT
 */

const glob = require("glob");
const path = require("path"); // Needed for __dirname in loadConfig call

const { LOG_LEVELS, setLogLevel, log } = require("../utils/logger");
const { loadConfig } = require("../config/configLoader");
const { processFile } = require("../core/fileProcessor");
const { startWatcher } = require("../core/watcher");

/**
 * Logs the effective configuration and any command-line overrides.
 * @param {object} cliConfig - The final configuration object.
 * @param {string} configSource - The source of the loaded configuration.
 * @param {string[]} cliPatterns - Patterns from the CLI.
 * @param {object} options - Options from the CLI.
 */
function logConfigurationDetails(cliConfig, configSource, cliPatterns, options) {
  log(`🚀 Starting YAML to Test CLI (generate command)...`, LOG_LEVELS.INFO);
  log(`⚙️ Effective configuration sourced from: ${configSource}`, LOG_LEVELS.INFO);

  if (cliPatterns.length > 0) {
    log(`Override: Using patterns from command line arguments.`, LOG_LEVELS.INFO);
  }
  if (options.ignore && options.ignore.length > 0) {
    log(`Override: Using ignore patterns from command line arguments.`, LOG_LEVELS.INFO);
  }
  if (options.dryRun) {
    log(`Override: Dry Run mode enabled from command line.`, LOG_LEVELS.INFO);
  } else if (cliConfig.isDryRun) {
    log(`Dry Run mode enabled from configuration.`, LOG_LEVELS.INFO);
  }
  if (options.testKeyword) {
    log(`Override: Using '${cliConfig.testKeyword}.todo' for test blocks from command line.`, LOG_LEVELS.INFO);
  } else if (cliConfig.testKeyword !== "it") {
    log(`Using '${cliConfig.testKeyword}.todo' for test blocks from configuration.`, LOG_LEVELS.INFO);
  }
  if (options.noCleanup) {
    log(`Override: Cleanup disabled from command line.`, LOG_LEVELS.INFO);
  } else if (cliConfig.noCleanup) {
    log(`Cleanup disabled from configuration.`, LOG_LEVELS.INFO);
  }
}

/**
 * Starts the watcher to monitor file changes.
 * @param {object} cliConfig - The final configuration object.
 */
function runWatchMode(cliConfig) {
  if (cliConfig.isDryRun) {
    log(`Warning: --dry-run is enabled. No files will be written even in watch mode.`, LOG_LEVELS.WARN);
  }
  log(`\n👀 Entering watch mode for patterns: ${cliConfig.effectivePatterns.join(", ")}`, LOG_LEVELS.INFO);
  log(`Excluding: ${cliConfig.effectiveIgnorePatterns.join(", ")}`, LOG_LEVELS.INFO);
  log(`(Press Ctrl+C to exit)`, LOG_LEVELS.INFO);
  startWatcher(cliConfig, processFile);
}

/**
 * Performs a single pass of file processing based on the configuration.
 * @param {object} cliConfig - The final configuration object.
 */
function runSinglePass(cliConfig) {
  log(`🔍 Using effective patterns: ${cliConfig.effectivePatterns.join(", ")}`, LOG_LEVELS.INFO);
  log(`Excluding: ${cliConfig.effectiveIgnorePatterns.join(", ")}`, LOG_LEVELS.INFO);

  let filesFound = 0;
  let filesProcessed = 0;

  for (const pattern of cliConfig.effectivePatterns) {
    try {
      const matchingFiles = glob.sync(pattern, {
        absolute: true,
        nodir: true,
        ignore: cliConfig.effectiveIgnorePatterns,
      });

      if (matchingFiles.length === 0) {
        log(`⚠️ No YAML files found for pattern: '${pattern}'`, LOG_LEVELS.WARN);
      } else {
        log(`Found ${matchingFiles.length} files for pattern '${pattern}'.`, LOG_LEVELS.INFO);
        filesFound += matchingFiles.length;
        matchingFiles.forEach((file) => processFile(file, cliConfig));
        filesProcessed += matchingFiles.length;
      }
    } catch (err) {
      log(`❌ Error finding files for pattern '${pattern}': ${err.message}`, LOG_LEVELS.ERROR);
    }
  }

  if (filesFound > 0) {
    log(`\n✨ CLI execution complete. Processed ${filesProcessed} of ${filesFound} YAML files.`, LOG_LEVELS.INFO);
  } else {
    log(`\n🤷 No YAML files were found or processed based on the provided patterns.`, LOG_LEVELS.INFO);
  }
}

/**
 * Registers the 'generate' command with the Commander.js program.
 * This command handles the core functionality of finding YAML files and generating
 * Jest test files, supporting watch mode, dry runs, and various configuration options.
 *
 * @param {Command} program - The Commander.js program instance.
 */
module.exports = (program) => {
  program
    .command("generate", { isDefault: true })
    .alias("g")
    .description("Generates Jest test files from YAML definitions.")
    .argument(
      "[patterns...]",
      "One or more glob patterns for YAML files. Overrides config.",
      []
    )
    .option(
      "-w, --watch",
      "Watch for changes in YAML files and regenerate test files automatically."
    )
    .option(
      "-c, --config <filename>",
      "Specify a custom configuration file to load patterns from. Overrides default cascade."
    )
    .option(
      "-i, --ignore <patterns...>",
      "List of glob file patterns to exclude from matched files. Overrides config.",
      []
    )
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
    )
    .option(
      "-n, --dry-run",
      "Perform a dry run: simulate file generation without writing to disk."
    )
    .option(
      "-k, --test-keyword <keyword>",
      "Specify keyword for test blocks (it or test).",
      "it"
    )
    .option(
      "--no-cleanup",
      "Do not delete generated .test.js files when source YAML is unlinked in watch mode."
    )
    .configureHelp({ sortOptions: true })
    .action((cliPatterns, options) => {
      // Pass __dirname of the main CLI entry point (src/cli.js) to loadConfig
      // This ensures configLoader can correctly find the default.json
      const mainCliDir = path.join(__dirname, "../"); // Go up from src/commands/ to src/
      const { cliConfig, configSource } = loadConfig(
        cliPatterns,
        options,
        mainCliDir
      );

      setLogLevel(cliConfig.logLevel);
      logConfigurationDetails(cliConfig, configSource, cliPatterns, options);

      if (cliConfig.effectivePatterns.length === 0) {
        log(
          `\n⚠️ No patterns specified via command line or configuration files.
Please provide patterns as arguments (e.g., 'yaml-to-test generate "tests/**/*.yaml"')
or define them in a config file (e.g., 'yaml-to-test --config my-patterns.json').`,
          LOG_LEVELS.WARN
        );
        program.help();
        return;
      }

      if (cliConfig.watchMode) {
        runWatchMode(cliConfig);
      } else {
        runSinglePass(cliConfig);
      }
    });
};
