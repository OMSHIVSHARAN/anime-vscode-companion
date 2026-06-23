import { calculateLevel } from '@shared/types';

interface Props {
  level: number;
  xp: number;
  streak: number;
  totalCommits: number;
  totalBuilds: number;
}

export function StatsPanel({ level, xp, streak, totalCommits, totalBuilds }: Props) {
  const levelInfo = calculateLevel(xp);
  const currentLevelXp = levelInfo.xpRequired;
  const nextLevelXp = currentLevelXp + (levelInfo.xpToNext || 0);
  const progress =
    levelInfo.xpToNext > 0
      ? ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
      : 100;

  return (
    <div className="stats-panel">
      <div className="stats-row">
        <span className="stat-badge level">⭐ Lv.{level}</span>
        <span className="stat-badge title">{levelInfo.title}</span>
        <span className="stat-badge streak">🔥 {streak}d</span>
      </div>
      <div className="xp-bar-container">
        <div className="xp-bar" style={{ width: `${Math.min(progress, 100)}%` }} />
        <span className="xp-label">{xp} XP</span>
      </div>
      <div className="stats-mini">
        <span>📦 {totalBuilds} builds</span>
        <span>📝 {totalCommits} commits</span>
      </div>
    </div>
  );
}
