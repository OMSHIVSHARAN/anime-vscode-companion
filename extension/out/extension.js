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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const companionClient_1 = require("./companionClient");
const activityTracker_1 = require("./activityTracker");
const diagnosticWatcher_1 = require("./diagnosticWatcher");
const terminalWatcher_1 = require("./terminalWatcher");
const gitWatcher_1 = require("./gitWatcher");
let client;
let activityTracker;
function activate(context) {
    const config = vscode.workspace.getConfiguration('nezukoCompanion');
    const port = config.get('websocketPort') ?? 47832;
    client = new companionClient_1.CompanionClient(port);
    client.connect();
    // Greet on activation
    client.sendEvent({
        type: 'vscode:opened',
        timestamp: Date.now(),
        payload: { message: 'VS Code opened' },
    });
    // Activity tracking
    const idleMinutes = config.get('idleTimeoutMinutes') ?? 5;
    activityTracker = new activityTracker_1.ActivityTracker(client, idleMinutes);
    activityTracker.start(context);
    // Diagnostic watcher (errors)
    const diagnosticWatcher = new diagnosticWatcher_1.DiagnosticWatcher(client);
    diagnosticWatcher.start(context);
    // Terminal watcher (build success/failure)
    const terminalWatcher = new terminalWatcher_1.TerminalWatcher(client);
    terminalWatcher.start(context);
    (0, terminalWatcher_1.startTerminalDataWatcher)(client, context);
    // Git watcher
    if (config.get('enableGitTracking')) {
        const gitWatcher = new gitWatcher_1.GitWatcher(client);
        gitWatcher.start(context);
    }
    // File save events
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((doc) => {
        activityTracker.recordActivity();
        client.sendEvent({
            type: 'file:saved',
            timestamp: Date.now(),
            payload: {
                fileName: doc.fileName.split(/[/\\]/).pop(),
                language: doc.languageId,
            },
        });
    }));
    // Text change (typing bursts)
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => {
        activityTracker.recordActivity();
    }));
    // Window focus
    context.subscriptions.push(vscode.window.onDidChangeWindowState((state) => {
        client.sendEvent({
            type: state.focused ? 'vscode:focused' : 'vscode:blurred',
            timestamp: Date.now(),
        });
    }));
    // Commands
    context.subscriptions.push(vscode.commands.registerCommand('nezuko.openCompanion', () => {
        const panel = vscode.window.createWebviewPanel('nezukoCompanion', 'Nezuko Companion 🌸', vscode.ViewColumn.Beside, { enableScripts: true, retainContextWhenHidden: true });
        panel.webview.html = getWebviewHtml(port);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('nezuko.launchDesktop', () => {
        vscode.window.showInformationMessage('Launch the desktop companion: npm run dev --prefix companion');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('nezuko.toggleConnection', () => {
        if (client.isConnected()) {
            client.disconnect();
            vscode.window.showInformationMessage('Nezuko companion disconnected');
        }
        else {
            client.connect();
            vscode.window.showInformationMessage('Nezuko companion reconnecting...');
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('nezuko.showStats', () => {
        vscode.window.showInformationMessage('Open the companion app to view your coding stats, XP, and streaks!');
    }));
    context.subscriptions.push(client);
}
function deactivate() {
    client?.disconnect();
    activityTracker?.stop();
}
function getWebviewHtml(port) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src ws://localhost:${port}; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%);
      color: #fff;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .character { font-size: 80px; animation: bounce 2s ease-in-out infinite; }
    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    .speech {
      background: rgba(255,182,193,0.2);
      border: 2px solid #ffb6c1;
      border-radius: 16px;
      padding: 16px 24px;
      margin-top: 20px;
      max-width: 90%;
      text-align: center;
      font-size: 14px;
      line-height: 1.5;
    }
    .status { margin-top: 12px; font-size: 12px; color: #ffb6c1; opacity: 0.7; }
    .stats { display: flex; gap: 16px; margin-top: 16px; font-size: 12px; }
    .stat { background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="character" id="char">🌸</div>
  <div class="speech" id="speech">Connecting to Nezuko...</div>
  <div class="status" id="status">WebSocket: connecting...</div>
  <div class="stats">
    <div class="stat">⭐ Lv.<span id="level">1</span></div>
    <div class="stat">✨ <span id="xp">0</span> XP</div>
    <div class="stat">🔥 <span id="streak">0</span> day streak</div>
  </div>
  <script>
    const ws = new WebSocket('ws://localhost:${port}');
    const speech = document.getElementById('speech');
    const status = document.getElementById('status');
    const char = document.getElementById('char');
    const moodEmoji = { idle:'🌸', greeting:'👋', motivated:'💪', sleepy:'😴', celebrating:'🎉', angry:'😡', thinking:'🤔', chatting:'💬' };

    ws.onopen = () => { status.textContent = 'Connected ✓'; };
    ws.onclose = () => { status.textContent = 'Disconnected — start desktop companion'; speech.textContent = 'Start the companion app to connect!'; };
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.channel === 'state') {
        const s = msg.data;
        speech.textContent = s.message || '...';
        char.textContent = moodEmoji[s.mood] || '🌸';
        document.getElementById('level').textContent = s.level;
        document.getElementById('xp').textContent = s.xp;
        document.getElementById('streak').textContent = s.streak;
      }
    };
  </script>
</body>
</html>`;
}
//# sourceMappingURL=extension.js.map