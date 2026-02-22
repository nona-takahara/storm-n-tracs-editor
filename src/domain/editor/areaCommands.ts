import * as AxleMode from "../../data/AxleMode";
import AreaPolygon from "../../data/AreaPolygon";
import Vector2d from "../../data/Vector2d";

export function createEmptyAreaPolygon(): AreaPolygon {
  return new AreaPolygon([], 0, AxleMode.NoChange, "", []);
}

export function createAreaWithVertexes(
  area: AreaPolygon,
  vertexes: string[]
): AreaPolygon {
  const leftVertexInnerId =
    area.leftVertexInnerId >= 0 && area.leftVertexInnerId < vertexes.length
      ? area.leftVertexInnerId
      : 0;

  return new AreaPolygon(
    vertexes,
    leftVertexInnerId,
    area.axleMode,
    area.callback,
    [...area.uparea]
  );
}

export function createAreaWithCallback(
  area: AreaPolygon,
  callback: string
): AreaPolygon {
  return new AreaPolygon(
    [...area.vertexes],
    area.leftVertexInnerId,
    area.axleMode,
    callback,
    [...area.uparea]
  );
}

export function createAreaWithUpAreas(
  area: AreaPolygon,
  uparea: string[]
): AreaPolygon {
  return new AreaPolygon(
    [...area.vertexes],
    area.leftVertexInnerId,
    area.axleMode,
    area.callback,
    uparea
  );
}

export function createAreaWithLeftVertex(
  area: AreaPolygon,
  vertexId: string
): AreaPolygon {
  const nextIndex = area.vertexes.indexOf(vertexId);
  if (nextIndex === -1) {
    return area;
  }

  return new AreaPolygon(
    [...area.vertexes],
    nextIndex,
    area.axleMode,
    area.callback,
    [...area.uparea]
  );
}

export function nextAreaName(areas: Map<string, AreaPolygon>): string {
  let index = areas.size;
  while (areas.has(`Area_${index}`)) {
    index += 1;
  }
  return `Area_${index}`;
}

export function nextVertexName(vertexes: Map<string, Vector2d>): string {
  let index = vertexes.size;
  while (vertexes.has(`v${index}`)) {
    index += 1;
  }
  return `v${index}`;
}
