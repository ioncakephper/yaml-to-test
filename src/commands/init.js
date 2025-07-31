/**
 * @file src/commands/init.js
 * @description Defines the 'init' command for the CLI, which creates a default
 * yaml-to-test.json configuration file in the current directory.
 * Now includes an interactive mode using Inquirer.js when --quick is false,
 * and supports a --noDefaults flag to only output changed settings.
 * Includes validation for the output filename.
 * @author Your Name/AI Assistant
 * @license MIT
 */

const fs = require("fs");
const path = require("path");

const { LOG_LEVELS, log } = require("../utils/logger");

/**
 * Registers the 'init' command with the Commander.js program.
 * This command creates a default `yaml-to-test.json` configuration file in the
 * current working directory, using settings from `config/default.json` or
 * hardcoded fallbacks if the default config is unavailable.
 * It supports an interactive mode or quick generation based on flags,
 * and can optionally only write non-default settings.
 *
 * @param {Command} program - The Commander.js program instance.
 */
module.exports = (program) => {
  program
    .command("init [filename]")
    .alias("i")
    .description("Creates a configuration file in the current directory.")
    .option(
      "-f, --force",
      "Force overwriting the configuration file if it already exists."
    )
    .action((filename, options) => {
      const cliConfigFileName = "yaml-to-test.json";
      let actualConfigFileName = filename || cliConfigFileName;

      // --- Filename Validation and Correction ---
      // 1. Append .json extension if missing
      if (path.extname(actualConfigFileName).toLowerCase() !== ".json") {
        actualConfigFileName += ".json";
        log(
          `ℹ️ Appending '.json' extension to filename. New filename: '${actualConfigFileName}'`,
          LOG_LEVELS.INFO
        );
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
          `\n❌ Error: Cannot save configuration file outside the current project directory.`,
          LOG_LEVELS.ERROR
        );
        log(`Attempted path: '${projectConfigPath}'`, LOG_LEVELS.ERROR);
        process.exit(1);
      }
      // --- End Filename Validation and Correction ---

      const defaultConfigPathForInit = path.join(
        __dirname,
        "../../config",
        "default.json"
      );

      let defaultConfigFileContent;
      const hardcodedDefaultContent = {
        patterns: ["tests/**/*.yaml", "features/*.yml"],
        ignore: ["node_modules", ".git", "temp_files/**/*.yaml"],
        verbose: false,
        debug: false,
        silent: false,
        dryRun: false,
        testKeyword: "it",
        noCleanup: false,
        quick: false,
        force: false,
        noDefaults: false,
      };

      try {
        defaultConfigFileContent = JSON.parse(
          fs.readFileSync(defaultConfigPathForInit, "utf8")
        );
        log(
          `\n✅ Using settings from 'config/default.json' for initialization.`,
          LOG_LEVELS.INFO
        );
      } catch (error) {
        defaultConfigFileContent = hardcodedDefaultContent;
        log(
          `\n⚠️ Warning: Could not read or parse default configuration from '${defaultConfigPathForInit}'.`,
          LOG_LEVELS.WARN
        );
        log(`Initializing with hardcoded fallback defaults.`, LOG_LEVELS.WARN);
      }

      if (fs.existsSync(projectConfigPath)) {
        if (options.force) {
          log(
            `\n⚠️ Warning: '${actualConfigFileName}' already exists at '${projectConfigPath}'. Forcing overwrite due to --force flag.`,
            LOG_LEVELS.WARN
          );
        } else {
          log(
            `\n⚠️ Warning: '${actualConfigFileName}' already exists at '${projectConfigPath}'. Not overwriting.`,
            LOG_LEVELS.WARN
          );
          log(`To force overwrite, use the '--force' flag.`, LOG_LEVELS.WARN);
          process.exit(0);
        }
      }

      // Since the command is now always synchronous (non-interactive), we just use the defaults.
      // We remove init-specific keys before saving the file.
      const {
        quick,
        force,
        noDefaults,
        ...configToSave
      } = defaultConfigFileContent;

      try {
        fs.writeFileSync(
          projectConfigPath,
          JSON.stringify(configToSave, null, 2),
          "utf8"
        );
        log(
          `\n✅ Successfully created '${actualConfigFileName}' at '${projectConfigPath}'.`,
          LOG_LEVELS.INFO
        );
        log(
          `You can now customize this file and run 'yaml-to-test generate'.`,
          LOG_LEVELS.INFO
        );
        process.exit(0);
      } catch (error) {
        log(
          `\n❌ Error creating '${actualConfigFileName}': ${error.message}`,
          LOG_LEVELS.ERROR
        );
        process.exit(1);
      }
    });
};
