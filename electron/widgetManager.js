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
    }
    generateId() {
        return `widget_${Date.now()}_${++this.idCounter}`;
    }
    getWidgetUrl(type) {
        const route = `/widgets/${type}`;
        if (this.devServerUrl) {
            return `${this.devServerUrl}${route}`;
        }
        // Production: load from file
        return `file://${path.join(__dirname, '../dist/index.html')}#${route}`;
    }
    createWidget(config) {
        const id = config.id || this.generateId();
        const win = new electron_1.BrowserWindow({
            x: config.x,
            y: config.y,
            width: config.width,
            height: config.height,
            frame: false,
            transparent: true,
            resizable: false,
            alwaysOnTop: config.alwaysOnTop !== false,
            skipTaskbar: true,
            focusable: true,
            hasShadow: false,
            backgroundColor: '#00000000',
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
                preload: path.join(__dirname, 'preload.js'),
            },
        });
        // Set passthrough mode if requested
        if (config.passthrough) {
            win.setIgnoreMouseEvents(true, { forward: true });
        }
        // Load the widget URL
        const url = this.getWidgetUrl(config.type);
        win.loadURL(url);
        // Open DevTools in dev mode
        if (this.devServerUrl) {
            // win.webContents.openDevTools({ mode: 'detach' });
        }
        // Handle window close
        win.on('closed', () => {
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
