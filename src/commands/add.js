const { getMergedOptions } = require('../utils/getMergedOptions');

module.exports = function(program) {
  program
    .command('add')
    .description('Build the project')
    .option('-s --sidebars <file>', 'Path to the sidebars file', 'sidebars.js')
    .option('-d,--docs <path>', 'Path to the docs directory', 'docs')
    .option('--clear', 'Clear the console')
    .action((options, command) => {
      const merged = getMergedOptions(command, options);
      if (options.clear) {
        console.clear();
      }
      console.log('Building project');
      console.log('Merged config:', merged);
    })
    .configureHelp({ sortOptions: true, showGlobalOptions: true });
};
