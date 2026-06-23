import { contextBridge, ipcRenderer } from 'electron';

console.log('[preload] loaded', { href: window.location.href });

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.invoke('window-minimize'),
  close: () => ipcRenderer.invoke('window-close'),
  getPort: () => ipcRenderer.invoke('get-port'),
  sendChat: (message: string) => ipcRenderer.invoke('send-chat', message),
  setPersonality: (id: string) => ipcRenderer.invoke('set-personality', id),
  toggleVoice: (enabled: boolean) => ipcRenderer.invoke('toggle-voice', enabled),
  onStateUpdate: (callback: (state: unknown) => void) => {
    ipcRenderer.on('companion-state', (_event, state) => callback(state));
  },
});

export interface ElectronAPI {
  minimize: () => Promise<void>;
  close: () => Promise<void>;
  getPort: () => Promise<number>;
  sendChat: (message: string) => Promise<{ reply: string; error?: string }>;
  setPersonality: (id: string) => Promise<void>;
  toggleVoice: (enabled: boolean) => Promise<void>;
  onStateUpdate: (callback: (state: unknown) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
