export interface IElectronAPI {
  node: () => string;
  chrome: () => string;
  electron: () => string;
  loadRomTrack: () => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
