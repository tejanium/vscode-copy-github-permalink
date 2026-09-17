import * as vscode from 'vscode';
import { dirname } from 'path';
import { Git } from '../api/git';

export class Permalink {
	private git: Git;

	constructor(private editor: vscode.TextEditor) {
		this.git = new Git(dirname(this.editor.document.fileName));
	}

	async get(): Promise<{ url: string, branch: string }> {
		const { domain, owner, name } = await this.git.config();
		const branch = await this.resolveBranch();
		const { sha } = await this.git.sha(branch);

		const start = this.editor.selection.start.line + 1;
		const end =
			this.editor.selection.end.line > this.editor.selection.start.line
				? `-L${this.editor.selection.end.line + 1}`
				: '';

		const file = vscode.workspace.asRelativePath(this.editor.document.uri);

		return { url: `https://${domain}/${owner}/${name}/blob/${sha}/${file}#L${start}${end}`, branch };
	}

	private async resolveBranch(): Promise<string> {
		const config = vscode.workspace.getConfiguration('copy-github-permalink');
		const mode = config.get<string>('branch') || 'default';

		switch (mode) {
			case 'HEAD':
				return 'HEAD';
			case 'default':
				return this.git.defaultBranch();
			case 'custom':
				return config.get<string>('customBranch') || 'origin/master';
			default:
				// Legacy: a literal ref such as `origin/main` from before the setting became a dropdown.
				return mode;
		}
	}
}
