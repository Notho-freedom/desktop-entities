
# Correction des Widgets Electron - Analyse et Plan

## Problèmes Identifiés

### 1. Conflit de fichiers main.cjs vs main.js
Le `package.json` référence `"main": "electron/main.cjs"` mais tu as deux fichiers différents :
- `main.cjs` (ligne 61-71) : spawn les widgets **seulement en mode dev** (`if (isDev)`)
- `main.js` / `main.ts` : spawn toujours un widget au démarrage

Le problème : en mode production, `main.cjs` ne crée AUCUN widget automatiquement.

### 2. URL de chargement incorrecte en production
Dans `widgetManager.ts` ligne 44-46, le chemin de production :
```ts
const distPath = path.join(__dirname, '..', 'dist', 'index.html');
const url = `file:///${distPath.replace(/\\/g, '/')}#${route}`;
```

Ce chemin peut être incorrect selon où Electron s'exécute. `__dirname` dans un contexte Electron packagé pointe vers `resources/app/electron/`, pas vers la racine du projet.

### 3. Mode transparent désactivé
Dans `widgetManager.ts` ligne 57 :
```ts
const useTransparency = false; // CHANGED: Disable transparency for debugging
```

Cela force les fenêtres à avoir un fond opaque (`#0a0f0a`), mais si le contenu React ne se charge pas, tu vois juste une fenêtre noire.

### 4. CSS Tailwind non chargé dans les widgets
Le `body` dans `src/index.css` applique `@apply bg-background text-foreground` qui est blanc par défaut (mode light). Les widgets ont besoin du dark mode ou de styles explicites.

### 5. Les widgets n'importent pas correctement les styles globaux
Les widgets importent `@/styles/terminal.css` mais pas `@/index.css` où Tailwind est initialisé.

---

## Corrections à Apporter

### Correction 1 : Synchroniser main.cjs avec main.ts
Le fichier `main.cjs` doit toujours spawner un widget initial, pas seulement en dev.

### Correction 2 : Fixer le chemin de production pour les widgets
Utiliser `app.getAppPath()` au lieu de `__dirname` pour un chemin fiable.

### Correction 3 : Appliquer les styles globaux aux widgets
Chaque widget doit avoir le fond terminal appliqué via CSS.

### Correction 4 : Gérer correctement le mode transparent vs debug
Séparer clairement les deux modes avec une variable d'environnement.

### Correction 5 : Ajouter des logs de diagnostic
Pour voir exactement ce qui se passe quand les widgets sont créés.

---

## Fichiers à Modifier

| Fichier | Modification |
|---------|-------------|
| `electron/widgetManager.ts` | Fixer le chemin de production, améliorer les logs |
| `electron/main.ts` | Toujours spawner un widget initial |
| `src/widgets/StatusWidget.tsx` | Ajouter fond explicite pour debug |
| `src/widgets/AssistantWidget.tsx` | Idem |
| `src/widgets/MicWidget.tsx` | Idem |
| `src/widgets/CommandWidget.tsx` | Idem |
| `src/index.css` | Ajouter styles de base pour widgets |

---

## Détails Techniques

### widgetManager.ts - Nouveau calcul du chemin

```text
// Avant (incorrect en production packagée)
const distPath = path.join(__dirname, '..', 'dist', 'index.html');

// Après (correct)
import { app } from 'electron';
const distPath = path.join(app.getAppPath(), 'dist', 'index.html');
```

### Widgets - Fond explicite

Chaque widget recevra une classe CSS pour garantir un fond visible :
```css
.widget-root {
  background: var(--terminal-bg);
  min-height: 100vh;
  min-width: 100vw;
}
```

### Mode debug vs production

Variable pour contrôler facilement :
```ts
const DEBUG_MODE = process.env.DEBUG_WIDGETS === 'true';
const useTransparency = !DEBUG_MODE;
```

---

## Résultat Attendu

Après ces corrections :
1. Les widgets s'affichent avec le fond vert terminal sci-fi
2. En mode transparent, le fond est translucide avec les effets CRT
3. Le chemin de production fonctionne correctement
4. Les logs permettent de diagnostiquer les problèmes

