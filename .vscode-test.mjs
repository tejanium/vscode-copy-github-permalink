import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/*.test.js',
	workspaceFolder: 'src/test/fixtures',
	launchArgs: ['--disable-extensions'],
	mocha: {
		ui: 'tdd',
		color: true,
		timeout: 20000,
	},
});
