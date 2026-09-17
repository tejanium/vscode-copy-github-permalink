## [v1.1.0]

### Enhancements
- `copy-github-permalink.branch` is now a dropdown: `default` (the remote's default branch, detected automatically; now the default), `HEAD`, or `custom`.
- New `copy-github-permalink.customBranch` setting for the `custom` option.
- The "Copied permalink" message now shows the resolved branch, e.g. `origin/main`.

### Compatibility
- A literal ref left in `copy-github-permalink.branch` from earlier versions (e.g. `origin/main`) keeps working as a custom branch.
- Requires VS Code 1.90 or newer.

### Internal
- Also published to [Open VSX](https://open-vsx.org/extension/tejanium/copy-github-permalink).
- Toolchain refresh: esbuild instead of webpack, TypeScript 5, ESLint 9, `@vscode/test-cli`, npm instead of yarn, GitHub Actions instead of Azure Pipelines, no runtime dependencies.

## [v1.0.3]

### Enhancements
- Omit end line from GitHub URL hash for single line selections by @dcapo

## [v1.0.2]

### Fixed
- Broken URL if git remote is HTTP or HTTPS

## [v1.0.1]

- README

## [v1.0.0]

- Initial release
