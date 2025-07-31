/**
 * @file scripts/generate-config-schema.js
 * @description A script to generate a JSON Schema for the yaml-to-test CLI's
 * configuration files (default.json and yaml-to-test.json).
 * This schema enables IDE features like autocompletion and validation.
 * @author Your Name/AI Assistant
 * @license MIT
 */

const fs = require("fs");
const path = require("path");

// Define paths for the default config and the output schema
const defaultConfigPath = path.join(__dirname, "../config/default.json");
const schemaOutputPath = path.join(
  __dirname,
  "../config/default-config.schema.json"
);

try {
  // Read and parse the default configuration file to infer types and defaults
  const defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath, "utf8"));

  // Define the JSON Schema structure
  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "yaml-to-test Configuration",
    description:
      "Schema for the yaml-to-test CLI configuration file (default.json or yaml-to-test.json).\nThis schema provides autocompletion and validation in compatible IDEs.",
    type: "object",
    properties: {
      patterns: {
        type: "array",
        description:
          "One or more glob patterns for YAML files to be processed (e.g., 'tests/**/*.yaml').",
        items: {
          type: "string",
        },
        default: defaultConfig.patterns,
      },
      ignore: {
        type: "array",
        description:
          "List of glob file patterns to exclude from matched files (e.g., '**/temp/*.yaml').",
        items: {
          type: "string",
        },
        default: defaultConfig.ignore,
      },
      verbose: {
        type: "boolean",
        description: "Enable verbose output for more detailed information.",
        default: defaultConfig.verbose,
      },
      debug: {
        type: "boolean",
        description:
          "Enable debug output for highly detailed debugging information (most verbose).",
        default: defaultConfig.debug,
      },
      silent: {
        type: "boolean",
        description:
          "Suppress all output except critical errors (least verbose).",
        default: defaultConfig.silent,
      },
      dryRun: {
        type: "boolean",
        description:
          "Perform a dry run: simulate file generation without writing to disk.",
        default: defaultConfig.dryRun,
      },
      testKeyword: {
        type: "string",
        description: "Specify keyword for test blocks ('it' or 'test').",
        enum: ["it", "test"],
        default: defaultConfig.testKeyword,
      },
      noCleanup: {
        type: "boolean",
        description:
          "Do not delete generated .test.js files when source YAML is unlinked in watch mode.",
        default: defaultConfig.noCleanup,
      },
      quick: {
        type: "boolean",
        description:
          "For the 'init' command: Skip asking questions and generate the configuration file with default values.",
        default: defaultConfig.quick,
      },
      force: {
        type: "boolean",
        description:
          "For the 'init' command: Force overwriting the configuration file if it already exists.",
        default: defaultConfig.force,
      },
      "no-defaults": {
        // Changed to no-defaults
        type: "boolean",
        description:
          "For the 'init' command: Only include settings in the generated file whose values differ from defaults.",
        default: defaultConfig["no-defaults"], // Access with kebab-case
      },
    },
    additionalProperties: false,
    required: [
      "patterns",
      "ignore",
      "verbose",
      "debug",
      "silent",
      "dryRun",
      "testKeyword",
      "noCleanup",
      "quick",
      "force",
      "no-defaults",
    ],
  };

  // Write the generated schema to the specified output path
  fs.writeFileSync(schemaOutputPath, JSON.stringify(schema, null, 2), "utf8");
  console.log(`✅ JSON Schema generated successfully at: ${schemaOutputPath}`);
} catch (error) {
  console.error(`❌ Error generating JSON schema: ${error.message}`);
  console.error(
    `Please ensure 'config/default.json' exists and is valid JSON.`
  );
  process.exit(1);
}
