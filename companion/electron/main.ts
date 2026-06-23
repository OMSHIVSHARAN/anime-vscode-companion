import { app, BrowserWindow, ipcMain, screen } from 'electron';
import fs from 'fs';
import path from 'path';
import { CompanionWebSocketServer } from './websocketServer';

const WS_PORT = 47832;
const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
const debugWindow = isDev || process.env.ELECTRON_DEBUG_WINDOW === 'true';
let mainWindow: BrowserWindow | null = null;
let wsServer: CompanionWebSocketServer | null = null;
let rendererRecoveryAttempted = false;

app.setName('Nezuko Companion');

const userDataPath = path.join(app.getPath('appData'), 'NezukoCompanion');
const sessionDataPath = isDev
  ? path.join(app.getPath('temp'), `nezuko-companion-session-${process.pid}`)
  : path.join(userDataPath, 'Session Data');

app.setPath('userData', userDataPath);
app.setPath('sessionData', sessionDataPath);

function log(message: string, details?: unknown): void {
  let serializedDetails = '';
  if (details !== undefined) {
    try {
      serializedDetails =
        details instanceof Error ? details.stack ?? details.message : JSON.stringify(details);
    } catch {
      serializedDetails = String(details);
    }
  }

  const suffix = serializedDetails ? ` ${serializedDetails}` : '';
  const line = `[electron ${new Date().toISOString()}] ${message}${suffix}`;
  console.log(line);

  try {
    fs.mkdirSync(userDataPath, { recursive: true });
    fs.appendFileSync(path.join(userDataPath, 'electron-startup.log'), `${line}\n`);
  } catch (error) {
    console.error('[electron] Unable to write startup log', error);
  }
}

process.on('uncaughtException', (error) => {
  log('uncaught exception', error);
});

process.on('unhandledRejection', (reason) => {
  log('unhandled promise rejection', reason);
});

async function createWindow(): Promise<void> {
  const { workArea } = screen.getPrimaryDisplay();
  const preloadPath = path.join(__dirname, 'preload.js');
  const windowX = debugWindow ? 100 : workArea.x + Math.max(0, workArea.width - 400);
  const windowY = debugWindow ? 100 : workArea.y + Math.max(0, workArea.height - 540);

  log('creating BrowserWindow', {
    debugWindow,
    bounds: { x: windowX, y: windowY, width: 380, height: 520 },
    workArea,
    preloadPath,
    preloadExists: fs.existsSync(preloadPath),
  });

  mainWindow = new BrowserWindow({
    width: 380,
    height: 520,
    x: windowX,
    y: windowY,
    frame: debugWindow,
    transparent: !debugWindow,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    show: false,
    backgroundColor: debugWindow ? '#202020' : '#00000000',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  log('BrowserWindow created', { id: mainWindow.id, bounds: mainWindow.getBounds() });

  mainWindow.once('ready-to-show', () => {
    log('window ready-to-show');
    mainWindow?.show();
    mainWindow?.focus();
  });

  mainWindow.on('show', () => {
    log('window shown', { bounds: mainWindow?.getBounds() });
  });

  mainWindow.webContents.on('dom-ready', () => {
    log('renderer DOM ready');
  });

  mainWindow.webContents.on('did-finish-load', () => {
    log('renderer URL loaded', { url: mainWindow?.webContents.getURL() });
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }

    setTimeout(async () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;

      try {
        const renderState = await mainWindow.webContents.executeJavaScript(`
          (() => {
            const root = document.getElementById('root');
            const app = document.querySelector('.app');
            const character = document.querySelector('.nezuko-svg');
            const bounds = (element) => {
              if (!element) return null;
              const rect = element.getBoundingClientRect();
              return { width: rect.width, height: rect.height };
            };

            return {
              rootChildren: root?.childElementCount ?? 0,
              appBounds: bounds(app),
              characterBounds: bounds(character),
              text: app?.textContent?.slice(0, 120) ?? '',
            };
          })()
        `);

        log('renderer render tree inspected', renderState);

        if (!renderState.appBounds && !rendererRecoveryAttempted) {
          rendererRecoveryAttempted = true;
          log('renderer app tree missing; reloading without cache');
          mainWindow.webContents.reloadIgnoringCache();
        }
      } catch (error) {
        log('renderer render tree inspection failed', error);
      }
    }, 1000);
  });

  mainWindow.webContents.on(
    'did-fail-load',
    (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      log('renderer load failed', {
        errorCode,
        errorDescription,
        validatedURL,
        isMainFrame,
      });
      mainWindow?.show();
    }
  );

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    log('renderer process gone', details);
  });

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    log('renderer console', { level, message, line, sourceId });
  });

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    log('renderer DevTools opened');
  }

  const showFallback = setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      log('ready-to-show timeout; forcing window visible');
      mainWindow.show();
      mainWindow.focus();
    }
  }, 3000);

  try {
    if (process.env.VITE_DEV_SERVER_URL) {
      const devServerUrl = new URL(process.env.VITE_DEV_SERVER_URL).toString();
      log('loading Vite dev server URL', { devServerUrl });
      await mainWindow.loadURL(devServerUrl);
    } else {
      const indexPath = path.join(__dirname, '../../../dist/index.html');
      log('loading production HTML', {
        indexPath,
        indexExists: fs.existsSync(indexPath),
      });
      await mainWindow.loadFile(indexPath);
    }
  } catch (error) {
    log('BrowserWindow load rejected', error);
    mainWindow.show();
  } finally {
    clearTimeout(showFallback);
  }

  mainWindow.on('closed', () => {
    log('BrowserWindow closed');
    mainWindow = null;
  });
}

app.on('child-process-gone', (_event, details) => {
  log('Electron child process gone', details);
});

app.whenReady().then(async () => {
  log('app ready', {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    userDataPath: app.getPath('userData'),
    sessionDataPath: app.getPath('sessionData'),
    viteDevServerUrl: process.env.VITE_DEV_SERVER_URL ?? null,
  });

  await createWindow();

  try {
    wsServer = new CompanionWebSocketServer(
      WS_PORT,
      (state) => {
        mainWindow?.webContents.send('companion-state', state);
      },
      {
        onStarted: () => log('websocket server started', { port: WS_PORT }),
        onError: (error) => log('websocket server error', error),
      }
    );
  } catch (error) {
    log('websocket server construction failed', error);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
}).catch((error) => {
  log('app startup failed', error);
});

app.on('window-all-closed', () => {
  log('all windows closed');
  wsServer?.close();
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('window-minimize', () => mainWindow?.minimize());
ipcMain.handle('window-close', () => mainWindow?.close());
ipcMain.handle('get-port', () => WS_PORT);

ipcMain.handle('send-chat', async (_event, message: string) => {
  return wsServer?.handleChat(message) ?? { error: 'Server not ready' };
});

ipcMain.handle('set-personality', (_event, id: string) => {
  wsServer?.setPersonality(id);
});

ipcMain.handle('toggle-voice', (_event, enabled: boolean) => {
  wsServer?.setVoiceEnabled(enabled);
});

export { wsServer };
