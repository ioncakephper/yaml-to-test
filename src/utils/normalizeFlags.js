// Takes options and an array of Commander option definitions
// Returns a new options object where boolean flags defined but not set are false
function normalizeFlags(options, optionDefs) {
  const normalized = { ...options };
  optionDefs.forEach(opt => {
    // Boolean flag: no required argument
    if (!opt.required) {
      const name = opt.attributeName();
      if (typeof normalized[name] === 'undefined') {
        normalized[name] = false;
      }
    }
  });
  return normalized;
}

module.exports = { normalizeFlags };
