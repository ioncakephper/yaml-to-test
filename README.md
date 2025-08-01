# TestWeaver

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js CI](https://github.com/ioncakephper/testweaver/actions/workflows/node.js.yml/badge.svg)](https://github.com/ioncakephper/testweaver/actions)
[![npm version](https://img.shields.io/npm/v/testweaver.svg)](https://www.npmjs.com/package/testweaver)
[![Issues](https://img.shields.io/github/issues/ioncakephper/testweaver.svg)](https://github.com/ioncakephper/testweaver/issues)
[![Discussions](https://img.shields.io/github/discussions/ioncakephper/testweaver.svg)](https://github.com/ioncakephper/testweaver/discussions)

A command-line utility that skillfully weaves Jest-compatible test files from simple, declarative YAML threads.

---

## Table of Contents

- [TestWeaver](#testweaver)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)
      - [Install via npm (recommended):](#install-via-npm-recommended)
      - [Or use npx (no global install required):](#or-use-npx-no-global-install-required)
      - [Or clone and run locally:](#or-clone-and-run-locally)
  - [Usage](#usage)
  - [Examples](#examples)
  - [Configuration](#configuration)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)

---

## Features

- Fast and reliable YAML to Jest test file generation
- Batch processing of multiple files and directories
- Customizable output options
- Input validation and error reporting
- Cross-platform support

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v14 or higher
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Steps

#### Install via npm (recommended):

```bash
npm install -g testweaver
```

#### Or use npx (no global install required):

```bash
npx yaml-to-test input.yaml output.test
```

#### Or clone and run locally:

```bash
git clone https://github.com/ioncakephper/yaml-to-test.git
cd yaml-to-test
npm install
npm link
```

---

## Usage

Convert a single YAML file:
```bash
yaml-to-test input.yaml output.test
```

Batch convert all YAML files in a directory:
```bash
yaml-to-test ./input_folder/*.yaml --output-dir ./output_folder/
```

Display help and all available options:
```bash
yaml-to-test --help
```

---

## Examples

Convert a single file:
```bash
yaml-to-test config.yaml config.test
```

Convert all YAML files in a directory:
```bash
yaml-to-test ./yamls/*.yaml --output-dir ./tests/
```

---

## Configuration

You can customize the conversion process using command-line flags or a configuration file. For all available options, run:
```bash
testweaver --help
```

---

## Contributing

We welcome contributions from the community! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started, code standards, and the process for submitting pull requests.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For questions, suggestions, or issues, please open an [issue](https://github.com/ioncakephper/testweaver/issues) or join the [Discussions](https://github.com/ioncakephper/testweaver/discussions) on this repository.

---