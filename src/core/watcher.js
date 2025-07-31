/**
 * @file src/core/watcher.js
 * @description Sets up and manages the file watcher for YAML files using Chokidar.
 * @author Your Name/AI Assistant
 * @license MIT
 */

const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");
const { log, LOG_LEVELS } = require("../utils/logger"); // Import logger

/**
 * Starts the file watcher for specified patterns.
 * This function initializes Chokidar to monitor YAML files for additions, changes, and deletions.
 * It uses the provided `processFileCallback` to handle file events and optionally cleans up
 * generated test files upon deletion of source YAMLs.
 *
 * @param {object} cliConfig - The consolidated configuration object for the CLI,
 * containing properties like `effectivePatterns`, `effectiveIgnorePatterns`,
 * `isDryRun`, and `noCleanup`.
 * @param {function(string, object): void} processFileCallback - A callback function that will be
 * invoked to process a YAML file.
 * It receives the `filePath` and `cliConfig`.
 */
function startWatcher(cliConfig, processFileCallback) {
  log(
    `\n👀 Entering watch mode for patterns: ${cliConfig.effectivePatterns.join(
      ", "
    )}`,
    LOG_LEVELS.INFO
  );
  log(
    `Excluding: ${cliConfig.effectiveIgnorePatterns.join(", ")}`,
    LOG_LEVELS.INFO
  );
  log(`(Press Ctrl+C to exit)`, LOG_LEVELS.INFO);

  const watcher = chokidar.watch(cliConfig.effectivePatterns, {
    ignored: cliConfig.effectiveIgnorePatterns,
    persistent: true,
    ignoreInitial: false,
  });

  watcher.on("ready", () => {
    log(`\nInitial scan complete. Watching for changes...`, LOG_LEVELS.INFO);
  });

  watcher.on("add", (filePath) => {
    log(`\n➕ File added: ${filePath}`, LOG_LEVELS.INFO);
    processFileCallback(filePath, cliConfig);
  });

  watcher.on("change", (filePath) => {
    log(`\n🔄 File changed: ${filePath}`, LOG_LEVELS.INFO);
    processFileCallback(filePath, cliConfig);
  });

  watcher.on("unlink", (filePath) => {
    log(`\n🗑️ File deleted: ${filePath}`, LOG_LEVELS.INFO);
    if (!cliConfig.noCleanup) {
      // Only delete if cleanup is not disabled
      const dirName = path.dirname(filePath);
      const baseName = path.basename(filePath, path.extname(filePath));
      const outputFilePath = path.join(dirName, `${baseName}.test.js`);
      if (fs.existsSync(outputFilePath)) {
        fs.unlinkSync(outputFilePath);
        log(
          `🗑️ Deleted corresponding test file: ${outputFilePath}`,
          LOG_LEVELS.INFO
        );
      }
    } else {
      log(
        `Cleanup disabled. Keeping generated test file for: ${filePath}`,
        LOG_LEVELS.INFO
      );
    }
  });

  watcher.on("error", (error) => {
    log(`\n❌ Watcher error: ${error}`, LOG_LEVELS.ERROR);
  });
}

module.exports = {
  startWatcher,
};
