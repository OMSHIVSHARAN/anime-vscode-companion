import { useEffect, useState, useCallback } from 'react';
import { useCompanionStore } from './store/companionStore';
import { NezukoCharacter } from './components/NezukoCharacter';
import { SpeechBubble } from './components/SpeechBubble';
import { StatsPanel } from './components/StatsPanel';
import { ChatPanel } from './components/ChatPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { TitleBar } from './components/TitleBar';
import { ConnectionStatus } from './components/ConnectionStatus';
import { useVoice } from './hooks/useVoice';
import type { CompanionState } from '@shared/types';

export default function App() {
  console.log('[renderer] App render');

  const { state, setState, showChat, showSettings, toggleChat, toggleSettings } =
    useCompanionStore();
  const [connected, setConnected] = useState(false);
  const { speak, voiceEnabled, setVoiceEnabled } = useVoice();

  useEffect(() => {
    console.log('[renderer] App mounted');
    return () => console.log('[renderer] App unmounted');
  }, []);

  useEffect(() => {
    if (window.electronAPI) {
      console.log('[renderer] Electron preload API detected');
      window.electronAPI.onStateUpdate((s) => {
        console.log('[renderer] state update received from Electron');
        setState(s as CompanionState);
      });
    } else {
      // Browser dev mode — connect WebSocket directly
      console.log('[renderer] connecting WebSocket', 'ws://127.0.0.1:47832');
      const ws = new WebSocket('ws://127.0.0.1:47832');
      ws.onopen = () => {
        console.log('[renderer] WebSocket connected');
        setConnected(true);
      };
      ws.onerror = (event) => {
        console.error('[renderer] WebSocket error', event);
      };
      ws.onclose = (event) => {
        console.log('[renderer] WebSocket closed', {
          code: event.code,
          reason: event.reason,
        });
        setConnected(false);
      };
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.channel === 'state') setState(msg.data);
        } catch (error) {
          console.error('[renderer] Invalid WebSocket message', error);
        }
      };
      return () => ws.close();
    }
  }, [setState]);

  useEffect(() => {
    if (voiceEnabled && state.message) {
      speak(state.message);
    }
  }, [state.message, voiceEnabled, speak]);

  const handlePersonalityChange = useCallback((id: string) => {
    window.electronAPI?.setPersonality(id);
  }, []);

  const handleVoiceToggle = useCallback(
    (enabled: boolean) => {
      setVoiceEnabled(enabled);
      window.electronAPI?.toggleVoice(enabled);
    },
    [setVoiceEnabled]
  );

  return (
    <div className="app">
      <TitleBar />
      <div className="app-body">
        <ConnectionStatus connected={connected || !!window.electronAPI} />
        <NezukoCharacter mood={state.mood} />
        <SpeechBubble message={state.message} mood={state.mood} />
        <StatsPanel
          level={state.level}
          xp={state.xp}
          streak={state.streak}
          totalCommits={state.totalCommits}
          totalBuilds={state.totalBuilds}
        />
        <div className="action-bar">
          <button className="btn btn-primary" onClick={toggleChat} title="AI Chat">
            💬 Chat
          </button>
          <button className="btn btn-secondary" onClick={toggleSettings} title="Settings">
            ⚙️
          </button>
        </div>
        {showChat && <ChatPanel onClose={toggleChat} />}
        {showSettings && (
          <SettingsPanel
            personality={state.personality}
            voiceEnabled={voiceEnabled}
            onPersonalityChange={handlePersonalityChange}
            onVoiceToggle={handleVoiceToggle}
            onClose={toggleSettings}
          />
        )}
      </div>
    </div>
  );
}
