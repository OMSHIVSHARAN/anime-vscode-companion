import * as vscode from 'vscode';
import WebSocket from 'ws';

export interface VSCodeEvent {
  type: string;
  timestamp: number;
  payload?: Record<string, unknown>;
}

export class CompanionClient implements vscode.Disposable {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private disposed = false;

  constructor(private readonly port: number) {}

  connect(): void {
    if (this.disposed || this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(`ws://localhost:${this.port}`);

      this.ws.on('open', () => {
        this.clearReconnect();
      });

      this.ws.on('close', () => {
        this.ws = null;
        this.scheduleReconnect();
      });

      this.ws.on('error', () => {
        this.ws = null;
        this.scheduleReconnect();
      });
    } catch {
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.clearReconnect();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  sendEvent(event: VSCodeEvent): void {
    if (!this.isConnected()) return;
    this.ws!.send(
      JSON.stringify({
        channel: 'event',
        data: event,
      })
    );
  }

  private scheduleReconnect(): void {
    if (this.disposed || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  dispose(): void {
    this.disposed = true;
    this.disconnect();
  }
}
