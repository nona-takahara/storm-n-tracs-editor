import NtracsTrack, { AreaCollection, TrackFlag } from "../../data/NtracsTrack";

// 文字列入力を TrackFlag に正規化する。
export function normalizeTrackFlag(flag: string): TrackFlag {
  if (flag === TrackFlag.upbound) {
    return TrackFlag.upbound;
  }
  if (flag === TrackFlag.downbound) {
    return TrackFlag.downbound;
  }
  return TrackFlag.none;
}

// 空の NtracsTrack を作成する。
export function createEmptyTrack(): NtracsTrack {
  return new NtracsTrack([]);
}

// 指定 AreaCollection 配列で NtracsTrack を再構築する。
export function createTrackWithAreas(areas: AreaCollection[]): NtracsTrack {
  return new NtracsTrack(areas);
}

// フラグを none -> upbound -> downbound -> none の順で循環させる。
export function cycleTrackFlag(flag: TrackFlag): TrackFlag {
  if (flag === TrackFlag.none) {
    return TrackFlag.upbound;
  }
  if (flag === TrackFlag.upbound) {
    return TrackFlag.downbound;
  }
  return TrackFlag.none;
}
