# VSCode Copy Github Permalink

[![CI](https://github.com/tejanium/vscode-copy-github-permalink/actions/workflows/ci.yml/badge.svg)](https://github.com/tejanium/vscode-copy-github-permalink/actions/workflows/ci.yml)
[![GitHub release](https://img.shields.io/github/v/release/tejanium/vscode-copy-github-permalink)](https://github.com/tejanium/vscode-copy-github-permalink/releases)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/tejanium.copy-github-permalink)](https://marketplace.visualstudio.com/items?itemName=tejanium.copy-github-permalink)

## Features

Copy Github's permalink of particular line. This is useful if you want to show piece of code in Github's comment.

There are tons of similar extension, but they always using HEAD's SHA which might or might not exist in Github.

This extension by default copies a permalink to your remote's default branch (`origin/main`, `origin/master`, `origin/trunk`, whatever it is), detected automatically, because that guarantees the permalink is valid. You can switch it to your current `HEAD` or to any branch you name.

To activate, enter these commands in the Command Palette:

- `copy-github-permalink.copy`: Copy permalink of the selected line.

## Extension Settings

* `copy-github-permalink.branch`: Which branch the permalink's SHA is taken from. Default: `default`
  * `default`: the remote's default branch, detected from `refs/remotes/origin/HEAD` (falls back to `git ls-remote`). If detection fails, run `git remote set-head origin -a` once in that repo.
  * `HEAD`: your current checkout. The SHA may not exist on GitHub yet if it hasn't been pushed.
  * `custom`: the branch named in `copy-github-permalink.customBranch`.
* `copy-github-permalink.customBranch`: Branch or ref used when `branch` is `custom`, e.g. `origin/release`. Default: `origin/master`

A literal ref in `copy-github-permalink.branch` from older versions (e.g. `origin/main`) still works and is treated as a custom branch.

## Development

Requires Node 22 (see `.nvmrc`).

```sh
npm install
npm run compile   # type-check, lint, bundle with esbuild
npm test          # runs the suite inside a downloaded VS Code
```

Press F5 in VS Code to launch the extension in a development host.

### Releasing

Pushing a `v*` tag runs the test matrix, builds one `.vsix`, publishes it to the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=tejanium.copy-github-permalink) and [Open VSX](https://open-vsx.org/extension/tejanium/copy-github-permalink), and attaches it to the GitHub release. The workflow needs two repository secrets:

| Secret | Where to get it |
|---|---|
| `VSCE_PAT` | Azure DevOps personal access token with the Marketplace (Manage) scope |
| `OVSX_PAT` | Open VSX access token from your [user settings](https://open-vsx.org/user-settings/tokens). The `tejanium` namespace must be created once with `npx ovsx create-namespace tejanium -p <token>`. |

The same steps run locally with `npm run vsix && npm run deploy` given `VSCE_PAT` and `OVSX_PAT` in the environment.
