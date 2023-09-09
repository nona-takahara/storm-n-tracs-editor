import AreaPolygon from "./AreaPolygon";

class NtracsTrack {
  constructor(public areas: AreaCollection[]) { }
}

export class AreaCollection {
  constructor(public areaName: string, public trackFlag: TrackFlag) { }
}

export enum TrackFlag {
  none = "none",
  upbound = "upbound",
  downbound = "downbound"
}

export default NtracsTrack;