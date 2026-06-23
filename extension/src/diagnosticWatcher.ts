import * as vscode from 'vscode';
import { CompanionClient } from './companionClient';

export class DiagnosticWatcher {
  private lastErrorCount = 0;

  constructor(private client: CompanionClient) {}

  start(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      vscode.languages.onDidChangeDiagnostics(() => {
        const allDiagnostics = vscode.languages.getDiagnostics();
        let errorCount = 0;
        let firstErrorFile: string | undefined;

        for (const [uri, diags] of allDiagnostics) {
          const errors = diags.filter(
            (d) => d.severity === vscode.DiagnosticSeverity.Error
          );
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
        } else if (errorCount === 0 && this.lastErrorCount > 0) {
          this.client.sendEvent({
            type: 'diagnostics:cleared',
            timestamp: Date.now(),
          });
        }

        this.lastErrorCount = errorCount;
      })
    );
  }
}
