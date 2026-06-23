import { PERSONALITIES, type PersonalityId } from '@shared/types';

interface Props {
  personality: PersonalityId;
  voiceEnabled: boolean;
  onPersonalityChange: (id: string) => void;
  onVoiceToggle: (enabled: boolean) => void;
  onClose: () => void;
}

export function SettingsPanel({
  personality,
  voiceEnabled,
  onPersonalityChange,
  onVoiceToggle,
  onClose,
}: Props) {
  return (
    <div className="overlay-panel settings-panel">
      <div className="panel-header">
        <h3>⚙️ Settings</h3>
        <button className="btn-close" onClick={onClose}>✕</button>
      </div>
      <div className="settings-body">
        <section>
          <h4>Personality</h4>
          <div className="personality-grid">
            {Object.values(PERSONALITIES).map((p) => (
              <button
                key={p.id}
                className={`personality-btn ${personality === p.id ? 'active' : ''}`}
                onClick={() => onPersonalityChange(p.id)}
              >
                <strong>{p.name}</strong>
                <small>{p.description}</small>
              </button>
            ))}
          </div>
        </section>
        <section>
          <h4>Voice</h4>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => onVoiceToggle(e.target.checked)}
            />
            <span>Enable voice responses (TTS)</span>
          </label>
        </section>
        <section>
          <h4>AI Chat</h4>
          <p className="settings-hint">
            Set <code>OPENAI_API_KEY</code> environment variable for full AI chat.
            Supports OpenAI-compatible APIs via <code>OPENAI_API_URL</code> and{' '}
            <code>OPENAI_MODEL</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
