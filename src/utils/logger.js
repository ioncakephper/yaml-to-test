/**
 * @file src/utils/logger.js
 * @description Centralized logging utility for the CLI.
 * Defines log levels and a function to log messages based on the current verbosity.
 * @author Your Name/AI Assistant
 * @license MIT
 */

const LOG_LEVELS = {
  SILENT: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  VERBOSE: 4,
  DEBUG: 5,
};

let currentLogLevel = LOG_LEVELS.INFO; // Default log level, can be configured

/**
 * Sets the global log level for the logger.
 * Subsequent log calls will only display messages at or below this level.
 * @param {number} level - The desired log level from LOG_LEVELS (e.g., LOG_LEVELS.INFO, LOG_LEVELS.DEBUG).
 */
function setLogLevel(level) {
  currentLogLevel = level;
}

/**
 * Logs a message to the console if its level is less than or equal to the current global log level.
 * Uses console.error for ERROR, console.warn for WARN, and console.log for others.
 * @param {string} message - The message text to log.
 * @param {number} [level=LOG_LEVELS.INFO] - The log level of the message. Defaults to INFO.
 */
function log(message, level = LOG_LEVELS.INFO) {
  if (level <= currentLogLevel) {
    if (level === LOG_LEVELS.ERROR) {
      console.error(message);
    } else if (level === LOG_LEVELS.WARN) {
      console.warn(message);
    } else {
      console.log(message);
    }
  }
}

module.exports = {
  LOG_LEVELS,
  setLogLevel,
  log,
};
