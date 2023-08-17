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

function read_addon_command(foldername: string) {
  return invoke("read_addon_command", { foldername: foldername }) as Promise<string>;
}

function itr<T>(item: T[] | T): T[] {
  if (Array.isArray(item)) {
    return item;
  } else {
    return [item];
  }
}

export function CreateObject(
  obj: any,
  vupdater: Updater<Map<string, Vector2d>>,
  aupdater: Updater<Map<string, AreaPolygon>>,
  tlupdater: Updater<Map<string, Vector2d>>,
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
      (elm) => new AreaPolygon(elm.vertexes, elm.left_vertex_inner_id, AxleMode.modeFromStr(elm.axle_mode))
    )
  );

  const tileAssign = new Map<string, Vector2d>();

  for (let x = 0; x <= 16; x++) {
    for (let y = 0; y <= 9; y++) {
      tileAssign.set(`data/tiles/mega_island_${x}_${y}.xml`, new Vector2d((x - 8) * 1000, (y * 1000) - 12000))
    }
  }
  tlupdater(tileAssign);

  for (const [tilename, pos] of tileAssign) {
    read_tile_file_command(tilename).then(
      (str) => {
        const xmlParser = new XMLParser({
          ignoreAttributes: false,
          ignoreDeclaration: true
        });
        swtrack((old) => old.concat(StormTracks.loadFromXML(pos.x, pos.z, xmlParser.parse(str)))
        );
      }
    );
  }

  read_addon_command("SER_Hokko").then((v) => {
    const xmlParser = new XMLParser({
      ignoreAttributes: false,
      ignoreDeclaration: true
    });
    const obj = xmlParser.parse(v);
    const locations = itr(obj?.playlist?.locations?.locations?.l);
    for (const l of locations) {
      const offset = tileAssign.get(l["@_tile"]);
      const components = itr(l.components.c);
      if (offset && components.length >= 1) {
        for (const c of components) {
          console.log(c);
        }
      }
    }
  })
}

export function CreateSaveObject(
  vertexes: Map<string, Vector2d>,
  areas: Map<string, AreaPolygon>,
  tileAssign: Map<string, Vector2d>
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
        left_vertex_inner_id: v.leftVertexInnerId,
        related: Array.from(
          v.vertexes.reduce((pv, cv) => {
            relatedMap.get(cv)?.forEach((rv) => pv.add(rv));
            return pv;
          }, new Set<string>())
        ).filter((vv) => vv !== k),
        axle_mode: v.axleMode
      };
    }),
    tiles: mapMap(tileAssign, (v, k) => ({
      x_offset: v.x,
      z_offset: v.z
    }))
  };

  return returns;
}
