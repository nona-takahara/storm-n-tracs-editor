import { invoke } from "@tauri-apps/api";
import { XMLParser } from "fast-xml-parser";
import { Updater } from "use-immer";
import AreaPolygon from "./AreaPolygon";
import * as AxleMode from "./AxleMode";
import StormTracks from "./StormTracks";
import Vector2d from "./Vector2d";


function read_tile_file_command(filename: string) {
  return invoke("read_tile_file_command", { filename: filename }) as Promise<string>;
}

export function CreateObject(
  obj: any,
  vupdater: Updater<Map<string, Vector2d>>,
  aupdater: Updater<Map<string, AreaPolygon>>,
  swtrack: React.Dispatch<React.SetStateAction<StormTracks[]>>
) {
  function makeMap<V>(obj: any, target: string, cstr: (v: any) => V) {
    const mmap = new Map<string, V>();
    for (const key in obj?.[target]) {
      if (Object.prototype.hasOwnProperty.call(obj?.[target], key)) {
        mmap.set(key, cstr(obj?.[target][key]));
      }
    }
    return mmap;
  }

  vupdater(makeMap(obj, "vertexes", (elm) => new Vector2d(elm.x, elm.z)));
  aupdater(
    makeMap(
      obj,
      "areas",
      (elm) => new AreaPolygon(elm.vertexes, elm.leftVertexInnerId, AxleMode.modeFromStr(elm.axleMode))
    )
  );

  for (let x = 0; x <= 16; x++) {
    for (let y = 0; y <= 9; y++) {
      read_tile_file_command(`mega_island_${x}_${y}.xml`).then(
        (str) => {
          const xmlParser = new XMLParser({
            ignoreAttributes: false,
            ignoreDeclaration: true
          });
          swtrack((old) => {
            const list = old.slice();
            list[(x) * 10 + y] = StormTracks.loadFromXML((x - 8) * 1000, (y * 1000) - 12000, xmlParser.parse(str));
            return list;
          });
        }
      ).catch(() => console.log(x, y));
    }
  }
}

export function CreateSaveObject(
  vertexes: Map<string, Vector2d>,
  areas: Map<string, AreaPolygon>
) {
  const relatedMap = new Map<string, string[]>();
  for (const [key, val] of areas) {
    for (const v of val.vertexes) {
      relatedMap.set(v, (relatedMap.get(v) || []).concat(key));
    }
  }

  function mapMap<V1, V2>(
    map: Map<string, V1>,
    fn: (val: V1, key: string) => V2
  ): { [index: string]: V2 } {
    return [...map].reduce(
      (l, [k, v]) => Object.assign(l, { [k]: fn(v, k) }),
      {}
    );
  }

  let returns = {
    vertexes: mapMap(vertexes, (v) => {
      return {
        x: v.x,
        z: v.z,
      };
    }),
    areas: mapMap(areas, (v, k) => {
      return {
        vertexes: v.vertexes,
        leftVertexInnerId: v.leftVertexInnerId,
        related: Array.from(
          v.vertexes.reduce((pv, cv) => {
            relatedMap.get(cv)?.forEach((rv) => pv.add(rv));
            return pv;
          }, new Set<string>())
        ).filter((vv) => vv !== k),
        axleMode: v.axleMode
      };
    }),
  };

  return returns;
}
