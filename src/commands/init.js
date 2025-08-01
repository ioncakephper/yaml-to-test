/**
 * @file src/commands/init.js
 * @description Defines the 'init' command for the CLI, which creates a default
 * testweaver.json configuration file in the current directory.
 * Now includes an interactive mode using Inquirer.js when --quick is false,
 * and supports a --no-defaults flag to only output changed settings.
 * Includes validation for the output filename.
 * @author Your Name/AI Assistant
 * @license MIT
 */

const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");

const { LOG_LEVELS, log } = require("../utils/logger");

/**
 * Helper function to compare two arrays for equality (order-independent).
 * Assumes arrays contain primitive values.
 * @param {Array} arr1 - The first array.
 * @param {Array} arr2 - The second array.
 * @returns {boolean} True if the arrays contain the same elements, false otherwise.
 */
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();
  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) return false;
  }
  return true;
}

/**
 * Registers the 'init' command with the Commander.js program.
 * This command creates a default `testweaver.json` configuration file in the
 * current working directory, using settings from `config/default.json` or
 * hardcoded fallbacks if the default config is unavailable.
 * It supports an interactive mode or quick generation based on flags,
 * and can optionally only write non-default settings.
 *
 * @param {Command} program - The Commander.js program instance.
 */
module.exports = (program) => {
  program
    .command("init")
    .alias("i")
    .argument("[filename]", "name of configuration file to create")
    .description("create a configuration file in the current directory") // Changed to lowercase
    .option(
      "-q, --quick",
      "skip asking questions and generate the configuration file with default values"
    ) // Changed to lowercase
    .option(
      "-f, --force",
      "force overwriting the configuration file if it already exists"
    ) // Changed to lowercase
    .option(
      "--no-defaults",
      "only include settings in the generated file whose values differ from defaults"
    ) // Changed to lowercase
    .action(async (filename, options) => {
      // Made action async for inquirer
      const cliConfigFileName = "testweaver.json";
      let actualConfigFileName = filename || cliConfigFileName;

      // --- Filename Validation and Correction ---
      // 1. Append .json extension if missing
      if (path.extname(actualConfigFileName).toLowerCase() !== ".json") {
        actualConfigFileName += ".json";
        log(
          `ℹ️ appending '.json' extension to filename. new filename: '${actualConfigFileName}'`,
          LOG_LEVELS.INFO
        ); // Adjusted for lowercase consistency
      }

      const projectConfigPath = path.join(process.cwd(), actualConfigFileName);

      // 2. Prevent saving outside current directory
      const resolvedPath = path.resolve(projectConfigPath);
      const relativePath = path.relative(process.cwd(), resolvedPath);

      if (
        relativePath.startsWith("..") ||
        relativePath.includes(path.sep + "..")
      ) {
        log(
          `\n❌ error: cannot save configuration file outside the current project directory.`,
          LOG_LEVELS.ERROR
        ); // Adjusted for lowercase consistency
        log(`attempted path: '${projectConfigPath}'`, LOG_LEVELS.ERROR); // Adjusted for lowercase consistency
        process.exit(1);
      }
      // --- End Filename Validation and Correction ---

      const defaultConfigPathForInit = path.join(
        __dirname,
        "../../config",
        "default.json"
      );

      let defaultConfigFileContent;
      // Updated hardcodedDefaultContent to match the latest default.json
      const hardcodedDefaultContent = {
        patterns: [
          "**/__tests__/**/*.{yaml,yml}",
          "**/*.test.{yaml,yml}",
          "**/*.spec.{yaml,yml}",
          "tests/**/*.{yaml,yml}",
          "features/**/*.{yaml,yml}",
        ],
        ignore: ["node_modules", ".git", "temp_files/**/*.{yaml,yml}"],
        verbose: false,
        debug: false,
        silent: false,
        dryRun: false,
        testKeyword: "it",
        noCleanup: false,
        quick: false,
        force: false,
        "no-defaults": false,
      };

      try {
        defaultConfigFileContent = JSON.parse(
          fs.readFileSync(defaultConfigPathForInit, "utf8")
        );
        log(
          `\n✅ using settings from 'config/default.json' for initialization.`,
          LOG_LEVELS.INFO
        ); // Adjusted for lowercase consistency
      } catch (error) {
        defaultConfigFileContent = hardcodedDefaultContent;
        log(
          `\n⚠️ warning: could not read or parse default configuration from '${defaultConfigPathForInit}'.`,
          LOG_LEVELS.WARN
        ); // Adjusted for lowercase consistency
        log(`initializing with hardcoded fallback defaults.`, LOG_LEVELS.WARN); // Adjusted for lowercase consistency
      }

      if (fs.existsSync(projectConfigPath)) {
        if (options.force) {
          log(
            `\n⚠️ warning: '${actualConfigFileName}' already exists at '${projectConfigPath}'. forcing overwrite due to --force flag.`,
            LOG_LEVELS.WARN
          ); // Adjusted for lowercase consistency
        } else {
          log(
            `\n⚠️ warning: '${actualConfigFileName}' already exists at '${projectConfigPath}'. not overwriting.`,
            LOG_LEVELS.WARN
          ); // Adjusted for lowercase consistency
          log(`to force overwrite, use the '--force' flag.`, LOG_LEVELS.WARN); // Adjusted for lowercase consistency
          process.exit(0);
        }
      }

      let finalConfig = { ...defaultConfigFileContent }; // Start with defaults

      if (!options.quick) {
        log(
          `\nstarting interactive configuration for '${actualConfigFileName}'...`,
          LOG_LEVELS.INFO
        ); // Adjusted for lowercase consistency
        log(
          `(press enter to accept default, or modify values)`,
          LOG_LEVELS.INFO
        ); // Adjusted for lowercase consistency

        const questions = [
          {
            type: "checkbox",
            name: "patterns",
            message: "select glob patterns for yaml test definition files:", // Changed to lowercase
            choices: defaultConfigFileContent.patterns.map((p) => ({
              name: p,
              checked: true,
            })),
            default: defaultConfigFileContent.patterns,
          },
          {
            type: "input",
            name: "customPatterns",
            message:
              'enter any additional patterns (comma-separated, e.g., "src/**/*.yaml"):', // Changed to lowercase
            default: "",
            filter: (input) =>
              input
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
          },
          {
            type: "checkbox",
            name: "ignore",
            message: "select glob patterns to ignore during processing:", // Changed to lowercase
            choices: defaultConfigFileContent.ignore.map((i) => ({
              name: i,
              checked: true,
            })),
            default: defaultConfigFileContent.ignore,
          },
          {
            type: "input",
            name: "customIgnore",
            message:
              'enter any additional ignore patterns (comma-separated, e.g., "temp/**/*.yaml"):', // Changed to lowercase
            default: "",
            filter: (input) =>
              input
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
          },
          {
            type: "list",
            name: "testKeyword",
            message:
              "choose the keyword for generated test blocks (it or test):", // Changed to lowercase
            choices: ["it", "test"],
            default: defaultConfigFileContent.testKeyword,
          },
          {
            type: "confirm",
            name: "dryRun",
            message:
              "enable dry run mode (simulate generation without writing files)?", // Changed to lowercase
            default: defaultConfigFileContent.dryRun,
          },
          {
            type: "confirm",
            name: "noCleanup",
            message:
              "disable automatic cleanup of generated files when source yaml is deleted?", // Changed to lowercase
            default: defaultConfigFileContent.noCleanup,
          },
          {
            type: "confirm",
            name: "verbose",
            message: "enable verbose logging for detailed output?", // Changed to lowercase
            default: defaultConfigFileContent.verbose,
          },
          {
            type: "confirm",
            name: "debug",
            message:
              "enable debug logging for highly detailed debugging (most verbose)?", // Changed to lowercase
            default: defaultConfigFileContent.debug,
          },
          {
            type: "confirm",
            name: "silent",
            message: "suppress all output except critical errors?", // Changed to lowercase
            default: defaultConfigFileContent.silent,
          },
          {
            type: "confirm",
            name: "noDefaults", // Inquirer property name remains camelCase, Commander maps it
            message:
              "only include settings in the generated file whose values differ from defaults?", // Changed to lowercase
            default: defaultConfigFileContent["no-defaults"], // Access with kebab-case from defaultConfigFileContent
          },
        ];

        const answers = await inquirer.prompt(questions);

        // Consolidate answers into finalConfig
        finalConfig.patterns = [
          ...new Set([...answers.patterns, ...answers.customPatterns]),
        ];
        finalConfig.ignore = [
          ...new Set([...answers.ignore, ...answers.customIgnore]),
        ];
        finalConfig.testKeyword = answers.testKeyword;
        finalConfig.dryRun = answers.dryRun;
        finalConfig.noCleanup = answers.noCleanup;
        finalConfig.verbose = answers.verbose;
        finalConfig.debug = answers.debug;
        finalConfig.silent = answers.silent;
        finalConfig["no-defaults"] = answers.noDefaults; // Assign to kebab-case property
      } // End of interactive mode

      let configToSave = { ...finalConfig };

      // Determine if we should apply the --no-defaults logic.
      // The `--no-defaults` flag sets `options.defaults` to `false`.
      // If the flag is not present, we defer to the interactive answer.
      const shouldApplyNoDefaults = options.defaults === false ? true : finalConfig["no-defaults"];

      if (shouldApplyNoDefaults) {
        log(
          `\nfiltering configuration to include only non-default settings (--no-defaults enabled)...`,
          LOG_LEVELS.INFO
        ); // Adjusted for lowercase consistency
        const sparseConfig = {};

        for (const key in defaultConfigFileContent) {
          if (
            Object.prototype.hasOwnProperty.call(defaultConfigFileContent, key)
          ) {
            // Handle the 'no-defaults' key specifically for comparison
            const defaultValue =
              key === "no-defaults"
                ? defaultConfigFileContent["no-defaults"]
                : defaultConfigFileContent[key];
            const finalValue =
              key === "no-defaults"
                ? finalConfig["no-defaults"]
                : finalConfig[key];

            if (key === "quick" || key === "force" || key === "no-defaults") {
              continue; // These are init command-specific flags, not core config for 'generate'
            }

            if (Array.isArray(defaultValue)) {
              if (!arraysEqual(finalValue, defaultValue)) {
                sparseConfig[key] = finalValue;
              }
            } else if (
              typeof defaultValue === "boolean" ||
              typeof defaultValue === "string"
            ) {
              if (finalValue !== defaultValue) {
                sparseConfig[key] = finalValue;
              }
            }
          }
        }
        configToSave = sparseConfig;
      }

      try {
        fs.writeFileSync(
          projectConfigPath,
          JSON.stringify(configToSave, null, 2),
          "utf8"
        );
        log(
          `\n✅ successfully created '${actualConfigFileName}' at '${projectConfigPath}'.`,
          LOG_LEVELS.INFO
        ); // Adjusted for lowercase consistency
        log(
          `you can now customize this file or run 'testweaver generate' without patterns.`,
          LOG_LEVELS.INFO
        ); // Adjusted for lowercase consistency
        process.exit(0);
      } catch (error) {
        log(
          `\n❌ error creating '${actualConfigFileName}': ${error.message}`,
          LOG_LEVELS.ERROR
        ); // Adjusted for lowercase consistency
        process.exit(1);
      }
    });
};
