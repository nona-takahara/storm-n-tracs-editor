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

    let list: any = {};
    if (xmlContent) {
      for (const i of xmlContent.definition.train_tracks.track) {
        list[i["@_id"]] = {
          x: Number(i.transform["@_30"]),
          z: Number(i.transform["@_32"]),
          links:
            i.links.link["@_id"] !== undefined
              ? [i.links.link["@_id"] as string]
              : (i.links.link as Array<any>).map(
                  (v: any) => v["@_id"] as string
                )
        };
      }
      return list;
    } else {
      return undefined;
    }
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    useContentSize: true,
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
