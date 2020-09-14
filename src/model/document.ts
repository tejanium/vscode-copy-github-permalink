import * as vscode from 'vscode';

export class Document {
  private path: string | undefined;
  private position: string | undefined;

	constructor(private permalink: string) {
    [this.path, this.position] = this.relativePathWithLines.split('#') || [];
  }

  async document(): Promise<vscode.TextDocument> {
    const root = vscode.workspace.workspaceFolders![0].uri.fsPath;

    return await vscode.workspace.openTextDocument(`${root}/${this.path}`);
  }

  get showOptions(): vscode.TextDocumentShowOptions {
    const opts = { preview: false };

    if (this.position) {
      Object.assign(opts, { selection: this.range });
    }

    return opts;
  }

  private get relativePathWithLines(): string {
    return this.permalink.split('blob').pop()?.split('/').slice(2).join('/') || '';
  }

  private get range(): vscode.Range | undefined {
    const [start, end] = this.position?.split("-") || [];
    const startPosition = this.getPosition(start, -1);
    const endPosition = this.getPosition(end);

    return new vscode.Range(startPosition, endPosition);
  }

  private getPosition(raw: string | undefined, offset: number = 0) {
    const safeRaw = raw?.replace(/\D/g, '') || '0';

    return new vscode.Position(parseInt(safeRaw) + offset, 0);
  }
}
