"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const widgetManager_1 = require("./widgetManager");
const tray_1 = require("./tray");
// Handle creating/removing shortcuts on Windows when installing/uninstalling
const isDev = process.env.NODE_ENV === 'development';
const VITE_DEV_SERVER_URL = 'http://localhost:5173';
let widgetManager;
async function createWidgetManager() {
    widgetManager = new widgetManager_1.WidgetManager(isDev ? VITE_DEV_SERVER_URL : undefined);
    // Setup IPC handlers
    electron_1.ipcMain.handle('widget:create', async (_, config) => {
        return widgetManager.createWidget(config);
    });
    electron_1.ipcMain.handle('widget:move', async (_, id, position) => {
        return widgetManager.moveWidget(id, position);
    });
    electron_1.ipcMain.handle('widget:resize', async (_, id, size) => {
        return widgetManager.resizeWidget(id, size);
    });
    electron_1.ipcMain.handle('widget:destroy', async (_, id) => {
        return widgetManager.destroyWidget(id);
    });
    electron_1.ipcMain.handle('widget:setPassthrough', async (_, id, passthrough) => {
        return widgetManager.setPassthrough(id, passthrough);
    });
    electron_1.ipcMain.handle('widget:bringToFront', async (_, id) => {
        return widgetManager.bringToFront(id);
    });
    electron_1.ipcMain.handle('widget:list', async () => {
        return widgetManager.listWidgets();
    });
    electron_1.ipcMain.handle('widget:destroyAll', async () => {
        return widgetManager.destroyAll();
    });
}
electron_1.app.whenReady().then(async () => {
    await createWidgetManager();
    // Setup system tray
    (0, tray_1.setupTray)(widgetManager);
    // Register global hotkeys
    electron_1.globalShortcut.register('CommandOrControl+Shift+W', () => {
        // Toggle all widgets visibility
        widgetManager.toggleAllVisibility();
    });
    electron_1.globalShortcut.register('CommandOrControl+Shift+Q', () => {
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
electron_1.app.on('will-quit', () => {
    electron_1.globalShortcut.unregisterAll();
});
electron_1.app.on('window-all-closed', () => {
    // Don't quit on window close - we're a tray app
    // Only quit explicitly via tray menu
});
electron_1.app.on('activate', () => {
    // On macOS, re-create widgets if none exist
    if (widgetManager && widgetManager.listWidgets().length === 0) {
        // Could spawn a default widget here
    }
});
// Prevent multiple instances
const gotTheLock = electron_1.app.requestSingleInstanceLock();
if (!gotTheLock) {
    electron_1.app.quit();
}
