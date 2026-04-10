import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

const handler = {
  send<T>(channel: string, value?: T) {
    ipcRenderer.send(channel, value)
  },
  on<T>(channel: string, callback: (...args: T[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: T[]) =>
      callback(...args)
    ipcRenderer.on(channel, subscription)

    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
  invoke: (channel: string, data?: any) => ipcRenderer.invoke(channel, data),
  // ADDED: This bridges the folder selection to the renderer
  selectFolder: () => ipcRenderer.invoke('select-directory'),
}

// Now we expose the whole object at once
contextBridge.exposeInMainWorld('ipc', handler)

export type IpcHandler = typeof handler

declare global {
  interface Window {
    ipc: IpcHandler;
  }
}