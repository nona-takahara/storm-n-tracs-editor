import AreaPolygon from "../data/AreaPolygon";
import NtracsTrack, { AreaCollection } from "../data/NtracsTrack";
import Vector2d from "../data/Vector2d";

const COORDINATE_SIGNIFICANT_DIGITS = 12;

export interface ProjectEncodeInput {
  vertexes: Map<string, Vector2d>;
  areas: Map<string, AreaPolygon>;
  addons: string[];
  tileAssign: Map<string, Vector2d>;
  nttracks: Map<string, NtracsTrack>;
}

function mapEntries<V1, V2>(
  map: Map<string, V1>,
  mapper: (value: V1, key: string) => V2
): V2[] {
  return [...map].map(([key, value]) => mapper(value, key));
}

function normalizeCoordinate(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const normalized = Number(value.toPrecision(COORDINATE_SIGNIFICANT_DIGITS));
  return Object.is(normalized, -0) ? 0 : normalized;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function cleanupProjectForSave(input: ProjectEncodeInput): ProjectEncodeInput {
  const vertexIdMap = new Map<string, string>();
  const nextVertexes = new Map<string, Vector2d>();
  for (const [vertexId, vertex] of input.vertexes.entries()) {
    const nextVertexId = String(vertexIdMap.size);
    vertexIdMap.set(vertexId, nextVertexId);
    nextVertexes.set(
      nextVertexId,
      new Vector2d(
        normalizeCoordinate(vertex.x),
        normalizeCoordinate(vertex.z)
      )
    );
  }

  const areaIdMap = new Map<string, string>();
  for (const areaId of input.areas.keys()) {
    areaIdMap.set(areaId, String(areaIdMap.size));
  }

  const nextAreas = new Map<string, AreaPolygon>();
  for (const [areaId, area] of input.areas.entries()) {
    const nextAreaId = areaIdMap.get(areaId);
    if (nextAreaId === undefined) {
      continue;
    }

    const mappedVertexes = area.vertexes
      .map((vertexId) => vertexIdMap.get(vertexId))
      .filter((vertexId): vertexId is string => vertexId !== undefined);

    const leftVertexInnerId =
      mappedVertexes.length === 0
        ? 0
        : clamp(area.leftVertexInnerId, 0, mappedVertexes.length - 1);

    const mappedUpArea = area.uparea
      .map((upareaId) => areaIdMap.get(upareaId))
      .filter((upareaId): upareaId is string => upareaId !== undefined);

    nextAreas.set(
      nextAreaId,
      new AreaPolygon(
        mappedVertexes,
        leftVertexInnerId,
        area.axleMode,
        area.callback,
        mappedUpArea
      )
    );
  }

  const nextTracks = new Map<string, NtracsTrack>();
  for (const [trackId, track] of input.nttracks.entries()) {
    const mappedTrackAreas = track.areas
      .map((entry) => areaIdMap.get(entry.areaName))
      .filter((areaId): areaId is string => areaId !== undefined)
      .map((areaId) => new AreaCollection(areaId));

    nextTracks.set(trackId, new NtracsTrack(mappedTrackAreas));
  }

  return {
    vertexes: nextVertexes,
    areas: nextAreas,
    addons: [...input.addons],
    tileAssign: new Map(input.tileAssign),
    nttracks: nextTracks,
  };
}

export function encodeProject(input: ProjectEncodeInput) {
  const relatedMap = new Map<string, string[]>();
  for (const [areaName, area] of input.areas.entries()) {
    for (const vertexId of area.vertexes) {
      relatedMap.set(vertexId, (relatedMap.get(vertexId) ?? []).concat(areaName));
    }
  }

  return {
    vertexes: mapEntries(input.vertexes, (vertex, name) => ({
      name,
      x: vertex.x,
      z: vertex.z,
    })),
    areas: mapEntries(input.areas, (area, name) => ({
      name,
      vertexes: area.vertexes,
      left_vertex_inner_id: area.leftVertexInnerId,
      related: Array.from(
        area.vertexes.reduce((pool, vertexId) => {
          relatedMap.get(vertexId)?.forEach((relatedAreaName) => pool.add(relatedAreaName));
          return pool;
        }, new Set<string>())
      ).filter((relatedAreaName) => relatedAreaName !== name),
      axle_mode: area.axleMode,
      callback: area.callback,
      uparea: area.uparea,
    })),
    addons: input.addons,
    tracks: mapEntries(input.nttracks, (track, name) => ({
      name,
      areas: track.areas.map((area) => ({
        name: area.areaName,
      })),
    })),
    tiles: mapEntries(input.tileAssign, (offset, path) => ({
      path,
      x_offset: offset.x,
      z_offset: offset.z,
    })),
  };
}
