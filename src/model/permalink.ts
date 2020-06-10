import * as vscode from 'vscode';
import { dirname } from 'path';
import { Git } from '../api/git';

export class Permalink {
	private git: Git;

	constructor(private editor: vscode.TextEditor) {
		this.git = new Git(dirname(this.editor.document.fileName));
	}

	async get(branch: string): Promise<string> {
		const { domain, owner, name } = await this.git.config();
		const { sha } = await this.git.shaMaster(branch);

		const start = this.editor.selection.start.line + 1;
		const end = this.editor.selection.end.line + 1;

		const file = vscode.workspace.asRelativePath(this.editor.document.uri);

		return `https://${domain}/${owner}/${name}/blob/${sha}/${file}#L${start}-L${end}`;
	}
}
