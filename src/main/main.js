const { app, BrowserWindow } = require('electron');
const path = require('path');

// Multi-instance P2P support with environment variables
const PEER_ID = process.env.MESSAGEPEDIA_PEER_ID || 'peer-default-001';
const PEER_NAME = process.env.MESSAGEPEDIA_PEER_NAME || 'Default User';
const DB_PATH = process.env.MESSAGEPEDIA_DB_PATH || './messagepedia.db';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: `MessagePedia - ${PEER_NAME}`,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      additionalArguments: [
        `--peer-id=${PEER_ID}`,
        `--peer-name=${PEER_NAME}`,
        `--db-path=${DB_PATH}`
      ]
    }
  });

  // Load the renderer
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  
  // Always open dev tools for P2P debugging
  mainWindow.webContents.openDevTools();
  
  console.log(`🚀 Started MessagePedia instance for: ${PEER_NAME} (${PEER_ID})`);
  console.log(`📄 Database: ${DB_PATH}`);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
