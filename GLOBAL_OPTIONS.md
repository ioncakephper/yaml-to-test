# Configuration Management and Global Options in CLI Tools

Modern command-line interfaces (CLIs) require flexible, maintainable, and user-friendly configuration systems. This document explores best practices for managing configuration and global options in CLI tools, with a focus on Node.js projects built using the powerful commander package.

You will learn how to define and use global options, how configuration can be layered and cascaded, and how to choose the right configuration file format for your needs. Real-world code examples from this CLI and references to popular tools like Jest, ESLint, Prettier, and others illustrate these concepts in practice.

Whether you are designing a new CLI or improving an existing one, this guide will help you implement robust configuration management that is both developer- and user-friendly.

## Table of Contents

- [Configuration Management and Global Options in CLI Tools](#configuration-management-and-global-options-in-cli-tools)
  - [Table of Contents](#table-of-contents)
  - [🚀 Building the CLI with Commander](#-building-the-cli-with-commander)
    - [Why Commander?](#why-commander)
    - [📝 Example: Setting Up the Program](#-example-setting-up-the-program)
    - [📝 Example: Defining a Command](#-example-defining-a-command)
    - [📝 Example: Using Global and Command Options](#-example-using-global-and-command-options)
    - [📝 Example: Using Hooks](#-example-using-hooks)
  - [💡 Why Use Global Options?](#-why-use-global-options)
    - [Specific Global Options](#specific-global-options)
  - [⚙️ The `--config` Option: Global vs. Command-Level](#️-the---config-option-global-vs-command-level)
    - [Using `--config` as a Global Option](#using---config-as-a-global-option)
    - [Using `--config` at the Command Level](#using---config-at-the-command-level)
    - [Pragmatic Choice: Global `--config`](#pragmatic-choice-global---config)
  - [📝 Example: Defining Global Options](#-example-defining-global-options)
  - [🪝 The `preAction` Hook: Loading and Merging Configuration](#-the-preaction-hook-loading-and-merging-configuration)
    - [What does `preAction` do?](#what-does-preaction-do)
  - [🧩 How the Merged Options Object is Built](#-how-the-merged-options-object-is-built)
  - [🔍 Accessing All Options in a Command](#-accessing-all-options-in-a-command)
    - [How does `getMergedOptions` work?](#how-does-getmergedoptions-work)
      - [✅ Boolean Normalization](#-boolean-normalization)
  - [📝 Example: The `build` Command](#-example-the-build-command)
  - [🏗️ Cascaded Configuration: Layered and Flexible](#️-cascaded-configuration-layered-and-flexible)
    - [🏗️ How Cascaded Configuration Works](#️-how-cascaded-configuration-works)
    - [🪝 Cascading in Practice: The preAction Hook](#-cascading-in-practice-the-preaction-hook)
      - [💻 Code Example: preAction Hook](#-code-example-preaction-hook)
      - [❓ What Does This Code Do?](#-what-does-this-code-do)
      - [🔬 Drill Down: Involved Functions](#-drill-down-involved-functions)
    - [Examples from Popular Tools](#examples-from-popular-tools)
      - [Jest](#jest)
      - [ESLint](#eslint)
      - [Prettier](#prettier)
      - [NPM](#npm)
      - [Poetry (Python)](#poetry-python)
      - [Cargo (Rust)](#cargo-rust)
    - [Benefits of Cascaded Configuration](#benefits-of-cascaded-configuration)
    - [Cascaded Configuration in This CLI](#cascaded-configuration-in-this-cli)
  - [Choosing Configuration File Extensions and Priority](#choosing-configuration-file-extensions-and-priority)
    - [Common Configuration File Extensions](#common-configuration-file-extensions)
    - [How Tools Prioritize Config Files](#how-tools-prioritize-config-files)
    - [When to Use Each Format](#when-to-use-each-format)
    - [When to Avoid Certain Formats](#when-to-avoid-certain-formats)
    - [Best Practices](#best-practices)
    - [Examples from Popular Tools](#examples-from-popular-tools-1)
  - [Summary](#summary)
  - [Appendix I: 📟 CLI Help Output Examples](#appendix-i--cli-help-output-examples)
    - [Top-Level CLI Help (`mycli -h`)](#top-level-cli-help-mycli--h)
    - [Command-Level Help (`mycli build -h`)](#command-level-help-mycli-build--h)


## 🚀 Building the CLI with Commander

This CLI is built on top of the popular [commander](https://www.npmjs.com/package/commander) package, which provides a robust and flexible framework for building command-line interfaces in Node.js. Commander makes it easy to define commands, global options, command-specific options, and hooks for advanced behaviors.

### Why Commander?
- **Declarative API:** Define commands and options in a readable, chainable style.
- **Automatic Help:** Generates help output and usage information automatically.
- **Hooks and Extensibility:** Supports hooks like `preAction` for advanced configuration and setup.
- **Option Parsing:** Handles parsing, type coercion, and default values for options.

### 📝 Example: Setting Up the Program
From `src/utils/createProgram.js`:

```js
const { Command } = require('commander');

function createProgram() {
  const program = new Command();
  program
    .name('mycli')
    .description('A CLI tool powered by commander')
    .version('1.0.0')
    .option('--verbose', 'Enable verbose output')
    .option('--debug', 'Enable debug mode')
    .option('--silent', 'Suppress output')
    .option('-c, --config <file>', 'Path to configuration file (e.g., mycli.json)');

  // Attach a hook to load and merge config before any command action
  program.hook('preAction', (thisCommand) => {
    const globals = thisCommand.opts();
    const config = loadConfig(globals.config);
    thisCommand.config = mergeConfigWithOptions(config, globals);
  });

  // Dynamically load all commands from /src/commands
  loadCommands(program, path.resolve(__dirname, '../commands'));

  program.configureHelp({sortOptions: true, sortSubcommands: true});
  return program;
}
```

### 📝 Example: Defining a Command
From `src/commands/build.js`:

```js
module.exports = function(program) {
  program
    .command('build')
    .description('Build the project')
    .option('-s --sidebars <file>', 'Path to the sidebars file', 'sidebars.js')
    .option('-d,--docs <path>', 'Path to the docs directory', 'docs')
    .option('--clear', 'Clear before adding')
    .action((options, command) => {
      const merged = getMergedOptions(command, options);
      console.log('Building project');
      console.log('Merged config:', merged);
    })
    .configureHelp({ sortOptions: true, showGlobalOptions: true });
};
```

### 📝 Example: Using Global and Command Options
Commander automatically merges global options (defined on the program) and command-specific options. In the action handler, you can access all options using the merged object, as shown above.

### 📝 Example: Using Hooks
Commander supports hooks like `preAction` to run logic before any command executes. This is used in this CLI to load and merge configuration, ensuring all commands have access to the correct settings.

---

This document explains the use of global options in the CLI, with a particular focus on the `--config` option. It also describes how global options are made available to each command, and how a single statement in each command provides access to all relevant options, including those from configuration files and those valid for the command but not explicitly used on the command line.

---

## 💡 Why Use Global Options?

Global options are essential in CLI tools for several reasons:
- **Consistency:** They provide a uniform way to control application-wide behavior, ensuring that all commands can be influenced by the same set of options.
- **Convenience:** Users can set options once and have them apply everywhere, rather than repeating them for each command.
- **Configurability:** They allow for flexible configuration, especially when combined with configuration files.
- **DRY Principle:** By centralizing common options, you avoid repetition and reduce the risk of inconsistencies.

### Specific Global Options
- `--verbose`: Enables detailed output for debugging or informational purposes across all commands.
- `--debug`: Activates debug mode, often providing even more granular information than verbose.
- `--silent`: Suppresses output, useful for scripting or automation where minimal output is desired.
- `--config`: Specifies a configuration file to load default settings, making it easy to reuse and share configurations.

These options are global because their effects are relevant to the entire CLI session, not just a single command.

---

## ⚙️ The `--config` Option: Global vs. Command-Level

### Using `--config` as a Global Option
- **Benefit:** You specify the configuration file once, and it applies to all commands and subcommands.
- **DRY Principle:** This approach avoids repetition—users do not need to specify the config file for every command invocation.
- **Consistency:** Ensures that all commands operate with the same configuration context, reducing the risk of subtle bugs or mismatches.
- **Simplicity:** The CLI implementation is simpler, as the config is loaded and merged in one place (via the `preAction` hook).

### Using `--config` at the Command Level
- **Benefit:** Allows different commands to use different configuration files if needed, providing flexibility for advanced use cases.
- **Shortcoming:** Users must remember to specify the correct config file for each command, leading to repetitive and error-prone command lines.
- **Inconsistency:** Increases the risk of running commands with mismatched or unintended configurations.
- **Complexity:** The CLI codebase becomes more complex, as each command must handle config loading and merging separately.

### Pragmatic Choice: Global `--config`
Using `--config` as a global option is a pragmatic choice rooted in the DRY principle. Most users want a single configuration context for their CLI session, and specifying the config file once is both convenient and less error-prone. While command-level config is possible, it is rarely needed and introduces unnecessary complexity for the majority of use cases.

---

## 📝 Example: Defining Global Options

In this repository, global options are defined in `src/utils/createProgram.js`:

```js
program
  .name('mycli')
  .description('A CLI tool powered by commander')
  .version('1.0.0')
  .option('--verbose', 'Enable verbose output')
  .option('--debug', 'Enable debug mode')
  .option('--silent', 'Suppress output')
  .option('-c, --config <file>', 'Path to configuration file (e.g., mycli.json)');
```

---

## 🪝 The `preAction` Hook: Loading and Merging Configuration

A key feature of this CLI is the use of the `preAction` hook, which ensures that configuration is loaded and merged before any command runs. This is implemented in `src/utils/createProgram.js`:

```js
program.hook('preAction', (thisCommand) => {
  const globals = thisCommand.opts();
  const config = loadConfig(globals.config);
  // Merge global options with config, global options take precedence
  thisCommand.config = mergeConfigWithOptions(config, globals);
});
```

### What does `preAction` do?
- It runs before any command's action handler.
- It loads the configuration file (if specified) and merges it with global options from the command line.
- The merged result is attached to the command as `thisCommand.config`, making it available to all commands.

---

## 🧩 How the Merged Options Object is Built

The merging process combines options from three sources:
1. **Default configuration file** (`config/default.json`)
2. **User-specified configuration file** (via `--config`)
3. **Command-line options** (which take precedence)

This is handled by the following functions in `src/utils/configLoader.js`:

```js
function loadConfig(cliConfigPath) {
  // Loads default config, then overrides with user config if provided
}

function mergeConfigWithOptions(config, options) {
  // Command options take precedence over config
  return { ...config, ...options };
}
```

---

## 🔍 Accessing All Options in a Command

Each command can access the fully merged options using a single statement. For example, in `src/commands/build.js`:

```js
const { getMergedOptions } = require('../utils/getMergedOptions');

.action((options, command) => {
  const merged = getMergedOptions(command, options);
  // ... use merged options
})
```

### How does `getMergedOptions` work?
Defined in `src/utils/getMergedOptions.js`:

```js
function getMergedOptions(command, options) {
  let merged = mergeConfigWithOptions(command.parent.config, options);
  const allOptions = command.parent.options.concat(command.options);
  merged = normalizeFlags(merged, allOptions);
  return merged;
}
```
- It merges the parent (global) config with the command's options.
- It normalizes boolean flags so that all expected options are present (even if not set on the command line).

#### ✅ Boolean Normalization
From `src/utils/normalizeFlags.js`:
```js
function normalizeFlags(options, optionDefs) {
  const normalized = { ...options };
  optionDefs.forEach(opt => {
    if (!opt.required) {
      const name = opt.attributeName();
      if (typeof normalized[name] === 'undefined') {
        normalized[name] = false;
      }
    }
  });
  return normalized;
}
```
This ensures that all boolean flags are set to `false` if not provided.

---

## 📝 Example: The `build` Command

In `src/commands/build.js`:
```js
.action((options, command) => {
  const merged = getMergedOptions(command, options);
  console.log('Building project');
  console.log('Merged config:', merged);
})
```
This gives the command handler access to all options, regardless of whether they were set on the command line, in the config file, or are just defaults.

---

## 🏗️ Cascaded Configuration: Layered and Flexible

Many modern CLI tools and frameworks use a cascaded (layered) configuration approach. This means configuration can be defined in multiple places and is merged in a specific order of precedence, allowing for flexible and context-sensitive setups.

### 🏗️ How Cascaded Configuration Works
- **Defaults:** The tool provides built-in defaults.
- **Project-level config:** A file like `config/default.json`, `jest.config.js`, or `.eslintrc.json` in the project root can override defaults.
- **User-level config:** Some tools support user-level config files in the home directory (e.g., `~/.npmrc`).
- **Command-line options:** Explicit flags on the command line always take highest precedence.

### 🪝 Cascading in Practice: The preAction Hook
In this CLI, cascading configuration is implemented using the preAction hook from commander. This hook runs before any command's action handler and is responsible for loading and merging configuration from all sources.

#### 💻 Code Example: preAction Hook
```js
program.hook('preAction', (thisCommand) => {
  const globals = thisCommand.opts();
  const config = loadConfig(globals.config);
  // Merge global options with config, global options take precedence
  thisCommand.config = mergeConfigWithOptions(config, globals);
});
```

#### ❓ What Does This Code Do?
1. **Extracts global options** from the command line using `thisCommand.opts()`.
2. **Loads configuration** from the default config file and, if specified, a user config file via `loadConfig(globals.config)`.
3. **Merges** the loaded config with the global options using `mergeConfigWithOptions`, giving precedence to command-line options.
4. **Attaches** the merged configuration to the command object as `thisCommand.config`, making it available to all commands and subcommands.

#### 🔬 Drill Down: Involved Functions

- **loadConfig** (from `src/utils/configLoader.js`):
  ```js
  /**
   * Loads and merges configuration from the default config file and an optional user-specified config file.
   * @param {string} [cliConfigPath] - Path to a user-specified config file (e.g., from --config).
   * @returns {Object} The merged configuration object.
   */
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
  ```
  - Loads the default configuration file if it exists.
  - Loads a user-specified config file (if provided via `--config`) and merges it over the default config.
  - Returns the resulting config object.

- **mergeConfigWithOptions** (from `src/utils/configLoader.js`):
  ```js
  /**
   * Merges a configuration object with options, giving precedence to options.
   * @param {Object} config - The configuration object (from files).
   * @param {Object} options - The options object (from command-line/global options).
   * @returns {Object} The merged object, with options taking precedence over config.
   */
  function mergeConfigWithOptions(config, options) {
    // Command options take precedence over config
    return { ...config, ...options };
  }
  ```
  - Merges the config object with the options object, giving precedence to options (i.e., command-line arguments override config file values).

This cascading approach ensures that configuration is layered in the following order of precedence:
1. Defaults (lowest)
2. Project/user config files
3. Command-line options (highest)

### Examples from Popular Tools

#### Jest
- **Config file:** `jest.config.js` or `jest.config.json` in the project root.
- **Overrides:** You can override config with CLI flags, e.g.:
  ```sh
  jest --coverage --config=custom-jest.config.js
  ```
- **Cascade:** Jest merges its built-in defaults, the config file, and any CLI flags.

#### ESLint
- **Config file:** `.eslintrc.json`, `.eslintrc.js`, or `.eslintrc.yaml` in the project root.
- **User config:** Can also use `eslintConfig` in `package.json`.
- **Overrides:** CLI flags like `--rule` or `--config` override file-based config.

#### Prettier
- **Config file:** `.prettierrc`, `.prettierrc.json`, `.prettierrc.yaml`, `.prettierrc.yml`, `.prettierrc.toml`, or `prettier.config.js`.
- **Cascade:** Prettier merges config from files, `package.json`, and CLI flags.

#### NPM
- **Config file:** `.npmrc` at project, user, or global level.
- **Cascade:** NPM merges config from global, user, and project `.npmrc` files, with CLI flags taking precedence.

#### Poetry (Python)
- **Config file:** `pyproject.toml` in the project root.
- **Cascade:** Poetry uses `pyproject.toml` for all project configuration.

#### Cargo (Rust)
- **Config file:** `Cargo.toml` in the project root.
- **Cascade:** Cargo uses `Cargo.toml` for all project configuration.

### Benefits of Cascaded Configuration
- **Flexibility:** Users can set global, project, or command-specific settings as needed.
- **Override Capability:** Temporary or context-specific changes are easy via CLI flags.
- **Best of Both Worlds:** Combines convenience of defaults with the power of explicit overrides.

### Cascaded Configuration in This CLI
This CLI follows a similar pattern:
1. Loads built-in defaults from `config/default.json`.
2. Loads user-specified config via `--config`.
3. Applies command-line options, which always take precedence.

This approach ensures that users have a flexible, powerful, and DRY configuration experience, just like with popular tools such as Jest, ESLint, and Prettier.

---

## Choosing Configuration File Extensions and Priority

Many tools support multiple configuration file formats and extensions, such as `.config.js`, `.json`, `.yaml`, `.yml`, `.toml`, `.rc`, or even fields in `package.json`. The choice of extension and format can affect flexibility, portability, and maintainability.

### Common Configuration File Extensions
- `.js` or `.config.js`: JavaScript-based config, allows dynamic logic (e.g., `jest.config.js`, `babel.config.js`).
- `.json`: Pure data, easy to read and parse, but no comments or logic (e.g., `tsconfig.json`, `.eslintrc.json`).
- `.yaml` / `.yml`: Human-friendly, supports comments, used by tools like GitHub Actions and Docker Compose.
- `.toml`: A minimal, easy-to-read format with strong typing, used by tools like Python Poetry (`pyproject.toml`), Rust Cargo (`Cargo.toml`), and Prettier (`.prettierrc.toml`).
- `.rc`: Short for "run commands" or "resource config", often a plain text or JSON file (e.g., `.npmrc`, `.eslintrc`).
- `package.json`: Some tools allow config as a field in `package.json` (e.g., `eslintConfig`, `babel`).

### How Tools Prioritize Config Files
When multiple config files exist for the same tool but with different extensions, tools typically use a priority order. For example:
- **ESLint:** `.eslintrc.js` > `.eslintrc.cjs` > `.eslintrc.yaml` > `.eslintrc.yml` > `.eslintrc.json` > `.eslintrc` > `eslintConfig` in `package.json`
- **Prettier:** `prettier.config.js` > `.prettierrc.js` > `.prettierrc.toml` > `.prettierrc.yaml` > `.prettierrc.yml` > `.prettierrc.json` > `.prettierrc`
- **Jest:** `jest.config.js` > `jest.config.cjs` > `jest.config.mjs` > `jest.config.json`
- **Poetry:** `pyproject.toml` only
- **Cargo:** `Cargo.toml` only

The first file found in the priority order is used, and others are ignored.

### When to Use Each Format

| Extension         | Recommended Context                                                                                 |
|------------------|----------------------------------------------------------------------------------------------------|
| `.js`/`.config.js`| When you need dynamic logic, computed values, or environment-based config                          |
| `.json`          | For simple, static configuration that benefits from strict structure and easy machine parsing       |
| `.yaml`/`.yml`   | For human-friendly, commentable config, especially for complex or nested settings                  |
| `.toml`          | For strongly-typed, minimal, and readable config, especially if your tool/ecosystem recommends it  |
| `.rc`            | For legacy or simple key-value config, or when following tool conventions                          |
| `package.json`   | For small, project-wide config to reduce file clutter (avoid for large or complex settings)         |

### When to Avoid Certain Formats

| Extension         | Avoid When...                                                                                      |
|------------------|----------------------------------------------------------------------------------------------------|
| `.js`/`.config.js`| You want your config to be portable to non-JS environments or need to share it as pure data        |
| `.json`          | You need comments or dynamic values                                                                |
| `.yaml`/`.yml`   | You require strict validation or are concerned about indentation errors                            |
| `.toml`          | Your toolchain/team is unfamiliar with the format or you need advanced features not in TOML         |
| `package.json`   | The config is large or frequently changing, as it can become unwieldy                              |

### Best Practices
- **Follow tool documentation:** Use the recommended config file and extension for each tool.
- **Be explicit:** If your tool supports a `--config` flag, use it to specify the desired config file.
- **Keep it simple:** Prefer the simplest format that meets your needs.
- **Avoid duplicates:** Remove unused config files to prevent confusion.
- **Document your choice:** If your project supports multiple config formats, document which one is used and why.

### Examples from Popular Tools

| Tool            | Supported Configuration Files/Formats                                                                                       |
|-----------------|----------------------------------------------------------------------------------------------------------------------------|
| ESLint          | `.eslintrc.js`, `.eslintrc.json`, `.eslintrc.yaml`, `.eslintrc.yml`, `.eslintrc`, `eslintConfig` in `package.json`          |
| Prettier        | `prettier.config.js`, `.prettierrc.js`, `.prettierrc.toml`, `.prettierrc.json`, `.prettierrc.yaml`, `.prettierrc.yml`, `.prettierrc` |
| Jest            | `jest.config.js`, `jest.config.cjs`, `jest.config.mjs`, `jest.config.json`                                                  |
| Babel           | `babel.config.js`, `.babelrc`, `.babelrc.js`, `.babelrc.json`, `babel` in `package.json`                                    |
| Stylelint       | `.stylelintrc`, `.stylelintrc.json`, `.stylelintrc.yaml`, `.stylelintrc.yml`, `.stylelintrc.js`, `stylelint` in `package.json` |
| Poetry (Python) | `pyproject.toml`                                                                                                            |
| Cargo (Rust)    | `Cargo.toml`                                                                                                               |

---

## Summary

- Global options (like `--config`, `--verbose`, `--debug`, `--silent`) are defined at the top level and inherited by all commands.
- The `preAction` hook loads and merges configuration before any command runs.
- The merging process combines defaults, config file, and command-line options, with command-line options taking precedence.
- Each command accesses all relevant options with a single statement, ensuring consistent and flexible configuration.
- Using a global `--config` option is a pragmatic, DRY-aligned choice for most workflows, while command-level config is possible but less common and more error-prone.
- Cascaded configuration, as used in this CLI and many popular tools, provides a layered, flexible, and user-friendly way to manage settings.
- Choosing the right config file extension and format depends on your needs, tool conventions, and best practices—always prioritize clarity, maintainability, and explicitness.
- The `.toml` format is increasingly popular for its readability and strong typing, especially in Python and Rust ecosystems, and is now supported by tools like Prettier as well.

---

## Appendix I: 📟 CLI Help Output Examples

Below are example outputs for the `-h` (help) flag at the CLI level and for individual commands. These outputs demonstrate how users can discover available commands, options, and usage patterns.

### Top-Level CLI Help (`mycli -h`)

```sh
Usage: mycli [options] [command]

A CLI tool powered by commander

Options:
  -c, --config <file> Path to configuration file (e.g., mycli.json)
  --debug             Enable debug mode
  -h, --help          display help for command
  --silent            Suppress output
  -V, --version       output the version number
  --verbose           Enable verbose output

Commands:
  add                 Add something to the project
  build               Build the project
  help [command]      display help for command
  <command> [options] ...
```

### Command-Level Help (`mycli build -h`)

```sh
Usage: mycli build [options]

Build the project

Options:
  --clear               Clear before adding
  -d,--docs <path>      Path to the docs directory (default: "docs")
  -s --sidebars <file>  Path to the sidebars file (default: "sidebars.js")

Global options:
  -c, --config <file>   Path to configuration file (e.g., mycli.json)
  --debug               Enable debug mode
  -h, --help            display help for command
  --silent              Suppress output
  -V, --version         output the version number
  --verbose             Enable verbose output
```

> Note: The actual output may vary depending on the commands and options defined in your CLI. The above examples are representative of a typical setup using commander.
