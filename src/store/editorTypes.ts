import AddonVehicle from "../data/AddonVehicle";
import AreaPolygon from "../data/AreaPolygon";
import NtracsTrack from "../data/NtracsTrack";
import StormTracks from "../data/StormTracks";
import Vector2d from "../data/Vector2d";
import * as EditMode from "../EditMode";

export interface LoadedProjectData {
  vertexes: Map<string, Vector2d>;
  areas: Map<string, AreaPolygon>;
  tileAssign: Map<string, Vector2d>;
  addonList: string[];
  vehicles: AddonVehicle[];
  swtracks: StormTracks[];
  nttracks: Map<string, NtracsTrack>;
}

export interface EditorState extends LoadedProjectData {
  nearestVertex: string | undefined;
  selectedArea: string | undefined;
  selectedTrack: string | undefined;
  editMode: EditMode.EditMode;
}

export function createInitialEditorState(): EditorState {
  return {
    vertexes: new Map<string, Vector2d>(),
    areas: new Map<string, AreaPolygon>(),
    tileAssign: new Map<string, Vector2d>(),
    addonList: [],
    vehicles: [],
    swtracks: [],
    nttracks: new Map<string, NtracsTrack>(),
    nearestVertex: undefined,
    selectedArea: undefined,
    selectedTrack: undefined,
    editMode: EditMode.EditArea,
  };
}
