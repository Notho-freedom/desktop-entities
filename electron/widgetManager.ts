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
  }

  private generateId(): string {
    return `widget_${Date.now()}_${++this.idCounter}`;
  }

  private getWidgetUrl(type: string): string {
    const route = `/widgets/${type}`;
    if (this.devServerUrl) {
      return `${this.devServerUrl}${route}`;
    }
    // Production: load from file
    return `file://${path.join(__dirname, '../dist/index.html')}#${route}`;
  }

  createWidget(config: WidgetConfig): string {
    const id = config.id || this.generateId();
    
    const win = new BrowserWindow({
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
