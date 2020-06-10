const spawn = require('await-spawn');

export class Git {
	constructor(private cwd: string) { }

	async config(): Promise<{ domain: string, owner: string, name: string }> {
		const args = ['config', '--get', 'remote.origin.url'];

		try {
			const config = await this.git(args);

			return this.parseConfig(config);
		} catch (error) {
			if (error.code === 1) {
				throw Error('Git has no remote info');
			}

			throw Error(error.message);
		}
	}

	async shaMaster(branch: string): Promise<{ sha: string }> {
		const args = ['rev-parse', branch];
		const sha = await this.git(args);

		return { sha: sha.trim() };
	}

	private async git(args: Array<string>): Promise<string> {
		try {
			const git = await spawn('git', args, { cwd: this.cwd });

			return git.toString();
		} catch (error) {
			error.message = error.stderr?.toString() || error.message;

			throw error;
		}
	}

	private parseConfig(output: string): { domain: string, owner: string, name: string } {
		const [repoDomain, repoPath] = output.replace('\n', '').split(':');
		let domain, owner, name;

		if (repoDomain && repoPath) {
			domain = repoDomain.replace('git@', '');
			[owner, name] = repoPath.replace('.git', '').split('/');
		} else {
			throw Error('Could not get Git info, please try a little later');
		}

		return { domain, owner, name };
	}
}
