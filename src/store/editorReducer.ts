import { Draft, produce } from "immer";
import AreaPolygon from "../data/AreaPolygon";
import NtracsTrack, { AreaCollection } from "../data/NtracsTrack";
import Vector2d from "../data/Vector2d";
import * as EditMode from "../EditMode";
import {
  createAreaWithCallback,
  createAreaWithLeftVertex,
  createAreaWithUpAreas,
  createAreaWithVertexes,
  createEmptyAreaPolygon,
  nextAreaName,
  nextVertexName,
} from "../domain/editor/areaCommands";
import {
  findMergeTargetVertex,
  findNearestVertex,
  hitTestArea,
} from "../domain/editor/geometry";
import {
  resolveStagePrimaryDown,
  resolveStageSecondaryDown,
} from "../domain/editor/modeHandlers";
import { EditModeEvent, transitionEditMode } from "../domain/editor/editModeMachine";
import {
  createEmptyTrack,
  createTrackWithAreas,
  moveTrackAreaEntry,
} from "../domain/editor/trackCommands";
import { EditorState, LoadedProjectData } from "./editorTypes";

export type EditorAction =
  | { type: "hydrate-project"; payload: LoadedProjectData }
  | { type: "set-nearest-vertex"; payload: { vertexId: string | undefined } }
  | { type: "set-selected-area"; payload: { areaId: string | undefined } }
  | { type: "set-selected-track"; payload: { trackId: string | undefined } }
  | { type: "set-track-chain-select-enabled"; payload: { enabled: boolean } }
  | { type: "set-preview-area"; payload: { areaId: string | undefined } }
  | { type: "send-mode-event"; payload: { event: EditModeEvent } }
  | { type: "create-area" }
  | { type: "insert-vertex-between"; payload: { index: number } }
  | { type: "remove-vertex-from-selected-area"; payload: { index: number } }
  | { type: "delete-selected-area" }
  | { type: "update-selected-area-lua"; payload: { callback: string } }
  | { type: "add-selected-area-uparea"; payload: { uparea: string } }
  | { type: "remove-selected-area-uparea"; payload: { uparea: string } }
  | { type: "set-selected-area-left-vertex"; payload: { vertexId: string } }
  | { type: "create-track"; payload: { trackId: string } }
  | { type: "delete-selected-track" }
  | { type: "add-selected-area-to-track" }
  | { type: "append-area-to-selected-track-by-id"; payload: { areaId: string } }
  | { type: "clear-selected-track" }
  | { type: "remove-track-area"; payload: { index: number } }
  | { type: "move-track-area"; payload: { fromIndex: number; toIndex: number } }
  | {
      type: "stage-pointer-move";
      payload: { point: Vector2d; dragging: boolean };
    }
  | {
      type: "stage-primary-down";
      payload: { point: Vector2d; shiftKey: boolean };
    }
  | { type: "stage-secondary-down" }
  | { type: "stage-primary-up"; payload: { ctrlKey: boolean } };

// 編集モードの遷移処理を一箇所に集約する。
function applyModeEvent(
  draft: Draft<EditorState>,
  event: EditModeEvent
): void {
  draft.editMode = transitionEditMode(draft.editMode, event);
}

// 選択中トラックへ areaId を末尾追加する。重複や不整合は無視する。
function appendAreaToSelectedTrackById(
  draft: Draft<EditorState>,
  areaId: string
): void {
  if (!draft.selectedTrack || !draft.areas.has(areaId)) {
    return;
  }

  const track = draft.nttracks.get(draft.selectedTrack);
  if (!track) {
    return;
  }

  if (track.areas.some((entry) => entry.areaName === areaId)) {
    return;
  }

  draft.nttracks.set(
    draft.selectedTrack,
    createTrackWithAreas(track.areas.concat(new AreaCollection(areaId)))
  );
}

// 現在の選択が有効な場合のみ Area を返す。
function getSelectedArea(draft: Draft<EditorState>): AreaPolygon | undefined {
  if (!draft.selectedArea) {
    return undefined;
  }
  return draft.areas.get(draft.selectedArea);
}

// エリア追加中に新規頂点を作成し、選択中エリアの末尾に追加する。
function appendNewVertexToSelectedArea(
  draft: Draft<EditorState>,
  point: Vector2d
): void {
  const selectedAreaKey = draft.selectedArea;
  if (!selectedAreaKey) {
    return;
  }

  const area = draft.areas.get(selectedAreaKey);
  if (!area) {
    return;
  }

  const vertexId = nextVertexName(draft.vertexes);
  draft.vertexes.set(vertexId, new Vector2d(point.x, point.z));
  draft.areas.set(
    selectedAreaKey,
    createAreaWithVertexes(area, [...area.vertexes, vertexId])
  );
  draft.nearestVertex = vertexId;
}

// 既存頂点を選択中エリアのポリゴンへ追加する。
// 先頭頂点を再選択した場合はポリゴンを閉じて追加モードを終了する。
function appendExistingVertexToSelectedArea(
  draft: Draft<EditorState>,
  vertexId: string
): void {
  const selectedAreaKey = draft.selectedArea;
  if (!selectedAreaKey) {
    return;
  }

  const area = draft.areas.get(selectedAreaKey);
  if (!area) {
    return;
  }

  if (area.vertexes[0] === vertexId) {
    applyModeEvent(draft, "FINISH_ADD_AREA");
    return;
  }

  draft.areas.set(
    selectedAreaKey,
    createAreaWithVertexes(area, [...area.vertexes, vertexId])
  );
}

// 現在選択中エリアの頂点を指していない場合のみ、座標からエリア選択を更新する。
function selectAreaFromPoint(
  draft: Draft<EditorState>,
  point: Vector2d
): void {
  const selectedArea = getSelectedArea(draft);
  const nearestIsCurrentAreaVertex =
    draft.nearestVertex !== undefined &&
    selectedArea?.vertexes.includes(draft.nearestVertex) === true;

  if (nearestIsCurrentAreaVertex) {
    return;
  }

  const hitArea = hitTestArea(draft.areas, draft.vertexes, point);
  if (hitArea) {
    draft.selectedArea = hitArea;
    return;
  }

  if (draft.nearestVertex === undefined) {
    draft.selectedArea = undefined;
  }
}

// 最寄り頂点を 0.1 単位でスナップさせながら移動する。
function moveNearestVertex(
  draft: Draft<EditorState>,
  point: Vector2d
): void {
  const nearestVertex = draft.nearestVertex;
  if (!nearestVertex) {
    return;
  }

  draft.vertexes.set(
    nearestVertex,
    new Vector2d(Math.floor(point.x * 10) / 10, Math.floor(point.z * 10) / 10)
  );
}

// 最寄り頂点を近傍頂点へマージし、参照先を全エリアで置換してから元頂点を削除する。
function mergeNearestVertex(draft: Draft<EditorState>): void {
  const sourceVertex = draft.nearestVertex;
  if (!sourceVertex) {
    return;
  }

  const mergeTarget = findMergeTargetVertex(draft.vertexes, sourceVertex, 1);
  if (!mergeTarget) {
    return;
  }

  draft.nearestVertex = mergeTarget;
  draft.areas.forEach((area, key) => {
    if (!area.vertexes.includes(sourceVertex)) {
      return;
    }
    draft.areas.set(
      key,
      createAreaWithVertexes(
        area,
        area.vertexes.map((vertexId) =>
          vertexId === sourceVertex ? mergeTarget : vertexId
        )
      )
    );
  });
  draft.vertexes.delete(sourceVertex);
}

// モードごとの primary click 解決結果を受け取り、実処理へ振り分ける。
function applyStagePrimaryDown(
  draft: Draft<EditorState>,
  point: Vector2d,
  shiftKey: boolean
): void {
  if (
    draft.editMode === EditMode.EditTrack &&
    draft.trackChainSelectEnabled &&
    draft.selectedTrack
  ) {
    const hitArea = hitTestArea(draft.areas, draft.vertexes, point);
    if (hitArea) {
      draft.selectedArea = hitArea;
      appendAreaToSelectedTrackById(draft, hitArea);
      return;
    }

    if (draft.nearestVertex === undefined) {
      draft.selectedArea = undefined;
    }
    return;
  }

  const selectedArea = getSelectedArea(draft);
  const result = resolveStagePrimaryDown({
    mode: draft.editMode,
    nearestVertex: draft.nearestVertex,
    selectedAreaFirstVertex: selectedArea?.vertexes[0],
    shiftKey,
  });

  if (result.type === "append-new-vertex") {
    appendNewVertexToSelectedArea(draft, point);
    return;
  }
  if (result.type === "append-existing-vertex") {
    appendExistingVertexToSelectedArea(draft, result.vertexId);
    return;
  }
  if (result.type === "finish-add-area") {
    applyModeEvent(draft, "FINISH_ADD_AREA");
    return;
  }
  if (result.type === "select-area") {
    selectAreaFromPoint(draft, point);
  }
}

// 指定エリアを参照している全トラックからそのエリアを除去する。
function removeAreaFromTracks(
  nttracks: Draft<Map<string, NtracsTrack>>,
  areaId: string
): void {
  nttracks.forEach((track, key) => {
    const nextAreas = track.areas.filter((item) => item.areaName !== areaId);
    if (nextAreas.length !== track.areas.length) {
      nttracks.set(key, createTrackWithAreas(nextAreas));
    }
  });
}

// エリア削除時に、他エリアの uparea 参照からも同エリアを除去する。
function removeAreaFromUpareaLinks(
  areas: Draft<Map<string, AreaPolygon>>,
  areaId: string
): void {
  areas.forEach((area, key) => {
    if (!area.uparea.includes(areaId)) {
      return;
    }

    areas.set(
      key,
      createAreaWithUpAreas(
        area,
        area.uparea.filter((uparea) => uparea !== areaId)
      )
    );
  });
}

// 読み込みデータの参照を切り離すため、コレクションを複製して返す。
function cloneLoadedData(payload: LoadedProjectData): LoadedProjectData {
  return {
    vertexes: new Map(payload.vertexes),
    areas: new Map(payload.areas),
    tileAssign: new Map(payload.tileAssign),
    addonList: [...payload.addonList],
    vehicles: [...payload.vehicles],
    swtracks: [...payload.swtracks],
    nttracks: new Map(payload.nttracks),
  };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  return produce(state, (draft) => {
    // プロジェクト読み込み時の初期化・リセット処理。
    if (action.type === "hydrate-project") {
      const next = cloneLoadedData(action.payload);
      draft.vertexes = next.vertexes;
      draft.areas = next.areas;
      draft.tileAssign = next.tileAssign;
      draft.addonList = next.addonList;
      draft.vehicles = next.vehicles;
      draft.swtracks = next.swtracks;
      draft.nttracks = next.nttracks;
      draft.nearestVertex = undefined;
      draft.selectedArea = undefined;
      draft.selectedTrack = undefined;
      draft.trackChainSelectEnabled = false;
      draft.previewAreaId = undefined;
      draft.editMode = EditMode.EditArea;
      return;
    }

    // UI からの直接的な選択・モード更新。
    if (action.type === "set-nearest-vertex") {
      draft.nearestVertex = action.payload.vertexId;
      return;
    }

    if (action.type === "set-selected-area") {
      const areaId = action.payload.areaId;
      draft.selectedArea =
        areaId === undefined || draft.areas.has(areaId) ? areaId : draft.selectedArea;
      draft.previewAreaId = undefined;
      return;
    }

    if (action.type === "set-selected-track") {
      const trackId = action.payload.trackId;
      draft.selectedTrack =
        trackId === undefined || draft.nttracks.has(trackId)
          ? trackId
          : draft.selectedTrack;
      if (!draft.selectedTrack) {
        draft.trackChainSelectEnabled = false;
      }
      return;
    }

    if (action.type === "set-track-chain-select-enabled") {
      draft.trackChainSelectEnabled =
        action.payload.enabled &&
        draft.editMode === EditMode.EditTrack &&
        draft.selectedTrack !== undefined;
      return;
    }

    if (action.type === "set-preview-area") {
      draft.previewAreaId = action.payload.areaId;
      return;
    }

    if (action.type === "send-mode-event") {
      applyModeEvent(draft, action.payload.event);
      draft.previewAreaId = undefined;
      if (
        action.payload.event === "OPEN_TRACK_EDITOR" ||
        draft.editMode !== EditMode.EditTrack
      ) {
        draft.trackChainSelectEnabled = false;
      }
      return;
    }

    // エリア作成および頂点ジオメトリ編集。
    if (action.type === "create-area") {
      const areaId = nextAreaName(draft.areas);
      draft.areas.set(areaId, createEmptyAreaPolygon());
      draft.selectedArea = areaId;
      applyModeEvent(draft, "START_ADD_AREA");
      return;
    }

    if (action.type === "insert-vertex-between") {
      const areaId = draft.selectedArea;
      if (!areaId) {
        return;
      }

      const area = draft.areas.get(areaId);
      if (!area || area.vertexes.length === 0) {
        return;
      }

      const currentVertex = draft.vertexes.get(area.vertexes[action.payload.index]);
      const nextVertex = draft.vertexes.get(
        area.vertexes[(action.payload.index + 1) % area.vertexes.length]
      );
      if (!currentVertex || !nextVertex) {
        return;
      }

      const vertexId = nextVertexName(draft.vertexes);
      draft.vertexes.set(
        vertexId,
        new Vector2d(
          (currentVertex.x + nextVertex.x) / 2,
          (currentVertex.z + nextVertex.z) / 2
        )
      );

      const nextVertexes = [...area.vertexes];
      nextVertexes.splice(action.payload.index + 1, 0, vertexId);
      draft.areas.set(areaId, createAreaWithVertexes(area, nextVertexes));
      return;
    }

    if (action.type === "remove-vertex-from-selected-area") {
      const areaId = draft.selectedArea;
      if (!areaId) {
        return;
      }
      const area = draft.areas.get(areaId);
      if (!area || area.vertexes.length <= 3) {
        return;
      }
      draft.areas.set(
        areaId,
        createAreaWithVertexes(
          area,
          area.vertexes.filter((_, index) => index !== action.payload.index)
        )
      );
      return;
    }

    // エリア削除とメタ情報更新。
    if (action.type === "delete-selected-area") {
      const areaId = draft.selectedArea;
      if (!areaId) {
        return;
      }

      draft.areas.delete(areaId);
      removeAreaFromUpareaLinks(draft.areas, areaId);
      removeAreaFromTracks(draft.nttracks, areaId);
      draft.selectedArea = undefined;
      if (draft.previewAreaId === areaId) {
        draft.previewAreaId = undefined;
      }
      return;
    }

    if (action.type === "update-selected-area-lua") {
      const areaId = draft.selectedArea;
      if (!areaId) {
        return;
      }
      const area = draft.areas.get(areaId);
      if (!area) {
        return;
      }
      draft.areas.set(areaId, createAreaWithCallback(area, action.payload.callback));
      return;
    }

    if (action.type === "add-selected-area-uparea") {
      const areaId = draft.selectedArea;
      if (!areaId) {
        return;
      }

      const uparea = action.payload.uparea.trim();
      if (!uparea || uparea === areaId || !draft.areas.has(uparea)) {
        return;
      }

      const area = draft.areas.get(areaId);
      if (!area || area.uparea.includes(uparea)) {
        return;
      }

      draft.areas.set(areaId, createAreaWithUpAreas(area, [...area.uparea, uparea]));
      return;
    }

    if (action.type === "remove-selected-area-uparea") {
      const areaId = draft.selectedArea;
      if (!areaId) {
        return;
      }

      const area = draft.areas.get(areaId);
      if (!area) {
        return;
      }

      draft.areas.set(
        areaId,
        createAreaWithUpAreas(
          area,
          area.uparea.filter((uparea) => uparea !== action.payload.uparea)
        )
      );
      return;
    }

    if (action.type === "set-selected-area-left-vertex") {
      const areaId = draft.selectedArea;
      if (!areaId) {
        return;
      }
      const area = draft.areas.get(areaId);
      if (!area) {
        return;
      }
      draft.areas.set(
        areaId,
        createAreaWithLeftVertex(area, action.payload.vertexId)
      );
      return;
    }

    // トラックの作成・削除・構成更新。
    if (action.type === "create-track") {
      const trackId = action.payload.trackId.trim();
      if (!trackId) {
        return;
      }
      if (!draft.nttracks.has(trackId)) {
        draft.nttracks.set(trackId, createEmptyTrack());
      }
      draft.selectedTrack = trackId;
      return;
    }

    if (action.type === "delete-selected-track") {
      if (!draft.selectedTrack) {
        return;
      }
      draft.nttracks.delete(draft.selectedTrack);
      draft.selectedTrack = undefined;
      draft.trackChainSelectEnabled = false;
      return;
    }

    if (action.type === "add-selected-area-to-track") {
      if (!draft.selectedArea) {
        return;
      }
      appendAreaToSelectedTrackById(draft, draft.selectedArea);
      return;
    }

    if (action.type === "append-area-to-selected-track-by-id") {
      const areaId = action.payload.areaId;
      if (!areaId) {
        return;
      }
      appendAreaToSelectedTrackById(draft, areaId);
      return;
    }

    if (action.type === "move-track-area") {
      if (!draft.selectedTrack) {
        return;
      }

      const track = draft.nttracks.get(draft.selectedTrack);
      if (!track) {
        return;
      }

      const nextAreas = moveTrackAreaEntry(
        track.areas,
        action.payload.fromIndex,
        action.payload.toIndex
      );
      if (nextAreas === track.areas) {
        return;
      }

      draft.nttracks.set(draft.selectedTrack, createTrackWithAreas(nextAreas));
      return;
    }

    if (action.type === "clear-selected-track") {
      if (!draft.selectedTrack) {
        return;
      }
      draft.nttracks.set(draft.selectedTrack, createEmptyTrack());
      return;
    }

    if (action.type === "remove-track-area") {
      if (!draft.selectedTrack) {
        return;
      }
      const track = draft.nttracks.get(draft.selectedTrack);
      if (!track) {
        return;
      }
      draft.nttracks.set(
        draft.selectedTrack,
        createTrackWithAreas(
          track.areas.filter((_, index) => index !== action.payload.index)
        )
      );
      return;
    }

    // ステージ上のポインタイベントによるインタラクティブ編集。
    if (action.type === "stage-pointer-move") {
      if (action.payload.dragging) {
        moveNearestVertex(draft, action.payload.point);
      } else {
        draft.nearestVertex = findNearestVertex(draft.vertexes, action.payload.point, 1);
      }
      return;
    }

    if (action.type === "stage-primary-down") {
      applyStagePrimaryDown(draft, action.payload.point, action.payload.shiftKey);
      return;
    }

    if (action.type === "stage-secondary-down") {
      const result = resolveStageSecondaryDown(draft.editMode);
      if (result === "finish-add-area") {
        applyModeEvent(draft, "CANCEL_ADD_AREA");
      }
      return;
    }

    if (action.type === "stage-primary-up") {
      if (action.payload.ctrlKey) {
        mergeNearestVertex(draft);
      }
    }
  });
}
