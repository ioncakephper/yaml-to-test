module.exports = (program) => {
  program
    .command("build")
    .description("Build the project")
    .option(
      "-c, --config <path>",
      "Path to the configuration file",
      "config.json"
    )
    .action((options) => {
      const configPath = options.config;
      console.log(`Building project with configuration from: ${configPath}`);
      // Here you would add the logic to build your project using the specified config
    });
};
