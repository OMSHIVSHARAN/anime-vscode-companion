import { useState, useCallback, useRef } from 'react';

export function useVoice() {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const lastSpoken = useRef('');

  const speak = useCallback(
    (text: string) => {
      if (!voiceEnabled || !window.speechSynthesis) return;
      if (text === lastSpoken.current) return;
      lastSpoken.current = text;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.2;
      utterance.volume = 0.8;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => v.name.includes('Female') || v.name.includes('Zira') || v.lang.startsWith('ja')
      );
      if (preferred) utterance.voice = preferred;

      window.speechSynthesis.speak(utterance);
    },
    [voiceEnabled]
  );

  return { speak, voiceEnabled, setVoiceEnabled };
}
