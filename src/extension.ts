import * as vscode from 'vscode';
import { Permalink } from './model/permalink';
import clipboardy = require('clipboardy');

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('copy-github-permalink.copy', async () => {
		const editor = vscode.window.activeTextEditor;

		if (editor && editor.document.uri.scheme === 'file') {
			const permalink = new Permalink(editor);
			const branch = getBranch();

			// try {
				const url = await permalink.get(branch);

				clipboardy.writeSync(url);
				vscode.window.showInformationMessage(`Copied permalink to ${branch}.`);
			// } catch (error) {
				// vscode.window.showWarningMessage(error.message);
			// }
		}
	});

	context.subscriptions.push(disposable);
}

function getBranch(): string {
	return vscode.workspace.getConfiguration('copy-github-permalink').get('branch') || 'origin/master';
}

export function deactivate() {}
