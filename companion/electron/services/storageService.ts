import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import type { CompanionState } from '../../../shared/types';

const DEFAULT_STATE: CompanionState = {
  mood: 'idle',
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: '',
  totalCommits: 0,
  totalFixes: 0,
  totalBuilds: 0,
  personality: 'nezuko',
  message: 'Mmm~ Hello! Start VS Code to connect! 🌸',
  conversationHistory: [],
};

export class StorageService {
  private filePath: string;

  constructor() {
    const userData = app?.getPath?.('userData') ?? process.cwd();
    this.filePath = path.join(userData, 'nezuko-companion-state.json');
  }

  load(): CompanionState {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        return { ...DEFAULT_STATE, ...JSON.parse(raw) };
      }
    } catch {
      // use defaults
    }
    return { ...DEFAULT_STATE };
  }

  save(state: CompanionState): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(state, null, 2));
    } catch {
      // silent fail
    }
  }
}
