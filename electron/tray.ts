import { Tray, Menu, app, nativeImage } from 'electron';
import * as path from 'path';
import { WidgetManager } from './widgetManager';

let tray: Tray | null = null;

export function setupTray(widgetManager: WidgetManager): void {
  // Create a simple tray icon (green circle for sci-fi terminal theme)
  // In production, use a proper icon file
  const iconSize = 16;
  const icon = nativeImage.createEmpty();
  
  // Try to load icon from assets, fallback to generated
  try {
    const iconPath = path.join(__dirname, '../public/tray-icon.png');
    const loadedIcon = nativeImage.createFromPath(iconPath);
    if (!loadedIcon.isEmpty()) {
      tray = new Tray(loadedIcon.resize({ width: iconSize, height: iconSize }));
    }
  } catch {
    // Create a simple colored icon programmatically
    const canvas = Buffer.alloc(iconSize * iconSize * 4);
    for (let i = 0; i < iconSize * iconSize; i++) {
      const x = i % iconSize;
      const y = Math.floor(i / iconSize);
      const centerX = iconSize / 2;
      const centerY = iconSize / 2;
      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      if (dist < iconSize / 2 - 1) {
        // Green phosphor color
        canvas[i * 4] = 0;     // R
        canvas[i * 4 + 1] = 255; // G
        canvas[i * 4 + 2] = 65;  // B
        canvas[i * 4 + 3] = 255; // A
      } else {
        canvas[i * 4 + 3] = 0; // Transparent
      }
    }
    
    tray = new Tray(nativeImage.createFromBuffer(canvas, { width: iconSize, height: iconSize }));
  }

  if (!tray) {
    tray = new Tray(nativeImage.createEmpty());
  }

  tray.setToolTip('Desktop Domination - HUD System');

  const updateContextMenu = () => {
    const widgets = widgetManager.listWidgets();
    const screenInfo = widgetManager.getScreenInfo();
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '🖥️ Desktop Domination',
        enabled: false,
      },
      { type: 'separator' },
      {
        label: '➕ Spawn Widget',
        submenu: [
          {
            label: '📊 Status Widget',
            click: () => {
              widgetManager.createWidget({
                type: 'status',
                x: screenInfo.width - 320,
                y: screenInfo.height - 200,
                width: 300,
                height: 180,
              });
              updateContextMenu();
            },
          },
          {
            label: '🤖 Assistant Widget',
            click: () => {
              widgetManager.createWidget({
                type: 'assistant',
                x: 50,
                y: 50,
                width: 400,
                height: 300,
              });
              updateContextMenu();
            },
          },
          {
            label: '🎤 Mic Widget',
            click: () => {
              widgetManager.createWidget({
                type: 'mic',
                x: screenInfo.width / 2 - 60,
                y: screenInfo.height - 150,
                width: 120,
                height: 120,
              });
              updateContextMenu();
            },
          },
          {
            label: '⌨️ Command Widget',
            click: () => {
              widgetManager.createWidget({
                type: 'command',
                x: screenInfo.width / 2 - 200,
                y: 50,
                width: 400,
                height: 60,
              });
              updateContextMenu();
            },
          },
        ],
      },
      { type: 'separator' },
      {
        label: `📋 Active Widgets (${widgets.length})`,
        submenu: widgets.length > 0 ? widgets.map(w => ({
          label: `${w.config.type} [${w.id.slice(-6)}]`,
          submenu: [
            {
              label: w.visible ? '👁️ Hide' : '👁️ Show',
              click: () => {
                const widget = widgetManager.listWidgets().find(x => x.id === w.id);
                if (widget) {
                  // Toggle visibility would be implemented here
                }
              },
            },
            {
              label: '🔝 Bring to Front',
              click: () => widgetManager.bringToFront(w.id),
            },
            {
              label: w.config.passthrough ? '🖱️ Enable Clicks' : '👻 Passthrough',
              click: () => {
                widgetManager.setPassthrough(w.id, !w.config.passthrough);
                updateContextMenu();
              },
            },
            { type: 'separator' as const },
            {
              label: '❌ Close',
              click: () => {
                widgetManager.destroyWidget(w.id);
                updateContextMenu();
              },
            },
          ],
        })) : [{ label: 'No widgets', enabled: false }],
      },
      { type: 'separator' },
      {
        label: '👁️ Toggle All (Ctrl+Shift+W)',
        click: () => widgetManager.toggleAllVisibility(),
      },
      {
        label: '🗑️ Close All Widgets',
        click: () => {
          widgetManager.destroyAll();
          updateContextMenu();
        },
      },
      { type: 'separator' },
      {
        label: '❌ Quit',
        click: () => {
          widgetManager.destroyAll();
          app.quit();
        },
      },
    ]);

    tray!.setContextMenu(contextMenu);
  };

  updateContextMenu();

  // Update menu when widgets change
  setInterval(updateContextMenu, 2000);
}
