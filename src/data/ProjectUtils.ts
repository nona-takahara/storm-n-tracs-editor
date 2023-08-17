import { Updater } from "use-immer";
import AreaPolygon from "./AreaPolygon";
import Vector2d from "./Vector2d";

export function CreateObject(obj: any, vupdater: Updater<Map<string, Vector2d>>, aupdater: Updater<Map<string, AreaPolygon>>) {
  function makeMap<V>(obj: any, target: string, cstr: (v: any) => V) {
    const mmap = new Map<string, V>();
    for (const key in obj?.[target]) {
      if (Object.prototype.hasOwnProperty.call(obj?.[target], key)) {
        mmap.set(key, cstr(obj?.[target][key]))
      }
    }
    return mmap;
  }

  vupdater(makeMap(obj, "vertexes", elm => new Vector2d(elm.x, elm.z)));
  aupdater(makeMap(obj, "areas", elm => new AreaPolygon(elm.vertexes, elm.leftVertexInnerId)));
}

export function CreateSaveObject(vertexes: Map<string, Vector2d>, areas: Map<string, AreaPolygon>) {
  const relatedMap = new Map<string, string[]>
  for (const [key, val] of areas) {
    for (const v of val.vertexes) {
      relatedMap.set(v, (relatedMap.get(v) || []).concat(key));
    }
  }

  function mapMap<V1, V2>(map: Map<string, V1>, fn: (val: V1, key: string) => V2): { [index: string]: V2 } {
    return [...map].reduce((l, [k, v]) => Object.assign(l, { [k]: fn(v, k) }), {});
  }

  let returns = {
    vertexes: mapMap(vertexes, (v) => {
      return {
        x: v.x,
        z: v.z
      }
    }),
    areas: mapMap(areas, (v, k) => {
      return {
        vertexes: v.vertexes,
        leftVertexInnerId: v.leftVertexInnerId,
        related: Array.from(v.vertexes.reduce((pv, cv) => {
          relatedMap.get(cv)?.forEach((rv) => pv.add(rv));
          return pv;
        }, new Set<string>())).filter((vv) => vv !== k)
      }
    })
  }

  return returns;
}