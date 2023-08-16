function itr<T>(item: T[] | T): T[] {
  if (Array.isArray(item)) {
    return item;
  } else {
    return [item];
  }
}

class StormTracks {
  constructor(public offsetX: number, public offsetZ: number, public tracks: { [index: string]: TrackNode }) { }

  static loadFromXML(offsetX: number, offsetZ: number, xmlObject: any): StormTracks {
    const tir = xmlObject?.definition?.train_tracks?.track;
    let list: { [index: string]: TrackNode } = {};
    if (tir) {
      const fitr = itr(tir);
      for (const i of fitr) {
        if (i?.["@_id"]) {
          const links = i?.links?.link;
          list[i["@_id"]] = new TrackNode(
            Number(i.transform["@_30"]),
            Number(i.transform["@_32"]),
            Array.isArray(links)
              ? links.map(v => v["@_id"])
              : [links?.["@_id"] || ""]
          );
        }
      }
    }
    return new StormTracks(offsetX, offsetZ, list);
  }
}

export class TrackNode {
  constructor(public x: number, public z: number, public links: string[]) { }
}

export default StormTracks;