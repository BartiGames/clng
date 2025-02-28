const { app, BrowserWindow, nativeImage } = require('electron');
const path = require('path');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'icon.ico'), // Set custom icon
        webPreferences: {
            nodeIntegration: false, // Keep security best practices
            contextIsolation: true,
            partition: 'persist:mySession', // Enables persistent sessionStorage
        },
    });

    // Hide the default menu bar
    mainWindow.setMenuBarVisibility(false);

    // Load local HTML file
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

