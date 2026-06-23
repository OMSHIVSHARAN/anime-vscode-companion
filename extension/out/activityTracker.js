"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityTracker = void 0;
class ActivityTracker {
    constructor(client, idleTimeoutMs) {
        this.client = client;
        this.idleTimeoutMs = idleTimeoutMs;
        this.lastActivity = Date.now();
        this.idleTimer = null;
        this.wasIdle = false;
        this.intervalId = null;
        this.idleTimeoutMs = idleTimeoutMs * 60 * 1000;
    }
    start(context) {
        this.recordActivity();
        this.intervalId = setInterval(() => this.checkIdle(), 30000);
        context.subscriptions.push({ dispose: () => this.stop() });
    }
    recordActivity() {
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
    stop() {
        if (this.intervalId)
            clearInterval(this.intervalId);
        if (this.idleTimer)
            clearTimeout(this.idleTimer);
    }
    resetIdleTimer() {
        if (this.idleTimer)
            clearTimeout(this.idleTimer);
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
    checkIdle() {
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
exports.ActivityTracker = ActivityTracker;
//# sourceMappingURL=activityTracker.js.map