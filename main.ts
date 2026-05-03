import { app, BrowserWindow, shell } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-dev-shm-usage');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;
let nextProcess: ChildProcess | null = null;

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

    // Open DevTools to diagnose rendering issues
    mainWindow.webContents.openDevTools();

    const url = 'http://localhost:3001';

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
        waitForNextServer().then(doLoad).catch(console.error);
    } else {
        startNextServer().then(doLoad).catch(console.error);
    }
}

function waitForNextServer(timeout = 60000): Promise<void> {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
            fetch('http://localhost:3001', { method: 'HEAD' })
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

function startNextServer(): Promise<void> {
    return new Promise((resolve, reject) => {
        const standaloneDir = path.join(__dirname, '..', '.next', 'standalone');
        const serverScript = path.join(standaloneDir, 'server.js');

        const server = spawn('node', [serverScript], {
            cwd: standaloneDir,
            stdio: 'pipe',
            env: {
                ...process.env,
                NODE_ENV: 'production',
                PORT: '3001',
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

app.whenReady().then(createWindow);

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
