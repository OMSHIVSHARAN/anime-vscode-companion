/// <reference types="vite/client" />

interface ElectronAPI {
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

export {};
