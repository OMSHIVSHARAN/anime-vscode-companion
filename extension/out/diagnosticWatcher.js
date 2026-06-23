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
exports.DiagnosticWatcher = void 0;
const vscode = __importStar(require("vscode"));
class DiagnosticWatcher {
    constructor(client) {
        this.client = client;
        this.lastErrorCount = 0;
    }
    start(context) {
        context.subscriptions.push(vscode.languages.onDidChangeDiagnostics(() => {
            const allDiagnostics = vscode.languages.getDiagnostics();
            let errorCount = 0;
            let firstErrorFile;
            for (const [uri, diags] of allDiagnostics) {
                const errors = diags.filter((d) => d.severity === vscode.DiagnosticSeverity.Error);
                errorCount += errors.length;
                if (errors.length > 0 && !firstErrorFile) {
                    firstErrorFile = uri.fsPath.split(/[/\\]/).pop();
                }
            }
            if (errorCount > this.lastErrorCount) {
                this.client.sendEvent({
                    type: 'diagnostics:errors',
                    timestamp: Date.now(),
                    payload: { errorCount, fileName: firstErrorFile },
                });
            }
            else if (errorCount === 0 && this.lastErrorCount > 0) {
                this.client.sendEvent({
                    type: 'diagnostics:cleared',
                    timestamp: Date.now(),
                });
            }
            this.lastErrorCount = errorCount;
        }));
    }
}
exports.DiagnosticWatcher = DiagnosticWatcher;
//# sourceMappingURL=diagnosticWatcher.js.map