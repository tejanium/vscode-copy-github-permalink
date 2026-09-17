import * as cp from 'child_process';

interface GitError extends Error {
	code?: number | null;
}

export class Git {
	constructor(private cwd: string) { }

	async config(): Promise<{ domain: string, owner: string, name: string }> {
		const args = ['config', '--get', 'remote.origin.url'];

		try {
			const config = await this.git(args);

			return this.parseConfig(config);
		} catch (error) {
			if ((error as GitError).code === 1) {
				throw Error('Git has no remote info');
			}

			throw Error((error as Error).message);
		}
	}

	async sha(branch: string): Promise<{ sha: string }> {
		const args = ['rev-parse', branch];
		const sha = await this.git(args);

		return { sha: sha.trim() };
	}

	/**
	 * Resolve the remote's default branch as a remote-tracking ref, e.g. `origin/main`.
	 *
	 * Reads the local `refs/remotes/origin/HEAD` symbolic ref first (set by `git clone`),
	 * and falls back to asking the remote via `ls-remote --symref` when it is missing.
	 */
	async defaultBranch(): Promise<string> {
		try {
			const ref = await this.git(['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']);

			return ref.trim();
		} catch {
			// Not a symbolic ref locally, ask the remote instead.
		}

		try {
			const output = await this.git(['ls-remote', '--symref', 'origin', 'HEAD']);
			const match = output.match(/^ref:\s+refs\/heads\/(\S+)\s+HEAD/m);

			if (match) {
				return `origin/${match[1]}`;
			}
		} catch {
			// Fall through to the error below.
		}

		throw Error('Could not detect the default branch of origin. Run `git remote set-head origin -a` or pick another option in the Copy Github Permalink settings.');
	}

	/**
	 * Run git and resolve with stdout. Rejects with a `GitError` carrying the exit code and
	 * stderr as the message when git exits non-zero.
	 */
	private git(args: Array<string>): Promise<string> {
		return new Promise((resolve, reject) => {
			// Looked up at call time (not imported as a binding) so tests can swap `child_process.spawn`.
			const child = cp.spawn('git', args, { cwd: this.cwd });
			let stdout = '';
			let stderr = '';

			child.stdout?.on('data', (data: Buffer) => { stdout += data.toString(); });
			child.stderr?.on('data', (data: Buffer) => { stderr += data.toString(); });

			child.on('error', reject);
			child.on('close', (code) => {
				if (code === 0) {
					resolve(stdout);
				} else {
					const error: GitError = new Error(stderr || `git exited with code ${code}`);
					error.code = code;
					reject(error);
				}
			});
		});
	}

	private parseConfig(output: string): { domain: string, owner: string, name: string } {
		const normalizedOutput = output.replace(/(\s+|git@|http(s)?:\/\/|\.git)/g, '').replace(':', '/');

		if (!normalizedOutput) {
			throw Error('Could not get Git info, please try a little later');
		}

		const [domain, owner, name] = normalizedOutput.split('/');

		return { domain, owner, name };
	}
}
