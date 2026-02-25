// DTO definitions used when decoding project.json.
export interface ProjectVertexDto {
  name: string;
  x: number;
  z: number;
}

export interface ProjectAreaDto {
  name: string;
  vertexes: string[];
  leftVertexInnerId: number;
  axleMode: string;
  callback: string;
  uparea: string[];
}

export interface ProjectTrackAreaDto {
  name: string;
}

export interface ProjectTrackDto {
  name: string;
  areas: ProjectTrackAreaDto[];
}

export interface ProjectTileDto {
  path: string;
  xOffset: number;
  zOffset: number;
}

export interface ProjectOriginDto {
  x: number;
  z: number;
}

export interface ProjectDto {
  vertexes: ProjectVertexDto[];
  areas: ProjectAreaDto[];
  addons: string[];
  tracks: ProjectTrackDto[];
  tiles: ProjectTileDto[];
  origin: ProjectOriginDto;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function asStringArray(value: unknown): string[] {
  return asArray(value)
    .map((item) => asString(item))
    .filter((item) => item.length > 0);
}

export function decodeProjectJson(value: unknown): ProjectDto {
  const root = asRecord(value) ?? {};

  const vertexes = asArray(root.vertexes)
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => item !== undefined)
    .map((item) => ({
      name: asString(item.name),
      x: asNumber(item.x),
      z: asNumber(item.z),
    }))
    .filter((item) => item.name.length > 0);

  const areas = asArray(root.areas)
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => item !== undefined)
    .map((item) => ({
      name: asString(item.name),
      vertexes: asStringArray(item.vertexes),
      leftVertexInnerId: asNumber(item.left_vertex_inner_id, 0),
      axleMode: asString(item.axle_mode, "none"),
      callback: asString(item.callback, ""),
      uparea: asStringArray(item.uparea),
    }))
    .filter((item) => item.name.length > 0);

  const addons = asStringArray(root.addons);

  const tracks = asArray(root.tracks)
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => item !== undefined)
    .map((item) => {
      const areas = asArray(item.areas)
        .map((area) => asRecord(area))
        .filter((area): area is Record<string, unknown> => area !== undefined)
        .map((area) => ({
          name: asString(area.name),
        }))
        .filter((area) => area.name.length > 0);

      return {
        name: asString(item.name),
        areas,
      };
    })
    .filter((item) => item.name.length > 0);

  const tiles = asArray(root.tiles)
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => item !== undefined)
    .map((item) => ({
      path: asString(item.path),
      xOffset: asNumber(item.x_offset),
      zOffset: asNumber(item.z_offset),
    }))
    .filter((item) => item.path.length > 0);

  const origin = asRecord(root.origin);
  const originX = asNumber(root.origin_x ?? root.originX ?? origin?.x, 0);
  const originZ = asNumber(root.origin_z ?? root.originZ ?? origin?.z, 0);

  return {
    vertexes,
    areas,
    addons,
    tracks,
    tiles,
    origin: {
      x: originX,
      z: originZ,
    },
  };
}