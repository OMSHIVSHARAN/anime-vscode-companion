import { useState, useRef, useEffect } from 'react';
import { useCompanionStore } from '../store/companionStore';

interface Props {
  onClose: () => void;
}

export function ChatPanel({ onClose }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const { state } = useCompanionStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMessages(
      state.conversationHistory.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }))
    );
  }, [state.conversationHistory]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.sendChat(userMsg);
        if (result.reply) {
          setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Mmm~ Run the Electron app for full AI chat! 🌸',
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay-panel chat-panel">
      <div className="panel-header">
        <h3>💬 AI Chat</h3>
        <button className="btn-close" onClick={onClose}>✕</button>
      </div>
      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-hint">Ask Nezuko anything about coding~</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            {m.content}
          </div>
        ))}
        {loading && <div className="chat-msg assistant typing">Thinking...</div>}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask a coding question..."
          disabled={loading}
        />
        <button onClick={send} disabled={loading || !input.trim()} className="btn btn-primary">
          Send
        </button>
      </div>
    </div>
  );
}
