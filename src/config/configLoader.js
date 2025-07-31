/**
 * @file src/config/configLoader.js
 * @description Handles loading and consolidating CLI configuration from cascaded sources:
 * command-line options, project config file (yaml-to-test.json), and default config file.
 * Includes JSON Schema validation for loaded configuration files.
 * @author Your Name/AI Assistant
 * @license MIT
 */

const fs = require("fs");
const path = require("path");
const Ajv = require("ajv"); // Import Ajv

const { log, LOG_LEVELS } = require("../utils/logger");

// Initialize Ajv validator
const ajv = new Ajv({ allErrors: true });
let validateSchema; // Will hold the compiled schema validator

/**
 * Loads the JSON schema for the configuration and compiles it.
 * This function should be called once during initialization.
 * @param {string} schemaPath - The full path to the JSON schema file.
 */
function loadAndCompileSchema(schemaPath) {
  try {
    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
    validateSchema = ajv.compile(schema);
    log(
      `JSON Schema loaded and compiled from: ${schemaPath}`,
      LOG_LEVELS.DEBUG
    );
  } catch (error) {
    log(
      `❌ Error: Could not load or compile JSON schema from '${schemaPath}'. ${error.message}`,
      LOG_LEVELS.ERROR
    );
    process.exit(1);
  }
}

/**
 * Validates a configuration object against the loaded JSON schema.
 * If validation fails, it logs the errors and exits the process.
 * @param {object} config - The configuration object to validate.
 * @param {string} configFilePath - The path to the configuration file (for logging purposes).
 */
function validateConfig(config, configFilePath) {
  if (!validateSchema) {
    log(
      `❌ Error: JSON schema validator not initialized. Cannot validate configuration.`,
      LOG_LEVELS.ERROR
    );
    process.exit(1);
  }

  const isValid = validateSchema(config);
  if (!isValid) {
    log(
      `\n❌ Error: Configuration file '${configFilePath}' is invalid according to the schema:`,
      LOG_LEVELS.ERROR
    );
    validateSchema.errors.forEach((err) => {
      log(
        `    - ${err.instancePath || "root"} ${err.message}`,
        LOG_LEVELS.ERROR
      );
    });
    process.exit(1);
  }
  log(
    `Configuration file '${configFilePath}' successfully validated against schema.`,
    LOG_LEVELS.DEBUG
  );
}

/**
 * Loads configuration from a specified JSON file.
 * @param {string} configPath - The full path to the configuration file.
 * @returns {object|null} The parsed configuration object, or null if file not found/invalid.
 */
function loadConfigFile(configPath) {
  if (!fs.existsSync(configPath)) {
    return null;
  }
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    validateConfig(config, configPath); // Validate immediately after loading
    return config;
  } catch (e) {
    // This catch block handles JSON parsing errors. Schema validation errors are handled by validateConfig.
    log(
      `⚠️ Warning: Could not parse config file '${configPath}'. Error: ${e.message}`,
      LOG_LEVELS.WARN
    );
    return null;
  }
}

/**
 * Determines the effective log level based on command-line options and loaded configuration.
 * Command-line options take precedence over configuration file settings.
 * @param {object} options - Options parsed from the command line by Commander.js.
 * @param {object} loadedConfig - Configuration object loaded from a config file.
 * @returns {number} The determined log level from LOG_LEVELS.
 */
function determineLogLevel(options, loadedConfig) {
  if (options.debug) return LOG_LEVELS.DEBUG;
  if (options.verbose) return LOG_LEVELS.VERBOSE;
  if (options.silent) return LOG_LEVELS.SILENT;
  if (loadedConfig.debug) return LOG_LEVELS.DEBUG;
  if (loadedConfig.verbose) return LOG_LEVELS.VERBOSE;
  if (loadedConfig.silent) return LOG_LEVELS.SILENT;
  return LOG_LEVELS.INFO; // Default
}

/**
 * Loads and consolidates all CLI configuration based on a cascade:
 * Command-line options > Project config > Default config.
 * It determines the effective patterns, ignore rules, dry run status, test keyword,
 * watch mode, and cleanup preferences.
 * @param {Array<string>} cliPatterns - Glob patterns provided directly on the command line.
 * @param {object} options - Options object from Commander.js.
 * @param {string} mainModuleDir - The __dirname from the main CLI entry point (e.g., src/cli.js),
 * used for robust pathing to the default config file.
 * @returns {{cliConfig: object, configSource: string}} An object containing the consolidated
 * configuration (`cliConfig`) and a string indicating its primary source (`configSource`).
 */
function loadConfig(cliPatterns, options, mainModuleDir) {
  let loadedConfig = {};
  let configSource = "default (no config file found)";

  const cliConfigFileName = "yaml-to-test.json";
  const defaultConfigFileName = "default.json";
  const cliConfigPath = path.join(process.cwd(), cliConfigFileName);
  const schemaPath = path.join(
    mainModuleDir,
    "../config",
    "default-config.schema.json"
  );

  // Load and compile the schema once
  if (!validateSchema) {
    loadAndCompileSchema(schemaPath);
  }

  // Prioritize explicit --config file
  if (options.config) {
    const customConfigPath = path.resolve(process.cwd(), options.config);
    const customLoaded = loadConfigFile(customConfigPath); // Validation happens inside loadConfigFile
    if (customLoaded === null) {
      // Error already logged by loadConfigFile if parse error or schema validation fails
      process.exit(1); // Exit if custom config is not found or invalid
    }
    loadedConfig = customLoaded;
    configSource = `custom config file: ${customConfigPath}`;
  } else {
    // Fallback to project config then default config
    const projectLoaded = loadConfigFile(cliConfigPath); // Validation happens inside loadConfigFile
    if (projectLoaded) {
      loadedConfig = projectLoaded;
      configSource = `project config file: ${cliConfigPath}`;
    } else {
      const defaultLoaded = loadConfigFile(
        path.join(mainModuleDir, "../config", defaultConfigFileName)
      ); // Validation happens inside loadConfigFile
      if (defaultLoaded) {
        loadedConfig = defaultLoaded;
        configSource = `default config file: ${path.join(
          mainModuleDir,
          "../config",
          defaultConfigFileName
        )}`;
      } else {
        // If default.json itself is missing or invalid, we can't proceed without a base config.
        log(
          `❌ Error: Default configuration file '${path.join(
            mainModuleDir,
            "../config",
            defaultConfigFileName
          )}' not found or is invalid. Cannot proceed without a base configuration.`,
          LOG_LEVELS.ERROR
        );
        process.exit(1);
      }
    }
  }

  // Consolidate all configuration into a single object
  const cliConfig = {
    // Log Level
    logLevel: determineLogLevel(options, loadedConfig),
    // Patterns
    effectivePatterns:
      cliPatterns.length > 0 ? cliPatterns : loadedConfig.patterns || [],
    // Ignore Patterns
    effectiveIgnorePatterns: (() => {
      const baseRequiredIgnores = ["**/*.test.js"];
      if (options.ignore && options.ignore.length > 0) {
        return [...baseRequiredIgnores, ...options.ignore];
      } else if (
        loadedConfig.ignore &&
        Array.isArray(loadedConfig.ignore) &&
        loadedConfig.ignore.length > 0
      ) {
        return [...baseRequiredIgnores, ...loadedConfig.ignore];
      }
      return [...baseRequiredIgnores, "node_modules", ".git"];
    })(),
    // Dry Run
    isDryRun: options.dryRun || loadedConfig.dryRun || false,
    // Test Keyword
    testKeyword: options.testKeyword || loadedConfig.testKeyword || "it",
    // Watch Mode
    watchMode: options.watch || false,
    // No Cleanup
    noCleanup: options.noCleanup || loadedConfig.noCleanup || false,
    // Init command options (quick and force)
    quick:
      typeof options.quick !== "undefined"
        ? options.quick
        : loadedConfig.quick || false,
    force:
      typeof options.force !== "undefined"
        ? options.force
        : loadedConfig.force || false,
  };

  // Ensure uniqueness of ignore patterns
  cliConfig.effectiveIgnorePatterns = [
    ...new Set(cliConfig.effectiveIgnorePatterns),
  ];

  return { cliConfig, configSource };
}

module.exports = {
  loadConfig,
};
