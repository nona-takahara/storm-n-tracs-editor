// ntracs 側トラックのエリア列を保持するモデル。
class NtracsTrack {
  constructor(public areas: AreaCollection[]) { }
}

// トラック内の 1 エリア参照とフラグ。
export class AreaCollection {
  constructor(public areaName: string, public trackFlag: TrackFlag) { }
}

// トラック進行方向フラグ。
export enum TrackFlag {
  none = "none",
  upbound = "upbound",
  downbound = "downbound"
}

export default NtracsTrack;
