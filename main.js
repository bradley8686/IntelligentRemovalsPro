const { app, BrowserWindow, dialog, Menu } = require('electron');
const isDev = !app.isPackaged;

let splash, mainWindow;
let autoUpdater;

if (!isDev) {
  ({ autoUpdater } = require('electron-updater'));
  autoUpdater.autoDownload = true;
}

function openAbout() {
  const about = new BrowserWindow({
    width: 420,
    height: 520,
    resizable: false,
    minimizable: false,
    maximizable: false,
    title: 'About – Intelligent Removals Pro',
    modal: true,
    parent: mainWindow || null,
    backgroundColor: '#0b63d6',
    show: true,
    webPreferences: { contextIsolation: true, sandbox: true }
  });
  const ver = encodeURIComponent(app.getVersion());
  about.loadFile('about.html', { search: `?v=${ver}` });
}

function checkForUpdatesManual() {
  if (isDev) {
    dialog.showMessageBoxSync({
      type: 'info',
      title: 'Updates Unavailable',
      message: 'Auto-update is disabled in development mode.'
    });
    return;
  }
  dialog.showMessageBox({ type: 'info', message: 'Checking for updates...', buttons: [] });
  autoUpdater.checkForUpdates();
  autoUpdater.once('update-not-available', () => {
    dialog.showMessageBox({ type: 'info', title: 'Up to Date', message: 'You are running the latest version of Intelligent Removals Pro.' });
  });
  autoUpdater.once('update-available', () => {
    dialog.showMessageBox({ type: 'info', title: 'Update Available', message: 'A new version is being downloaded in the background.' });
  });
  autoUpdater.once('update-downloaded', () => {
    const res = dialog.showMessageBoxSync({
      type: 'info',
      buttons: ['Restart Now', 'Later'],
      title: 'Update Ready',
      message: 'The update is ready to install. Restart now?'
    });
    if (res === 0) autoUpdater.quitAndInstall();
  });
}

function buildMenu() {
  const template = [
    ...(process.platform === 'darwin' ? [{
      label: app.name,
      submenu: [{ role: 'about', label: 'About (System)' }, { type: 'separator' }, { role: 'quit' }]
    }] : []),
    { label: 'File', submenu: [{ role: 'quit' }] },
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'toggleDevTools', accelerator: 'Ctrl+Shift+I' },
      { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' }, { role: 'togglefullscreen' }] },
    { label: 'Help', submenu: [{ label: 'Check for Updates…', click: checkForUpdatesManual }, { label: 'About Intelligent Removals Pro', click: openAbout }] }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  splash = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    alwaysOnTop: true,
    transparent: false,
    resizable: false,
    backgroundColor: '#0b63d6',
    webPreferences: { contextIsolation: true }
  });
  splash.loadFile('splash.html');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    show: false,
    webPreferences: { contextIsolation: true, sandbox: true }
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      if (!splash.isDestroyed()) splash.close();
      mainWindow.show();
      if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
    }, 2000);
  });

  buildMenu();
}

app.whenReady().then(() => {
  createWindow();
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
