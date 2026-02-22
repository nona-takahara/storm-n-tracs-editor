function itr<T>(item: T[] | T): T[] {
  if (Array.isArray(item)) {
    return item;
  } else {
    return [item];
  }
}

interface TrackXmlLink {
  "@_id"?: string;
}

interface TrackXmlNode {
  "@_id"?: string;
  links?: {
    link?: TrackXmlLink | TrackXmlLink[];
  };
  transform?: {
    "@_30"?: string | number;
    "@_32"?: string | number;
  };
}

interface StormTracksXml {
  definition?: {
    train_tracks?: {
      track?: TrackXmlNode | TrackXmlNode[];
    };
  };
}

class StormTracks {
  constructor(public offsetX: number, public offsetZ: number, public tracks: Record<string, TrackNode>) { }

  static loadFromXML(offsetX: number, offsetZ: number, xmlObject: unknown): StormTracks {
    const source = xmlObject as StormTracksXml;
    const tir = source.definition?.train_tracks?.track;
    const list: Record<string, TrackNode> = {};
    if (tir) {
      const fitr = itr(tir);
      for (const i of fitr) {
        if (i?.["@_id"]) {
          const links = i?.links?.link;
          list[i["@_id"]] = new TrackNode(
            Number(i.transform?.["@_30"] ?? 0),
            Number(i.transform?.["@_32"] ?? 0),
            Array.isArray(links)
              ? links.map((v) => v["@_id"] ?? "")
              : [links?.["@_id"] ?? ""]
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
