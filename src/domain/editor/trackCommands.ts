import NtracsTrack, { AreaCollection, TrackFlag } from "../../data/NtracsTrack";

export function normalizeTrackFlag(flag: string): TrackFlag {
  if (flag === TrackFlag.upbound) {
    return TrackFlag.upbound;
  }
  if (flag === TrackFlag.downbound) {
    return TrackFlag.downbound;
  }
  return TrackFlag.none;
}

export function createEmptyTrack(): NtracsTrack {
  return new NtracsTrack([]);
}

export function createTrackWithAreas(areas: AreaCollection[]): NtracsTrack {
  return new NtracsTrack(areas);
}

export function cycleTrackFlag(flag: TrackFlag): TrackFlag {
  if (flag === TrackFlag.none) {
    return TrackFlag.upbound;
  }
  if (flag === TrackFlag.upbound) {
    return TrackFlag.downbound;
  }
  return TrackFlag.none;
}
