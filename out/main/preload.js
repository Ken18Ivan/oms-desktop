import { contextBridge, ipcRenderer } from 'electron';
const handler = {
    send(channel, value) {
        ipcRenderer.send(channel, value);
    },
    on(channel, callback) {
        const subscription = (_event, ...args) => callback(...args);
        ipcRenderer.on(channel, subscription);
        return () => {
            ipcRenderer.removeListener(channel, subscription);
        };
    },
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    // ADDED: This bridges the folder selection to the renderer
    selectFolder: () => ipcRenderer.invoke('select-directory'),
};
// Now we expose the whole object at once
contextBridge.exposeInMainWorld('ipc', handler);
