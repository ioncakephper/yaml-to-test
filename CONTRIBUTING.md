# Contributing to TestWeaver

First off, thank you for considering contributing to `testweaver`! It's people like you that make open source such a great community. We welcome any form of contribution, from reporting bugs and suggesting features to submitting code changes.

## Table of Contents

- How Can I Contribute?
  - Reporting Bugs
  - Suggesting Enhancements
  - Submitting Pull Requests
- Getting Started: Development Setup
- Pull Request Process
- Coding Standards
  - Code Style
  - Commit Messages
- Code of Conduct

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please open an issue on our GitHub Issues page.

When filing a bug report, please include:
- A clear and descriptive title.
- A detailed description of the problem, including steps to reproduce it.
- What you expected to happen and what actually happened.
- Information about your environment (e.g., Node.js version, OS).

### Suggesting Enhancements

If you have an idea for a new feature or an improvement to an existing one, you can open an issue or start a discussion on our GitHub Discussions page.

Please provide:
- A clear description of the proposed enhancement.
- An explanation of why this enhancement would be useful.
- Any relevant code snippets or mockups.

### Submitting Pull Requests

We love pull requests! If you're ready to contribute code, please follow the Pull Request Process outlined below.

## Getting Started: Development Setup

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/YOUR_USERNAME/testweaver.git
    ```
3.  **Navigate to the project directory**:
    ```bash
    cd testweaver
    ```
4.  **Install dependencies**:
    ```bash
    npm install
    ```
5.  **Link the package** to use your local version of the CLI globally:
    ```bash
    npm link
    ```
    Now you can run `testweaver` commands in your terminal, and it will use your local code.

6.  **Run tests** to make sure everything is set up correctly:
    ```bash
    npm test
    ```

## Pull Request Process

1.  Create a new branch from the `main` branch for your feature or bugfix:
    ```bash
    git checkout -b feature/your-amazing-feature
    ```
2.  Make your code changes. Remember to follow the Coding Standards.
3.  Add or update tests as necessary.
4.  Ensure all tests pass by running `npm test`.
5.  Commit your changes using a descriptive commit message that follows our commit message guidelines.
6.  Push your branch to your fork on GitHub:
    ```bash
    git push origin feature/your-amazing-feature
    ```
7.  Open a pull request to the `main` branch of the original `ioncakephper/testweaver` repository.
8.  In your pull request description, clearly explain the changes you've made and link to any relevant issues.

## Coding Standards

### Code Style

-   Please follow the existing code style. We aim for clean, readable, and well-documented code.
-   Use JSDoc comments for all functions, explaining what they do, their parameters, and what they return.
-   When adding logs, please follow the existing lowercase convention for consistency (e.g., `log('an event happened', LOG_LEVELS.INFO)`).

### Commit Messages

We use Conventional Commits to keep our commit history clean and organized. Please format your commit messages as follows:

```
<type>[optional scope]: <description>
```

**Example:** `feat: add support for custom output directories`

Common types include: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

## Code of Conduct

To ensure a welcoming and inclusive environment, we expect all contributors to adhere to a code of conduct. Please be respectful and considerate in all your interactions within the community. Harassment or exclusionary behavior will not be tolerated.