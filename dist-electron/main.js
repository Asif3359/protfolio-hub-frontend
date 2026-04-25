"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
electron_1.app.disableHardwareAcceleration();
electron_1.app.commandLine.appendSwitch('no-sandbox');
electron_1.app.commandLine.appendSwitch('disable-dev-shm-usage');
const isDev = process.env.NODE_ENV === 'development';
let mainWindow = null;
let nextProcess = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        show: false,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: 'deny' };
    });
    // Open DevTools to diagnose rendering issues
    mainWindow.webContents.openDevTools();
    const url = 'http://localhost:3000';
    const doLoad = () => {
        mainWindow?.loadURL(url)
            .then(() => {
            console.log('[Electron] loadURL resolved');
        })
            .catch((err) => {
            console.error('[Electron] loadURL failed:', err);
        });
        // Show after page navigation completes + small React hydration delay
        mainWindow?.webContents.once('did-finish-load', () => {
            console.log('[Electron] did-finish-load');
            setTimeout(() => {
                if (mainWindow && !mainWindow.isVisible()) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }, 1500);
        });
        // Hard fallback — show window no matter what after 15 s
        setTimeout(() => {
            if (mainWindow && !mainWindow.isVisible()) {
                console.log('[Electron] fallback show');
                mainWindow.show();
                mainWindow.focus();
            }
        }, 15000);
    };
    if (isDev) {
        doLoad();
    }
    else {
        startNextServer().then(doLoad).catch(console.error);
    }
}
function waitForNextServer(timeout = 60000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
            fetch('http://localhost:3000', { method: 'HEAD' })
                .then(() => resolve())
                .catch(() => {
                if (Date.now() - start > timeout) {
                    reject(new Error('Next.js server did not start in time'));
                }
                else {
                    setTimeout(check, 500);
                }
            });
        };
        check();
    });
}
function startNextServer() {
    return new Promise((resolve, reject) => {
        const standaloneDir = path_1.default.join(__dirname, '..', '.next', 'standalone');
        const serverScript = path_1.default.join(standaloneDir, 'server.js');
        const server = (0, child_process_1.spawn)('node', [serverScript], {
            cwd: standaloneDir,
            stdio: 'pipe',
            env: {
                ...process.env,
                NODE_ENV: 'production',
                PORT: '3000',
                HOSTNAME: 'localhost',
            },
        });
        nextProcess = server;
        server.stdout.on('data', (d) => console.log(`[Next] ${d}`));
        server.stderr.on('data', (d) => {
            const msg = d.toString();
            console.error(`[Next ERR] ${msg}`);
            if (msg.includes('EADDRINUSE')) {
                nextProcess = null;
                resolve();
            }
        });
        server.on('error', reject);
        waitForNextServer().then(resolve).catch(reject);
    });
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (nextProcess)
        nextProcess.kill();
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0)
        createWindow();
});
electron_1.app.on('will-quit', () => {
    if (nextProcess)
        nextProcess.kill();
});
