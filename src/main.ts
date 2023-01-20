import { app, BrowserWindow, ipcMain } from "electron";
import { XMLParser } from "fast-xml-parser";
import path from "path";
import { promises as fs } from "fs";

async function handleLoadRomTrack() {
  try {
    let data = await fs.readFile(
      path.join(__dirname, "../", ".temp/mega_island_9_8.xml")
    );
    const xmlParser = new XMLParser({
      ignoreAttributes: false,
      ignoreDeclaration: true
    });
    const xmlContent = xmlParser.parse(data.toString());
    return xmlContent;
  } catch (e) {
    console.error(e);
    return e;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  ipcMain.handle("load:romTrack", handleLoadRomTrack);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
