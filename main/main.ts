import { app, ipcMain, dialog, Menu, BrowserWindow } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers/create-window';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const isProd = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();
  
  Menu.setApplicationMenu(null);

  const mainWindow = createWindow('main', {
    width: 1200,
    height: 800,
    title: "OMS Portal",
    icon: path.join(__dirname, '../resources/logo.ico'), 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  if (isProd) {
    await mainWindow.loadURL('app://./index.html'); 
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}`); 
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});

// Config path
const configPath = path.join(app.getPath('userData'), 'oms-config.json');

// Helpers
const getRememberedPath = () => {
  if (fs.existsSync(configPath)) {
    const data = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(data).savedFolder;
  }
  return null;
};

const setRememberedPath = (folderPath: string) => {
  fs.writeFileSync(configPath, JSON.stringify({ savedFolder: folderPath }));
};

// IPC Handlers unchanged...
ipcMain.handle('save-db', async (event, { data, customPath }) => {
  try {
    if (customPath) {
      setRememberedPath(customPath);
    }
    
    const folder = customPath || getRememberedPath() || app.getPath('documents');
    const fullPath = path.join(folder, 'inc-officer-db.json');

    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true, savedAt: fullPath };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-db', async (event, overridePath?: string) => {
  try {
    if (overridePath) {
      setRememberedPath(overridePath);
    }

    const folder = overridePath || getRememberedPath() || app.getPath('documents');
    const fullPath = path.join(folder, 'inc-officer-db.json');
    
    if (fs.existsSync(fullPath)) {
      const rawData = fs.readFileSync(fullPath, 'utf8');
      return { success: true, data: JSON.parse(rawData), rememberedFolder: folder };
    }
    
    return { success: false, message: "No database file found" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('print-to-pdf', async (event, { html, filename }) => {
  try {
    const downloadPath = app.getPath('documents');
    const filePath = path.join(downloadPath, `${filename}.pdf`);

    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true
      }
    });

    await printWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);

    await new Promise(resolve => setTimeout(resolve, 500));

    const pdfData = await printWindow.webContents.printToPDF({
      landscape: false,
      margins: { marginType: 'none' },
      pageSize: 'A4',
      printBackground: true
    });

    fs.writeFileSync(filePath, pdfData);
    
    printWindow.destroy();

    return { success: true, filePath, message: `PDF saved to ${filePath}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-pdf-dialog', async (event, { html, filename, defaultPath }) => {
  try {
    const result = await dialog.showSaveDialog({
      defaultPath: path.join(app.getPath('documents'), defaultPath),
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled) {
      return { cancelled: true };
    }

    const filePath = result.filePath;

    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true
      }
    });

    await printWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);

    await new Promise(resolve => setTimeout(resolve, 500));

    const pdfData = await printWindow.webContents.printToPDF({
      landscape: false,
      margins: { marginType: 'none' },
      pageSize: 'A4',
      printBackground: true
    });

    fs.writeFileSync(filePath, pdfData);
    
    printWindow.destroy();

    return { success: true, filePath };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
