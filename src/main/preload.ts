import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  loadRomTrack: () => ipcRenderer.invoke("load:romTrack"),
  loadAddon: () => ipcRenderer.invoke("load:addon")
});
