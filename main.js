const { app, BrowserWindow, dialog, Menu, shell } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;
let splash;
let mainWindow;
let autoUpdater;

if (!isDev) {
  ({ autoUpdater } = require('electron-updater'));
  autoUpdater.autoDownload = true;
}

function commonWebPreferences() {
  return {
    contextIsolation: true,
    sandbox: true,
    nodeIntegration: false,
    webSecurity: true
  };
}

function hardenWindow(win) {
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    const current = win.webContents.getURL();
    if (current && !url.startsWith('file://')) event.preventDefault();
  });
}

function openAbout() {
  const about = new BrowserWindow({
    width: 440,
    height: 540,
    resizable: false,
    minimizable: false,
    maximizable: false,
    title: 'About - Intelligent Removals Pro',
    modal: Boolean(mainWindow),
    parent: mainWindow || undefined,
    backgroundColor: '#0b1220',
    show: false,
    webPreferences: commonWebPreferences()
  });

  hardenWindow(about);
  about.loadFile(path.join(__dirname, 'about.html'), {
    search: `?v=${encodeURIComponent(app.getVersion())}`
  });
  about.once('ready-to-show', () => about.show());
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
    dialog.showMessageBox({
      type: 'info',
      title: 'Up to Date',
      message: 'You are running the latest version of Intelligent Removals Pro.'
    });
  });
  autoUpdater.once('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: 'A new version is being downloaded in the background.'
    });
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
      submenu: [{ role: 'about', label: 'About Intelligent Removals Pro' }, { type: 'separator' }, { role: 'quit' }]
    }] : []),
    { label: 'File', submenu: [{ role: 'quit' }] },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools', accelerator: 'Ctrl+Shift+I' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Check for Updates...', click: checkForUpdatesManual },
        { label: 'About Intelligent Removals Pro', click: openAbout }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  splash = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    alwaysOnTop: true,
    transparent: false,
    resizable: false,
    backgroundColor: '#0b1220',
    webPreferences: commonWebPreferences()
  });
  hardenWindow(splash);
  splash.loadFile(path.join(__dirname, 'splash.html'));

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 680,
    show: false,
    title: 'Intelligent Removals Pro',
    backgroundColor: '#0b1220',
    webPreferences: commonWebPreferences()
  });
  hardenWindow(mainWindow);
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      if (splash && !splash.isDestroyed()) splash.close();
      mainWindow.show();
      if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
    }, 1200);
  });

  buildMenu();
}

app.whenReady().then(() => {
  createWindow();
  if (!isDev) autoUpdater.checkForUpdatesAndNotify();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
