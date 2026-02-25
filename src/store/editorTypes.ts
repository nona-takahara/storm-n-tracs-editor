import AddonVehicle from "../data/AddonVehicle";
import AreaPolygon from "../data/AreaPolygon";
import NtracsTrack from "../data/NtracsTrack";
import StormTracks from "../data/StormTracks";
import Vector2d from "../data/Vector2d";
import * as EditMode from "../EditMode";

export const DEFAULT_PROJECT_ORIGIN_X = 0;
export const DEFAULT_PROJECT_ORIGIN_Z = 0;

export interface LoadedProjectData {
  vertexes: Map<string, Vector2d>;
  areas: Map<string, AreaPolygon>;
  tileAssign: Map<string, Vector2d>;
  addonList: string[];
  origin: Vector2d;
  vehicles: AddonVehicle[];
  swtracks: StormTracks[];
  nttracks: Map<string, NtracsTrack>;
}

export interface EditorState extends LoadedProjectData {
  nearestVertex: string | undefined;
  selectedArea: string | undefined;
  selectedTrack: string | undefined;
  trackChainSelectEnabled: boolean;
  previewAreaId: string | undefined;
  previewTrackId: string | undefined;
  editMode: EditMode.EditMode;
}

export function createInitialEditorState(): EditorState {
  return {
    vertexes: new Map<string, Vector2d>(),
    areas: new Map<string, AreaPolygon>(),
    tileAssign: new Map<string, Vector2d>(),
    addonList: [],
    origin: new Vector2d(DEFAULT_PROJECT_ORIGIN_X, DEFAULT_PROJECT_ORIGIN_Z),
    vehicles: [],
    swtracks: [],
    nttracks: new Map<string, NtracsTrack>(),
    nearestVertex: undefined,
    selectedArea: undefined,
    selectedTrack: undefined,
    trackChainSelectEnabled: false,
    previewAreaId: undefined,
    previewTrackId: undefined,
    editMode: EditMode.EditArea,
  };
}