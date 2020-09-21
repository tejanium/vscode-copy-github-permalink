# VSCode Copy Github Permalink

[![Build Status](https://dev.azure.com/tejanium/vscode-copy-github-permalink/_apis/build/status/tejanium.vscode-copy-github-permalink?branchName=master)](https://dev.azure.com/tejanium/vscode-copy-github-permalink/_build/latest?definitionId=4&branchName=master)
[![David](https://img.shields.io/david/tejanium/vscode-copy-github-permalink)](https://david-dm.org/tejanium/vscode-copy-github-permalink)
[![David](https://img.shields.io/david/dev/tejanium/vscode-copy-github-permalink)](https://david-dm.org/tejanium/vscode-copy-github-permalink?type=dev)
[![GitHub release](https://img.shields.io/github/v/release/tejanium/vscode-copy-github-permalink)](https://github.com/tejanium/vscode-copy-github-permalink/releases)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/tejanium.copy-github-permalink)](https://marketplace.visualstudio.com/items?itemName=tejanium.copy-github-permalink)

## Features

Copy Github's permalink of particular line. This is useful if you want to show piece of code in Github's comment.

There are tons of similar extension, but they always using HEAD's SHA which might or might not exist in Github.

This extension by default will copy permalink to your `origin/master` because it guarantee the permalink is valid, but you can configure it to point to your current `HEAD` if you want.

To activate, enter these commands in the Command Palette:

- `copy-github-permalink.copy`: Copy permalink of the selected line.
- `copy-github-permalink.view`: View and open Github's permalink in VS Code.

## Extension Settings

* `copy-github-permalink.branch`: Branch of where the permalink will pointed to. Default: `origin/master`
