const fs = require('fs');
const path = require('path');

function loadConfig(cliConfigPath) {
  const defaultConfigPath = path.resolve(__dirname, '../../config/default.json');
  let config = {};

  // Load default config if exists
  if (fs.existsSync(defaultConfigPath)) {
    try {
      config = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf-8'));
    } catch (e) {
      console.warn('Warning: Could not parse default config:', e.message);
    }
  }

  // Load CLI config if provided and exists
  if (cliConfigPath && fs.existsSync(cliConfigPath)) {
    try {
      const cliConfig = JSON.parse(fs.readFileSync(cliConfigPath, 'utf-8'));
      config = { ...config, ...cliConfig };
    } catch (e) {
      console.warn('Warning: Could not parse CLI config:', e.message);
    }
  }

  return config;
}

function mergeConfigWithOptions(config, options) {
  // Command options take precedence over config
  return { ...config, ...options };
}

module.exports = { loadConfig, mergeConfigWithOptions };
