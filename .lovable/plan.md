# Electron Widgets - Corrections Appliquées ✅

## Problèmes Corrigés

### 1. ✅ Chemin de production fixé
- Utilisation de `app.getAppPath()` au lieu de `__dirname`
- Gestion correcte des chemins Windows et Unix

### 2. ✅ Widget initial spawné toujours
- `main.ts` et `main.cjs` synchronisés
- Widget créé au démarrage en dev ET production

### 3. ✅ Styles CSS appliqués aux widgets
- Import de `@/index.css` dans chaque widget
- Classe `.widget-root` avec fond terminal
- Attribut `data-widget` pour ciblage CSS

### 4. ✅ Mode debug séparé
- Variable `DEBUG_WIDGETS=true` pour activer les DevTools et frames
- Transparence activée par défaut

---

## Pour Tester

### Mode Normal (transparent)
```bash
npm run electron:dev
```

### Mode Debug (avec frames et DevTools)
```bash
DEBUG_WIDGETS=true npm run electron:dev
```

---

## Fichiers Modifiés

| Fichier | Modification |
|---------|-------------|
| `electron/widgetManager.ts` | Chemin `app.getAppPath()`, logs améliorés |
| `electron/main.ts` | Widget initial toujours créé |
| `electron/main.cjs` | Synchronisé avec main.ts |
| `src/widgets/*.tsx` | Import CSS, classe `.widget-root` |
| `src/index.css` | Styles `.widget-root` ajoutés |

---

## Hotkeys

- `Ctrl+Shift+W` : Toggle visibilité de tous les widgets
- `Ctrl+Shift+Q` : Spawn un nouveau widget assistant
