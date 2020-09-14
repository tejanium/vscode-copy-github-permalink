import * as vscode from 'vscode';
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
		const input = await vscode.window.showInputBox()
		const [blob, position] = input?.split("blob").pop()?.split("/").slice(2).join("/").split("#") || [];

		if (blob) {
			const uri = await vscode.workspace.findFiles(`**/${blob}`);
			const textDocument = await vscode.workspace.openTextDocument(uri[0]);
			const opts = { preview: false }

			if (position) {
				const [start, end] = position.replace(/L/g, "").split("-");
				const startPosition = new vscode.Position(parseInt(start) - 1, 0);
				const endPosition = new vscode.Position(parseInt(end), 0);
				const range = new vscode.Range(startPosition, endPosition);

				Object.assign(opts, { selection: range })
			}

			vscode.window.showTextDocument(textDocument, opts)
		}
	});

	context.subscriptions.push(view);
}

function getBranch(): string {
	return vscode.workspace.getConfiguration('copy-github-permalink').get('branch') || 'origin/master';
}

export function deactivate() {}
