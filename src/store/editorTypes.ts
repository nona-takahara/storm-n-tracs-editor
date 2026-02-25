import AddonVehicle from "../data/AddonVehicle";
import AreaPolygon from "../data/AreaPolygon";
import NtracsTrack from "../data/NtracsTrack";
import StormTracks from "../data/StormTracks";
import Vector2d from "../data/Vector2d";
import * as EditMode from "../EditMode";

// ファイル読み込み後に保持するプロジェクトデータ本体。
export interface LoadedProjectData {
  vertexes: Map<string, Vector2d>;
  areas: Map<string, AreaPolygon>;
  tileAssign: Map<string, Vector2d>;
  addonList: string[];
  vehicles: AddonVehicle[];
  swtracks: StormTracks[];
  nttracks: Map<string, NtracsTrack>;
}

// エディタ UI 状態を加えたストア全体の状態。
export interface EditorState extends LoadedProjectData {
  nearestVertex: string | undefined;
  selectedArea: string | undefined;
  selectedTrack: string | undefined;
  trackChainSelectEnabled: boolean;
  previewAreaId: string | undefined;
  editMode: EditMode.EditMode;
}

// エディタ起動時の初期状態を作成する。
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
    trackChainSelectEnabled: false,
    previewAreaId: undefined,
    editMode: EditMode.EditArea,
  };
}
