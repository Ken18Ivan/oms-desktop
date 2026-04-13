import { app, ipcMain, dialog, Menu, BrowserWindow } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers/create-window';
import * as fs from 'node:fs/promises';
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
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true,
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
const getRememberedPath = async () => {
  try {
    if (await fs.access(configPath).then(() => true).catch(() => false)) {
      const data = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(data).savedFolder;
    }
  } catch (error) {
    // File doesn't exist or can't be read
  }
  return null;
};

const setRememberedPath = async (folderPath: string) => {
  await fs.writeFile(configPath, JSON.stringify({ savedFolder: folderPath }));
};

// Save queue to prevent race conditions
let saveQueue = Promise.resolve();

const queueSave = async (saveFn: () => Promise<any>) => {
  saveQueue = saveQueue.then(async () => {
    return await saveFn();
  });
  return saveQueue;
};

// IPC Handlers
ipcMain.handle('save-db', async (event, { data, customPath }) => {
  return queueSave(async () => {
    try {
      if (customPath) {
        await setRememberedPath(path.resolve(customPath));
      }

      const folder = customPath ? path.resolve(customPath) : await getRememberedPath() || app.getPath('documents');
      const fullPath = path.join(folder, 'inc-officer-db.json');
      const tempPath = path.join(folder, `inc-officer-db.json.tmp.${Date.now()}`);

      // Validate folder exists
      try {
        await fs.access(folder);
      } catch {
        // Folder doesn't exist, try to create it
        await fs.mkdir(folder, { recursive: true });
      }

      // Atomic write: write to temp file first, then rename to final destination
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      await fs.rename(tempPath, fullPath);

      return { success: true, savedAt: fullPath };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
});

ipcMain.handle('load-db', async (event, overridePath?: string) => {
  try {
    if (overridePath) {
      await setRememberedPath(overridePath);
    }

    const folder = overridePath || await getRememberedPath() || app.getPath('documents');
    const fullPath = path.join(folder, 'inc-officer-db.json');

    try {
      await fs.access(fullPath);
      const rawData = await fs.readFile(fullPath, 'utf8');
      return { success: true, data: JSON.parse(rawData), rememberedFolder: folder };
    } catch {
      return { success: false, message: "No database file found" };
    }
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
        sandbox: false,
        webSecurity: true
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

    await fs.writeFile(filePath, pdfData);
    
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
        sandbox: false,
        webSecurity: true
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

    await fs.writeFile(filePath, pdfData);
    
    printWindow.destroy();

    return { success: true, filePath };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Save file to a specified path
ipcMain.handle('save-file', async (event, { filePath, data }) => {
  try {
    // Create folder if it doesn't exist
    const folder = path.dirname(filePath);
    try {
      await fs.access(folder);
    } catch {
      await fs.mkdir(folder, { recursive: true });
    }

    // Write the file
    await fs.writeFile(filePath, data, 'utf-8');
    return { success: true, filePath };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Select folder with dialog
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Select Database Storage Location'
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});
