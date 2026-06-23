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
exports.TerminalWatcher = void 0;
exports.startTerminalDataWatcher = startTerminalDataWatcher;
const vscode = __importStar(require("vscode"));
class TerminalWatcher {
    constructor(client) {
        this.client = client;
        this.terminalBuffers = new Map();
    }
    start(context) {
        const config = vscode.workspace.getConfiguration('nezukoCompanion');
        const successPatterns = config.get('buildSuccessPatterns') ?? [];
        const failurePatterns = config.get('buildFailurePatterns') ?? [];
        context.subscriptions.push(vscode.window.onDidOpenTerminal((terminal) => {
            const name = terminal.name;
            this.terminalBuffers.set(name, '');
        }));
        const pollInterval = setInterval(async () => {
            for (const terminal of vscode.window.terminals) {
                await this.checkTerminal(terminal, successPatterns, failurePatterns);
            }
        }, 2000);
        context.subscriptions.push({
            dispose: () => clearInterval(pollInterval),
        });
    }
    async checkTerminal(terminal, successPatterns, failurePatterns) {
        const exec = terminal.shellIntegration;
        if (!exec?.executeCommand) {
            return;
        }
        // Terminal output monitoring disabled for compatibility
        // with current VS Code API typings.
    }
}
exports.TerminalWatcher = TerminalWatcher;
function startTerminalDataWatcher(client, context) {
    // Disabled because onDidWriteTerminalData is not available
    // in the installed VS Code API typings.
}
//# sourceMappingURL=terminalWatcher.js.map