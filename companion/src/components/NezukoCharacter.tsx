import type { CompanionMood } from '@shared/types';

interface Props {
  mood: CompanionMood;
}

const moodAnimations: Record<CompanionMood, string> = {
  idle: 'anim-idle',
  greeting: 'anim-wave',
  motivated: 'anim-nod',
  sleepy: 'anim-sleep',
  celebrating: 'anim-jump',
  angry: 'anim-shake',
  thinking: 'anim-think',
  chatting: 'anim-talk',
};

export function NezukoCharacter({ mood }: Props) {
  const animClass = moodAnimations[mood] ?? 'anim-idle';

  return (
    <div className={`character-container ${animClass}`}>
      <svg
        viewBox="0 0 200 280"
        className="nezuko-svg"
        aria-label="Nezuko companion character"
      >
        {/* Hair back */}
        <ellipse cx="100" cy="95" rx="72" ry="68" fill="#1a0808" />
        {/* Face */}
        <ellipse cx="100" cy="105" rx="52" ry="58" fill="#fde8d0" />
        {/* Hair front / bangs */}
        <path
          d="M35 80 Q50 40 100 35 Q150 40 165 80 Q155 70 100 55 Q45 70 35 80"
          fill="#1a0808"
        />
        <path d="M55 75 Q100 60 145 75 L140 110 Q100 95 60 110 Z" fill="#1a0808" />
        {/* Eyes */}
        <ellipse cx="78" cy="108" rx="14" ry="16" fill="#fff" />
        <ellipse cx="122" cy="108" rx="14" ry="16" fill="#fff" />
        <ellipse cx="80" cy="110" rx="9" ry="11" fill="#e8507a" />
        <ellipse cx="124" cy="110" rx="9" ry="11" fill="#e8507a" />
        <circle cx="83" cy="106" r="3" fill="#fff" />
        <circle cx="127" cy="106" r="3" fill="#fff" />
        {/* Blush */}
        <ellipse cx="62" cy="125" rx="12" ry="7" fill="#ffb6c1" opacity="0.5" />
        <ellipse cx="138" cy="125" rx="12" ry="7" fill="#ffb6c1" opacity="0.5" />
        {/* Bamboo muzzle */}
        <rect x="72" y="138" width="56" height="14" rx="7" fill="#c8a882" stroke="#8b6914" strokeWidth="1.5" />
        <line x1="82" y1="138" x2="82" y2="152" stroke="#8b6914" strokeWidth="1" />
        <line x1="92" y1="138" x2="92" y2="152" stroke="#8b6914" strokeWidth="1" />
        <line x1="102" y1="138" x2="102" y2="152" stroke="#8b6914" strokeWidth="1" />
        <line x1="112" y1="138" x2="112" y2="152" stroke="#8b6914" strokeWidth="1" />
        <line x1="122" y1="138" x2="122" y2="152" stroke="#8b6914" strokeWidth="1" />
        {/* Kimono */}
        <path
          d="M55 165 Q100 155 145 165 L160 280 L40 280 Z"
          fill="#e8507a"
        />
        <path
          d="M70 165 Q100 175 130 165 L135 280 L65 280 Z"
          fill="#f08090"
        />
        {/* Obi / sash */}
        <rect x="55" y="195" width="90" height="18" rx="4" fill="#1a0808" />
        <rect x="60" y="198" width="80" height="12" rx="3" fill="#ffd700" opacity="0.8" />
        {/* Checkered pattern hint on kimono */}
        <rect x="75" y="220" width="12" height="12" fill="#fff" opacity="0.3" rx="2" />
        <rect x="99" y="220" width="12" height="12" fill="#1a0808" opacity="0.2" rx="2" />
        <rect x="123" y="220" width="12" height="12" fill="#fff" opacity="0.3" rx="2" />
        <rect x="87" y="236" width="12" height="12" fill="#1a0808" opacity="0.2" rx="2" />
        <rect x="111" y="236" width="12" height="12" fill="#fff" opacity="0.3" rx="2" />
        {/* Hair ribbon */}
        <circle cx="48" cy="88" r="8" fill="#e8507a" />
        <circle cx="152" cy="88" r="8" fill="#e8507a" />
        {/* Mood particles */}
        {mood === 'celebrating' && (
          <>
            <text x="30" y="60" fontSize="20">✨</text>
            <text x="160" y="50" fontSize="18">🎉</text>
            <text x="170" y="80" fontSize="16">⭐</text>
          </>
        )}
        {mood === 'sleepy' && (
          <text x="140" y="70" fontSize="18" className="zzz">💤</text>
        )}
        {mood === 'angry' && (
          <>
            <text x="25" y="90" fontSize="16">💢</text>
            <text x="165" y="85" fontSize="16">💢</text>
          </>
        )}
        {mood === 'greeting' && (
          <text x="155" y="130" fontSize="22" className="wave-hand">👋</text>
        )}
      </svg>
      <div className="sakura-petals">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="petal" style={{ animationDelay: `${i * 0.8}s` }}>
            🌸
          </span>
        ))}
      </div>
    </div>
  );
}
