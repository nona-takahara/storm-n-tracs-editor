// ntracs side track model that stores area sequence.
class NtracsTrack {
  constructor(public areas: AreaCollection[]) {}
}

// One area reference in a track sequence.
export class AreaCollection {
  constructor(public areaName: string) {}
}

export default NtracsTrack;
