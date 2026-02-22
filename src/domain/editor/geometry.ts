import AreaPolygon from "../../data/AreaPolygon";
import Vector2d from "../../data/Vector2d";

export interface StageTransform {
  width: number;
  height: number;
  leftPos: number;
  topPos: number;
  scale: number;
}

export function toWorldPosition(
  clientX: number,
  clientY: number,
  transform: StageTransform
): Vector2d {
  return new Vector2d(
    -((transform.width / 2 - clientX) / transform.scale + transform.leftPos),
    (transform.height / 2 - clientY) / transform.scale + transform.topPos
  );
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

export function findNearestVertex(
  vertexes: Map<string, Vector2d>,
  point: Vector2d,
  threshold = 1
): string | undefined {
  let nearest: string | undefined;
  let nearestDistance = threshold;
  for (const [key, vertex] of vertexes.entries()) {
    const len = distance(point.x, point.z, vertex.x, vertex.z);
    if (len < nearestDistance) {
      nearestDistance = len;
      nearest = key;
    }
  }
  return nearest;
}

export function findMergeTargetVertex(
  vertexes: Map<string, Vector2d>,
  sourceVertexKey: string,
  threshold = 1
): string | undefined {
  const sourceVertex = vertexes.get(sourceVertexKey);
  if (!sourceVertex) {
    return undefined;
  }

  let nearest: string | undefined;
  let nearestDistance = threshold;
  for (const [key, vertex] of vertexes.entries()) {
    if (key === sourceVertexKey) {
      continue;
    }
    const len = distance(sourceVertex.x, sourceVertex.z, vertex.x, vertex.z);
    if (len < nearestDistance) {
      nearestDistance = len;
      nearest = key;
    }
  }

  return nearest;
}

export function hitTestArea(
  areas: Map<string, AreaPolygon>,
  vertexes: Map<string, Vector2d>,
  point: Vector2d
): string | undefined {
  for (const [key, area] of areas.entries()) {
    if (area.isInArea(vertexes, point.x, point.z)) {
      return key;
    }
  }

  return undefined;
}
