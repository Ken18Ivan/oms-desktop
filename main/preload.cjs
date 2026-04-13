const { contextBridge, ipcRenderer } = require('electron');

// Whitelist of allowed IPC channels
const ALLOWED_CHANNELS = [
  'save-db',
  'load-db',
  'select-directory',
  'select-folder',
  'print-to-pdf',
  'save-pdf-dialog',
  'save-file'
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

// Expose to the renderer process
contextBridge.exposeInMainWorld('ipc', handler);
