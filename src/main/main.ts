import { app, BrowserWindow, ipcMain } from "electron";
import { XMLParser } from "fast-xml-parser";
import path from "path";
import { promises as fs } from "fs";

const listOfIsland: { [name: string]: { offsetX: number; offsetY: number } } = {
  "mega_island_10_8.xml": {
    offsetX: 2000,
    offsetY: -4000
  },
  "mega_island_9_8.xml": {
    offsetX: 1000,
    offsetY: -4000
  },
  "mega_island_9_7.xml": {
    offsetX: 1000,
    offsetY: -5000
  },
  "mega_island_8_8.xml": {
    offsetX: 0,
    offsetY: -4000
  },
  "mega_island_8_7.xml": {
    offsetX: 0,
    offsetY: -5000
  }
};

async function readAndParseXML(_path: string) {
  try {
    const data = await fs.readFile(_path);
    const xmlParser = new XMLParser({
      ignoreAttributes: false,
      ignoreDeclaration: true
    });
    return xmlParser.parse(data.toString());
  } catch (e) {
    throw e;
  }
}

async function handleLoadRomTrack() {
  try {
    let list: any = {};
    for (const name in listOfIsland) {
      if (Object.prototype.hasOwnProperty.call(listOfIsland, name)) {
        const tile = listOfIsland[name];

        const xmlContent = await readAndParseXML(
          path.join(__dirname, "../", ".temp", name)
        );

        if (xmlContent) {
          for (const i of xmlContent.definition.train_tracks.track) {
            list[name + i["@_id"]] = {
              x: Number(i.transform["@_30"]) + tile.offsetX,
              z: Number(i.transform["@_32"]) + tile.offsetY,
              links:
                i.links.link["@_id"] !== undefined
                  ? [(name + i.links.link["@_id"]) as string]
                  : (i.links.link as Array<any>).map(
                      (v: any) => (name + v["@_id"]) as string
                    )
            };
          }
        }
      }
    }
    return list;
  } catch (e) {
    console.error(e);
  }
  return undefined;
}

async function handleLoadAddon() {
  try {
    const xmlContent = await readAndParseXML(
      path.join(__dirname, "../", ".temp/playlist.xml")
    );

    let list: any[] = [];
    if (xmlContent) {
      for (const l of xmlContent.playlist.locations.locations.l) {
        const tile = listOfIsland[l["@_tile"].replace("data/tiles/", "")];
        if (tile) {
          for (const c of l.components.c) {
            console.log({
              tag: c["@_name"],
              x: Number(c.spawn_transform["@_30"]) + tile.offsetX,
              z: Number(c.spawn_transform["@_32"]) + tile.offsetY
            });
            list.push({
              tag: c["@_name"],
              x: Number(c.spawn_transform["@_30"]) + tile.offsetX,
              z: Number(c.spawn_transform["@_32"]) + tile.offsetY
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

app.whenReady().then(() => {
  ipcMain.handle("load:romTrack", handleLoadRomTrack);
  ipcMain.handle("load:addon", handleLoadAddon);
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
