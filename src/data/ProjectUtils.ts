import { invoke } from "@tauri-apps/api";
import { XMLParser } from "fast-xml-parser";
import { Updater } from "use-immer";
import AddonVehicle from "./AddonVehicle";
import AreaPolygon from "./AreaPolygon";
import * as AxleMode from "./AxleMode";
import StormTracks from "./StormTracks";
import Vector2d from "./Vector2d";
import NtracsTrack, { AreaCollection, TrackFlag } from "./NtracsTrack";

const xmlParserOption = {
  ignoreAttributes: false,
  ignoreDeclaration: true,
};

function read_tile_file_command(filename: string) {
  return invoke("read_tile_file_command", {
    filename: filename,
  }) as Promise<string>;
}

function read_addon_command(foldername: string) {
  return invoke("read_addon_command", {
    foldername: foldername,
  }) as Promise<string>;
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
  dupdater: React.Dispatch<string[]>,
  mupdater: React.Dispatch<AddonVehicle[]>,
  swtrack: React.Dispatch<React.SetStateAction<StormTracks[]>>,
  nttrackupdater: Updater<Map<string, NtracsTrack>>
) {
  function makeMap<V>(obj: any, target: string, cstr: (v: any) => V) {
    const mmap = new Map<string, V>();
    for (const iterator of obj?.[target]) {
      mmap.set(iterator.name, cstr(iterator));
    }
    return mmap;
  }

  vupdater(makeMap(obj, "vertexes", (elm) => new Vector2d(elm.x, elm.z)));
  aupdater(
    makeMap(
      obj,
      "areas",
      (elm) =>
        new AreaPolygon(
          elm.vertexes,
          elm.left_vertex_inner_id || 0,
          AxleMode.modeFromStr(elm.axle_mode),
          elm.callback || ""
        )
    )
  );

  let addons: string[] = [];
  if (obj?.addons && Array.isArray(obj.addons)) {
    addons = (obj.addons as string[]).slice();
  }
  dupdater(addons);

  const tileAssign = new Map<string, Vector2d>();
  for (let x = 0; x <= 16; x++) {
    for (let y = 0; y <= 9; y++) {
      tileAssign.set(
        `data/tiles/mega_island_${x}_${y}.xml`,
        new Vector2d((x - 8) * 1000, y * 1000 - 12000)
      );
    }
  }
  tlupdater(tileAssign);

  type TilePromise = { str: string; pos: Vector2d };
  const tileload: Promise<TilePromise>[] = [];
  for (const [tilename, pos] of tileAssign) {
    tileload.push(
      new Promise((resolve, rejected) => {
        read_tile_file_command(tilename)
          .then((v) => {
            resolve({ str: v, pos: pos });
          })
          .catch((e) => {
            rejected(e);
          });
      })
    );
  }

  Promise.allSettled<TilePromise>(tileload).then((v0) => {
    swtrack(
      v0
        .map((v) => {
          if (v.status === "fulfilled") {
            const p = v.value;
            const obj = new XMLParser(xmlParserOption).parse(p.str);
            return StormTracks.loadFromXML(p.pos.x, p.pos.z, obj);
          } else {
            console.error(v.reason);
            return undefined;
          }
        })
        .filter(
          (item): item is Exclude<typeof item, undefined> => item !== undefined
        )
    );
  });

  Promise.allSettled(addons.map((name) => read_addon_command(name))).then(
    (a) => {
      const vehicles: AddonVehicle[] = [];
      a.forEach((k) => {
        if (k.status == "fulfilled") {
          const v = k.value;
          const obj = new XMLParser(xmlParserOption).parse(v);
          const locations = itr(obj?.playlist?.locations?.locations?.l);
          for (const l of locations) {
            const offset = tileAssign.get(l["@_tile"]);
            const components = itr(l.components.c);
            if (offset && components.length >= 1) {
              for (const c of components) {
                const item = new AddonVehicle(
                  Number(c.spawn_transform["@_30"]) + offset.x,
                  Number(c.spawn_transform["@_32"]) + offset.z,
                  Number(c.spawn_bounds.max["@_x"]) -
                  Number(c.spawn_bounds.min["@_x"]),
                  Number(c.spawn_bounds.min["@_z"]) -
                  Number(c.spawn_bounds.max["@_z"]),
                  Number(c.spawn_transform["@_00"]),
                  Number(c.spawn_transform["@_02"]),
                  Number(c.spawn_transform["@_20"]),
                  Number(c.spawn_transform["@_22"]),
                  c["@_name"]
                );
                vehicles.push(item);
              }
            }
          }
        } else {
          console.error(k.reason);
        }
      });
      mupdater(vehicles);
    }
  );

  nttrackupdater(makeMap(obj, "tracks", (elm) => new NtracsTrack(elm.map(
    (v: any) => new AreaCollection(v.name, v.trackFlag)
  ))));
}

export function CreateSaveObject(
  vertexes: Map<string, Vector2d>,
  areas: Map<string, AreaPolygon>,
  addons: string[],
  tileAssign: Map<string, Vector2d>,
  nttrack: Map<string, NtracsTrack>
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
  ): V2[] {
    return [...map].map((v) => fn(v[1], v[0]))
  }

  let returns = {
    vertexes: mapMap(vertexes, (v, k) => {
      return {
        name: k,
        x: v.x,
        z: v.z,
      };
    }),
    areas: mapMap(areas, (v, k) => {
      return {
        name: k,
        vertexes: v.vertexes,
        left_vertex_inner_id: v.leftVertexInnerId,
        related: Array.from(
          v.vertexes.reduce((pv, cv) => {
            relatedMap.get(cv)?.forEach((rv) => pv.add(rv));
            return pv;
          }, new Set<string>())
        ).filter((vv) => vv !== k),
        axle_mode: v.axleMode,
        callback: v.callback
      };
    }),
    addons: addons,
    tracks: mapMap(nttrack, (v, k) => {
      return {
        name: k,
        areas: v.areas.map((j) => {
          return {
            name: j.areaName,
            trackFlag: j.trackFlag
          }
        })
      }
    }),
    tiles: mapMap(tileAssign, (v, k) => ({
      path: k,
      x_offset: v.x,
      z_offset: v.z,
    })),
  };

  return returns;
}
