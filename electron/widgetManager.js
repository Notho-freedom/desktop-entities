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
exports.WidgetManager = void 0;
const electron_1 = require("electron");
const path = __importStar(require("path"));
class WidgetManager {
    constructor(devServerUrl) {
        this.widgets = new Map();
        this.idCounter = 0;
        this.devServerUrl = devServerUrl;
        console.log('[WidgetManager] Initialized with devServerUrl:', devServerUrl || 'production');
    }
    generateId() {
        return `widget_${Date.now()}_${++this.idCounter}`;
    }
    getWidgetUrl(type) {
        const route = `/widgets/${type}`;
        if (this.devServerUrl) {
            const url = `${this.devServerUrl}/#${route}`;
            console.log('[WidgetManager] Loading dev URL:', url);
            return url;
        }
        // Production: load from file - FIXED for Windows
        const distPath = path.join(__dirname, '..', 'dist', 'index.html');
        const url = `file:///${distPath.replace(/\\/g, '/')}#${route}`;
        console.log('[WidgetManager] Loading production URL:', url);
        return url;
    }
    createWidget(config) {
        const id = config.id || this.generateId();
        console.log(`[WidgetManager] Creating widget ${id}:`, config);
        // DEBUGGING: Force non-transparent for testing
        const isProduction = !this.devServerUrl;
        const useTransparency = false; // CHANGED: Disable transparency for debugging
        const win = new electron_1.BrowserWindow({
            x: config.x,
            y: config.y,
            width: config.width,
            height: config.height,
            frame: !useTransparency, // Show frame if not transparent
            transparent: useTransparency,
            resizable: true,
            alwaysOnTop: config.alwaysOnTop !== false,
            skipTaskbar: false, // CHANGED: Show in taskbar for debugging
            focusable: true,
            hasShadow: true,
            backgroundColor: useTransparency ? '#00000000' : '#0a0f0a', // Dark background for testing
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
                preload: path.join(__dirname, 'preload.js'),
                devTools: true, // Always enable DevTools
            },
        });
        // CRITICAL: Make sure window is visible
        win.setOpacity(1.0);
        // Set passthrough mode if requested
        if (config.passthrough) {
            win.setIgnoreMouseEvents(true, { forward: true });
        }
        // Load the widget URL
        const url = this.getWidgetUrl(config.type);
        console.log('[WidgetManager] About to load URL:', url);
        win.loadURL(url).then(() => {
            console.log(`[WidgetManager] Widget ${id} loaded successfully`);
            win.show(); // Explicitly show the window
            win.focus(); // Give it focus initially
            // ALWAYS open DevTools for debugging
            win.webContents.openDevTools({ mode: 'detach' });
            console.log(`[WidgetManager] Widget ${id} is now visible:`, win.isVisible());
            console.log(`[WidgetManager] Widget ${id} bounds:`, win.getBounds());
        }).catch((err) => {
            console.error(`[WidgetManager] Failed to load widget ${id}:`, err);
        });
        // Log console messages from the renderer
        win.webContents.on('console-message', (event, level, message, line, sourceId) => {
            console.log(`[Widget ${id}] ${message}`);
        });
        // Log when page finishes loading
        win.webContents.on('did-finish-load', () => {
            console.log(`[WidgetManager] Widget ${id} finished loading`);
        });
        // Log navigation errors
        win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
            console.error(`[WidgetManager] Widget ${id} failed to load:`, errorCode, errorDescription);
        });
        // Handle window close
        win.on('closed', () => {
            console.log(`[WidgetManager] Widget ${id} closed`);
            this.widgets.delete(id);
            this.broadcastEvent('widget:destroyed', { id });
        });
        // Store widget reference
        this.widgets.set(id, {
            id,
            window: win,
            config: { ...config, id },
            visible: true,
        });
        this.broadcastEvent('widget:created', { id, config });
        return id;
    }
    moveWidget(id, position) {
        const widget = this.widgets.get(id);
        if (!widget)
            return false;
        widget.window.setPosition(position.x, position.y, false);
        widget.config.x = position.x;
        widget.config.y = position.y;
        return true;
    }
    resizeWidget(id, size) {
        const widget = this.widgets.get(id);
        if (!widget)
            return false;
        widget.window.setSize(size.width, size.height, false);
        widget.config.width = size.width;
        widget.config.height = size.height;
        return true;
    }
    destroyWidget(id) {
        const widget = this.widgets.get(id);
        if (!widget)
            return false;
        widget.window.close();
        return true;
    }
    setPassthrough(id, passthrough) {
        const widget = this.widgets.get(id);
        if (!widget)
            return false;
        widget.window.setIgnoreMouseEvents(passthrough, { forward: true });
        widget.config.passthrough = passthrough;
        return true;
    }
    bringToFront(id) {
        const widget = this.widgets.get(id);
        if (!widget)
            return false;
        widget.window.moveTop();
        widget.window.focus();
        return true;
    }
    toggleVisibility(id) {
        const widget = this.widgets.get(id);
        if (!widget)
            return false;
        if (widget.visible) {
            widget.window.hide();
        }
        else {
            widget.window.show();
        }
        widget.visible = !widget.visible;
        return true;
    }
    toggleAllVisibility() {
        const allVisible = Array.from(this.widgets.values()).every(w => w.visible);
        console.log(`[WidgetManager] Toggling all widgets. Currently all visible: ${allVisible}`);
        this.widgets.forEach(widget => {
            if (allVisible) {
                widget.window.hide();
                widget.visible = false;
            }
            else {
                widget.window.show();
                widget.visible = true;
            }
        });
    }
    listWidgets() {
        return Array.from(this.widgets.values()).map(w => ({
            id: w.id,
            config: w.config,
            visible: w.visible,
        }));
    }
    destroyAll() {
        console.log(`[WidgetManager] Destroying all ${this.widgets.size} widgets`);
        this.widgets.forEach(widget => {
            widget.window.close();
        });
        this.widgets.clear();
    }
    getScreenInfo() {
        return electron_1.screen.getPrimaryDisplay().workAreaSize;
    }
    broadcastEvent(event, data) {
        this.widgets.forEach(widget => {
            if (!widget.window.isDestroyed()) {
                widget.window.webContents.send(event, data);
            }
        });
    }
}
exports.WidgetManager = WidgetManager;
