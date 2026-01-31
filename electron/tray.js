"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTray = setupTray;
const electron_1 = require("electron");
const path = __importStar(require("path"));
let tray = null;
function setupTray(widgetManager) {
    // Create a simple tray icon (green circle for sci-fi terminal theme)
    // In production, use a proper icon file
    const iconSize = 16;
    const icon = electron_1.nativeImage.createEmpty();
    // Try to load icon from assets, fallback to generated
    try {
        const iconPath = path.join(__dirname, '../public/tray-icon.png');
        const loadedIcon = electron_1.nativeImage.createFromPath(iconPath);
        if (!loadedIcon.isEmpty()) {
            tray = new electron_1.Tray(loadedIcon.resize({ width: iconSize, height: iconSize }));
        }
    }
    catch {
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
                canvas[i * 4] = 0; // R
                canvas[i * 4 + 1] = 255; // G
                canvas[i * 4 + 2] = 65; // B
                canvas[i * 4 + 3] = 255; // A
            }
            else {
                canvas[i * 4 + 3] = 0; // Transparent
            }
        }
        tray = new electron_1.Tray(electron_1.nativeImage.createFromBuffer(canvas, { width: iconSize, height: iconSize }));
    }
    if (!tray) {
        tray = new electron_1.Tray(electron_1.nativeImage.createEmpty());
    }
    tray.setToolTip('Desktop Domination - HUD System');
    const updateContextMenu = () => {
        const widgets = widgetManager.listWidgets();
        const screenInfo = widgetManager.getScreenInfo();
        const contextMenu = electron_1.Menu.buildFromTemplate([
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
                        { type: 'separator' },
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
                    electron_1.app.quit();
                },
            },
        ]);
        tray.setContextMenu(contextMenu);
    };
    updateContextMenu();
    // Update menu when widgets change
    setInterval(updateContextMenu, 2000);
}
