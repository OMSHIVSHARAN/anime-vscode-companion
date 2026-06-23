import type { ChatMessage, Personality } from '../../../shared/types';

interface AIConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
}

export class AIService {
  private config: AIConfig;

  constructor() {
    this.config = {
      apiUrl: process.env.OPENAI_API_URL ?? 'https://api.openai.com/v1',
      apiKey: process.env.OPENAI_API_KEY ?? '',
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    };
  }

  async chat(
    userMessage: string,
    history: ChatMessage[],
    personality: Personality
  ): Promise<string> {
    if (!this.config.apiKey) {
      return this.offlineReply(userMessage, personality);
    }

    try {
      const systemPrompt = `You are ${personality.name}, an anime coding companion integrated with VS Code.
Personality: ${personality.description}
Style: ${personality.greetingStyle}
Keep responses concise (2-3 sentences), helpful for coding questions, and in character.
You remember previous conversation context. Be encouraging but stay in character.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map((m) => ({ role: m.role, content: m.content })),
      ];

      const response = await fetch(`${this.config.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          max_tokens: 300,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        return this.offlineReply(userMessage, personality);
      }

      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      return data.choices?.[0]?.message?.content ?? this.offlineReply(userMessage, personality);
    } catch {
      return this.offlineReply(userMessage, personality);
    }
  }

  private offlineReply(userMessage: string, personality: Personality): string {
    const lower = userMessage.toLowerCase();

    if (lower.includes('error') || lower.includes('bug')) {
      return personality.id === 'nezuko'
        ? 'Mmm~ Check the error message carefully! Usually it tells you exactly what\'s wrong. Nezuko believes you can fix it! 💪'
        : 'Read the stack trace from bottom to top. The root cause is usually near the top of your code\'s call stack.';
    }
    if (lower.includes('git') || lower.includes('commit')) {
      return 'Make small, focused commits with clear messages. Your future self will thank you! ✨';
    }
    if (lower.includes('test')) {
      return 'Write tests before fixing bugs — it helps prevent regressions! 🧪';
    }
    if (lower.includes('hello') || lower.includes('hi')) {
      return personality.id === 'nezuko'
        ? 'Mmm~ Hello! Ask me anything about coding~ 🌸'
        : `Hello. I'm ${personality.name}, ready to help with your code.`;
    }

    return personality.id === 'nezuko'
      ? 'Mmm~ That\'s a great question! (Set OPENAI_API_KEY for full AI chat mode) Try checking the docs or breaking the problem into smaller steps~ 🌸'
      : `Good question. (Configure OPENAI_API_KEY for AI-powered responses.) Try searching the documentation or isolating the problem.`;
  }
}
