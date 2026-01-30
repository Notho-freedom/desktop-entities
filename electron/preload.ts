import { contextBridge, ipcRenderer } from 'electron';

// Type definitions for the exposed API
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

export interface ElectronAPI {
  widgets: {
    create: (config: WidgetConfig) => Promise<string>;
    move: (id: string, position: { x: number; y: number }) => Promise<boolean>;
    resize: (id: string, size: { width: number; height: number }) => Promise<boolean>;
    destroy: (id: string) => Promise<boolean>;
    setPassthrough: (id: string, passthrough: boolean) => Promise<boolean>;
    bringToFront: (id: string) => Promise<boolean>;
    list: () => Promise<Array<{ id: string; config: WidgetConfig; visible: boolean }>>;
    destroyAll: () => Promise<void>;
  };
  on: (channel: string, callback: (...args: unknown[]) => void) => () => void;
  off: (channel: string, callback: (...args: unknown[]) => void) => void;
}

// Expose protected methods that allow the renderer to interact with the main process
contextBridge.exposeInMainWorld('electron', {
  widgets: {
    create: (config: WidgetConfig) => ipcRenderer.invoke('widget:create', config),
    move: (id: string, position: { x: number; y: number }) => 
      ipcRenderer.invoke('widget:move', id, position),
    resize: (id: string, size: { width: number; height: number }) => 
      ipcRenderer.invoke('widget:resize', id, size),
    destroy: (id: string) => ipcRenderer.invoke('widget:destroy', id),
    setPassthrough: (id: string, passthrough: boolean) => 
      ipcRenderer.invoke('widget:setPassthrough', id, passthrough),
    bringToFront: (id: string) => ipcRenderer.invoke('widget:bringToFront', id),
    list: () => ipcRenderer.invoke('widget:list'),
    destroyAll: () => ipcRenderer.invoke('widget:destroyAll'),
  },
  
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => callback(...args);
    ipcRenderer.on(channel, subscription);
    
    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
  
  off: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
} as ElectronAPI);

// Also expose a way to check if we're in Electron
contextBridge.exposeInMainWorld('isElectron', true);
