const { mergeConfigWithOptions } = require('./configLoader');
const { normalizeFlags } = require('./normalizeFlags');

function getMergedOptions(command, options) {
  let merged = mergeConfigWithOptions(command.parent.config, options);
  const allOptions = command.parent.options.concat(command.options);
  merged = normalizeFlags(merged, allOptions);
  return merged;
}

module.exports = { getMergedOptions };
