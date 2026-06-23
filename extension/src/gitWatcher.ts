import * as vscode from 'vscode';
import { CompanionClient } from './companionClient';

export class GitWatcher {
  private lastCommitHash: string | undefined;

  constructor(private client: CompanionClient) {}

  start(context: vscode.ExtensionContext): void {
    const pollInterval = setInterval(() => this.checkCommits(), 10000);
    context.subscriptions.push({ dispose: () => clearInterval(pollInterval) });
    this.checkCommits();
  }

  private async checkCommits(): Promise<void> {
    const gitExtension = vscode.extensions.getExtension('vscode.git');
    if (!gitExtension?.isActive) {
      await gitExtension?.activate();
    }
    if (!gitExtension?.exports) return;

    const git = gitExtension.exports.getAPI(1);
    if (!git?.repositories?.length) return;

    for (const repo of git.repositories) {
      try {
        const log = await repo.log({ maxEntries: 1 });
        const latest = log[0];
        if (!latest) continue;

        const hash = latest.hash;
        if (this.lastCommitHash && hash !== this.lastCommitHash) {
          this.client.sendEvent({
            type: 'git:commit',
            timestamp: Date.now(),
            payload: {
              commitMessage: latest.message.split('\n')[0],
            },
          });
        }
        this.lastCommitHash = hash;
      } catch {
        // Git repo may not be ready
      }
    }
  }
}
