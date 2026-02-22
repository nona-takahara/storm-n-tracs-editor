import * as AxleMode from "../../data/AxleMode";
import AreaPolygon from "../../data/AreaPolygon";
import Vector2d from "../../data/Vector2d";

// 空の AreaPolygon を初期値で作成する。
export function createEmptyAreaPolygon(): AreaPolygon {
  return new AreaPolygon([], 0, AxleMode.NoChange, "", []);
}

// 頂点配列のみを差し替えた AreaPolygon を作成する。
// leftVertexInnerId は新しい頂点数に収まる値へ補正する。
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

// callback だけを更新した AreaPolygon を作成する。
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

// uparea だけを更新した AreaPolygon を作成する。
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

// 指定頂点を left vertex に設定した AreaPolygon を作成する。
// 指定頂点が存在しない場合は元のオブジェクトをそのまま返す。
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

// 既存名と衝突しない Area 名を採番する。
export function nextAreaName(areas: Map<string, AreaPolygon>): string {
  let index = areas.size;
  while (areas.has(`Area_${index}`)) {
    index += 1;
  }
  return `Area_${index}`;
}

// 既存名と衝突しない頂点名を採番する。
export function nextVertexName(vertexes: Map<string, Vector2d>): string {
  let index = vertexes.size;
  while (vertexes.has(`v${index}`)) {
    index += 1;
  }
  return `v${index}`;
}
