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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const net = __importStar(require("net"));
const path_1 = __importDefault(require("path"));
electron_1.app.disableHardwareAcceleration();
electron_1.app.commandLine.appendSwitch('no-sandbox');
electron_1.app.commandLine.appendSwitch('disable-dev-shm-usage');
const isDev = process.env.NODE_ENV === 'development';
const DEV_PORT = 3001;
let mainWindow = null;
let nextProcess = null;
let serverPort = DEV_PORT;
function getFreePort() {
    return new Promise((resolve, reject) => {
        const srv = net.createServer();
        srv.listen(0, '127.0.0.1', () => {
            const address = srv.address();
            const port = typeof address === 'object' && address ? address.port : 0;
            srv.close(() => resolve(port));
        });
        srv.on('error', reject);
    });
}
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
    if (isDev)
        mainWindow.webContents.openDevTools();
    const doLoad = () => {
        const url = `http://127.0.0.1:${serverPort}`;
        mainWindow?.loadURL(url)
            .then(() => console.log('[Electron] loadURL resolved'))
            .catch((err) => console.error('[Electron] loadURL failed:', err));
        mainWindow?.webContents.once('did-finish-load', () => {
            setTimeout(() => {
                if (mainWindow && !mainWindow.isVisible()) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }, 1500);
        });
        setTimeout(() => {
            if (mainWindow && !mainWindow.isVisible()) {
                mainWindow.show();
                mainWindow.focus();
            }
        }, 15000);
    };
    if (isDev) {
        serverPort = DEV_PORT;
        waitForServer().then(doLoad).catch(console.error);
    }
    else {
        getFreePort()
            .then((port) => {
            serverPort = port;
            return startNextServer(port);
        })
            .then(doLoad)
            .catch(console.error);
    }
}
function waitForServer(timeout = 60000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
            fetch(`http://127.0.0.1:${serverPort}`, { method: 'HEAD' })
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
function startNextServer(port) {
    return new Promise((resolve, reject) => {
        const standaloneDir = path_1.default.join(__dirname, '..', '.next', 'standalone');
        const serverScript = path_1.default.join(standaloneDir, 'server.js');
        const server = (0, child_process_1.spawn)('node', [serverScript], {
            cwd: standaloneDir,
            stdio: 'pipe',
            env: {
                ...process.env,
                NODE_ENV: 'production',
                PORT: String(port),
                HOSTNAME: '127.0.0.1',
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
        waitForServer().then(resolve).catch(reject);
    });
}
electron_1.app.whenReady().then(() => {
    const wsBackend = process.env.NEXT_PUBLIC_WS_URL ?? 'https://protfolio-hub-backend.onrender.com';
    // Only rewrite Origin for WebSocket/Socket.IO connections to the backend.
    // HTTP API calls go through the Next.js proxy route and never reach here.
    electron_1.session.defaultSession.webRequest.onBeforeSendHeaders({ urls: [`${wsBackend}/*`] }, (details, callback) => {
        details.requestHeaders['Origin'] = 'http://localhost:3001';
        callback({ requestHeaders: details.requestHeaders });
    });
    createWindow();
});
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
