export interface IElectronAPI {
  loadRomTrack: () => Promise<any>;
  loadAddon: () => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
