try {
  const { contextBridge, ipcRenderer } = require('electron');

  const ALLOWED_CHANNELS = [
    'save-db',
    'load-db',
    'select-directory',
    'select-folder',
    'print-to-pdf',
    'save-pdf-dialog',
    'save-file',
    'get-app-version',
  ];

  const handler = {
    invoke: async (channel, data) => {
      if (ALLOWED_CHANNELS.includes(channel)) {
        return ipcRenderer.invoke(channel, data);
      }
      throw new Error(`IPC channel "${channel}" is not allowed`);
    },
    selectFolder: () => ipcRenderer.invoke('select-directory'),
  };

  contextBridge.exposeInMainWorld('ipc', handler);
} catch (e) {
  console.error('PRELOAD FAILED:', e);
}