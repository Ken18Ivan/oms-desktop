interface IpcHandler {
  invoke: (channel: string, data?: any) => Promise<any>;
  selectFolder: () => Promise<string | null>;
}

declare global {
  interface Window {
    ipc?: IpcHandler;
  }
}

export {};
