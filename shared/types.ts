/** Shared event types between VS Code extension and companion app */

export type CompanionMood =
  | 'idle'
  | 'greeting'
  | 'motivated'
  | 'sleepy'
  | 'celebrating'
  | 'angry'
  | 'thinking'
  | 'chatting';

export type PersonalityId = 'nezuko' | 'tsundere' | 'senpai' | 'mentor';

export interface Personality {
  id: PersonalityId;
  name: string;
  description: string;
  greetingStyle: string;
  motivateStyle: string;
  errorStyle: string;
  celebrateStyle: string;
}

export const PERSONALITIES: Record<PersonalityId, Personality> = {
  nezuko: {
    id: 'nezuko',
    name: 'Nezuko',
    description: 'Sweet, protective, communicates with gentle hums and warm encouragement.',
    greetingStyle: 'Warm and gentle — short, caring messages with occasional "mmm~".',
    motivateStyle: 'Soft encouragement about protecting your progress and not giving up.',
    errorStyle: 'Concerned but calm — helps you fix bugs without panic.',
    celebrateStyle: 'Joyful bouncing energy when your code works!',
  },
  tsundere: {
    id: 'tsundere',
    name: 'Tsundere',
    description: 'Acts tough but secretly cares about your code quality.',
    greetingStyle: 'Dismissive on surface, secretly happy you showed up.',
    motivateStyle: 'Backhanded compliments about your coding skills.',
    errorStyle: 'Frustrated but still helps — "B-baka, you forgot a semicolon!"',
    celebrateStyle: 'Reluctant praise — "I guess that was... okay."',
  },
  senpai: {
    id: 'senpai',
    name: 'Senpai',
    description: 'Experienced developer who guides with patience.',
    greetingStyle: 'Professional welcome, offers to pair program.',
    motivateStyle: 'Shares wisdom and best practices while you code.',
    errorStyle: 'Teaching moments — explains why the error happened.',
    celebrateStyle: 'Proud mentor energy when you ship clean code.',
  },
  mentor: {
    id: 'mentor',
    name: 'Mentor',
    description: 'Strict but fair — pushes you to write better code.',
    greetingStyle: 'Sets goals for the session.',
    motivateStyle: 'Focus on clean code, tests, and refactoring.',
    errorStyle: 'Direct feedback on what went wrong.',
    celebrateStyle: 'Acknowledges growth and XP earned.',
  },
};

export type VSCodeEventType =
  | 'vscode:opened'
  | 'vscode:focused'
  | 'vscode:blurred'
  | 'file:saved'
  | 'file:changed'
  | 'diagnostics:errors'
  | 'diagnostics:cleared'
  | 'terminal:build-success'
  | 'terminal:build-failure'
  | 'terminal:test-failure'
  | 'git:commit'
  | 'activity:idle'
  | 'activity:active'
  | 'typing:burst';

export interface VSCodeEvent {
  type: VSCodeEventType;
  timestamp: number;
  payload?: {
    errorCount?: number;
    fileName?: string;
    message?: string;
    commitMessage?: string;
    language?: string;
    idleMinutes?: number;
  };
}

export interface CompanionState {
  mood: CompanionMood;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  totalCommits: number;
  totalFixes: number;
  totalBuilds: number;
  personality: PersonalityId;
  message: string;
  conversationHistory: ChatMessage[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  xpRequired: number;
  xpToNext: number;
}

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Script Kiddie',
  2: 'Bug Hunter',
  3: 'Code Ninja',
  4: 'Stack Overflow Survivor',
  5: 'Git Master',
  6: 'Architecture Sage',
  7: 'Open Source Hero',
  8: '10x Developer',
  9: 'Legendary Hacker',
  10: 'Grandmaster Coder',
};

export function xpForLevel(level: number): number {
  return level * 100 + (level - 1) * 50;
}

export function calculateLevel(xp: number): LevelInfo {
  let level = 1;
  let totalRequired = 0;
  while (level < 10) {
    const needed = xpForLevel(level + 1);
    if (xp < totalRequired + needed) {
      return {
        level,
        title: LEVEL_TITLES[level] ?? 'Coder',
        xpRequired: totalRequired,
        xpToNext: totalRequired + needed - xp,
      };
    }
    totalRequired += needed;
    level++;
  }
  return {
    level: 10,
    title: LEVEL_TITLES[10],
    xpRequired: totalRequired,
    xpToNext: 0,
  };
}

export const XP_REWARDS = {
  fileSaved: 5,
  errorFixed: 15,
  buildSuccess: 25,
  testPass: 20,
  gitCommit: 30,
  chatMessage: 3,
  dailyLogin: 50,
  streakBonus: 10,
} as const;

export interface WebSocketMessage {
  channel: 'event' | 'state' | 'chat' | 'ping' | 'pong' | 'command';
  data: unknown;
}
