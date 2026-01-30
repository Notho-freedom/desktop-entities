# 🖥️ Desktop Domination — Electron Overlay System

Système d'overlay desktop sans fenêtres traditionnelles — des surfaces UI flottantes et transparentes qui vivent sur le bureau comme un HUD sci-fi.

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Install Electron
npm install electron electron-builder concurrently wait-on --save-dev

# 3. Add scripts to package.json (see below)

# 4. Run in dev mode
npm run electron:dev

# 5. Build for distribution
npm run electron:build
```

## Scripts to Add to package.json

```json
{
  "main": "electron/main.js",
  "scripts": {
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && tsc -p electron/tsconfig.json && electron .\"",
    "electron:build": "npm run build && tsc -p electron/tsconfig.json && electron-builder",
    "electron:preview": "npm run build && tsc -p electron/tsconfig.json && electron ."
  }
}
```

## Create electron/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Project Structure

```
├── electron/
│   ├── main.ts          # Electron entry point
│   ├── widgetManager.ts # Widget lifecycle management
│   ├── preload.ts       # IPC bridge (renderer ↔ main)
│   └── tray.ts          # System tray menu
│
├── src/
│   ├── widgets/         # Demo widget components
│   │   ├── StatusWidget.tsx
│   │   ├── AssistantWidget.tsx
│   │   ├── MicWidget.tsx
│   │   └── CommandWidget.tsx
│   │
│   ├── styles/
│   │   └── terminal.css # Sci-fi terminal design system
│   │
│   └── lib/
│       └── electron.ts  # Type definitions & hooks
│
├── electron-builder.json # Build configuration
└── README.md
```

## Widget API (from renderer)

```typescript
// Check if running in Electron
if (window.isElectron) {
  // Create a widget
  const widgetId = await window.electron.widgets.create({
    type: 'assistant',
    x: 100,
    y: 100,
    width: 400,
    height: 300,
  });

  // Move widget
  await window.electron.widgets.move(widgetId, { x: 200, y: 200 });

  // Toggle passthrough (clicks pass through)
  await window.electron.widgets.setPassthrough(widgetId, true);

  // Destroy widget
  await window.electron.widgets.destroy(widgetId);

  // Listen for events
  const unsubscribe = window.electron.on('widget:created', (data) => {
    console.log('Widget created:', data);
  });
}
```

## Hotkeys

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+W` | Toggle all widgets visibility |
| `Ctrl+Shift+Q` | Quick spawn Assistant widget |

## Widget Types

- **status** — System stats display (CPU, RAM, uptime)
- **assistant** — AI response area with typing effect
- **mic** — Audio visualizer with states
- **command** — Floating terminal input

## Design System (terminal.css)

- CRT scanline effects
- Phosphor green glow (`#00ff41`)
- Glitch text animations
- Pulse indicators
- Data stream animations
- Noise grain overlay

## Tips

1. Widgets are frameless, transparent `BrowserWindow` instances
2. Use `-webkit-app-region: drag` on headers for dragging
3. Toggle `setIgnoreMouseEvents` for passthrough mode
4. Each widget loads a different route (`/widgets/status`, etc.)
5. HashRouter is used for Electron file:// protocol compatibility
