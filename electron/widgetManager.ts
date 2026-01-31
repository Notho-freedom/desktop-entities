import { BrowserWindow, screen } from 'electron';
import * as path from 'path';

export interface WidgetConfig {
  id?: string;
  type: 'status' | 'assistant' | 'mic' | 'command';
  x: number;
  y: number;
  width: number;
  height: number;
  passthrough?: boolean;
  alwaysOnTop?: boolean;
}

interface Widget {
  id: string;
  window: BrowserWindow;
  config: WidgetConfig;
  visible: boolean;
}

export class WidgetManager {
  private widgets: Map<string, Widget> = new Map();
  private devServerUrl?: string;
  private idCounter = 0;

  constructor(devServerUrl?: string) {
    this.devServerUrl = devServerUrl;
    console.log('[WidgetManager] Initialized with devServerUrl:', devServerUrl || 'production');
  }

  private generateId(): string {
    return `widget_${Date.now()}_${++this.idCounter}`;
  }

  private getWidgetUrl(type: string): string {
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

  createWidget(config: WidgetConfig): string {
    const id = config.id || this.generateId();
    
    console.log(`[WidgetManager] Creating widget ${id}:`, config);
    
    // DEBUGGING: Force non-transparent for testing
    const isProduction = !this.devServerUrl;
    const useTransparency = false; // CHANGED: Disable transparency for debugging
    
    const win = new BrowserWindow({
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

  moveWidget(id: string, position: { x: number; y: number }): boolean {
    const widget = this.widgets.get(id);
    if (!widget) return false;

    widget.window.setPosition(position.x, position.y, false);
    widget.config.x = position.x;
    widget.config.y = position.y;
    return true;
  }

  resizeWidget(id: string, size: { width: number; height: number }): boolean {
    const widget = this.widgets.get(id);
    if (!widget) return false;

    widget.window.setSize(size.width, size.height, false);
    widget.config.width = size.width;
    widget.config.height = size.height;
    return true;
  }

  destroyWidget(id: string): boolean {
    const widget = this.widgets.get(id);
    if (!widget) return false;

    widget.window.close();
    return true;
  }

  setPassthrough(id: string, passthrough: boolean): boolean {
    const widget = this.widgets.get(id);
    if (!widget) return false;

    widget.window.setIgnoreMouseEvents(passthrough, { forward: true });
    widget.config.passthrough = passthrough;
    return true;
  }

  bringToFront(id: string): boolean {
    const widget = this.widgets.get(id);
    if (!widget) return false;

    widget.window.moveTop();
    widget.window.focus();
    return true;
  }

  toggleVisibility(id: string): boolean {
    const widget = this.widgets.get(id);
    if (!widget) return false;

    if (widget.visible) {
      widget.window.hide();
    } else {
      widget.window.show();
    }
    widget.visible = !widget.visible;
    return true;
  }

  toggleAllVisibility(): void {
    const allVisible = Array.from(this.widgets.values()).every(w => w.visible);
    
    console.log(`[WidgetManager] Toggling all widgets. Currently all visible: ${allVisible}`);
    
    this.widgets.forEach(widget => {
      if (allVisible) {
        widget.window.hide();
        widget.visible = false;
      } else {
        widget.window.show();
        widget.visible = true;
      }
    });
  }

  listWidgets(): Array<{ id: string; config: WidgetConfig; visible: boolean }> {
    return Array.from(this.widgets.values()).map(w => ({
      id: w.id,
      config: w.config,
      visible: w.visible,
    }));
  }

  destroyAll(): void {
    console.log(`[WidgetManager] Destroying all ${this.widgets.size} widgets`);
    this.widgets.forEach(widget => {
      widget.window.close();
    });
    this.widgets.clear();
  }

  getScreenInfo(): { width: number; height: number } {
    return screen.getPrimaryDisplay().workAreaSize;
  }

  private broadcastEvent(event: string, data: unknown): void {
    this.widgets.forEach(widget => {
      if (!widget.window.isDestroyed()) {
        widget.window.webContents.send(event, data);
      }
    });
  }
}