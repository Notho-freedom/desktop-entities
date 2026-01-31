import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import * as path from 'path';
import { WidgetManager } from './widgetManager';
import { setupTray } from './tray';

// Handle creating/removing shortcuts on Windows when installing/uninstalling


const isDev = process.env.NODE_ENV === 'development';
const VITE_DEV_SERVER_URL = 'http://localhost:5173';

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
  await createWidgetManager();
  
  // Setup system tray
  setupTray(widgetManager);

  // Register global hotkeys
  globalShortcut.register('CommandOrControl+Shift+W', () => {
    // Toggle all widgets visibility
    widgetManager.toggleAllVisibility();
  });

  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    // Quick spawn assistant widget
    widgetManager.createWidget({
      type: 'assistant',
      x: 100,
      y: 100,
      width: 400,
      height: 300,
    });
  });

  // Spawn initial demo widgets
  if (isDev) {
    // Status widget - bottom right
    const { width: screenWidth, height: screenHeight } = require('electron').screen.getPrimaryDisplay().workAreaSize;
    
    widgetManager.createWidget({
      type: 'status',
      x: screenWidth - 320,
      y: screenHeight - 200,
      width: 300,
      height: 180,
    });
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  // Don't quit on window close - we're a tray app
  // Only quit explicitly via tray menu
});

app.on('activate', () => {
  // On macOS, re-create widgets if none exist
  if (widgetManager && widgetManager.listWidgets().length === 0) {
    // Could spawn a default widget here
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}
