import { WebSocketServer, WebSocket } from 'ws';
import {
  type CompanionState,
  type CompanionMood,
  type VSCodeEvent,
  type PersonalityId,
  type ChatMessage,
  PERSONALITIES,
  XP_REWARDS,
  calculateLevel,
} from '../../shared/types';
import { MessageGenerator } from './services/messageGenerator';
import { AIService } from './services/aiService';
import { StorageService } from './services/storageService';

interface WebSocketServerLifecycle {
  onStarted?: () => void;
  onError?: (error: Error) => void;
}

export class CompanionWebSocketServer {
  private wss: WebSocketServer;
  private clients = new Set<WebSocket>();
  private state: CompanionState;
  private messageGen: MessageGenerator;
  private ai: AIService;
  private storage: StorageService;
  private voiceEnabled = false;
  private moodResetTimer: NodeJS.Timeout | null = null;
  private motivateTimer: NodeJS.Timeout | null = null;
  private onStateChange: (state: CompanionState) => void;

  constructor(
    port: number,
    onStateChange: (state: CompanionState) => void,
    lifecycle: WebSocketServerLifecycle = {}
  ) {
    this.onStateChange = onStateChange;
    this.storage = new StorageService();
    this.state = this.storage.load();
    this.messageGen = new MessageGenerator(this.state.personality);
    this.ai = new AIService();

    this.checkDailyStreak();
    this.setMood('greeting', this.messageGen.greeting());

    this.wss = new WebSocketServer({ port });
    this.wss.on('listening', () => lifecycle.onStarted?.());
    this.wss.on('error', (error) => lifecycle.onError?.(error));
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      this.broadcastState();
      ws.on('close', () => this.clients.delete(ws));
      ws.on('message', (raw) => this.handleClientMessage(ws, raw.toString()));
    });

    this.startMotivationTimer();
  }

  private handleClientMessage(ws: WebSocket, raw: string): void {
    try {
      const msg = JSON.parse(raw);
      if (msg.channel === 'event') {
        this.handleVSCodeEvent(msg.data as VSCodeEvent);
      } else if (msg.channel === 'ping') {
        ws.send(JSON.stringify({ channel: 'pong', data: Date.now() }));
      }
    } catch {
      // ignore malformed messages
    }
  }

  private handleVSCodeEvent(event: VSCodeEvent): void {
    switch (event.type) {
      case 'vscode:opened':
        this.setMood('greeting', this.messageGen.greeting());
        this.addXP(XP_REWARDS.dailyLogin, 'daily login');
        break;
      case 'vscode:focused':
        if (this.state.mood === 'sleepy') {
          this.setMood('motivated', this.messageGen.motivate());
        }
        break;
      case 'file:saved':
        this.addXP(XP_REWARDS.fileSaved, 'file saved');
        this.setMood('motivated', this.messageGen.motivate());
        break;
      case 'diagnostics:errors':
        this.setMood(
          'angry',
          this.messageGen.error(event.payload?.errorCount ?? 1, event.payload?.fileName)
        );
        break;
      case 'diagnostics:cleared':
        this.addXP(XP_REWARDS.errorFixed, 'errors fixed');
        this.setMood('celebrating', this.messageGen.celebrate('errors cleared'));
        break;
      case 'terminal:build-success':
        this.state.totalBuilds++;
        this.addXP(XP_REWARDS.buildSuccess, 'build success');
        this.setMood('celebrating', this.messageGen.celebrate('build'));
        break;
      case 'terminal:build-failure':
        this.setMood('angry', this.messageGen.error(1, undefined, 'build failed'));
        break;
      case 'terminal:test-failure':
        this.setMood('angry', this.messageGen.error(1, undefined, 'tests failed'));
        break;
      case 'git:commit':
        this.state.totalCommits++;
        this.addXP(XP_REWARDS.gitCommit, 'git commit');
        this.setMood(
          'celebrating',
          this.messageGen.celebrate('commit', event.payload?.commitMessage)
        );
        break;
      case 'activity:idle':
        this.setMood('sleepy', this.messageGen.sleepy(event.payload?.idleMinutes ?? 5));
        break;
      case 'activity:active':
        this.setMood('motivated', this.messageGen.motivate());
        break;
    }
    this.persist();
    this.broadcastState();
  }

  async handleChat(userMessage: string): Promise<{ reply: string; error?: string }> {
    this.setMood('thinking', 'Hmm, let me think...');
    this.broadcastState();

    const userMsg: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };
    this.state.conversationHistory.push(userMsg);

    const personality = PERSONALITIES[this.state.personality];
    const reply = await this.ai.chat(
      userMessage,
      this.state.conversationHistory.slice(-20),
      personality
    );

    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: reply,
      timestamp: Date.now(),
    };
    this.state.conversationHistory.push(assistantMsg);
    this.addXP(XP_REWARDS.chatMessage, 'chat');
    this.setMood('chatting', reply);
    this.persist();
    this.broadcastState();

    return { reply };
  }

  setPersonality(id: string): void {
    const pid = id as PersonalityId;
    if (PERSONALITIES[pid]) {
      this.state.personality = pid;
      this.messageGen.setPersonality(pid);
      this.setMood('greeting', this.messageGen.greeting());
      this.persist();
      this.broadcastState();
    }
  }

  setVoiceEnabled(enabled: boolean): void {
    this.voiceEnabled = enabled;
  }

  isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  getState(): CompanionState {
    return { ...this.state };
  }

  private addXP(amount: number, _reason: string): void {
    const streakBonus = this.state.streak > 1 ? XP_REWARDS.streakBonus : 0;
    this.state.xp += amount + streakBonus;
    const levelInfo = calculateLevel(this.state.xp);
    const oldLevel = this.state.level;
    this.state.level = levelInfo.level;
    if (levelInfo.level > oldLevel) {
      this.setMood(
        'celebrating',
        `Level up! You're now Lv.${levelInfo.level} — ${levelInfo.title}! 🎉`
      );
    }
  }

  private checkDailyStreak(): void {
    const today = new Date().toISOString().split('T')[0];
    const last = this.state.lastActiveDate;
    if (!last) {
      this.state.streak = 1;
    } else if (last === today) {
      // same day, keep streak
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split('T')[0];
      this.state.streak = last === yStr ? this.state.streak + 1 : 1;
    }
    this.state.lastActiveDate = today;
  }

  private setMood(mood: CompanionMood, message: string): void {
    this.state.mood = mood;
    this.state.message = message;
    this.onStateChange(this.getState());

    if (this.moodResetTimer) clearTimeout(this.moodResetTimer);
    if (mood !== 'idle' && mood !== 'sleepy' && mood !== 'chatting') {
      this.moodResetTimer = setTimeout(() => {
        this.state.mood = 'idle';
        this.state.message = this.messageGen.idle();
        this.broadcastState();
      }, 8000);
    }
  }

  private startMotivationTimer(): void {
    this.motivateTimer = setInterval(() => {
      if (this.state.mood === 'idle' || this.state.mood === 'motivated') {
        this.setMood('motivated', this.messageGen.motivate());
        this.broadcastState();
      }
    }, 120000);
  }

  private persist(): void {
    this.storage.save(this.state);
  }

  private broadcastState(): void {
    const payload = JSON.stringify({ channel: 'state', data: this.getState() });
    for (const client of this.clients) {
      if (client.readyState === 1) client.send(payload);
    }
    this.onStateChange(this.getState());
  }

  close(): void {
    if (this.moodResetTimer) clearTimeout(this.moodResetTimer);
    if (this.motivateTimer) clearInterval(this.motivateTimer);
    this.wss.close();
  }
}
