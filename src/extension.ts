import * as vscode from 'vscode';
import { Permalink } from './model/permalink';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('copy-github-permalink.copy', async () => {
		const editor = vscode.window.activeTextEditor;

		if (editor && editor.document.uri.scheme === 'file') {
			const permalink = new Permalink(editor);

			try {
				const { url, branch } = await permalink.get();

				vscode.env.clipboard.writeText(url);
				vscode.window.showInformationMessage(`Copied permalink to ${branch}.`);
			} catch (error) {
				vscode.window.showWarningMessage((error as Error).message);
			}
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
