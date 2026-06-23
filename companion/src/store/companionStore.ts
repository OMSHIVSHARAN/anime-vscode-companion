import { create } from 'zustand';
import type { CompanionState, CompanionMood, PersonalityId } from '@shared/types';

interface CompanionStore {
  state: CompanionState;
  showChat: boolean;
  showSettings: boolean;
  setState: (state: CompanionState) => void;
  toggleChat: () => void;
  toggleSettings: () => void;
}

const defaultState: CompanionState = {
  mood: 'idle',
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: '',
  totalCommits: 0,
  totalFixes: 0,
  totalBuilds: 0,
  personality: 'nezuko' as PersonalityId,
  message: 'Mmm~ Hello! Start VS Code with the extension to connect! 🌸',
  conversationHistory: [],
};

export const useCompanionStore = create<CompanionStore>((set) => ({
  state: defaultState,
  showChat: false,
  showSettings: false,
  setState: (state) => set({ state }),
  toggleChat: () => set((s) => ({ showChat: !s.showChat, showSettings: false })),
  toggleSettings: () => set((s) => ({ showSettings: !s.showSettings, showChat: false })),
}));

export type { CompanionMood };
