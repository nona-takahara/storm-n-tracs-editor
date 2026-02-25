import NtracsTrack, { AreaCollection } from "../../data/NtracsTrack";

export function createEmptyTrack(): NtracsTrack {
  return new NtracsTrack([]);
}

export function createTrackWithAreas(areas: AreaCollection[]): NtracsTrack {
  return new NtracsTrack(areas);
}

export function moveTrackAreaEntry(
  areas: AreaCollection[],
  fromIndex: number,
  toIndex: number
): AreaCollection[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= areas.length ||
    toIndex >= areas.length ||
    fromIndex === toIndex
  ) {
    return areas;
  }

  const next = [...areas];
  const [target] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, target);
  return next;
}
