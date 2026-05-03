import { app, BrowserWindow, shell, session } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import * as net from 'net';
import path from 'path';

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-dev-shm-usage');

const isDev = process.env.NODE_ENV === 'development';
const DEV_PORT = 3001;

let mainWindow: BrowserWindow | null = null;
let nextProcess: ChildProcess | null = null;
let serverPort = DEV_PORT;

function getFreePort(): Promise<number> {
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
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    if (isDev) mainWindow.webContents.openDevTools();

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
    } else {
        getFreePort()
            .then((port) => {
                serverPort = port;
                return startNextServer(port);
            })
            .then(doLoad)
            .catch(console.error);
    }
}

function waitForServer(timeout = 60000): Promise<void> {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
            fetch(`http://127.0.0.1:${serverPort}`, { method: 'HEAD' })
                .then(() => resolve())
                .catch(() => {
                    if (Date.now() - start > timeout) {
                        reject(new Error('Next.js server did not start in time'));
                    } else {
                        setTimeout(check, 500);
                    }
                });
        };
        check();
    });
}

function startNextServer(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const standaloneDir = path.join(__dirname, '..', '.next', 'standalone');
        const serverScript = path.join(standaloneDir, 'server.js');

        const server = spawn('node', [serverScript], {
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

app.whenReady().then(() => {
    const wsBackend = process.env.NEXT_PUBLIC_WS_URL ?? 'https://protfolio-hub-backend.onrender.com';

    // Only rewrite Origin for WebSocket/Socket.IO connections to the backend.
    // HTTP API calls go through the Next.js proxy route and never reach here.
    session.defaultSession.webRequest.onBeforeSendHeaders(
        { urls: [`${wsBackend}/*`] },
        (details: Electron.OnBeforeSendHeadersListenerDetails, callback: (r: Electron.BeforeSendResponse) => void) => {
            details.requestHeaders['Origin'] = 'http://localhost:3001';
            callback({ requestHeaders: details.requestHeaders });
        },
    );
    createWindow();
});

app.on('window-all-closed', () => {
    if (nextProcess) nextProcess.kill();
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('will-quit', () => {
    if (nextProcess) nextProcess.kill();
});
