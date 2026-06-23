import type { CompanionMood } from '@shared/types';

interface Props {
  message: string;
  mood: CompanionMood;
}

const moodColors: Record<CompanionMood, string> = {
  idle: '#ffb6c1',
  greeting: '#ffd700',
  motivated: '#98fb98',
  sleepy: '#b0c4de',
  celebrating: '#ffd700',
  angry: '#ff6b6b',
  thinking: '#dda0dd',
  chatting: '#87ceeb',
};

export function SpeechBubble({ message, mood }: Props) {
  return (
    <div className="speech-bubble" style={{ borderColor: moodColors[mood] }}>
      <div className="speech-tail" style={{ borderTopColor: moodColors[mood] }} />
      <p className="speech-text">{message}</p>
    </div>
  );
}
