const { getMergedOptions } = require('../utils/getMergedOptions');

module.exports = function(program) {
  program
    .command('build', {isDefault: true})
    .configureHelp({ sortOptions: true, showGlobalOptions: true })
    .description('Build the project')
    .option('-s --sidebars <file>', 'Path to the sidebars file', 'sidebars.js')
    .option('-d,--docs <path>', 'Path to the docs directory', 'docs')
    .option('--clear', 'Clear before adding')
    .action((options, command) => {
      const merged = getMergedOptions(command, options);
      console.log('Building project');
      console.log('Merged config:', merged);
    })


};
