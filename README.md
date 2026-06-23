# VS Code Companion

An anime desktop companion featuring **Nezuko Kamado** that lives beside your VS Code window and reacts to your coding activity in real time.

![Features](https://img.shields.io/badge/Character-Nezuko-e8507a?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-React+Electron+TypeScript-blue?style=flat-square)

## Features

| Feature | Description |
|---------|-------------|
| 👋 **Greeting** | Nezuko welcomes you when VS Code opens |
| 💬 **Motivation** | Encouraging messages while you code |
| 😴 **Sleepy mode** | Gets drowsy when you're inactive (configurable timeout) |
| 🎉 **Celebrations** | Reacts when builds succeed or errors are cleared |
| 😡 **Error reactions** | Responds to diagnostics and failed builds/tests |
| 📊 **XP & Streaks** | RPG leveling system with daily streak tracking |
| 🎙️ **Voice** | Optional text-to-speech responses |
| 🤖 **AI Chat** | Ask coding questions (OpenAI-compatible API) |
| 🎭 **Personalities** | Nezuko, Tsundere, Senpai, Mentor modes |
| 📝 **Git tracking** | Congratulates you on commits |
| 💾 **Memory** | Remembers conversation history across sessions |

## Architecture

```
┌─────────────────────┐     WebSocket      ┌──────────────────────┐
│  VS Code Extension  │ ◄──────────────► │  Electron Companion   │
│  (event listener)   │    port 47832     │  (Nezuko UI + AI)     │
└─────────────────────┘                    └──────────────────────┘
         │                                           │
         ├── Diagnostics (errors)                   ├── SVG Character + animations
         ├── Terminal (build/test output)            ├── XP / Level / Streak system
         ├── File saves                             ├── AI Chat (OpenAI-compatible)
         ├── Activity / idle detection              ├── Voice (Web Speech API)
         └── Git commits                             └── Persistent state (JSON)
```

## Quick Start

### Prerequisites

- **Node.js** 18+
- **VS Code** 1.85+
- **npm**

### 1. Install dependencies

```bash
cd anime-vscode-companion
npm install
cd extension && npm install && cd ..
cd companion && npm install && cd ..
```

### 2. Build the VS Code extension

```bash
cd extension
npm run compile
```

Install locally: open the `extension` folder in VS Code, press `F5` to launch Extension Development Host.

Or package it:

```bash
npm run package
# Install the generated .vsix via VS Code → Extensions → ... → Install from VSIX
```

### 3. Start the desktop companion

```bash
cd companion
npm run dev
```

This launches:
- **Vite dev server** (React UI at http://localhost:5173)
- **Electron window** (always-on-top, transparent, beside your screen)
- **WebSocket server** on port `47832`

### 4. Open VS Code

Open any project in VS Code with the extension active. Nezuko will connect automatically and greet you!

## Configuration

### VS Code Extension Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `nezukoCompanion.websocketPort` | `47832` | WebSocket port |
| `nezukoCompanion.idleTimeoutMinutes` | `5` | Inactivity before sleepy mode |
| `nezukoCompanion.enableGitTracking` | `true` | Watch git commits |
| `nezukoCompanion.buildSuccessPatterns` | `[...]` | Terminal patterns for success |
| `nezukoCompanion.buildFailurePatterns` | `[...]` | Terminal patterns for failure |

Access via: **Settings → Extensions → Nezuko Companion**

### AI Chat (Optional)

Copy `companion/.env.example` to `companion/.env` and set your API key:

```env
OPENAI_API_KEY=sk-your-key
OPENAI_API_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

Works with **any OpenAI-compatible API** — Ollama, LM Studio, local LLMs:

```env
OPENAI_API_URL=http://localhost:11434/v1
OPENAI_MODEL=llama3
```

Without an API key, Nezuko uses built-in offline responses.

### Commands

Open Command Palette (`Ctrl+Shift+P`):

- `Nezuko: Open Companion Window` — embedded webview panel in VS Code
- `Nezuko: Launch Desktop Companion` — instructions to start Electron app
- `Nezuko: Toggle Companion Connection` — connect/disconnect WebSocket
- `Nezuko: Show Coding Stats` — view stats in companion app

## RPG Leveling System

| Action | XP Reward |
|--------|-----------|
| Daily login | +50 |
| File saved | +5 |
| Errors cleared | +15 |
| Build success | +25 |
| Git commit | +30 |
| AI chat message | +3 |
| Streak bonus | +10/day |

**Levels 1–10:** Script Kiddie → Bug Hunter → Code Ninja → ... → Grandmaster Coder

## Personalities

Switch in the companion app settings (⚙️):

- **Nezuko** — Sweet, gentle, protective (default)
- **Tsundere** — Tough exterior, secretly cares
- **Senpai** — Experienced mentor, patient guidance
- **Mentor** — Strict, quality-focused feedback

## Project Structure

```
anime-vscode-companion/
├── shared/types.ts          # Shared types, XP constants, personalities
├── extension/               # VS Code extension
│   └── src/
│       ├── extension.ts     # Activation & commands
│       ├── companionClient.ts
│       ├── activityTracker.ts
│       ├── diagnosticWatcher.ts
│       ├── terminalWatcher.ts
│       └── gitWatcher.ts
└── companion/               # Electron + React app
    ├── electron/            # Main process + WebSocket server
    │   ├── main.ts
    │   ├── websocketServer.ts
    │   └── services/        # AI, messages, storage
    └── src/                 # React UI
        ├── components/      # NezukoCharacter, ChatPanel, etc.
        ├── hooks/           # useVoice
        └── store/           # Zustand state
```

## Customization

### Custom Sprites / Live2D

Replace the SVG character in `companion/src/components/NezukoCharacter.tsx` with:
- Animated PNG sprite sheets (use CSS `steps()` animation)
- Live2D model (integrate via `pixi-live2d-display` or similar)

### Custom Personalities

Add entries to `PERSONALITIES` in `shared/types.ts` and message templates in `electron/services/messageGenerator.ts`.

## Development

```bash
# Extension (watch mode)
cd extension && npm run watch

# Companion (hot reload)
cd companion && npm run dev

# Build for production
cd companion && npm run build
cd companion && npm run electron:start
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Waiting for VS Code..." | Ensure extension is installed & active; check port 47832 isn't blocked |
| No build detection | Add custom patterns in extension settings |
| AI chat not working | Set `OPENAI_API_KEY` in environment before starting Electron |
| Git commits not detected | Enable Git extension; ensure repo has commits |

## License

MIT — Fan project. Nezuko Kamado is a character from *Demon Slayer* (© Koyoharu Gotouge / Shueisha). This is an unofficial fan companion app.
