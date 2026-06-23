"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanionClient = void 0;
const ws_1 = __importDefault(require("ws"));
class CompanionClient {
    constructor(port) {
        this.port = port;
        this.ws = null;
        this.reconnectTimer = null;
        this.disposed = false;
    }
    connect() {
        if (this.disposed || this.ws?.readyState === ws_1.default.OPEN)
            return;
        try {
            this.ws = new ws_1.default(`ws://localhost:${this.port}`);
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
        }
        catch {
            this.scheduleReconnect();
        }
    }
    disconnect() {
        this.clearReconnect();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
    isConnected() {
        return this.ws?.readyState === ws_1.default.OPEN;
    }
    sendEvent(event) {
        if (!this.isConnected())
            return;
        this.ws.send(JSON.stringify({
            channel: 'event',
            data: event,
        }));
    }
    scheduleReconnect() {
        if (this.disposed || this.reconnectTimer)
            return;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, 5000);
    }
    clearReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }
    dispose() {
        this.disposed = true;
        this.disconnect();
    }
}
exports.CompanionClient = CompanionClient;
//# sourceMappingURL=companionClient.js.map