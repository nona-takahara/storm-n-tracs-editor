import AreaPolygon from "./AreaPolygon";

class NtracsTrack {
  constructor(public name: string, public areas: AreaCollection[]) { }
}

export class AreaCollection {
  constructor(public area: AreaPolygon, public trackFlag: TrackFlag) { }
}

export enum TrackFlag {
  none = "none",
  upbound = "upbound",
  downbound = "downbound"
}

export default NtracsTrack;