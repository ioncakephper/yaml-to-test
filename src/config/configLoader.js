/**
 * @file src/config/configLoader.js
 * @description Handles loading and consolidating CLI configuration from cascaded sources:
 * command-line options, project config file (testweaver.json), and default config file.
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
 * @param {string} sourceDescription - A description of the config source for logging purposes.
 */
function validateConfig(config, sourceDescription) {
  if (!validateSchema) {
    log(
      `❌ error: json schema validator not initialized. cannot validate configuration.`,
      LOG_LEVELS.ERROR
    );
    process.exit(1);
  }

  const isValid = validateSchema(config);
  if (!isValid) {
    log(
      `\n❌ error: configuration from '${sourceDescription}' is invalid according to the schema:`,
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
    `configuration from '${sourceDescription}' successfully validated against schema.`,
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
    return config;
  } catch (e) {
    // This catch block handles JSON parsing errors. Schema validation errors are handled by validateConfig.
    log(
      `⚠️ warning: could not parse config file '${configPath}'. error: ${e.message}`,
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
 * configuration (`cliConfig`) and a string indicating the source of the configuration.
 */
function loadConfig(cliPatterns, options, mainModuleDir) {
  const cliConfigFileName = "testweaver.json";
  const defaultConfigFileName = "default.json";
  const defaultConfigPath = path.join(
    mainModuleDir, "../config", defaultConfigFileName
  );
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

  // 1. Load default config as the base. It must exist and be valid.
  const defaultConfig = loadConfigFile(defaultConfigPath);
  if (!defaultConfig) {
    log(
      `❌ error: default configuration file '${defaultConfigPath}' not found or is invalid. cannot proceed.`,
      LOG_LEVELS.ERROR
    );
    process.exit(1);
  }
  // Validate the default config to ensure it's a sound base.
  validateConfig(defaultConfig, `default config: ${defaultConfigPath}`);

  // 2. Determine which project config to load (custom or standard) and load it.
  let projectConfig = {};
  let configSource = `default config: ${defaultConfigPath}`;
  let projectConfigPath = null;

  if (options.config) {
    projectConfigPath = path.resolve(process.cwd(), options.config);
  } else {
    projectConfigPath = cliConfigPath;
  }

  const loadedProjectConfig = loadConfigFile(projectConfigPath);
  if (loadedProjectConfig) {
    projectConfig = loadedProjectConfig;
    configSource = `project config: ${projectConfigPath}`;
  } else if (options.config) {
    // If a custom config was specified with --config but not found, it's an error.
    log(
      `❌ error: custom configuration file specified with --config was not found at '${projectConfigPath}'.`,
      LOG_LEVELS.ERROR
    );
    process.exit(1);
  }

  // 3. Merge default and project configs. Project config values override default values.
  const mergedConfig = { ...defaultConfig, ...projectConfig };

  // 4. Validate the MERGED configuration. This ensures the final combination is valid
  // and prevents unknown keys from the project config file.
  validateConfig(mergedConfig, configSource);

  // 5. Consolidate final config by overriding with command-line options.
  const cliConfig = {
    logLevel: determineLogLevel(options, mergedConfig),
    effectivePatterns:
      cliPatterns.length > 0 ? cliPatterns : mergedConfig.patterns || [],
    effectiveIgnorePatterns: (() => {
      const baseRequiredIgnores = ["**/*.test.js"];
      if (options.ignore && options.ignore.length > 0) {
        return [...baseRequiredIgnores, ...options.ignore];
      }
      return [...baseRequiredIgnores, ...(mergedConfig.ignore || [])];
    })(),
    isDryRun: options.dryRun !== undefined ? options.dryRun : mergedConfig.dryRun,
    testKeyword: options.testKeyword || mergedConfig.testKeyword,
    watchMode: options.watch || false,
    noCleanup: options.noCleanup !== undefined ? options.noCleanup : mergedConfig.noCleanup,
    quick:
      typeof options.quick !== "undefined"
        ? options.quick
        : mergedConfig.quick || false,
    force:
      typeof options.force !== "undefined"
        ? options.force
        : mergedConfig.force || false,
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
