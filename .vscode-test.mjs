import { defineConfig } from '@vscode/test-cli';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// VS Code creates a Unix socket inside the user-data dir. macOS caps socket paths at 103 chars,
// which the default `.vscode-test/user-data` under a deep checkout (e.g. GitHub runners) exceeds.
const userDataDir = mkdtempSync(join(tmpdir(), 'vsc-test-'));

export default defineConfig({
	files: 'out/test/*.test.js',
	workspaceFolder: 'src/test/fixtures',
	launchArgs: ['--disable-extensions', `--user-data-dir=${userDataDir}`],
	mocha: {
		ui: 'tdd',
		color: true,
		timeout: 20000,
	},
});
