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
function logConfigurationDetails(
  cliConfig,
  configSource,
  cliPatterns,
  options
) {
  log(`🚀 starting testweaver cli (generate command)...`, LOG_LEVELS.INFO); // Adjusted for lowercase consistency
  log(
    `⚙️ effective configuration sourced from: ${configSource}`,
    LOG_LEVELS.INFO
  );

  if (cliPatterns.length > 0) {
    log(
      `override: using patterns from command line arguments.`,
      LOG_LEVELS.INFO
    ); // Adjusted for lowercase consistency
  }
  if (options.ignore && options.ignore.length > 0) {
    log(
      `override: using ignore patterns from command line arguments.`,
      LOG_LEVELS.INFO
    ); // Adjusted for lowercase consistency
  }
  if (options.dryRun) {
    log(`override: dry run mode enabled from command line.`, LOG_LEVELS.INFO); // Adjusted for lowercase consistency
  } else if (cliConfig.isDryRun) {
    log(`dry run mode enabled from configuration.`, LOG_LEVELS.INFO); // Adjusted for lowercase consistency
  }
  if (options.testKeyword) {
    log(
      `override: using '${cliConfig.testKeyword}.todo' for test blocks from command line.`,
      LOG_LEVELS.INFO
    ); // Adjusted for lowercase consistency
  } else if (cliConfig.testKeyword !== "it") {
    log(
      `using '${cliConfig.testKeyword}.todo' for test blocks from configuration.`,
      LOG_LEVELS.INFO
    ); // Adjusted for lowercase consistency
  }
  if (options.noCleanup) {
    log(`override: cleanup disabled from command line.`, LOG_LEVELS.INFO); // Adjusted for lowercase consistency
  } else if (cliConfig.noCleanup) {
    log(`cleanup disabled from configuration.`, LOG_LEVELS.INFO); // Adjusted for lowercase consistency
  }
}

/**
 * Starts the watcher to monitor file changes.
 * @param {object} cliConfig - The final configuration object.
 */
function runWatchMode(cliConfig) {
  if (cliConfig.isDryRun) {
    log(
      `warning: --dry-run is enabled. no files will be written even in watch mode.`,
      LOG_LEVELS.WARN
    ); // Adjusted for lowercase consistency
  }
  log(
    `\n👀 entering watch mode for patterns: ${cliConfig.effectivePatterns.join(
      ", "
    )}`,
    LOG_LEVELS.INFO
  ); // Adjusted for lowercase consistency
  log(
    `excluding: ${cliConfig.effectiveIgnorePatterns.join(", ")}`,
    LOG_LEVELS.INFO
  ); // Adjusted for lowercase consistency
  log(`(press ctrl+c to exit)`, LOG_LEVELS.INFO); // Adjusted for lowercase consistency
  startWatcher(cliConfig, processFile);
}

/**
 * Performs a single pass of file processing based on the configuration.
 * @param {object} cliConfig - The final configuration object.
 */
function runSinglePass(cliConfig) {
  // No longer async as glob.sync is used
  log(
    `🔍 using effective patterns: ${cliConfig.effectivePatterns.join(", ")}`,
    LOG_LEVELS.INFO
  ); // Adjusted for lowercase consistency
  log(
    `excluding: ${cliConfig.effectiveIgnorePatterns.join(", ")}`,
    LOG_LEVELS.INFO
  ); // Adjusted for lowercase consistency

  let filesFound = 0;
  let filesProcessed = 0;

  for (const pattern of cliConfig.effectivePatterns) {
    try {
      // Switched to synchronous glob.sync
      const matchingFiles = glob.sync(pattern, {
        absolute: true,
        nodir: true,
        ignore: cliConfig.effectiveIgnorePatterns,
      });

      if (matchingFiles.length === 0) {
        log(
          `⚠️ no yaml files found for pattern: '${pattern}'`,
          LOG_LEVELS.WARN
        ); // Adjusted for lowercase consistency
      } else {
        log(
          `found ${matchingFiles.length} files for pattern '${pattern}'.`,
          LOG_LEVELS.INFO
        ); // Adjusted for lowercase consistency
        filesFound += matchingFiles.length;
        matchingFiles.forEach((file) => processFile(file, cliConfig));
        filesProcessed += matchingFiles.length;
      }
    } catch (err) {
      log(
        `❌ error finding files for pattern '${pattern}': ${err.message}`,
        LOG_LEVELS.ERROR
      ); // Adjusted for lowercase consistency
    }
  }

  if (filesFound > 0) {
    log(
      `\n✨ cli execution complete. processed ${filesProcessed} of ${filesFound} yaml files.`,
      LOG_LEVELS.INFO
    ); // Adjusted for lowercase consistency
  } else {
    log(
      `\n🤷 no yaml files were found or processed based on the provided patterns.`,
      LOG_LEVELS.INFO
    ); // Adjusted for lowercase consistency
  }
}

/**
 * Registers the 'generate' command with the Commander.js program.
 * This command, which can be run as the default, finds and processes YAML files
 * to generate test files. It supports watch mode, dry runs, and inherits
 * global logging options.
 * @param {Command} program - The Commander.js program instance.
 */
module.exports = (program) => {
  program
    .command("generate", { isDefault: true })
    .alias("g")
    .description("generate jest test files from yaml definitions") // Changed to lowercase
    .argument(
      "[patterns...]",
      "one or more glob patterns for yaml files. overrides config", // Changed to lowercase
      []
    )
    .option(
      "-w, --watch",
      "watch for changes in yaml files and regenerate test files automatically" // Changed to lowercase
    )
    .option(
      "-c, --config <filename>",
      "specify a custom configuration file to load patterns from. overrides default cascade" // Changed to lowercase
    )
    .option(
      "-i, --ignore <patterns...>",
      "list of glob file patterns to exclude from matched files. overrides config", // Changed to lowercase
      []
    )
    .option(
      "-n, --dry-run",
      "perform a dry run: simulate file generation without writing to disk" // Changed to lowercase
    )
    .option(
      "-k, --test-keyword <keyword>",
      "specify keyword for test blocks (it or test)", // Changed to lowercase
      "it"
    )
    .option(
      "--no-cleanup",
      "do not delete generated .test.js files when source yaml is unlinked in watch mode" // Changed to lowercase
    )
    .configureHelp({ sortOptions: true })
    .action((cliPatterns, options) => {
      // Removed 'async' from action as runSinglePass is no longer async
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
          `\n⚠️ no patterns specified via command line or configuration files.
please provide patterns as arguments (e.g., 'testweaver generate "tests/**/*.yaml"')
or define them in a config file (e.g., 'testweaver --config my-patterns.json').`, // Adjusted for lowercase consistency
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
