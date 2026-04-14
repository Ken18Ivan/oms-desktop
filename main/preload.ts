const { contextBridge, ipcRenderer } = require('electron')

// Whitelist of allowed IPC channels
const ALLOWED_CHANNELS = [
  'save-db',
  'load-db',
  'select-directory',
  'select-folder',
  'print-to-pdf',
  'save-pdf-dialog',
  'save-file',
  'get-app-version'
];

const handler = {
  invoke: async (channel: string, data?: any) => {
    if (ALLOWED_CHANNELS.includes(channel as any)) {
      return ipcRenderer.invoke(channel, data);
    }
    throw new Error(`IPC channel "${channel}" is not allowed`);
  },
  selectFolder: () => ipcRenderer.invoke('select-directory'),
}

// Expose only specific methods
contextBridge.exposeInMainWorld('ipc', handler)

export type IpcHandler = typeof handler

declare global {
  interface Window {
    ipc?: IpcHandler;
  }
}