"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitWatcher = void 0;
const vscode = __importStar(require("vscode"));
class GitWatcher {
    constructor(client) {
        this.client = client;
    }
    start(context) {
        const pollInterval = setInterval(() => this.checkCommits(), 10000);
        context.subscriptions.push({ dispose: () => clearInterval(pollInterval) });
        this.checkCommits();
    }
    async checkCommits() {
        const gitExtension = vscode.extensions.getExtension('vscode.git');
        if (!gitExtension?.isActive) {
            await gitExtension?.activate();
        }
        if (!gitExtension?.exports)
            return;
        const git = gitExtension.exports.getAPI(1);
        if (!git?.repositories?.length)
            return;
        for (const repo of git.repositories) {
            try {
                const log = await repo.log({ maxEntries: 1 });
                const latest = log[0];
                if (!latest)
                    continue;
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
            }
            catch {
                // Git repo may not be ready
            }
        }
    }
}
exports.GitWatcher = GitWatcher;
//# sourceMappingURL=gitWatcher.js.map