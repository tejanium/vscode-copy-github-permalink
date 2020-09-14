import * as vscode from 'vscode';
import { Document } from './model/document';
import { Permalink } from './model/permalink';

export function activate(context: vscode.ExtensionContext) {
	let copy = vscode.commands.registerCommand('copy-github-permalink.copy', async () => {
		const editor = vscode.window.activeTextEditor;

		if (editor && editor.document.uri.scheme === 'file') {
			const permalink = new Permalink(editor);
			const branch = getBranch();

			try {
				const url = await permalink.get(branch);

				vscode.env.clipboard.writeText(url);
				vscode.window.showInformationMessage(`Copied permalink to ${branch}.`);
			} catch (error) {
				vscode.window.showWarningMessage(error.message);
			}
		}
	});

	context.subscriptions.push(copy);

	let view = vscode.commands.registerCommand('copy-github-permalink.view', async () => {
		const input = await vscode.window.showInputBox();

		if (input) {
			const document = new Document(input);

			vscode.window.showTextDocument(await document.document(), document.showOptions);
		}
	});

	context.subscriptions.push(view);
}

function getBranch(): string {
	return vscode.workspace.getConfiguration('copy-github-permalink').get('branch') || 'origin/master';
}

export function deactivate() {}
