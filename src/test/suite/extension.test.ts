import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { before, beforeEach, afterEach } from 'mocha';
import assert = require('assert');

const mockSpawn = require('mock-spawn')();
require('child_process').spawn = mockSpawn;

function mockGit(config: string = 'git@github.com:owner/name.git', sha: string = 'sha1234567890'): void {
	mockSpawn.setStrategy(function (_command: string, args: Array<string>) {
		const branch = vscode.workspace.getConfiguration('copy-github-permalink').get('branch');

		if (args.join(',') === ['config', '--get', 'remote.origin.url'].join(',')) {
			return mockSpawn.simple(0, config);
		}

		if (args.join(',') === ['rev-parse', branch].join(',')) {
			const blame = `${sha} `;

			return mockSpawn.simple(0, blame);
		}
	});
}

function configureBranch(sandbox: sinon.SinonSandbox, branch: string): void {
	sandbox.stub(vscode.workspace, 'getConfiguration').returns({
		get: (_key: string) => branch
	} as vscode.WorkspaceConfiguration);
};

suite('Test commands', () => {
	let sandbox: sinon.SinonSandbox;

	before(async () => {
		const root = vscode.workspace.workspaceFolders![0].uri.fsPath;
		const document = await vscode.workspace.openTextDocument(`${root}/test/fixtures/file.txt`);
		await vscode.window.showTextDocument(document);
	});

	beforeEach(async () => {
		sandbox = sinon.createSandbox();
	});

	afterEach(() => {
		sandbox.restore();
	});

	suite('copy-github-permalink.copy', () => {
		test('Display copied information and put the link to clipboard', async () => {
			const infoStub = sandbox.stub(vscode.window, 'showInformationMessage') as sinon.SinonStub<[string, any?], Thenable<string | undefined>>;

			configureBranch(sandbox, 'HEAD');
			mockGit();

			await vscode.commands.executeCommand('copy-github-permalink.copy');

			sandbox.assert.calledWith(infoStub, 'Copied permalink to HEAD.');
			assert.strictEqual(await vscode.env.clipboard.readText(), 'https://github.com/owner/name/blob/sha1234567890/test/fixtures/file.txt#L1');
		});

		test('Git remote is HTTP', async () => {
			const infoStub = sandbox.stub(vscode.window, 'showInformationMessage') as sinon.SinonStub<[string, any?], Thenable<string | undefined>>;

			configureBranch(sandbox, 'HEAD');
			mockGit('http://github.com/owner/name.git');

			await vscode.commands.executeCommand('copy-github-permalink.copy');

			sandbox.assert.calledWith(infoStub, 'Copied permalink to HEAD.');
			assert.strictEqual(await vscode.env.clipboard.readText(), 'https://github.com/owner/name/blob/sha1234567890/test/fixtures/file.txt#L1');
		});

		test('Git remote is HTTPS', async () => {
			const infoStub = sandbox.stub(vscode.window, 'showInformationMessage') as sinon.SinonStub<[string, any?], Thenable<string | undefined>>;

			configureBranch(sandbox, 'HEAD');
			mockGit('https://github.com/owner/name.git');

			await vscode.commands.executeCommand('copy-github-permalink.copy');

			sandbox.assert.calledWith(infoStub, 'Copied permalink to HEAD.');
			assert.strictEqual(await vscode.env.clipboard.readText(), 'https://github.com/owner/name/blob/sha1234567890/test/fixtures/file.txt#L1');
		});

		test('Display copied information and put the link of all lines to clipboard', async () => {
			const infoStub = sandbox.stub(vscode.window, 'showInformationMessage') as sinon.SinonStub<[string, any?], Thenable<string | undefined>>;

			configureBranch(sandbox, 'HEAD');
			mockGit();

			await vscode.commands.executeCommand('editor.action.selectAll');
			await vscode.commands.executeCommand('copy-github-permalink.copy');

			sandbox.assert.calledWith(infoStub, 'Copied permalink to HEAD.');
			assert.strictEqual(await vscode.env.clipboard.readText(), 'https://github.com/owner/name/blob/sha1234567890/test/fixtures/file.txt#L1-L3');
		});

		test('Select another branch', async () => {
			const infoStub = sandbox.stub(vscode.window, 'showInformationMessage') as sinon.SinonStub<[string, any?], Thenable<string | undefined>>;

			configureBranch(sandbox, 'origin/master');
			mockGit();

			await vscode.commands.executeCommand('copy-github-permalink.copy');

			sandbox.assert.calledWith(infoStub, 'Copied permalink to origin/master.');
			assert.strictEqual(await vscode.env.clipboard.readText(), 'https://github.com/owner/name/blob/sha1234567890/test/fixtures/file.txt#L1-L3');
		});

		test('Cannot get git information', async () => {
			const warningStub = sandbox.stub(vscode.window, 'showWarningMessage') as sinon.SinonStub<[string, any?], Thenable<string | undefined>>;

			configureBranch(sandbox, 'origin/master');
			mockGit('');

			await vscode.commands.executeCommand('copy-github-permalink.copy');

			sandbox.assert.calledWith(warningStub, 'Could not get Git info, please try a little later');
		});
	});
});
