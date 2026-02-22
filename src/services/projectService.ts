import { invoke } from "@tauri-apps/api";
import { XMLParser } from "fast-xml-parser";
import AddonVehicle from "../data/AddonVehicle";
import AreaPolygon from "../data/AreaPolygon";
import * as AxleMode from "../data/AxleMode";
import NtracsTrack, { AreaCollection } from "../data/NtracsTrack";
import StormTracks from "../data/StormTracks";
import Vector2d from "../data/Vector2d";
import { normalizeTrackFlag } from "../domain/editor/trackCommands";
import { decodeProjectJson } from "../io/projectDecoder";
import { encodeProject, ProjectEncodeInput } from "../io/projectEncoder";
import { LoadedProjectData } from "../store/editorTypes";

const xmlParserOption = {
  ignoreAttributes: false,
  ignoreDeclaration: true,
};

interface AddonComponentXml {
  spawn_transform?: {
    "@_30"?: string | number;
    "@_32"?: string | number;
    "@_00"?: string | number;
    "@_02"?: string | number;
    "@_20"?: string | number;
    "@_22"?: string | number;
  };
  spawn_bounds?: {
    max?: {
      "@_x"?: string | number;
      "@_z"?: string | number;
    };
    min?: {
      "@_x"?: string | number;
      "@_z"?: string | number;
    };
  };
  "@_name"?: string;
}

interface AddonLocationXml {
  "@_tile"?: string;
  components?: {
    c?: AddonComponentXml | AddonComponentXml[];
  };
}

interface AddonRootXml {
  playlist?: {
    locations?: {
      locations?: {
        l?: AddonLocationXml | AddonLocationXml[];
      };
    };
  };
}

function toArray<T>(item: T | T[] | undefined | null): T[] {
  if (Array.isArray(item)) {
    return item;
  }
  if (item === undefined || item === null) {
    return [];
  }
  return [item];
}

async function openFileCommand(): Promise<string> {
  const result = await invoke("open_file_command", {});
  return String(result ?? "");
}

async function saveFileCommand(saveValue: string): Promise<void> {
  await invoke("save_file_command", { saveValue });
}

async function readTileFileCommand(filename: string): Promise<string> {
  const result = await invoke("read_tile_file_command", { filename });
  return String(result ?? "");
}

async function readAddonCommand(foldername: string): Promise<string> {
  const result = await invoke("read_addon_command", { foldername });
  return String(result ?? "");
}

function createEmptyLoadedProjectData(): LoadedProjectData {
  return {
    vertexes: new Map<string, Vector2d>(),
    areas: new Map<string, AreaPolygon>(),
    tileAssign: new Map<string, Vector2d>(),
    addonList: [],
    vehicles: [],
    swtracks: [],
    nttracks: new Map<string, NtracsTrack>(),
  };
}

function parseProjectJson(text: string) {
  if (text.trim().length === 0) {
    return decodeProjectJson({});
  }

  try {
    const parsed: unknown = JSON.parse(text);
    return decodeProjectJson(parsed);
  } catch (error) {
    console.error(error);
    return decodeProjectJson({});
  }
}

function mapProjectBaseData(text: string): Omit<LoadedProjectData, "vehicles" | "swtracks"> {
  const dto = parseProjectJson(text);

  const vertexes = new Map<string, Vector2d>();
  for (const vertex of dto.vertexes) {
    vertexes.set(vertex.name, new Vector2d(vertex.x, vertex.z));
  }

  const areas = new Map<string, AreaPolygon>();
  for (const area of dto.areas) {
    areas.set(
      area.name,
      new AreaPolygon(
        [...area.vertexes],
        area.leftVertexInnerId || 0,
        AxleMode.modeFromStr(area.axleMode),
        area.callback || "",
        [...area.uparea]
      )
    );
  }

  const tileAssign = new Map<string, Vector2d>();
  for (const tile of dto.tiles) {
    tileAssign.set(tile.path, new Vector2d(tile.xOffset, tile.zOffset));
  }

  const nttracks = new Map<string, NtracsTrack>();
  for (const track of dto.tracks) {
    nttracks.set(
      track.name,
      new NtracsTrack(
        track.areas.map(
          (area) => new AreaCollection(area.name, normalizeTrackFlag(area.trackFlag))
        )
      )
    );
  }

  return {
    vertexes,
    areas,
    tileAssign,
    addonList: [...dto.addons],
    nttracks,
  };
}

async function loadStormTrackData(
  tileAssign: Map<string, Vector2d>
): Promise<StormTracks[]> {
  const requests = [...tileAssign.entries()].map(async ([filename, offset]) => {
    const xmlText = await readTileFileCommand(filename);
    return { xmlText, offset };
  });

  const results = await Promise.allSettled(requests);
  const parsedTracks: StormTracks[] = [];
  for (const result of results) {
    if (result.status !== "fulfilled") {
      console.error(result.reason);
      continue;
    }

    try {
      const xmlObject: unknown = new XMLParser(xmlParserOption).parse(result.value.xmlText);
      parsedTracks.push(
        StormTracks.loadFromXML(result.value.offset.x, result.value.offset.z, xmlObject)
      );
    } catch (error) {
      console.error(error);
    }
  }
  return parsedTracks;
}

async function loadAddonVehicles(
  addons: string[],
  tileAssign: Map<string, Vector2d>
): Promise<AddonVehicle[]> {
  const results = await Promise.allSettled(addons.map((addon) => readAddonCommand(addon)));
  const vehicles: AddonVehicle[] = [];

  for (const result of results) {
    if (result.status !== "fulfilled") {
      console.error(result.reason);
      continue;
    }

    try {
      const xmlObject = new XMLParser(xmlParserOption).parse(result.value) as AddonRootXml;
      const locations = toArray(xmlObject?.playlist?.locations?.locations?.l);
      for (const location of locations) {
        const tileName = String(location?.["@_tile"] ?? "");
        const tileOffset = tileAssign.get(tileName);
        if (!tileOffset) {
          continue;
        }

        const components = toArray(location?.components?.c);
        for (const component of components) {
          if (!component?.spawn_transform) {
            continue;
          }

          vehicles.push(
            new AddonVehicle(
              Number(component.spawn_transform?.["@_30"] ?? 0) + tileOffset.x,
              Number(component.spawn_transform?.["@_32"] ?? 0) + tileOffset.z,
              Number(component.spawn_bounds?.max?.["@_x"] ?? 0) -
                Number(component.spawn_bounds?.min?.["@_x"] ?? 0),
              Number(component.spawn_bounds?.min?.["@_z"] ?? 0) -
                Number(component.spawn_bounds?.max?.["@_z"] ?? 0),
              Number(component.spawn_transform?.["@_00"] ?? 0),
              Number(component.spawn_transform?.["@_02"] ?? 0),
              Number(component.spawn_transform?.["@_20"] ?? 0),
              Number(component.spawn_transform?.["@_22"] ?? 0),
              String(component["@_name"] ?? "")
            )
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  return vehicles;
}

export async function loadProject(): Promise<LoadedProjectData> {
  const loadedText = await openFileCommand();
  const base = mapProjectBaseData(loadedText);
  const [swtracks, vehicles] = await Promise.all([
    loadStormTrackData(base.tileAssign),
    loadAddonVehicles(base.addonList, base.tileAssign),
  ]);

  return {
    ...createEmptyLoadedProjectData(),
    ...base,
    swtracks,
    vehicles,
  };
}

export async function saveProject(data: ProjectEncodeInput): Promise<void> {
  const saveValue = JSON.stringify(encodeProject(data));
  await saveFileCommand(saveValue);
}
