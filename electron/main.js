"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const widgetManager_1 = require("./widgetManager");
const tray_1 = require("./tray");
const isDev = process.env.NODE_ENV === 'development';
const VITE_DEV_SERVER_URL = 'http://localhost:8080';
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
        widgetManager.toggleAllVisibility();
    });
    electron_1.globalShortcut.register('CommandOrControl+Shift+Q', () => {
        widgetManager.createWidget({
            type: 'assistant',
            x: 100,
            y: 100,
            width: 400,
            height: 300,
        });
    });
    // ALWAYS spawn at least one initial widget on startup
    const { width: screenWidth, height: screenHeight } = electron_1.screen.getPrimaryDisplay().workAreaSize;
    console.log(`[DESKTOP DOMINATION] Screen size: ${screenWidth}x${screenHeight}`);
    console.log('[DESKTOP DOMINATION] Spawning initial status widget...');
    const widgetId = widgetManager.createWidget({
        type: 'status',
        x: 320,
        y: 200,
        width: 300,
        height: 180,
        alwaysOnTop: true,
    });
    console.log(`[DESKTOP DOMINATION] Widget created with ID: ${widgetId}`);
});
electron_1.app.on('will-quit', () => {
    electron_1.globalShortcut.unregisterAll();
});
electron_1.app.on('window-all-closed', () => {
    // Don't quit - we're a tray app
});
electron_1.app.on('activate', () => {
    if (widgetManager && widgetManager.listWidgets().length === 0) {
        const { width: screenWidth, height: screenHeight } = electron_1.screen.getPrimaryDisplay().workAreaSize;
        widgetManager.createWidget({
            type: 'status',
            x: 320,
            y: 200,
            width: 300,
            height: 180,
        });
    }
});
// Prevent multiple instances
const gotTheLock = electron_1.app.requestSingleInstanceLock();
if (!gotTheLock) {
    electron_1.app.quit();
}
electron_1.app.on('window-all-closed', () => {
    electron_1.app.quit();
});
