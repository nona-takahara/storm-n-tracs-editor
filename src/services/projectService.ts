import { invoke } from "@tauri-apps/api";
import { XMLParser } from "fast-xml-parser";
import AddonVehicle from "../data/AddonVehicle";
import AreaPolygon from "../data/AreaPolygon";
import * as AxleMode from "../data/AxleMode";
import NtracsTrack, { AreaCollection } from "../data/NtracsTrack";
import StormTracks from "../data/StormTracks";
import Vector2d from "../data/Vector2d";
import { decodeProjectJson } from "../io/projectDecoder";
import {
  cleanupProjectForSave,
  encodeProject,
  ProjectEncodeInput,
  renumberProjectAreaIds,
} from "../io/projectEncoder";
import {
  DEFAULT_PROJECT_ORIGIN_X,
  DEFAULT_PROJECT_ORIGIN_Z,
  LoadedProjectData,
} from "../store/editorTypes";

const xmlParserOption = {
  ignoreAttributes: false,
  ignoreDeclaration: true,
};

const DEFAULT_SW_TILE_PATH =
  "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Stormworks\\rom";
const DEFAULT_ADDON_PATH = "C:\\";
const AREA_ID_PREFIX = "Area_";

export interface AppPathConfig {
  swTilePath: string;
  addonPath: string;
}

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

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function parsePathConfig(value: unknown): AppPathConfig {
  const root = asRecord(value) ?? {};
  const swTilePath =
    typeof root.sw_tile_path === "string"
      ? root.sw_tile_path
      : typeof root.swTilePath === "string"
      ? root.swTilePath
      : DEFAULT_SW_TILE_PATH;
  const addonPath =
    typeof root.addon_path === "string"
      ? root.addon_path
      : typeof root.addonPath === "string"
      ? root.addonPath
      : DEFAULT_ADDON_PATH;

  return {
    swTilePath,
    addonPath,
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

function normalizeLoadedAreaId(areaId: string): string {
  if (!areaId.startsWith(AREA_ID_PREFIX)) {
    return areaId;
  }

  const normalized = areaId.slice(AREA_ID_PREFIX.length);
  return normalized.length > 0 ? normalized : areaId;
}

function buildLoadedAreaIdMap(areas: { name: string }[]): Map<string, string> {
  const map = new Map<string, string>();
  const used = new Set<string>();

  for (const area of areas) {
    const normalized = normalizeLoadedAreaId(area.name);
    const nextAreaId =
      normalized.length > 0 && !used.has(normalized) ? normalized : area.name;

    map.set(area.name, nextAreaId);
    used.add(nextAreaId);
  }

  return map;
}

function mapLoadedAreaReference(
  areaId: string,
  areaIdMap: Map<string, string>,
  mappedAreaIds: Set<string>
): string | undefined {
  const mapped = areaIdMap.get(areaId);
  if (mapped !== undefined) {
    return mapped;
  }

  const normalized = normalizeLoadedAreaId(areaId);
  if (mappedAreaIds.has(normalized)) {
    return normalized;
  }

  return undefined;
}

async function loadPathConfigCommand(): Promise<unknown> {
  return invoke("load_path_config_command", {});
}

async function savePathConfigCommand(config: AppPathConfig): Promise<void> {
  await invoke("save_path_config_command", {
    swTilePath: config.swTilePath,
    addonPath: config.addonPath,
  });
}

export async function loadPathConfig(): Promise<AppPathConfig> {
  const result = await loadPathConfigCommand();
  return parsePathConfig(result);
}

export async function savePathConfig(config: AppPathConfig): Promise<void> {
  const normalized: AppPathConfig = {
    swTilePath: config.swTilePath.trim() || DEFAULT_SW_TILE_PATH,
    addonPath: config.addonPath.trim() || DEFAULT_ADDON_PATH,
  };
  await savePathConfigCommand(normalized);
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
    origin: new Vector2d(DEFAULT_PROJECT_ORIGIN_X, DEFAULT_PROJECT_ORIGIN_Z),
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

  const areaIdMap = buildLoadedAreaIdMap(dto.areas);
  const mappedAreaIds = new Set(areaIdMap.values());

  const areas = new Map<string, AreaPolygon>();
  for (const area of dto.areas) {
    const areaId = areaIdMap.get(area.name);
    if (areaId === undefined) {
      continue;
    }

    const mappedUparea = area.uparea
      .map((upareaId) => mapLoadedAreaReference(upareaId, areaIdMap, mappedAreaIds))
      .filter((upareaId): upareaId is string => upareaId !== undefined);

    areas.set(
      areaId,
      new AreaPolygon(
        [...area.vertexes],
        area.leftVertexInnerId || 0,
        AxleMode.modeFromStr(area.axleMode),
        area.callback || "",
        mappedUparea
      )
    );
  }

  const tileAssign = new Map<string, Vector2d>();
  for (const tile of dto.tiles) {
    tileAssign.set(tile.path, new Vector2d(tile.xOffset, tile.zOffset));
  }

  const nttracks = new Map<string, NtracsTrack>();
  for (const track of dto.tracks) {
    const mappedTrackAreas = track.areas
      .map((area) => mapLoadedAreaReference(area.name, areaIdMap, mappedAreaIds))
      .filter((areaId): areaId is string => areaId !== undefined)
      .map((areaId) => new AreaCollection(areaId));

    nttracks.set(
      track.name,
      new NtracsTrack(mappedTrackAreas)
    );
  }

  return {
    vertexes,
    areas,
    tileAssign,
    addonList: [...dto.addons],
    origin: new Vector2d(dto.origin.x, dto.origin.z),
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

export async function saveProject(data: ProjectEncodeInput): Promise<ProjectEncodeInput> {
  const cleaned = cleanupProjectForSave(data);
  const saveValue = JSON.stringify(encodeProject(cleaned));
  await saveFileCommand(saveValue);
  return cleaned;
}

export function renumberAreaIds(data: ProjectEncodeInput): ProjectEncodeInput {
  return renumberProjectAreaIds(data);
}
