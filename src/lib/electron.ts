// Type definitions for the Electron API exposed via preload

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

declare global {
  interface Window {
    electron?: ElectronAPI;
    isElectron?: boolean;
  }
}

// Hook to safely access Electron API
export function useElectron(): ElectronAPI | null {
  if (typeof window !== 'undefined' && window.electron) {
    return window.electron;
  }
  return null;
}

// Check if running in Electron
export function isElectron(): boolean {
  return typeof window !== 'undefined' && window.isElectron === true;
}
