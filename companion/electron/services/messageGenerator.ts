import type { PersonalityId } from '../../../shared/types';

export class MessageGenerator {
  private personalityId: PersonalityId;

  constructor(personalityId: PersonalityId) {
    this.personalityId = personalityId;
  }

  setPersonality(id: PersonalityId): void {
    this.personalityId = id;
  }

  greeting(): string {
    const messages: Record<PersonalityId, string[]> = {
      nezuko: [
        'Mmm~ Welcome back! Ready to code together? 🌸',
        'Nezuko is here! Let\'s make something amazing today~',
        'Good to see you! I\'ll watch over your code~ 💕',
      ],
      tsundere: [
        'Oh, you finally showed up. I wasn\'t waiting or anything!',
        'Hmph! Try not to write too many bugs today, okay?',
        'Don\'t get the wrong idea — I\'m only here to help.',
      ],
      senpai: [
        'Welcome back! Ready for a productive session?',
        'Good to see you. Let me know if you need guidance.',
        'Another day, another opportunity to write clean code.',
      ],
      mentor: [
        'Session started. Set your goals and let\'s ship quality code.',
        'Welcome. Remember: tests first, refactor often.',
        'Ready to level up your skills today?',
      ],
    };
    return this.pick(messages[this.personalityId]);
  }

  motivate(): string {
    const messages: Record<PersonalityId, string[]> = {
      nezuko: [
        'Keep going~ You\'re doing great! 🌸',
        'Mmm~ Every line of code makes you stronger!',
        'Don\'t give up! Nezuko believes in you~',
        'Your dedication is inspiring! ✨',
      ],
      tsundere: [
        'I-It\'s not like I care, but... keep coding.',
        'Your code isn\'t terrible today. Keep it up.',
        'B-baka! Focus! You can do better than this!',
      ],
      senpai: [
        'Steady progress beats rushed code. Keep going.',
        'Good developers debug patiently. You\'ve got this.',
        'Consider refactoring that function when you get a chance.',
      ],
      mentor: [
        'Maintain momentum. Quality over speed.',
        'Write the test. Then write the code.',
        'Small commits, clear messages. Stay disciplined.',
      ],
    };
    return this.pick(messages[this.personalityId]);
  }

  sleepy(idleMinutes: number): string {
    const messages: Record<PersonalityId, string[]> = {
      nezuko: [
        `Mmm~... getting sleepy... (${idleMinutes} min idle) 😴`,
        'Zzz... wake me when you start coding again~',
        'Nezuko is napping... don\'t forget about me! 💤',
      ],
      tsundere: [
        'Are you even working? I\'m bored... *yawn*',
        'Hmph. I\'ll nap until you do something interesting.',
        'Don\'t think I noticed you slacking off!',
      ],
      senpai: [
        'Taking a break? Rest is important for productivity.',
        'Idle for a while. Stretch and come back refreshed.',
        'Even seniors need breaks. Return when ready.',
      ],
      mentor: [
        'Inactivity detected. Review your session goals.',
        'Step away if needed, but don\'t lose focus.',
        'Idle time logged. Resume when ready.',
      ],
    };
    return this.pick(messages[this.personalityId]);
  }

  celebrate(_type: string, detail?: string): string {
    const messages: Record<PersonalityId, string[]> = {
      nezuko: [
        'Yay~! It worked! You\'re amazing! 🎉',
        'Mmm~! So happy for you! ✨',
        `Celebration time~ ${detail ? `"${detail}"` : 'Great job!'}`,
      ],
      tsundere: [
        'I-I guess that was... acceptable. Don\'t let it go to your head!',
        'Hmph! Not bad. I knew you could do it... maybe.',
        'W-well done. Not that I\'m impressed or anything!',
      ],
      senpai: [
        'Excellent work. Clean build — exactly what I like to see.',
        'Well done. Your skills are growing.',
        `Nice commit${detail ? `: ${detail}` : ''}. Keep this momentum.`,
      ],
      mentor: [
        'Build passed. XP earned. Maintain this standard.',
        'Success. Document what you learned.',
        `Commit recorded${detail ? `: ${detail}` : ''}. Ship it.`,
      ],
    };
    return this.pick(messages[this.personalityId]);
  }

  error(count: number, fileName?: string, context?: string): string {
    const loc = fileName ? ` in ${fileName}` : '';
    const messages: Record<PersonalityId, string[]> = {
      nezuko: [
        `Oh no~ ${count} error${count > 1 ? 's' : ''}${loc}! Let\'s fix them together 😟`,
        'Something went wrong... but we can fix it! 💪',
        context ? `Mmm~ ${context}... don\'t worry, Nezuko is here~` : 'Errors detected! Stay calm~',
      ],
      tsundere: [
        `B-baka! ${count} error${count > 1 ? 's' : ''}${loc}! Fix them already!`,
        'Ugh, errors again? I\'m NOT going to help you... much.',
        context ? `${context}! Typical...` : 'Your code broke. Surprise, surprise.',
      ],
      senpai: [
        `${count} error${count > 1 ? 's' : ''} found${loc}. Let's debug step by step.`,
        'Errors are learning opportunities. Check the stack trace.',
        context ? `${context}. Read the error message carefully.` : 'Review your recent changes.',
      ],
      mentor: [
        `${count} error${count > 1 ? 's' : ''}${loc}. Stop and read each message.`,
        'Failed. Analyze root cause before changing code.',
        context ? `${context}. Write a test to prevent regression.` : 'Fix errors before continuing.',
      ],
    };
    return this.pick(messages[this.personalityId]);
  }

  idle(): string {
    const messages: Record<PersonalityId, string[]> = {
      nezuko: ['Mmm~... 💭', 'Nezuko is watching~ 🌸', 'Ready when you are~'],
      tsundere: ['...', 'I\'m not bored.', '*glances at your screen*'],
      senpai: ['Standing by.', 'Focus on the task at hand.'],
      mentor: ['Session active.', 'Awaiting input.'],
    };
    return this.pick(messages[this.personalityId]);
  }

  private pick(arr: string[]): string {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
