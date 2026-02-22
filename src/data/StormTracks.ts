// XML パース結果の単体/配列を配列へ正規化する。
function itr<T>(item: T[] | T): T[] {
  if (Array.isArray(item)) {
    return item;
  } else {
    return [item];
  }
}

// train_tracks XML の参照に必要な最小構造定義。
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

// タイルごとの stormworks 線路データを保持するモデル。
class StormTracks {
  constructor(public offsetX: number, public offsetZ: number, public tracks: Record<string, TrackNode>) { }

  // XML オブジェクトから TrackNode 辞書を構築する。
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

// 1 つの線路ノード(座標とリンク先)。
export class TrackNode {
  constructor(public x: number, public z: number, public links: string[]) { }
}

export default StormTracks;
