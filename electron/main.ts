import { app, BrowserWindow, ipcMain, globalShortcut, screen } from 'electron';
import * as path from 'path';
import { WidgetManager } from './widgetManager';
import { setupTray } from './tray';

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

const isDev = process.env.NODE_ENV === 'development';
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:8080';

console.log('[DESKTOP DOMINATION] Starting...');
console.log('[DESKTOP DOMINATION] isDev:', isDev);
console.log('[DESKTOP DOMINATION] Dev server URL:', VITE_DEV_SERVER_URL);

let widgetManager: WidgetManager;

async function createWidgetManager() {
  widgetManager = new WidgetManager(isDev ? VITE_DEV_SERVER_URL : undefined);
  
  // Setup IPC handlers
  ipcMain.handle('widget:create', async (_, config) => {
    return widgetManager.createWidget(config);
  });

  ipcMain.handle('widget:move', async (_, id: string, position: { x: number; y: number }) => {
    return widgetManager.moveWidget(id, position);
  });

  ipcMain.handle('widget:resize', async (_, id: string, size: { width: number; height: number }) => {
    return widgetManager.resizeWidget(id, size);
  });

  ipcMain.handle('widget:destroy', async (_, id: string) => {
    return widgetManager.destroyWidget(id);
  });

  ipcMain.handle('widget:setPassthrough', async (_, id: string, passthrough: boolean) => {
    return widgetManager.setPassthrough(id, passthrough);
  });

  ipcMain.handle('widget:bringToFront', async (_, id: string) => {
    return widgetManager.bringToFront(id);
  });

  ipcMain.handle('widget:list', async () => {
    return widgetManager.listWidgets();
  });

  ipcMain.handle('widget:destroyAll', async () => {
    return widgetManager.destroyAll();
  });
}

app.whenReady().then(async () => {
  console.log('[DESKTOP DOMINATION] App ready');
  
  await createWidgetManager();
  
  // Setup system tray
  setupTray(widgetManager);

  // Register global hotkeys
  globalShortcut.register('CommandOrControl+Shift+W', () => {
    console.log('[DESKTOP DOMINATION] Hotkey: Toggle visibility');
    widgetManager.toggleAllVisibility();
  });

  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    console.log('[DESKTOP DOMINATION] Hotkey: Spawn assistant');
    widgetManager.createWidget({
      type: 'assistant',
      x: 100,
      y: 100,
      width: 400,
      height: 300,
    });
  });

  // ALWAYS spawn initial widget on startup (both dev and production)
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  
  console.log(`[DESKTOP DOMINATION] Screen size: ${screenWidth}x${screenHeight}`);
  console.log('[DESKTOP DOMINATION] Spawning initial status widget...');
  
  const widgetId = widgetManager.createWidget({
    type: 'status',
    x: screenWidth - 350,
    y: screenHeight - 230,
    width: 300,
    height: 180,
    alwaysOnTop: true,
  });
  
  console.log(`[DESKTOP DOMINATION] Initial widget created: ${widgetId}`);
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  // Don't quit - we're a tray app
  // Only quit explicitly via tray menu
});

app.on('activate', () => {
  // On macOS, re-create widgets if none exist
  if (widgetManager && widgetManager.listWidgets().length === 0) {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    widgetManager.createWidget({
      type: 'status',
      x: screenWidth - 350,
      y: screenHeight - 230,
      width: 300,
      height: 180,
    });
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}
