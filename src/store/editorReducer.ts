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
  | { type: "set-project-origin"; payload: { x: number; z: number } }
  | { type: "set-nearest-vertex"; payload: { vertexId: string | undefined } }
  | { type: "set-selected-area"; payload: { areaId: string | undefined } }
  | { type: "set-selected-track"; payload: { trackId: string | undefined } }
  | { type: "set-track-chain-select-enabled"; payload: { enabled: boolean } }
  | { type: "set-preview-area"; payload: { areaId: string | undefined } }
  | { type: "set-preview-track"; payload: { trackId: string | undefined } }
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

// 鬩搾ｽｱ繝ｻ・ｨ鬯ｮ・ｮ郢晢ｽｻ・守坩・ｹ譎｢・ｽ・ｼ驛｢譎擾ｽｳ・ｨ郢晢ｽｻ鬯ｩ蛹・ｽｽ・ｷ鬩募∞・ｽ・ｻ髯ｷ繝ｻ・ｽ・ｦ鬨ｾ繝ｻ繝ｻ繝ｻ螳壼初・つ鬩阪ｅ繝ｻ陜ｨ蝣､・ｸ・ｺ繝ｻ・ｫ鬯ｮ・ｮ郢晢ｽｻ繝ｻ・ｴ郢晢ｽｻ隨倥・・ｹ・ｧ闕ｵ謨鳴郢晢ｽｻ
function applyModeEvent(
  draft: Draft<EditorState>,
  event: EditModeEvent
): void {
  draft.editMode = transitionEditMode(draft.editMode, event);
}

// 鬯ｩ蛹・ｽｽ・ｸ髫ｰ螢ｽ・ｨ雋ｻ・ｽ・ｸ繝ｻ・ｭ驛｢譎冗樟・主ｸｷ・ｹ譏ｴ繝ｻ邵ｺ驢搾ｽｸ・ｺ繝ｻ・ｸ areaId 驛｢・ｧ陷ｻ莠･・ｿ・ｰ髯昴・・ｽ・ｾ鬮ｴ謇假ｽｽ・ｽ髯ｷ莨夲ｽ｣・ｰ驍ｵ・ｺ陷ｷ・ｶ繝ｻ迢暦ｽｸ・ｲ郢ｧ荵晁｣滄ｫｫ髦ｪ繝ｻ繝ｻ繝ｻ蜿蛾密・ｴ驍丞ｹ・・陋ｹ・ｻ郢晢ｽｻ髴取ｻゑｽｽ・｡鬮ｫ蠅薙§隨倥・・ｹ・ｧ闕ｵ謨鳴郢晢ｽｻ
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

// 髴托ｽｴ繝ｻ・ｾ髯懶ｽｨ繝ｻ・ｨ驍ｵ・ｺ繝ｻ・ｮ鬯ｩ蛹・ｽｽ・ｸ髫ｰ螢ｽ・ｧ・ｭ遯ｶ・ｲ髫ｴ蟶ｷ逕･隴滄・・ｸ・ｺ繝ｻ・ｪ髯懶ｽ｣繝ｻ・ｴ髯ｷ・ｷ陋ｹ・ｻ郢晢ｽｻ驍ｵ・ｺ繝ｻ・ｿ Area 驛｢・ｧ陞ｳ螟ｲ・ｽ・ｿ隴∫ｵｶ繝ｻ驍ｵ・ｲ郢晢ｽｻ
function getSelectedArea(draft: Draft<EditorState>): AreaPolygon | undefined {
  if (!draft.selectedArea) {
    return undefined;
  }
  return draft.areas.get(draft.selectedArea);
}

// 驛｢・ｧ繝ｻ・ｨ驛｢譎｢・ｽ・ｪ驛｢・ｧ繝ｻ・｢鬮ｴ謇假ｽｽ・ｽ髯ｷ莨夲ｽ｣・ｰ髣包ｽｳ繝ｻ・ｭ驍ｵ・ｺ繝ｻ・ｫ髫ｴ繝ｻ・ｽ・ｰ鬮ｫ蜍滓ｲ√・・ｰ郢ｧ蟲ｨ笳矩Δ・ｧ陷代・・ｽ・ｽ隲帛現繝ｻ驍ｵ・ｺ陷会ｽｱ・つ郢晢ｽｻ遶城メ・ｬ螢ｽ・ｨ雋ｻ・ｽ・ｸ繝ｻ・ｭ驛｢・ｧ繝ｻ・ｨ驛｢譎｢・ｽ・ｪ驛｢・ｧ繝ｻ・｢驍ｵ・ｺ繝ｻ・ｮ髫ｴ蟷｢・ｽ・ｫ髯昴・・ｽ・ｾ驍ｵ・ｺ繝ｻ・ｫ鬮ｴ謇假ｽｽ・ｽ髯ｷ莨夲ｽ｣・ｰ驍ｵ・ｺ陷ｷ・ｶ繝ｻ迢暦ｽｸ・ｲ郢晢ｽｻ
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

// 髫ｴ魃会ｽｽ・｢髯昴・ﾂ・ｬ繝ｻ・ｰ郢ｧ蟲ｨ笳矩Δ・ｧ陝ｶ譏ｶ繝ｻ髫ｰ螢ｽ・ｨ雋ｻ・ｽ・ｸ繝ｻ・ｭ驛｢・ｧ繝ｻ・ｨ驛｢譎｢・ｽ・ｪ驛｢・ｧ繝ｻ・｢驍ｵ・ｺ繝ｻ・ｮ驛｢譎・ｺ｢・取㏍・ｹ・ｧ繝ｻ・ｴ驛｢譎｢・ｽ・ｳ驍ｵ・ｺ繝ｻ・ｸ鬮ｴ謇假ｽｽ・ｽ髯ｷ莨夲ｽ｣・ｰ驍ｵ・ｺ陷ｷ・ｶ繝ｻ迢暦ｽｸ・ｲ郢晢ｽｻ
// 髯ｷ閧ｲ・｣・ｯ繝ｻ・ｰ繝ｻ・ｭ鬯ｯ繝ｻ・臥ｸｺ蟶ｷ・ｹ・ｧ髮区ｧｭ繝ｻ鬯ｩ蛹・ｽｽ・ｸ髫ｰ螢ｽ・ｧ・ｭ繝ｻ・ｰ驍ｵ・ｺ雋・ｽｷ繝ｻ・ｰ繝ｻ・ｴ髯ｷ・ｷ陋ｹ・ｻ郢晢ｽｻ驛｢譎・ｺ｢・取㏍・ｹ・ｧ繝ｻ・ｴ驛｢譎｢・ｽ・ｳ驛｢・ｧ陝ｶ譎城匕驍ｵ・ｺ陋滂ｽ･遯ｶ・ｻ鬮ｴ謇假ｽｽ・ｽ髯ｷ莨夲ｽ｣・ｰ驛｢譎｢・ｽ・｢驛｢譎｢・ｽ・ｼ驛｢譎擾ｽｳ・ｨ繝ｻ蟶昴♀郢ｧ繝ｻ・ｽ・ｺ郢晢ｽｻ隨倥・・ｹ・ｧ闕ｵ謨鳴郢晢ｽｻ
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

// 髴托ｽｴ繝ｻ・ｾ髯懶ｽｨ繝ｻ・ｨ鬯ｩ蛹・ｽｽ・ｸ髫ｰ螢ｽ・ｨ雋ｻ・ｽ・ｸ繝ｻ・ｭ驛｢・ｧ繝ｻ・ｨ驛｢譎｢・ｽ・ｪ驛｢・ｧ繝ｻ・｢驍ｵ・ｺ繝ｻ・ｮ鬯ｯ繝ｻ・臥ｸｺ蟶ｷ・ｹ・ｧ陷ｻ蝓滂ｽｬ・ｰ驍ｵ・ｺ陷会ｽｱ遯ｶ・ｻ驍ｵ・ｺ郢晢ｽｻ遶企・・ｸ・ｺ郢晢ｽｻ繝ｻ・ｰ繝ｻ・ｴ髯ｷ・ｷ陋ｹ・ｻ郢晢ｽｻ驍ｵ・ｺ繝ｻ・ｿ驍ｵ・ｲ遶乗劼・ｽ・ｺ繝ｻ・ｧ髫ｶ轣倡函・ゑｽｰ驛｢・ｧ陝ｲ・ｨ邵ｺ鬘費ｽｹ譎｢・ｽ・ｪ驛｢・ｧ繝ｻ・｢鬯ｩ蛹・ｽｽ・ｸ髫ｰ螢ｽ・ｧ・ｭ繝ｻ螳夲ｽｭ蜴・ｽｽ・ｴ髫ｴ繝ｻ・ｽ・ｰ驍ｵ・ｺ陷ｷ・ｶ繝ｻ迢暦ｽｸ・ｲ郢晢ｽｻ
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

// 髫ｴ蟠｢ﾂ髯昴・繝ｻ繝ｻ莨・ｽｬ繝ｻ・臥ｸｺ蟶ｷ・ｹ・ｧ郢晢ｽｻ0.1 髯ｷ髮・繝ｻ・ｽ・ｽ鬮ｦ・ｪ邵ｲ蝣､・ｹ・ｧ繝ｻ・ｹ驛｢譎会ｽｿ・ｫ郢晢ｽ｣驛｢譎丞ｹｲ繝ｻ繝ｻ・ｸ・ｺ陝ｶ蜷ｮ繝ｻ驍ｵ・ｺ陟暮ｯ会ｽｽ陋ｾﾂｧ繝ｻ・ｻ髯ｷ蟠趣ｽｼ謚ｫ繝ｻ驛｢・ｧ闕ｵ謨鳴郢晢ｽｻ
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

// 髫ｴ蟠｢ﾂ髯昴・繝ｻ繝ｻ莨・ｽｬ繝ｻ・臥ｸｺ蟶ｷ・ｹ・ｧ陞ｳ螟ｲ・ｽ・ｿ陞滂ｽｧ繝ｻ蝓ｼ・ｬ繝ｻ・臥ｸｺ蟶ｷ・ｸ・ｺ繝ｻ・ｸ驛｢譎・ｽｧ・ｭ郢晢ｽｻ驛｢・ｧ繝ｻ・ｸ驍ｵ・ｺ陷会ｽｱ・つ遶乗刮蟠滄恷・｣繝ｻ・ｧ髯ｷ莠･迴ｾ繝ｻ螳壽ｦ繝ｻ・ｨ驛｢・ｧ繝ｻ・ｨ驛｢譎｢・ｽ・ｪ驛｢・ｧ繝ｻ・｢驍ｵ・ｺ繝ｻ・ｧ鬩励ｑ・ｽ・ｮ髫ｰ・ｰ陝ｶ蜻ｻ・ｼ・ｰ驍ｵ・ｺ繝ｻ・ｦ驍ｵ・ｺ闕ｵ譎｢・ｽ闃ｽ諤ｦ郢晢ｽｻ繝ｻ・ｰ郢ｧ蟲ｨ笳矩Δ・ｧ髮区ｨ抵ｽ朱ｬｮ・ｯ繝ｻ・､驍ｵ・ｺ陷ｷ・ｶ繝ｻ迢暦ｽｸ・ｲ郢晢ｽｻ
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

// 驛｢譎｢・ｽ・｢驛｢譎｢・ｽ・ｼ驛｢譎擾ｽｳ・ｨ繝ｻ繝ｻ・ｸ・ｺ繝ｻ・ｨ驍ｵ・ｺ繝ｻ・ｮ primary click 鬮ｫ證ｦ・ｽ・｣髮手ｶ｣・ｽ・ｺ鬩搾ｽｨ陷亥沺・｣・｡驛｢・ｧ髮区ｧｫ・･・ｳ驍ｵ・ｺ陞滂ｽｧ陷ｿ蜥擾ｽｹ・ｧ驗呻ｽｫ・つ遶乗劼・ｽ・ｮ雋・ｽｷ郢晢ｽｻ鬨ｾ繝ｻ繝ｻ遶城メ・ｬ蜴・ｽｽ・ｯ驛｢・ｧ鬮ｮ竏壹・驍ｵ・ｺ闔会ｽ｣繝ｻ迢暦ｽｸ・ｲ郢晢ｽｻ
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

// 髫ｰ謔ｶ繝ｻ繝ｻ・ｮ陞｢・ｹ邵ｺ鬘費ｽｹ譎｢・ｽ・ｪ驛｢・ｧ繝ｻ・｢驛｢・ｧ髮区ｨ貞ｴ滄恷・｣繝ｻ・ｧ驍ｵ・ｺ陷会ｽｱ遯ｶ・ｻ驍ｵ・ｺ郢晢ｽｻ繝ｻ邇匁ｦ繝ｻ・ｨ驛｢譎冗樟・主ｸｷ・ｹ譏ｴ繝ｻ邵ｺ驢搾ｽｸ・ｺ闕ｵ譎｢・ｽ閾･・ｸ・ｺ隴擾ｽｴ郢晢ｽｻ驛｢・ｧ繝ｻ・ｨ驛｢譎｢・ｽ・ｪ驛｢・ｧ繝ｻ・｢驛｢・ｧ陝ｶ譎乗ｱる匚・ｴ繝ｻ・ｻ驍ｵ・ｺ陷ｷ・ｶ繝ｻ迢暦ｽｸ・ｲ郢晢ｽｻ
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

// 驛｢・ｧ繝ｻ・ｨ驛｢譎｢・ｽ・ｪ驛｢・ｧ繝ｻ・｢髯ｷ蜿ｰ・ｼ竏晄ｱる垓蠑ｱ・・ｫ企豪・ｸ・ｲ遶擾ｽｽ繝ｻ・ｻ隰費ｽｶ邵ｺ鬘費ｽｹ譎｢・ｽ・ｪ驛｢・ｧ繝ｻ・｢驍ｵ・ｺ繝ｻ・ｮ uparea 髯ｷ・ｿ郢ｧ蟲ｨ繝ｻ驍ｵ・ｺ闕ｵ譎｢・ｽ閾･・ｹ・ｧ郢ｧ繝ｻ繝ｻ驛｢・ｧ繝ｻ・ｨ驛｢譎｢・ｽ・ｪ驛｢・ｧ繝ｻ・｢驛｢・ｧ陝ｶ譎乗ｱる匚・ｴ繝ｻ・ｻ驍ｵ・ｺ陷ｷ・ｶ繝ｻ迢暦ｽｸ・ｲ郢晢ｽｻ
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

// 鬮ｫ・ｱ繝ｻ・ｭ驍ｵ・ｺ繝ｻ・ｿ鬮ｴ雜｣・ｽ・ｼ驍ｵ・ｺ繝ｻ・ｿ驛｢譏ｴ繝ｻ郢晢ｽｻ驛｢・ｧ繝ｻ・ｿ驍ｵ・ｺ繝ｻ・ｮ髯ｷ・ｿ郢ｧ蟲ｨ繝ｻ驛｢・ｧ髮区ｧｭ繝ｻ驛｢・ｧ闔ｨ竏晢ｽｱ・ｬ驍ｵ・ｺ陷ｷ・ｶ隨ｳ繝ｻ・ｹ・ｧ遶丞仰遶丞｣ｹ・・Δ譎｢・ｽ・ｬ驛｢・ｧ繝ｻ・ｯ驛｢・ｧ繝ｻ・ｷ驛｢譎｢・ｽ・ｧ驛｢譎｢・ｽ・ｳ驛｢・ｧ陞ｳ螟ｲ・ｽ・､郢晢ｽｻ繝ｻ・｣繝ｻ・ｽ驍ｵ・ｺ陷会ｽｱ遯ｶ・ｻ鬮ｴ隨ｬ魍堤ｬ倥・・ｸ・ｲ郢晢ｽｻ
function cloneLoadedData(payload: LoadedProjectData): LoadedProjectData {
  return {
    vertexes: new Map(payload.vertexes),
    areas: new Map(payload.areas),
    tileAssign: new Map(payload.tileAssign),
    addonList: [...payload.addonList],
    origin: new Vector2d(payload.origin.x, payload.origin.z),
    vehicles: [...payload.vehicles],
    swtracks: [...payload.swtracks],
    nttracks: new Map(payload.nttracks),
  };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  return produce(state, (draft) => {
    // 驛｢譎丞ｹｲ・取ｺｽ・ｹ・ｧ繝ｻ・ｸ驛｢・ｧ繝ｻ・ｧ驛｢・ｧ繝ｻ・ｯ驛｢譎槭Γ繝ｻ・ｪ繝ｻ・ｭ驍ｵ・ｺ繝ｻ・ｿ鬮ｴ雜｣・ｽ・ｼ驍ｵ・ｺ繝ｻ・ｿ髫ｴ蠑ｱ・・ｹ晢ｽｻ髯具ｽｻ隴弱・・・刹・ｹ隰費ｽｶ郢晢ｽｻ驛｢譎｢・ｽ・ｪ驛｢・ｧ繝ｻ・ｻ驛｢譏ｴ繝ｻ郢晢ｽｨ髯ｷ繝ｻ・ｽ・ｦ鬨ｾ繝ｻ繝ｻ・つ郢晢ｽｻ
    if (action.type === "hydrate-project") {
      const next = cloneLoadedData(action.payload);
      draft.vertexes = next.vertexes;
      draft.areas = next.areas;
      draft.tileAssign = next.tileAssign;
      draft.addonList = next.addonList;
      draft.origin = next.origin;
      draft.vehicles = next.vehicles;
      draft.swtracks = next.swtracks;
      draft.nttracks = next.nttracks;
      draft.nearestVertex = undefined;
      draft.selectedArea = undefined;
      draft.selectedTrack = undefined;
      draft.trackChainSelectEnabled = false;
      draft.previewAreaId = undefined;
      draft.previewTrackId = undefined;
      draft.editMode = EditMode.EditArea;
      return;
    }

    if (action.type === "set-project-origin") {
      draft.origin = new Vector2d(action.payload.x, action.payload.z);
      return;
    }

    // UI 驍ｵ・ｺ闕ｵ譎｢・ｽ閾･・ｸ・ｺ繝ｻ・ｮ鬨ｾ・ｶ繝ｻ・ｴ髫ｰ證ｦ・ｽ・･鬨ｾ・ｧ郢晢ｽｻ遶企ｷｹ・ｩ蛹・ｽｽ・ｸ髫ｰ螢ｽ・ｧ・ｭ郢晢ｽｻ驛｢譎｢・ｽ・｢驛｢譎｢・ｽ・ｼ驛｢譎牙愛陝ｲ・ｩ髫ｴ繝ｻ・ｽ・ｰ驍ｵ・ｲ郢晢ｽｻ
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
      draft.previewTrackId = undefined;
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

    if (action.type === "set-preview-track") {
      const trackId = action.payload.trackId;
      draft.previewTrackId =
        trackId === undefined || draft.nttracks.has(trackId)
          ? trackId
          : draft.previewTrackId;
      return;
    }

    if (action.type === "send-mode-event") {
      applyModeEvent(draft, action.payload.event);
      draft.previewAreaId = undefined;
      draft.previewTrackId = undefined;
      if (action.payload.event === "OPEN_TRACK_EDITOR") {
        draft.selectedTrack = undefined;
      }
      if (
        action.payload.event === "OPEN_TRACK_EDITOR" ||
        draft.editMode !== EditMode.EditTrack
      ) {
        draft.trackChainSelectEnabled = false;
      }
      return;
    }

    // 驛｢・ｧ繝ｻ・ｨ驛｢譎｢・ｽ・ｪ驛｢・ｧ繝ｻ・｢髣厄ｽｴ隲帛現繝ｻ驍ｵ・ｺ驗呻ｽｫ繝ｻ閧ｲ・ｸ・ｺ繝ｻ・ｳ鬯ｯ繝ｻ・臥ｸｺ蟶ｷ・ｹ・ｧ繝ｻ・ｸ驛｢・ｧ繝ｻ・ｪ驛｢譎｢・ｽ・｡驛｢譎冗樟・取・縺薙・・ｨ鬯ｮ・ｮ郢晢ｽｻ・つ郢晢ｽｻ
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

    // 驛｢・ｧ繝ｻ・ｨ驛｢譎｢・ｽ・ｪ驛｢・ｧ繝ｻ・｢髯ｷ蜿ｰ・ｼ竏晄ｱるし・ｺ繝ｻ・ｨ驛｢譎｢・ｽ・｡驛｢・ｧ繝ｻ・ｿ髫ｲ・ｰ郢晢ｽｻ繝ｻ・ｰ繝ｻ・ｱ髫ｴ蜴・ｽｽ・ｴ髫ｴ繝ｻ・ｽ・ｰ驍ｵ・ｲ郢晢ｽｻ
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

    // 驛｢譎冗樟・主ｸｷ・ｹ譏ｴ繝ｻ邵ｺ驢搾ｽｸ・ｺ繝ｻ・ｮ髣厄ｽｴ隲帛現繝ｻ驛｢譎｢・ｽ・ｻ髯ｷ蜿ｰ・ｼ竏晄ｱるΔ譎｢・ｽ・ｻ髫ｶ雋樒私郢晢ｽｻ髫ｴ蜴・ｽｽ・ｴ髫ｴ繝ｻ・ｽ・ｰ驍ｵ・ｲ郢晢ｽｻ
    if (action.type === "create-track") {
      const trackId = action.payload.trackId.trim();
      if (!trackId) {
        return;
      }
      if (!draft.nttracks.has(trackId)) {
        draft.nttracks.set(trackId, createEmptyTrack());
      }
      draft.selectedTrack = trackId;
      draft.previewTrackId = undefined;
      return;
    }

    if (action.type === "delete-selected-track") {
      if (!draft.selectedTrack) {
        return;
      }
      draft.nttracks.delete(draft.selectedTrack);
      draft.selectedTrack = undefined;
      draft.trackChainSelectEnabled = false;
      draft.previewTrackId = undefined;
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

    // 驛｢・ｧ繝ｻ・ｹ驛｢譏ｴ繝ｻ郢晢ｽｻ驛｢・ｧ繝ｻ・ｸ髣包ｽｳ驗呻ｽｫ郢晢ｽｻ驛｢譎・ｺ｢邵ｺ繝ｻ・ｹ譎｢・ｽ・ｳ驛｢・ｧ繝ｻ・ｿ驛｢・ｧ繝ｻ・､驛｢譎冗函・趣ｽｦ驛｢譎冗樟遶企豪・ｹ・ｧ陋ｹ・ｻ繝ｻ迢暦ｽｹ・ｧ繝ｻ・､驛｢譎｢・ｽ・ｳ驛｢・ｧ繝ｻ・ｿ驛｢譎｢・ｽ・ｩ驛｢・ｧ繝ｻ・ｯ驛｢譏ｴ繝ｻ邵ｺ繝ｻ・ｹ譏懶ｽｹ貊ゑｽｽ・ｷ繝ｻ・ｨ鬯ｮ・ｮ郢晢ｽｻ・つ郢晢ｽｻ
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
