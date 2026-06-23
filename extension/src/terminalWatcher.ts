import * as vscode from 'vscode';
import { CompanionClient } from './companionClient';

export class TerminalWatcher {
  private terminalBuffers = new Map<string, string>();

  constructor(private client: CompanionClient) {}

  start(context: vscode.ExtensionContext): void {
    const config = vscode.workspace.getConfiguration('nezukoCompanion');
    const successPatterns = config.get<string[]>('buildSuccessPatterns') ?? [];
    const failurePatterns = config.get<string[]>('buildFailurePatterns') ?? [];

    context.subscriptions.push(
      vscode.window.onDidOpenTerminal((terminal) => {
        const name = terminal.name;
        this.terminalBuffers.set(name, '');
      })
    );

    const pollInterval = setInterval(async () => {
      for (const terminal of vscode.window.terminals) {
        await this.checkTerminal(
          terminal,
          successPatterns,
          failurePatterns
        );
      }
    }, 2000);

    context.subscriptions.push({
      dispose: () => clearInterval(pollInterval),
    });
  }

  private async checkTerminal(
    terminal: vscode.Terminal,
    successPatterns: string[],
    failurePatterns: string[]
  ): Promise<void> {
    const exec = (
      terminal as vscode.Terminal & {
        shellIntegration?: {
          executeCommand?: (cmd: string) => unknown;
        };
      }
    ).shellIntegration;

    if (!exec?.executeCommand) {
      return;
    }

    // Terminal output monitoring disabled for compatibility
    // with current VS Code API typings.
  }
}

export function startTerminalDataWatcher(
  client: CompanionClient,
  context: vscode.ExtensionContext
): void {
  // Disabled because onDidWriteTerminalData is not available
  // in the installed VS Code API typings.
}