import AreaPolygon from "../data/AreaPolygon";
import NtracsTrack from "../data/NtracsTrack";
import Vector2d from "../data/Vector2d";

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
        trackFlag: area.trackFlag,
      })),
    })),
    tiles: mapEntries(input.tileAssign, (offset, path) => ({
      path,
      x_offset: offset.x,
      z_offset: offset.z,
    })),
  };
}
