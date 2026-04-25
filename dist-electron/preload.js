"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// preload.ts
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// specific electron APIs without giving full access.
electron_1.contextBridge.exposeInMainWorld('electron', {
    // You can add functions here as needed, e.g.:
    // send: (channel: string, data: any) => ipcRenderer.send(channel, data),
    // receive: (channel: string, func: (...args: any[]) => void) => ipcRenderer.on(channel, (_, ...args) => func(...args)),
    platform: process.platform,
    version: process.versions.electron,
});
