import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';

// Replace `child_process.spawn` on the real module object. `Git` looks it up at call time,
// so every git invocation in these tests goes through the mock.
const mockSpawn = require('mock-spawn')();
require('child_process').spawn = mockSpawn;

const SHA = 'sha1234567890';
const FILE_URL = `https://github.com/owner/name/blob/${SHA}/file.txt`;

interface GitMock {
	config?: string;
	/** The ref `rev-parse` is expected to be called with. */
	ref?: string;
	/** Output of `symbolic-ref --short refs/remotes/origin/HEAD`, or `null` to make it fail. */
	symbolicRef?: string | null;
	/** Output of `ls-remote --symref origin HEAD`, or `null` to make it fail. */
	lsRemote?: string | null;
}

function mockGit({ config = 'git@github.com:owner/name.git', ref = 'HEAD', symbolicRef = 'origin/master', lsRemote = null }: GitMock = {}): void {
	mockSpawn.setStrategy(function (_command: string, args: Array<string>) {
		const command = args.join(' ');

		if (command === 'config --get remote.origin.url') {
			return mockSpawn.simple(0, config);
		}

		if (command === 'symbolic-ref --short refs/remotes/origin/HEAD') {
			return symbolicRef === null
				? mockSpawn.simple(128, '', 'fatal: ref refs/remotes/origin/HEAD is not a symbolic ref')
				: mockSpawn.simple(0, `${symbolicRef}\n`);
		}

		if (command === 'ls-remote --symref origin HEAD') {
			return lsRemote === null
				? mockSpawn.simple(128, '', "fatal: 'origin' does not appear to be a git repository")
				: mockSpawn.simple(0, lsRemote);
		}

		if (command === `rev-parse ${ref}`) {
			return mockSpawn.simple(0, `${SHA} `);
		}

		return mockSpawn.simple(128, '', `fatal: unexpected git command: ${command}`);
	});
}

function configure(sandbox: sinon.SinonSandbox, settings: { branch?: string, customBranch?: string }): void {
	sandbox.stub(vscode.workspace, 'getConfiguration').returns({
		get: (key: string) => (settings as Record<string, string | undefined>)[key]
	} as vscode.WorkspaceConfiguration);
}

type MessageStub = sinon.SinonStub<[string, ...unknown[]], Thenable<string | undefined>>;

function stubInfo(sandbox: sinon.SinonSandbox): MessageStub {
	return sandbox.stub(vscode.window, 'showInformationMessage') as unknown as MessageStub;
}

function stubWarning(sandbox: sinon.SinonSandbox): MessageStub {
	return sandbox.stub(vscode.window, 'showWarningMessage') as unknown as MessageStub;
}

suite('copy-github-permalink.copy', () => {
	let sandbox: sinon.SinonSandbox;

	suiteSetup(async () => {
		const root = vscode.workspace.workspaceFolders![0].uri.fsPath;
		const document = await vscode.workspace.openTextDocument(`${root}/file.txt`);
		await vscode.window.showTextDocument(document);
	});

	setup(async () => {
		sandbox = sinon.createSandbox();
		await vscode.commands.executeCommand('cursorTop');
	});

	teardown(() => {
		sandbox.restore();
	});

	test('Display copied information and put the link to clipboard', async () => {
		const infoStub = stubInfo(sandbox);

		configure(sandbox, { branch: 'HEAD' });
		mockGit({ ref: 'HEAD' });

		await vscode.commands.executeCommand('copy-github-permalink.copy');

		sandbox.assert.calledWith(infoStub, 'Copied permalink to HEAD.');
		assert.strictEqual(await vscode.env.clipboard.readText(), `${FILE_URL}#L1`);
	});

	test('Git remote is HTTP', async () => {
		const infoStub = stubInfo(sandbox);

		configure(sandbox, { branch: 'HEAD' });
		mockGit({ config: 'http://github.com/owner/name.git' });

		await vscode.commands.executeCommand('copy-github-permalink.copy');

		sandbox.assert.calledWith(infoStub, 'Copied permalink to HEAD.');
		assert.strictEqual(await vscode.env.clipboard.readText(), `${FILE_URL}#L1`);
	});

	test('Git remote is HTTPS', async () => {
		const infoStub = stubInfo(sandbox);

		configure(sandbox, { branch: 'HEAD' });
		mockGit({ config: 'https://github.com/owner/name.git' });

		await vscode.commands.executeCommand('copy-github-permalink.copy');

		sandbox.assert.calledWith(infoStub, 'Copied permalink to HEAD.');
		assert.strictEqual(await vscode.env.clipboard.readText(), `${FILE_URL}#L1`);
	});

	test('Display copied information and put the link of all lines to clipboard', async () => {
		const infoStub = stubInfo(sandbox);

		configure(sandbox, { branch: 'HEAD' });
		mockGit();

		await vscode.commands.executeCommand('editor.action.selectAll');
		await vscode.commands.executeCommand('copy-github-permalink.copy');

		sandbox.assert.calledWith(infoStub, 'Copied permalink to HEAD.');
		assert.strictEqual(await vscode.env.clipboard.readText(), `${FILE_URL}#L1-L3`);
	});

	test('Default branch detected from the local symbolic ref', async () => {
		const infoStub = stubInfo(sandbox);

		configure(sandbox, { branch: 'default' });
		mockGit({ ref: 'origin/main', symbolicRef: 'origin/main' });

		await vscode.commands.executeCommand('copy-github-permalink.copy');

		sandbox.assert.calledWith(infoStub, 'Copied permalink to origin/main.');
		assert.strictEqual(await vscode.env.clipboard.readText(), `${FILE_URL}#L1`);
	});

	test('Default branch is used when nothing is configured', async () => {
		const infoStub = stubInfo(sandbox);

		configure(sandbox, {});
		mockGit({ ref: 'origin/master', symbolicRef: 'origin/master' });

		await vscode.commands.executeCommand('copy-github-permalink.copy');

		sandbox.assert.calledWith(infoStub, 'Copied permalink to origin/master.');
		assert.strictEqual(await vscode.env.clipboard.readText(), `${FILE_URL}#L1`);
	});

	test('Default branch falls back to ls-remote when the symbolic ref is missing', async () => {
		const infoStub = stubInfo(sandbox);

		configure(sandbox, { branch: 'default' });
		mockGit({ ref: 'origin/trunk', symbolicRef: null, lsRemote: `ref: refs/heads/trunk\tHEAD\n${SHA}\tHEAD\n` });

		await vscode.commands.executeCommand('copy-github-permalink.copy');

		sandbox.assert.calledWith(infoStub, 'Copied permalink to origin/trunk.');
		assert.strictEqual(await vscode.env.clipboard.readText(), `${FILE_URL}#L1`);
	});

	test('Default branch cannot be detected', async () => {
		const warningStub = stubWarning(sandbox);

		configure(sandbox, { branch: 'default' });
		mockGit({ symbolicRef: null, lsRemote: null });

		await vscode.commands.executeCommand('copy-github-permalink.copy');

		sandbox.assert.calledWith(warningStub, 'Could not detect the default branch of origin. Run `git remote set-head origin -a` or pick another option in the Copy Github Permalink settings.');
	});

	test('Custom branch', async () => {
		const infoStub = stubInfo(sandbox);

		configure(sandbox, { branch: 'custom', customBranch: 'origin/release' });
		mockGit({ ref: 'origin/release' });

		await vscode.commands.executeCommand('copy-github-permalink.copy');

		sandbox.assert.calledWith(infoStub, 'Copied permalink to origin/release.');
		assert.strictEqual(await vscode.env.clipboard.readText(), `${FILE_URL}#L1`);
	});

	test('Legacy literal branch value is treated as a custom branch', async () => {
		const infoStub = stubInfo(sandbox);

		configure(sandbox, { branch: 'origin/main' });
		mockGit({ ref: 'origin/main' });

		await vscode.commands.executeCommand('copy-github-permalink.copy');

		sandbox.assert.calledWith(infoStub, 'Copied permalink to origin/main.');
		assert.strictEqual(await vscode.env.clipboard.readText(), `${FILE_URL}#L1`);
	});

	test('Cannot get git information', async () => {
		const warningStub = stubWarning(sandbox);

		configure(sandbox, { branch: 'HEAD' });
		mockGit({ config: '' });

		await vscode.commands.executeCommand('copy-github-permalink.copy');

		sandbox.assert.calledWith(warningStub, 'Could not get Git info, please try a little later');
	});
});
