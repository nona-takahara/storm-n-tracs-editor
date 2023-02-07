import path from "path";
import { promises as fs } from "fs";
import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { XMLParser } from "fast-xml-parser";
import { tiles } from "./tiles";
import { existsSync } from "original-fs";

async function readAndParseXML(_path: string) {
  try {
    const data = await fs.readFile(_path);
    const xmlParser = new XMLParser({
      ignoreAttributes: false,
      ignoreDeclaration: true
    });
    return xmlParser.parse(data.toString());
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

async function handleLoadRomTrack() {
  let list: any = {};
  try {
    for (const name in tiles) {
      if (Object.prototype.hasOwnProperty.call(tiles, name)) {
        const tile = tiles[name];

        const xmlContent = await readAndParseXML(
          path.join(__dirname, "../", ".temp", name)
        );

        if (xmlContent) {
          const tir = xmlContent.definition.train_tracks.track;
          for (const i of tir ? tir : [tir]) {
            if (i?.["@_id"]) {
              list[name + i["@_id"]] = {
                x: Number(i.transform["@_30"]) + tile.offsetX,
                z: Number(i.transform["@_32"]) + tile.offsetY,
                links:
                  i.links.link?.map === undefined
                    ? [((name + i?.links?.link?.["@_id"]) as string) || ""]
                    : (i.links.link as Array<any>).map(
                        (v: any) => (name + v["@_id"]) as string
                      )
              };
            }
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
    list = undefined;
  }
  return list;
}

async function handleLoadAddon() {
  try {
    const xmlContent = await readAndParseXML(
      path.join(__dirname, "../", ".temp/playlist.xml")
    );

    let list: any[] = [];
    if (xmlContent) {
      for (const l of xmlContent.playlist.locations.locations.l) {
        const tile = tiles[l["@_tile"].replace("data/tiles/", "")];
        if (tile) {
          for (const c of l.components.c) {
            list.push({
              tag: c["@_name"],
              x: Number(c.spawn_transform["@_30"]) + tile.offsetX,
              z: Number(c.spawn_transform["@_32"]) + tile.offsetY,
              m00: Number(c.spawn_transform["@_00"]),
              m01: Number(c.spawn_transform["@_02"]),
              m10: Number(c.spawn_transform["@_20"]),
              m11: Number(c.spawn_transform["@_22"]),
              size_x:
                Number(c.spawn_bounds.max["@_x"]) -
                Number(c.spawn_bounds.min["@_x"]),
              size_z:
                Number(c.spawn_bounds.min["@_z"]) -
                Number(c.spawn_bounds.max["@_z"])
            });
          }
        }
      }
      return list;
    }
  } catch (e) {
    console.error(e);
  }
  return undefined;
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

async function saveProject(event: Electron.IpcMainInvokeEvent, project: any) {
  const res = await dialog.showSaveDialog({
    filters: [{ name: "JSON data file", extensions: ["json"] }]
  });
  if (!res.canceled && res.filePath) {
    fs.writeFile(res.filePath, project);
  }
}

async function loadProject() {
  const res = await dialog.showOpenDialog({
    properties: ["openFile"]
  });
  if (!res.canceled && res.filePaths[0]) {
    if (existsSync(res.filePaths[0])) {
      return JSON.parse((await fs.readFile(res.filePaths[0])).toString());
    }
  }
  return undefined;
}

app.whenReady().then(() => {
  ipcMain.handle("load:romTrack", handleLoadRomTrack);
  ipcMain.handle("load:addon", handleLoadAddon);
  ipcMain.handle("save", saveProject);
  ipcMain.handle("load", loadProject);
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
