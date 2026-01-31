"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer to interact with the main process
electron_1.contextBridge.exposeInMainWorld('electron', {
    widgets: {
        create: (config) => electron_1.ipcRenderer.invoke('widget:create', config),
        move: (id, position) => electron_1.ipcRenderer.invoke('widget:move', id, position),
        resize: (id, size) => electron_1.ipcRenderer.invoke('widget:resize', id, size),
        destroy: (id) => electron_1.ipcRenderer.invoke('widget:destroy', id),
        setPassthrough: (id, passthrough) => electron_1.ipcRenderer.invoke('widget:setPassthrough', id, passthrough),
        bringToFront: (id) => electron_1.ipcRenderer.invoke('widget:bringToFront', id),
        list: () => electron_1.ipcRenderer.invoke('widget:list'),
        destroyAll: () => electron_1.ipcRenderer.invoke('widget:destroyAll'),
    },
    on: (channel, callback) => {
        const subscription = (_event, ...args) => callback(...args);
        electron_1.ipcRenderer.on(channel, subscription);
        // Return unsubscribe function
        return () => {
            electron_1.ipcRenderer.removeListener(channel, subscription);
        };
    },
    off: (channel, callback) => {
        electron_1.ipcRenderer.removeListener(channel, callback);
    },
});
// Also expose a way to check if we're in Electron
electron_1.contextBridge.exposeInMainWorld('isElectron', true);
