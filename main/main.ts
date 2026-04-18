import { app, ipcMain, dialog, Menu, BrowserWindow } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers/create-window';
import * as fs from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import * as fsSync from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// ✅ Reliable production detection (do NOT rely on NODE_ENV)
const isProd = app.isPackaged;

// ✅ ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ✅ Preload resolver that matches what you found inside the INSTALLED app.asar:
 *   \main\preload.cjs
 *
 * Also includes a fallback candidate, and hard-fails with an error box if not found
 * (so IPC doesn’t silently become “unavailable”).
 */
const getPreloadPath = () => {
  if (!isProd) return path.join(__dirname, 'preload.cjs');

  const candidates = [
    path.join(app.getAppPath(), 'main', 'preload.cjs'), // ✅ matches your asar listing
    path.join(app.getAppPath(), 'app', 'preload.cjs'),  // fallback if you change packaging later
  ];

  const found = candidates.find((p) => fsSync.existsSync(p));
  if (!found) {
    dialog.showErrorBox(
      'OMS Startup Error',
      `IPC preload file not found.\n\nTried:\n${candidates.join('\n')}\n\nPlease reinstall using the latest installer.`
    );
    app.quit();
    throw new Error('Preload not found');
  }

  return found;
};

/**
 * ✅ Icon path
 * In production, external files are alongside the exe under process.resourcesPath.
 */
const getIconPath = () => {
  if (isProd) {
    return path.join(process.resourcesPath, 'resources', 'logo.ico');
  }
  return path.join(__dirname, '../resources/logo.ico');
};

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  Menu.setApplicationMenu(null);

  // ✅ Optional logging to help confirm preload path on any laptop
  const preloadPath = getPreloadPath();
  const logLine = [
    `[OMS] app.getAppPath()=${app.getAppPath()}`,
    `[OMS] __dirname=${__dirname}`,
    `[OMS] preloadPath=${preloadPath}`,
    `[OMS] preloadExists=${fsSync.existsSync(preloadPath)}`,
  ].join('\n');

  try {
    const logPath = path.join(app.getPath('userData'), 'oms-startup.log');
    fsSync.mkdirSync(path.dirname(logPath), { recursive: true });
    fsSync.writeFileSync(logPath, logLine + '\n', { encoding: 'utf-8' });
  } catch {
    // ignore logging failures
  }

  const mainWindow = createWindow('main', {
    width: 1200,
    height: 800,
    title: 'OMS Portal',
    icon: getIconPath(),
    webPreferences: {
      preload: preloadPath,
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
const fallbackDataDir = path.join(app.getPath('userData'), 'OMSData');

// Helpers
const getRememberedPath = async () => {
  try {
    if (await fs.access(configPath).then(() => true).catch(() => false)) {
      const data = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(data).savedFolder;
    }
  } catch {
    // ignore
  }
  return null;
};

const setRememberedPath = async (folderPath: string) => {
  await fs.writeFile(configPath, JSON.stringify({ savedFolder: folderPath }));
};

const ensureWritableDirectory = async (dirPath: string) => {
  const resolved = path.resolve(dirPath);
  await fs.mkdir(resolved, { recursive: true });
  await fs.access(resolved, fsConstants.W_OK);
  return resolved;
};

const resolveSaveFolder = async (customPath?: string) => {
  const rememberedPath = await getRememberedPath();
  const docsPath = app.getPath('documents');

  const candidates = customPath
    ? [path.resolve(customPath), rememberedPath, docsPath, fallbackDataDir]
    : [rememberedPath, docsPath, fallbackDataDir];

  const uniqueCandidates = candidates.filter(Boolean) as string[];
  const dedupedCandidates = [...new Set(uniqueCandidates.map((p) => path.resolve(p)))];

  for (let i = 0; i < dedupedCandidates.length; i++) {
    const candidate = dedupedCandidates[i];
    try {
      const writablePath = await ensureWritableDirectory(candidate);
      return {
        folder: writablePath,
        fallbackUsed: i > 0,
        requestedPath: customPath ? path.resolve(customPath) : null,
      };
    } catch {
      continue;
    }
  }

  return null;
};

const resolveLoadFolders = async (overridePath?: string) => {
  const rememberedPath = await getRememberedPath();
  const docsPath = app.getPath('documents');

  const candidates = overridePath
    ? [path.resolve(overridePath), rememberedPath, docsPath, fallbackDataDir]
    : [rememberedPath, docsPath, fallbackDataDir];

  const uniqueCandidates = candidates.filter(Boolean) as string[];
  return [...new Set(uniqueCandidates.map((p) => path.resolve(p)))];
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
      const resolved = await resolveSaveFolder(customPath);
      if (!resolved) {
        return { success: false, error: 'No writable storage folder found on this machine.' };
      }

      const folder = resolved.folder;
      const fullPath = path.join(folder, 'inc-officer-db.json');
      const tempPath = path.join(folder, `inc-officer-db.json.tmp.${Date.now()}`);

      await setRememberedPath(folder);

      // Atomic write
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      await fs.rename(tempPath, fullPath);

      return {
        success: true,
        savedAt: fullPath,
        storageFolder: folder,
        fallbackUsed: resolved.fallbackUsed,
        warning: resolved.fallbackUsed
          ? `Primary storage path unavailable. Saved to fallback path: ${folder}`
          : undefined,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
});

ipcMain.handle('load-db', async (event, overridePath?: string) => {
  try {
    const candidateFolders = await resolveLoadFolders(overridePath);

    for (let i = 0; i < candidateFolders.length; i++) {
      const folder = candidateFolders[i];
      const fullPath = path.join(folder, 'inc-officer-db.json');
      try {
        await fs.access(fullPath);
        const rawData = await fs.readFile(fullPath, 'utf8');
        await setRememberedPath(folder);
        return {
          success: true,
          data: JSON.parse(rawData),
          rememberedFolder: folder,
          fallbackUsed: i > 0,
          warning: i > 0 ? `Database loaded from fallback path: ${folder}` : undefined,
        };
      } catch {
        continue;
      }
    }

    return { success: false, message: 'No database file found in any known folder.' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
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
        webSecurity: true,
      },
    });

    await printWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const pdfData = await printWindow.webContents.printToPDF({
      landscape: false,
      margins: { marginType: 'none' },
      pageSize: 'A4',
      printBackground: true,
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
        { name: 'All Files', extensions: ['*'] },
      ],
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
        webSecurity: true,
      },
    });

    await printWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const pdfData = await printWindow.webContents.printToPDF({
      landscape: false,
      margins: { marginType: 'none' },
      pageSize: 'A4',
      printBackground: true,
    });

    await fs.writeFile(filePath, pdfData);

    printWindow.destroy();

    return { success: true, filePath };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-file', async (event, { filePath, data }) => {
  try {
    const folder = path.dirname(filePath);
    try {
      await fs.access(folder);
    } catch {
      await fs.mkdir(folder, { recursive: true });
    }

    await fs.writeFile(filePath, data, 'utf-8');
    return { success: true, filePath };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Select Database Storage Location',
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('get-app-version', async () => {
  try {
    return { success: true, version: app.getVersion() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});