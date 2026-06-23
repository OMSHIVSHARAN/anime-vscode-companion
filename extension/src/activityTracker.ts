import * as vscode from 'vscode';
import { CompanionClient } from './companionClient';

export class ActivityTracker {
  private lastActivity = Date.now();
  private idleTimer: NodeJS.Timeout | null = null;
  private wasIdle = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    private client: CompanionClient,
    private idleTimeoutMs: number
  ) {
    this.idleTimeoutMs = idleTimeoutMs * 60 * 1000;
  }

  start(context: vscode.ExtensionContext): void {
    this.recordActivity();
    this.intervalId = setInterval(() => this.checkIdle(), 30000);
    context.subscriptions.push({ dispose: () => this.stop() });
  }

  recordActivity(): void {
    this.lastActivity = Date.now();
    if (this.wasIdle) {
      this.wasIdle = false;
      this.client.sendEvent({
        type: 'activity:active',
        timestamp: Date.now(),
      });
    }
    this.resetIdleTimer();
  }

  stop(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.idleTimer) clearTimeout(this.idleTimer);
  }

  private resetIdleTimer(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      this.wasIdle = true;
      const idleMinutes = Math.floor((Date.now() - this.lastActivity) / 60000);
      this.client.sendEvent({
        type: 'activity:idle',
        timestamp: Date.now(),
        payload: { idleMinutes },
      });
    }, this.idleTimeoutMs);
  }

  private checkIdle(): void {
    const elapsed = Date.now() - this.lastActivity;
    if (elapsed >= this.idleTimeoutMs && !this.wasIdle) {
      this.wasIdle = true;
      this.client.sendEvent({
        type: 'activity:idle',
        timestamp: Date.now(),
        payload: { idleMinutes: Math.floor(elapsed / 60000) },
      });
    }
  }
}
