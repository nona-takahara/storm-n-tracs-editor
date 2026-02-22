import * as EditMode from "../../EditMode";

interface StagePrimaryDownContext {
  mode: EditMode.EditMode;
  nearestVertex: string | undefined;
  selectedAreaFirstVertex: string | undefined;
  shiftKey: boolean;
}

export type StagePrimaryDownAction =
  | { type: "append-new-vertex" }
  | { type: "append-existing-vertex"; vertexId: string }
  | { type: "finish-add-area" }
  | { type: "select-area" }
  | { type: "none" };

export type StageSecondaryDownAction = "finish-add-area" | "none";

interface StageModeHandler {
  onPrimaryDown: (context: StagePrimaryDownContext) => StagePrimaryDownAction;
  onSecondaryDown: () => StageSecondaryDownAction;
}

// 通常のエリア編集モード: クリックは選択のみ行う。
const editAreaHandler: StageModeHandler = {
  onPrimaryDown: () => ({ type: "select-area" }),
  onSecondaryDown: () => "none",
};

// トラック編集モード: ステージクリックは選択のみ行う。
const editTrackHandler: StageModeHandler = {
  onPrimaryDown: () => ({ type: "select-area" }),
  onSecondaryDown: () => "none",
};

// エリア追加モード: 頂点追加/閉路確定/既存頂点利用を条件で切り替える。
const addAreaHandler: StageModeHandler = {
  onPrimaryDown: (context) => {
    if (!context.nearestVertex || context.shiftKey) {
      return { type: "append-new-vertex" };
    }

    if (context.nearestVertex === context.selectedAreaFirstVertex) {
      return { type: "finish-add-area" };
    }

    return { type: "append-existing-vertex", vertexId: context.nearestVertex };
  },
  onSecondaryDown: () => "finish-add-area",
};

// 現在モードごとのステージ操作ハンドラ定義。
const handlers: Record<EditMode.EditMode, StageModeHandler> = {
  [EditMode.EditArea]: editAreaHandler,
  [EditMode.EditTrack]: editTrackHandler,
  [EditMode.AddArea]: addAreaHandler,
};

// primary down の解決を現在モードへ委譲する。
export function resolveStagePrimaryDown(
  context: StagePrimaryDownContext
): StagePrimaryDownAction {
  return handlers[context.mode].onPrimaryDown(context);
}

// secondary down の解決を現在モードへ委譲する。
export function resolveStageSecondaryDown(
  mode: EditMode.EditMode
): StageSecondaryDownAction {
  return handlers[mode].onSecondaryDown();
}
