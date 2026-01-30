

# 🖥️ Desktop Domination — Electron Overlay System

## Vision
Système d'overlay desktop sans fenêtres traditionnelles — des surfaces UI flottantes et transparentes qui vivent sur le bureau comme un HUD sci-fi.

---

## 📁 Structure du Projet

### Partie Electron (Main Process)
- **`electron/main.ts`** — Point d'entrée Electron avec app lifecycle
- **`electron/widgetManager.ts`** — Gestionnaire de widgets (create, move, destroy, toggle passthrough)
- **`electron/preload.ts`** — Bridge IPC sécurisé pour la communication renderer ↔ main
- **`electron/tray.ts`** — System tray optionnel pour contrôle global

### Configuration
- **`electron-builder.json`** — Config pour packager l'app
- **`vite.config.electron.ts`** — Build config pour Electron + React

---

## 🧩 Widgets Démo (Sci-Fi Terminal Style)

### 1. Status Widget
- Affiche l'état du système (CPU, RAM simulé)
- Effet scanline + texte monospace vert phosphore
- Animation de "data stream"

### 2. Assistant Widget  
- Zone de réponse IA avec effet de typage
- Indicateur de "thinking" pulsant
- Border glow animé

### 3. Mic Widget
- Visualisation audio simplifiée
- États : idle / listening / processing
- Forme géométrique réactive

### 4. Command Input Widget
- Input flottant style terminal
- Historique des commandes
- Auto-complete basique

---

## 🎨 Design System Sci-Fi Terminal

### Palette
- Background : `#0a0f0a` (noir verdâtre profond)
- Primary : `#00ff41` (vert phosphore classique)
- Secondary : `#0d6832` (vert sombre)
- Accent : `#39ff14` (vert néon intense)
- Text : `#b5ffb5` (vert pâle pour lisibilité)

### Effets
- **Scanlines** — overlay CSS subtil
- **CRT glow** — text-shadow multi-layer
- **Noise grain** — animation CSS background
- **Border flicker** — animation intermittente

### Typographie
- Font : `JetBrains Mono` ou `IBM Plex Mono`
- Effet de glitch occasionnel sur les titres

---

## 🔌 API de Communication (IPC)

### Depuis les widgets (Renderer → Main)
```
electron.widgets.create({ type, x, y, width, height })
electron.widgets.move(id, { x, y })
electron.widgets.resize(id, { width, height })
electron.widgets.destroy(id)
electron.widgets.setPassthrough(id, boolean)
electron.widgets.bringToFront(id)
```

### Événements (Main → Renderer)
```
electron.on('widget:created', callback)
electron.on('widget:destroyed', callback)
electron.on('system:hotkey', callback)
```

---

## 🧪 Scénario de Démo

1. **Au lancement** → Tray icon apparaît, pas de fenêtre visible
2. **Click tray** → Menu pour spawner des widgets
3. **Spawn "Status"** → Widget apparaît en bas à droite avec animations
4. **Spawn "Assistant"** → Widget en haut à gauche, prêt pour input IA
5. **Spawn "Mic"** → Petit widget flottant, visualise le "son"
6. **Mode passthrough** → Toggle pour laisser passer les clics

---

## 📦 Fichiers Livrés

| Fichier | Description |
|---------|-------------|
| `electron/main.ts` | Entry point Electron |
| `electron/widgetManager.ts` | Logique de gestion des widgets |
| `electron/preload.ts` | Bridge IPC sécurisé |
| `src/widgets/StatusWidget.tsx` | Démo widget système |
| `src/widgets/AssistantWidget.tsx` | Démo widget IA |
| `src/widgets/MicWidget.tsx` | Démo widget micro |
| `src/widgets/CommandWidget.tsx` | Démo input flottant |
| `src/styles/terminal.css` | Design system sci-fi |
| `package.json` | Scripts Electron ajoutés |
| `electron-builder.json` | Config de build |

---

## 🚀 Pour Continuer en Local

Une fois le code généré :
1. `npm install electron electron-builder --save-dev`
2. `npm run electron:dev` pour dev
3. `npm run electron:build` pour packager
4. Intègre tes vrais widgets à la place des démos

