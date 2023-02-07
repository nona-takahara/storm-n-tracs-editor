import { NtracsProject } from "./data";

export interface IElectronAPI {
  loadRomTrack: () => Promise<any>;
  loadAddon: () => Promise<any>;
  save: (project: string) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
